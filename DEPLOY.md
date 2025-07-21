# 🚀 Инструкция по развертыванию

## Вариант 1: Vercel (Рекомендуется) - БЕСПЛАТНО

### Шаг 1: Подготовка
1. Зарегистрируйтесь на [vercel.com](https://vercel.com)
2. Подключите свой GitHub аккаунт

### Шаг 2: Развертывание
1. В Vercel нажмите "New Project"
2. Импортируйте репозиторий `sverkii` из GitHub
3. Настройки сборки:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Шаг 3: Переменные окружения
В настройках проекта Vercel добавьте переменные окружения:
- `VITE_API_BASE_URL` = `https://payment.woozuki.com/collector1/api/v1`  
- `VITE_API_KEY` = `master-3E193252DE4A4B4C80862F67B2972D3D`

### Шаг 4: Деплой
Нажмите "Deploy" - приложение будет доступно по адресу типа `your-app-name.vercel.app`

---

## Вариант 2: Netlify - БЕСПЛАТНО

### Шаг 1: Подготовка
1. Зарегистрируйтесь на [netlify.com](https://netlify.com)
2. Подключите GitHub аккаунт

### Шаг 2: Развертывание
1. "New site from Git" → выберите репозиторий
2. Настройки:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

### Шаг 3: Переменные окружения
В Site settings → Environment variables добавьте те же переменные что и для Vercel.

---

## Вариант 3: VPS сервер (DigitalOcean, AWS, etc.)

### Требования сервера:
- Ubuntu 20.04+ / CentOS 7+
- 1GB RAM (минимум)
- Node.js 18+
- Nginx

### Команды установки:
```bash
# Установка Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установка PM2 для управления процессами
sudo npm install -g pm2

# Клонирование репозитория
git clone https://github.com/your-username/sverkii.git
cd sverkii

# Установка зависимостей и сборка
npm install
npm run build

# Настройка Nginx
sudo apt install nginx
# Создать конфиг для nginx (см. ниже)
```

### Nginx конфигурация:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    root /path/to/sverkii/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## Локальная сборка для тестирования

```bash
# Создать .env файл с переменными окружения
echo "VITE_API_BASE_URL=https://payment.woozuki.com/collector1/api/v1" > .env
echo "VITE_API_KEY=master-3E193252DE4A4B4C80862F67B2972D3D" >> .env

# Сборка приложения
npm run build

# Предварительный просмотр
npm run preview
```

---

## 🔧 Настройки домена (опционально)

### Для Vercel:
1. В настройках проекта → Domains
2. Добавьте свой домен
3. Настройте DNS записи у регистратора домена

### Для Netlify:
1. Site settings → Domain management
2. Add custom domain
3. Настройте DNS записи

---

## 🔒 Безопасность

⚠️ **ВАЖНО**: API ключи будут видны в клиентском коде! Для продакшена рекомендуется:
1. Создать прокси-сервер для API запросов
2. Использовать серверную авторизацию
3. Настроить CORS на API сервере

---

## 🚨 Troubleshooting

### Проблема: Белый экран после деплоя
- Проверьте консоль браузера на ошибки
- Убедитесь что все переменные окружения настроены

### Проблема: API запросы не работают  
- Проверьте CORS настройки на сервере API
- Убедитесь что API ключ корректен

### Проблема: Routing не работает
- Добавьте файл `_redirects` в public/ с содержимым: `/* /index.html 200` 