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
  
  // Если обычные разделители не найдены, возможно данные в одной строке
  // Попробуем найти паттерн повторяющихся ID
  const idPattern = /01981[0-9a-f]{32}/g
  const matches = text.match(idPattern)
  
  if (matches && matches.length > 1) {
    console.log(`Found ${matches.length} record patterns, might be single-line CSV`)
    return 'PATTERN_BASED'
  }
  
  return '\n' // По умолчанию
}

// Функция для разбития CSV на записи, если они в одной строке
function splitRecords(text) {
  const recordSeparator = detectRecordSeparator(text)
  
  if (recordSeparator === 'PATTERN_BASED') {
    // Если записи в одной строке, попробуем разделить по паттерну ID
    const idPattern = /(01981[0-9a-f]{32})/g
    const parts = text.split(idPattern).filter(part => part.trim())
    
    const records = []
    let currentRecord = ''
    
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].match(/^01981[0-9a-f]{32}$/)) {
        // Это ID, начинаем новую запись
        if (currentRecord) {
          records.push(currentRecord.trim())
        }
        currentRecord = parts[i]
      } else {
        // Это продолжение записи
        currentRecord += parts[i]
      }
    }
    
    if (currentRecord) {
      records.push(currentRecord.trim())
    }
    
    console.log(`Split into ${records.length} records by pattern`)
    return records
  } else {
    // Обычное разделение по переносам строк
    return text.split(recordSeparator)
  }
}

// Функция для нормализации данных из разных форматов
function normalizeData(data, format) {
  if (format === 'provider') {
    // Нормализация для формата провайдера
    return data.map(row => ({
      // Основные поля
      id: row['Идентификатор отслеживания'] || row['Tracking ID'] || '',
      status: row['Status'] || '',
      amount: parseFloat((row['Amount'] || row['Сумма транзакции'] || '0').replace(',', '.')) || 0,
      type: row['Тип'] || row['Type'] || '',
      company: row['Компания'] || row['Company'] || '',
      fee: parseFloat((row['Fee'] || '0').replace(',', '.')) || 0,
      feeRatio: row['Fee Ratio'] || '0%',
      
      // Пользователь
      userName: row['Имя пользователя'] || row['Username'] || '',
      userId: row['Идентификатор пользователя'] || row['User ID'] || '',
      fullName: row['Имя'] || row['Full Name'] || '',
      
      // Время
      createdAt: row['Время создания'] || row['Created At'] || '',
      processedAt: row['Время обработки'] || row['Processed At'] || '',
      
      // Платежная информация
      paymentMethod: row['Метод оплаты'] || row['Payment Method'] || '',
      paymentGateway: row['Payment Gateway'] || '',
      recipientName: row['Имя получателя'] || row['Recipient Name'] || '',
      recipientAccount: row['Номер счета получателя'] || row['Recipient Account'] || '',
      
      // Техническая информация
      hash: row['Хэш-код'] || row['Hash'] || '',
      ipAddress: row['IP адрес клиента'] || row['IP Address'] || '',
      receipt: row['Квитанция'] || row['Receipt'] || '',
      explanation: row['Объяснение'] || row['Explanation'] || '',
      explanationType: row['[Explanation type]'] || row['Explanation Type'] || '',
      
      // Дополнительные поля для совместимости
      linkId: row['Идентификатор ссылки'] || row['Link ID'] || '',
      
      // Вычисляемые поля
      isCompleted: (row['Status'] || '').toLowerCase() === 'completed',
      isCanceled: (row['Status'] || '').toLowerCase() === 'canceled',
      isFailed: (row['Status'] || '').toLowerCase() === 'failed',
      
      // Форматированные суммы
      amountFormatted: new Intl.NumberFormat('ru-RU', { 
        style: 'currency', 
        currency: 'RUB' 
      }).format(parseFloat((row['Amount'] || row['Сумма транзакции'] || '0').replace(',', '.')) || 0),
      
      feeFormatted: new Intl.NumberFormat('ru-RU', { 
        style: 'currency', 
        currency: 'RUB' 
      }).format(parseFloat((row['Fee'] || '0').replace(',', '.')) || 0)
    }))
  } else {
    // Нормализация для старого формата
    return data.map(row => ({
      id: row['ID'] || row['Tracking ID'] || '',
      status: row['Status'] || row['Operation State'] || '',
      amount: parseFloat((row['Initial Amount'] || row['Amount'] || '0').replace(',', '.')) || 0,
      type: row['Type'] || row['Operation Type'] || '',
      company: row['Company'] || '',
      fee: parseFloat((row['Fee'] || '0').replace(',', '.')) || 0,
      feeRatio: row['Fee Ratio'] || '0%',
      
      userName: row['Username'] || row['User Name'] || '',
      userId: row['User ID'] || '',
      fullName: row['Full Name'] || row['Name'] || '',
      
      createdAt: row['Created At'] || row['Creation Date'] || '',
      processedAt: row['Processed At'] || row['Processing Date'] || '',
      
      paymentMethod: row['Payment Method'] || '',
      paymentGateway: row['Payment Gateway'] || '',
      recipientName: row['Recipient Name'] || '',
      recipientAccount: row['Recipient Account'] || '',
      
      hash: row['Hash'] || '',
      ipAddress: row['IP Address'] || '',
      receipt: row['Receipt'] || '',
      explanation: row['Explanation'] || '',
      explanationType: row['Explanation Type'] || '',
      
      linkId: row['Link ID'] || '',
      
      isCompleted: (row['Status'] || '').toLowerCase() === 'completed',
      isCanceled: (row['Status'] || '').toLowerCase() === 'canceled',
      isFailed: (row['Status'] || '').toLowerCase() === 'failed',
      
      amountFormatted: new Intl.NumberFormat('ru-RU', { 
        style: 'currency', 
        currency: 'RUB' 
      }).format(parseFloat((row['Initial Amount'] || row['Amount'] || '0').replace(',', '.')) || 0),
      
      feeFormatted: new Intl.NumberFormat('ru-RU', { 
        style: 'currency', 
        currency: 'RUB' 
      }).format(parseFloat((row['Fee'] || '0').replace(',', '.')) || 0)
    }))
  }
}

// Функция для определения формата данных
function detectDataFormat(headers) {
  const headerStr = headers.join(' ').toLowerCase()
  
  // Проверяем наличие русских заголовков (формат провайдера)
  if (headerStr.includes('идентификатор') || headerStr.includes('статус') || headerStr.includes('сумма')) {
    return 'provider'
  }
  
  // Проверяем наличие английских заголовков (старый формат)
  if (headerStr.includes('tracking id') || headerStr.includes('operation state') || headerStr.includes('initial amount')) {
    return 'legacy'
  }
  
  // По умолчанию считаем новым форматом
  return 'provider'
}

// Альтернативный парсер для тестирования
export function parseCSVAlternative(text) {
  console.log('=== ALTERNATIVE CSV PARSER ===')
  
  // Попробуем разные подходы к парсингу
  const records = splitRecords(text)
  console.log('Records after splitting:', records.length)
  
  if (records.length === 0) return []
  
  // Первая запись должна быть заголовками
  const firstRecord = records[0].trim()
  console.log('First record:', firstRecord)
  
  // Попробуем найти правильный разделитель
  const delimiters = [';', ',', '\t', '|']
  let bestDelimiter = ';'
  let maxFields = 0
  
  delimiters.forEach(delimiter => {
    const fields = firstRecord.split(delimiter)
    console.log(`Delimiter "${delimiter}": ${fields.length} fields`)
    if (fields.length > maxFields) {
      maxFields = fields.length
      bestDelimiter = delimiter
    }
  })
  
  console.log(`Best delimiter: "${bestDelimiter}" with ${maxFields} fields`)
  
  const headers = firstRecord.split(bestDelimiter).map(h => h.trim().replace(/"/g, ''))
  console.log('Clean headers:', headers)
  
  const data = []
  
  for (let i = 1; i < records.length; i++) {
    const record = records[i].trim()
    if (!record) continue
    
    const values = record.split(bestDelimiter).map(v => v.trim().replace(/"/g, ''))
    
    const row = {}
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    
    data.push(row)
  }
  
  console.log('Alternative parser result:', data.length, 'rows')
  return data
}

export function parseCSV(text) {
  console.log('=== CSV PARSER DEBUG ===')
  console.log('Raw text length:', text.length)
  console.log('First 500 chars:', text.substring(0, 500))
  
  // Используем новую функцию для разделения записей
  const records = splitRecords(text)
  console.log('Records after splitting:', records.length)
  
  if (records.length === 0) {
    console.error('No records found in CSV')
    return []
  }
  
  // Проверим разные варианты разделителей полей
  const firstRecord = records[0].trim()
  console.log('First record:', firstRecord)
  console.log('Contains semicolon:', firstRecord.includes(';'))
  console.log('Contains comma:', firstRecord.includes(','))
  console.log('Contains tab:', firstRecord.includes('\t'))
  
  // Попробуем определить разделитель автоматически
  let delimiter = ';'
  if (firstRecord.includes(';')) {
    delimiter = ';'
  } else if (firstRecord.includes(',')) {
    delimiter = ','
  } else if (firstRecord.includes('\t')) {
    delimiter = '\t'
  }
  
  console.log('Using delimiter:', delimiter)
  
  const headers = firstRecord.split(delimiter).map(h => h.trim())
  console.log('Headers found:', headers)
  console.log('Headers count:', headers.length)
  
  // Определяем формат данных
  const format = detectDataFormat(headers)
  console.log('Detected format:', format)
  
  const data = []
  
  for (let i = 1; i < records.length; i++) {
    const record = records[i].trim()
    if (!record) continue
    
    console.log(`Processing record ${i}:`, record.substring(0, 100) + '...')
    
    const values = record.split(delimiter)
    console.log(`Values in record ${i}:`, values.length, 'values')
    
    const row = {}
    
    headers.forEach((header, index) => {
      row[header] = values[index] ? values[index].trim() : ''
    })
    
    // Детальная отладка первых строк
    if (i <= 3) {
      console.log(`Record ${i} parsed:`, row)
      console.log(`Status field: "${row.Status}"`)
    }
    
    data.push(row)
  }
  
  console.log('Final parsed data count:', data.length)
  
  // Нормализуем данные в зависимости от формата
  const normalizedData = normalizeData(data, format)
  console.log('Normalized data count:', normalizedData.length)
  
  // Проверим статистику статусов
  const statusCounts = {}
  normalizedData.forEach(row => {
    const status = row.status || 'empty'
    statusCounts[status] = (statusCounts[status] || 0) + 1
  })
  
  console.log('Status distribution:', statusCounts)
  
  // Если данных нет, попробуем альтернативный парсер
  if (normalizedData.length === 0) {
    console.log('Trying alternative parser...')
    const altData = parseCSVAlternative(text)
    return normalizeData(altData, format)
  }
  
  return normalizedData
} 