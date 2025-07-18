import { useState } from 'react'
import { parseCSV, parseCSVAlternative } from '../utils/csvParser'

function CSVDebugger({ csvText, onDataParsed }) {
  const [selectedParser, setSelectedParser] = useState('main')
  const [parsedData, setParsedData] = useState(null)

  const testParser = (parserType) => {
    let data
    if (parserType === 'main') {
      data = parseCSV(csvText)
    } else {
      data = parseCSVAlternative(csvText)
    }
    setParsedData(data)
    if (data.length > 0) {
      onDataParsed(data)
    }
  }

  if (!csvText) return null

  // Анализ структуры файла
  const lines = csvText.split('\n')
  const hasNewlines = lines.length > 1
  const hasCarriageReturn = csvText.includes('\r')
  const idPattern = /01981[0-9a-f]{32}/g
  const idMatches = csvText.match(idPattern)
  const idCount = idMatches ? idMatches.length : 0

  return (
    <div className="glass rounded-xl p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">🔧 Отладка CSV</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="font-medium mb-2">Информация о файле:</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Размер: {csvText.length} символов</p>
            <p>Строк (по \\n): {lines.length}</p>
            <p>Есть переносы строк: {hasNewlines ? 'Да' : 'Нет'}</p>
            <p>Есть \\r: {hasCarriageReturn ? 'Да' : 'Нет'}</p>
            <p>Найдено ID паттернов: {idCount}</p>
            <p>Содержит ";"?: {csvText.includes(';') ? 'Да' : 'Нет'}</p>
            <p>Содержит ","?: {csvText.includes(',') ? 'Да' : 'Нет'}</p>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Первые 300 символов:</h4>
          <div className="text-xs font-mono bg-gray-100 p-2 rounded max-h-32 overflow-y-auto">
            {csvText.substring(0, 300)}...
          </div>
        </div>
      </div>

      {!hasNewlines && idCount > 1 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-yellow-800 text-sm">
            ⚠️ <strong>Обнаружена проблема:</strong> Файл содержит {idCount} записей, но все данные находятся в одной строке. 
            Это может означать, что файл был сохранен неправильно или переносы строк отсутствуют.
          </p>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => testParser('main')}
          className={`px-4 py-2 rounded ${selectedParser === 'main' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Основной парсер
        </button>
        <button
          onClick={() => testParser('alternative')}
          className={`px-4 py-2 rounded ${selectedParser === 'alternative' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Альтернативный парсер
        </button>
      </div>

      {parsedData && (
        <div>
          <h4 className="font-medium mb-2">Результат парсинга:</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Строк обработано: <span className="font-semibold">{parsedData.length}</span></p>
            {parsedData.length > 0 && (
              <>
                <p>Заголовки: {Object.keys(parsedData[0]).join(', ')}</p>
                <div className="mt-2">
                  <p className="font-medium">Первая строка данных:</p>
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-1 max-h-40 overflow-y-auto">
                    {JSON.stringify(parsedData[0], null, 2)}
                  </pre>
                </div>
                {parsedData.length > 1 && (
                  <div className="mt-2">
                    <p className="font-medium">Статистика статусов:</p>
                    <div className="text-xs bg-blue-50 p-2 rounded mt-1">
                      {(() => {
                        const statusCounts = {}
                        parsedData.forEach(row => {
                          const status = row.Status || 'пусто'
                          statusCounts[status] = (statusCounts[status] || 0) + 1
                        })
                        return Object.entries(statusCounts).map(([status, count]) => (
                          <div key={status}>{status}: {count}</div>
                        ))
                      })()}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CSVDebugger 