from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from accounts.views import (
    AuthScopedThrottle,
    CookieRefreshView,
    LoginView,
    LogoutView,
    MeView,
    RegisterView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
)


def health_check(request):
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health_check),
    path("api/auth/register/", RegisterView.as_view()),
    path("api/auth/login/", LoginView.as_view()),
    path("api/auth/refresh/", CookieRefreshView.as_view()),
    path("api/auth/logout/", LogoutView.as_view()),
    path("api/auth/me/", MeView.as_view()),
    path("api/auth/password-reset/", PasswordResetRequestView.as_view()),
    path("api/auth/password-reset/confirm/", PasswordResetConfirmView.as_view()),
    path("api/users/", include("accounts.urls")),
    path("api/equipment/", include("equipment.urls")),
    path("api/borrowings/", include("borrowings.urls")),
    path("api/maintenance/", include("maintenance.urls")),
    path("api/notifications/", include("notifications.urls")),
    path("api/rooms/", include("rooms.urls")),
    path("api/documents/", include("documents.urls")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]