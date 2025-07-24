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
  if (!status) return 'unknown';
  
  const lowerStatus = status.toLowerCase();
  
  if (lowerStatus.includes('success') || lowerStatus.includes('completed') || lowerStatus.includes('successful')) {
    return 'success';
  } else if (lowerStatus.includes('failed') || lowerStatus.includes('canceled') || lowerStatus.includes('cancelled') || lowerStatus.includes('error')) {
    return 'failed';
  } else if (lowerStatus.includes('pending') || lowerStatus.includes('in progress') || lowerStatus.includes('processing')) {
    return 'pending';
  }
  
  return 'unknown';
}

// Функция для поиска tracking ID в записи
function findTrackingId(record) {
  const trackingKeys = [
    'Tracking Id', 'tracking_id', 'trackingId', 'TrackingId',
    'Transaction Id', 'transaction_id', 'transactionId', 'TransactionId',
    'Reference Id', 'reference_id', 'referenceId', 'ReferenceId',
    'Operation Id', 'operation_id', 'operationId', 'OperationId',
    'ID', 'id', 'Id'
  ];
  
  for (const key of trackingKeys) {
    if (record[key]) {
      return { trackingId: record[key], trackingKey: key };
    }
  }
  
  return { trackingId: null, trackingKey: null };
}

// Основная функция сверки
function performReconciliation(merchantData, platformData) {
  console.log('🔍 Starting reconciliation...');
  console.log('📊 Merchant records:', merchantData.length);
  console.log('🏦 Platform records:', platformData.length);
  
  if (!Array.isArray(merchantData) || !Array.isArray(platformData)) {
    throw new Error('Both merchant and platform data must be arrays');
  }
  
  // Создаем индекс для платформенных данных по tracking ID
  const platformIndex = new Map();
  
  platformData.forEach((record) => {
    const { trackingId } = findTrackingId(record);
    if (trackingId) {
      platformIndex.set(trackingId, { record });
    }
  });
  
  console.log('📋 Platform index created with', platformIndex.size, 'keys');
  
  // Обрабатываем merchant данные
  const results = {
    matched: [],
    merchantOnly: [],
    platformOnly: [],
    statusMismatch: []
  };
  
  const processedMerchantIds = new Set();
  
  merchantData.forEach((merchantRecord, merchantIndex) => {
    const { trackingId, trackingKey } = findTrackingId(merchantRecord);
    
    // Логируем только первые несколько записей
    if (merchantIndex < 3) {
      console.log('🔍 Processing merchant record', merchantIndex + 1, ':', {
        trackingId,
        trackingKey,
        status: merchantRecord.Status
      });
    }
    
    if (!trackingId) {
      results.merchantOnly.push({
        record: merchantRecord,
        reason: 'No tracking ID found'
      });
      return;
    }
    
    processedMerchantIds.add(trackingId);
    
    const platformMatch = platformIndex.get(trackingId);
    
    if (!platformMatch) {
      results.merchantOnly.push({
        record: merchantRecord,
        trackingId,
        reason: 'No matching platform record'
      });
      return;
    }
    
    const { record: platformRecord } = platformMatch;
    
    // Сравниваем статусы
    const merchantStatus = normalizeStatus(merchantRecord.Status);
    const platformStatus = normalizeStatus(platformRecord.Status);
    
    if (merchantStatus === platformStatus) {
      results.matched.push({
        merchant: merchantRecord,
        platform: platformRecord,
        trackingId,
        status: merchantStatus
      });
    } else {
      results.statusMismatch.push({
        merchant: merchantRecord,
        platform: platformRecord,
        trackingId,
        merchantStatus,
        platformStatus
      });
    }
  });
  
  console.log('📊 Processed merchant records:', merchantData.length);
  
  // Находим записи только на платформе
  platformData.forEach((platformRecord) => {
    const { trackingId } = findTrackingId(platformRecord);
    if (trackingId && !processedMerchantIds.has(trackingId)) {
      results.platformOnly.push({
        record: platformRecord,
        trackingId,
        reason: 'No matching merchant record'
      });
    }
  });
  
  console.log('🔗 Found matches:', results.matched.length);
  
  const summary = {
    totalMerchant: merchantData.length,
    totalPlatform: platformData.length,
    matched: results.matched.length,
    merchantOnly: results.merchantOnly.length,
    platformOnly: results.platformOnly.length,
    statusMismatch: results.statusMismatch.length,
    matchRate: `${((results.matched.length / merchantData.length) * 100).toFixed(2)}%`
  };
  
  console.log('✅ Reconciliation complete:', summary);
  
  return {
    summary,
    results
  };
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
    if (merchantData.length > 10000 || platformData.length > 10000) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'File too large. Maximum 10,000 records per file allowed.' 
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