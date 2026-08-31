from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework_simplejwt.views import TokenRefreshView

from accounts.views import LoginView, MeView, RegisterView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/register/", RegisterView.as_view()),
    path("api/auth/login/", LoginView.as_view()),
    path("api/auth/refresh/", TokenRefreshView.as_view()),
    path("api/auth/me/", MeView.as_view()),
    path("api/users/", include("accounts.urls")),
    path("api/equipment/", include("equipment.urls")),
    path("api/borrowings/", include("borrowings.urls")),
    path("api/maintenance/", include("maintenance.urls")),
    path("api/notifications/", include("notifications.urls")),
    path("api/rooms/", include("rooms.urls")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]