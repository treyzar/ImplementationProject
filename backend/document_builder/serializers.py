from rest_framework import serializers
from django.contrib.auth.models import User

from .models import DocumentTemplate, SourceFile
from .utils import parse_file_by_extension, get_mime_type_from_extension


class DocumentTemplateSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    
    class Meta:
        model = DocumentTemplate
        fields = [
            'id',
            'owner',
            'owner_username',
            'title',
            'description',
            'data',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'owner', 'owner_username', 'created_at', 'updated_at']


class DocumentTemplateListSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    
    class Meta:
        model = DocumentTemplate
        fields = [
            'id',
            'owner_username',
            'title',
            'description',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields


class SourceFileSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    template_title = serializers.CharField(source='template.title', read_only=True, allow_null=True)
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = SourceFile
        fields = [
            'id',
            'owner',
            'owner_username',
            'template',
            'template_title',
            'file',
            'file_url',
            'original_name',
            'mime_type',
            'file_size',
            'parsed_content',
            'uploaded_at',
        ]
        read_only_fields = [
            'id',
            'owner',
            'owner_username',
            'template_title',
            'file_url',
            'original_name',
            'mime_type',
            'file_size',
            'parsed_content',
            'uploaded_at',
        ]
    
    def get_file_url(self, obj: SourceFile) -> str | None:
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None


class SourceFileListSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    template_title = serializers.CharField(source='template.title', read_only=True, allow_null=True)
    
    class Meta:
        model = SourceFile
        fields = [
            'id',
            'owner_username',
            'template',
            'template_title',
            'original_name',
            'mime_type',
            'file_size',
            'uploaded_at',
        ]
        read_only_fields = fields


class SourceFileUploadSerializer(serializers.Serializer):
    file = serializers.FileField(required=True)
    template_id = serializers.IntegerField(required=False, allow_null=True)
    
    MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024
    ALLOWED_EXTENSIONS = ['pdf', 'docx']
    
    def validate_file(self, value):
        if value.size > self.MAX_FILE_SIZE_BYTES:
            max_size_mb = self.MAX_FILE_SIZE_BYTES // (1024 * 1024)
            raise serializers.ValidationError(
                f"Размер файла превышает максимально допустимый ({max_size_mb} МБ)"
            )
        
        filename = value.name
        extension = filename.lower().rsplit('.', 1)[-1] if '.' in filename else ''
        
        if extension not in self.ALLOWED_EXTENSIONS:
            raise serializers.ValidationError(
                f"Недопустимое расширение файла. Разрешены: {', '.join(self.ALLOWED_EXTENSIONS)}"
            )
        
        return value
    
    def validate_template_id(self, value):
        if value is not None:
            owner = self.context.get('owner')
            if owner and not DocumentTemplate.objects.filter(id=value, owner=owner).exists():
                raise serializers.ValidationError(
                    "Шаблон с указанным ID не найден или недоступен"
                )
        return value
    
    def create(self, validated_data: dict) -> SourceFile:
        owner = self.context.get('owner')
        if not owner:
            raise serializers.ValidationError("Владелец не определён")
        
        uploaded_file = validated_data['file']
        template_id = validated_data.get('template_id')
        
        template = None
        if template_id:
            template = DocumentTemplate.objects.get(id=template_id, owner=owner)
        
        original_name = uploaded_file.name
        mime_type = get_mime_type_from_extension(original_name)
        file_size = uploaded_file.size
        
        try:
            parsed_content = parse_file_by_extension(uploaded_file, original_name)
        except ValueError as e:
            raise serializers.ValidationError({'file': str(e)})
        
        source_file = SourceFile.objects.create(
            owner=owner,
            template=template,
            file=uploaded_file,
            original_name=original_name,
            mime_type=mime_type,
            file_size=file_size,
            parsed_content=parsed_content,
        )
        
        return source_file
