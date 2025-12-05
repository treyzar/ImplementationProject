# Конструктор документов (Document Builder)

## Обзор проекта

Визуальный конструктор документов с возможностью создания шаблонов, добавления различных блоков (текст, таблицы, изображения, подписи), парсинга DOCX и PDF файлов.

### Технологии

- **Backend**: Django 5.x + Django REST Framework
- **Frontend**: React 18 + TypeScript + Vite
- **База данных**: SQLite (development)
- **Парсинг**: python-docx, pdfplumber

## Структура проекта

```
/
├── backend/                    # Django backend
│   ├── config/                 # Настройки Django
│   │   ├── settings.py
│   │   └── urls.py
│   ├── document_builder/       # Приложение конструктора
│   │   ├── models.py           # DocumentTemplate, SourceFile
│   │   ├── serializers.py      # DRF сериализаторы
│   │   ├── views.py            # ViewSets и API views
│   │   ├── urls.py             # API маршруты
│   │   └── utils.py            # Парсеры DOCX/PDF
│   └── manage.py
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── api/                # API клиент
│   │   ├── components/         # React компоненты
│   │   │   └── document-builder/
│   │   └── pages/              # Страницы
│   └── vite.config.ts
└── INTEGRATION_GUIDE.md        # Инструкция по интеграции
```

## Запуск проекта

### Development

Проект запускается через workflow "Document Builder":
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:5000`

### API Endpoints

| Метод | URL | Описание |
|-------|-----|----------|
| GET/POST | `/api/documents/templates/` | Список/создание шаблонов |
| GET/PATCH/DELETE | `/api/documents/templates/{id}/` | CRUD шаблона |
| GET | `/api/documents/source-files/` | Список файлов |
| GET/DELETE | `/api/documents/source-files/{id}/` | Файл и парсинг |
| POST | `/api/documents/upload-source-file/` | Загрузка файла |

## Функционал

### Визуальный редактор
- Холст формата A4
- Drag-and-drop блоков
- Изменение размера блоков
- Управление масштабом (50-200%)
- Undo/Redo операций

### Типы блоков
- Текстовые блоки
- Таблицы
- Изображения
- Поля подписи
- Прямоугольники (фигуры)

### Работа с файлами
- Загрузка DOCX и PDF
- Автоматический парсинг текста
- Просмотр содержимого по страницам

## Последние изменения

- 2025-12-05: Создан модуль конструктора документов
  - Backend: models, views, serializers, parsers
  - Frontend: визуальный редактор с drag-and-drop
  - Интеграция с Django REST Framework

## Пользовательские предпочтения

- Язык интерфейса: русский
- Стек: Django REST Framework + React + TypeScript
