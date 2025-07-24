# 🚀 Analytics Backend Server

Backend API для обработки больших CSV файлов с поддержкой WebSocket прогресса.

## 📋 Возможности

- **Потоковая обработка CSV файлов** до 100MB
- **WebSocket прогресс** в реальном времени
- **Поддержка провайдеров**: Optipay, Payshack
- **Пагинированные результаты** для больших наборов данных
- **Расширенная аналитика** с временными метриками
- **Автоматическая очистка файлов** через час

## 🛠️ Установка

```bash
# Переходим в папку сервера
cd server

# Устанавливаем зависимости
npm install

# Запускаем в режиме разработки
npm run dev

# Или в продакшн режиме
npm start
```

## 🔌 API Endpoints

### 📤 Загрузка файла
```http
POST /api/analytics/upload
Content-Type: multipart/form-data

csvFile: [CSV file]
provider: "optipay" | "payshack"
```

**Ответ:**
```json
{
  "jobId": "job_1703123456789_abc123",
  "status": "processing",
  "message": "Файл загружен, начинается обработка"
}
```

### 📊 Статус задачи
```http
GET /api/analytics/job/{jobId}/status
```

**Ответ:**
```json
{
  "id": "job_1703123456789_abc123",
  "status": "processing",
  "fileName": "transactions.csv",
  "fileSize": 52428800,
  "provider": "payshack",
  "progress": 65,
  "stage": "Обработано 32500 из 50000 записей..."
}
```

### 📈 Результаты с пагинацией
```http
GET /api/analytics/job/{jobId}/results?page=1&limit=100
```

**Ответ:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 50000,
    "totalPages": 500
  },
  "metrics": {
    "total": 50000,
    "successful": 45000,
    "conversionRate": 90,
    "provider": "payshack"
  }
}
```

### 🩺 Health Check
```http
GET /api/health
```

## 🔌 WebSocket

Подключение к `ws://localhost:8080` для получения прогресса:

```javascript
const ws = new WebSocket('ws://localhost:8080')

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'subscribe',
    jobId: 'job_1703123456789_abc123'
  }))
}

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  console.log('Progress:', data.progress)
}
```

## 📁 Структура данных

### Optipay (Турция)
```csv
Tracking Id,Status,Amount,Creation time,Payment method,Company
ce0479e2-bc57-4678-802a-190178488826,Completed,100.00,2025-07-01 12:00:12,AutoBankTransfer,Zro_Monetix
```

### Payshack (Индия)
```csv
Transaction Id,Order Id,Status,Amount,Created Date,Payment Method
TXN123456,ORD789012,Success,5000.00,2025-07-23 14:30:00,UPI
```

## 🔧 Конфигурация

### Переменные окружения
```env
PORT=3002                    # HTTP порт
WS_PORT=8080                # WebSocket порт
MAX_FILE_SIZE=104857600     # Максимальный размер файла (100MB)
CLEANUP_INTERVAL=3600000    # Интервал очистки файлов (1 час)
```

### Лимиты
- **Размер файла**: 100MB
- **Время обработки**: 5 минут максимум
- **Память**: Потоковая обработка без загрузки всего файла в память

## 🏗️ Архитектура

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Express API   │    │   WebSocket     │
│   (React)       │◄──►│   (Node.js)     │◄──►│   Server        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   File System   │
                       │   (temp files)  │
                       └─────────────────┘
```

## 📊 Метрики производительности

- **Обработка**: ~1000 записей/сек
- **Память**: Константное потребление (~50MB)
- **Диск**: Временные файлы автоматически удаляются
- **WebSocket**: Обновления каждые 1000 записей

## 🚨 Обработка ошибок

Все ошибки логируются и возвращаются в структурированном формате:

```json
{
  "error": "Описание ошибки",
  "code": "ERROR_CODE",
  "details": {...}
}
```

## 📝 Логирование

Сервер выводит подробные логи:
- 🚀 Новые задачи
- 📊 Прогресс обработки
- ✅ Успешные завершения
- ❌ Ошибки и исключения
- 🗑️ Очистка файлов

## 🔒 Безопасность

- Валидация типов файлов
- Ограничения размера файлов
- Автоматическая очистка временных файлов
- CORS настройки для фронтенда

## 🚀 Деплой

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3001 8080
CMD ["npm", "start"]
```

### PM2
```bash
npm install -g pm2
pm2 start index.js --name "analytics-api"
pm2 startup
pm2 save
``` 