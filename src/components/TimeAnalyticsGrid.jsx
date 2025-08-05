import React, { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { Clock, TrendingUp, Calendar, Activity, Zap } from 'lucide-react'

const TimeAnalyticsGrid = ({ data, metrics }) => {
  if (!data || data.length === 0 || !metrics?.timeAnalysis) return null

  const { timeAnalysis } = metrics
  const currency = metrics.currency || 'TRY'

  // Форматирование валют
  const formatCurrency = (amount) => {
    const locale = currency === 'INR' ? 'en-IN' : currency === 'TRY' ? 'tr-TR' : 'en-US'
    const options = {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }
    
    if (currency === 'INR') {
      options.maximumFractionDigits = 2
      if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`
      if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
    }
    
    return new Intl.NumberFormat(locale, options).format(amount)
  }

  // Данные для почасового графика
  const hourlyData = useMemo(() => {
    return Object.entries(timeAnalysis.hourlyStats || {}).map(([hour, stats]) => ({
      hour: `${hour}:00`,
      hourNum: parseInt(hour),
      transactions: stats.count,
      revenue: stats.revenue,
      successful: stats.successful || 0,
      failed: stats.failed || 0,
      pending: stats.pending || 0,
      successRate: stats.count > 0 ? ((stats.successful || 0) / stats.count * 100).toFixed(1) : 0
    })).sort((a, b) => a.hourNum - b.hourNum)
  }, [timeAnalysis.hourlyStats])

  // Данные для дневного графика
  const dailyData = useMemo(() => {
    return Object.entries(timeAnalysis.dailyStats || {})
      .map(([date, stats]) => ({
        date,
        shortDate: new Date(date).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' }),
        transactions: stats.count,
        revenue: stats.revenue,
        successful: stats.successful || 0,
        failed: stats.failed || 0,
        pending: stats.pending || 0,
        dayOfWeek: stats.dayOfWeek,
        dayName: [t('weekdaysShort.sun'), t('weekdaysShort.mon'), t('weekdaysShort.tue'), t('weekdaysShort.wed'), t('weekdaysShort.thu'), t('weekdaysShort.fri'), t('weekdaysShort.sat')][stats.dayOfWeek]
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-30) // Показываем последние 30 дней
  }, [timeAnalysis.dailyStats])

  // Статистика по дням недели
  const weekdayStats = useMemo(() => {
    const weekdays = [t('weekdays.sunday'), t('weekdays.monday'), t('weekdays.tuesday'), t('weekdays.wednesday'), t('weekdays.thursday'), t('weekdays.friday'), t('weekdays.saturday')]
    const stats = Array(7).fill().map((_, i) => ({
      day: weekdays[i],
              shortDay: [t('weekdaysShort.sun'), t('weekdaysShort.mon'), t('weekdaysShort.tue'), t('weekdaysShort.wed'), t('weekdaysShort.thu'), t('weekdaysShort.fri'), t('weekdaysShort.sat')][i],
      transactions: 0,
      revenue: 0,
      successful: 0
    }))

    Object.values(timeAnalysis.dailyStats || {}).forEach(dayStats => {
      if (dayStats.dayOfWeek !== undefined) {
        stats[dayStats.dayOfWeek].transactions += dayStats.count
        stats[dayStats.dayOfWeek].revenue += dayStats.revenue
        stats[dayStats.dayOfWeek].successful += dayStats.successful || 0
      }
    })

    return stats
  }, [timeAnalysis.dailyStats])

  const colors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1']

  const insights = timeAnalysis.insights || {}

  return (
    <div className="space-y-6">
      {/* Заголовок секции */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Временная аналитика</h2>
          <p className="text-gray-300">
            Детальный анализ активности по времени • {dailyData.length} дней данных
          </p>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-full">
          <Clock className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-white">Временные тренды</span>
        </div>
      </div>

      {/* Ключевые инсайты */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between mb-4">
            <Zap className="w-8 h-8 text-blue-400" />
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                {insights.peakHour ? `${insights.peakHour.hour}:00` : 'N/A'}
              </div>
              <div className="text-sm text-gray-300">Пиковый час</div>
            </div>
          </div>
          {insights.peakHour && (
            <div className="text-xs text-gray-400">
              {insights.peakHour.count} транзакций
            </div>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8 text-green-400" />
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                {insights.peakDay ? new Date(insights.peakDay.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) : 'N/A'}
              </div>
              <div className="text-sm text-gray-300">Пиковый день</div>
            </div>
          </div>
          {insights.peakDay && (
            <div className="text-xs text-gray-400">
              {insights.peakDay.count} транзакций
            </div>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8 text-purple-400" />
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                {Math.round(insights.averageDailyTransactions || 0)}
              </div>
              <div className="text-sm text-gray-300">Среднее в день</div>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            транзакций
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/30">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-yellow-400" />
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                {insights.totalDays || 0}
              </div>
              <div className="text-sm text-gray-300">Активных дней</div>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            с транзакциями
          </div>
        </div>
      </div>

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Почасовая активность */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-400" />
            Активность по часам
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="hour" 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                  formatter={(value, name) => [
                    name === 'transactions' ? value : formatCurrency(value),
                    name === 'transactions' ? t('charts.transactions') : t('charts.revenue')
                  ]}
                />
                <Bar dataKey="transactions" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Дневная динамика */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
            Динамика по дням
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="shortDate" 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                  formatter={(value, name) => [
                    name === 'transactions' ? value : formatCurrency(value),
                    name === 'transactions' ? t('charts.transactions') : t('charts.revenue')
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="transactions" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Статистика по дням недели */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-purple-400" />
          Активность по дням недели
        </h3>
        <div className="grid grid-cols-7 gap-4">
          {weekdayStats.map((dayStats, index) => (
            <div key={dayStats.day} className="text-center">
              <div className="bg-white/10 rounded-lg p-4 mb-2">
                <div className="text-sm text-gray-300 mb-2">{dayStats.shortDay}</div>
                <div className="text-xl font-bold text-white mb-1">
                  {dayStats.transactions}
                </div>
                <div className="text-xs text-gray-400">
                  {formatCurrency(dayStats.revenue)}
                </div>
              </div>
              <div 
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: colors[index],
                  opacity: dayStats.transactions > 0 ? 0.8 : 0.2
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TimeAnalyticsGrid 