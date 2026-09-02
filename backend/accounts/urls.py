from django.urls import path
from .views_users import UserCreateView, UserListView, UserDetailView

urlpatterns = [
    path("create/", UserCreateView.as_view()),
    path("", UserListView.as_view()),
    path("<str:pk>/", UserDetailView.as_view()),
]