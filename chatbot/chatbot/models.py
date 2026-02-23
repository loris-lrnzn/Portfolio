from django.conf import settings
from django.db import models


class Message(models.Model):
    content = models.TextField()
    sender = models.CharField(max_length=10)
    session_id = models.CharField(max_length=40)
    timestamp = models.DateTimeField(auto_now_add=True)
    bot_slug = models.CharField(max_length=64, default="default", db_index=True)

    def __str__(self):
        return self.sender + " : " + self.content[:50]


class UserMemory(models.Model):
    CATEGORY_CHOICES = [
        ("preference", "Préférence"),
        ("fact", "Fait"),
        ("context", "Contexte"),
    ]
    SOURCE_CHOICES = [
        ("auto", "Extraction automatique"),
        ("manual", "Déclaration manuelle"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="memories",
    )
    user_uuid = models.UUIDField(db_index=True, null=True, blank=True)
    bot_slug = models.CharField(max_length=64, db_index=True)
    category = models.CharField(max_length=16, choices=CATEGORY_CHOICES, default="fact")
    key = models.CharField(max_length=128)
    value = models.TextField()
    confidence = models.FloatField(default=0.8)
    source = models.CharField(max_length=8, choices=SOURCE_CHOICES, default="auto")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user_uuid", "bot_slug", "key"],
                condition=models.Q(user__isnull=True),
                name="unique_anonymous_memory",
            ),
            models.UniqueConstraint(
                fields=["user", "bot_slug", "key"],
                condition=models.Q(user__isnull=False),
                name="unique_authenticated_memory",
            ),
        ]
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.user_uuid} / {self.bot_slug} : {self.key} = {self.value[:50]}"


class ModerationLog(models.Model):
    session_id = models.CharField(max_length=40, db_index=True)
    bot_slug = models.CharField(max_length=64, db_index=True)
    user_ip = models.GenericIPAddressField(null=True, blank=True)
    content = models.TextField()
    categories = models.JSONField(default=dict)
    scores = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.created_at:%Y-%m-%d %H:%M}] {self.bot_slug} / {self.content[:50]}"


class APIUsageLog(models.Model):
    ENDPOINT_CHOICES = [
        ("chat", "Chat"),
        ("memory", "Memory"),
        ("summary", "Summary"),
        ("moderation", "Moderation"),
    ]

    session_id = models.CharField(max_length=40, db_index=True)
    bot_slug = models.CharField(max_length=64, db_index=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="api_usage_logs",
    )
    endpoint = models.CharField(max_length=16, choices=ENDPOINT_CHOICES)
    model_name = models.CharField(max_length=64, default="gpt-4o-mini")
    prompt_tokens = models.PositiveIntegerField(default=0)
    completion_tokens = models.PositiveIntegerField(default=0)
    total_tokens = models.PositiveIntegerField(default=0)
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=6, default=0)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.created_at:%Y-%m-%d %H:%M}] {self.endpoint} {self.total_tokens}tok ${self.estimated_cost}"
