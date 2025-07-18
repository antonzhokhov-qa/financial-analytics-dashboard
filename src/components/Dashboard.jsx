import { useState, useEffect } from 'react'
import { parseCSV } from '../utils/csvParser'
import { calculateMetrics, generateInsights, getAmountRanges, getConversionByAmount, getStatusDistribution, getCompanyDistribution, getPaymentMethodDistribution, getTimeSeriesData, getTopUsers, detectAnomalies } from '../utils/analytics'
import FileUpload from './FileUpload'
import MetricsGrid from './MetricsGrid'
import ChartsGrid from './ChartsGrid'
import DataTable from './DataTable'
import Filters from './Filters'
import InsightsSection from './InsightsSection'
import AnomalyDetection from './AnomalyDetection'
import { TrendingUp, TrendingDown, DollarSign, Users, Activity, AlertTriangle } from 'lucide-react'

const Dashboard = () => {
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [insights, setInsights] = useState([])
  const [anomalies, setAnomalies] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [dataType, setDataType] = useState(null) // Определяется автоматически
  const [filters, setFilters] = useState({
    status: '',
    company: '',
    paymentMethod: '',
    transactionType: '',
    dateRange: { start: '', end: '' },
    amountRange: { min: '', max: '' }
  })

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

  // Обработка фильтрации данных
  const handleFiltersChange = (newFilters) => {
    console.log('Applying filters:', newFilters)
    let filtered = [...data]
    
    // Фильтр по статусу
    if (newFilters.status) {
      filtered = filtered.filter(row => row.status === newFilters.status)
    }
    
    // Фильтр по компании
    if (newFilters.company) {
      filtered = filtered.filter(row => row.company === newFilters.company)
    }
    
    // Фильтр по методу оплаты
    if (newFilters.paymentMethod) {
      filtered = filtered.filter(row => row.paymentMethod === newFilters.paymentMethod)
    }
    
    // Фильтр по типу транзакции
    if (newFilters.transactionType) {
      filtered = filtered.filter(row => row.transactionType === newFilters.transactionType)
    }
    
    // Фильтр по дате
    if (newFilters.dateRange.start || newFilters.dateRange.end) {
      const beforeFilter = filtered.length
      console.log('Date filter applied. Before:', beforeFilter, 'Range:', newFilters.dateRange)
      
      filtered = filtered.filter(row => {
        if (!row.createdAt) return true // Если нет даты, не фильтруем
        
        const rowDate = new Date(row.createdAt)
        if (isNaN(rowDate.getTime())) return true // Если дата невалидная, не фильтруем
        
        // Получаем только дату без времени для сравнения
        const rowDateOnly = new Date(rowDate.getFullYear(), rowDate.getMonth(), rowDate.getDate())
        
        if (newFilters.dateRange.start) {
          const startDate = new Date(newFilters.dateRange.start)
          if (isNaN(startDate.getTime())) return true
          if (rowDateOnly < startDate) return false
        }
        
        if (newFilters.dateRange.end) {
          const endDate = new Date(newFilters.dateRange.end)
          if (isNaN(endDate.getTime())) return true
          // Для конечной даты включаем весь день (до 23:59:59)
          endDate.setHours(23, 59, 59, 999)
          if (rowDate > endDate) return false
        }
        
        return true
      })
      
      console.log('After date filter:', filtered.length, 'rows remaining')
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
    
    console.log('Final filtered data:', filtered.length, 'out of', data.length, 'total rows')
    setFilters(newFilters)
    setFilteredData(filtered)
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

  // Если данные не загружены - показываем экран загрузки
  if (data.length === 0) {
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
                <p className="text-gray-300">
                  {filteredData.length} записей • Источник: {dataType === 'platform' ? 'Платформа' : 'Провайдер'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
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

        {/* Фильтры */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <Filters 
            data={data} 
            filters={filters} 
            onFiltersChange={handleFiltersChange} 
            dataType={dataType}
          />
        </div>

        {/* Графики */}
        <ChartsGrid data={filteredData} metrics={metrics} dataType={dataType} />

        {/* Таблица данных */}
        <DataTable data={filteredData} dataType={dataType} />

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