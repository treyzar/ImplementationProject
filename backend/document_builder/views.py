from rest_framework import viewsets, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import QuerySet
from django.contrib.auth.models import User

from .models import DocumentTemplate, SourceFile
from .serializers import (
    DocumentTemplateSerializer,
    DocumentTemplateListSerializer,
    SourceFileSerializer,
    SourceFileListSerializer,
    SourceFileUploadSerializer,
)


def get_user_or_demo(request: Request) -> User:
    """
    Возвращает текущего пользователя или демо-пользователя для неавторизованных запросов.
    """
    if request.user.is_authenticated:
        return request.user
    demo_user, _ = User.objects.get_or_create(
        username='demo_user',
        defaults={'email': 'demo@example.com'}
    )
    return demo_user


class IsOwnerOrDemoPermission(permissions.BasePermission):
    """
    Разрешает доступ владельцу объекта или демо-пользователю к своим объектам.
    """
    def has_object_permission(self, request: Request, view, obj) -> bool:
        user = get_user_or_demo(request)
        return obj.owner == user


class DocumentTemplateViewSet(viewsets.ModelViewSet):
    """
    ViewSet для управления шаблонами документов.
    
    Поддерживает:
    - GET /templates/ - список шаблонов текущего пользователя
    - POST /templates/ - создание нового шаблона
    - GET /templates/{id}/ - просмотр шаблона
    - PUT/PATCH /templates/{id}/ - обновление шаблона
    - DELETE /templates/{id}/ - удаление шаблона
    """
    permission_classes = [permissions.AllowAny, IsOwnerOrDemoPermission]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return DocumentTemplateListSerializer
        return DocumentTemplateSerializer
    
    def get_queryset(self) -> QuerySet[DocumentTemplate]:
        user = get_user_or_demo(self.request)
        return DocumentTemplate.objects.filter(owner=user)
    
    def perform_create(self, serializer):
        user = get_user_or_demo(self.request)
        serializer.save(owner=user)
    
    def perform_update(self, serializer):
        serializer.save()


class SourceFileViewSet(viewsets.ModelViewSet):
    """
    ViewSet для управления загруженными файлами.
    
    Поддерживает:
    - GET /source-files/ - список файлов текущего пользователя
    - GET /source-files/{id}/ - просмотр данных файла
    - DELETE /source-files/{id}/ - удаление файла
    """
    permission_classes = [permissions.AllowAny, IsOwnerOrDemoPermission]
    http_method_names = ['get', 'delete', 'head', 'options']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return SourceFileListSerializer
        return SourceFileSerializer
    
    def get_queryset(self) -> QuerySet[SourceFile]:
        user = get_user_or_demo(self.request)
        return SourceFile.objects.filter(owner=user)


class SourceFileUploadView(APIView):
    """
    View для загрузки и автопарсинга файлов DOCX и PDF.
    
    POST /upload-source-file/
    - file: файл DOCX или PDF (обязательно)
    - template_id: ID привязанного шаблона (опционально)
    
    Возвращает сериализованные данные загруженного файла с результатом парсинга.
    """
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request: Request) -> Response:
        user = get_user_or_demo(request)
        
        serializer = SourceFileUploadSerializer(
            data=request.data,
            context={'request': request, 'owner': user}
        )
        
        if serializer.is_valid():
            source_file = serializer.save()
            response_serializer = SourceFileSerializer(
                source_file,
                context={'request': request}
            )
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
