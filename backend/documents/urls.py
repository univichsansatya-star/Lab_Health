from rest_framework.routers import DefaultRouter

from .views import LabDocumentViewSet

router = DefaultRouter()
router.register("", LabDocumentViewSet, basename="documents")
urlpatterns = router.urls