// Утилита для сверки данных между провайдером и платформой

export function performReconciliation(merchantData, platformData) {
  console.log('🔄 Starting reconciliation process...')
  console.log('📊 Merchant records:', merchantData.length)
  console.log('🏦 Platform records:', platformData.length)
  
  // Логируем первые записи для отладки
  if (merchantData.length > 0) {
    console.log('📋 First merchant record:', merchantData[0])
    console.log('📋 Merchant trackingId:', merchantData[0].trackingId)
    console.log('📋 Merchant status:', merchantData[0].status)
    console.log('📋 Merchant normalizedStatus:', merchantData[0].normalizedStatus)
  }
  if (platformData.length > 0) {
    console.log('📋 First platform record:', platformData[0])
    console.log('📋 Platform foreignOperationId:', platformData[0].foreignOperationId)
    console.log('📋 Platform status:', platformData[0].status)
    console.log('📋 Platform normalizedStatus:', platformData[0].normalizedStatus)
  }

  // Создаем индексы для быстрого поиска
  const merchantIndex = createMerchantIndex(merchantData)
  const platformIndex = createPlatformIndex(platformData)

  console.log('📋 Merchant index keys:', Object.keys(merchantIndex).length)
  console.log('📋 Platform index keys:', Object.keys(platformIndex).length)

  // Результаты сверки
  const results = {
    matched: [],           // Совпадающие транзакции
    merchantOnly: [],      // Только у провайдера
    platformOnly: [],      // Только на платформе
    statusMismatch: [],    // Несовпадение статусов
    summary: {}
  }

  // Обрабатываем данные провайдера
  let processedCount = 0
  let matchedCount = 0
  
  merchantData.forEach(merchantRecord => {
    const trackingId = merchantRecord.trackingId || merchantRecord.id || merchantRecord['Tracking ID']
    if (!trackingId) {
      console.warn('⚠️ Merchant record without tracking ID:', merchantRecord)
      return
    }

    processedCount++
    const platformRecord = platformIndex[trackingId]
    
    if (!platformRecord) {
      // Транзакция есть только у провайдера
      results.merchantOnly.push({
        ...merchantRecord,
        reconciliationStatus: 'merchant_only',
        matchType: 'no_match'
      })
    } else {
      // Найдено соответствие, проверяем детали
      matchedCount++
      console.log('✅ Found match for tracking ID:', trackingId)
      
      const comparison = compareRecords(merchantRecord, platformRecord)
      
      if (comparison.isFullMatch) {
        results.matched.push({
          merchant: merchantRecord,
          platform: platformRecord,
          reconciliationStatus: 'matched',
          matchType: 'full_match',
          comparison
        })
      } else {
        // Есть расхождения по статусу
        results.statusMismatch.push({
          merchant: merchantRecord,
          platform: platformRecord,
          reconciliationStatus: 'status_mismatch',
          matchType: 'status_mismatch',
          comparison
        })
      }
    }
  })
  
  console.log('📊 Processed merchant records:', processedCount)
  console.log('🔗 Found matches:', matchedCount)

  // Обрабатываем данные платформы (ищем записи только на платформе)
  platformData.forEach(platformRecord => {
    const foreignOpId = platformRecord.foreignOperationId || platformRecord.trackingId
    if (!foreignOpId) {
      console.warn('⚠️ Platform record without foreign operation ID:', platformRecord)
      return
    }

    if (!merchantIndex[foreignOpId]) {
      // Транзакция есть только на платформе
      results.platformOnly.push({
        ...platformRecord,
        reconciliationStatus: 'platform_only',
        matchType: 'no_match'
      })
    }
  })

  // Подсчитываем статистику
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
  return results
}

// Создает индекс для быстрого поиска записей провайдера
function createMerchantIndex(merchantData) {
  const index = {}
  let validKeys = 0
  
  merchantData.forEach((record, recordIndex) => {
    const key = record.trackingId || record.id || record['Tracking ID']
    if (key) {
      index[key] = record
      validKeys++
    } else {
      console.warn('⚠️ Merchant record without tracking ID at index', recordIndex, record)
    }
  })
  
  console.log('📋 Merchant index created with', validKeys, 'valid keys')
  return index
}

// Создает индекс для быстрого поиска записей платформы
function createPlatformIndex(platformData) {
  const index = {}
  let validKeys = 0
  
  platformData.forEach((record, recordIndex) => {
    const key = record.foreignOperationId || record['Foreign Operation Id'] || record.trackingId || record['Tracking Id']
    if (key) {
      index[key] = record
      validKeys++
    } else {
      console.warn('⚠️ Platform record without foreign operation ID at index', recordIndex, record)
    }
  })
  
  console.log('📋 Platform index created with', validKeys, 'valid keys')
  return index
}

// Сравнивает две записи и находит расхождения
function compareRecords(merchantRecord, platformRecord) {
  const comparison = {
    isFullMatch: true,
    statusMismatch: false,
    mismatchTypes: [],
    details: {}
  }

  // Сравнение статусов
  const merchantStatus = merchantRecord.normalizedStatus || (merchantRecord.status || '').toLowerCase()
  const platformStatus = platformRecord.normalizedStatus || (platformRecord.status || '').toLowerCase()
  
  console.log('🔍 Comparing records:', {
    merchantId: merchantRecord.trackingId || merchantRecord.id,
    platformId: platformRecord.foreignOperationId,
    merchantStatus: merchantRecord.status,
    platformStatus: platformRecord.status,
    merchantNormalized: merchantStatus,
    platformNormalized: platformStatus
  })
  
  if (merchantStatus !== platformStatus) {
    comparison.statusMismatch = true
    comparison.isFullMatch = false
    comparison.mismatchTypes.push('status')
    comparison.details.status = {
      merchant: merchantRecord.status,
      platform: platformRecord.status,
      merchantNormalized: merchantStatus,
      platformNormalized: platformStatus
    }
  }

  return comparison
}

// Форматирует результаты для отображения в таблице
export function formatReconciliationForTable(reconciliationResults) {
  const allRecords = []

  // Добавляем совпадающие записи
  reconciliationResults.matched.forEach(match => {
    allRecords.push({
      id: match.merchant.trackingId || match.merchant.id,
      merchantId: match.merchant.trackingId || match.merchant.id,
      platformId: match.platform.foreignOperationId,
      merchantStatus: match.merchant.status,
      platformStatus: match.platform.status,
      merchantAmount: match.merchant.amount,
      platformAmount: match.platform.amount,
      reconciliationStatus: 'matched',
      matchType: 'full_match',
      merchantData: match.merchant,
      platformData: match.platform,
      hasIssue: false
    })
  })

  // Добавляем записи с расхождениями
  reconciliationResults.statusMismatch.forEach(mismatch => {
    allRecords.push({
      id: mismatch.merchant.trackingId || mismatch.merchant.id,
      merchantId: mismatch.merchant.trackingId || mismatch.merchant.id,
      platformId: mismatch.platform.foreignOperationId,
      merchantStatus: mismatch.merchant.status,
      platformStatus: mismatch.platform.status,
      merchantAmount: mismatch.merchant.amount,
      platformAmount: mismatch.platform.amount,
      reconciliationStatus: 'status_mismatch',
      matchType: mismatch.matchType,
      merchantData: mismatch.merchant,
      platformData: mismatch.platform,
      hasIssue: true,
      issueType: 'status'
    })
  })



  // Добавляем записи только у провайдера
  reconciliationResults.merchantOnly.forEach(merchant => {
    allRecords.push({
      id: merchant.trackingId || merchant.id,
      merchantId: merchant.trackingId || merchant.id,
      platformId: null,
      merchantStatus: merchant.status,
      platformStatus: null,
      merchantAmount: merchant.amount,
      platformAmount: null,
      reconciliationStatus: 'merchant_only',
      matchType: 'no_match',
      merchantData: merchant,
      platformData: null,
      hasIssue: true,
      issueType: 'missing_platform'
    })
  })

  // Добавляем записи только на платформе
  reconciliationResults.platformOnly.forEach(platform => {
    allRecords.push({
      id: platform.foreignOperationId || platform.id,
      merchantId: null,
      platformId: platform.foreignOperationId,
      merchantStatus: null,
      platformStatus: platform.status,
      merchantAmount: null,
      platformAmount: platform.amount,
      reconciliationStatus: 'platform_only',
      matchType: 'no_match',
      merchantData: null,
      platformData: platform,
      hasIssue: true,
      issueType: 'missing_merchant'
    })
  })

  return allRecords
} 