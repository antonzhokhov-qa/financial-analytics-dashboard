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
      console.log(`Operation State field: "${row['Operation State']}"`)
      console.log(`Initial Amount field: "${row['Initial Amount']}"`)
    }
    
    data.push(row)
  }
  
  console.log('Final parsed data count:', data.length)
  
  // Проверим статистику статусов
  const statusCounts = {}
  data.forEach(row => {
    const status = row.Status || 'empty'
    statusCounts[status] = (statusCounts[status] || 0) + 1
  })
  
  console.log('Status distribution:', statusCounts)
  
  // Проверим состояния операций
  const stateCounts = {}
  data.forEach(row => {
    const state = row['Operation State'] || 'empty'
    stateCounts[state] = (stateCounts[state] || 0) + 1
  })
  
  console.log('Operation State distribution:', stateCounts)
  
  // Если данных нет, попробуем альтернативный парсер
  if (data.length === 0) {
    console.log('Trying alternative parser...')
    return parseCSVAlternative(text)
  }
  
  return data
} 