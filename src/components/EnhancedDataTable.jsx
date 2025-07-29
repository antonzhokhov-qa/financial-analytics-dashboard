import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Search, Filter, Download, ExternalLink, User, CreditCard, Globe, Coins, Shield, Eye, EyeOff, DollarSign } from 'lucide-react'
import { Card, CardContent } from './ui/Card'
import { calculateEnhancedMetrics } from '../utils/analytics'

const EnhancedDataTable = ({ data }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(15)
  const [selectedView, setSelectedView] = useState('overview') // overview, detailed, cards, rates
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [filters, setFilters] = useState({
    status: '',
    project: '', 
    currency: '',
    search: ''
  })
  const [metrics, setMetrics] = useState(null)

  // Вычисляем метрики с поддержкой мультивалютности
  useEffect(() => {
    if (data && data.length > 0) {
      const enhancedMetrics = calculateEnhancedMetrics(data, 'enhanced-api')
      setMetrics(enhancedMetrics)
      console.log('📊 Enhanced metrics calculated:', enhancedMetrics)
    }
  }, [data])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, data])

  const formatCurrency = (amount, currency = 'EUR') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      return date.toLocaleString('ru-RU', {
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
      case 'user_input_required':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
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
      case 'user_input_required':
        return 'Требует ввода'
      default:
        return status || 'Неизвестно'
    }
  }

  const getPaymentTypeIcon = (type, isCrypto) => {
    if (isCrypto) return Coins
    return CreditCard
  }

  const getPaymentTypeColor = (isCrypto) => {
    return isCrypto ? 'text-yellow-400' : 'text-blue-400'
  }

  // Фильтрация и поиск
  const searchFilteredData = data.filter(row => {
    const searchLower = searchTerm.toLowerCase()
    return (
      (row.id && row.id.toString().toLowerCase().includes(searchLower)) ||
      (row.referenceId && row.referenceId.toLowerCase().includes(searchLower)) ||
      (row.clientOperationId && row.clientOperationId.toLowerCase().includes(searchLower)) ||
      (row.project && row.project.toLowerCase().includes(searchLower)) ||
      (row.status && row.status.toLowerCase().includes(searchLower)) ||
      (row.currency && row.currency.toLowerCase().includes(searchLower))
    )
  })

  // Сортировка
  const sortedData = [...searchFilteredData].sort((a, b) => {
    if (!sortConfig.key) return 0

    const aValue = a[sortConfig.key] || ''
    const bValue = b[sortConfig.key] || ''

    if (sortConfig.key === 'amount' || sortConfig.key === 'fee') {
      return sortConfig.direction === 'asc' 
        ? parseFloat(aValue) - parseFloat(bValue)
        : parseFloat(bValue) - parseFloat(aValue)
    }

    if (sortConfig.key === 'createdAt' || sortConfig.key === 'modifiedAt') {
      const aDate = new Date(aValue)
      const bDate = new Date(bValue)
      return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate
    }

    const comparison = aValue.toString().localeCompare(bValue.toString())
    return sortConfig.direction === 'asc' ? comparison : -comparison
  })

  // Пагинация
  const totalPages = Math.ceil(searchFilteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = sortedData.slice(startIndex, endIndex)

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const toggleRowExpanded = (rowId) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId)
    } else {
      newExpanded.add(rowId)
    }
    setExpandedRows(newExpanded)
  }

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronDown className="w-4 h-4 text-gray-400" />
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-blue-400" />
      : <ChevronDown className="w-4 h-4 text-blue-400" />
  }

  const views = [
    { id: 'overview', label: 'Обзор', icon: Eye },
    { id: 'detailed', label: 'Детали', icon: Filter },
    { id: 'cards', label: 'Карты', icon: CreditCard },
    { id: 'rates', label: 'Курсы', icon: Globe }
  ]

  return (
    <div className="space-y-6">
      {/* Заголовок и переключатели */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Расширенные данные API</h2>
          <p className="text-gray-300">
            {searchFilteredData.length} операций из {data.length} • Поддержка криптовалют и детальной информации
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1 border border-white/10">
          {views.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedView(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                selectedView === id
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Поиск и экспорт */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск по ID, статусу, проекту, пользователю..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">
              {searchFilteredData.length} результатов
            </span>
          </div>
          
          <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Экспорт</span>
          </button>
        </div>
      </div>

      {/* Статистика по операциям */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { 
            label: 'Всего операций', 
            value: data.length, 
            color: 'text-blue-400',
            icon: Globe 
          },
          { 
            label: 'Успешные', 
            value: data.filter(d => d.isCompleted).length, 
            color: 'text-green-400',
            icon: Shield 
          },
          { 
            label: 'Сумма успешных', 
            value: formatCurrency(
              data
                .filter(d => d.isCompleted)
                .reduce((sum, d) => sum + parseFloat(d.amount || 0), 0),
              'EUR'
            ), 
            color: 'text-green-400',
            icon: DollarSign,
            isAmount: true
          },
          { 
            label: 'В процессе/Ошибка', 
            value: data.filter(d => !d.isCompleted).length, 
            color: 'text-yellow-400',
            icon: ExternalLink 
          }
        ].map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.isAmount ? stat.color : 'text-white'}`}>
                      {stat.value}
                    </p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Основная таблица */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/10">
              <tr>
                <th className="px-4 py-4 text-left text-sm font-semibold text-white">
                  <div className="flex items-center space-x-2">
                    <span>Детали</span>
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
                <th className="px-4 py-4 text-left text-sm font-semibold text-white">
                  Тип платежа
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
                  onClick={() => handleSort('project')}
                >
                  <div className="flex items-center space-x-2">
                    <span>Проект</span>
                    <SortIcon columnKey="project" />
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
                {selectedView === 'detailed' && (
                  <th className="px-4 py-4 text-left text-sm font-semibold text-white">
                    Дополнительно
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {currentData.map((row, index) => {
                const isExpanded = expandedRows.has(row.id)
                const PaymentIcon = getPaymentTypeIcon(row.paymentMethodType, row.isCrypto)
                
                return (
                  <React.Fragment key={row.id || index}>
                    <tr className="hover:bg-white/5 transition-colors duration-200">
                      {/* Кнопка развертывания */}
                      <td className="px-4 py-4">
                        <button
                          onClick={() => toggleRowExpanded(row.id)}
                          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
                        >
                          {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          <span className="font-mono text-xs">
                            {row.referenceId ? row.referenceId.slice(-8) : row.id.slice(-8)}
                          </span>
                        </button>
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
                      
                      {/* Тип платежа */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <PaymentIcon className={`w-4 h-4 ${getPaymentTypeColor(row.isCrypto)}`} />
                          <div>
                            <div className="text-sm font-medium text-white">
                              Платеж
                            </div>
                            <div className="text-xs text-gray-400">
                              {row.paymentMethodCode || 'API'}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Сумма */}
                      <td className="px-4 py-4">
                        <div className="text-sm font-semibold text-white">
                          {formatCurrency(row.amount, row.currency)}
                        </div>
                        {row.fee > 0 && (
                          <div className="text-xs text-gray-400">
                            Комиссия: {formatCurrency(row.fee, row.currency)}
                          </div>
                        )}
                      </td>
                      
                      {/* Пользователь */}
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-white">
                              ID: {row.userId}
                            </div>
                            {row.ipAddress && (
                              <div className="text-xs text-gray-400">
                                IP: {row.ipAddress}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      {/* Проект */}
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-white">{row.project}</div>
                        <div className="text-xs text-gray-400">{row.credentialsOwner}</div>
                      </td>
                      
                      {/* Дата создания */}
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-300">{formatDate(row.createdAt)}</div>
                        {row.modifiedAt && row.modifiedAt !== row.createdAt && (
                          <div className="text-xs text-gray-500 mt-1">
                            Изменено: {formatDate(row.modifiedAt)}
                          </div>
                        )}
                      </td>
                      
                      {/* Дополнительно (детальный режим) */}
                      {selectedView === 'detailed' && (
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-1 text-xs">
                            {row.cardInfo && (
                              <div className="flex items-center gap-1">
                                <CreditCard className="w-3 h-3 text-gray-400" />
                                <span className="text-gray-400">Карта</span>
                              </div>
                            )}
                            {row.cardFinishInfo && row.cardFinishInfo.is3DSecureAttempted && (
                              <div className="flex items-center gap-1">
                                <Shield className="w-3 h-3 text-green-400" />
                                <span className="text-green-400">3D Secure</span>
                              </div>
                            )}
                            {row.hasCallbacks && (
                              <div className="flex items-center gap-1">
                                <ExternalLink className="w-3 h-3 text-blue-400" />
                                <span className="text-blue-400">Callbacks</span>
                              </div>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                    
                    {/* Развернутая информация */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={selectedView === 'detailed' ? 8 : 7} className="px-4 py-6 bg-white/5">
                          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            
                            {/* Основная информация */}
                            <Card variant="glass">
                              <CardContent className="p-4">
                                <h4 className="font-medium text-white mb-3">Основная информация</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Reference ID:</span>
                                    <span className="text-white font-mono text-xs">{row.referenceId}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Client Operation ID:</span>
                                    <span className="text-white font-mono text-xs">{row.clientOperationId}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Продукт:</span>
                                    <span className="text-white">{row.paymentProduct}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Интеграция:</span>
                                    <span className="text-white">{row.integrationType}</span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Информация о карте */}
                            {row.cardInfo && (
                              <Card variant="glass">
                                <CardContent className="p-4">
                                  <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                                    <CreditCard className="w-4 h-4" />
                                    Информация о карте
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Номер карты:</span>
                                      <span className="text-white font-mono">{row.cardInfo.cardNumber}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">PAN Token:</span>
                                      <span className="text-white font-mono text-xs">{row.cardInfo.panToken}</span>
                                    </div>
                                    {row.cardInfo.paymentMethodName && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Метод:</span>
                                        <span className="text-white">{row.cardInfo.paymentMethodName}</span>
                                      </div>
                                    )}
                                    {row.cardFinishInfo && row.cardFinishInfo.mccCode && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">MCC Code:</span>
                                        <span className="text-white">{row.cardFinishInfo.mccCode}</span>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            {/* Дополнительная информация */}
                            <Card variant="glass">
                              <CardContent className="p-4">
                                <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                                  <Globe className="w-4 h-4" />
                                  Системная информация
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Источник данных:</span>
                                    <span className="text-white">{row.dataSource}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Тип интеграции:</span>
                                    <span className="text-white">{row.integrationType}</span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
        
        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="bg-white/5 px-6 py-4 flex items-center justify-between border-t border-white/10">
            <div className="text-sm text-gray-400">
              Страница {currentPage} из {totalPages} • Показано {currentData.length} из {searchFilteredData.length}
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
      </Card>
    </div>
  )
}

export default EnhancedDataTable 