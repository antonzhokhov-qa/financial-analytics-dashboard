/**
 * Система интернационализации для поддержки русского и английского языков
 */

// Словари переводов
const translations = {
  ru: {
    // Общие термины
    common: {
      loading: 'Загрузка...',
      error: 'Ошибка',
      success: 'Успешно',
      total: 'Всего',
      failed: 'Неудачных',
      pending: 'В обработке',
      canceled: 'Отменено',
      successful: 'Успешных',
      currency: 'Валюта',
      amount: 'Сумма',
      date: 'Дата',
      status: 'Статус',
      operations: 'Операций',
      conversion: 'Конверсия',
      revenue: 'Выручка',
      average: 'Среднее',
      fees: 'Комиссии',
      merchants: 'Мерчанты',
      currencies: 'Валюты',
      deposits: 'Депозиты',
      withdraws: 'Выплаты',
      balance: 'Баланс',
      pieces: 'шт',
      unknown: 'Неизвестно'
    },

    // Навигация и заголовки
    navigation: {
      dashboard: 'Дашборд',
      analytics: 'Аналитика',
      transactions: 'Транзакции',
      reports: 'Отчеты',
      settings: 'Настройки',
      selectDataSource: 'Выберите источник данных',
      chooseDataMethod: 'Выберите способ получения данных для аналитики финансовых операций'
    },

    // Источники данных
    dataSources: {
      csvUpload: 'Загрузка CSV файла',
      csvDescription: 'Анализ данных от провайдера из CSV файла',
      platformAPI: 'API платформы',
      platformDescription: 'Получение актуальных данных через API коллектора',
      enhancedAPI: 'Расширенный API 🚀',
      enhancedDescription: 'Новые возможности коллектора: криптовалюты, информация о картах',
      features: {
        detailedAnalysis: 'Детальный анализ транзакций',
        largeFileSupport: 'Поддержка больших файлов',
        historicalAnalytics: 'Историческая аналитика',
        providerData: 'Данные от провайдера',
        realTimeInfo: 'Актуальная информация',
        projectFiltering: 'Фильтрация по проектам',
        liveData: 'Реальное время',
        platformData: 'Данные платформы',
        cryptoSupport: 'Поддержка криптовалют',
        cardInfo: 'Детальная информация о картах',
        currencyRates: 'Валютные курсы',
        secureData: '3D Secure данные',
        geolocation: 'IP геолокация'
      }
    },

    // Метрики
    metrics: {
      keyMetrics: 'Ключевые метрики',
      totalOperations: 'Всего операций',
      totalRevenue: 'Общая выручка',
      totalAmount: 'Общая сумма',
      averageAmount: 'Средняя сумма',
      successfulOperations: 'Успешные операции',
      failedOperations: 'Неудачные операции',
      conversionRate: 'Конверсия',
      actualData: 'Актуальные данные',
      efficiency: 'Эффективность',
      mainCurrency: 'Основная валюта',
      multiCurrency: 'валют',
      seeBelowDetails: 'Смотрите детальную разбивку ниже',
      allOperations: 'По всем операциям',
      mainIndicators: 'Основные показатели по',
      // Основные статусы операций
      successful: 'Успешные',
      failed: 'Неудачные',
      pending: 'В ожидании',
      canceled: 'Отмененные',
      // Подзаголовки и описания
      conversionText: 'конверсия',
      rejectionsText: 'отказов',
      inProcessing: 'в обработке',
      canceledText: 'отменено',
      // Описания выручки
      totalRevenueAllCurrencies: 'Общая выручка (все валюты)',
      totalAmountAllCurrencies: 'Общая сумма (все валюты)',
      lostRevenue: 'Потерянная выручка',
      successfulOnly: 'Только успешные операции',
      failedAndCanceled: 'Неудачные и отмененные',
      allOperationsText: 'Все операции',
      // Комиссии
      commissions: 'Комиссии',
      totalCommissions: 'Общая сумма комиссий',
      // Дополнительные тексты для EnhancedDataTable
      sumsBycurrencies: 'Суммы по валютам',
      successfulSum: 'Сумма успешных',
      inProcessOrError: 'В процессе/Ошибка',
      total: 'всего'
    },

    // Разбивки
    breakdowns: {
      currencyBreakdown: 'Разбивка по валютам',
      merchantBreakdown: 'Разбивка по мерчантам', 
      operationTypes: 'Типы операций',
      depositsAndWithdraws: 'Депозиты и выплаты',
      usdSummary: 'Сводка в USD',
      unifiedCurrency: 'Единая валюта',
      depositsVsWithdraws: 'Депозиты vs Выплаты',
      inUSD: 'В USD',
      // Детали
      operations: 'Операций',
      successful: 'Успешных',
      amount: 'Сумма',
      revenue: 'Выручка',
      share: 'Доля',
      totalAmount: 'Общая сумма',
      successfulRevenue: 'Успешная выручка',
      averageAmount: 'Средняя сумма',
      pieces: 'шт',
      currencies: 'Валюты',
      topCompanies: 'Топ компаний',
      paymentMethods: 'Методы оплаты',
      // Улучшенные заголовки
      mainStats: 'Основная статистика',
      operationsBreakdown: 'Разбивка операций',
      financialMetrics: 'Финансовые показатели'
    },

    // Операции
    operations: {
      deposit: 'Депозит',
      withdraw: 'Выплата',
      deposits: 'Депозиты',
      withdraws: 'Выплаты',
      depositType: 'Пополнение',
      withdrawType: 'Вывод',
      unknown: 'Неизвестно'
    },

    // Статусы
    statuses: {
      completed: 'Завершено',
      success: 'Успешно',
      failed: 'Неудачно',
      pending: 'В обработке',
      canceled: 'Отменено',
      inProcess: 'В процессе'
    },

    // Фильтры
    filters: {
      allProjects: 'Все проекты',
      selectProject: 'Выберите проект',
      dateRange: 'Период',
      status: 'Статус',
      currency: 'Валюта',
      search: 'Поиск',
      apply: 'Применить',
      reset: 'Сбросить',
      project: 'Проект',
      paymentType: 'Тип платежа',
      dateMode: 'Режим выборки',
      recordCount: 'Количество записей',
      advancedFilters: 'Расширенные фильтры',
      loadData: 'Загрузить данные',
      backToSource: 'Назад к выбору источника',
      interfaceCapabilities: 'Возможности интерфейса',
      enhancedAnalytics: 'Улучшенная аналитика',
      convenientFiltering: 'Удобная фильтрация'
    },

    // Провайдеры/Мерчанты
    providers: {
      monetix: 'Monetix',
      caroussel: 'Caroussel',
      paylab: 'Paylab',
      unknown: 'Неизвестный'
    },

    // Таблицы и данные
    table: {
      search: 'Поиск',
      export: 'Экспорт',
      results: 'результатов',
      operations: 'операций',
      noData: 'Нет данных',
      details: 'Детали',
      searchPlaceholder: 'Поиск по ID, статусу, проекту, пользователю...',
      searchPlaceholderShort: 'Поиск...',
      noDataFiltered: 'Нет данных, соответствующих фильтрам',
      noDataDisplay: 'Нет данных для отображения',
      enhancedApiAnalysis: 'Расширенный API анализ',
      operationsData: 'Данные операций',
      platformDataMulticurrency: 'Данные платформы с поддержкой мультивалютности',
      cryptoSupport: 'Поддержка криптовалют и детальной информации'
    },

    // Колонки таблиц
    columns: {
      status: 'Статус',
      amount: 'Сумма',
      createdAt: 'Дата создания',
      method: 'Метод',
      currency: 'Валюта',
      paymentMethod: 'Метод оплаты',
      company: 'Компания',
      provider: 'Провайдер'
    },

    // Графики и аналитика
    charts: {
      volume: 'Объем',
      quantity: 'Количество',
      transactions: 'Транзакции',  
      conversion: 'Конверсия (%)',
      totalVolume: 'Общий объем',
      successful: 'Успешные',
      conversionRate: 'Конверсия',
      averageCheck: 'Средний чек',
      onOperation: 'На операцию',
      totalConversion: 'Общая конверсия',
      deposits: 'Депозиты',
      withdrawals: 'Выплаты',
      interactive: 'Интерактивные графики и живая статистика',
      revenue: 'Выручка',
      peaks: 'Пики'
    },

    // Дни недели
    weekdays: {
      sunday: 'Воскресенье',
      monday: 'Понедельник', 
      tuesday: 'Вторник',
      wednesday: 'Среда',
      thursday: 'Четверг',
      friday: 'Пятница',
      saturday: 'Суббота'
    },

    // Короткие дни недели
    weekdaysShort: {
      sun: 'Вс',
      mon: 'Пн',
      tue: 'Вт', 
      wed: 'Ср',
      thu: 'Чт',
      fri: 'Пт',
      sat: 'Сб'
    },

    // Часовые пояса и города
    timezones: {
      moscow: 'Москва (MSK)',
      istanbul: 'Стамбул (TRT)',
      london: 'Лондон (GMT)',
      berlin: 'Берлин (CET)',
      dubai: 'Дубай (GST)',
      tokyo: 'Токио (JST)',
      newYork: 'Нью-Йорк (EST)',
      losAngeles: 'Лос-Анджелес (PST)'
    },

    // Временные периоды
    timePeriods: {
      allTime: 'Все время',
      twentyFourHours: '24 часа',
      sevenDays: '7 дней'
    },

    // Аналитика рисков и рекомендации
    analytics: {
      seasonality: 'Сезонность',
      competition: 'Конкуренция', 
      technicalIssues: 'Технические сбои',
      conversionOptimization: 'Оптимизация конверсии',
      conversionOptimizationDesc: 'Улучшить процесс завершения операций',
      failedOperationsAnalysis: 'Анализ неудачных операций',
      failedOperationsDesc: 'Выявить причины отказов и устранить их',
      anomalyMonitoring: 'Мониторинг аномалий',
      anomalyMonitoringDesc: 'Настроить систему раннего предупреждения',
      high: 'Высокий',
      medium: 'Средний',
      low: 'Низкий',
      noLimits: 'Без ограничений',
      providerExportTip: 'Не уверены в источнике? Выберите "Выгрузка от провайдера" для новых форматов с расширенными полями'
    },

    // Сводка компаний
    companies: {
      topCompanies: 'Топ компаний',
      paymentMethods: 'Методы оплаты'
    },

    // API разделы
    api: {
      enhancedAPI: 'Расширенное API',
      basicAPI: 'Базовое API',
      dataSource: 'Источник данных'
    },

    // Языки
    languages: {
      russian: 'Русский',
      english: 'English',
      switchLanguage: 'Переключить язык'
    }
  },

  en: {
    // Common terms
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      total: 'Total',
      failed: 'Failed',
      pending: 'Pending',
      canceled: 'Canceled',
      successful: 'Successful',
      currency: 'Currency',
      amount: 'Amount',
      date: 'Date',
      status: 'Status',
      operations: 'Operations',
      conversion: 'Conversion',
      revenue: 'Revenue',
      average: 'Average',
      fees: 'Fees',
      merchants: 'Merchants',
      currencies: 'Currencies',
      deposits: 'Deposits',
      withdraws: 'Withdrawals',
      balance: 'Balance',
      pieces: 'pcs',
      unknown: 'Unknown'
    },

    // Navigation and headers
    navigation: {
      dashboard: 'Dashboard',
      analytics: 'Analytics',
      transactions: 'Transactions',
      reports: 'Reports',
      settings: 'Settings',
      selectDataSource: 'Select Data Source',
      chooseDataMethod: 'Choose how to get data for financial analytics'
    },

    // Data sources
    dataSources: {
      csvUpload: 'CSV File Upload',
      csvDescription: 'Provider data analysis from CSV file',
      platformAPI: 'Platform API',
      platformDescription: 'Get real-time data via collector API',
      enhancedAPI: 'Enhanced API 🚀',
      enhancedDescription: 'New collector features: cryptocurrencies, card information',
      features: {
        detailedAnalysis: 'Detailed transaction analysis',
        largeFileSupport: 'Large file support',
        historicalAnalytics: 'Historical analytics',
        providerData: 'Provider data',
        realTimeInfo: 'Real-time information',
        projectFiltering: 'Project filtering',
        liveData: 'Live data',
        platformData: 'Platform data',
        cryptoSupport: 'Cryptocurrency support',
        cardInfo: 'Detailed card information',
        currencyRates: 'Currency rates',
        secureData: '3D Secure data',
        geolocation: 'IP geolocation'
      }
    },

    // Metrics
    metrics: {
      keyMetrics: 'Key Metrics',
      totalOperations: 'Total Operations',
      totalRevenue: 'Total Revenue',
      totalAmount: 'Total Amount',
      averageAmount: 'Average Amount',
      successfulOperations: 'Successful Operations',
      failedOperations: 'Failed Operations',
      conversionRate: 'Conversion Rate',
      actualData: 'Live Data',
      efficiency: 'Efficiency',
      mainCurrency: 'Main Currency',
      multiCurrency: 'currencies',
      seeBelowDetails: 'See detailed breakdown below',
      allOperations: 'Across all operations',
      mainIndicators: 'Main indicators for',
      // Main operation statuses
      successful: 'Successful',
      failed: 'Failed',
      pending: 'Pending',
      canceled: 'Canceled',
      // Subtitles and descriptions
      conversionText: 'conversion',
      rejectionsText: 'rejections',
      inProcessing: 'processing',
      canceledText: 'canceled',
      // Revenue descriptions
      totalRevenueAllCurrencies: 'Total Revenue (all currencies)',
      totalAmountAllCurrencies: 'Total Amount (all currencies)',
      lostRevenue: 'Lost Revenue',
      successfulOnly: 'Successful operations only',
      failedAndCanceled: 'Failed and canceled',
      allOperationsText: 'All operations',
      // Commissions
      commissions: 'Commissions',
      totalCommissions: 'Total commissions',
      // Additional texts for EnhancedDataTable
      sumsBycurrencies: 'Sums by currencies',
      successfulSum: 'Successful sum',
      inProcessOrError: 'Processing/Error',
      total: 'total'
    },

    // Breakdowns
    breakdowns: {
      currencyBreakdown: 'Currency Breakdown',
      merchantBreakdown: 'Merchant Breakdown',
      operationTypes: 'Operation Types',
      depositsAndWithdraws: 'Deposits and Withdrawals',
      usdSummary: 'USD Summary',
      unifiedCurrency: 'Unified Currency',
      depositsVsWithdraws: 'Deposits vs Withdrawals',
      inUSD: 'In USD',
      // Details
      operations: 'Operations',
      successful: 'Successful',
      amount: 'Amount',
      revenue: 'Revenue',
      share: 'Share',
      totalAmount: 'Total Amount',
      successfulRevenue: 'Successful Revenue',
      averageAmount: 'Average Amount',
      pieces: 'pcs',
      currencies: 'Currencies',
      topCompanies: 'Top Companies',
      paymentMethods: 'Payment Methods',
      // Enhanced headers
      mainStats: 'Main Statistics',
      operationsBreakdown: 'Operations Breakdown',
      financialMetrics: 'Financial Metrics'
    },

    // Operations
    operations: {
      deposit: 'Deposit',
      withdraw: 'Withdrawal',
      deposits: 'Deposits',
      withdraws: 'Withdrawals',
      depositType: 'Deposit',
      withdrawType: 'Withdrawal',
      unknown: 'Unknown'
    },

    // Statuses
    statuses: {
      completed: 'Completed',
      success: 'Success',
      failed: 'Failed',
      pending: 'Pending',
      canceled: 'Canceled',
      inProcess: 'In Process'
    },

    // Filters
    filters: {
      allProjects: 'All Projects',
      selectProject: 'Select Project',
      dateRange: 'Date Range',
      status: 'Status',
      currency: 'Currency',
      search: 'Search',
      apply: 'Apply',
      reset: 'Reset',
      project: 'Project',
      paymentType: 'Payment Type',
      dateMode: 'Date Mode',
      recordCount: 'Record Count',
      advancedFilters: 'Advanced Filters',
      loadData: 'Load Data',
      backToSource: 'Back to Source Selection',
      interfaceCapabilities: 'Interface Capabilities',
      enhancedAnalytics: 'Enhanced Analytics',
      convenientFiltering: 'Convenient Filtering'
    },

    // Providers/Merchants
    providers: {
      monetix: 'Monetix',
      caroussel: 'Caroussel',
      paylab: 'Paylab',
      unknown: 'Unknown'
    },

    // Tables and data
    table: {
      search: 'Search',
      export: 'Export',
      results: 'results',
      operations: 'operations',
      noData: 'No data',
      details: 'Details',
      searchPlaceholder: 'Search by ID, status, project, user...',
      searchPlaceholderShort: 'Search...',
      noDataFiltered: 'No data matching filters',
      noDataDisplay: 'No data to display',
      enhancedApiAnalysis: 'Enhanced API Analysis',
      operationsData: 'Operations Data',
      platformDataMulticurrency: 'Platform data with multi-currency support',
      cryptoSupport: 'Cryptocurrency and detailed information support'
    },

    // Table columns
    columns: {
      status: 'Status',
      amount: 'Amount',
      createdAt: 'Created At',
      method: 'Method',
      currency: 'Currency',
      paymentMethod: 'Payment Method',
      company: 'Company',
      provider: 'Provider'
    },

    // Charts and analytics
    charts: {
      volume: 'Volume',
      quantity: 'Quantity',
      transactions: 'Transactions',
      conversion: 'Conversion (%)',
      totalVolume: 'Total Volume',
      successful: 'Successful',
      conversionRate: 'Conversion',
      averageCheck: 'Average Check',
      onOperation: 'Per Operation',
      totalConversion: 'Total Conversion',
      deposits: 'Deposits',
      withdrawals: 'Withdrawals',
      interactive: 'Interactive charts and live statistics',
      revenue: 'Revenue',
      peaks: 'Peaks'
    },

    // Weekdays
    weekdays: {
      sunday: 'Sunday',
      monday: 'Monday',
      tuesday: 'Tuesday', 
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday'
    },

    // Short weekdays
    weekdaysShort: {
      sun: 'Sun',
      mon: 'Mon',
      tue: 'Tue',
      wed: 'Wed', 
      thu: 'Thu',
      fri: 'Fri',
      sat: 'Sat'
    },

    // Timezones and cities
    timezones: {
      moscow: 'Moscow (MSK)',
      istanbul: 'Istanbul (TRT)',
      london: 'London (GMT)',
      berlin: 'Berlin (CET)',
      dubai: 'Dubai (GST)',
      tokyo: 'Tokyo (JST)',
      newYork: 'New York (EST)',
      losAngeles: 'Los Angeles (PST)'
    },

    // Time periods
    timePeriods: {
      allTime: 'All Time',
      twentyFourHours: '24 Hours',
      sevenDays: '7 Days'
    },

    // Risk analytics and recommendations
    analytics: {
      seasonality: 'Seasonality',
      competition: 'Competition',
      technicalIssues: 'Technical Issues',
      conversionOptimization: 'Conversion Optimization',
      conversionOptimizationDesc: 'Improve operation completion process',
      failedOperationsAnalysis: 'Failed Operations Analysis', 
      failedOperationsDesc: 'Identify and eliminate failure causes',
      anomalyMonitoring: 'Anomaly Monitoring',
      anomalyMonitoringDesc: 'Set up early warning system',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      noLimits: 'No Limits',
      providerExportTip: 'Not sure about the source? Select "Provider Export" for new formats with extended fields'
    },

    // Company summary
    companies: {
      topCompanies: 'Top Companies',
      paymentMethods: 'Payment Methods'
    },

    // API sections
    api: {
      enhancedAPI: 'Enhanced API',
      basicAPI: 'Basic API',
      dataSource: 'Data Source'
    },

    // Languages
    languages: {
      russian: 'Русский',
      english: 'English',
      switchLanguage: 'Switch Language'
    }
  }
}

// Класс для управления переводами
class I18nService {
  constructor() {
    this.currentLanguage = this.getInitialLanguage()
    this.listeners = new Set()
  }

  // Получить начальный язык из localStorage или по умолчанию русский
  getInitialLanguage() {
    const saved = localStorage.getItem('app-language')
    if (saved && (saved === 'ru' || saved === 'en')) {
      return saved
    }
    
    // Автоопределение языка браузера
    const browserLang = navigator.language.toLowerCase()
    if (browserLang.startsWith('ru')) {
      return 'ru'
    }
    return 'en' // По умолчанию английский
  }

  // Получить текущий язык
  getCurrentLanguage() {
    return this.currentLanguage
  }

  // Установить язык
  setLanguage(language) {
    if (language !== 'ru' && language !== 'en') {
      console.warn('Unsupported language:', language)
      return false
    }

    this.currentLanguage = language
    localStorage.setItem('app-language', language)
    
    // Уведомить всех слушателей об изменении языка
    this.listeners.forEach(listener => listener(language))
    
    console.log(`🌐 Язык изменен на: ${language === 'ru' ? 'Русский' : 'English'}`)
    return true
  }

  // Подписаться на изменения языка
  subscribe(callback) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  // Получить перевод по ключу
  t(path, fallback = '') {
    const keys = path.split('.')
    let value = translations[this.currentLanguage]

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key]
      } else {
        // Попробуем в другом языке как fallback
        const fallbackLang = this.currentLanguage === 'ru' ? 'en' : 'ru'
        let fallbackValue = translations[fallbackLang]
        
        for (const fallbackKey of keys) {
          if (fallbackValue && typeof fallbackValue === 'object' && fallbackKey in fallbackValue) {
            fallbackValue = fallbackValue[fallbackKey]
          } else {
            fallbackValue = null
            break
          }
        }
        
        if (fallbackValue && typeof fallbackValue === 'string') {
          console.warn(`⚠️ Missing translation for "${path}" in ${this.currentLanguage}, using ${fallbackLang}`)
          return fallbackValue
        }
        
        console.warn(`⚠️ Missing translation for "${path}" in both languages`)
        return fallback || path
      }
    }

    return typeof value === 'string' ? value : (fallback || path)
  }

  // Получить все языки
  getAvailableLanguages() {
    return [
      { code: 'ru', name: 'Русский', flag: '🇷🇺' },
      { code: 'en', name: 'English', flag: '🇺🇸' }
    ]
  }

  // Переключить язык
  toggleLanguage() {
    const newLanguage = this.currentLanguage === 'ru' ? 'en' : 'ru'
    return this.setLanguage(newLanguage)
  }

  // Проверить поддерживается ли язык
  isLanguageSupported(language) {
    return language === 'ru' || language === 'en'
  }

  // Получить направление текста для языка
  getTextDirection(language = this.currentLanguage) {
    return 'ltr' // Все поддерживаемые языки слева направо
  }

  // Получить локаль для форматирования
  getLocale(language = this.currentLanguage) {
    return language === 'ru' ? 'ru-RU' : 'en-US'
  }
}

// Создаем единственный экземпляр сервиса
const i18n = new I18nService()

// Экспортируем функции для удобства
export const t = (path, fallback) => i18n.t(path, fallback)
export const getCurrentLanguage = () => i18n.getCurrentLanguage()
export const setLanguage = (language) => i18n.setLanguage(language)
export const toggleLanguage = () => i18n.toggleLanguage()
export const subscribe = (callback) => i18n.subscribe(callback)
export const getAvailableLanguages = () => i18n.getAvailableLanguages()
export const getLocale = () => i18n.getLocale()

export default i18n