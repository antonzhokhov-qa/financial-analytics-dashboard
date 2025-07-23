import express from 'express'
import multer from 'multer'
import cors from 'cors'
import csv from 'csv-parser'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = 3002

// Middleware
app.use(cors())
app.use(express.json())

// Настройка multer для загрузки файлов
const upload = multer({ dest: 'uploads/' })

// Функция для парсинга CSV
function parseCSVFile(filePath) {
  return new Promise((resolve, reject) => {
    const results = []
    fs.createReadStream(filePath)
      .pipe(csv({ separator: ';' }))
      .on('data', (data) => results.push(data))
      .on('end', () => {
        // Удаляем временный файл
        fs.unlinkSync(filePath)
        resolve(results)
      })
      .on('error', (error) => {
        fs.unlinkSync(filePath)
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
  
  // Создаем индексы
  const merchantIndex = {}
  const platformIndex = {}
  
  // Индексируем данные провайдера
  merchantData.forEach((record, index) => {
    // Ищем ключ Tracking Id среди всех ключей объекта
    let trackingId = null
    let trackingKey = null
    
    // Проверяем все возможные варианты ключа
    const possibleKeys = ['Tracking Id', 'Tracking ID', 'ID', 'tracking id', 'TrackingId', 'trackingId']
    
    for (const key of possibleKeys) {
      if (record[key]) {
        trackingId = record[key]
        trackingKey = key
        break
      }
    }
    
    // Если не нашли, ищем среди всех ключей объекта
    if (!trackingId) {
      const allKeys = Object.keys(record)
      for (const key of allKeys) {
        if (key.toLowerCase().includes('tracking') || key.toLowerCase().includes('id')) {
          trackingId = record[key]
          trackingKey = key
          break
        }
      }
    }
    
    // Отладка первых 5 записей
    if (index < 5) {
      console.log(`🔍 Merchant row ${index + 1}:`, {
        'Found trackingId': trackingId,
        'Found trackingKey': trackingKey,
        'Status': record['Status'],
        'All keys': Object.keys(record),
        'First few keys with values': Object.keys(record).slice(0, 5).map(key => ({ key, value: record[key] }))
      })
    }
    
    if (trackingId) {
      merchantIndex[trackingId] = {
        ...record,
        trackingId,
        normalizedStatus: normalizeStatus(record['Status'] || record['Статус'])
      }
    }
  })
  
  // Индексируем данные платформы
  platformData.forEach((record, index) => {
    // Ищем ключ Foreign Operation Id среди всех ключей объекта
    let foreignOpId = null
    let foreignOpKey = null
    
    // Проверяем все возможные варианты ключа
    const possibleKeys = ['Foreign Operation Id', 'foreign operation id', 'ForeignOperationId', 'foreignOperationId']
    
    for (const key of possibleKeys) {
      if (record[key]) {
        foreignOpId = record[key]
        foreignOpKey = key
        break
      }
    }
    
    // Если не нашли, ищем среди всех ключей объекта
    if (!foreignOpId) {
      const allKeys = Object.keys(record)
      for (const key of allKeys) {
        if (key.toLowerCase().includes('foreign') && key.toLowerCase().includes('operation')) {
          foreignOpId = record[key]
          foreignOpKey = key
          break
        }
      }
    }
    
    if (foreignOpId) {
      platformIndex[foreignOpId] = {
        ...record,
        foreignOperationId: foreignOpId,
        normalizedStatus: normalizeStatus(record['Status'])
      }
    }
  })
  
  console.log('📋 Merchant index keys:', Object.keys(merchantIndex).length)
  console.log('📋 Platform index keys:', Object.keys(platformIndex).length)
  
  // Результаты сверки
  const results = {
    matched: [],
    merchantOnly: [],
    platformOnly: [],
    statusMismatch: [],
    summary: {}
  }
  
  // Обрабатываем данные провайдера
  let processedCount = 0
  let matchedCount = 0
  
  Object.values(merchantIndex).forEach(merchantRecord => {
    processedCount++
    const platformRecord = platformIndex[merchantRecord.trackingId]
    
    // Отладка для первых 10 записей
    if (processedCount <= 10) {
      console.log(`🔍 Processing merchant record ${processedCount}:`, {
        trackingId: merchantRecord.trackingId,
        merchantStatus: merchantRecord['Status'],
        merchantNormalizedStatus: merchantRecord.normalizedStatus,
        hasPlatformMatch: !!platformRecord,
        platformStatus: platformRecord?.['Status'],
        platformNormalizedStatus: platformRecord?.normalizedStatus
      })
    }
    
    if (!platformRecord) {
      // Транзакция есть только у провайдера
      results.merchantOnly.push({
        id: merchantRecord.trackingId,
        merchantStatus: merchantRecord['Status'] || merchantRecord['Статус'],
        merchantNormalizedStatus: merchantRecord.normalizedStatus,
        reconciliationStatus: 'merchant_only'
      })
    } else {
      // Найдено соответствие, проверяем статусы
      matchedCount++
      
      // Проверяем совпадение статусов и сумм
      const statusMatch = merchantRecord.normalizedStatus === platformRecord.normalizedStatus
      
      // Нормализуем суммы для сравнения
      const merchantAmount = parseFloat(merchantRecord['Amount'] || merchantRecord['Transaction amount'] || '0')
      const platformAmount = parseFloat(platformRecord['Initial Amount'] || platformRecord['Result Amount'] || '0')
      const amountMatch = Math.abs(merchantAmount - platformAmount) < 0.01 // Допуск 1 копейка
      
      if (statusMatch && amountMatch) {
        // Полное совпадение по статусу и сумме
        results.matched.push({
          id: merchantRecord.trackingId,
          merchantStatus: merchantRecord['Status'] || merchantRecord['Статус'],
          platformStatus: platformRecord['Status'],
          merchantAmount: merchantAmount,
          platformAmount: platformAmount,
          merchantNormalizedStatus: merchantRecord.normalizedStatus,
          platformNormalizedStatus: platformRecord.normalizedStatus,
          reconciliationStatus: 'matched'
        })
      } else if (!statusMatch && !amountMatch) {
        // Расхождение по статусу и сумме
        results.statusMismatch.push({
          id: merchantRecord.trackingId,
          merchantStatus: merchantRecord['Status'] || merchantRecord['Статус'],
          platformStatus: platformRecord['Status'],
          merchantAmount: merchantAmount,
          platformAmount: platformAmount,
          merchantNormalizedStatus: merchantRecord.normalizedStatus,
          platformNormalizedStatus: platformRecord.normalizedStatus,
          reconciliationStatus: 'status_and_amount_mismatch',
          issueType: 'status_and_amount'
        })
      } else if (!statusMatch) {
        // Расхождение только по статусу
        results.statusMismatch.push({
          id: merchantRecord.trackingId,
          merchantStatus: merchantRecord['Status'] || merchantRecord['Статус'],
          platformStatus: platformRecord['Status'],
          merchantAmount: merchantAmount,
          platformAmount: platformAmount,
          merchantNormalizedStatus: merchantRecord.normalizedStatus,
          platformNormalizedStatus: platformRecord.normalizedStatus,
          reconciliationStatus: 'status_mismatch',
          issueType: 'status_only'
        })
      } else {
        // Расхождение только по сумме
        results.statusMismatch.push({
          id: merchantRecord.trackingId,
          merchantStatus: merchantRecord['Status'] || merchantRecord['Статус'],
          platformStatus: platformRecord['Status'],
          merchantAmount: merchantAmount,
          platformAmount: platformAmount,
          merchantNormalizedStatus: merchantRecord.normalizedStatus,
          platformNormalizedStatus: platformRecord.normalizedStatus,
          reconciliationStatus: 'amount_mismatch',
          issueType: 'amount_only'
        })
      }
    }
  })
  
  // Обрабатываем данные платформы (ищем записи только на платформе)
  Object.values(platformIndex).forEach(platformRecord => {
    if (!merchantIndex[platformRecord.foreignOperationId]) {
      // Транзакция есть только на платформе
      results.platformOnly.push({
        id: platformRecord.foreignOperationId,
        platformStatus: platformRecord['Status'],
        platformNormalizedStatus: platformRecord.normalizedStatus,
        reconciliationStatus: 'platform_only'
      })
    }
  })
  
  console.log('📊 Processed merchant records:', processedCount)
  console.log('🔗 Found matches:', matchedCount)
  
  // Итоговая статистика
  results.summary = {
    totalMerchant: merchantData.length,
    totalPlatform: platformData.length,
    matched: results.matched.length,
    merchantOnly: results.merchantOnly.length,
    platformOnly: results.platformOnly.length,
    statusMismatch: results.statusMismatch.length,
    matchRate: ((results.matched.length / Math.max(merchantData.length, platformData.length)) * 100).toFixed(2) + '%'
  }
  
  console.log('✅ Reconciliation complete:', results.summary)
  
  // Показываем детали о записях, которые не найдены
  if (results.merchantOnly.length > 0) {
    console.log('🔍 Первые 5 записей только у провайдера:')
    results.merchantOnly.slice(0, 5).forEach((record, index) => {
      console.log(`  ${index + 1}. ID: ${record.id}, Status: ${record.merchantStatus}`)
    })
  }

  if (results.platformOnly.length > 0) {
    console.log('🔍 Первые 5 записей только на платформе:')
    results.platformOnly.slice(0, 5).forEach((record, index) => {
      console.log(`  ${index + 1}. ID: ${record.id}, Status: ${record.platformStatus}`)
    })
  }
  
  return results
}

// API endpoint для сверки
app.post('/api/reconcile', upload.fields([
  { name: 'merchantFile', maxCount: 1 },
  { name: 'platformFile', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('📁 Received files for reconciliation')
    
    if (!req.files.merchantFile || !req.files.platformFile) {
      return res.status(400).json({ error: 'Both merchant and platform files are required' })
    }
    
    const merchantFilePath = req.files.merchantFile[0].path
    const platformFilePath = req.files.platformFile[0].path
    
    console.log('📂 Parsing merchant file...')
    const merchantData = await parseCSVFile(merchantFilePath)
    console.log('📂 Parsing platform file...')
    const platformData = await parseCSVFile(platformFilePath)
    
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
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Для Vercel используем экспорт приложения
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`🚀 Reconciliation server running on port ${port}`)
    console.log(`📊 Health check: http://localhost:${port}/api/health`)
    console.log(`🔄 Reconciliation endpoint: http://localhost:${port}/api/reconcile`)
  })
}

// Экспортируем для Vercel
export default app 