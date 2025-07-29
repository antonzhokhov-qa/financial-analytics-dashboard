// Функция расчета метрик с поддержкой провайдеров
export const calculateMetrics = (data, dataTypeOrProvider = 'merchant') => {
  if (!data || data.length === 0) return null

  console.log('📊 Расчет метрик для данных:', {
    length: data.length,
    providerOrType: dataTypeOrProvider,
    sampleData: data.slice(0, 2)
  })

  // Определяем провайдера и валюту
  let provider = null
  let currency = 'TRY' // По умолчанию
  
  // Автоматическое определение валюты из реальных данных
  const currencyStats = {}
  data.forEach(item => {
    if (item.currency) {
      currencyStats[item.currency] = (currencyStats[item.currency] || 0) + 1
    }
  })
  
  // Выбираем наиболее часто встречающуюся валюту
  if (Object.keys(currencyStats).length > 0) {
    currency = Object.keys(currencyStats).reduce((a, b) => 
      currencyStats[a] > currencyStats[b] ? a : b
    )
  }

  // Пытаемся определить провайдера из данных или параметра
  if (dataTypeOrProvider === 'paylab' || data.some(item => item.provider === 'paylab' || item.company === 'paylab' || item.project === 'paylab')) {
    provider = 'paylab'
    // Если валюта не определена из данных, используем EUR как дефолт для Paylab
    if (!Object.keys(currencyStats).length) currency = 'EUR'
  } else if (dataTypeOrProvider === 'payshack' || data.some(item => item.provider === 'payshack')) {
    provider = 'payshack'
    if (!Object.keys(currencyStats).length) currency = 'INR'
  } else if (dataTypeOrProvider === 'optipay' || data.some(item => item.provider === 'optipay')) {
    provider = 'optipay' 
    if (!Object.keys(currencyStats).length) currency = 'TRY'
  } else if (data.some(item => item.currency)) {
    // Извлекаем валюту из первого элемента с валютой
    const itemWithCurrency = data.find(item => item.currency)
    currency = itemWithCurrency.currency
    
    // Пытаемся определить провайдера по валюте
    if (currency === 'INR') provider = 'payshack'
    else if (currency === 'TRY') provider = 'optipay'
    else if (currency === 'EUR' || currency === 'USD') provider = 'paylab'
  }

  console.log('💰 Определены: провайдер =', provider, ', валюта =', currency)

  const total = data.length

  // Функции для определения статусов в зависимости от провайдера
  const isSuccessful = (item) => {
    const status = (item.status || '').toLowerCase()
    if (provider === 'payshack') {
      return status === 'success' || status === 'completed'
    } else {
      return item.isCompleted || status === 'completed' || status === 'success'
    }
  }

  const isFailed = (item) => {
    const status = (item.status || '').toLowerCase()
    if (provider === 'payshack') {
      return status === 'failed' || status === 'cancelled'
    } else {
      return item.isFailed || status === 'failed' || status === 'canceled'
    }
  }

  const isPending = (item) => {
    const status = (item.status || '').toLowerCase()
    if (provider === 'payshack') {
      return status === 'initiated' || status === 'pending'
    } else {
      return item.isPending || status === 'in progress' || status === 'pending'
    }
  }

  const isCanceled = (item) => {
    const status = (item.status || '').toLowerCase()
    return status === 'canceled' || status === 'cancelled'
  }

  // Основные метрики
  const successful = data.filter(isSuccessful).length
  const failed = data.filter(isFailed).length  
  const pending = data.filter(isPending).length
  const canceled = data.filter(isCanceled).length

  const conversionRate = total > 0 ? (successful / total) * 100 : 0

  // Расчет выручки
  const successfulRevenue = data.filter(isSuccessful)
    .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
  
  const lostRevenue = data.filter(item => isFailed(item) || isCanceled(item))
    .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
  
  const totalAmount = data.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
  const averageAmount = total > 0 ? totalAmount / total : 0

  // Комиссии (если есть в данных)
  const totalFees = data.reduce((sum, item) => sum + (parseFloat(item.fees || item.fee || 0)), 0)

  // Анализ по методам оплаты
  const paymentMethodStats = {}
  data.forEach(item => {
    const method = item.paymentMethod || item.paymentMethodCode || item.paymentProduct || 'Unknown'
    if (!paymentMethodStats[method]) {
      paymentMethodStats[method] = { total: 0, successful: 0, failed: 0, pending: 0, revenue: 0, completed: 0 }
    }
    
    paymentMethodStats[method].total++
    paymentMethodStats[method].revenue += parseFloat(item.amount) || 0
    
    if (isSuccessful(item)) {
      paymentMethodStats[method].successful++
      paymentMethodStats[method].completed++
    } else if (isFailed(item)) {
      paymentMethodStats[method].failed++
    } else if (isPending(item)) {
      paymentMethodStats[method].pending++
    }
  })

  // Анализ по компаниям (только для providerов с компаниями)
  const companyStats = {}
  if (provider === 'optipay') {
    data.forEach(item => {
      const company = item.company || item.project || 'Unknown'
      if (!companyStats[company]) {
        companyStats[company] = { total: 0, successful: 0, failed: 0, pending: 0, revenue: 0, completed: 0 }
      }
      
      companyStats[company].total++
      companyStats[company].revenue += parseFloat(item.amount) || 0
      
      if (isSuccessful(item)) {
        companyStats[company].successful++
        companyStats[company].completed++
      } else if (isFailed(item)) {
        companyStats[company].failed++
      } else if (isPending(item)) {
        companyStats[company].pending++
      }
    })
  }

  const result = {
    total,
    successful,
    failed,
    pending,
    canceled,
    conversionRate,
    successfulRevenue,
    lostRevenue,
    totalAmount,
    totalRevenue: totalAmount,
    averageAmount,
    totalFees,
    paymentMethodStats,
    companyStats,
    provider,
    currency,
    // Для совместимости со старым кодом
    completed: successful
  }

  console.log('✅ Метрики рассчитаны:', {
    total: result.total,
    successful: result.successful,
    conversionRate: result.conversionRate.toFixed(2) + '%',
    currency: result.currency,
    provider: result.provider,
    revenue: result.successfulRevenue
  })

  return result
}

export function generateInsights(data, metrics) {
  const insights = []
  const { dataType } = metrics
  
  if (metrics.conversionRate < 50) {
    insights.push({
      type: 'warning',
      icon: '⚠️',
      text: `Низкая конверсия: ${metrics.conversionRate.toFixed(1)}%. Требуется анализ причин отказов.`
    })
  } else if (metrics.conversionRate > 80) {
    insights.push({
      type: 'success',
      icon: '🎉',
      text: `Отличная конверсия: ${metrics.conversionRate.toFixed(1)}%. Система работает эффективно.`
    })
  }
  
  // Анализ отмененных операций (только для провайдера)
  if (dataType === 'merchant' && metrics.canceled > 0) {
    const cancelRate = (metrics.canceled / metrics.total) * 100
    insights.push({
      type: 'info',
      icon: '⏸️',
      text: `${metrics.canceled} отмененных операций (${cancelRate.toFixed(1)}%). Возможно, стоит улучшить UX.`
    })
  }
  
  // Анализ по компаниям (только для провайдера)
  if (dataType === 'merchant' && Object.keys(metrics.companyStats).length > 0) {
    const topCompany = Object.entries(metrics.companyStats)
      .sort(([,a], [,b]) => b.revenue - a.revenue)[0]
    
    if (topCompany) {
      insights.push({
        type: 'info',
        icon: '🏢',
        text: `Топ компания: ${topCompany[0]} с выручкой ${topCompany[1].revenue.toLocaleString('tr-TR')} TRY`
      })
    }
  }
  
  // Анализ методов оплаты
  const topMethod = Object.entries(metrics.paymentMethodStats)
    .sort(([,a], [,b]) => b.total - a.total)[0]
  
  if (topMethod) {
    const methodConversion = (topMethod[1].completed / topMethod[1].total) * 100
    insights.push({
      type: 'info',
      icon: '💳',
      text: `Популярный метод: ${topMethod[0]} (${methodConversion.toFixed(1)}% конверсия)`
    })
  }
  
  const highValueOperations = data.filter(row => parseFloat(row.amount) > metrics.averageAmount * 2).length
  if (highValueOperations > 0) {
    insights.push({
      type: 'info',
      icon: '💎',
      text: `${highValueOperations} операций с высокой стоимостью (>${(metrics.averageAmount * 2).toLocaleString('tr-TR', {maximumFractionDigits: 0})} TRY).`
    })
  }
  
  insights.push({
    type: 'info',
    icon: '💰',
    text: `Общая выручка: ${metrics.successfulRevenue.toLocaleString('tr-TR')} TRY, комиссии: ${metrics.totalFees.toLocaleString('tr-TR')} TRY`
  })
  
  return insights
}

export function getAmountRanges(data) {
  const ranges = {
    '0-500': 0,
    '501-1000': 0,
    '1001-2000': 0,
    '2001-5000': 0,
    '5000+': 0
  }
  
  data.forEach(row => {
    const amount = parseFloat(row.amount) || 0
    if (amount <= 500) ranges['0-500']++
    else if (amount <= 1000) ranges['501-1000']++
    else if (amount <= 2000) ranges['1001-2000']++
    else if (amount <= 5000) ranges['2001-5000']++
    else ranges['5000+']++
  })
  
  return ranges
}

export function getConversionByAmount(data, dataType = 'merchant') {
  const ranges = [
    { label: '0-500', min: 0, max: 500 },
    { label: '501-1000', min: 501, max: 1000 },
    { label: '1001-2000', min: 1001, max: 2000 },
    { label: '2001-5000', min: 2001, max: 5000 },
    { label: '5000+', min: 5001, max: Infinity }
  ]
  
  return ranges.map(range => {
    const rangeData = data.filter(row => {
      const amount = parseFloat(row.amount) || 0
      return amount >= range.min && amount <= range.max
    })
    
    const total = rangeData.length
    const successful = rangeData.filter(row => {
      const status = row.status ? row.status.toLowerCase() : ''
      return dataType === 'merchant' ? status === 'completed' : status === 'success'
    }).length
    
    return {
      range: range.label,
      total,
      successful,
      conversion: total > 0 ? (successful / total) * 100 : 0
    }
  })
}

export function getTopAmounts(data, limit = 10) {
  const amounts = data.map(row => parseFloat(row.amount) || 0)
  return amounts.sort((a, b) => b - a).slice(0, limit)
}

export function getStatusDistribution(data, dataType = 'merchant') {
  const statuses = {}
  data.forEach(row => {
    const status = row.status || 'unknown'
    statuses[status] = (statuses[status] || 0) + 1
  })
  return statuses
}

export function getCompanyDistribution(data) {
  const companies = {}
  data.forEach(row => {
    const company = row.company || 'Unknown'
    companies[company] = (companies[company] || 0) + 1
  })
  return companies
}

export function getPaymentMethodDistribution(data) {
  const methods = {}
  data.forEach(row => {
    const method = row.paymentMethod || 'Unknown'
    methods[method] = (methods[method] || 0) + 1
  })
  return methods
}

export function getTimeSeriesData(data) {
  // Группировка данных по времени
  const timeGroups = {}
  
  data.forEach(row => {
    let date
    if (row.createdAt) {
      // Парсим дату создания
      const dateStr = row.createdAt.split(' ')[0] // Берем только дату
      date = dateStr
    } else {
      // Если нет даты создания, используем текущую дату
      date = new Date().toISOString().split('T')[0]
    }
    
    if (!timeGroups[date]) {
      timeGroups[date] = { total: 0, completed: 0, failed: 0, canceled: 0, revenue: 0 }
    }
    
    timeGroups[date].total++
    timeGroups[date].revenue += parseFloat(row.amount) || 0
    
    const status = row.status ? row.status.toLowerCase() : ''
    if (status === 'completed' || status === 'success') {
      timeGroups[date].completed++
    } else if (status === 'failed' || status === 'fail') {
      timeGroups[date].failed++
    } else if (status === 'canceled') {
      timeGroups[date].canceled++
    }
  })
  
  return Object.entries(timeGroups).map(([date, stats]) => ({
    date,
    ...stats,
    conversionRate: (stats.completed / stats.total) * 100
  }))
}

export function getTopUsers(data, limit = 10) {
  const userStats = {}
  
  data.forEach(row => {
    const userId = row.userId || 'Unknown'
    const userName = row.userName || row.fullName || 'Unknown'
    
    if (!userStats[userId]) {
      userStats[userId] = {
        id: userId,
        name: userName,
        total: 0,
        completed: 0,
        failed: 0,
        canceled: 0,
        totalAmount: 0
      }
    }
    
    userStats[userId].total++
    userStats[userId].totalAmount += parseFloat(row.amount) || 0
    
    const status = row.status ? row.status.toLowerCase() : ''
    if (status === 'completed' || status === 'success') userStats[userId].completed++
    else if (status === 'failed' || status === 'fail') userStats[userId].failed++
    else if (status === 'canceled') userStats[userId].canceled++
  })
  
  return Object.values(userStats)
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, limit)
}

export function detectAnomalies(data) {
  const anomalies = []
  
  // Аномалии по суммам
  const amounts = data.map(row => parseFloat(row.amount) || 0)
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length
  const std = Math.sqrt(amounts.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / amounts.length)
  
  data.forEach((row, index) => {
    const amount = parseFloat(row.amount) || 0
    if (amount > mean + 2 * std) {
      anomalies.push({
        type: 'high_amount',
        row: index + 1,
        value: amount,
        description: `Необычно высокая сумма: ${amount.toLocaleString('ru-RU')}`
      })
    }
  })
  
  // Аномалии по времени обработки
  data.forEach((row, index) => {
    if (row.createdAt && row.processedAt) {
      const created = new Date(row.createdAt)
      const processed = new Date(row.processedAt)
      const processingTime = processed - created
      
      // Если обработка заняла больше 30 минут
      if (processingTime > 30 * 60 * 1000) {
        anomalies.push({
          type: 'slow_processing',
          row: index + 1,
          value: processingTime / (60 * 1000),
          description: `Медленная обработка: ${Math.round(processingTime / (60 * 1000))} минут`
        })
      }
    }
  })
  
  return anomalies
} 

// Расширенная функция расчета метрик для Enhanced API с поддержкой мультивалютности
export const calculateEnhancedMetrics = (data, dataSource = 'enhanced-api') => {
  if (!data || data.length === 0) return null

  console.log('🚀 Расчет расширенных метрик для Enhanced API:', {
    length: data.length,
    dataSource: dataSource,
    sampleData: data.slice(0, 2)
  })

  // Анализ валют в данных
  const currencyBreakdown = {}
  const merchantBreakdown = {}
  
  data.forEach(item => {
    const currency = item.currency || 'UNKNOWN'
    const merchant = item.project || item.company || 'UNKNOWN'
    
    // Анализ по валютам
    if (!currencyBreakdown[currency]) {
      currencyBreakdown[currency] = {
        total: 0,
        successful: 0,
        failed: 0,
        pending: 0,
        totalAmount: 0,
        successfulRevenue: 0,
        lostRevenue: 0,
        merchants: new Set()
      }
    }
    
    const currencyData = currencyBreakdown[currency]
    currencyData.total++
    currencyData.totalAmount += parseFloat(item.amount) || 0
    currencyData.merchants.add(merchant)
    
    if (item.isCompleted) {
      currencyData.successful++
      currencyData.successfulRevenue += parseFloat(item.amount) || 0
    } else if (item.isFailed) {
      currencyData.failed++
      currencyData.lostRevenue += parseFloat(item.amount) || 0
    } else if (item.isInProcess) {
      currencyData.pending++
    }
    
    // Анализ по мерчантам
    if (!merchantBreakdown[merchant]) {
      merchantBreakdown[merchant] = {
        total: 0,
        successful: 0,
        failed: 0,
        pending: 0,
        totalAmount: 0,
        successfulRevenue: 0,
        currencies: new Set()
      }
    }
    
    const merchantData = merchantBreakdown[merchant]
    merchantData.total++
    merchantData.totalAmount += parseFloat(item.amount) || 0
    merchantData.currencies.add(currency)
    
    if (item.isCompleted) {
      merchantData.successful++
      merchantData.successfulRevenue += parseFloat(item.amount) || 0
    } else if (item.isFailed) {
      merchantData.failed++
    } else if (item.isInProcess) {
      merchantData.pending++
    }
  })

  // Основные метрики (общие)
  const total = data.length
  const successful = data.filter(item => item.isCompleted).length
  const failed = data.filter(item => item.isFailed).length
  const pending = data.filter(item => item.isInProcess).length
  const conversionRate = total > 0 ? (successful / total) * 100 : 0

  // Определяем основную валюту (наиболее часто встречающуюся)
  const mainCurrency = Object.keys(currencyBreakdown).reduce((a, b) => 
    currencyBreakdown[a].total > currencyBreakdown[b].total ? a : b
  ) || 'TRY'

  // Общие суммы
  const totalAmount = data.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
  const successfulRevenue = data.filter(item => item.isCompleted)
    .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
  const averageAmount = total > 0 ? totalAmount / total : 0

  console.log('💰 Анализ валют в Enhanced API:', {
    mainCurrency: mainCurrency,
    currenciesFound: Object.keys(currencyBreakdown),
    merchantsFound: Object.keys(merchantBreakdown),
    currencyBreakdown: Object.keys(currencyBreakdown).map(curr => ({
      currency: curr,
      total: currencyBreakdown[curr].total,
      amount: currencyBreakdown[curr].totalAmount.toFixed(2),
      merchants: Array.from(currencyBreakdown[curr].merchants)
    }))
  })

  return {
    // Основные метрики
    total,
    successful,
    failed,
    pending,
    canceled: 0, // В Enhanced API обычно нет отмененных
    conversionRate,
    
    // Финансовые метрики  
    totalAmount,
    successfulRevenue,
    lostRevenue: totalAmount - successfulRevenue,
    averageAmount,
    totalFees: 0, // Пока не обрабатываем комиссии в Enhanced API
    
    // Валюта и тип данных
    currency: mainCurrency,
    dataType: 'enhanced-api',
    provider: 'enhanced-api',
    
    // Расширенная аналитика
    currencyBreakdown: Object.keys(currencyBreakdown).map(currency => ({
      currency,
      ...currencyBreakdown[currency],
      merchants: Array.from(currencyBreakdown[currency].merchants),
      conversionRate: currencyBreakdown[currency].total > 0 
        ? (currencyBreakdown[currency].successful / currencyBreakdown[currency].total * 100).toFixed(2) + '%'
        : '0%'
    })),
    
    merchantBreakdown: Object.keys(merchantBreakdown).map(merchant => ({
      merchant,
      ...merchantBreakdown[merchant],
      currencies: Array.from(merchantBreakdown[merchant].currencies),
      conversionRate: merchantBreakdown[merchant].total > 0
        ? (merchantBreakdown[merchant].successful / merchantBreakdown[merchant].total * 100).toFixed(2) + '%' 
        : '0%'
    })),
    
    // Статистика мультивалютности
    isMultiCurrency: Object.keys(currencyBreakdown).length > 1,
    currencyCount: Object.keys(currencyBreakdown).length,
    merchantCount: Object.keys(merchantBreakdown).length
  }
} 