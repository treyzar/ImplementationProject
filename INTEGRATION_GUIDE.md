# Инструкция по интеграции модуля "Конструктор документов"

Данная инструкция описывает пошаговый процесс интеграции модуля "Конструктор документов" в существующий проект Django REST Framework + React.

## Содержание

1. [Backend интеграция](#1-backend-интеграция)
2. [Frontend интеграция](#2-frontend-интеграция)
3. [Общие рекомендации](#3-общие-рекомендации)
4. [Проверка работоспособности](#4-проверка-работоспособности)

---

## 1. Backend интеграция

### 1.1. Установка зависимостей

Добавьте в файл `requirements.txt`:

```
python-docx>=1.0.0
pdfplumber>=0.10.0
Pillow>=10.0.0
```

Установите зависимости:

```bash
pip install python-docx pdfplumber Pillow
```

### 1.2. Копирование файлов приложения

Скопируйте папку `document_builder/` в директорию с приложениями Django вашего проекта:

```
your_project/
├── manage.py
├── config/  (или имя вашего основного модуля)
│   ├── settings.py
│   └── urls.py
└── document_builder/  <-- скопируйте эту папку
    ├── __init__.py
    ├── admin.py
    ├── apps.py
    ├── models.py
    ├── serializers.py
    ├── urls.py
    ├── utils.py
    ├── views.py
    └── migrations/
```

### 1.3. Настройка settings.py

#### Добавьте приложение в INSTALLED_APPS:

```python
INSTALLED_APPS = [
    # ... существующие приложения ...
    'rest_framework',
    'corsheaders',
    'document_builder',
]
```

#### Добавьте middleware для CORS (если ещё не добавлен):

```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # <-- должен быть до CommonMiddleware
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    # ... остальные middleware ...
]
```

#### Настройте MEDIA директорию для загрузки файлов:

```python
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'
```

#### Настройте CORS (для разработки):

```python
CORS_ALLOW_ALL_ORIGINS = True  # Только для разработки!
CORS_ALLOW_CREDENTIALS = True
```

#### Настройте REST Framework:

```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}
```

### 1.4. Настройка URLs

В корневом файле `urls.py` добавьте маршруты:

```python
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/documents/', include('document_builder.urls', namespace='document_builder')),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    # ... ваши другие маршруты ...
]

# Добавьте для разработки:
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

### 1.5. Применение миграций

```bash
python manage.py makemigrations document_builder
python manage.py migrate
```

### 1.6. API Endpoints

После интеграции доступны следующие endpoints:

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/api/documents/templates/` | Список шаблонов пользователя |
| POST | `/api/documents/templates/` | Создание нового шаблона |
| GET | `/api/documents/templates/{id}/` | Получение шаблона |
| PATCH | `/api/documents/templates/{id}/` | Обновление шаблона |
| DELETE | `/api/documents/templates/{id}/` | Удаление шаблона |
| GET | `/api/documents/source-files/` | Список загруженных файлов |
| GET | `/api/documents/source-files/{id}/` | Данные файла с parsed_content |
| DELETE | `/api/documents/source-files/{id}/` | Удаление файла |
| POST | `/api/documents/upload-source-file/` | Загрузка и парсинг файла |

---

## 2. Frontend интеграция

### 2.1. Копирование файлов

Скопируйте следующие файлы в соответствующие директории вашего React проекта:

```
src/
├── api/
│   └── documentBuilderApi.ts
├── components/
│   └── document-builder/
│       ├── types.ts
│       ├── DocumentCanvas.tsx
│       ├── InspectorPanel.tsx
│       ├── SidebarBlocks.tsx
│       ├── SidebarFiles.tsx
│       └── Toolbar.tsx
└── pages/
    └── DocumentBuilderPage.tsx
```

### 2.2. Установка зависимостей

Если их ещё нет в проекте:

```bash
npm install axios react-router-dom
```

Для TypeScript:

```bash
npm install -D @types/react @types/react-dom
```

### 2.3. Настройка API URL

В файле `src/api/documentBuilderApi.ts` настройте базовый URL:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/documents';
```

Для Vite добавьте в `.env`:

```
VITE_API_URL=/api/documents
```

Или настройте proxy в `vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
```

### 2.4. Добавление маршрута

В вашем файле роутинга (например, `App.tsx` или `router.tsx`):

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DocumentBuilderPage } from './pages/DocumentBuilderPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ... ваши существующие маршруты ... */}
        <Route path="/documents/builder" element={<DocumentBuilderPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 2.5. Интеграция с существующим axios instance

Если у вас есть общий axios instance, обновите `documentBuilderApi.ts`:

```typescript
// Импортируйте ваш существующий instance
import { apiClient } from '../path/to/your/axios-instance';

// Замените локальный apiClient на ваш
```

---

## 3. Общие рекомендации

### 3.1. Безопасное внедрение

1. **Создайте отдельную ветку в Git:**
   ```bash
   git checkout -b feature/document-builder
   ```

2. **Сделайте бекап базы данных** перед применением миграций

3. **Тестируйте локально** перед деплоем на продакшен

### 3.2. Настройка для продакшена

1. **Измените CORS настройки:**
   ```python
   CORS_ALLOWED_ORIGINS = [
       'https://your-frontend-domain.com',
   ]
   ```

2. **Настройте MEDIA файлы:**
   - Используйте cloud storage (S3, GCS) для хранения файлов
   - Настройте CDN для раздачи статических файлов

3. **Измените permission на IsAuthenticated:**
   ```python
   REST_FRAMEWORK = {
       'DEFAULT_PERMISSION_CLASSES': [
           'rest_framework.permissions.IsAuthenticated',
       ],
   }
   ```

### 3.3. Максимальный размер файлов

По умолчанию максимальный размер файла — 50 МБ. Чтобы изменить:

В `serializers.py`:
```python
MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024  # 100 MB
```

В Django settings:
```python
DATA_UPLOAD_MAX_MEMORY_SIZE = 100 * 1024 * 1024  # 100 MB
```

---

## 4. Проверка работоспособности

### 4.1. Проверка Backend

Запустите сервер и проверьте API:

```bash
# Запуск сервера
python manage.py runserver

# Проверка API (требуется авторизация через сессию или Basic Auth)
curl -u admin:password http://localhost:8000/api/documents/templates/

# Создание шаблона
curl -X POST -u admin:password \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Template", "data": {"blocks": [], "zoom": 100}}' \
  http://localhost:8000/api/documents/templates/

# Загрузка файла
curl -X POST -u admin:password \
  -F "file=@test.pdf" \
  http://localhost:8000/api/documents/upload-source-file/
```

### 4.2. Проверка Frontend

1. Запустите frontend:
   ```bash
   npm run dev
   ```

2. Откройте браузер: `http://localhost:5000/documents/builder`

3. Проверьте функционал:
   - Добавление блоков на холст
   - Перетаскивание и изменение размера блоков
   - Сохранение шаблона
   - Загрузка файлов DOCX/PDF
   - Просмотр распарсенного содержимого

---

## Структура моделей

### DocumentTemplate

| Поле | Тип | Описание |
|------|-----|----------|
| id | BigAutoField | Первичный ключ |
| owner | ForeignKey(User) | Владелец шаблона |
| title | CharField(255) | Название шаблона |
| description | TextField | Описание |
| data | JSONField | Данные шаблона (блоки, zoom и т.д.) |
| created_at | DateTimeField | Дата создания |
| updated_at | DateTimeField | Дата обновления |

### SourceFile

| Поле | Тип | Описание |
|------|-----|----------|
| id | BigAutoField | Первичный ключ |
| owner | ForeignKey(User) | Владелец файла |
| template | ForeignKey(DocumentTemplate) | Привязанный шаблон (опционально) |
| file | FileField | Загруженный файл |
| original_name | CharField(255) | Оригинальное имя файла |
| mime_type | CharField(100) | MIME-тип файла |
| file_size | PositiveIntegerField | Размер в байтах |
| parsed_content | JSONField | Результат парсинга |
| uploaded_at | DateTimeField | Дата загрузки |

---

## Формат данных шаблона (data)

```json
{
  "blocks": [
    {
      "id": "block_1234567890_abc123",
      "type": "text",
      "x": 50,
      "y": 100,
      "width": 200,
      "height": 60,
      "rotation": 0,
      "content": "Текст блока",
      "style": {
        "fontFamily": "Arial",
        "fontSize": 14,
        "fontWeight": "normal",
        "fontStyle": "normal",
        "textAlign": "left",
        "color": "#000000",
        "backgroundColor": "transparent",
        "borderColor": "#000000",
        "borderWidth": 1,
        "borderRadius": 0,
        "padding": 8
      },
      "zIndex": 1
    }
  ],
  "zoom": 100,
  "pageWidth": 794,
  "pageHeight": 1123
}
```

---

## Формат parsed_content

```json
[
  {"page": 1, "text": "Текст первой страницы..."},
  {"page": 2, "text": "Текст второй страницы..."}
]
```

---

## Поддержка

При возникновении проблем проверьте:

1. Установлены ли все зависимости
2. Применены ли миграции
3. Настроены ли MEDIA_ROOT и MEDIA_URL
4. Корректно ли настроен CORS
5. Работает ли proxy в Vite (или настроен API_URL)
