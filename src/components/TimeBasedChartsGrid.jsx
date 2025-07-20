import { useMemo } from 'react'
import { Calendar, Clock, TrendingUp, BarChart3, Activity } from 'lucide-react'

const TimeBasedChartsGrid = ({ data, timezone = 'UTC' }) => {
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

  // Анализ по часам дня
  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      total: 0,
      completed: 0,
      failed: 0,
      canceled: 0,
      amount: 0
    }))

    data.forEach(row => {
      if (!row.createdAt) return
      
      const convertedDate = convertToTimezone(row.createdAt, timezone)
      const hour = convertedDate.getHours()
      
      if (hour >= 0 && hour < 24) {
        hours[hour].total++
        hours[hour].amount += parseFloat(row.amount) || 0
        
        const status = row.status ? row.status.toLowerCase() : ''
        if (status === 'completed') hours[hour].completed++
        else if (status === 'failed') hours[hour].failed++
        else if (status === 'canceled') hours[hour].canceled++
      }
    })

    return hours
  }, [data, timezone])

  // Анализ по дням недели
  const weeklyData = useMemo(() => {
    const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
    const weekData = days.map((day, index) => ({
      day,
      dayIndex: index,
      total: 0,
      completed: 0,
      failed: 0,
      canceled: 0,
      amount: 0
    }))

    data.forEach(row => {
      if (!row.createdAt) return
      
      const convertedDate = convertToTimezone(row.createdAt, timezone)
      const dayOfWeek = convertedDate.getDay()
      
      weekData[dayOfWeek].total++
      weekData[dayOfWeek].amount += parseFloat(row.amount) || 0
      
      const status = row.status ? row.status.toLowerCase() : ''
      if (status === 'completed') weekData[dayOfWeek].completed++
      else if (status === 'failed') weekData[dayOfWeek].failed++
      else if (status === 'canceled') weekData[dayOfWeek].canceled++
    })

    return weekData
  }, [data, timezone])

  // Анализ по датам
  const dailyData = useMemo(() => {
    const dailyStats = {}
    
    data.forEach(row => {
      if (!row.createdAt) return
      
      const convertedDate = convertToTimezone(row.createdAt, timezone)
      const dateKey = convertedDate.toISOString().split('T')[0]
      
      if (!dailyStats[dateKey]) {
        dailyStats[dateKey] = {
          date: dateKey,
          total: 0,
          completed: 0,
          failed: 0,
          canceled: 0,
          amount: 0
        }
      }
      
      dailyStats[dateKey].total++
      dailyStats[dateKey].amount += parseFloat(row.amount) || 0
      
      const status = row.status ? row.status.toLowerCase() : ''
      if (status === 'completed') dailyStats[dateKey].completed++
      else if (status === 'failed') dailyStats[dateKey].failed++
      else if (status === 'canceled') dailyStats[dateKey].canceled++
    })

    return Object.values(dailyStats).sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [data, timezone])

  // Топ часы по активности
  const topHours = useMemo(() => {
    return hourlyData
      .filter(h => h.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
  }, [hourlyData])

  // Топ дни по активности
  const topDays = useMemo(() => {
    return weeklyData
      .filter(d => d.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 3)
  }, [weeklyData])

  const formatTime = (hour) => {
    return `${hour.toString().padStart(2, '0')}:00`
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-6 h-6 text-purple-400" />
        <h3 className="text-xl font-semibold text-white">Временная аналитика</h3>
        <div className="text-sm text-gray-400">
          Часовой пояс: {timezone}
        </div>
      </div>

      {/* Статистика по часам */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* График по часам */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-blue-400" />
            <h4 className="text-lg font-medium text-white">Активность по часам</h4>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {hourlyData.map((hour, index) => {
              const maxTotal = Math.max(...hourlyData.map(h => h.total))
              const barWidth = maxTotal > 0 ? (hour.total / maxTotal) * 100 : 0
              
              return (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-12 text-sm text-gray-300 font-mono">
                    {formatTime(hour.hour)}
                  </div>
                  <div className="flex-1 relative">
                    <div className="w-full bg-gray-700 rounded-full h-6 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 flex items-center justify-center"
                        style={{ width: `${barWidth}%` }}
                      >
                        {hour.total > 0 && (
                          <span className="text-xs text-white font-medium">{hour.total}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="w-20 text-right text-sm text-gray-300">
                    {formatCurrency(hour.amount)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* График по дням недели */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5 text-green-400" />
            <h4 className="text-lg font-medium text-white">Активность по дням недели</h4>
          </div>
          <div className="space-y-3">
            {weeklyData.map((day, index) => {
              const maxTotal = Math.max(...weeklyData.map(d => d.total))
              const barWidth = maxTotal > 0 ? (day.total / maxTotal) * 100 : 0
              
              return (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-24 text-sm text-gray-300">
                    {day.day}
                  </div>
                  <div className="flex-1 relative">
                    <div className="w-full bg-gray-700 rounded-full h-6 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-teal-500 transition-all duration-500 flex items-center justify-center"
                        style={{ width: `${barWidth}%` }}
                      >
                        {day.total > 0 && (
                          <span className="text-xs text-white font-medium">{day.total}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="w-20 text-right text-sm text-gray-300">
                    {formatCurrency(day.amount)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Временная линия по дням */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          <h4 className="text-lg font-medium text-white">Динамика по дням</h4>
        </div>
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {dailyData.map((day, index) => {
            const maxTotal = Math.max(...dailyData.map(d => d.total))
            const barWidth = maxTotal > 0 ? (day.total / maxTotal) * 100 : 0
            const conversionRate = day.total > 0 ? (day.completed / day.total) * 100 : 0
            
            return (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-20 text-sm text-gray-300 font-mono">
                  {new Date(day.date).toLocaleDateString('ru-RU', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="flex-1 relative">
                  <div className="w-full bg-gray-700 rounded-full h-6 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 flex items-center justify-center"
                      style={{ width: `${barWidth}%` }}
                    >
                      {day.total > 0 && (
                        <span className="text-xs text-white font-medium">{day.total}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="w-16 text-right text-sm text-gray-300">
                  {conversionRate.toFixed(1)}%
                </div>
                <div className="w-20 text-right text-sm text-gray-300">
                  {formatCurrency(day.amount)}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Топ статистики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Топ часы */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-5 h-5 text-orange-400" />
            <h4 className="text-lg font-medium text-white">Топ часы по активности</h4>
          </div>
          <div className="space-y-3">
            {topHours.map((hour, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-white font-medium">{formatTime(hour.hour)}</div>
                    <div className="text-sm text-gray-300">{hour.total} операций</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">{formatCurrency(hour.amount)}</div>
                  <div className="text-sm text-gray-300">
                    {hour.total > 0 ? ((hour.completed / hour.total) * 100).toFixed(1) : 0}% конверсия
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Топ дни недели */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-5 h-5 text-green-400" />
            <h4 className="text-lg font-medium text-white">Топ дни недели</h4>
          </div>
          <div className="space-y-3">
            {topDays.map((day, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-white font-medium">{day.day}</div>
                    <div className="text-sm text-gray-300">{day.total} операций</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">{formatCurrency(day.amount)}</div>
                  <div className="text-sm text-gray-300">
                    {day.total > 0 ? ((day.completed / day.total) * 100).toFixed(1) : 0}% конверсия
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TimeBasedChartsGrid 