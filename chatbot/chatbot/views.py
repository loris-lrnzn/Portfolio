import datetime
import json
import logging
import re
import time
import uuid
import zoneinfo
from decimal import Decimal
from functools import wraps

from django.conf import settings
from django.contrib.admin.views.decorators import staff_member_required
from django.core.cache import cache
from django.db.models import Count, Sum
from django.db.models.functions import TruncDate
from django.http import Http404, JsonResponse
from django.shortcuts import render
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from openai import OpenAI

from .models import APIUsageLog, Message, ModerationLog, UserMemory

logger = logging.getLogger(__name__)

PREFIX = getattr(settings, "CHATBOT_URL_PREFIX", "") or ""

MEMORY_COOKIE_NAME = "chatbot_uid"

FORGET_PATTERNS = [
    "oublie tout sur moi",
    "efface ma mémoire",
    "supprime mes données",
    "oublie-moi",
    "forget me",
]

MEMORY_EXTRACTION_PROMPT = (
    "Tu es un système d'extraction de mémoire. Analyse la conversation ci-dessous "
    "et extrais les informations notables sur l'utilisateur.\n\n"
    "Retourne un JSON valide (et RIEN d'autre) avec cette structure :\n"
    '{"memories": [{"key": "identifiant_court_en_snake_case", '
    '"value": "description concise", "category": "preference|fact|context", '
    '"confidence": 0.0-1.0}]}\n\n'
    "Catégories :\n"
    '- "preference" : préférences de style, sujets d\'intérêt, habitudes\n'
    '- "fact" : informations factuelles (prénom, rôle, lieu, formation)\n'
    '- "context" : projets en cours, préoccupations actuelles\n\n'
    "Règles :\n"
    "- Extrais UNIQUEMENT les informations sur l'UTILISATEUR, jamais sur l'assistant.\n"
    "- Si une information met à jour une précédente, utilise la même clé.\n"
    "- Ne déduis pas d'informations non explicites.\n"
    '- Si rien de notable, retourne {"memories": []}.\n'
    '- Le champ "key" doit être stable (ex: "prenom", "formation", "langue_preferee").\n'
    "- confidence : 1.0 = explicitement déclaré, 0.7 = fortement impliqué, 0.5 = probable."
)


def _get_default_bot():
    profiles = getattr(settings, "CHATBOT_PROFILES", None) or {}
    default = getattr(settings, "CHATBOT_DEFAULT", None)
    if default and default in profiles:
        return default
    if profiles:
        return next(iter(profiles.keys()))
    return "default"


def _get_profile(slug):
    profiles = getattr(settings, "CHATBOT_PROFILES", None) or {}
    if slug in profiles:
        return {**profiles[slug], "slug": slug}
    if slug == "default" and not profiles:
        return {
            "name": "ChatBot",
            "system_message": getattr(settings, "OPENAI_SYSTEM_MESSAGE", "Assistant poli. Réponses courtes."),
            "slug": "default",
        }
    raise Http404("Profil chatbot inconnu.")


def _get_client_ip(request):
    xff = request.META.get("HTTP_X_FORWARDED_FOR")
    if xff:
        return xff.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "")


def _rate_limit_ip(scope):
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped(request, *args, **kwargs):
            if scope == "chat":
                max_r = getattr(settings, "CHATBOT_RATELIMIT_CHAT_REQUESTS", 10)
            else:
                max_r = getattr(settings, "CHATBOT_RATELIMIT_STATUS_REQUESTS", 60)
            window = getattr(settings, "CHATBOT_RATELIMIT_WINDOW", 60)
            ip = _get_client_ip(request)
            if not ip:
                return view_func(request, *args, **kwargs)
            key = f"chatbot_rl:{scope}:{ip}"
            data = cache.get(key) or {"c": 0, "s": time.time()}
            now = time.time()
            if now - data["s"] >= window:
                data = {"c": 0, "s": now}
            data["c"] += 1
            cache.set(key, data, timeout=window * 2)
            if data["c"] > max_r:
                return JsonResponse(
                    {"error": "Trop de requêtes depuis cette adresse. Réessayez dans quelques instants."},
                    status=429,
                )
            return view_func(request, *args, **kwargs)
        return _wrapped
    return decorator

client = OpenAI(api_key=settings.GEMINI_API_KEY, base_url=settings.GEMINI_BASE_URL)
MODEL = settings.GEMINI_MODEL

# Modération : Gemini n'a pas d'endpoint dédié, on garde celui d'OpenAI (gratuit) si une clé est fournie.
moderation_client = OpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None

# Tarifs en $/token — estimation à vérifier sur ai.google.dev/pricing
_PRICING = {
    "gemini-3.5-flash-lite": {
        "input": Decimal("0.0000001"),
        "output": Decimal("0.0000004"),
    },
    "gemini-2.5-flash": {
        "input": Decimal("0.0000003"),
        "output": Decimal("0.0000025"),
    },
}


def _log_api_usage(session_id, bot_slug, user, endpoint, model, usage):
    pricing = _PRICING.get(model, _PRICING["gemini-3.5-flash-lite"])
    prompt_tokens = usage.prompt_tokens or 0
    completion_tokens = usage.completion_tokens or 0
    cost = (Decimal(prompt_tokens) * pricing["input"]
            + Decimal(completion_tokens) * pricing["output"])
    APIUsageLog.objects.create(
        session_id=session_id,
        bot_slug=bot_slug,
        user=user if user and hasattr(user, "pk") and user.is_authenticated else None,
        endpoint=endpoint,
        model_name=model,
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens,
        total_tokens=usage.total_tokens or 0,
        estimated_cost=cost,
    )


def _session_key(slug, key):
    return f"chatbot_{slug}_{key}"


# ── Mémoire utilisateur ──────────────────────────────────────────────


def _get_user_uuid(request):
    raw = request.COOKIES.get(MEMORY_COOKIE_NAME)
    if raw:
        try:
            return uuid.UUID(raw), False
        except ValueError:
            pass
    return uuid.uuid4(), True


def _set_user_uuid_cookie(response, user_uuid):
    max_age = getattr(settings, "CHATBOT_MEMORY_COOKIE_MAX_AGE", 365 * 24 * 3600)
    secure = getattr(settings, "CHATBOT_MEMORY_COOKIE_SECURE", not settings.DEBUG)
    response.set_cookie(
        MEMORY_COOKIE_NAME,
        str(user_uuid),
        max_age=max_age,
        httponly=True,
        samesite="None" if secure else "Lax",
        secure=secure,
    )


def _is_memory_enabled(bot_slug):
    if not getattr(settings, "CHATBOT_MEMORY_ENABLED", True):
        return False
    profiles = getattr(settings, "CHATBOT_PROFILES", None) or {}
    profile = profiles.get(bot_slug, {})
    return profile.get("memory_enabled", True)


def _get_memory_owner(request):
    if request.user.is_authenticated:
        return (
            {"user": request.user},
            {"user": request.user},
            None,
            False,
        )
    user_uuid, is_new = _get_user_uuid(request)
    return (
        {"user_uuid": user_uuid, "user__isnull": True},
        {"user_uuid": user_uuid},
        user_uuid,
        is_new,
    )


def _build_memory_context(memory_filter, bot_slug):
    if not _is_memory_enabled(bot_slug):
        return ""

    max_injected = getattr(settings, "CHATBOT_MEMORY_MAX_INJECTED", 20)
    memories = UserMemory.objects.filter(
        bot_slug=bot_slug, **memory_filter,
    )[:max_injected]

    if not memories:
        return ""

    by_category = {}
    for m in memories:
        by_category.setdefault(m.get_category_display(), []).append(m)

    parts = []
    for cat_label, items in by_category.items():
        parts.append(f"  {cat_label} :")
        for item in items:
            parts.append(f"    - {item.key} : {item.value}")

    return (
        "\n\n[Mémoire utilisateur]\n"
        "Informations connues sur cet utilisateur "
        "(utilise-les naturellement sans les répéter mécaniquement) :\n"
        + "\n".join(parts)
    )


def _build_extraction_input(existing_memories, recent_messages):
    parts = []
    if existing_memories:
        parts.append("Mémoires existantes :")
        for m in existing_memories:
            parts.append(f"  - {m.key} ({m.category}) : {m.value}")
        parts.append("")
    parts.append("Conversation récente :")
    for msg in recent_messages:
        role = "Utilisateur" if msg["role"] == "user" else "Assistant"
        parts.append(f"  {role} : {msg['content']}")
    return "\n".join(parts)


def _store_extracted_memories(memory_filter, memory_defaults, bot_slug, memories_data):
    for item in memories_data.get("memories", []):
        key = item.get("key", "").strip()[:128]
        value = item.get("value", "").strip()
        category = item.get("category", "fact")
        confidence = item.get("confidence", 0.8)
        if not key or not value:
            continue
        if category not in ("preference", "fact", "context"):
            category = "fact"
        confidence = max(0.0, min(1.0, float(confidence)))
        UserMemory.objects.update_or_create(
            bot_slug=bot_slug, key=key, **memory_filter,
            defaults={
                "value": value,
                "category": category,
                "confidence": confidence,
                "source": "auto",
                **memory_defaults,
            },
        )


def _maybe_extract_memories(request, memory_filter, memory_defaults, bot_slug, sk, recent_messages, session_id):
    if not _is_memory_enabled(bot_slug):
        return

    extract_every = getattr(settings, "CHATBOT_MEMORY_EXTRACT_EVERY", 3)
    counter_key = sk("msg_count_since_extract")
    count = request.session.get(counter_key, 0) + 1

    if count < extract_every:
        request.session[counter_key] = count
        return

    request.session[counter_key] = 0

    max_memories = getattr(settings, "CHATBOT_MEMORY_MAX_PER_USER", 50)
    existing = list(
        UserMemory.objects.filter(bot_slug=bot_slug, **memory_filter)[:max_memories]
    )

    extraction_input = _build_extraction_input(existing, recent_messages[-6:])

    try:
        resp = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": MEMORY_EXTRACTION_PROMPT},
                {"role": "user", "content": extraction_input},
            ],
            response_format={"type": "json_object"},
        )
        data = json.loads(resp.choices[0].message.content)
        _store_extracted_memories(memory_filter, memory_defaults, bot_slug, data)

        tokens = resp.usage.total_tokens
        request.session[sk("tokens_used")] = request.session.get(sk("tokens_used"), 0) + tokens
        _log_api_usage(session_id, bot_slug, request.user, "memory", MODEL, resp.usage)
    except Exception as e:
        logger.warning("memory extraction failed: %s", e)


def _check_forget_request(user_message, memory_filter, bot_slug):
    normalized = user_message.lower().strip()
    for pattern in FORGET_PATTERNS:
        if pattern in normalized:
            count, _ = UserMemory.objects.filter(
                bot_slug=bot_slug, **memory_filter,
            ).delete()
            return count
    return None


def _moderate_message(message, session_id, bot_slug, user_ip):
    if not getattr(settings, "CHATBOT_MODERATION_ENABLED", True) or moderation_client is None:
        return None

    try:
        result = moderation_client.moderations.create(
            model="omni-moderation-latest",
            input=message,
        )
        output = result.results[0]
        if not output.flagged:
            return None

        categories = {k: v for k, v in vars(output.categories).items() if not k.startswith("_")}
        scores = {k: v for k, v in vars(output.category_scores).items() if not k.startswith("_")}

        ModerationLog.objects.create(
            session_id=session_id,
            bot_slug=bot_slug,
            user_ip=user_ip,
            content=message,
            categories=categories,
            scores=scores,
        )
        logger.info("moderation: message flaggé session=%s slug=%s", session_id, bot_slug)
        return categories
    except Exception as e:
        logger.warning("moderation API error: %s", e)
        return None


def _parse_action(text):
    """Parse et retire la balise [action:type:id] de la réponse."""
    action_match = re.search(r'\[action:(anchor|project):(\w+)\]', text)
    if action_match:
        action_type = action_match.group(1)
        action_id = action_match.group(2)
        text = text[:action_match.start()].rstrip() + text[action_match.end():]
        text = text.strip()
        # Pour les projets, convertir l'ID en int
        if action_type == "project":
            try:
                action_id = int(action_id)
            except ValueError:
                return text, None
        return text, {"type": action_type, "id": action_id}
    return text, None


def _parse_structured_reply(text):
    suggestions = []
    suggestion_match = re.search(r'\[suggestions?:\s*(.+?)\]\s*$', text, re.IGNORECASE)
    if suggestion_match:
        suggestions = [s.strip() for s in suggestion_match.group(1).split('|') if s.strip()]
        text = text[:suggestion_match.start()].rstrip()

    code_blocks = {}
    code_placeholder_prefix = '\x00CODE_BLOCK_'

    def _replace_code_block(match):
        idx = len(code_blocks)
        key = f"{code_placeholder_prefix}{idx}\x00"
        language = (match.group(1) or '').strip()
        code_blocks[idx] = {"type": "code", "language": language, "content": match.group(2)}
        return key

    text = re.sub(r'```(\w*)\n(.*?)```', _replace_code_block, text, flags=re.DOTALL)

    blocks = []
    current_text_lines = []
    current_list_items = []
    current_list_ordered = False
    current_quote_lines = []

    def _flush_text():
        nonlocal current_text_lines
        if current_text_lines:
            content = '\n'.join(current_text_lines).strip()
            if content:
                blocks.append({"type": "text", "content": content})
            current_text_lines = []

    def _flush_list():
        nonlocal current_list_items, current_list_ordered
        if current_list_items:
            blocks.append({"type": "list", "ordered": current_list_ordered, "items": current_list_items})
            current_list_items = []
            current_list_ordered = False

    def _flush_quote():
        nonlocal current_quote_lines
        if current_quote_lines:
            blocks.append({"type": "quote", "content": '\n'.join(current_quote_lines)})
            current_quote_lines = []

    for line in text.split('\n'):
        stripped = line.strip()
        if stripped.startswith(code_placeholder_prefix) and stripped.endswith('\x00'):
            _flush_text()
            _flush_list()
            _flush_quote()
            idx = int(stripped[len(code_placeholder_prefix):-1])
            blocks.append(code_blocks[idx])
            continue

        heading_match = re.match(r'^(#{1,3})\s+(.+)$', stripped)
        if heading_match:
            _flush_text()
            _flush_list()
            _flush_quote()
            level = len(heading_match.group(1))
            blocks.append({"type": "heading", "level": level, "content": heading_match.group(2).strip()})
            continue

        ul_match = re.match(r'^[-*]\s+(.+)$', stripped)
        if ul_match:
            _flush_text()
            _flush_quote()
            if current_list_items and current_list_ordered:
                _flush_list()
            current_list_ordered = False
            current_list_items.append(ul_match.group(1))
            continue

        ol_match = re.match(r'^\d+\.\s+(.+)$', stripped)
        if ol_match:
            _flush_text()
            _flush_quote()
            if current_list_items and not current_list_ordered:
                _flush_list()
            current_list_ordered = True
            current_list_items.append(ol_match.group(1))
            continue

        quote_match = re.match(r'^>\s*(.*)$', stripped)
        if quote_match:
            _flush_text()
            _flush_list()
            current_quote_lines.append(quote_match.group(1))
            continue

        if stripped == '':
            _flush_text()
            _flush_list()
            _flush_quote()
            continue

        _flush_list()
        _flush_quote()
        current_text_lines.append(line)

    _flush_text()
    _flush_list()
    _flush_quote()

    return blocks, suggestions


def _maybe_summarize(request, session_id, slug, sk, user=None):
    max_hist = getattr(settings, "OPENAI_MAX_HISTORY_MESSAGES", 5)
    total = Message.objects.filter(session_id=session_id, bot_slug=slug).count()

    if total <= max_hist:
        return None

    old_count = total - max_hist
    cached_count = request.session.get(sk("summary_count"), 0)

    if cached_count >= old_count:
        return request.session.get(sk("summary"))

    old_messages = list(
        Message.objects.filter(session_id=session_id, bot_slug=slug)
        .order_by("timestamp")[:old_count]
    )

    previous_summary = request.session.get(sk("summary"), "")
    conversation_text = ""
    if previous_summary:
        conversation_text = f"Résumé précédent : {previous_summary}\n\n"
    for m in old_messages:
        role = "Utilisateur" if m.sender == "user" else "Assistant"
        conversation_text += f"{role} : {m.content}\n"

    summary_response = client.chat.completions.create(
        model=MODEL,
        messages=[{
            "role": "system",
            "content": "Résume cette conversation en 2-3 phrases concises en français. "
                       "Conserve les informations clés (noms, demandes, décisions). "
                       "Ne commence pas par 'Voici un résumé'."
        }, {
            "role": "user",
            "content": conversation_text
        }],
    )
    summary = summary_response.choices[0].message.content

    tokens = summary_response.usage.total_tokens
    request.session[sk("tokens_used")] = request.session.get(sk("tokens_used"), 0) + tokens
    _log_api_usage(session_id, slug, user, "summary", MODEL, summary_response.usage)

    request.session[sk("summary")] = summary
    request.session[sk("summary_count")] = old_count
    return summary


def _build_dynamic_context(profile, meta, tokens_used, did_reset, summary):
    rules = profile.get("context_rules")
    if not rules:
        return ""

    parts = []
    tz_name = getattr(settings, "CHATBOT_TIMEZONE", "Europe/Paris")
    now = datetime.datetime.now(zoneinfo.ZoneInfo(tz_name))
    hour = now.hour
    weekday = now.weekday()

    for rule in rules.get("time_rules", []):
        hours_range = rule.get("hours")
        days_list = rule.get("days")
        hour_match = True
        day_match = True
        if hours_range is not None:
            start, end = hours_range
            if start <= end:
                hour_match = start <= hour < end
            else:
                hour_match = hour >= start or hour < end
        if days_list is not None:
            day_match = weekday in days_list
        if hour_match and day_match:
            parts.append(rule["instruction"])

    for rule in rules.get("conversation_rules", []):
        condition = rule["condition"]
        applies = False
        if condition == "first_message":
            applies = meta["messages_used"] == 0
        elif condition == "returning_after_reset":
            applies = did_reset
        elif condition == "has_summary":
            applies = bool(summary)
        elif condition == "tokens_low":
            threshold = rule.get("threshold", 0.75)
            max_tokens = getattr(settings, "OPENAI_MAX_TOKENS_PER_SESSION", 2000)
            applies = max_tokens > 0 and (tokens_used / max_tokens) >= threshold
        elif condition == "messages_high":
            threshold = rule.get("threshold", 0.80)
            applies = meta["messages_limit"] > 0 and (meta["messages_used"] / meta["messages_limit"]) >= threshold
        if applies:
            parts.append(rule["instruction"])

    extra = rules.get("extra_instructions")
    if extra:
        parts.append(extra)

    if not parts:
        return ""
    return "\n\n[Contexte actuel]\n" + "\n".join(f"- {p}" for p in parts)


def _messages_meta(session_id, slug):
    limit = getattr(settings, "OPENAI_MAX_MESSAGES_PER_SESSION", 50)
    used = Message.objects.filter(session_id=session_id, bot_slug=slug).count()
    return {"messages_used": used, "messages_limit": limit}


@ensure_csrf_cookie
def chat(request, slug=None):
    slug = slug or _get_default_bot()
    profile = _get_profile(slug)
    api_prefix = (PREFIX.rstrip("/") + "/" + slug) if PREFIX else "/" + slug
    return render(request, "chatbot/chat.html", {
        "max_message_length": getattr(settings, "OPENAI_MAX_MESSAGE_LENGTH", 500),
        "api_prefix": api_prefix,
        "bot_name": profile["name"],
        "bot_slug": slug,
    })


@ensure_csrf_cookie
def chat_widget(request, slug=None):
    slug = slug or _get_default_bot()
    profile = _get_profile(slug)
    api_prefix = (PREFIX.rstrip("/") + "/" + slug) if PREFIX else "/" + slug
    return render(request, "chatbot/widget.html", {
        "max_message_length": getattr(settings, "OPENAI_MAX_MESSAGE_LENGTH", 500),
        "api_prefix": api_prefix,
        "bot_name": profile["name"],
        "bot_slug": slug,
    })


def api_index(request):
    base = PREFIX.rstrip("/") or "/chatbot"
    return JsonResponse({
        "chat": f"{base}/<slug>/api/chat/",
        "status": f"{base}/<slug>/api/status/",
        "profiles": list((getattr(settings, "CHATBOT_PROFILES", None) or {}).keys()),
    })


@_rate_limit_ip("status")
def chat_status(request, slug):
    try:
        _get_profile(slug)
        if not request.session.session_key:
            request.session.create()
        session_id = request.session.session_key
        meta = _messages_meta(session_id, slug)
        sk = lambda k: _session_key(slug, k)
        timeout = getattr(settings, "CHAT_INACTIVITY_TIMEOUT_SECONDS", 1800)
        last = request.session.get(sk("last_activity"))
        if timeout > 0 and last is not None and (time.time() - last) > timeout:
            Message.objects.filter(session_id=session_id, bot_slug=slug).delete()
            request.session.pop(sk("tokens_used"), None)
            request.session.pop(sk("system_sent"), None)
            request.session.pop(sk("summary"), None)
            request.session.pop(sk("summary_count"), None)
            request.session[sk("last_activity")] = time.time()
            meta = _messages_meta(session_id, slug)
        return JsonResponse(meta)
    except Http404:
        raise
    except Exception as e:
        logger.exception("chat_status: %s", e)
        return JsonResponse({"error": "Une erreur serveur s'est produite."}, status=500)


def memory_api(request, slug):
    _get_profile(slug)
    memory_filter, memory_defaults, user_uuid, is_new_uuid = _get_memory_owner(request)

    if is_new_uuid:
        resp = JsonResponse({"memories": [], "count": 0})
        _set_user_uuid_cookie(resp, user_uuid)
        return resp

    if request.method == "GET":
        memories = UserMemory.objects.filter(bot_slug=slug, **memory_filter)
        data = [
            {
                "key": m.key,
                "value": m.value,
                "category": m.category,
                "confidence": m.confidence,
                "updated_at": m.updated_at.isoformat(),
            }
            for m in memories
        ]
        resp = JsonResponse({"memories": data, "count": len(data)})
        if user_uuid:
            _set_user_uuid_cookie(resp, user_uuid)
        return resp

    if request.method == "DELETE":
        count, _ = UserMemory.objects.filter(bot_slug=slug, **memory_filter).delete()
        resp = JsonResponse({"deleted": count})
        if user_uuid:
            _set_user_uuid_cookie(resp, user_uuid)
        return resp

    return JsonResponse({"error": "Méthode non autorisée"}, status=405)


@csrf_exempt
@_rate_limit_ip("chat")
def chat_api(request, slug):
    if request.method != "POST":
        return JsonResponse({"error": "Méthode non autorisée"}, status=405)
    profile = _get_profile(slug)
    system_message = profile.get("system_message") or getattr(settings, "OPENAI_SYSTEM_MESSAGE", "Assistant poli. Réponses courtes.")
    if not request.session.session_key:
        request.session.create()
    session_id = request.session.session_key
    memory_filter, memory_defaults, user_uuid, is_new_uuid = _get_memory_owner(request)
    sk = lambda k: _session_key(slug, k)
    meta = _messages_meta(session_id, slug)
    did_reset = False

    timeout = getattr(settings, "CHAT_INACTIVITY_TIMEOUT_SECONDS", 1800)
    last = request.session.get(sk("last_activity"))
    if timeout > 0 and last is not None and (time.time() - last) > timeout:
        Message.objects.filter(session_id=session_id, bot_slug=slug).delete()
        request.session.pop(sk("tokens_used"), None)
        request.session.pop(sk("system_sent"), None)
        request.session.pop(sk("summary"), None)
        request.session.pop(sk("summary_count"), None)
        did_reset = True
        meta = _messages_meta(session_id, slug)

    tokens_used = request.session.get(sk("tokens_used"), 0)
    if tokens_used >= getattr(settings, "OPENAI_MAX_TOKENS_PER_SESSION", 2000):
        return JsonResponse({"error": "Limite de tokens atteinte. Chat bloqué.", "limit_reached": True, **meta}, status=429)
    if meta["messages_used"] >= meta["messages_limit"]:
        return JsonResponse({"error": "Limite de messages atteinte. Chat bloqué.", "limit_reached": True, **meta}, status=429)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError as e:
        logger.warning("chat_api: body JSON invalide ip=%s: %s", _get_client_ip(request), e)
        return JsonResponse({"error": "Requête invalide."}, status=400)

    user_message = data.get("message", "")
    max_len = getattr(settings, "OPENAI_MAX_MESSAGE_LENGTH", 500)
    if len(user_message) > max_len:
        return JsonResponse({"error": f"Message trop long. Maximum {max_len} caractères.", **meta}, status=400)

    flagged_categories = _moderate_message(user_message, session_id, slug, _get_client_ip(request))
    if flagged_categories is not None:
        moderation_msg = getattr(
            settings,
            "CHATBOT_MODERATION_MESSAGE",
            "Votre message a été bloqué car il enfreint nos règles d'utilisation.",
        )
        return JsonResponse({"error": moderation_msg, **meta}, status=400)

    forget_count = _check_forget_request(user_message, memory_filter, slug)
    if forget_count is not None:
        reply = f"J'ai effacé toute ma mémoire te concernant ({forget_count} élément(s) supprimé(s))."
        Message.objects.create(content=user_message, sender="user", session_id=session_id, bot_slug=slug)
        Message.objects.create(content=reply, sender="bot", session_id=session_id, bot_slug=slug)
        request.session[sk("last_activity")] = time.time()
        meta = _messages_meta(session_id, slug)
        blocks, suggestions = _parse_structured_reply(reply)
        out = {"reply": reply, "structured": blocks, **meta}
        if suggestions:
            out["suggestions"] = suggestions
        resp = JsonResponse(out)
        if user_uuid:
            _set_user_uuid_cookie(resp, user_uuid)
        return resp

    try:
        max_hist = getattr(settings, "OPENAI_MAX_HISTORY_MESSAGES", 5)
        history = list(
            Message.objects.filter(session_id=session_id, bot_slug=slug).order_by("-timestamp")[:max_hist]
        )
        history.reverse()

        summary = _maybe_summarize(request, session_id, slug, sk, user=request.user)

        dynamic_ctx = _build_dynamic_context(profile, meta, tokens_used, did_reset, summary)
        memory_ctx = _build_memory_context(memory_filter, slug)
        full_system_message = system_message + dynamic_ctx + memory_ctx

        messages_for_api = []
        messages_for_api.append({"role": "system", "content": full_system_message})

        if summary:
            messages_for_api.append({
                "role": "system",
                "content": f"Résumé de la conversation précédente : {summary}"
            })

        for m in history:
            role = "assistant" if m.sender == "bot" else "user"
            messages_for_api.append({"role": role, "content": m.content})
        messages_for_api.append({"role": "user", "content": user_message})

        Message.objects.create(content=user_message, sender="user", session_id=session_id, bot_slug=slug)
        response = client.chat.completions.create(model=MODEL, messages=messages_for_api)
        reply = response.choices[0].message.content
        tokens_this_response = response.usage.total_tokens
        request.session[sk("tokens_used")] = request.session.get(sk("tokens_used"), 0) + tokens_this_response
        _log_api_usage(session_id, slug, request.user, "chat", MODEL, response.usage)

        Message.objects.create(content=reply, sender="bot", session_id=session_id, bot_slug=slug)

        _maybe_extract_memories(request, memory_filter, memory_defaults, slug, sk, messages_for_api[1:], session_id)

        request.session[sk("last_activity")] = time.time()
        meta = _messages_meta(session_id, slug)
        reply, action = _parse_action(reply)
        blocks, suggestions = _parse_structured_reply(reply)
        out = {"reply": reply, "structured": blocks, **meta}
        if action:
            out["action"] = action
        if suggestions:
            out["suggestions"] = suggestions
        if did_reset:
            out["session_reset"] = True
        resp = JsonResponse(out)
        if user_uuid:
            _set_user_uuid_cookie(resp, user_uuid)
        return resp
    except Http404:
        raise
    except Exception as e:
        logger.exception("chat_api: %s", e)
        return JsonResponse({"error": "Une erreur serveur s'est produite."}, status=500)


# ── Dashboard analytique (staff only) ─────────────────────────────────


@staff_member_required
def dashboard(request):
    now = timezone.now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_ago = today_start - datetime.timedelta(days=7)
    month_ago = today_start - datetime.timedelta(days=30)

    msg_qs = Message.objects.all()
    msg_today = msg_qs.filter(timestamp__gte=today_start).count()
    msg_week = msg_qs.filter(timestamp__gte=week_ago).count()
    msg_month = msg_qs.filter(timestamp__gte=month_ago).count()
    msg_total = msg_qs.count()

    msgs_by_bot = list(
        msg_qs.values("bot_slug").annotate(count=Count("id")).order_by("-count")
    )

    msgs_over_time = list(
        msg_qs.filter(timestamp__gte=month_ago)
        .annotate(date=TruncDate("timestamp"))
        .values("date")
        .annotate(count=Count("id"))
        .order_by("date")
    )

    session_counts = (
        msg_qs.filter(timestamp__gte=month_ago)
        .values("session_id")
        .annotate(count=Count("id"))
    )
    session_list = [s["count"] for s in session_counts]
    avg_per_session = round(sum(session_list) / len(session_list), 1) if session_list else 0

    mod_qs = ModerationLog.objects.all()
    mod_today = mod_qs.filter(created_at__gte=today_start).count()
    mod_week = mod_qs.filter(created_at__gte=week_ago).count()
    mod_month = mod_qs.filter(created_at__gte=month_ago).count()

    category_counts = {}
    for log in mod_qs.filter(created_at__gte=month_ago):
        if isinstance(log.categories, dict):
            for cat, flagged in log.categories.items():
                if flagged:
                    category_counts[cat] = category_counts.get(cat, 0) + 1

    recent_flagged = list(
        mod_qs.values("created_at", "bot_slug", "content", "categories")[:10]
    )

    cost_qs = APIUsageLog.objects.all()
    cost_today = cost_qs.filter(created_at__gte=today_start).aggregate(
        tokens=Sum("total_tokens"), cost=Sum("estimated_cost")
    )
    cost_week = cost_qs.filter(created_at__gte=week_ago).aggregate(
        tokens=Sum("total_tokens"), cost=Sum("estimated_cost")
    )
    cost_month = cost_qs.filter(created_at__gte=month_ago).aggregate(
        tokens=Sum("total_tokens"), cost=Sum("estimated_cost")
    )

    cost_by_bot = list(
        cost_qs.filter(created_at__gte=month_ago)
        .values("bot_slug")
        .annotate(cost=Sum("estimated_cost"), tokens=Sum("total_tokens"))
        .order_by("-cost")
    )

    cost_over_time = list(
        cost_qs.filter(created_at__gte=month_ago)
        .annotate(date=TruncDate("created_at"))
        .values("date")
        .annotate(cost=Sum("estimated_cost"), tokens=Sum("total_tokens"))
        .order_by("date")
    )

    cost_by_endpoint = list(
        cost_qs.filter(created_at__gte=month_ago)
        .values("endpoint")
        .annotate(cost=Sum("estimated_cost"), tokens=Sum("total_tokens"))
        .order_by("-cost")
    )

    def _default(obj):
        if isinstance(obj, (datetime.date, datetime.datetime)):
            return obj.isoformat()
        if isinstance(obj, Decimal):
            return float(obj)
        return str(obj)

    context = {
        "msg_today": msg_today,
        "msg_week": msg_week,
        "msg_month": msg_month,
        "msg_total": msg_total,
        "avg_per_session": avg_per_session,
        "msgs_by_bot_json": json.dumps(msgs_by_bot, default=_default),
        "msgs_over_time_json": json.dumps(msgs_over_time, default=_default),
        "mod_today": mod_today,
        "mod_week": mod_week,
        "mod_month": mod_month,
        "category_counts_json": json.dumps(category_counts, default=_default),
        "recent_flagged_json": json.dumps(recent_flagged, default=_default),
        "cost_today_tokens": cost_today["tokens"] or 0,
        "cost_today_cost": float(cost_today["cost"] or 0),
        "cost_week_tokens": cost_week["tokens"] or 0,
        "cost_week_cost": float(cost_week["cost"] or 0),
        "cost_month_tokens": cost_month["tokens"] or 0,
        "cost_month_cost": float(cost_month["cost"] or 0),
        "cost_by_bot_json": json.dumps(cost_by_bot, default=_default),
        "cost_over_time_json": json.dumps(cost_over_time, default=_default),
        "cost_by_endpoint_json": json.dumps(cost_by_endpoint, default=_default),
    }
    return render(request, "chatbot/dashboard.html", context)
