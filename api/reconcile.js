import csv from 'csv-parser'
import fs from 'fs'

// Функция для парсинга CSV из буфера
function parseCSVBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const results = []
    const stream = require('stream')
    const readable = new stream.Readable()
    readable.push(buffer)
    readable.push(null)
    
    readable
      .pipe(csv({ separator: ';' }))
      .on('data', (data) => results.push(data))
      .on('end', () => {
        resolve(results)
      })
      .on('error', (error) => {
        reject(error)
      })
  })
}

// Функция для определения типа данных
function detectDataType(headers) {
  const headerStr = headers.join(' ').toLowerCase()
  
  // Проверяем наличие ключевых заголовков платформы
  const platformKeywords = ['foreign operation id', 'client operation id', 'initial amount', 'result amount']
  const platformMatches = platformKeywords.filter(keyword => headerStr.includes(keyword)).length
  
  if (platformMatches >= 2) {
    return 'platform'
  }
  
  // Проверяем наличие ключевых заголовков провайдера
  const merchantKeywords = ['tracking id', 'payment method', 'hash code']
  const merchantMatches = merchantKeywords.filter(keyword => headerStr.includes(keyword)).length
  
  if (merchantMatches >= 2) {
    return 'merchant'
  }
  
  return 'unknown'
}

// Функция для нормализации статусов
function normalizeStatus(status) {
  if (!status) return ''
  
  const normalized = status.toLowerCase().trim()
  
  // Маппинг статусов
  const statusMap = {
    'success': 'success',
    'completed': 'success',
    'failed': 'failed',
    'error': 'failed',
    'canceled': 'failed',        // Canceled = Failed (неуспешная транзакция)
    'cancelled': 'failed',       // Cancelled = Failed (неуспешная транзакция)
    'pending': 'pending',
    'processing': 'pending',
    'in progress': 'pending',
    'in_progress': 'pending'
  }
  
  return statusMap[normalized] || normalized
}

// Функция для сверки данных
function performReconciliation(merchantData, platformData) {
  console.log('🔄 Starting reconciliation...')
  console.log('📊 Merchant records:', merchantData.length)
  console.log('🏦 Platform records:', platformData.length)
  
  // Проверяем данные на входе
  if (merchantData.length > 0) {
    console.log('🔍 First merchant record in performReconciliation:', merchantData[0])
    console.log('🔍 First merchant record keys:', Object.keys(merchantData[0]))
    console.log('🔍 First merchant record Tracking Id:', merchantData[0]['Tracking Id'])
  }
  
  // Создаем индексы для быстрого поиска
  const merchantIndex = new Map()
  const platformIndex = new Map()
  
  // Индексируем данные провайдера
  merchantData.forEach((record, index) => {
    // Ищем ключ для ID
    let trackingId = null
    let trackingKey = null
    
    // Проверяем различные возможные ключи
    const possibleKeys = ['Tracking Id', 'tracking id', 'TrackingId', 'trackingId', 'ID', 'id', 'Transaction ID', 'transaction id']
    
    for (const key of possibleKeys) {
      if (record[key]) {
        trackingId = record[key]
        trackingKey = key
        break
      }
    }
    
    if (trackingId) {
      merchantIndex.set(trackingId, { record, index })
      
      // Логируем первые несколько записей для отладки
      if (index < 5) {
        console.log(`🔍 Merchant row ${index + 1}:`, {
          'Found trackingId': trackingId,
          'Found trackingKey': trackingKey,
          'Status': record.Status,
          'All keys': Object.keys(record),
          'First few keys with values': Object.entries(record).slice(0, 5).map(([key, value]) => ({ key, value }))
        })
      }
    }
  })
  
  console.log('📋 Merchant index keys:', merchantIndex.size)
  
  // Индексируем данные платформы
  platformData.forEach((record, index) => {
    // Ищем ключ для ID
    let trackingId = null
    
    // Проверяем различные возможные ключи
    const possibleKeys = ['Foreign Operation Id', 'foreign operation id', 'ForeignOperationId', 'foreignOperationId', 'ID', 'id', 'Operation ID', 'operation id']
    
    for (const key of possibleKeys) {
      if (record[key]) {
        trackingId = record[key]
        break
      }
    }
    
    if (trackingId) {
      platformIndex.set(trackingId, { record, index })
    }
  })
  
  console.log('📋 Platform index keys:', platformIndex.size)
  
  // Результаты сверки
  const results = {
    matched: [],
    merchantOnly: [],
    platformOnly: [],
    statusMismatch: []
  }
  
  // Обрабатываем записи провайдера
  let processedCount = 0
  merchantData.forEach((merchantRecord, merchantIndex) => {
    processedCount++
    
    // Ищем tracking ID
    let trackingId = null
    const possibleKeys = ['Tracking Id', 'tracking id', 'TrackingId', 'trackingId', 'ID', 'id', 'Transaction ID', 'transaction id']
    
    for (const key of possibleKeys) {
      if (merchantRecord[key]) {
        trackingId = merchantRecord[key]
        break
      }
    }
    
    if (!trackingId) {
      results.merchantOnly.push({
        type: 'merchant_only',
        merchant: merchantRecord,
        reason: 'No tracking ID found'
      })
      return
    }
    
    // Ищем соответствующую запись на платформе
    const platformMatch = platformIndex.get(trackingId)
    
    if (!platformMatch) {
      results.merchantOnly.push({
        type: 'merchant_only',
        merchant: merchantRecord,
        reason: 'No matching platform record'
      })
      return
    }
    
    const platformRecord = platformMatch.record
    
    // Нормализуем статусы для сравнения
    const merchantStatus = normalizeStatus(merchantRecord.Status)
    const platformStatus = normalizeStatus(platformRecord.Status)
    
    // Логируем первые несколько записей для отладки
    if (processedCount <= 10) {
      console.log(`🔍 Processing merchant record ${processedCount}:`, {
        trackingId,
        merchantStatus,
        merchantNormalizedStatus: merchantStatus,
        hasPlatformMatch: !!platformMatch,
        platformStatus: platformRecord.Status,
        platformNormalizedStatus: platformStatus
      })
    }
    
    // Сравниваем статусы
    if (merchantStatus === platformStatus) {
      results.matched.push({
        type: 'matched',
        merchant: merchantRecord,
        platform: platformRecord,
        trackingId
      })
    } else {
      results.statusMismatch.push({
        type: 'status_mismatch',
        merchant: merchantRecord,
        platform: platformRecord,
        trackingId,
        merchantStatus: merchantRecord.Status,
        platformStatus: platformRecord.Status,
        merchantNormalized: merchantStatus,
        platformNormalized: platformStatus
      })
    }
  })
  
  console.log('📊 Processed merchant records:', processedCount)
  
  // Находим записи, которые есть только на платформе
  platformData.forEach((platformRecord) => {
    let trackingId = null
    const possibleKeys = ['Foreign Operation Id', 'foreign operation id', 'ForeignOperationId', 'foreignOperationId', 'ID', 'id', 'Operation ID', 'operation id']
    
    for (const key of possibleKeys) {
      if (platformRecord[key]) {
        trackingId = platformRecord[key]
        break
      }
    }
    
    if (trackingId && !merchantIndex.has(trackingId)) {
      results.platformOnly.push({
        type: 'platform_only',
        platform: platformRecord,
        reason: 'No matching merchant record'
      })
    }
  })
  
  console.log('🔗 Found matches:', results.matched.length)
  
  // Формируем итоговую статистику
  const totalMerchant = merchantData.length
  const totalPlatform = platformData.length
  const matched = results.matched.length
  const merchantOnly = results.merchantOnly.length
  const platformOnly = results.platformOnly.length
  const statusMismatch = results.statusMismatch.length
  const matchRate = totalMerchant > 0 ? ((matched / totalMerchant) * 100).toFixed(2) + '%' : '0%'
  
  console.log('✅ Reconciliation complete:', {
    totalMerchant,
    totalPlatform,
    matched,
    merchantOnly,
    platformOnly,
    statusMismatch,
    matchRate
  })
  
  // Показываем первые несколько записей только на платформе
  if (results.platformOnly.length > 0) {
    console.log('🔍 Первые 5 записей только на платформе:')
    results.platformOnly.slice(0, 5).forEach((item, index) => {
      const id = item.platform['Foreign Operation Id'] || item.platform['Operation ID'] || 'Unknown'
      const status = item.platform.Status || 'Unknown'
      console.log(`  ${index + 1}. ID: ${id}, Status: ${status}`)
    })
  }
  
  return {
    totalMerchant,
    totalPlatform,
    matched,
    merchantOnly,
    platformOnly,
    statusMismatch,
    matchRate,
    results: results
  }
}

export default async function handler(req, res) {
  // Настройка CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  try {
    console.log('📁 Received files for reconciliation')
    
    // Проверяем наличие файлов в FormData
    if (!req.body || !req.body.merchantFile || !req.body.platformFile) {
      return res.status(400).json({ error: 'Both merchant and platform files are required' })
    }
    
    console.log('📂 Parsing merchant file...')
    const merchantData = await parseCSVBuffer(Buffer.from(req.body.merchantFile, 'base64'))
    console.log('📂 Parsing platform file...')
    const platformData = await parseCSVBuffer(Buffer.from(req.body.platformFile, 'base64'))
    
    console.log('📊 Merchant data parsed:', merchantData.length, 'records')
    console.log('📊 Platform data parsed:', platformData.length, 'records')
    
    // Логирование заголовков и первых строк
    if (merchantData.length > 0) {
      console.log('🔍 MERCHANT HEADERS:', Object.keys(merchantData[0]))
      console.log('📋 MERCHANT FIRST 3 ROWS (raw):')
      merchantData.slice(0, 3).forEach((row, index) => {
        console.log(`  Row ${index + 1}:`, JSON.stringify(row, null, 2))
      })
    }
    
    if (platformData.length > 0) {
      console.log('🔍 PLATFORM HEADERS:', Object.keys(platformData[0]))
      console.log('📋 PLATFORM FIRST 3 ROWS (raw):')
      platformData.slice(0, 3).forEach((row, index) => {
        console.log(`  Row ${index + 1}:`, JSON.stringify(row, null, 2))
      })
    }
    
    // Определяем типы данных
    const merchantHeaders = Object.keys(merchantData[0] || {})
    const platformHeaders = Object.keys(platformData[0] || {})
    
    const merchantType = detectDataType(merchantHeaders)
    const platformType = detectDataType(platformHeaders)
    
    console.log('🔍 Detected types - Merchant:', merchantType, 'Platform:', platformType)
    
    // Выполняем сверку
    console.log('🔍 About to call performReconciliation with:', {
      merchantDataLength: merchantData.length,
      platformDataLength: platformData.length,
      merchantDataFirstRecord: merchantData[0],
      platformDataFirstRecord: platformData[0]
    })
    
    const reconciliationResults = performReconciliation(merchantData, platformData)
    
    res.json({
      success: true,
      results: reconciliationResults,
      metadata: {
        merchantType,
        platformType,
        merchantHeaders,
        platformHeaders
      }
    })
    
  } catch (error) {
    console.error('❌ Reconciliation error:', error)
    res.status(500).json({ 
      error: 'Reconciliation failed', 
      details: error.message 
    })
  }
} 