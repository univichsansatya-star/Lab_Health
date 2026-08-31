from rest_framework.routers import DefaultRouter
from .views import BorrowingRequestViewSet

router = DefaultRouter()
router.register("", BorrowingRequestViewSet, basename="borrowings")
urlpatterns = router.urls