import React, { useState, useMemo, useCallback } from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, Filter, Download, Eye, EyeOff } from 'lucide-react'

const VirtualizedDataTable = ({ 
  data = [], 
  dataType = 'merchant', 
  isServerData = false,
  jobId = null,
  onLoadMore = null 
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState('')
  const [sortDirection, setSortDirection] = useState('asc')
  const [visibleColumns, setVisibleColumns] = useState({})
  const [filterStatus, setFilterStatus] = useState('')

  // Определяем колонки в зависимости от типа данных
  const columns = useMemo(() => {
    if (dataType === 'platform') {
      return [
        { key: 'id', label: 'ID операции', width: '150px', sortable: true },
        { key: 'foreignOperationId', label: 'Foreign ID', width: '200px', sortable: true },
        { key: 'status', label: 'Статус', width: '120px', sortable: true },
        { key: 'amount', label: 'Сумма', width: '120px', sortable: true, type: 'currency' },
        { key: 'createdAt', label: 'Дата создания', width: '180px', sortable: true, type: 'date' },
        { key: 'method', label: 'Метод', width: '150px', sortable: true },
        { key: 'currency', label: 'Валюта', width: '80px', sortable: true }
      ]
    } else {
      // Merchant данные
      return [
        { key: 'trackingId', label: 'Tracking ID', width: '200px', sortable: true },
        { key: 'status', label: 'Статус', width: '120px', sortable: true },
        { key: 'amount', label: 'Сумма', width: '120px', sortable: true, type: 'currency' },
        { key: 'paymentMethod', label: 'Метод оплаты', width: '150px', sortable: true },
        { key: 'company', label: 'Компания', width: '150px', sortable: true },
        { key: 'createdAt', label: 'Дата создания', width: '180px', sortable: true, type: 'date' },
        { key: 'currency', label: 'Валюта', width: '80px', sortable: true },
        { key: 'provider', label: 'Провайдер', width: '100px', sortable: true }
      ]
    }
  }, [dataType])

  // Инициализируем видимые колонки
  React.useEffect(() => {
    const initialVisible = {}
    columns.forEach(col => {
      initialVisible[col.key] = true
    })
    setVisibleColumns(initialVisible)
  }, [columns])

  // Фильтрация и поиск данных
  const filteredData = useMemo(() => {
    let filtered = [...data]

    // Поиск по всем полям
    if (searchTerm) {
      filtered = filtered.filter(row => 
        Object.values(row).some(value => 
          value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Фильтр по статусу
    if (filterStatus) {
      filtered = filtered.filter(row => 
        row.status && row.status.toLowerCase() === filterStatus.toLowerCase()
      )
    }

    return filtered
  }, [data, searchTerm, filterStatus])

  // Сортировка данных
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData

    return [...filteredData].sort((a, b) => {
      let aVal = a[sortField]
      let bVal = b[sortField]

      // Обработка разных типов данных
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal ? bVal.toLowerCase() : ''
      }
      
      if (typeof aVal === 'number' || !isNaN(aVal)) {
        aVal = parseFloat(aVal) || 0
        bVal = parseFloat(bVal) || 0
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredData, sortField, sortDirection])

  // Пагинация
  const totalPages = Math.ceil(sortedData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentData = sortedData.slice(startIndex, endIndex)

  // Обработчики
  const handleSort = useCallback((field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }, [sortField])

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page)
    
    // Если это серверные данные и мы приближаемся к концу, загружаем больше
    if (isServerData && page > totalPages - 2 && onLoadMore) {
      onLoadMore(page + 1)
    }
  }, [totalPages, isServerData, onLoadMore])

  const toggleColumnVisibility = useCallback((columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }))
  }, [])

  // Форматирование значений
  const formatValue = useCallback((value, column) => {
    if (!value && value !== 0) return 'N/A'

    switch (column.type) {
      case 'currency':
        const numValue = parseFloat(value)
        if (isNaN(numValue)) return value
        return new Intl.NumberFormat('ru-RU', {
          style: 'currency',
          currency: 'RUB',
          maximumFractionDigits: 2
        }).format(numValue)
      
      case 'date':
        try {
          const date = new Date(value)
          return date.toLocaleString('ru-RU')
        } catch {
          return value
        }
      
      default:
        return value.toString()
    }
  }, [])

  // Получение статуса для цветовой индикации
  const getStatusColor = useCallback((status) => {
    if (!status) return 'text-gray-400'
    
    const normalizedStatus = status.toLowerCase()
    if (normalizedStatus.includes('success') || normalizedStatus.includes('completed')) {
      return 'text-green-400 bg-green-500/10'
    }
    if (normalizedStatus.includes('failed') || normalizedStatus.includes('error')) {
      return 'text-red-400 bg-red-500/10'
    }
    if (normalizedStatus.includes('pending') || normalizedStatus.includes('progress')) {
      return 'text-yellow-400 bg-yellow-500/10'
    }
    if (normalizedStatus.includes('canceled')) {
      return 'text-gray-400 bg-gray-500/10'
    }
    return 'text-blue-400 bg-blue-500/10'
  }, [])

  // Уникальные статусы для фильтра
  const uniqueStatuses = useMemo(() => {
    const statuses = [...new Set(data.map(row => row.status).filter(Boolean))]
    return statuses.sort()
  }, [data])

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
      {/* Заголовок и контролы */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">
            📊 Данные транзакций
          </h3>
          <p className="text-white/60 text-sm">
            Показано {currentData.length} из {sortedData.length} записей 
            {data.length !== sortedData.length && ` (всего загружено: ${data.length})`}
            {isServerData && jobId && (
              <span className="ml-2 px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                Серверные данные
              </span>
            )}
          </p>
        </div>

        {/* Контролы поиска и фильтрации */}
        <div className="flex flex-wrap items-center space-x-4">
          {/* Поиск */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="Поиск..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>

          {/* Фильтр по статусу */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Все статусы</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status} className="bg-gray-800">
                {status}
              </option>
            ))}
          </select>

          {/* Размер страницы */}
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setCurrentPage(1)
            }}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={25} className="bg-gray-800">25 записей</option>
            <option value={50} className="bg-gray-800">50 записей</option>
            <option value={100} className="bg-gray-800">100 записей</option>
            <option value={200} className="bg-gray-800">200 записей</option>
          </select>
        </div>
      </div>

      {/* Управление колонками */}
      <div className="mb-4 p-3 bg-white/5 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <EyeOff className="h-4 w-4 text-white/60" />
          <span className="text-white/60 text-sm">Видимость колонок:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {columns.map(column => (
            <button
              key={column.key}
              onClick={() => toggleColumnVisibility(column.key)}
              className={`px-3 py-1 rounded text-xs transition-all ${
                visibleColumns[column.key]
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
              }`}
            >
              {visibleColumns[column.key] ? <Eye className="h-3 w-3 inline mr-1" /> : <EyeOff className="h-3 w-3 inline mr-1" />}
              {column.label}
            </button>
          ))}
        </div>
      </div>

      {/* Таблица */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              {columns.filter(col => visibleColumns[col.key]).map(column => (
                <th
                  key={column.key}
                  className={`text-left py-3 px-4 text-white/80 font-medium ${
                    column.sortable ? 'cursor-pointer hover:text-white' : ''
                  }`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-2">
                    <span>{column.label}</span>
                    {column.sortable && sortField === column.key && (
                      <span className="text-blue-400">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, index) => (
              <tr
                key={row.id || row.trackingId || index}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                {columns.filter(col => visibleColumns[col.key]).map(column => (
                  <td key={column.key} className="py-3 px-4 text-white/90">
                    {column.key === 'status' ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row[column.key])}`}>
                        {row[column.key] || 'N/A'}
                      </span>
                    ) : (
                      <span className="text-sm">
                        {formatValue(row[column.key], column)}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Пустое состояние */}
        {currentData.length === 0 && (
          <div className="text-center py-12">
            <div className="text-white/40 text-lg mb-2">📭</div>
            <p className="text-white/60">
              {searchTerm || filterStatus ? 'Нет данных, соответствующих фильтрам' : 'Нет данных для отображения'}
            </p>
          </div>
        )}
      </div>

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
          <div className="text-white/60 text-sm">
            Страница {currentPage} из {totalPages}
            <span className="ml-2">
              (записи {startIndex + 1}-{Math.min(endIndex, sortedData.length)} из {sortedData.length})
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Первая страница */}
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>

            {/* Предыдущая страница */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Номера страниц */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentPage === pageNum
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}

            {/* Следующая страница */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Последняя страница */}
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default VirtualizedDataTable 