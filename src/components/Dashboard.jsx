import { useState, useEffect } from 'react'
import { parseCSV } from '../utils/csvParser'
import { calculateMetrics, generateInsights, getAmountRanges, getConversionByAmount, getStatusDistribution, getCompanyDistribution, getPaymentMethodDistribution, getTimeSeriesData, getTopUsers, detectAnomalies } from '../utils/analytics'
import FileUpload from './FileUpload'
import MetricsGrid from './MetricsGrid'
import ChartsGrid from './ChartsGrid'
import DataTable from './DataTable'
import APIDataTable from './APIDataTable'
import Filters from './Filters'
import InsightsSection from './InsightsSection'
import AnomalyDetection from './AnomalyDetection'
import TimezoneSelector from './TimezoneSelector'
import TimeBasedChartsGrid from './TimeBasedChartsGrid'
import BeautifulChartsGrid from './BeautifulChartsGrid'
import EnhancedChartsGrid from './EnhancedChartsGrid'
import PredictiveAnalytics from './PredictiveAnalytics'
import { TrendingUp, TrendingDown, DollarSign, Users, Activity, AlertTriangle, Brain, BarChart3 } from 'lucide-react'

const Dashboard = ({ 
  dataSource = 'csv', 
  preloadedData = null, 
  onBackToSelector = null 
}) => {
  const [data, setData] = useState(preloadedData || [])
  const [filteredData, setFilteredData] = useState(preloadedData || [])
  const [metrics, setMetrics] = useState(null)
  const [insights, setInsights] = useState([])
  const [anomalies, setAnomalies] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [dataType, setDataType] = useState(dataSource === 'api' ? 'platform' : null) // Определяется автоматически или по источнику
  const [timezone, setTimezone] = useState('UTC') // Добавляем поддержку часовых поясов
  const [filters, setFilters] = useState({
    status: '',
    company: '',
    paymentMethod: '',
    transactionType: '',
    dateRange: { start: '', end: '' },
    amountRange: { min: '', max: '' }
  })

  // Функция для конвертации времени в выбранный часовой пояс
  const convertToTimezone = (dateString, targetTimezone) => {
    const date = new Date(dateString)
    if (targetTimezone === 'UTC') {
      return date
    }
    
    // Простая обработка - в реальном проекте лучше использовать библиотеку типа date-fns-tz
    const offsets = {
      'Europe/Moscow': 3,
      'Europe/Istanbul': 3,
      'Europe/London': 0,
      'Europe/Berlin': 1,
      'Asia/Dubai': 4,
      'Asia/Tokyo': 9,
      'America/New_York': -5,
      'America/Los_Angeles': -8
    }
    
    const offset = offsets[targetTimezone] || 0
    const convertedDate = new Date(date.getTime() + offset * 60 * 60 * 1000)
    return convertedDate
  }

  // Обработка загрузки файла
  const handleFileUpload = (file) => {
    setLoading(true)
    setError(null)
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target.result
        console.log('File content preview:', text.substring(0, 500))
        
        // Парсим CSV с автоопределением типа
        const parsedData = parseCSV(text)
        console.log('Parsed data:', parsedData.length, 'rows')
        
        if (parsedData.length === 0) {
          setError('Не удалось извлечь данные из файла. Проверьте формат файла.')
          setLoading(false)
          return
        }
        
        // Определяем тип данных на основе структуры данных
        const firstRow = parsedData[0]
        // Провайдер (merchant) имеет поля: linkId, hash, paymentMethod
        // Платформа (platform) имеет поля: id (Reference ID), но без hash и других специфичных полей
        const detectedType = (firstRow.hash || firstRow.linkId || firstRow.paymentMethod) ? 'merchant' : 'platform'
        console.log('Detected data type:', detectedType)
        
        setData(parsedData)
        setFilteredData(parsedData)
        setDataType(detectedType)
        setLoading(false)
      } catch (err) {
        console.error('Error parsing file:', err)
        setError('Ошибка при обработке файла: ' + err.message)
        setLoading(false)
      }
    }
    
    reader.onerror = () => {
      setError('Ошибка при чтении файла')
      setLoading(false)
    }
    
    reader.readAsText(file)
  }

  // Инициализация данных при загрузке компонента
  useEffect(() => {
    if (preloadedData && preloadedData.length > 0) {
      console.log('Loading preloaded data:', preloadedData.length, 'items from', dataSource)
      setData(preloadedData)
      setFilteredData(preloadedData)
      setDataType(dataSource === 'api' ? 'platform' : 'merchant')
    }
  }, [preloadedData, dataSource])

  // Обработка изменения фильтров
  const handleFiltersChange = (newFilters) => {
    console.log('🔍 Applying filters:', newFilters, 'Data source:', dataSource, 'Data type:', dataType)
    console.log('📋 Sample data structure:', data.slice(0, 2).map(item => ({
      status: item.status,
      company: item.company,
      paymentMethod: item.paymentMethod,
      transactionType: item.transactionType,
      type: item.type,
      isDeposit: item.isDeposit,
      isWithdraw: item.isWithdraw,
      createdAt: item.createdAt
    })))
    
    let filtered = [...data]
    
    // Фильтр по статусу - адаптируем для разных источников
    if (newFilters.status) {
      const beforeStatusFilter = filtered.length
      filtered = filtered.filter(row => {
        // Для API данных - точное совпадение статуса
        if (dataSource === 'api' || dataSource === 'enhanced-api') {
          return row.status === newFilters.status
        }
        // Для CSV данных - нормализуем статусы 
        const rowStatus = (row.status || '').toLowerCase()
        const filterStatus = newFilters.status.toLowerCase()
        const matches = rowStatus === filterStatus || rowStatus.includes(filterStatus)
        
        // Логирование первых 3 записей
        if (filtered.indexOf(row) < 3) {
          console.log(`🔍 Status filter debug for row ${filtered.indexOf(row)}:`, {
            rowStatus: row.status,
            rowStatusLower: rowStatus,
            filterStatus: newFilters.status,
            filterStatusLower: filterStatus,
            matches: matches
          })
        }
        
        return matches
      })
      console.log(`📊 Status filter: ${beforeStatusFilter} → ${filtered.length} (filter: "${newFilters.status}")`)
    }
    
    // Фильтр по компании - только для данных где есть company
    if (newFilters.company) {
      const beforeCompanyFilter = filtered.length
      filtered = filtered.filter(row => {
        const company = row.company || row.project || ''
        const matches = company === newFilters.company
        return matches
      })
      console.log(`🏢 Company filter: ${beforeCompanyFilter} → ${filtered.length} (filter: "${newFilters.company}")`)
    }
    
    // Фильтр по методу оплаты - адаптируем для разных форматов
    if (newFilters.paymentMethod) {
      const beforePaymentFilter = filtered.length
      filtered = filtered.filter(row => {
        const method = row.paymentMethod || row.paymentMethodCode || row.paymentProduct || ''
        const matches = method === newFilters.paymentMethod
        return matches
      })
      console.log(`💳 Payment method filter: ${beforePaymentFilter} → ${filtered.length} (filter: "${newFilters.paymentMethod}")`)
    }
    
    // Фильтр по типу транзакции - поддержка разных форматов
    if (newFilters.transactionType) {
      const beforeTypeFilter = filtered.length
      filtered = filtered.filter(row => {
        const transactionType = row.transactionType || row.type || ''
        // Гибкое сравнение типов транзакций
        const filterTypeLower = newFilters.transactionType.toLowerCase()
        const transactionTypeLower = transactionType.toLowerCase()
        
        const matches = transactionType === newFilters.transactionType || 
               transactionTypeLower === filterTypeLower ||
               // Поддержка русских названий
               (filterTypeLower === 'депозит' && (row.isDeposit || transactionTypeLower.includes('deposit') || transactionTypeLower.includes('пополнение'))) ||
               (filterTypeLower === 'выплата' && (row.isWithdraw || transactionTypeLower.includes('withdraw') || transactionTypeLower.includes('вывод'))) ||
               // Поддержка английских названий  
               (filterTypeLower.includes('deposit') && (row.isDeposit || transactionTypeLower.includes('deposit') || transactionTypeLower.includes('пополнение'))) ||
               (filterTypeLower.includes('withdraw') && (row.isWithdraw || transactionTypeLower.includes('withdraw') || transactionTypeLower.includes('вывод')))
        
        // Логирование первых 3 записей
        if (filtered.indexOf(row) < 3) {
          console.log(`🔄 Transaction type filter debug for row ${filtered.indexOf(row)}:`, {
            transactionType: row.transactionType,
            type: row.type,
            filterType: newFilters.transactionType,
            filterTypeLower: filterTypeLower,
            transactionTypeLower: transactionTypeLower,
            isDeposit: row.isDeposit,
            isWithdraw: row.isWithdraw,
            matches: matches
          })
        }
        
        return matches
      })
      console.log(`🔄 Transaction type filter: ${beforeTypeFilter} → ${filtered.length} (filter: "${newFilters.transactionType}")`)
    }
    
    // Фильтр по дате с учетом часового пояса
    if (newFilters.dateRange.start || newFilters.dateRange.end) {
      const beforeDateFilter = filtered.length
      console.log('📅 Date filter applied. Before:', beforeDateFilter, 'Range:', newFilters.dateRange, 'Timezone:', timezone)
      
      filtered = filtered.filter(row => {
        if (!row.createdAt) {
          console.log('⚠️ Row without createdAt:', row.id || 'unknown')
          return true // Если нет даты, не фильтруем
        }
        
        const rowDate = new Date(row.createdAt)
        if (isNaN(rowDate.getTime())) {
          console.log('⚠️ Invalid date format:', row.createdAt)
          return true // Если дата невалидная, не фильтруем
        }
        
        // Получаем дату в строковом формате YYYY-MM-DD для правильного сравнения
        let rowDateStr
        try {
          if (row.createdAt.includes(' ')) {
            // Формат "2025-07-01 12:00:12"
            rowDateStr = row.createdAt.split(' ')[0]
          } else if (row.createdAt.includes('T')) {
            // ISO формат "2025-07-01T12:00:12.000Z"
            rowDateStr = row.createdAt.split('T')[0]
          } else {
            // Предполагаем что уже в формате YYYY-MM-DD
            rowDateStr = row.createdAt
          }
        } catch (e) {
          console.log('⚠️ Error parsing date:', row.createdAt, e)
          return true
        }
        
        if (newFilters.dateRange.start) {
          if (rowDateStr < newFilters.dateRange.start) return false
        }
        
        if (newFilters.dateRange.end) {
          if (rowDateStr > newFilters.dateRange.end) return false
        }
        
        return true
      })
      
      console.log(`📅 Date filter: ${beforeDateFilter} → ${filtered.length} (range: ${newFilters.dateRange.start} - ${newFilters.dateRange.end})`)
    }
    
    // Фильтр по сумме
    if (newFilters.amountRange.min || newFilters.amountRange.max) {
      filtered = filtered.filter(row => {
        const amount = parseFloat(row.amount) || 0
        const min = parseFloat(newFilters.amountRange.min) || 0
        const max = parseFloat(newFilters.amountRange.max) || Infinity
        
        return amount >= min && amount <= max
      })
    }
    
    console.log(`🎯 Final result: ${data.length} → ${filtered.length} rows (${((filtered.length / data.length) * 100).toFixed(1)}% remaining)`)
    console.log('📋 Applied filters summary:', {
      status: newFilters.status || 'none',
      company: newFilters.company || 'none', 
      paymentMethod: newFilters.paymentMethod || 'none',
      transactionType: newFilters.transactionType || 'none',
      dateRange: (newFilters.dateRange.start || newFilters.dateRange.end) ? `${newFilters.dateRange.start} - ${newFilters.dateRange.end}` : 'none',
      amountRange: (newFilters.amountRange.min || newFilters.amountRange.max) ? `${newFilters.amountRange.min} - ${newFilters.amountRange.max}` : 'none'
    })
    
    setFilters(newFilters)
    setFilteredData(filtered)
  }

  // Обработчик смены часового пояса
  const handleTimezoneChange = (newTimezone) => {
    setTimezone(newTimezone)
    // Пересчитываем фильтры при смене часового пояса
    handleFiltersChange(filters)
  }

  // Вычисление метрик при изменении данных
  useEffect(() => {
    if (filteredData.length > 0 && dataType) {
      const calculatedMetrics = calculateMetrics(filteredData, dataType)
      setMetrics(calculatedMetrics)
      
      const generatedInsights = generateInsights(filteredData, calculatedMetrics)
      setInsights(generatedInsights)
      
      const detectedAnomalies = detectAnomalies(filteredData)
      setAnomalies(detectedAnomalies)
    }
  }, [filteredData, dataType])

  // Если данные не загружены и это CSV режим - показываем экран загрузки
  if (data.length === 0 && dataSource === 'csv') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl space-y-8">
          {/* Заголовок */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
              <TrendingUp className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">Аналитика операций</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Загрузите CSV файл для анализа финансовых операций
            </p>
          </div>

          {/* Загрузка файла */}
          <FileUpload onFileUpload={handleFileUpload} loading={loading} />
          
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-300">
              {error}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Основной дашборд с данными
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Заголовок */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Аналитика операций</h1>
                <div className="flex items-center space-x-4">
                  <p className="text-gray-300">
                    {filteredData.length} записей из {data.length} • 
                    {dataSource === 'api' ? (
                      <span className="text-green-400 ml-1">🌐 API платформы</span>
                    ) : (
                      <span className="text-blue-400 ml-1">
                        📂 {dataType === 'platform' ? 'Платформа' : 'Провайдер'}
                      </span>
                    )}
                  </p>
                  {dataSource === 'api' && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs border border-green-500/30">
                      Реальное время
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Кнопка возврата к выбору источника */}
              {onBackToSelector && (
                <button
                  onClick={onBackToSelector}
                  className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors duration-200"
                >
                  ← Источник данных
                </button>
              )}
              
              {/* Кнопка загрузки нового файла (только для CSV) */}
              {dataSource === 'csv' && (
                <button
                  onClick={() => {
                    setData([])
                    setFilteredData([])
                    setMetrics(null)
                    setDataType(null)
                    setError(null)
                    setFilters({
                      status: '',
                      company: '',
                      paymentMethod: '',
                      transactionType: '',
                      dateRange: { start: '', end: '' },
                      amountRange: { min: '', max: '' }
                    })
                  }}
                  className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors duration-200"
                >
                  Загрузить новый файл
                </button>
              )}
              
              {/* Кнопка обновления данных (только для API) */}
              {dataSource === 'api' && onBackToSelector && (
                <button
                  onClick={onBackToSelector}
                  className="px-4 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors duration-200"
                >
                  🔄 Обновить данные
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Метрики */}
        {metrics && (
          <MetricsGrid metrics={metrics} dataType={dataType} />
        )}

        {/* Фильтры и часовые пояса */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Filters 
                data={data} 
                filters={filters} 
                onFiltersChange={handleFiltersChange} 
                dataType={dataType}
              />
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Часовой пояс</h3>
                  <p className="text-sm text-gray-400">Выберите часовой пояс для анализа</p>
                </div>
              </div>
              <TimezoneSelector 
                selectedTimezone={timezone}
                onTimezoneSelect={handleTimezoneChange}
              />
            </div>
          </div>
        </div>

        {/* Графики */}
        <ChartsGrid data={filteredData} metrics={metrics} dataType={dataType} />

        {/* Временные графики */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Временной анализ</h3>
              <p className="text-sm text-gray-400">
                Активность по часам, дням недели и динамика • Часовой пояс: {timezone}
              </p>
            </div>
          </div>
                      <BeautifulChartsGrid data={filteredData} timezone={timezone} dataType={dataType} />
        </div>

        {/* Расширенная аналитика с Chart.js */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Расширенная визуализация</h3>
              <p className="text-sm text-gray-400">
                Интерактивные графики с подробной аналитикой
              </p>
            </div>
          </div>
          <EnhancedChartsGrid data={filteredData} />
        </div>

        {/* Прогнозная аналитика */}
        {metrics && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Прогнозная аналитика</h3>
                <p className="text-sm text-gray-400">
                  Прогнозы и рекомендации на основе данных
                </p>
              </div>
            </div>
            <PredictiveAnalytics data={filteredData} metrics={metrics} />
          </div>
        )}

        {/* Таблица данных */}
        {dataSource === 'api' ? (
          <APIDataTable data={filteredData} />
        ) : (
          <DataTable data={filteredData} dataType={dataType} />
        )}

        {/* Инсайты */}
        {insights.length > 0 && (
          <InsightsSection insights={insights} />
        )}

        {/* Детекция аномалий */}
        {anomalies.length > 0 && (
          <AnomalyDetection data={filteredData} anomalies={anomalies} />
        )}
      </div>
    </div>
  )
}

export default Dashboard 