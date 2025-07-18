import { useMemo } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { getAmountRanges, getConversionByAmount, getTopAmounts, getStateDistribution } from '../utils/analytics'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
)

function ChartsGrid({ data }) {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#ffffff',
          font: {
            size: 12
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#ffffff'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      y: {
        ticks: {
          color: '#ffffff'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    }
  }

  const conversionData = useMemo(() => {
    const successful = data.filter(row => {
      const status = row.Status ? row.Status.toLowerCase() : ''
      return status === 'success'
    }).length
    
    const failed = data.filter(row => {
      const status = row.Status ? row.Status.toLowerCase() : ''
      return status === 'fail'
    }).length
    
    console.log('Chart conversion data:', { successful, failed, total: data.length })
    
    return {
      labels: ['Успешные', 'Неудачные'],
      datasets: [{
        data: [successful, failed],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',    // Зеленый для успешных
          'rgba(239, 68, 68, 0.8)'     // Красный для неудачных
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2
      }]
    }
  }, [data])

  const amountRangesData = useMemo(() => {
    const ranges = getAmountRanges(data)
    
    return {
      labels: Object.keys(ranges),
      datasets: [{
        label: 'Количество операций',
        data: Object.values(ranges),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',   // Синий
          'rgba(147, 51, 234, 0.8)',   // Фиолетовый
          'rgba(236, 72, 153, 0.8)',   // Розовый
          'rgba(245, 158, 11, 0.8)',   // Желтый
          'rgba(16, 185, 129, 0.8)'    // Зеленый
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(147, 51, 234, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(16, 185, 129, 1)'
        ],
        borderWidth: 2,
        borderRadius: 8
      }]
    }
  }, [data])

  const stateData = useMemo(() => {
    const states = getStateDistribution(data)
    
    return {
      labels: Object.keys(states),
      datasets: [{
        data: Object.values(states),
        backgroundColor: [
          'rgba(139, 92, 246, 0.8)',   // Фиолетовый для complete
          'rgba(245, 158, 11, 0.8)'    // Желтый для in_process
        ],
        borderColor: [
          'rgba(139, 92, 246, 1)',
          'rgba(245, 158, 11, 1)'
        ],
        borderWidth: 2
      }]
    }
  }, [data])

  const conversionByAmountData = useMemo(() => {
    const conversionData = getConversionByAmount(data)
    
    return {
      labels: conversionData.map(d => d.range),
      datasets: [{
        label: 'Конверсия (%)',
        data: conversionData.map(d => d.conversion),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
        borderRadius: 8
      }]
    }
  }, [data])

  const topAmountsData = useMemo(() => {
    const amounts = getTopAmounts(data, 10)
    
    return {
      labels: amounts.map((_, index) => `#${index + 1}`),
      datasets: [{
        label: 'Сумма (TRY)',
        data: amounts,
        borderColor: 'rgba(239, 68, 68, 1)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(239, 68, 68, 1)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6
      }]
    }
  }, [data])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Конверсия по статусам</h3>
          <div className="h-64">
            <Doughnut data={conversionData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Распределение по суммам</h3>
          <div className="h-64">
            <Bar data={amountRangesData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Состояние операций</h3>
          <div className="h-64">
            <Doughnut data={stateData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Топ-10 сумм</h3>
          <div className="h-64">
            <Line data={topAmountsData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Анализ конверсии по диапазонам сумм</h3>
        <div className="h-80">
          <Bar data={conversionByAmountData} options={chartOptions} />
        </div>
      </div>
    </div>
  )
}

export default ChartsGrid 