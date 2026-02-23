from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render

from chatbot.models import UserMemory
from chatbot.views import MEMORY_COOKIE_NAME

from .forms import LoginForm, RegisterForm


def _merge_anonymous_memories(request, user):
    raw = request.COOKIES.get(MEMORY_COOKIE_NAME)
    if not raw:
        return

    import uuid as _uuid
    try:
        anon_uuid = _uuid.UUID(raw)
    except ValueError:
        return

    anon_memories = UserMemory.objects.filter(user_uuid=anon_uuid, user__isnull=True)
    for mem in anon_memories:
        existing = UserMemory.objects.filter(
            user=user, bot_slug=mem.bot_slug, key=mem.key,
        ).first()
        if existing:
            if mem.updated_at > existing.updated_at:
                existing.value = mem.value
                existing.category = mem.category
                existing.confidence = mem.confidence
                existing.source = mem.source
                existing.save()
            mem.delete()
        else:
            mem.user = user
            mem.user_uuid = None
            mem.save()


def _delete_uid_cookie(response):
    response.delete_cookie(MEMORY_COOKIE_NAME)
    return response


def register_view(request):
    if request.user.is_authenticated:
        return redirect("accounts:profile")

    if request.method == "POST":
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            _merge_anonymous_memories(request, user)
            response = redirect("accounts:profile")
            return _delete_uid_cookie(response)
    else:
        form = RegisterForm()
    return render(request, "accounts/register.html", {"form": form})


def login_view(request):
    if request.user.is_authenticated:
        return redirect("accounts:profile")

    if request.method == "POST":
        form = LoginForm(request, data=request.POST)
        if form.is_valid():
            login(request, form.get_user())
            _merge_anonymous_memories(request, form.get_user())
            response = redirect("accounts:profile")
            return _delete_uid_cookie(response)
    else:
        form = LoginForm()
    return render(request, "accounts/login.html", {"form": form})


def logout_view(request):
    logout(request)
    return redirect("accounts:login")


@login_required
def profile_view(request):
    memories = UserMemory.objects.filter(user=request.user)
    grouped = {}
    for mem in memories:
        grouped.setdefault(mem.bot_slug, []).append(mem)
    return render(request, "accounts/profile.html", {
        "memories_by_bot": grouped,
    })


@login_required
def delete_memories_view(request):
    if request.method == "POST":
        bot_slug = request.POST.get("bot_slug")
        qs = UserMemory.objects.filter(user=request.user)
        if bot_slug:
            qs = qs.filter(bot_slug=bot_slug)
        qs.delete()
    return redirect("accounts:profile")
