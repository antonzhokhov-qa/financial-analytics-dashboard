// Функция для определения разделителя записей
function detectRecordSeparator(text) {
  // Проверяем разные варианты разделителей записей
  const separators = ['\n', '\r\n', '\r']
  
  for (const sep of separators) {
    const lines = text.split(sep)
    if (lines.length > 1) {
      console.log(`Found record separator: ${JSON.stringify(sep)}, lines: ${lines.length}`)
      return sep
    }
  }
  
  return '\n' // По умолчанию
}

// Функция для определения типа транзакции из данных платформы
function determineTransactionType(method, amount) {
  if (!method && amount === 0) return 'unknown'
  
  const methodLower = (method || '').toLowerCase()
  
  // Проверяем по методу
  if (methodLower.includes('deposit') || methodLower.includes('in') || methodLower.includes('пополнение')) {
    return 'Deposit'
  }
  if (methodLower.includes('withdraw') || methodLower.includes('out') || methodLower.includes('вывод')) {
    return 'Withdraw'
  }
  
  // Если не определили по методу, используем сумму
  if (amount > 0) return 'Deposit'
  if (amount < 0) return 'Withdraw'
  
  return 'unknown'
}

// Функция для нормализации статусов для сверки
function normalizeStatus(status) {
  const statusLower = (status || '').toLowerCase()
  
  // Соответствия статусов: success (platform) <-> completed (merchant)
  if (statusLower === 'success') return 'completed'
  if (statusLower === 'failed' || statusLower === 'error') return 'failed'  
  if (statusLower === 'pending' || statusLower === 'processing' || statusLower === 'in progress') return 'pending'
  if (statusLower === 'cancelled' || statusLower === 'canceled') return 'canceled'
  
  return statusLower // Возвращаем как есть, если не нашли соответствие
}

// Функция для нормализации данных из разных форматов
function normalizeData(data, format, dataType = 'merchant') {
  console.log('🔄 NORMALIZING DATA - Type:', dataType, 'Records:', data.length)
  
  if (dataType === 'platform') {
    // Нормализация для формата платформы
    console.log('🏦 Normalizing platform data:', data.length, 'records')
    
    // Логируем первые несколько записей для анализа
    if (data.length > 0) {
      console.log('🔍 First platform record raw:', data[0])
    }
    return data.map(row => ({
      // Основные поля платформы
      userId: row['User ID'] || '',
      operationId: row['Operation ID'] || '',
      status: row['Status'] || '',
      foreignOperationId: row['Foreign Operation Id'] || '', // Ключевое поле для сверки
      clientOperationId: row['Client Operation ID'] || '',
      referenceId: row['Reference ID'] || '',
      createdAt: row['Created At'] || '',
      method: row['Method'] || '',
      
      // Суммы и валюты
      initialAmount: parseFloat((row['Initial Amount'] || '0').replace(',', '.')) || 0,
      initialCurrency: row['Initial Currency'] || 'TRY',
      resultAmount: parseFloat((row['Result Amount'] || '0').replace(',', '.')) || 0,
      resultCurrency: row['Result Currency'] || 'TRY',
      
      // Дополнительная информация
      code: row['Code'] || '',
      message: row['Message'] || '',
      details: row['Details'] || '',
      paymentChannelName: row['Payment Channel Name'] || '',
      originalErrorMessage: row['Original Error Message'] || '',
      endpoint: row['Endpoint'] || '',
      
      // Нормализованные поля для совместимости с системой
      id: row['Foreign Operation Id'] || row['Operation ID'] || '', // Используем Foreign Operation Id как основной ID
      trackingId: row['Foreign Operation Id'] || '', // Для сверки с провайдером
      amount: parseFloat((row['Result Amount'] || row['Initial Amount'] || '0').replace(',', '.')) || 0,
      currency: row['Result Currency'] || row['Initial Currency'] || 'TRY',
      
      // Дополнительные поля для отладки
      debugInfo: {
        hasForeignOpId: !!row['Foreign Operation Id'],
        hasResultAmount: !!row['Result Amount'],
        hasInitialAmount: !!row['Initial Amount'],
        originalStatus: row['Status']
      },
      
      // Тип операции (определяем из метода или суммы)
      type: determineTransactionType(row['Method'], parseFloat((row['Result Amount'] || row['Initial Amount'] || '0').replace(',', '.'))),
      transactionType: determineTransactionType(row['Method'], parseFloat((row['Result Amount'] || row['Initial Amount'] || '0').replace(',', '.'))),
      
      // Статус операции - нормализуем для сверки
      normalizedStatus: normalizeStatus(row['Status'] || ''),
      isCompleted: (row['Status'] || '').toLowerCase() === 'success',
      isFailed: (row['Status'] || '').toLowerCase() === 'failed' || (row['Status'] || '').toLowerCase() === 'error',
      
      // Метаданные
      dataSource: 'platform',
      originalData: row // Сохраняем оригинальные данные для отладки
    }))
    
    // Логируем результат нормализации платформы
    const normalizedPlatform = data.map(row => ({
      // Основные поля платформы
      userId: row['User ID'] || '',
      operationId: row['Operation ID'] || '',
      status: row['Status'] || '',
      foreignOperationId: row['Foreign Operation Id'] || '', // Ключевое поле для сверки
      clientOperationId: row['Client Operation ID'] || '',
      referenceId: row['Reference ID'] || '',
      createdAt: row['Created At'] || '',
      method: row['Method'] || '',
      
      // Суммы и валюты
      initialAmount: parseFloat((row['Initial Amount'] || '0').replace(',', '.')) || 0,
      initialCurrency: row['Initial Currency'] || 'TRY',
      resultAmount: parseFloat((row['Result Amount'] || '0').replace(',', '.')) || 0,
      resultCurrency: row['Result Currency'] || 'TRY',
      
      // Дополнительная информация
      code: row['Code'] || '',
      message: row['Message'] || '',
      details: row['Details'] || '',
      paymentChannelName: row['Payment Channel Name'] || '',
      originalErrorMessage: row['Original Error Message'] || '',
      endpoint: row['Endpoint'] || '',
      
      // Нормализованные поля для совместимости с системой
      id: row['Foreign Operation Id'] || row['Operation ID'] || '', // Используем Foreign Operation Id как основной ID
      trackingId: row['Foreign Operation Id'] || '', // Для сверки с провайдером
      amount: parseFloat((row['Result Amount'] || row['Initial Amount'] || '0').replace(',', '.')) || 0,
      currency: row['Result Currency'] || row['Initial Currency'] || 'TRY',
      
      // Дополнительные поля для отладки
      debugInfo: {
        hasForeignOpId: !!row['Foreign Operation Id'],
        hasResultAmount: !!row['Result Amount'],
        hasInitialAmount: !!row['Initial Amount'],
        originalStatus: row['Status']
      },
      
      // Тип операции (определяем из метода или суммы)
      type: determineTransactionType(row['Method'], parseFloat((row['Result Amount'] || row['Initial Amount'] || '0').replace(',', '.'))),
      transactionType: determineTransactionType(row['Method'], parseFloat((row['Result Amount'] || row['Initial Amount'] || '0').replace(',', '.'))),
      
      // Статус операции - нормализуем для сверки
      normalizedStatus: normalizeStatus(row['Status'] || ''),
      isCompleted: (row['Status'] || '').toLowerCase() === 'success',
      isFailed: (row['Status'] || '').toLowerCase() === 'failed' || (row['Status'] || '').toLowerCase() === 'error',
      
      // Метаданные
      dataSource: 'platform',
      originalData: row // Сохраняем оригинальные данные для отладки
    }))
    
    console.log('🏦 Platform normalization complete. Sample record:', normalizedPlatform[0])
    console.log('🏦 Key fields for reconciliation:')
    console.log('🏦 - foreignOperationId:', normalizedPlatform[0]?.foreignOperationId)
    console.log('🏦 - status:', normalizedPlatform[0]?.status)
    console.log('🏦 - normalizedStatus:', normalizedPlatform[0]?.normalizedStatus)
    
    return normalizedPlatform
  } else if (dataType === 'merchant') {
    // Нормализация для формата провайдера
    console.log('🏪 Normalizing merchant data:', data.length, 'records')
    
    // Логируем первые несколько записей для анализа
    if (data.length > 0) {
      console.log('🔍 First merchant record raw:', data[0])
    }
    
    const normalizedMerchant = data.map(row => ({
      // Основные поля
      id: row['Tracking Id'] || row['Идентификатор отслеживания'] || row['Tracking ID'] || row['ID'] || '',
      status: row['Status'] || row['Статус'] || '',
      amount: parseFloat((row['Amount'] || row['Transaction amount'] || row['Сумма транзакции'] || row['Сумма'] || '0').replace(',', '.')) || 0,
      type: row['Type'] || row['Тип'] || '',
      company: row['Company'] || row['Компания'] || '',
      fee: parseFloat((row['Fee'] || row['Комиссия'] || '0').replace(',', '.')) || 0,
      feeRatio: row['Fee Ratio'] || '0%',
      
      // Тип транзакции для аналитики
      transactionType: row['Type'] || row['Тип'] || '',
      isDeposit: (row['Type'] || row['Тип'] || '').toLowerCase() === 'deposit',
      isWithdraw: (row['Type'] || row['Тип'] || '').toLowerCase() === 'withdraw',
      
      // Пользователь
      userName: row['User name'] || row['Имя пользователя'] || row['Username'] || row['Пользователь'] || '',
      userId: row['User ıd'] || row['User id'] || row['Идентификатор пользователя'] || row['User ID'] || '',
      fullName: row['Name'] || row['Имя'] || row['Full Name'] || '',
      
      // Время
      createdAt: row['Creation time'] || row['Время создания'] || row['Created At'] || row['Дата создания'] || '',
      processedAt: row['Processed time'] || row['Время обработки'] || row['Processed At'] || '',
      
      // Платежная информация
      paymentMethod: row['Payment method'] || row['Метод оплаты'] || row['Payment Method'] || row['Способ оплаты'] || '',
      paymentGateway: row['Payment Gateway'] || '',
      recipientName: row['Receiver Account Name'] || row['Имя получателя'] || row['Recipient Name'] || '',
      recipientAccount: row['Receiver Account Number'] || row['Номер счета получателя'] || row['Recipient Account'] || '',
      
      // Техническая информация
      hash: row['Hash code'] || row['Хэш-код'] || row['Hash'] || '',
      ipAddress: row['Client Ip address'] || row['IP адрес клиента'] || row['IP Address'] || '',
      receipt: row['Receipt'] || row['Квитанция'] || '',
      explanation: row['Explanation'] || row['Объяснение'] || '',
      explanationType: row['[Explanation type]'] || row['Explanation Type'] || '',
      
      // Дополнительные поля для совместимости
      linkId: row['Reference Id'] || row['Идентификатор ссылки'] || row['Link ID'] || '',
      
      // Вычисляемые поля
      isCompleted: (row['Status'] || row['Статус'] || '').toLowerCase() === 'completed',
      isCanceled: (row['Status'] || row['Статус'] || '').toLowerCase() === 'canceled',
      isFailed: (row['Status'] || row['Статус'] || '').toLowerCase() === 'failed',
      
      // Форматированные суммы (в TRY для всех типов)
      amountFormatted: new Intl.NumberFormat('tr-TR', { 
        style: 'currency', 
        currency: 'TRY' 
      }).format(parseFloat((row['Amount'] || row['Transaction amount'] || row['Сумма транзакции'] || row['Сумма'] || '0').replace(',', '.')) || 0),
      
      feeFormatted: new Intl.NumberFormat('tr-TR', { 
        style: 'currency', 
        currency: 'TRY' 
      }).format(parseFloat((row['Fee'] || row['Комиссия'] || '0').replace(',', '.')) || 0),
      
      // Дополнительные поля для сверки
      trackingId: row['Tracking Id'] || row['Идентификатор отслеживания'] || row['Tracking ID'] || row['ID'] || '',
      normalizedStatus: (row['Status'] || row['Статус'] || '').toLowerCase(),
      dataSource: 'merchant',
      originalData: row
    }))
    
    console.log('🏪 Merchant normalization complete. Sample record:', normalizedMerchant[0])
    console.log('🏪 Key fields for reconciliation:')
    console.log('🏪 - trackingId:', normalizedMerchant[0]?.trackingId)
    console.log('🏪 - status:', normalizedMerchant[0]?.status)
    console.log('🏪 - normalizedStatus:', normalizedMerchant[0]?.normalizedStatus)
    
    return normalizedMerchant
  } else if (dataType === 'payshack') {
    // Нормализация для формата Payshack
    console.log('🏪 Normalizing Payshack data:', data.length, 'records')
    
    // Логируем первые несколько записей для анализа
    if (data.length > 0) {
      console.log('🔍 First Payshack record raw:', data[0])
    }
    
    const normalizedPayshack = data.map(row => ({
      // Основные поля Payshack
      id: row['Transaction Id'] || row['Transaction ID'] || '',
      orderId: row['Order Id'] || row['Order ID'] || '',
      transactionId: row['Transaction Id'] || row['Transaction ID'] || '',
      utr: row['UTR'] || '',
      amount: parseFloat((row['Amount'] || '0').replace(',', '.')) || 0,
      status: row['Status'] || '',
      remarks: row['Remarks'] || '',
      
      // Время
      createdAt: row['Created Date'] || row['Created date'] || '',
      
      // Нормализованные поля для совместимости с системой
      trackingId: row['Transaction Id'] || row['Transaction ID'] || '', // Используем Transaction Id как tracking ID
      normalizedStatus: normalizeStatus(row['Status'] || ''),
      
      // Статусы для аналитики
      isCompleted: (row['Status'] || '').toLowerCase() === 'success',
      isFailed: (row['Status'] || '').toLowerCase() === 'failed',
      isInitiated: (row['Status'] || '').toLowerCase() === 'initiated',
      
      // Тип транзакции (определяем по статусу и сумме)
      type: determineTransactionType('', parseFloat((row['Amount'] || '0').replace(',', '.'))),
      transactionType: determineTransactionType('', parseFloat((row['Amount'] || '0').replace(',', '.'))),
      isDeposit: parseFloat((row['Amount'] || '0').replace(',', '.')) > 0,
      isWithdraw: parseFloat((row['Amount'] || '0').replace(',', '.')) < 0,
      
      // Форматированные суммы (в INR для Payshack)
      amountFormatted: new Intl.NumberFormat('en-IN', { 
        style: 'currency', 
        currency: 'INR' 
      }).format(parseFloat((row['Amount'] || '0').replace(',', '.')) || 0),
      
      // Дополнительные поля для совместимости
      currency: 'INR', // Payshack работает в INR
      company: 'Payshack',
      paymentMethod: 'UPI', // Основной метод для Payshack
      
      // Метаданные
      dataSource: 'payshack',
      provider: 'payshack',
      originalData: row // Сохраняем оригинальные данные для отладки
    }))
    
    console.log('🏪 Payshack normalization complete. Sample record:', normalizedPayshack[0])
    console.log('🏪 Key fields for reconciliation:')
    console.log('🏪 - transactionId:', normalizedPayshack[0]?.transactionId)
    console.log('🏪 - status:', normalizedPayshack[0]?.status)
    console.log('🏪 - normalizedStatus:', normalizedPayshack[0]?.normalizedStatus)
    
    return normalizedPayshack
  } else {
    // Fallback для неизвестного типа данных
    console.log('⚠️ Unknown data type, using fallback normalization')
    return data
  }
}

// Функция для определения формата данных
function detectDataFormat(headers) {
  const headerStr = headers.join(' ').toLowerCase()
  console.log('🔍 Detecting data format from headers:', headerStr)
  
  // Точные заголовки платформы
  const platformHeaders = [
    'user id', 'operation id', 'status', 'foreign operation id', 
    'client operation id', 'reference id', 'created at', 'method',
    'initial amount', 'initial currency', 'result amount', 'result currency',
    'code', 'message', 'details', 'payment channel name', 
    'original error message', 'endpoint'
  ]
  
  // Точные заголовки провайдера Optipay
  const optipayHeaders = [
    'tracking id', 'reference id', 'status', 'payment method', 'payment gateway',
    'amount', 'transaction amount', 'type', 'company', 'fee', 'fee ratio',
    'name', 'user ıd', 'user name', 'creation time', 'processed time',
    'receiver account name', 'receiver account number', 'hash code',
    'client ip address', 'receipt', 'explanation', '[explanation type]'
  ]

  // Точные заголовки провайдера Payshack
  const payshackHeaders = [
    'created date', 'order id', 'transaction id', 'utr', 'amount', 'status', 'remarks'
  ]
  
  // Проверяем точное соответствие заголовкам платформы
  const platformMatchCount = platformHeaders.filter(header => 
    headerStr.includes(header)
  ).length
  
  // Проверяем точное соответствие заголовкам Optipay
  const optipayMatchCount = optipayHeaders.filter(header => 
    headerStr.includes(header)
  ).length

  // Проверяем точное соответствие заголовкам Payshack
  const payshackMatchCount = payshackHeaders.filter(header => 
    headerStr.includes(header)
  ).length
  
  console.log('📊 Platform header matches:', platformMatchCount, '/', platformHeaders.length)
  console.log('📊 Optipay header matches:', optipayMatchCount, '/', optipayHeaders.length)
  console.log('📊 Payshack header matches:', payshackMatchCount, '/', payshackHeaders.length)
  
  // Если больше совпадений с платформой
  if (platformMatchCount > Math.max(optipayMatchCount, payshackMatchCount) && platformMatchCount >= 10) {
    console.log('📊 Detected: Platform format (exact match)')
    return 'platform'
  }
  
  // Если больше совпадений с Payshack
  if (payshackMatchCount > Math.max(platformMatchCount, optipayMatchCount) && payshackMatchCount >= 5) {
    console.log('📊 Detected: Payshack format (exact match)')
    return 'payshack'
  }
  
  // Если больше совпадений с Optipay
  if (optipayMatchCount > Math.max(platformMatchCount, payshackMatchCount) && optipayMatchCount >= 10) {
    console.log('📊 Detected: Optipay format (exact match)')
    return 'optipay'
  }
  
  // Fallback на старую логику
  if (headerStr.includes('foreign operation id') || 
      headerStr.includes('client operation id') || 
      headerStr.includes('initial amount') || 
      headerStr.includes('result amount')) {
    console.log('📊 Detected: Platform format (fallback)')
    return 'platform'
  }
  
  if (headerStr.includes('tracking id') || 
      (headerStr.includes('status') && headerStr.includes('amount'))) {
    console.log('📊 Detected: Optipay format (fallback)')
    return 'optipay'
  }

  if (headerStr.includes('transaction id') && headerStr.includes('order id')) {
    console.log('📊 Detected: Payshack format (fallback)')
    return 'payshack'
  }
  
  // По умолчанию считаем Optipay
  console.log('📊 Default: Optipay format')
  return 'optipay'
}

export function parseCSV(text, dataType = null) {
  console.log('=== CSV PARSER DEBUG ===')
  console.log('Raw text length:', text.length)
  console.log('First 500 chars:', text.substring(0, 500))
  console.log('Last 500 chars:', text.substring(text.length - 500))
  
  try {
    // Разделяем на строки
    const lines = text.split(/\r?\n/).filter(line => line.trim())
    console.log('Lines found:', lines.length)
    
    if (lines.length === 0) {
      console.error('No lines found in CSV')
      return []
    }
    
    // Первая строка - заголовки
    const headerLine = lines[0].trim()
    console.log('Header line:', headerLine)
    console.log('Header line length:', headerLine.length)
    
    // Автоопределение разделителя
    let delimiter = ';'
    if (headerLine.includes(';')) {
      delimiter = ';'
    } else if (headerLine.includes(',')) {
      delimiter = ','
    } else if (headerLine.includes('\t')) {
      delimiter = '\t'
    }
    
    console.log('Using delimiter:', delimiter)
    
    // Парсим заголовки
    const headers = headerLine.split(delimiter).map(h => h.trim().replace(/"/g, ''))
    console.log('Headers count:', headers.length)
    console.log('Headers:', headers)
    
    // Детальный анализ заголовков для сверки
    console.log('🔍 HEADER ANALYSIS FOR RECONCILIATION:')
    console.log('🔍 All headers (lowercase):', headers.map(h => h.toLowerCase()))
    
    // Ищем ключевые поля для сверки
    const statusFields = headers.filter(h => h.toLowerCase().includes('status'))
    const idFields = headers.filter(h => h.toLowerCase().includes('id') || h.toLowerCase().includes('tracking'))
    const amountFields = headers.filter(h => h.toLowerCase().includes('amount'))
    
    console.log('🔍 Status fields found:', statusFields)
    console.log('🔍 ID fields found:', idFields)
    console.log('🔍 Amount fields found:', amountFields)
    
    // Определяем формат данных автоматически
    const detectedFormat = detectDataFormat(headers)
    console.log('Detected format:', detectedFormat)
    
    // Определяем тип данных автоматически, если не передан
    let finalDataType = dataType || detectedFormat
    
    // Специальная проверка для файла платформы с одной строкой данных
    if (lines.length === 2 && !dataType) {
      console.log('🔍 Detected file with only 2 lines, checking for platform format...')
      const headerStr = headers.join(' ').toLowerCase()
      
      // Проверяем наличие ключевых заголовков платформы
      const platformKeywords = ['foreign operation id', 'client operation id', 'initial amount', 'result amount']
      const platformMatches = platformKeywords.filter(keyword => headerStr.includes(keyword)).length
      
      if (platformMatches >= 2) {
        console.log('🔍 Platform keywords found, forcing platform format')
        finalDataType = 'platform'
      }
    }
    
    console.log('Final data type:', finalDataType)
    
    const data = []
    
    // Специальная обработка для файла платформы с неправильной структурой
    if (finalDataType === 'platform' && lines.length === 2) {
      console.log('🔧 Detected platform file with single data line, processing specially...')
      
      // Проверяем, не смешались ли заголовки с данными
      if (headers.length > 50) {
        console.log('⚠️ Too many headers detected, likely mixed with data. Attempting to fix...')
        
        // Ищем правильные заголовки в начале строки
        const expectedPlatformHeaders = [
          'User ID', 'Operation ID', 'Status', 'Foreign Operation Id', 'Client Operation ID', 
          'Reference ID', 'Created At', 'Method', 'Initial Amount', 'Initial Currency', 
          'Result Amount', 'Result Currency', 'Code', 'Message', 'Details', 
          'Payment Channel Name', 'Original Error Message', 'Endpoint'
        ]
        
        // Берем вторую строку (данные)
        const dataLine = lines[1].trim()
        console.log('Data line length:', dataLine.length)
        
        // Разбиваем по разделителю
        const allValues = dataLine.split(delimiter).map(v => v.trim().replace(/"/g, ''))
        console.log('Total values found:', allValues.length)
        
        // Используем правильные заголовки
        const correctHeaders = expectedPlatformHeaders
        console.log('Using correct headers count:', correctHeaders.length)
        
        // Проверяем, что количество значений кратно количеству заголовков
        const valuesPerRecord = correctHeaders.length
        const recordCount = Math.floor(allValues.length / valuesPerRecord)
        
        console.log('Values per record:', valuesPerRecord)
        console.log('Calculated record count:', recordCount)
        
        // Проверяем остаток
        const remainder = allValues.length % valuesPerRecord
        if (remainder > 0) {
          console.warn('⚠️ Warning: Values count is not perfectly divisible by headers count. Remainder:', remainder)
        }
        
        // Создаем записи
        for (let i = 0; i < recordCount; i++) {
          const row = {}
          const startIndex = i * valuesPerRecord
          
          correctHeaders.forEach((header, headerIndex) => {
            const valueIndex = startIndex + headerIndex
            if (valueIndex < allValues.length) {
              row[header] = allValues[valueIndex] || ''
            } else {
              row[header] = ''
              console.warn('⚠️ Value index out of bounds:', valueIndex, 'for header:', header)
            }
          })
          
          data.push(row)
        }
        
        console.log('Created records from single line:', data.length)
        
        // Показываем первые несколько записей для проверки
        if (data.length > 0) {
          console.log('First record sample:', data[0])
          if (data.length > 1) {
            console.log('Second record sample:', data[1])
          }
        }
      } else {
        // Стандартная обработка для нормального количества заголовков
        const dataLine = lines[1].trim()
        console.log('Data line length:', dataLine.length)
        
        const allValues = dataLine.split(delimiter).map(v => v.trim().replace(/"/g, ''))
        console.log('Total values found:', allValues.length)
        console.log('Expected headers count:', headers.length)
        
        const valuesPerRecord = headers.length
        const recordCount = Math.floor(allValues.length / valuesPerRecord)
        
        console.log('Values per record:', valuesPerRecord)
        console.log('Calculated record count:', recordCount)
        
        const remainder = allValues.length % valuesPerRecord
        if (remainder > 0) {
          console.warn('⚠️ Warning: Values count is not perfectly divisible by headers count. Remainder:', remainder)
        }
        
        for (let i = 0; i < recordCount; i++) {
          const row = {}
          const startIndex = i * valuesPerRecord
          
          headers.forEach((header, headerIndex) => {
            const valueIndex = startIndex + headerIndex
            if (valueIndex < allValues.length) {
              row[header] = allValues[valueIndex] || ''
            } else {
              row[header] = ''
              console.warn('⚠️ Value index out of bounds:', valueIndex, 'for header:', header)
            }
          })
          
          data.push(row)
        }
        
        console.log('Created records from single line:', data.length)
        
        if (data.length > 0) {
          console.log('First record sample:', data[0])
          if (data.length > 1) {
            console.log('Second record sample:', data[1])
          }
        }
      }
    } else if (finalDataType === 'platform' && lines.length > 2) {
      // Альтернативная обработка для файла платформы с нормальной структурой
      console.log('🔧 Processing platform file with normal structure...')
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue
        
        const values = line.split(delimiter).map(v => v.trim().replace(/"/g, ''))
        
        const row = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })
        
        data.push(row)
      }
      
      console.log('Processed platform records:', data.length)
    } else {
      // Стандартная обработка для нормальных CSV файлов
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue
        
        const values = line.split(delimiter).map(v => v.trim().replace(/"/g, ''))
        
        const row = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })
        
        data.push(row)
      }
    }
    
    console.log('Parsed data count:', data.length)
    
    // Нормализуем данные
    const normalizedData = normalizeData(data, detectedFormat, finalDataType)
    console.log('Normalized data count:', normalizedData.length)
    
    // Проверим статистику статусов
    const statusCounts = {}
    normalizedData.forEach(row => {
      const status = row.status || 'empty'
      statusCounts[status] = (statusCounts[status] || 0) + 1
    })
    
    console.log('Status distribution:', statusCounts)
    
    return normalizedData
    
  } catch (error) {
    console.error('Error parsing CSV:', error)
    return []
  }
} 