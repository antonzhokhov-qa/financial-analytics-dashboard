import { useState, useEffect } from 'react'
import { parseCSV } from '../utils/csvParser'
import { calculateMetrics, generateInsights, getAmountRanges, getConversionByAmount, getStatusDistribution, getCompanyDistribution, getPaymentMethodDistribution, getTimeSeriesData, getTopUsers, detectAnomalies } from '../utils/analytics'
import FileUpload from './FileUpload'
import FileTypeSelector from './FileTypeSelector'
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
  const [dataType, setDataType] = useState(null) // 'platform' или 'merchant'
  const [showTypeSelector, setShowTypeSelector] = useState(false)
  const [uploadedFileContent, setUploadedFileContent] = useState(null) // Сохраняем содержимое файла
  const [filters, setFilters] = useState({
    status: '',
    company: '',
    paymentMethod: '',
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
        
        // Сохраняем содержимое файла
        setUploadedFileContent(text)
        
        // Если тип данных не выбран, показываем селектор
        if (!dataType) {
          setShowTypeSelector(true)
          setLoading(false)
          return
        }
        
        // Парсим CSV с учетом выбранного типа
        const parsedData = parseCSV(text, dataType)
        console.log('Parsed data:', parsedData.length, 'rows')
        
        if (parsedData.length === 0) {
          setError('Не удалось извлечь данные из файла. Проверьте формат файла.')
          setLoading(false)
          return
        }
        
        setData(parsedData)
        setFilteredData(parsedData)
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

  // Обработка выбора типа данных
  const handleDataTypeSelect = (type) => {
    setDataType(type)
    setShowTypeSelector(false)
    
    // Если файл уже загружен, перепарсим его с новым типом
    if (uploadedFileContent) {
      setLoading(true)
      try {
        const parsedData = parseCSV(uploadedFileContent, type)
        console.log('Reparsed data with type', type, ':', parsedData.length, 'rows')
        
        if (parsedData.length === 0) {
          setError('Не удалось извлечь данные из файла с выбранным типом. Попробуйте другой тип.')
          setLoading(false)
          return
        }
        
        setData(parsedData)
        setFilteredData(parsedData)
        setError(null)
        setLoading(false)
      } catch (err) {
        console.error('Error reparsing file:', err)
        setError('Ошибка при обработке файла: ' + err.message)
        setLoading(false)
      }
    }
  }

  // Обработка возврата к выбору типа
  const handleBackToTypeSelector = () => {
    setShowTypeSelector(true)
    setDataType(null)
  }

  // Применение фильтров
  const applyFilters = (newFilters) => {
    setFilters(newFilters)
    
    let filtered = [...data]
    
    // Фильтр по статусу
    if (newFilters.status) {
      filtered = filtered.filter(row => {
        const status = row.status ? row.status.toLowerCase() : ''
        return status === newFilters.status.toLowerCase()
      })
    }
    
    // Фильтр по компании
    if (newFilters.company) {
      filtered = filtered.filter(row => 
        row.company && row.company.toLowerCase().includes(newFilters.company.toLowerCase())
      )
    }
    
    // Фильтр по методу оплаты
    if (newFilters.paymentMethod) {
      filtered = filtered.filter(row => 
        row.paymentMethod && row.paymentMethod.toLowerCase().includes(newFilters.paymentMethod.toLowerCase())
      )
    }
    
    // Фильтр по диапазону дат
    if (newFilters.dateRange.start || newFilters.dateRange.end) {
      filtered = filtered.filter(row => {
        if (!row.createdAt) return true
        
        const rowDate = new Date(row.createdAt)
        const startDate = newFilters.dateRange.start ? new Date(newFilters.dateRange.start) : null
        const endDate = newFilters.dateRange.end ? new Date(newFilters.dateRange.end) : null
        
        if (startDate && rowDate < startDate) return false
        if (endDate && rowDate > endDate) return false
        
        return true
      })
    }
    
    // Фильтр по диапазону сумм
    if (newFilters.amountRange.min || newFilters.amountRange.max) {
      filtered = filtered.filter(row => {
        const amount = parseFloat(row.amount) || 0
        const min = parseFloat(newFilters.amountRange.min) || 0
        const max = parseFloat(newFilters.amountRange.max) || Infinity
        
        return amount >= min && amount <= max
      })
    }
    
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

  // Если показываем селектор типа данных
  if (showTypeSelector) {
    return (
      <FileTypeSelector 
        onTypeSelect={handleDataTypeSelect}
        onBack={() => setShowTypeSelector(false)}
      />
    )
  }

  // Если данные не загружены
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
            
            {/* Индикатор типа данных */}
            {dataType && (
              <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-full text-white">
                <span className="text-sm">
                  Источник: {dataType === 'platform' ? 'Платформа' : 'Провайдер'}
                </span>
                <button
                  onClick={handleBackToTypeSelector}
                  className="ml-2 text-blue-400 hover:text-blue-300 text-sm"
                >
                  Изменить
                </button>
              </div>
            )}
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
                onClick={handleBackToTypeSelector}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors duration-200"
              >
                Изменить источник
              </button>
              <button
                onClick={() => {
                  setData([])
                  setFilteredData([])
                  setMetrics(null)
                  setDataType(null)
                  setUploadedFileContent(null)
                  setError(null)
                }}
                className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors duration-200"
              >
                Новый файл
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Фильтры */}
        <Filters 
          data={data} 
          filters={filters} 
          onFiltersChange={applyFilters}
          dataType={dataType}
        />

        {/* Метрики */}
        {metrics && <MetricsGrid metrics={metrics} dataType={dataType} />}

        {/* Инсайты */}
        {insights.length > 0 && <InsightsSection insights={insights} />}

        {/* Графики */}
        {filteredData.length > 0 && (
          <ChartsGrid 
            data={filteredData} 
            metrics={metrics}
            dataType={dataType}
          />
        )}

        {/* Аномалии */}
        {anomalies.length > 0 && <AnomalyDetection anomalies={anomalies} />}

        {/* Таблица данных */}
        {filteredData.length > 0 && (
          <DataTable 
            data={filteredData} 
            dataType={dataType}
          />
        )}
      </div>
    </div>
  )
}

export default Dashboard 