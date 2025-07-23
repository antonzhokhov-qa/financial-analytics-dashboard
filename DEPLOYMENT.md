# 🚀 Развертывание на Vercel

## Подготовка к развертыванию

### 1. Структура проекта
```
├── src/                    # React фронтенд
├── server.js              # Express API сервер
├── vercel.json            # Конфигурация Vercel
├── package.json           # Зависимости и скрипты
└── vite.config.js         # Конфигурация Vite
```

### 2. Конфигурация Vercel

Файл `vercel.json` настроен для:
- Сборки React приложения из `package.json`
- Запуска API сервера из `server.js`
- Маршрутизации API запросов на `/api/*`
- Маршрутизации остальных запросов на `index.html`

### 3. Переменные окружения

В Vercel Dashboard добавьте:
```
VITE_API_BASE_URL=https://payment.woozuki.com/collector1/api/v1
VITE_API_KEY=master-3E193252DE4A4B4C80862F67B2972D3D
```

## Развертывание

### 1. Подключение к Vercel
1. Перейдите на [vercel.com](https://vercel.com)
2. Подключите GitHub репозиторий
3. Выберите репозиторий `financial-analytics-dashboard`

### 2. Настройки развертывания
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Переменные окружения
Добавьте в Vercel Dashboard:
- `VITE_API_BASE_URL`
- `VITE_API_KEY`

### 4. Деплой
Нажмите "Deploy" и дождитесь завершения сборки.

## Проверка развертывания

### API Endpoints
- Health Check: `https://your-app.vercel.app/api/health`
- Reconciliation: `https://your-app.vercel.app/api/reconcile`

### Фронтенд
- Главная страница: `https://your-app.vercel.app/`
- Сверка: `https://your-app.vercel.app/reconciliation`

## Локальная разработка

```bash
# Установка зависимостей
npm install

# Запуск фронтенда
npm run dev

# Запуск API сервера (в отдельном терминале)
node server.js
```

## Структура API

### POST /api/reconcile
Загружает и сверяет файлы провайдера и платформы

**Параметры:**
- `merchantFile`: CSV файл провайдера
- `platformFile`: CSV файл платформы

**Ответ:**
```json
{
  "success": true,
  "results": {
    "matched": [...],
    "statusMismatch": [...],
    "merchantOnly": [...],
    "platformOnly": [...],
    "summary": {...}
  },
  "metadata": {...}
}
```

### GET /api/health
Проверка состояния сервера

**Ответ:**
```json
{
  "status": "OK",
  "timestamp": "2025-01-XX..."
}
``` 