export function calculateMetrics(data, dataType = 'merchant') {
  console.log('Calculating metrics for data:', data.length, 'rows, type:', dataType)
  
  const total = data.length
  const successful = data.filter(row => {
    const status = row.status ? row.status.toLowerCase() : ''
    return dataType === 'merchant' ? status === 'completed' : status === 'success'
  }).length
  
  const failed = data.filter(row => {
    const status = row.status ? row.status.toLowerCase() : ''
    return dataType === 'merchant' ? status === 'failed' : status === 'fail'
  }).length
  
  const canceled = data.filter(row => {
    const status = row.status ? row.status.toLowerCase() : ''
    return dataType === 'merchant' ? status === 'canceled' : false
  }).length

  // Анализ по типам транзакций
  const deposits = data.filter(row => row.isDeposit)
  const withdrawals = data.filter(row => row.isWithdraw)
  
  const depositMetrics = {
    total: deposits.length,
    successful: deposits.filter(row => {
      const status = row.status ? row.status.toLowerCase() : ''
      return dataType === 'merchant' ? status === 'completed' : status === 'success'
    }).length,
    amount: deposits.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0)
  }
  
  const withdrawalMetrics = {
    total: withdrawals.length,
    successful: withdrawals.filter(row => {
      const status = row.status ? row.status.toLowerCase() : ''
      return dataType === 'merchant' ? status === 'completed' : status === 'success'
    }).length,
    amount: withdrawals.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0)
  }
  
  console.log('Status breakdown:', { total, successful, failed, canceled })
  
  // Проверим несколько строк для отладки
  console.log('First 3 rows status check:', data.slice(0, 3).map(row => ({
    status: row.status,
    normalizedStatus: row.status ? row.status.toLowerCase() : '',
    isCompleted: dataType === 'merchant' ? 
      (row.status ? row.status.toLowerCase() === 'completed' : false) :
      (row.status ? row.status.toLowerCase() === 'success' : false)
  })))
  
  const conversionRate = total > 0 ? (successful / total) * 100 : 0
  
  const successfulRevenue = data
    .filter(row => {
      const status = row.status ? row.status.toLowerCase() : ''
      return dataType === 'merchant' ? status === 'completed' : status === 'success'
    })
    .reduce((sum, row) => {
      const amount = parseFloat(row.amount) || 0
      return sum + amount
    }, 0)
  
  const totalAmount = data.reduce((sum, row) => {
    const amount = parseFloat(row.amount) || 0
    return sum + amount
  }, 0)
  
  const lostRevenue = data
    .filter(row => {
      const status = row.status ? row.status.toLowerCase() : ''
      if (dataType === 'merchant') {
        return status === 'failed' || status === 'canceled'
      } else {
        return status === 'fail'
      }
    })
    .reduce((sum, row) => {
      const amount = parseFloat(row.amount) || 0
      return sum + amount
    }, 0)
  
  const totalFees = data.reduce((sum, row) => {
    const fee = parseFloat(row.fee) || 0
    return sum + fee
  }, 0)
  
  const averageAmount = total > 0 ? totalAmount / total : 0
  
  const amounts = data.map(row => parseFloat(row.amount) || 0)
  const maxAmount = amounts.length > 0 ? Math.max(...amounts) : 0
  const minAmount = amounts.length > 0 ? Math.min(...amounts) : 0
  
  // Анализ по компаниям (только для провайдера)
  const companyStats = {}
  if (dataType === 'merchant') {
    data.forEach(row => {
      const company = row.company || 'Unknown'
      if (!companyStats[company]) {
        companyStats[company] = { total: 0, completed: 0, failed: 0, canceled: 0, revenue: 0 }
      }
      companyStats[company].total++
      companyStats[company].revenue += parseFloat(row.amount) || 0
      
      const status = row.status ? row.status.toLowerCase() : ''
      if (status === 'completed') companyStats[company].completed++
      else if (status === 'failed') companyStats[company].failed++
      else if (status === 'canceled') companyStats[company].canceled++
    })
  }
  
  // Анализ по методам оплаты
  const paymentMethodStats = {}
  data.forEach(row => {
    const method = row.paymentMethod || 'Unknown'
    if (!paymentMethodStats[method]) {
      paymentMethodStats[method] = { total: 0, completed: 0, failed: 0, canceled: 0 }
    }
    paymentMethodStats[method].total++
    
    const status = row.status ? row.status.toLowerCase() : ''
    if (dataType === 'merchant') {
      if (status === 'completed') paymentMethodStats[method].completed++
      else if (status === 'failed') paymentMethodStats[method].failed++
      else if (status === 'canceled') paymentMethodStats[method].canceled++
    } else {
      if (status === 'success') paymentMethodStats[method].completed++
      else if (status === 'fail') paymentMethodStats[method].failed++
    }
  })
  
  const metrics = {
    total,
    successful,
    failed,
    canceled,
    conversionRate,
    successfulRevenue,
    lostRevenue,
    totalAmount,
    totalFees,
    averageAmount,
    maxAmount,
    minAmount,
    companyStats,
    paymentMethodStats,
    depositMetrics,
    withdrawalMetrics,
    dataType
  }
  
  console.log('Calculated metrics:', metrics)
  
  return metrics
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