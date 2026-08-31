from rest_framework.routers import DefaultRouter
from .views import LabRoomViewSet

router = DefaultRouter()
router.register("", LabRoomViewSet, basename="rooms")
urlpatterns = router.urls