import { useState, useMemo } from 'react'
import { RotateCcw, Filter } from 'lucide-react'
import MetricsGrid from './MetricsGrid'
import ChartsGrid from './ChartsGrid'
import InsightsSection from './InsightsSection'
import DataTable from './DataTable'
import Filters from './Filters'
import { calculateMetrics, generateInsights } from '../utils/analytics'

function Dashboard({ data, onReset }) {
  const [filters, setFilters] = useState({
    status: '',
    company: '',
    paymentMethod: '',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  const filteredData = useMemo(() => {
    return data.filter(row => {
      const amount = parseFloat(row.amount) || 0
      const status = row.status ? row.status.toLowerCase() : ''
      const company = row.company || ''
      const paymentMethod = row.paymentMethod || ''
      const createdAt = row.createdAt || ''
      
      // Фильтр по статусу
      const statusMatch = !filters.status || status === filters.status.toLowerCase()
      
      // Фильтр по компании
      const companyMatch = !filters.company || company === filters.company
      
      // Фильтр по методу оплаты
      const paymentMethodMatch = !filters.paymentMethod || paymentMethod === filters.paymentMethod
      
      // Фильтр по дате "с"
      const dateFromMatch = !filters.dateFrom || (createdAt && createdAt >= filters.dateFrom)
      
      // Фильтр по дате "до"
      const dateToMatch = !filters.dateTo || (createdAt && createdAt <= filters.dateTo + ' 23:59:59')
      
      // Фильтр по минимальной сумме
      const amountMinMatch = !filters.amountMin || amount >= parseFloat(filters.amountMin)
      
      // Фильтр по максимальной сумме
      const amountMaxMatch = !filters.amountMax || amount <= parseFloat(filters.amountMax)
      
      return statusMatch && companyMatch && paymentMethodMatch && dateFromMatch && dateToMatch && amountMinMatch && amountMaxMatch
    })
  }, [data, filters])

  const metrics = useMemo(() => calculateMetrics(filteredData), [filteredData])
  const insights = useMemo(() => generateInsights(filteredData, metrics), [filteredData, metrics])

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
  }

  const resetFilters = () => {
    setFilters({
      status: '',
      company: '',
      paymentMethod: '',
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: ''
    })
  }

  const hasActiveFilters = filters.status || filters.company || filters.paymentMethod || filters.dateFrom || filters.dateTo || filters.amountMin || filters.amountMax

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Управление */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Фильтры
          </button>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="btn-secondary flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Сбросить
            </button>
          )}
        </div>
        <button
          onClick={onReset}
          className="btn-primary"
        >
          Загрузить новый файл
        </button>
      </div>

      {/* Фильтры */}
      {showFilters && (
        <Filters
          onFiltersChange={handleFilterChange}
          data={data}
        />
      )}

      {/* Информация о фильтрации */}
      {hasActiveFilters && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="text-blue-300">
              <strong>Применены фильтры:</strong> Показано {filteredData.length} из {data.length} операций
            </div>
            <button
              onClick={resetFilters}
              className="text-blue-300 hover:text-blue-200 text-sm"
            >
              Очистить все
            </button>
          </div>
        </div>
      )}

      {/* Метрики */}
      <MetricsGrid metrics={metrics} />

      {/* Инсайты */}
      <InsightsSection insights={insights} />

      {/* Графики */}
      <ChartsGrid data={filteredData} />

      {/* Таблица */}
      <DataTable data={filteredData} />
    </div>
  )
}

export default Dashboard 