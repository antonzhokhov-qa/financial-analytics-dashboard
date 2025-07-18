export function calculateMetrics(data) {
  console.log('Calculating metrics for data:', data.length, 'rows')
  
  const total = data.length
  const successful = data.filter(row => {
    const status = row.Status ? row.Status.toLowerCase() : ''
    return status === 'success'
  }).length
  
  const failed = data.filter(row => {
    const status = row.Status ? row.Status.toLowerCase() : ''
    return status === 'fail'
  }).length
  
  console.log('Status breakdown:', { total, successful, failed })
  
  // Проверим несколько строк для отладки
  console.log('First 3 rows status check:', data.slice(0, 3).map(row => ({
    status: row.Status,
    normalizedStatus: row.Status ? row.Status.toLowerCase() : '',
    isSuccess: row.Status ? row.Status.toLowerCase() === 'success' : false
  })))
  
  const conversionRate = total > 0 ? (successful / total) * 100 : 0
  
  const successfulRevenue = data
    .filter(row => {
      const status = row.Status ? row.Status.toLowerCase() : ''
      return status === 'success'
    })
    .reduce((sum, row) => {
      const amount = parseFloat(row['Charged Amount']) || 0
      return sum + amount
    }, 0)
  
  const totalInitialAmount = data.reduce((sum, row) => {
    const amount = parseFloat(row['Initial Amount']) || 0
    return sum + amount
  }, 0)
  
  const lostRevenue = data
    .filter(row => {
      const status = row.Status ? row.Status.toLowerCase() : ''
      return status === 'fail'
    })
    .reduce((sum, row) => {
      const amount = parseFloat(row['Initial Amount']) || 0
      return sum + amount
    }, 0)
  
  const averageAmount = total > 0 ? totalInitialAmount / total : 0
  
  const amounts = data.map(row => parseFloat(row['Initial Amount']) || 0)
  const maxAmount = amounts.length > 0 ? Math.max(...amounts) : 0
  const minAmount = amounts.length > 0 ? Math.min(...amounts) : 0
  
  const metrics = {
    total,
    successful,
    failed,
    conversionRate,
    successfulRevenue,
    lostRevenue,
    averageAmount,
    maxAmount,
    minAmount,
    totalInitialAmount
  }
  
  console.log('Calculated metrics:', metrics)
  
  return metrics
}

export function generateInsights(data, metrics) {
  const insights = []
  
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
  
  // Убираем анализ конверсии по состояниям, так как все операции депозитные
  
  const highValueOperations = data.filter(row => parseFloat(row['Initial Amount']) > metrics.averageAmount * 2).length
  if (highValueOperations > 0) {
    insights.push({
      type: 'info',
      icon: '💎',
      text: `${highValueOperations} операций с высокой стоимостью (>${(metrics.averageAmount * 2).toLocaleString('ru-RU', {maximumFractionDigits: 0})} TRY).`
    })
  }
  
  insights.push({
    type: 'danger',
    icon: '💸',
    text: `Потенциальные потери: ${metrics.lostRevenue.toLocaleString('ru-RU', {maximumFractionDigits: 0})} TRY из-за неудачных операций.`
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
    const amount = parseFloat(row['Initial Amount']) || 0
    if (amount <= 500) ranges['0-500']++
    else if (amount <= 1000) ranges['501-1000']++
    else if (amount <= 2000) ranges['1001-2000']++
    else if (amount <= 5000) ranges['2001-5000']++
    else ranges['5000+']++
  })
  
  return ranges
}

export function getConversionByAmount(data) {
  const ranges = [
    { label: '0-500', min: 0, max: 500 },
    { label: '501-1000', min: 501, max: 1000 },
    { label: '1001-2000', min: 1001, max: 2000 },
    { label: '2001-5000', min: 2001, max: 5000 },
    { label: '5000+', min: 5001, max: Infinity }
  ]
  
  return ranges.map(range => {
    const rangeData = data.filter(row => {
      const amount = parseFloat(row['Initial Amount']) || 0
      return amount >= range.min && amount <= range.max
    })
    
    const total = rangeData.length
    const successful = rangeData.filter(row => {
      const status = row.Status ? row.Status.toLowerCase() : ''
      return status === 'success'
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
  const amounts = data.map(row => parseFloat(row['Initial Amount']) || 0)
  return amounts.sort((a, b) => b - a).slice(0, limit)
}

export function getStateDistribution(data) {
  const states = {}
  data.forEach(row => {
    const state = row['Operation State'] || 'unknown'
    states[state] = (states[state] || 0) + 1
  })
  return states
}

export function getTimeSeriesData(data) {
  // Группировка данных по времени (примерная реализация)
  const timeGroups = {}
  
  data.forEach(row => {
    // Примерная группировка по дням
    const date = new Date().toISOString().split('T')[0]
    if (!timeGroups[date]) {
      timeGroups[date] = { total: 0, successful: 0, failed: 0 }
    }
    
    timeGroups[date].total++
    if (row.Status === 'success') {
      timeGroups[date].successful++
    } else {
      timeGroups[date].failed++
    }
  })
  
  return Object.entries(timeGroups).map(([date, stats]) => ({
    date,
    ...stats,
    conversionRate: (stats.successful / stats.total) * 100
  }))
}

export function detectAnomalies(data) {
  const anomalies = []
  
  // Обнаружение необычно больших сумм
  const amounts = data.map(row => parseFloat(row['Initial Amount']) || 0)
  const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length
  const stdDev = Math.sqrt(amounts.reduce((sq, n) => sq + Math.pow(n - avgAmount, 2), 0) / amounts.length)
  
  const largeAmounts = amounts.filter(amount => amount > avgAmount + 2 * stdDev)
  if (largeAmounts.length > 0) {
    anomalies.push({
      type: 'large_amount',
      count: largeAmounts.length,
      description: 'Операции с необычно большими суммами'
    })
  }
  
  // Обнаружение частых отказов
  const recentFailures = data.filter(row => row.Status === 'fail').length
  if (recentFailures > data.length * 0.7) {
    anomalies.push({
      type: 'high_failure_rate',
      count: recentFailures,
      description: 'Высокий процент отказов'
    })
  }
  
  return anomalies
} 