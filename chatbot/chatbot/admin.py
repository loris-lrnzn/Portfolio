from django.contrib import admin
from .models import APIUsageLog, Message, ModerationLog, UserMemory

admin.site.register(Message)


@admin.register(UserMemory)
class UserMemoryAdmin(admin.ModelAdmin):
    list_display = ("user", "user_uuid", "bot_slug", "category", "key", "value", "confidence", "updated_at")
    list_filter = ("bot_slug", "category", "source", "user")
    search_fields = ("key", "value", "user__username")
    readonly_fields = ("created_at", "updated_at")
    raw_id_fields = ("user",)


@admin.register(ModerationLog)
class ModerationLogAdmin(admin.ModelAdmin):
    list_display = ("created_at", "bot_slug", "session_id", "user_ip", "content")
    list_filter = ("bot_slug", "created_at")
    search_fields = ("content", "session_id", "user_ip")
    readonly_fields = ("session_id", "bot_slug", "user_ip", "content", "categories", "scores", "created_at")


@admin.register(APIUsageLog)
class APIUsageLogAdmin(admin.ModelAdmin):
    list_display = ("created_at", "endpoint", "bot_slug", "model_name", "total_tokens", "estimated_cost", "user")
    list_filter = ("endpoint", "bot_slug", "model_name", "created_at")
    date_hierarchy = "created_at"
    readonly_fields = (
        "session_id", "bot_slug", "user", "endpoint", "model_name",
        "prompt_tokens", "completion_tokens", "total_tokens", "estimated_cost", "created_at",
    )
