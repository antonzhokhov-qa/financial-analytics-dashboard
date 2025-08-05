import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Search, Filter, Download } from 'lucide-react'

const DataTable = ({ data, dataType = 'merchant' }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)

  // Сбрасываем страницу при изменении поиска
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, data])

  const currency = 'TRY'
  const currencyCode = 'TRY'
  const sourceName = dataType === 'merchant' ? 'провайдера' : 'платформы'

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleString('tr-TR')
    } catch {
      return dateString
    }
  }

  const getStatusColor = (status) => {
    const statusLower = status ? status.toLowerCase() : ''
    if (dataType === 'merchant') {
      switch (statusLower) {
        case 'completed':
          return 'bg-green-500/20 text-green-300 border-green-500/30'
        case 'failed':
          return 'bg-red-500/20 text-red-300 border-red-500/30'
        case 'canceled':
          return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
        default:
          return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
      }
    } else {
      switch (statusLower) {
        case 'success':
          return 'bg-green-500/20 text-green-300 border-green-500/30'
        case 'fail':
          return 'bg-red-500/20 text-red-300 border-red-500/30'
        default:
          return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
      }
    }
  }

  const getStatusLabel = (status) => {
    const statusLower = status ? status.toLowerCase() : ''
    if (dataType === 'merchant') {
      switch (statusLower) {
        case 'completed':
          return 'Завершено'
        case 'failed':
          return 'Неудачно'
        case 'canceled':
          return 'Отменено'
        default:
          return status || 'Неизвестно'
      }
    } else {
      switch (statusLower) {
        case 'success':
          return 'Успешно'
        case 'fail':
          return 'Ошибка'
        default:
          return status || 'Неизвестно'
      }
    }
  }

  // Фильтрация и поиск
  const filteredData = data.filter(row => {
    const searchLower = searchTerm.toLowerCase()
    return (
      (row.id && row.id.toLowerCase().includes(searchLower)) ||
      (row.status && row.status.toLowerCase().includes(searchLower)) ||
      (row.company && row.company.toLowerCase().includes(searchLower)) ||
      (row.userName && row.userName.toLowerCase().includes(searchLower)) ||
      (row.paymentMethod && row.paymentMethod.toLowerCase().includes(searchLower)) ||
      (row.amount && row.amount.toString().includes(searchLower))
    )
  })

  // Сортировка
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0

    let aValue = a[sortConfig.key]
    let bValue = b[sortConfig.key]

    // Обработка числовых значений
    if (sortConfig.key === 'amount' || sortConfig.key === 'fee') {
      aValue = parseFloat(aValue) || 0
      bValue = parseFloat(bValue) || 0
    }

    // Обработка дат
    if (sortConfig.key === 'createdAt' || sortConfig.key === 'processedAt') {
      aValue = new Date(aValue || 0)
      bValue = new Date(bValue || 0)
    }

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1
    }
    return 0
  })

  // Пагинация
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = sortedData.slice(startIndex, endIndex)

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronDown className="w-4 h-4 text-gray-400" />
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-blue-400" />
      : <ChevronDown className="w-4 h-4 text-blue-400" />
  }

  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'status', label: 'Статус', sortable: true },
    { key: 'amount', label: 'Сумма', sortable: true },
    { key: 'company', label: 'Компания', sortable: true, hidden: dataType === 'platform' },
    { key: 'userName', label: 'Пользователь', sortable: true },
    { key: 'paymentMethod', label: 'Метод оплаты', sortable: true },
    { key: 'createdAt', label: 'Дата создания', sortable: true },
    { key: 'fee', label: 'Комиссия', sortable: true }
  ].filter(col => !col.hidden)

  return (
    <div className="space-y-6">
      {/* Заголовок секции */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Детальные данные</h2>
          <p className="text-gray-300">
            {filteredData.length} записей из {data.length} • Валюта: {currency}
          </p>
        </div>
        
        {/* Экспорт */}
        <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Экспорт</span>
        </button>
      </div>

      {/* Поиск и фильтры */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('table.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">
            {filteredData.length} результатов
          </span>
        </div>
      </div>

      {/* Таблица */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/10">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-6 py-4 text-left text-sm font-semibold text-white ${
                      column.sortable ? 'cursor-pointer hover:bg-white/10' : ''
                    }`}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{column.label}</span>
                      {column.sortable && <SortIcon columnKey={column.key} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {currentData.map((row, index) => (
                <tr
                  key={row.id || index}
                  className="hover:bg-white/5 transition-colors duration-200"
                >
                  <td className="px-6 py-4 text-sm text-white font-mono">
                    {row.id || '-'}
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(row.status)}`}>
                      {getStatusLabel(row.status)}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 text-sm text-white font-semibold">
                    {formatCurrency(row.amount)}
                  </td>
                  
                  {dataType === 'merchant' && (
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {row.company || '-'}
                    </td>
                  )}
                  
                  <td className="px-6 py-4 text-sm text-gray-300">
                    <div>
                      <div className="font-medium text-white">{row.fullName || row.userName || '-'}</div>
                      {row.userId && (
                        <div className="text-xs text-gray-400">ID: {row.userId}</div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {row.paymentMethod || '-'}
                  </td>
                  
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {formatDate(row.createdAt)}
                  </td>
                  
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {row.fee ? formatCurrency(row.fee) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-white/5 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Показано {startIndex + 1}-{Math.min(endIndex, filteredData.length)} из {filteredData.length} записей
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Назад
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded-lg transition-colors duration-200 ${
                          currentPage === page
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Вперед
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
          <div className="text-sm text-gray-400">Всего записей</div>
          <div className="text-2xl font-bold text-white">{data.length}</div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
          <div className="text-sm text-gray-400">Отфильтровано</div>
          <div className="text-2xl font-bold text-white">{filteredData.length}</div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
          <div className="text-sm text-gray-400">Общая сумма</div>
          <div className="text-2xl font-bold text-white">
            {formatCurrency(data.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DataTable 