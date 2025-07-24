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
  console.log('🔍 Detected types - Merchant:', typeof merchantData, 'Platform:', typeof platformData);
  
  if (!Array.isArray(merchantData) || !Array.isArray(platformData)) {
    throw new Error('Both merchant and platform data must be arrays');
  }
  
  console.log('🔍 About to call performReconciliation with:', {
    merchantDataLength: merchantData.length,
    platformDataLength: platformData.length,
    merchantDataFirstRecord: merchantData[0],
    platformDataFirstRecord: platformData[0]
  });
  
  console.log('🔄 Starting reconciliation...');
  console.log('📊 Merchant records:', merchantData.length);
  console.log('🏦 Platform records:', platformData.length);
  
  // Создаем индекс для платформенных данных по tracking ID
  const platformIndex = new Map();
  
  platformData.forEach((record, index) => {
    const { trackingId } = findTrackingId(record);
    if (trackingId) {
      platformIndex.set(trackingId, { record, index });
    }
  });
  
  console.log('📋 Platform index keys:', platformIndex.size);
  
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
    
    if (merchantIndex < 5) {
      console.log('🔍 Merchant row', merchantIndex + 1, ':', {
        'Found trackingId': trackingId,
        'Found trackingKey': trackingKey,
        'Status': merchantRecord.Status,
        'All keys': Object.keys(merchantRecord),
        'First few keys with values': Object.keys(merchantRecord).slice(0, 5).map(key => ({
          key,
          value: merchantRecord[key]
        }))
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
    
    if (merchantIndex < 10) {
      console.log('🔍 Processing merchant record', merchantIndex + 1, ':', {
        trackingId,
        merchantStatus: merchantRecord.Status,
        merchantNormalizedStatus: merchantStatus,
        hasPlatformMatch: !!platformMatch,
        platformStatus: platformRecord.Status,
        platformNormalizedStatus: platformStatus
      });
    }
    
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
  
  if (results.platformOnly.length > 0) {
    console.log('🔍 Первые 5 записей только на платформе:');
    results.platformOnly.slice(0, 5).forEach((item, index) => {
      console.log(`  ${index + 1}. ID: ${item.trackingId}, Status: ${item.record.Status}`);
    });
  }
  
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

    // Парсим CSV данные
    const merchantData = await parseCSVBuffer(Buffer.from(merchantFile, 'base64'));
    const platformData = await parseCSVBuffer(Buffer.from(platformFile, 'base64'));

    // Выполняем сверку
    const reconciliationResult = performReconciliation(merchantData, platformData);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(reconciliationResult)
    };

  } catch (error) {
    console.error('Error in reconcile function:', error);
    
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