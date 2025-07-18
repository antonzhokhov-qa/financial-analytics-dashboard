import { useMemo } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement } from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { TrendingUp, PieChart, BarChart3, Activity } from 'lucide-react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
)

function EnhancedChartsGrid({ data }) {
  // Данные для графика конверсии по суммам
  const conversionByAmountData = useMemo(() => {
    const ranges = [
      { label: '0-500', min: 0, max: 500 },
      { label: '501-1000', min: 501, max: 1000 },
      { label: '1001-2000', min: 1001, max: 2000 },
      { label: '2001-5000', min: 2001, max: 5000 },
      { label: '5000+', min: 5001, max: Infinity }
    ]
    
    return ranges.map(range => {
      const rangeData = data.filter(row => {
        const amount = parseFloat(row['Initial Amount']) || 0
        return amount >= range.min && amount <= range.max
      })
      
      const total = rangeData.length
      const successful = rangeData.filter(row => {
        const status = row.Status ? row.Status.toLowerCase() : ''
        return status === 'success'
      }).length
      
      return {
        range: range.label,
        total,
        successful,
        conversion: total > 0 ? (successful / total) * 100 : 0
      }
    })
  }, [data])

  // Данные для временного тренда (симуляция)
  const timeSeriesData = useMemo(() => {
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
    return days.map(day => ({
      day,
      operations: Math.floor(Math.random() * 50) + 20,
      conversion: Math.random() * 40 + 40
    }))
  }, [])

  // Данные для статусов операций
  const statusData = useMemo(() => {
    const statusCounts = {}
    data.forEach(row => {
      const status = row.Status || 'unknown'
      statusCounts[status] = (statusCounts[status] || 0) + 1
    })
    return statusCounts
  }, [data])

  // Данные для состояний операций
  const stateData = useMemo(() => {
    const stateCounts = {}
    data.forEach(row => {
      const state = row['Operation State'] || 'unknown'
      stateCounts[state] = (stateCounts[state] || 0) + 1
    })
    return stateCounts
  }, [data])

  // Конфигурация графиков
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      y: {
        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      }
    }
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: { size: 12 },
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white'
      }
    },
    cutout: '60%'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-6 h-6 text-blue-400" />
        <h3 className="text-xl font-semibold text-white">Визуализация данных</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* График конверсии по суммам */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <h4 className="text-lg font-medium text-white">Конверсия по суммам</h4>
          </div>
          <div className="h-64">
            <Bar
              data={{
                labels: conversionByAmountData.map(item => item.range),
                datasets: [
                  {
                    label: 'Конверсия (%)',
                    data: conversionByAmountData.map(item => item.conversion),
                    backgroundColor: 'rgba(34, 197, 94, 0.8)',
                    borderColor: 'rgba(34, 197, 94, 1)',
                    borderWidth: 1,
                    borderRadius: 8,
                    borderSkipped: false
                  }
                ]
              }}
              options={chartOptions}
            />
          </div>
        </div>

        {/* Временной тренд */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-5 h-5 text-purple-400" />
            <h4 className="text-lg font-medium text-white">Недельный тренд</h4>
          </div>
          <div className="h-64">
            <Line
              data={{
                labels: timeSeriesData.map(item => item.day),
                datasets: [
                  {
                    label: 'Операции',
                    data: timeSeriesData.map(item => item.operations),
                    borderColor: 'rgba(147, 51, 234, 1)',
                    backgroundColor: 'rgba(147, 51, 234, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(147, 51, 234, 1)',
                    pointBorderColor: 'rgba(255, 255, 255, 0.8)',
                    pointBorderWidth: 2,
                    pointRadius: 4
                  },
                  {
                    label: 'Конверсия (%)',
                    data: timeSeriesData.map(item => item.conversion),
                    borderColor: 'rgba(34, 197, 94, 1)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(34, 197, 94, 1)',
                    pointBorderColor: 'rgba(255, 255, 255, 0.8)',
                    pointBorderWidth: 2,
                    pointRadius: 4
                  }
                ]
              }}
              options={chartOptions}
            />
          </div>
        </div>


      </div>

      {/* Дополнительная статистика */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h4 className="text-lg font-medium text-white mb-4">Анализ по диапазонам сумм</h4>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {conversionByAmountData.map((item, index) => (
            <div key={index} className="text-center">
              <div className="text-lg font-bold text-blue-400">
                {item.total}
              </div>
              <div className="text-white/70 text-xs mb-1">{item.range} TRY</div>
              <div className="text-sm font-medium text-green-400">
                {item.conversion.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default EnhancedChartsGrid 