from django.db.models import Q
from rest_framework import generics, filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import User
from .permissions import IsAdminOnly, IsStaffOrAdmin
from .serializers import AdminUserCreateSerializer, UserSerializer


class UserCreateView(generics.CreateAPIView):
    permission_classes = [IsStaffOrAdmin]
    serializer_class = AdminUserCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=201)

    def get_queryset(self):
        return User.objects.all()


class UserListView(generics.ListAPIView):
    permission_classes = [IsStaffOrAdmin]
    serializer_class = UserSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "nim_nip", "email", "department"]

    def get_queryset(self):
        queryset = User.objects.all().order_by("-joined_date", "name")
        role = self.request.query_params.get("role")
        status = self.request.query_params.get("status")
        if role:
            queryset = queryset.filter(role=role)
        if status:
            queryset = queryset.filter(status=status)
        return queryset


class UserDetailView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminOnly]

    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        disallowed = set(request.data) - {
            "name", "department", "study_program", "semester", "phone",
            "avatar", "role", "status",
        }
        if disallowed:
            return Response({"detail": "Unsupported user fields."}, status=400)
        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(self.get_serializer(user).data)