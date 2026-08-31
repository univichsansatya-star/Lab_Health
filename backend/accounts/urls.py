from django.urls import path
from .views_users import UserListView, UserDetailView

urlpatterns = [
    path("", UserListView.as_view()),
    path("<str:pk>/", UserDetailView.as_view()),
]