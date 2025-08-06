// Утилиты для работы с часовыми поясами в Enhanced API

/**
 * Получить часовой пояс пользователя
 * @returns {string} Название часового пояса (например, 'Europe/Moscow')
 */
export function getUserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch (error) {
    console.warn('Failed to detect user timezone, using UTC:', error)
    return 'UTC'
  }
}

/**
 * Получить смещение часового пояса пользователя в минутах
 * @returns {number} Смещение в минутах относительно UTC
 */
export function getTimezoneOffset() {
  return new Date().getTimezoneOffset()
}

/**
 * Конвертировать UTC время в часовой пояс пользователя
 * @param {string} utcDateString - Дата в формате ISO string (UTC)
 * @param {string} targetTimezone - Целевой часовой пояс (по умолчанию - пользовательский)
 * @returns {Date} Дата в часовом поясе пользователя
 */
export function convertUTCToUserTimezone(utcDateString, targetTimezone = null) {
  if (!utcDateString) return null
  
  try {
    const utcDate = new Date(utcDateString)
    if (isNaN(utcDate.getTime())) {
      console.warn('Invalid date string:', utcDateString)
      return null
    }
    
    const timezone = targetTimezone || getUserTimezone()
    
    // Создаем новый объект Date с учетом часового пояса
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
    
    const parts = formatter.formatToParts(utcDate)
    const dateParts = {}
    parts.forEach(part => {
      dateParts[part.type] = part.value
    })
    
    // Создаем дату в локальном времени
    const localDate = new Date(
      `${dateParts.year}-${dateParts.month}-${dateParts.day}T${dateParts.hour}:${dateParts.minute}:${dateParts.second}`
    )
    
    return localDate
  } catch (error) {
    console.error('Error converting UTC to user timezone:', error)
    return new Date(utcDateString) // Fallback к обычному парсингу
  }
}

/**
 * Форматировать дату с учетом часового пояса пользователя
 * @param {string} utcDateString - Дата в формате UTC
 * @param {object} options - Опции форматирования
 * @returns {string} Отформатированная дата
 */
export function formatDateInUserTimezone(utcDateString, options = {}) {
  if (!utcDateString) return ''
  
  const defaultOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'short'
  }
  
  const formatOptions = { ...defaultOptions, ...options }
  const timezone = getUserTimezone()
  
  try {
    const date = new Date(utcDateString)
    if (isNaN(date.getTime())) {
      console.warn('Invalid date for formatting:', utcDateString)
      return utcDateString
    }
    
    return new Intl.DateTimeFormat('ru-RU', {
      ...formatOptions,
      timeZone: timezone
    }).format(date)
  } catch (error) {
    console.error('Error formatting date:', error)
    return utcDateString
  }
}

/**
 * Получить дату начала дня в часовом поясе пользователя в UTC формате
 * @param {Date} date - Дата
 * @returns {string} ISO string начала дня в UTC
 */
export function getStartOfDayInUTC(date) {
  const timezone = getUserTimezone()
  
  try {
    // Получаем начало дня в пользовательском часовом поясе
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    // Конвертируем обратно в UTC для API запроса
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    
    const localDateString = formatter.format(startOfDay)
    const utcStartOfDay = new Date(`${localDateString}T00:00:00.000Z`)
    
    // Корректируем на разницу часовых поясов
    const offsetMinutes = getTimezoneOffset()
    utcStartOfDay.setMinutes(utcStartOfDay.getMinutes() + offsetMinutes)
    
    return utcStartOfDay.toISOString()
  } catch (error) {
    console.error('Error getting start of day in UTC:', error)
    return date.toISOString()
  }
}

/**
 * Получить дату конца дня в часовом поясе пользователя в UTC формате
 * @param {Date} date - Дата
 * @returns {string} ISO string конца дня в UTC
 */
export function getEndOfDayInUTC(date) {
  const timezone = getUserTimezone()
  
  try {
    // Получаем конец дня в пользовательском часовом поясе
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)
    
    // Конвертируем обратно в UTC для API запроса
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    
    const localDateString = formatter.format(endOfDay)
    const utcEndOfDay = new Date(`${localDateString}T23:59:59.999Z`)
    
    // Корректируем на разницу часовых поясов
    const offsetMinutes = getTimezoneOffset()
    utcEndOfDay.setMinutes(utcEndOfDay.getMinutes() + offsetMinutes)
    
    return utcEndOfDay.toISOString()
  } catch (error) {
    console.error('Error getting end of day in UTC:', error)
    return date.toISOString()
  }
}

/**
 * Получить информацию о часовом поясе пользователя
 * @returns {object} Информация о часовом поясе
 */
export function getTimezoneInfo() {
  const timezone = getUserTimezone()
  const offset = getTimezoneOffset()
  const offsetHours = Math.abs(offset) / 60
  const offsetSign = offset <= 0 ? '+' : '-'
  const offsetFormatted = `GMT${offsetSign}${Math.floor(offsetHours)}:${String(Math.abs(offset) % 60).padStart(2, '0')}`
  
  return {
    timezone,
    offset,
    offsetFormatted,
    name: timezone.replace('_', ' ')
  }
}

/**
 * Группировать транзакции по дням в часовом поясе пользователя
 * @param {Array} transactions - Массив транзакций
 * @param {string} dateField - Поле с датой (по умолчанию 'createdAt')
 * @returns {object} Объект с группировкой по дням
 */
export function groupTransactionsByDay(transactions, dateField = 'createdAt') {
  const timezone = getUserTimezone()
  const grouped = {}
  
  transactions.forEach(transaction => {
    const utcDate = transaction[dateField]
    if (!utcDate) return
    
    try {
      const date = new Date(utcDate)
      const dayKey = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date)
      
      if (!grouped[dayKey]) {
        grouped[dayKey] = []
      }
      
      grouped[dayKey].push({
        ...transaction,
        localDate: formatDateInUserTimezone(utcDate),
        localTime: formatDateInUserTimezone(utcDate, {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      })
    } catch (error) {
      console.warn('Error grouping transaction by day:', error, transaction)
    }
  })
  
  return grouped
}

/**
 * Получить список популярных часовых поясов для селектора
 * @returns {Array} Массив часовых поясов
 */
export function getPopularTimezones() {
  return [
    { value: 'UTC', label: 'UTC (Greenwich Mean Time)', offset: '+00:00' },
    { value: 'Europe/Moscow', label: 'Москва (MSK)', offset: '+03:00' },
    { value: 'Europe/Kiev', label: 'Киев (EET)', offset: '+02:00' },
    { value: 'Europe/Minsk', label: 'Минск (MSK)', offset: '+03:00' },
    { value: 'Asia/Almaty', label: 'Алматы (ALMT)', offset: '+06:00' },
    { value: 'Asia/Tashkent', label: 'Ташкент (UZT)', offset: '+05:00' },
    { value: 'Europe/Istanbul', label: 'Стамбул (TRT)', offset: '+03:00' },
    { value: 'Asia/Dubai', label: 'Дубай (GST)', offset: '+04:00' },
    { value: 'Asia/Kolkata', label: 'Дели (IST)', offset: '+05:30' },
    { value: 'Europe/London', label: 'Лондон (GMT)', offset: '+00:00' },
    { value: 'Europe/Berlin', label: 'Берлин (CET)', offset: '+01:00' },
    { value: 'America/New_York', label: 'Нью-Йорк (EST)', offset: '-05:00' }
  ]
}

/**
 * Проверить, нужно ли показывать предупреждение о часовом поясе
 * @param {Array} transactions - Массив транзакций
 * @returns {boolean} true, если есть транзакции за последние 24 часа
 */
export function shouldShowTimezoneWarning(transactions) {
  if (!transactions || transactions.length === 0) return false
  
  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  
  return transactions.some(transaction => {
    const transactionDate = new Date(transaction.createdAt || transaction.operation_created_at)
    return transactionDate > yesterday
  })
}

// Экспорт по умолчанию
export default {
  getUserTimezone,
  getTimezoneOffset,
  convertUTCToUserTimezone,
  formatDateInUserTimezone,
  getStartOfDayInUTC,
  getEndOfDayInUTC,
  getTimezoneInfo,
  groupTransactionsByDay,
  getPopularTimezones,
  shouldShowTimezoneWarning
}