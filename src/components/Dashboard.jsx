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
    state: '',
    minAmount: '',
    maxAmount: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  const filteredData = useMemo(() => {
    return data.filter(row => {
      const amount = parseFloat(row['Initial Amount']) || 0
      const status = row.Status ? row.Status.toLowerCase() : ''
      const state = row['Operation State'] ? row['Operation State'].toLowerCase() : ''
      
      const statusMatch = !filters.status || status === filters.status.toLowerCase()
      const stateMatch = !filters.state || state === filters.state.toLowerCase()
      const minAmountMatch = !filters.minAmount || amount >= parseFloat(filters.minAmount)
      const maxAmountMatch = !filters.maxAmount || amount <= parseFloat(filters.maxAmount)
      
      return statusMatch && stateMatch && minAmountMatch && maxAmountMatch
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
      state: '',
      minAmount: '',
      maxAmount: ''
    })
  }

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
          {(filters.status || filters.state || filters.minAmount || filters.maxAmount) && (
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
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
        />
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