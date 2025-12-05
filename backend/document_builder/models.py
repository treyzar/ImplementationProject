from django.db import models
from django.contrib.auth.models import User
from django.core.validators import FileExtensionValidator
import os
import uuid


def source_file_upload_path(instance: 'SourceFile', filename: str) -> str:
    ext = os.path.splitext(filename)[1]
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    return f"source_files/{instance.owner.id}/{unique_filename}"


class DocumentTemplate(models.Model):
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='document_templates',
        verbose_name='Владелец'
    )
    title = models.CharField(
        max_length=255,
        verbose_name='Название шаблона'
    )
    description = models.TextField(
        blank=True,
        default='',
        verbose_name='Описание'
    )
    data = models.JSONField(
        default=dict,
        verbose_name='Данные шаблона (блоки, zoom и т.д.)'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата создания'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Дата обновления'
    )

    class Meta:
        verbose_name = 'Шаблон документа'
        verbose_name_plural = 'Шаблоны документов'
        ordering = ['-updated_at']

    def __str__(self) -> str:
        return f"{self.title} (владелец: {self.owner.username})"


class SourceFile(models.Model):
    ALLOWED_EXTENSIONS = ['pdf', 'docx']
    MAX_FILE_SIZE_MB = 50

    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='source_files',
        verbose_name='Владелец'
    )
    template = models.ForeignKey(
        DocumentTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='source_files',
        verbose_name='Привязанный шаблон'
    )
    file = models.FileField(
        upload_to=source_file_upload_path,
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'docx'])],
        verbose_name='Файл'
    )
    original_name = models.CharField(
        max_length=255,
        verbose_name='Оригинальное имя файла'
    )
    mime_type = models.CharField(
        max_length=100,
        verbose_name='MIME-тип'
    )
    file_size = models.PositiveIntegerField(
        verbose_name='Размер файла (байт)'
    )
    parsed_content = models.JSONField(
        default=list,
        verbose_name='Результат парсинга (страницы с текстом)'
    )
    uploaded_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата загрузки'
    )

    class Meta:
        verbose_name = 'Загруженный файл'
        verbose_name_plural = 'Загруженные файлы'
        ordering = ['-uploaded_at']

    def __str__(self) -> str:
        return f"{self.original_name} (владелец: {self.owner.username})"

    def delete(self, *args, **kwargs):
        if self.file:
            if os.path.isfile(self.file.path):
                os.remove(self.file.path)
        super().delete(*args, **kwargs)
