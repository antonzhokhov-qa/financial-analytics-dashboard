import React, { useState, useMemo } from 'react'
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  TrendingUp,
  Filter,
  Download
} from 'lucide-react'

const ReconciliationResults = ({ reconciliationData, onBack }) => {
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('id')
  const [sortOrder, setSortOrder] = useState('asc')

  // Фильтрация данных
  const filteredData = useMemo(() => {
    if (!reconciliationData || !Array.isArray(reconciliationData)) {
      return []
    }

    let filtered = [...reconciliationData]

    switch (filter) {
      case 'matched':
        filtered = filtered.filter(item => !item.hasIssue)
        break
      case 'issues':
        filtered = filtered.filter(item => item.hasIssue)
        break
      case 'status_mismatch':
        filtered = filtered.filter(item => item.issueType?.includes('status'))
        break
      case 'amount_mismatch':
        filtered = filtered.filter(item => item.issueType?.includes('amount'))
        break
      case 'missing':
        filtered = filtered.filter(item => 
          item.issueType?.includes('missing'))
        break
    }

    // Сортировка
    filtered.sort((a, b) => {
      let aVal = a[sortBy] || ''
      let bVal = b[sortBy] || ''
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
      }
      
      aVal = String(aVal).toLowerCase()
      bVal = String(bVal).toLowerCase()
      
      if (sortOrder === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
      }
    })

    return filtered
  }, [reconciliationData, filter, sortBy, sortOrder])

  // Статистика
  const stats = useMemo(() => {
    if (!reconciliationData || !Array.isArray(reconciliationData)) {
      return {
        total: 0,
        matched: 0,
        issues: 0,
        statusMismatch: 0,
        amountMismatch: 0,
        missing: 0,
        matchRate: '0'
      }
    }

    const total = reconciliationData.length
    const matched = reconciliationData.filter(item => !item.hasIssue).length
    const issues = reconciliationData.filter(item => item.hasIssue).length
    const statusMismatch = reconciliationData.filter(item => item.issueType?.includes('status')).length
    const amountMismatch = reconciliationData.filter(item => item.issueType?.includes('amount')).length
    const missing = reconciliationData.filter(item => item.issueType?.includes('missing')).length

    return {
      total,
      matched,
      issues,
      statusMismatch,
      amountMismatch,
      missing,
      matchRate: total > 0 ? ((matched / total) * 100).toFixed(1) : '0'
    }
  }, [reconciliationData])

  // Определяем цвет строки в зависимости от статуса
  const getRowClassName = (item) => {
    if (!item.hasIssue) {
      return 'bg-green-50 hover:bg-green-100' // Зеленый для совпадений
    }

    switch (item.issueType) {
      case 'status':
        return 'bg-yellow-50 hover:bg-yellow-100 border-l-4 border-yellow-400' // Желтый для расхождения статусов
      case 'amount':
        return 'bg-orange-50 hover:bg-orange-100 border-l-4 border-orange-400' // Оранжевый для расхождения сумм
      case 'status, amount':
        return 'bg-red-50 hover:bg-red-100 border-l-4 border-red-400' // Красный для множественных расхождений
      case 'missing_platform':
        return 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-400' // Синий для отсутствующих на платформе
      case 'missing_merchant':
        return 'bg-purple-50 hover:bg-purple-100 border-l-4 border-purple-400' // Фиолетовый для отсутствующих у провайдера
      default:
        return 'bg-gray-50 hover:bg-gray-100'
    }
  }

  // Статусная иконка
  const getStatusIcon = (item) => {
    if (!item.hasIssue) {
      return <CheckCircle2 className="h-5 w-5 text-green-600" />
    }

    switch (item.issueType) {
      case 'status':
      case 'amount':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'status, amount':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'missing_platform':
      case 'missing_merchant':
        return <FileText className="h-5 w-5 text-blue-600" />
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Заголовок и навигация */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            🔄 Результаты сверки
          </h2>
          <p className="text-gray-600 mt-1">
            Сравнение данных провайдера и платформы
          </p>
        </div>
        
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          ← Назад
        </button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Всего записей</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg shadow border border-green-200">
          <div className="text-2xl font-bold text-green-700">{stats.matched}</div>
          <div className="text-sm text-green-600">Совпадений</div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg shadow border border-red-200">
          <div className="text-2xl font-bold text-red-700">{stats.issues}</div>
          <div className="text-sm text-red-600">Расхождений</div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg shadow border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-700">{stats.statusMismatch}</div>
          <div className="text-sm text-yellow-600">По статусу</div>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg shadow border border-orange-200">
          <div className="text-2xl font-bold text-orange-700">{stats.amountMismatch}</div>
          <div className="text-sm text-orange-600">По сумме</div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg shadow border border-blue-200">
          <div className="text-2xl font-bold text-blue-700">{stats.missing}</div>
          <div className="text-sm text-blue-600">Отсутствуют</div>
        </div>
      </div>

      {/* Общий рейтинг совпадений */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
            <span className="text-lg font-semibold">Процент совпадений:</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {stats.matchRate}%
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${stats.matchRate}%` }}
          ></div>
        </div>
      </div>

      {/* Фильтры и сортировка */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center">
            <Filter className="h-4 w-4 mr-2 text-gray-600" />
            <span className="text-sm font-medium text-gray-700 mr-2">Фильтр:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="all">Все записи ({stats.total})</option>
              <option value="matched">Совпадения ({stats.matched})</option>
              <option value="issues">Расхождения ({stats.issues})</option>
              <option value="status_mismatch">Расхождение статусов ({stats.statusMismatch})</option>
              <option value="amount_mismatch">Расхождение сумм ({stats.amountMismatch})</option>
              <option value="missing">Отсутствующие ({stats.missing})</option>
            </select>
          </div>

          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700 mr-2">Сортировка:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm mr-2"
            >
              <option value="id">ID</option>
              <option value="merchantStatus">Статус провайдера</option>
              <option value="platformStatus">Статус платформы</option>
              <option value="merchantAmount">Сумма провайдера</option>
              <option value="platformAmount">Сумма платформы</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          <div className="ml-auto">
            <span className="text-sm text-gray-600">
              Показано: {filteredData.length} из {stats.total}
            </span>
          </div>
        </div>
      </div>

      {/* Таблица результатов */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Транзакции
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Провайдер
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Платформа
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Расхождение
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((item, index) => (
                <tr key={`${item.id || item.merchantId || item.platformId || 'unknown'}_${index}`} className={getRowClassName(item)}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(item)}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.merchantId || item.platformId || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.matchType}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.merchantData ? (
                      <div>
                        <div className="text-sm text-gray-900">
                          <span className="font-medium">Статус:</span> {item.merchantStatus}
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Сумма:</span> {item.merchantAmount?.toFixed(2)} TRY
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400 italic">
                        Отсутствует у провайдера
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.platformData ? (
                      <div>
                        <div className="text-sm text-gray-900">
                          <span className="font-medium">Статус:</span> {item.platformStatus}
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Сумма:</span> {item.platformAmount?.toFixed(2)} TRY
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400 italic">
                        Отсутствует на платформе
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.hasIssue ? (
                      <div className="text-sm">
                        {item.issueType?.includes('status') && (
                          <div className="text-yellow-700 mb-1">
                            📊 Статус: {item.merchantStatus} ≠ {item.platformStatus}
                          </div>
                        )}
                        {item.issueType?.includes('amount') && (
                          <div className="text-orange-700 mb-1">
                            💰 Сумма: {item.merchantAmount?.toFixed(2)} ≠ {item.platformAmount?.toFixed(2)}
                          </div>
                        )}
                        {item.issueType?.includes('missing') && (
                          <div className="text-blue-700">
                            📄 {item.issueType === 'missing_platform' ? 'Нет на платформе' : 'Нет у провайдера'}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-green-600 text-sm">
                        ✅ Полное совпадение
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Нет данных для отображения
          </h3>
          <p className="text-gray-600">
            Попробуйте изменить фильтры или загрузить другие файлы
          </p>
        </div>
      )}
    </div>
  )
}

export default ReconciliationResults 