const csv = require('csv-parser');
const { Readable } = require('stream');

// Функция для парсинга CSV из буфера
function parseCSVBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const results = [];
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    
    readable
      .pipe(csv({ separator: ';' }))
      .on('data', (data) => results.push(data))
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

// Функция для нормализации статуса
function normalizeStatus(status) {
  if (!status) return '';
  
  const normalized = status.toLowerCase().trim();
  
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
  };
  
  return statusMap[normalized] || normalized;
}

// Функция для определения типа данных
function detectDataType(headers) {
  const headerStr = headers.join(' ').toLowerCase();
  
  // Проверяем наличие ключевых заголовков платформы
  const platformKeywords = ['foreign operation id', 'client operation id', 'initial amount', 'result amount'];
  const platformMatches = platformKeywords.filter(keyword => headerStr.includes(keyword)).length;
  
  if (platformMatches >= 2) {
    return 'platform';
  }
  
  // Проверяем наличие ключевых заголовков провайдера
  const merchantKeywords = ['tracking id', 'payment method', 'hash code'];
  const merchantMatches = merchantKeywords.filter(keyword => headerStr.includes(keyword)).length;
  
  if (merchantMatches >= 2) {
    return 'merchant';
  }
  
  return 'unknown';
}

// Функция для сверки данных
function performReconciliation(merchantData, platformData) {
  console.log('🔄 Starting reconciliation...');
  console.log('📊 Merchant records:', merchantData.length);
  console.log('🏦 Platform records:', platformData.length);
  
  // Проверяем данные на входе
  if (merchantData.length > 0) {
    console.log('🔍 First merchant record in performReconciliation:', merchantData[0]);
    console.log('🔍 First merchant record keys:', Object.keys(merchantData[0]));
    console.log('🔍 First merchant record Tracking Id:', merchantData[0]['Tracking Id']);
  }
  
  // Создаем индексы
  const merchantIndex = {};
  const platformIndex = {};
  
  // Индексируем данные провайдера
  merchantData.forEach((record, index) => {
    // Ищем ключ Tracking Id среди всех ключей объекта
    let trackingId = null;
    let trackingKey = null;
    
    // Проверяем все возможные варианты ключа
    const possibleKeys = ['Tracking Id', 'Tracking ID', 'ID', 'tracking id', 'TrackingId', 'trackingId'];
    
    for (const key of possibleKeys) {
      if (record[key]) {
        trackingId = record[key];
        trackingKey = key;
        break;
      }
    }
    
    // Если не нашли, ищем среди всех ключей объекта
    if (!trackingId) {
      const allKeys = Object.keys(record);
      for (const key of allKeys) {
        if (key.toLowerCase().includes('tracking') || key.toLowerCase().includes('id')) {
          trackingId = record[key];
          trackingKey = key;
          break;
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
      });
    }
    
    if (trackingId) {
      merchantIndex[trackingId] = {
        ...record,
        trackingId,
        normalizedStatus: normalizeStatus(record['Status'] || record['Статус'])
      };
    }
  });
  
  // Индексируем данные платформы
  platformData.forEach((record, index) => {
    // Ищем ключ Foreign Operation Id среди всех ключей объекта
    let foreignOpId = null;
    let foreignOpKey = null;
    
    // Проверяем все возможные варианты ключа
    const possibleKeys = ['Foreign Operation Id', 'foreign operation id', 'ForeignOperationId', 'foreignOperationId'];
    
    for (const key of possibleKeys) {
      if (record[key]) {
        foreignOpId = record[key];
        foreignOpKey = key;
        break;
      }
    }
    
    // Если не нашли, ищем среди всех ключей объекта
    if (!foreignOpId) {
      const allKeys = Object.keys(record);
      for (const key of allKeys) {
        if (key.toLowerCase().includes('foreign') && key.toLowerCase().includes('operation')) {
          foreignOpId = record[key];
          foreignOpKey = key;
          break;
        }
      }
    }
    
    if (foreignOpId) {
      platformIndex[foreignOpId] = {
        ...record,
        foreignOperationId: foreignOpId,
        normalizedStatus: normalizeStatus(record['Status'])
      };
    }
  });
  
  console.log('📋 Merchant index keys:', Object.keys(merchantIndex).length);
  console.log('📋 Platform index keys:', Object.keys(platformIndex).length);
  
  // Результаты сверки
  const results = {
    matched: [],
    merchantOnly: [],
    platformOnly: [],
    statusMismatch: [],
    summary: {}
  };
  
  // Обрабатываем данные провайдера
  let processedCount = 0;
  let matchedCount = 0;
  
  Object.values(merchantIndex).forEach(merchantRecord => {
    processedCount++;
    const platformRecord = platformIndex[merchantRecord.trackingId];
    
    // Отладка для первых 10 записей
    if (processedCount <= 10) {
      console.log(`🔍 Processing merchant record ${processedCount}:`, {
        trackingId: merchantRecord.trackingId,
        merchantStatus: merchantRecord['Status'],
        merchantNormalizedStatus: merchantRecord.normalizedStatus,
        hasPlatformMatch: !!platformRecord,
        platformStatus: platformRecord?.['Status'],
        platformNormalizedStatus: platformRecord?.normalizedStatus
      });
    }
    
    if (!platformRecord) {
      // Транзакция есть только у провайдера
      results.merchantOnly.push({
        id: merchantRecord.trackingId,
        merchantStatus: merchantRecord['Status'] || merchantRecord['Статус'],
        merchantNormalizedStatus: merchantRecord.normalizedStatus,
        reconciliationStatus: 'merchant_only'
      });
    } else {
      // Найдено соответствие, проверяем статусы
      matchedCount++;
      
      // Проверяем совпадение статусов и сумм
      const statusMatch = merchantRecord.normalizedStatus === platformRecord.normalizedStatus;
      
      // Нормализуем суммы для сравнения
      const merchantAmount = parseFloat(merchantRecord['Amount'] || merchantRecord['Transaction amount'] || '0');
      const platformAmount = parseFloat(platformRecord['Initial Amount'] || platformRecord['Result Amount'] || '0');
      const amountMatch = Math.abs(merchantAmount - platformAmount) < 0.01; // Допуск 1 копейка
      
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
        });
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
        });
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
        });
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
        });
      }
    }
  });
  
  // Обрабатываем данные платформы (ищем записи только на платформе)
  Object.values(platformIndex).forEach(platformRecord => {
    if (!merchantIndex[platformRecord.foreignOperationId]) {
      results.platformOnly.push({
        id: platformRecord.foreignOperationId,
        platformStatus: platformRecord['Status'],
        platformNormalizedStatus: platformRecord.normalizedStatus,
        reconciliationStatus: 'platform_only'
      });
    }
  });
  
  console.log('📊 Processed merchant records:', processedCount);
  console.log('🔗 Found matches:', matchedCount);
  
  // Создаем сводку
  const totalMerchant = merchantData.length;
  const totalPlatform = platformData.length;
  const matched = results.matched.length;
  const merchantOnly = results.merchantOnly.length;
  const platformOnly = results.platformOnly.length;
  const statusMismatch = results.statusMismatch.length;
  const matchRate = totalMerchant > 0 ? ((matched / totalMerchant) * 100).toFixed(2) + '%' : '0%';
  
  results.summary = {
    totalMerchant,
    totalPlatform,
    matched,
    merchantOnly,
    platformOnly,
    statusMismatch,
    matchRate
  };
  
  console.log('✅ Reconciliation complete:', results.summary);
  
  // Показываем первые 5 записей только на платформе
  if (results.platformOnly.length > 0) {
    console.log('🔍 Первые 5 записей только на платформе:');
    results.platformOnly.slice(0, 5).forEach((record, index) => {
      console.log(`  ${index + 1}. ID: ${record.id}, Status: ${record.platformStatus}`);
    });
  }
  
  return results;
}

const handler = async (event, context) => {
  // CORS заголовки
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Обработка preflight запросов
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

    const body = JSON.parse(event.body);
    const { merchantFile, platformFile } = body;

    if (!merchantFile || !platformFile) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Both merchant and platform files are required' })
      };
    }

    console.log('📤 Starting file processing...');

    // Парсим CSV данные
    const merchantData = await parseCSVBuffer(Buffer.from(merchantFile, 'base64'));
    const platformData = await parseCSVBuffer(Buffer.from(platformFile, 'base64'));

    console.log('📊 Files parsed successfully');

    // Проверяем размер данных
    if (merchantData.length > 50000 || platformData.length > 50000) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'File too large. Maximum 50,000 records per file allowed.' 
        })
      };
    }

    console.log('🔄 Starting reconciliation...');

    // Выполняем сверку
    const reconciliationResult = performReconciliation(merchantData, platformData);

    console.log('✅ Reconciliation completed successfully');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(reconciliationResult)
    };

  } catch (error) {
    console.error('❌ Error in reconcile function:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
};

module.exports = { handler }; 