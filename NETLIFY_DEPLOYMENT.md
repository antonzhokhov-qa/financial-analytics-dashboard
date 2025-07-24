# 🚀 Развертывание на Netlify

## 📋 Пошаговая инструкция

### 1. Подготовка проекта ✅
- ✅ Проект настроен для Netlify
- ✅ Создан `netlify.toml` конфигурационный файл
- ✅ API функции перенесены в `netlify/functions/`
- ✅ Проект собран и готов к деплою

### 2. Регистрация на Netlify
1. Перейдите на [netlify.com](https://netlify.com)
2. Нажмите "Sign up" и войдите через GitHub
3. Подтвердите доступ к вашему репозиторию

### 3. Создание нового сайта
1. В панели Netlify нажмите "New site from Git"
2. Выберите GitHub как провайдера
3. Найдите ваш репозиторий: `antonzhokhov-qa/financial-analytics-dashboard`
4. Нажмите "Deploy site"

### 4. Настройка деплоя
Netlify автоматически определит настройки из `netlify.toml`:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: `18`

### 5. Проверка деплоя
После успешного деплоя вы получите URL вида:
`https://random-name.netlify.app`

### 6. Тестирование API
Проверьте работу API функций:
- Health check: `https://your-site.netlify.app/.netlify/functions/health`
- Reconciliation: `https://your-site.netlify.app/.netlify/functions/reconcile`

## 🔧 Конфигурация

### netlify.toml
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  directory = "netlify/functions"
```

### API функции
- `netlify/functions/health.js` - проверка состояния API
- `netlify/functions/reconcile.js` - сверка данных

## 🎯 Преимущества Netlify

✅ **Простота настройки** - автоматическое определение настроек
✅ **Быстрый деплой** - обычно 1-2 минуты
✅ **Автоматические обновления** - при каждом push в master
✅ **SSL сертификат** - автоматически
✅ **CDN** - глобальное распространение
✅ **Функции** - serverless API
✅ **Формы** - встроенная обработка форм
✅ **Аналитика** - встроенная статистика

## 🔍 Возможные проблемы

### Если деплой не удается:
1. Проверьте логи сборки в Netlify
2. Убедитесь, что все зависимости установлены
3. Проверьте, что `npm run build` работает локально

### Если API не работает:
1. Проверьте URL функции: `/.netlify/functions/function-name`
2. Убедитесь, что функция экспортирует `{ handler }`
3. Проверьте логи функции в Netlify

## 📞 Поддержка

Если возникнут проблемы:
1. Проверьте [документацию Netlify](https://docs.netlify.com/)
2. Посмотрите логи в панели Netlify
3. Обратитесь в поддержку Netlify

---

**Удачи с деплоем! 🎉** 