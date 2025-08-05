import { useMemo, useState } from 'react'
import { Clock, Calendar, TrendingUp, Activity, BarChart3, Timer } from 'lucide-react'

const ModernTimeAnalytics = ({ data, timezone = 'UTC' }) => {
  const { t } = useTranslation()
  const [selectedPeriod, setSelectedPeriod] = useState('24h')
  const [hoveredHour, setHoveredHour] = useState(null)

  // Функция для конвертации времени
  const convertToTimezone = (dateString, targetTimezone) => {
    const date = new Date(dateString)
    if (targetTimezone === 'UTC') return date
    
    const offsets = {
      'Europe/Moscow': 3, 'Europe/Istanbul': 3, 'Europe/London': 0,
      'Europe/Berlin': 1, 'Asia/Dubai': 4, 'Asia/Tokyo': 9,
      'America/New_York': -5, 'America/Los_Angeles': -8
    }
    
    const offset = offsets[targetTimezone] || 0
    return new Date(date.getTime() + offset * 60 * 60 * 1000)
  }

  // Анализ по часам (улучшенный)
  const hourlyAnalytics = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      operations: 0,
      revenue: 0,
      success: 0,
      failed: 0,
      inProcess: 0,
      avgAmount: 0,
      conversionRate: 0
    }))

    data.forEach(row => {
      if (!row.createdAt) return
      
      const hour = convertToTimezone(row.createdAt, timezone).getHours()
      const amount = parseFloat(row.amount) || 0
      
      if (hour >= 0 && hour < 24) {
        hours[hour].operations++
        hours[hour].revenue += amount
        
        const status = (row.status || '').toLowerCase()
        if (status === 'completed' || status === 'success') hours[hour].success++
        else if (status === 'failed' || status === 'fail') hours[hour].failed++
        else if (status === 'in_process') hours[hour].inProcess++
      }
    })

    // Вычисляем дополнительные метрики
    hours.forEach(hour => {
      hour.avgAmount = hour.operations > 0 ? hour.revenue / hour.operations : 0
      hour.conversionRate = hour.operations > 0 ? (hour.success / hour.operations) * 100 : 0
    })

    return hours
  }, [data, timezone])

  // Находим пиковые часы
  const peakHours = useMemo(() => {
    return [...hourlyAnalytics]
      .filter(h => h.operations > 0)
      .sort((a, b) => b.operations - a.operations)
      .slice(0, 3)
  }, [hourlyAnalytics])

  // Еженедельная аналитика
  const weeklyAnalytics = useMemo(() => {
    const days = [
      { name: 'Воскресенье', short: 'Вс' },
      { name: 'Понедельник', short: 'Пн' },
      { name: 'Вторник', short: 'Вт' },
      { name: 'Среда', short: 'Ср' },
      { name: 'Четверг', short: 'Чт' },
      { name: 'Пятница', short: 'Пт' },
      { name: 'Суббота', short: 'Сб' }
    ]

    const weekData = days.map((day, index) => ({
      ...day,
      dayIndex: index,
      operations: 0,
      revenue: 0,
      success: 0,
      avgAmount: 0,
      conversionRate: 0
    }))

    data.forEach(row => {
      if (!row.createdAt) return
      
      const dayOfWeek = convertToTimezone(row.createdAt, timezone).getDay()
      const amount = parseFloat(row.amount) || 0
      
      weekData[dayOfWeek].operations++
      weekData[dayOfWeek].revenue += amount
      
      const status = (row.status || '').toLowerCase()
      if (status === 'completed' || status === 'success') {
        weekData[dayOfWeek].success++
      }
    })

    weekData.forEach(day => {
      day.avgAmount = day.operations > 0 ? day.revenue / day.operations : 0
      day.conversionRate = day.operations > 0 ? (day.success / day.operations) * 100 : 0
    })

    return weekData
  }, [data, timezone])

  const formatTime = (hour) => `${hour.toString().padStart(2, '0')}:00`
  const formatCurrency = (amount) => new Intl.NumberFormat('tr-TR', {
    style: 'currency', currency: 'TRY', minimumFractionDigits: 0
  }).format(amount)

  const maxOperations = Math.max(...hourlyAnalytics.map(h => h.operations))
  const maxWeeklyOps = Math.max(...weeklyAnalytics.map(d => d.operations))

  return (
    <div className="space-y-8">
      {/* Заголовок с переключателями */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
            <Timer className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Временная аналитика</h3>
            <p className="text-gray-400">Паттерны активности • {timezone}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1 border border-white/10">
          {[
            { id: '24h', label: t('timePeriods.twentyFourHours'), icon: Clock },
            { id: '7d', label: t('timePeriods.sevenDays'), icon: Calendar },
            { id: 'peaks', label: t('charts.peaks'), icon: TrendingUp }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedPeriod(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                selectedPeriod === id
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

      {/* Основной контент */}
      {selectedPeriod === '24h' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* График по часам */}
          <div className="xl:col-span-2 bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Активность по часам
              </h4>
              <div className="text-sm text-gray-400">
                Операций: {hourlyAnalytics.reduce((sum, h) => sum + h.operations, 0)}
              </div>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {hourlyAnalytics.map((hour, index) => {
                const barWidth = maxOperations > 0 ? (hour.operations / maxOperations) * 100 : 0
                const isHovered = hoveredHour === index
                
                return (
                  <div
                    key={index}
                    className="group relative"
                    onMouseEnter={() => setHoveredHour(index)}
                    onMouseLeave={() => setHoveredHour(null)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 text-sm text-gray-300 font-mono">
                        {formatTime(hour.hour)}
                      </div>
                      
                      <div className="flex-1 relative h-8">
                        <div className="absolute inset-0 bg-gray-700/50 rounded-full" />
                        <div 
                          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out ${
                            isHovered 
                              ? 'bg-gradient-to-r from-purple-400 to-pink-400' 
                              : 'bg-gradient-to-r from-blue-500 to-purple-500'
                          }`}
                          style={{ 
                            width: `${barWidth}%`,
                            transform: `scaleY(${isHovered ? 1.1 : 1})`
                          }}
                        />
                        
                        {hour.operations > 0 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-medium text-white drop-shadow-sm">
                              {hour.operations}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="w-24 text-right">
                        <div className="text-sm font-medium text-white">
                          {formatCurrency(hour.revenue)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {hour.conversionRate.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    
                    {/* Детальная информация при ховере */}
                    {isHovered && (
                      <div className="absolute left-16 top-10 z-10 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="text-gray-400">Операции</div>
                            <div className="text-white font-medium">{hour.operations}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Средняя сумма</div>
                            <div className="text-white font-medium">{formatCurrency(hour.avgAmount)}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Успешно</div>
                            <div className="text-green-400 font-medium">{hour.success}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Неудачно</div>
                            <div className="text-red-400 font-medium">{hour.failed}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Пиковые часы */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-400" />
              Пиковые часы
            </h4>
            
            <div className="space-y-4">
              {peakHours.map((hour, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                    index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                    'bg-gradient-to-r from-orange-400 to-red-500'
                  }`}>
                    {index + 1}
                  </div>
                  
                  <div className="flex-1">
                    <div className="text-white font-medium">
                      {formatTime(hour.hour)}
                    </div>
                    <div className="text-sm text-gray-400">
                      {hour.operations} операций • {hour.conversionRate.toFixed(1)}%
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-white font-medium">
                      {formatCurrency(hour.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedPeriod === '7d' && (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-400" />
            Активность по дням недели
          </h4>
          
          <div className="space-y-4">
            {weeklyAnalytics.map((day, index) => {
              const barWidth = maxWeeklyOps > 0 ? (day.operations / maxWeeklyOps) * 100 : 0
              
              return (
                <div key={index} className="group">
                  <div className="flex items-center gap-4">
                    <div className="w-20 text-sm text-gray-300 font-medium">
                      {day.short}
                    </div>
                    
                    <div className="flex-1 relative h-10">
                      <div className="absolute inset-0 bg-gray-700/50 rounded-lg" />
                      <div 
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg transition-all duration-700 ease-out group-hover:from-green-400 group-hover:to-teal-400"
                        style={{ width: `${barWidth}%` }}
                      />
                      
                      {day.operations > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-medium text-white drop-shadow-sm">
                            {day.operations}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="w-32 text-right">
                      <div className="text-sm font-medium text-white">
                        {formatCurrency(day.revenue)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {day.conversionRate.toFixed(1)}% конверсия
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {selectedPeriod === 'peaks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {peakHours.map((hour, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${
                  index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                  index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                  'bg-gradient-to-r from-orange-400 to-red-500'
                }`}>
                  #{index + 1}
                </div>
                <div className="text-2xl font-bold text-white">
                  {formatTime(hour.hour)}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Операции</span>
                  <span className="text-white font-medium">{hour.operations}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Доход</span>
                  <span className="text-white font-medium">{formatCurrency(hour.revenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Конверсия</span>
                  <span className="text-green-400 font-medium">{hour.conversionRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Средняя сумма</span>
                  <span className="text-white font-medium">{formatCurrency(hour.avgAmount)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ModernTimeAnalytics 