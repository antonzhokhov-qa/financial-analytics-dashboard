import { useMemo } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { 
  getAmountRanges, 
  getConversionByAmount, 
  getTopAmounts, 
  getStatusDistribution,
  getCompanyDistribution,
  getPaymentMethodDistribution,
  getTopUsers
} from '../utils/analytics'

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

  const statusData = useMemo(() => {
    const completed = data.filter(row => {
      const status = row.status ? row.status.toLowerCase() : ''
      return status === 'completed'
    }).length
    
    const failed = data.filter(row => {
      const status = row.status ? row.status.toLowerCase() : ''
      return status === 'failed'
    }).length
    
    const canceled = data.filter(row => {
      const status = row.status ? row.status.toLowerCase() : ''
      return status === 'canceled'
    }).length
    
    console.log('Chart status data:', { completed, failed, canceled, total: data.length })
    
    return {
      labels: ['Завершены', 'Отменены', 'Неудачные'],
      datasets: [{
        data: [completed, canceled, failed],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',    // Зеленый для завершенных
          'rgba(245, 158, 11, 0.8)',   // Желтый для отмененных
          'rgba(239, 68, 68, 0.8)'     // Красный для неудачных
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(245, 158, 11, 1)',
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

  const companyData = useMemo(() => {
    const companies = getCompanyDistribution(data)
    const topCompanies = Object.entries(companies)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
    
    return {
      labels: topCompanies.map(([name]) => name),
      datasets: [{
        data: topCompanies.map(([,count]) => count),
        backgroundColor: [
          'rgba(139, 92, 246, 0.8)',   // Фиолетовый
          'rgba(59, 130, 246, 0.8)',   // Синий
          'rgba(16, 185, 129, 0.8)',   // Зеленый
          'rgba(245, 158, 11, 0.8)',   // Желтый
          'rgba(239, 68, 68, 0.8)'     // Красный
        ],
        borderColor: [
          'rgba(139, 92, 246, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2
      }]
    }
  }, [data])

  const paymentMethodData = useMemo(() => {
    const methods = getPaymentMethodDistribution(data)
    
    return {
      labels: Object.keys(methods),
      datasets: [{
        label: 'Количество операций',
        data: Object.values(methods),
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
        label: 'Сумма (₽)',
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

  const topUsersData = useMemo(() => {
    const users = getTopUsers(data, 8)
    
    return {
      labels: users.map(user => user.name),
      datasets: [{
        label: 'Общая сумма (₽)',
        data: users.map(user => user.totalAmount),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 8
      }]
    }
  }, [data])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Статусы операций</h3>
          <div className="h-64">
            <Doughnut data={statusData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Распределение по суммам</h3>
          <div className="h-64">
            <Bar data={amountRangesData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Топ-5 компаний</h3>
          <div className="h-64">
            <Doughnut data={companyData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Методы оплаты</h3>
          <div className="h-64">
            <Bar data={paymentMethodData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Конверсия по суммам</h3>
          <div className="h-64">
            <Bar data={conversionByAmountData} options={chartOptions} />
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
        <h3 className="text-lg font-semibold text-white mb-4">Топ пользователи по объему</h3>
        <div className="h-80">
          <Bar data={topUsersData} options={chartOptions} />
        </div>
      </div>
    </div>
  )
}

export default ChartsGrid 