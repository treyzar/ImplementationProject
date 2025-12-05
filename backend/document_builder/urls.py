from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    DocumentTemplateViewSet,
    SourceFileViewSet,
    SourceFileUploadView,
)

router = DefaultRouter()
router.register(r'templates', DocumentTemplateViewSet, basename='document-template')
router.register(r'source-files', SourceFileViewSet, basename='source-file')

app_name = 'document_builder'

urlpatterns = [
    path('upload-source-file/', SourceFileUploadView.as_view(), name='upload-source-file'),
    path('', include(router.urls)),
]
