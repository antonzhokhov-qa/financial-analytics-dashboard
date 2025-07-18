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

// Функция для нормализации данных из разных форматов
function normalizeData(data, format, dataType = 'merchant') {
  if (dataType === 'merchant') {
    // Нормализация для формата провайдера
    return data.map(row => ({
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
      }).format(parseFloat((row['Fee'] || row['Комиссия'] || '0').replace(',', '.')) || 0)
    }))
  } else {
    // Нормализация для формата платформы
    return data.map(row => ({
      id: row['Reference ID'] || row['ID'] || row['ID операции'] || '',
      status: row['Status'] || row['Статус'] || '',
      amount: parseFloat((row['Initial Amount'] || row['Amount'] || row['Сумма'] || '0').replace(',', '.')) || 0,
      type: row['Type'] || row['Operation Type'] || row['Тип операции'] || '',
      company: row['Company'] || row['Компания'] || '',
      fee: parseFloat((row['Fee'] || row['Комиссия'] || '0').replace(',', '.')) || 0,
      feeRatio: row['Fee Ratio'] || '0%',
      
      userName: row['Username'] || row['User Name'] || row['Пользователь'] || '',
      userId: row['User ID'] || row['ID пользователя'] || '',
      fullName: row['Full Name'] || row['Name'] || row['Имя'] || '',
      
      createdAt: row['Created At'] || row['Creation Date'] || row['Дата создания'] || '',
      processedAt: row['Processed At'] || row['Processing Date'] || row['Дата обработки'] || '',
      
      paymentMethod: row['Method'] || row['Payment Method'] || row['Способ оплаты'] || '',
      paymentGateway: row['Payment Gateway'] || '',
      recipientName: row['Recipient Name'] || row['Имя получателя'] || '',
      recipientAccount: row['Recipient Account'] || row['Счет получателя'] || '',
      
      hash: row['Hash'] || row['Хэш'] || '',
      ipAddress: row['IP Address'] || row['IP адрес'] || '',
      receipt: row['Receipt'] || row['Квитанция'] || '',
      explanation: row['Explanation'] || row['Объяснение'] || '',
      explanationType: row['Explanation Type'] || row['Тип объяснения'] || '',
      
      linkId: row['Link ID'] || row['ID ссылки'] || '',
      
      isCompleted: (row['Status'] || row['Статус'] || '').toLowerCase() === 'success',
      isCanceled: false, // Платформа не имеет отмененных статусов
      isFailed: (row['Status'] || row['Статус'] || '').toLowerCase() === 'fail',
      
      // Форматированные суммы (в TRY для всех типов)
      amountFormatted: new Intl.NumberFormat('tr-TR', { 
        style: 'currency', 
        currency: 'TRY' 
      }).format(parseFloat((row['Initial Amount'] || row['Amount'] || row['Сумма'] || '0').replace(',', '.')) || 0),
      
      feeFormatted: new Intl.NumberFormat('tr-TR', { 
        style: 'currency', 
        currency: 'TRY' 
      }).format(parseFloat((row['Fee'] || row['Комиссия'] || '0').replace(',', '.')) || 0)
    }))
  }
}

// Функция для определения формата данных
function detectDataFormat(headers) {
  const headerStr = headers.join(' ').toLowerCase()
  
  // Проверяем наличие русских заголовков (формат провайдера)
  if (headerStr.includes('идентификатор') || headerStr.includes('статус') || headerStr.includes('сумма')) {
    return 'merchant'
  }
  
  // Проверяем наличие английских заголовков (формат провайдера)
  if (headerStr.includes('tracking id') || headerStr.includes('status') || headerStr.includes('amount') || headerStr.includes('payment method')) {
    return 'merchant'
  }
  
  // Проверяем наличие английских заголовков (формат платформы)
  if (headerStr.includes('reference id') || headerStr.includes('initial amount') || headerStr.includes('method')) {
    return 'platform'
  }
  
  // По умолчанию считаем форматом провайдера
  return 'merchant'
}

export function parseCSV(text, dataType = null) {
  console.log('=== CSV PARSER DEBUG ===')
  console.log('Raw text length:', text.length)
  console.log('First 500 chars:', text.substring(0, 500))
  
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
    console.log('Headers:', headers)
    
    // Определяем формат данных автоматически
    const detectedFormat = detectDataFormat(headers)
    console.log('Detected format:', detectedFormat)
    
    // Определяем тип данных автоматически, если не передан
    const finalDataType = dataType || detectedFormat
    console.log('Final data type:', finalDataType)
    
    const data = []
    
    // Парсим данные
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