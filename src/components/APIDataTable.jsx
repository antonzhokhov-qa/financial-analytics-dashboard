import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Search, Filter, Download, ExternalLink, User, CreditCard } from 'lucide-react'

const APIDataTable = ({ data }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(15)

  // Сбрасываем страницу при изменении поиска
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, data])

  const formatCurrency = (amount, currency = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      return date.toLocaleString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  const getStatusColor = (status) => {
    const statusLower = status ? status.toLowerCase() : ''
    switch (statusLower) {
      case 'success':
        return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'fail':
        return 'bg-red-500/20 text-red-300 border-red-500/30'
      case 'in_process':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  const getStatusLabel = (status) => {
    const statusLower = status ? status.toLowerCase() : ''
    switch (statusLower) {
      case 'success':
        return 'Успешно'
      case 'fail':
        return 'Ошибка'
      case 'in_process':
        return 'В процессе'
      default:
        return status || 'Неизвестно'
    }
  }

  const getTransactionTypeColor = (type) => {
    const typeLower = type ? type.toLowerCase() : ''
    if (typeLower.includes('deposit') || typeLower === 'пополнение') {
      return 'bg-blue-500/20 text-blue-300'
    } else if (typeLower.includes('withdraw') || typeLower === 'вывод') {
      return 'bg-orange-500/20 text-orange-300'
    }
    return 'bg-purple-500/20 text-purple-300'
  }

  // Фильтрация и поиск
  const filteredData = data.filter(row => {
    const searchLower = searchTerm.toLowerCase()
    return (
      (row.id && row.id.toString().toLowerCase().includes(searchLower)) ||
      (row.status && row.status.toLowerCase().includes(searchLower)) ||
      (row.company && row.company.toLowerCase().includes(searchLower)) ||
      (row.fullName && row.fullName.toLowerCase().includes(searchLower)) ||
      (row.userId && row.userId.toString().toLowerCase().includes(searchLower)) ||
      (row.paymentMethod && row.paymentMethod.toLowerCase().includes(searchLower)) ||
      (row.amount && row.amount.toString().includes(searchLower))
    )
  })

  // Сортировка
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0

    const aValue = a[sortConfig.key] || ''
    const bValue = b[sortConfig.key] || ''

    if (sortConfig.key === 'amount' || sortConfig.key === 'fee') {
      return sortConfig.direction === 'asc' 
        ? parseFloat(aValue) - parseFloat(bValue)
        : parseFloat(bValue) - parseFloat(aValue)
    }

    if (sortConfig.key === 'createdAt' || sortConfig.key === 'processedAt') {
      const aDate = new Date(aValue)
      const bDate = new Date(bValue)
      return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate
    }

    const comparison = aValue.toString().localeCompare(bValue.toString())
    return sortConfig.direction === 'asc' ? comparison : -comparison
  })

  // Пагинация
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentData = sortedData.slice(startIndex, startIndex + itemsPerPage)

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

  return (
    <div className="space-y-6">
      {/* Заголовок секции */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Операции платформы</h2>
          <p className="text-gray-300">
            {filteredData.length} операций из {data.length} • Данные API коллектора
          </p>
        </div>
        
        <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Экспорт</span>
        </button>
      </div>

      {/* Поиск */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск по ID, пользователю, статусу, проекту..."
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
                <th 
                  className="px-4 py-4 text-left text-sm font-semibold text-white cursor-pointer hover:bg-white/10"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center space-x-2">
                    <span>ID Операции</span>
                    <SortIcon columnKey="id" />
                  </div>
                </th>
                <th 
                  className="px-4 py-4 text-left text-sm font-semibold text-white cursor-pointer hover:bg-white/10"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center space-x-2">
                    <span>Статус</span>
                    <SortIcon columnKey="status" />
                  </div>
                </th>
                <th 
                  className="px-4 py-4 text-left text-sm font-semibold text-white cursor-pointer hover:bg-white/10"
                  onClick={() => handleSort('transactionType')}
                >
                  <div className="flex items-center space-x-2">
                    <span>Тип</span>
                    <SortIcon columnKey="transactionType" />
                  </div>
                </th>
                <th 
                  className="px-4 py-4 text-left text-sm font-semibold text-white cursor-pointer hover:bg-white/10"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center space-x-2">
                    <span>Сумма</span>
                    <SortIcon columnKey="amount" />
                  </div>
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-white">
                  Пользователь
                </th>
                <th 
                  className="px-4 py-4 text-left text-sm font-semibold text-white cursor-pointer hover:bg-white/10"
                  onClick={() => handleSort('company')}
                >
                  <div className="flex items-center space-x-2">
                    <span>Проект</span>
                    <SortIcon columnKey="company" />
                  </div>
                </th>
                <th 
                  className="px-4 py-4 text-left text-sm font-semibold text-white cursor-pointer hover:bg-white/10"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center space-x-2">
                    <span>Создано</span>
                    <SortIcon columnKey="createdAt" />
                  </div>
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-white">
                  Детали
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {currentData.map((row, index) => (
                <tr
                  key={row.id || index}
                  className="hover:bg-white/5 transition-colors duration-200"
                >
                  {/* ID Операции */}
                  <td className="px-4 py-4 text-sm">
                    <div className="font-mono text-white text-xs">
                      {row.id ? row.id.slice(-12) : '-'}
                    </div>
                    {row.clientOperationId && (
                      <div className="font-mono text-gray-400 text-xs mt-1">
                        Клиент: {row.clientOperationId.slice(-8)}
                      </div>
                    )}
                  </td>
                  
                  {/* Статус */}
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(row.status)}`}>
                      {getStatusLabel(row.status)}
                    </span>
                    {row.operationState && row.operationState !== row.status && (
                      <div className="text-xs text-gray-400 mt-1">
                        {row.operationState}
                      </div>
                    )}
                  </td>
                  
                  {/* Тип транзакции */}
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTransactionTypeColor(row.transactionType)}`}>
                      {row.transactionType || 'Неизвестно'}
                    </span>
                  </td>
                  
                  {/* Сумма */}
                  <td className="px-4 py-4 text-sm">
                    <div className="font-semibold text-white">
                      {formatCurrency(row.amount)}
                    </div>
                    {row.fee > 0 && (
                      <div className="text-xs text-gray-400">
                        Комиссия: {formatCurrency(row.fee)}
                      </div>
                    )}
                  </td>
                  
                  {/* Пользователь */}
                  <td className="px-4 py-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        {row.fullName ? (
                          <>
                            <div className="font-medium text-white">{row.fullName}</div>
                            <div className="text-xs text-gray-400">ID: {row.userId}</div>
                          </>
                        ) : (
                          <div className="text-gray-400">ID: {row.userId || '-'}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  {/* Проект */}
                  <td className="px-4 py-4 text-sm">
                    <div className="font-medium text-white">{row.company || '-'}</div>
                    {row.serviceEnv && (
                      <div className="text-xs text-gray-400">{row.serviceEnv}</div>
                    )}
                  </td>
                  
                  {/* Дата создания */}
                  <td className="px-4 py-4 text-sm text-gray-300">
                    <div>{formatDate(row.createdAt)}</div>
                    {row.processedAt && row.processedAt !== row.createdAt && (
                      <div className="text-xs text-gray-500 mt-1">
                        Обработано: {formatDate(row.processedAt)}
                      </div>
                    )}
                  </td>
                  
                  {/* Детали */}
                  <td className="px-4 py-4 text-sm">
                    <div className="flex flex-col space-y-1">
                      {row.paymentMethod && (
                        <div className="flex items-center space-x-1 text-xs">
                          <CreditCard className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-400">{row.paymentMethod}</span>
                        </div>
                      )}
                      {row.linkId && (
                        <div className="flex items-center space-x-1 text-xs">
                          <ExternalLink className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-400 font-mono">
                            {row.linkId.slice(-8)}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="bg-white/5 px-6 py-4 flex items-center justify-between border-t border-white/10">
            <div className="text-sm text-gray-400">
              Страница {currentPage} из {totalPages} • Показано {currentData.length} из {filteredData.length}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Предыдущая
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Следующая
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default APIDataTable 