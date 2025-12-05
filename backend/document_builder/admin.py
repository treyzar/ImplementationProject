from django.contrib import admin
from .models import DocumentTemplate, SourceFile


@admin.register(DocumentTemplate)
class DocumentTemplateAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'owner', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['title', 'description', 'owner__username']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-updated_at']


@admin.register(SourceFile)
class SourceFileAdmin(admin.ModelAdmin):
    list_display = ['id', 'original_name', 'owner', 'template', 'mime_type', 'file_size', 'uploaded_at']
    list_filter = ['mime_type', 'uploaded_at']
    search_fields = ['original_name', 'owner__username']
    readonly_fields = ['uploaded_at', 'parsed_content']
    ordering = ['-uploaded_at']
