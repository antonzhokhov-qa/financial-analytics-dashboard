import { useState, useEffect } from 'react'
import { Filter, X, Calendar, DollarSign, Users, CreditCard } from 'lucide-react'

const Filters = ({ data, filters, onFiltersChange, dataType = 'merchant' }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [localFilters, setLocalFilters] = useState(filters)

  const currency = 'TRY'
  const sourceName = dataType === 'merchant' ? 'провайдера' : 'платформы'

  // Получаем уникальные значения для фильтров
  const getUniqueValues = (key) => {
    const values = data.map(row => row[key]).filter(Boolean)
    return [...new Set(values)].sort()
  }

  const statusOptions = dataType === 'merchant' 
    ? [
        { value: 'completed', label: 'Завершено' },
        { value: 'failed', label: 'Неудачно' },
        { value: 'canceled', label: 'Отменено' }
      ]
    : [
        { value: 'success', label: 'Успешно' },
        { value: 'fail', label: 'Ошибка' }
      ]

  const companyOptions = dataType === 'merchant' 
    ? getUniqueValues('company').map(company => ({ value: company, label: company }))
    : []

  const paymentMethodOptions = getUniqueValues('paymentMethod').map(method => ({ 
    value: method, 
    label: method 
  }))

  const transactionTypeOptions = getUniqueValues('transactionType').map(type => ({ 
    value: type, 
    label: type === 'Deposit' ? 'Депозит' : type === 'Withdraw' ? 'Выплата' : type 
  }))

  // Обновляем локальные фильтры при изменении пропсов
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  // Применяем фильтры
  const applyFilters = () => {
    onFiltersChange(localFilters)
  }

  // Сбрасываем фильтры
  const resetFilters = () => {
    const resetFilters = {
      status: '',
      company: '',
      paymentMethod: '',
      transactionType: '',
      dateRange: { start: '', end: '' },
      amountRange: { min: '', max: '' }
    }
    setLocalFilters(resetFilters)
    onFiltersChange(resetFilters)
  }

  // Проверяем, есть ли активные фильтры
  const hasActiveFilters = () => {
    return (
      localFilters.status ||
      localFilters.company ||
      localFilters.paymentMethod ||
      localFilters.transactionType ||
      localFilters.dateRange.start ||
      localFilters.dateRange.end ||
      localFilters.amountRange.min ||
      localFilters.amountRange.max
    )
  }

  // Получаем количество активных фильтров
  const getActiveFiltersCount = () => {
    let count = 0
    if (localFilters.status) count++
    if (localFilters.company) count++
    if (localFilters.paymentMethod) count++
    if (localFilters.transactionType) count++
    if (localFilters.dateRange.start || localFilters.dateRange.end) count++
    if (localFilters.amountRange.min || localFilters.amountRange.max) count++
    return count
  }

  return (
    <div className="space-y-4">
      {/* Заголовок секции */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Filter className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Фильтры</h3>
            <p className="text-sm text-gray-400">
              Настройте отображение данных • Источник: {sourceName}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Счетчик отфильтрованных записей */}
          <span className="text-sm text-gray-300">
            {(() => {
              // Простой подсчет отфильтрованных записей
              let filtered = [...data]
              
              if (localFilters.status) {
                filtered = filtered.filter(row => row.status === localFilters.status)
              }
              if (localFilters.company) {
                filtered = filtered.filter(row => row.company === localFilters.company)
              }
              if (localFilters.paymentMethod) {
                filtered = filtered.filter(row => row.paymentMethod === localFilters.paymentMethod)
              }
              if (localFilters.transactionType) {
                filtered = filtered.filter(row => row.transactionType === localFilters.transactionType)
              }
              if (localFilters.dateRange.start || localFilters.dateRange.end) {
                filtered = filtered.filter(row => {
                  if (!row.createdAt) return true
                  const rowDate = new Date(row.createdAt)
                  if (isNaN(rowDate.getTime())) return true
                  
                  const rowDateOnly = new Date(rowDate.getFullYear(), rowDate.getMonth(), rowDate.getDate())
                  
                  if (localFilters.dateRange.start) {
                    const startDate = new Date(localFilters.dateRange.start)
                    if (isNaN(startDate.getTime())) return true
                    if (rowDateOnly < startDate) return false
                  }
                  
                  if (localFilters.dateRange.end) {
                    const endDate = new Date(localFilters.dateRange.end)
                    if (isNaN(endDate.getTime())) return true
                    endDate.setHours(23, 59, 59, 999)
                    if (rowDate > endDate) return false
                  }
                  
                  return true
                })
              }
              
              return `${filtered.length} из ${data.length} записей`
            })()}
          </span>
          
          {hasActiveFilters() && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full">
              <span className="text-sm text-blue-300">
                {getActiveFiltersCount()} активных фильтров
              </span>
              <button
                onClick={resetFilters}
                className="w-4 h-4 text-blue-300 hover:text-blue-200 transition-colors duration-200"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors duration-200 flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>{isExpanded ? 'Скрыть' : 'Показать'} фильтры</span>
          </button>
        </div>
      </div>

      {/* Панель фильтров */}
      {isExpanded && (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Фильтр по статусу */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white flex items-center">
                <div className="w-4 h-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mr-2"></div>
                Статус операции
              </label>
              <select
                value={localFilters.status}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Все статусы</option>
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Фильтр по компании (только для провайдера) */}
            {dataType === 'merchant' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center">
                  <Users className="w-4 h-4 text-blue-400 mr-2" />
                  Компания
                </label>
                <select
                  value={localFilters.company}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Все компании</option>
                  {companyOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Фильтр по методу оплаты */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white flex items-center">
                <CreditCard className="w-4 h-4 text-green-400 mr-2" />
                Метод оплаты
              </label>
              <select
                value={localFilters.paymentMethod}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, paymentMethod: e.target.value }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Все методы</option>
                {paymentMethodOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Фильтр по типу транзакции */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white flex items-center">
                <Filter className="w-4 h-4 text-orange-400 mr-2" />
                Тип транзакции
              </label>
              <select
                value={localFilters.transactionType}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, transactionType: e.target.value }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Все типы</option>
                {transactionTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Фильтр по дате начала */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white flex items-center">
                <Calendar className="w-4 h-4 text-purple-400 mr-2" />
                Дата начала
              </label>
              <input
                type="date"
                value={localFilters.dateRange.start}
                onChange={(e) => setLocalFilters(prev => ({ 
                  ...prev, 
                  dateRange: { ...prev.dateRange, start: e.target.value }
                }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {/* Показываем диапазон дат в данных */}
              {data.length > 0 && (
                <div className="text-xs text-gray-400">
                  Диапазон данных: {(() => {
                    const dates = data.map(row => new Date(row.createdAt)).filter(date => !isNaN(date.getTime()))
                    if (dates.length === 0) return 'Нет валидных дат'
                    const minDate = new Date(Math.min(...dates))
                    const maxDate = new Date(Math.max(...dates))
                    return `${minDate.toISOString().split('T')[0]} - ${maxDate.toISOString().split('T')[0]}`
                  })()}
                </div>
              )}
            </div>

            {/* Фильтр по дате окончания */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white flex items-center">
                <Calendar className="w-4 h-4 text-purple-400 mr-2" />
                Дата окончания
              </label>
              <input
                type="date"
                value={localFilters.dateRange.end}
                onChange={(e) => setLocalFilters(prev => ({ 
                  ...prev, 
                  dateRange: { ...prev.dateRange, end: e.target.value }
                }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Фильтр по минимальной сумме */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white flex items-center">
                <DollarSign className="w-4 h-4 text-green-400 mr-2" />
                Минимальная сумма ({currency})
              </label>
              <input
                type="number"
                placeholder="0"
                value={localFilters.amountRange.min}
                onChange={(e) => setLocalFilters(prev => ({ 
                  ...prev, 
                  amountRange: { ...prev.amountRange, min: e.target.value }
                }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Фильтр по максимальной сумме */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white flex items-center">
                <DollarSign className="w-4 h-4 text-green-400 mr-2" />
                Максимальная сумма ({currency})
              </label>
              <input
                type="number"
                placeholder="Без ограничений"
                value={localFilters.amountRange.max}
                onChange={(e) => setLocalFilters(prev => ({ 
                  ...prev, 
                  amountRange: { ...prev.amountRange, max: e.target.value }
                }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Кнопки управления */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="text-sm text-gray-400">
              {hasActiveFilters() ? (
                <span>
                  Активно {getActiveFiltersCount()} фильтр{getActiveFiltersCount() !== 1 ? 'ов' : ''}
                </span>
              ) : (
                <span>Фильтры не применены</span>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors duration-200"
              >
                Сбросить
              </button>
              
              <button
                onClick={applyFilters}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-semibold"
              >
                Применить фильтры
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Быстрые фильтры */}
      {!isExpanded && hasActiveFilters() && (
        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">Активные фильтры:</span>
              <div className="flex flex-wrap gap-2">
                {localFilters.status && (
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                    Статус: {statusOptions.find(s => s.value === localFilters.status)?.label}
                  </span>
                )}
                {localFilters.company && (
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                    Компания: {localFilters.company}
                  </span>
                )}
                {localFilters.paymentMethod && (
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                    Метод: {localFilters.paymentMethod}
                  </span>
                )}
                {(localFilters.dateRange.start || localFilters.dateRange.end) && (
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                    Дата: {localFilters.dateRange.start || '...'} - {localFilters.dateRange.end || '...'}
                  </span>
                )}
                {(localFilters.amountRange.min || localFilters.amountRange.max) && (
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                    Сумма: {localFilters.amountRange.min || '0'} - {localFilters.amountRange.max || '∞'} {currency}
                  </span>
                )}
              </div>
            </div>
            
            <button
              onClick={resetFilters}
              className="text-blue-400 hover:text-blue-300 text-sm transition-colors duration-200"
            >
              Очистить все
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Filters 