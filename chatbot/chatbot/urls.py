from django.urls import path
from .views import chat, chat_api, chat_status, chat_widget, api_index, memory_api, dashboard

urlpatterns = [
    path("", chat),
    path("dashboard/", dashboard, name="chatbot_dashboard"),
    path("widget/", chat_widget),
    path("api/", api_index),
    path("<slug:slug>/", chat),
    path("<slug:slug>/widget/", chat_widget),
    path("<slug:slug>/api/chat/", chat_api),
    path("<slug:slug>/api/status/", chat_status),
    path("<slug:slug>/api/memories/", memory_api),
]
