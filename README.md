# Financial Analytics Dashboard

Профессиональная аналитическая панель для анализа финансовых транзакций с возможностью загрузки CSV/Excel файлов, визуализации данных и экспорта отчетов в PDF.

## 🚀 Функционал

### 📊 Аналитика данных
- Загрузка и парсинг CSV/Excel файлов
- Автоматическое определение структуры данных
- Подсчет ключевых метрик (конверсия, доходы, средние суммы)
- Анализ статусов транзакций

### 📈 Визуализация
- Интерактивные графики и диаграммы
- Фильтрация данных по различным параметрам
- Детальная таблица транзакций с сортировкой
- Реальное время обновления статистики

### 📋 Отчетность
- Экспорт в профессиональный PDF на английском языке
- Красивое оформление с таблицами и графиками
- Автоматическая пагинация
- Итоговая статистика и рекомендации

### 🎨 Интерфейс
- Современный дизайн с темной/светлой темой
- Адаптивная верстка
- Интуитивно понятная навигация
- Эмодзи-индикаторы для лучшего UX

## 🛠 Технологии

- **Frontend**: React 18, Vite
- **Стили**: Tailwind CSS
- **Графики**: Chart.js
- **PDF**: jsPDF
- **Парсинг**: Нативные JavaScript методы

## 📦 Установка

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd sverkii
```

2. Установите зависимости:
```bash
npm install
```

3. Запустите проект:
```bash
npm run dev
```

4. Откройте браузер по адресу: `http://localhost:5173`

## 📁 Структура проекта

```
sverkii/
├── src/
│   ├── components/          # React компоненты
│   ├── utils/              # Утилиты (парсинг, PDF экспорт)
│   ├── App.jsx             # Главный компонент
│   └── main.jsx            # Точка входа
├── public/                 # Статические файлы
├── package.json            # Зависимости и скрипты
└── README.md              # Документация
```

## 🔧 Использование

### Загрузка данных
1. Нажмите "Загрузить файл" или перетащите CSV/Excel файл
2. Дождитесь автоматического парсинга
3. Проверьте корректность загруженных данных

### Анализ
- Переключайтесь между вкладками для разных видов анализа
- Используйте фильтры для детального изучения данных
- Изучайте графики и метрики

### Экспорт
- Нажмите "Экспорт в PDF" для создания отчета
- PDF будет автоматически скачан с профессиональным оформлением

## 📊 Поддерживаемые форматы данных

### CSV файлы
- Разделители: `;`, `,`, `\t`
- Кодировка: UTF-8
- Автоматическое определение структуры

### Excel файлы (.xlsx)
- Поддержка всех стандартных форматов
- Автоматическое извлечение данных

### Требуемые поля
- `Reference ID` - уникальный идентификатор
- `Status` - статус транзакции (success/fail)
- `Initial Amount` - сумма транзакции
- `Initial Currency` - валюта
- `Method` - метод платежа

## 🎯 Ключевые метрики

- **Общее количество транзакций**
- **Успешные/неуспешные операции**
- **Конверсия (%)**
- **Общий доход**
- **Средняя сумма транзакции**
- **Максимальная/минимальная суммы**

## 🔄 Разработка

### Создание новой ветки
```bash
git checkout -b feature/new-feature
```

### Коммит изменений
```bash
git add .
git commit -m "Описание изменений"
```

### Пуш в репозиторий
```bash
git push origin feature/new-feature
```

## 📝 История изменений

### Версия 1.0.0
- ✅ Базовая функциональность загрузки файлов
- ✅ Парсинг CSV/Excel
- ✅ Основные метрики и аналитика
- ✅ Экспорт в PDF
- ✅ Современный UI/UX

### В разработке (ветка feature/enhancements)
- 🔄 Улучшения и новые функции

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Внесите изменения
4. Создайте Pull Request

## 📄 Лицензия

MIT License - см. файл LICENSE для деталей.

## 👨‍💻 Автор

Разработано для анализа финансовых транзакций с профессиональным подходом к визуализации данных. 