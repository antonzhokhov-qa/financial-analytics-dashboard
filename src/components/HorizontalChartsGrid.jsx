import { useState, useEffect, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import { TrendingUp, TrendingDown, Clock, Calendar, DollarSign, Percent, Activity, Users } from 'lucide-react'
import { Card, CardContent, CardTitle } from './ui/Card'

const HorizontalChartsGrid = ({ data, dataType, timezone = 'UTC' }) => {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('24h') // 24h, 7d, 30d

  // Добавляем логирование входных данных
  console.log('📊 HorizontalChartsGrid received data:', {
    dataLength: data?.length || 0,
    dataType: dataType,
    timezone: timezone,
    sampleData: data?.slice(0, 2) || null,
    firstItemKeys: data?.[0] ? Object.keys(data[0]) : null
  })

  // Функция для конвертации времени в выбранный часовой пояс
  const convertToTimezone = (dateString, targetTimezone) => {
    const date = new Date(dateString)
    if (targetTimezone === 'UTC') {
      return date
    }
    
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
    return new Date(date.getTime() + offset * 60 * 60 * 1000)
  }

  // Подготовка данных для графиков объемов по часам
  const hourlyVolumeData = useMemo(() => {
    console.log('⏰ Processing hourly data...')
    const hourlyData = {}
    
    data.forEach((item, index) => {
      // Используем разные поля для даты в зависимости от источника
      const dateField = item.createdAt || item.date || item.operation_created_at
      if (!dateField) {
        if (index < 5) console.log(`⚠️ No date field in item ${index}:`, item)
        return
      }
      
      const date = convertToTimezone(dateField, timezone)
      const hour = date.getHours()
      const amount = parseFloat(item.amount || 0)
      
      if (!hourlyData[hour]) {
        hourlyData[hour] = {
          hour: `${hour.toString().padStart(2, '0')}:00`,
          volume: 0,
          count: 0,
          success: 0,
          failed: 0
        }
      }
      
      hourlyData[hour].volume += amount
      hourlyData[hour].count += 1
      
      // Используем улучшенную логику определения статуса
      if (item.isCompleted || item.status === 'Completed' || item.status === 'success' || item.status === 'Success') {
        hourlyData[hour].success += 1
      } else if (item.isFailed || item.status === 'Failed' || item.status === 'fail' || item.status === 'Fail') {
        hourlyData[hour].failed += 1
      }
      
      if (index < 3) {
        console.log(`📝 Item ${index} processing:`, {
          dateField,
          hour,
          amount,
          status: item.status,
          isCompleted: item.isCompleted,
          isFailed: item.isFailed
        })
      }
    })

    const result = Array.from({ length: 24 }, (_, i) => 
      hourlyData[i] || {
        hour: `${i.toString().padStart(2, '0')}:00`,
        volume: 0,
        count: 0,
        success: 0,
        failed: 0
      }
    )
    
    console.log('⏰ Hourly processing complete:', {
      totalHours: result.length,
      activeHours: result.filter(h => h.count > 0).length,
      totalSuccess: result.reduce((sum, h) => sum + h.success, 0),
      totalVolume: result.reduce((sum, h) => sum + h.volume, 0)
    })
    
    return result
  }, [data, timezone])

  // Подготовка данных для графиков объемов по дням
  const dailyVolumeData = useMemo(() => {
    console.log('📅 Processing daily data...')
    const dailyData = {}
    
    data.forEach((item, index) => {
      // Используем разные поля для даты в зависимости от источника
      const dateField = item.createdAt || item.date || item.operation_created_at
      if (!dateField) {
        if (index < 5) console.log(`⚠️ No date field in daily item ${index}:`, item)
        return
      }
      
      const date = convertToTimezone(dateField, timezone)
      const day = date.toISOString().split('T')[0]
      const amount = parseFloat(item.amount || 0)
      
      if (!dailyData[day]) {
        dailyData[day] = {
          date: day,
          volume: 0,
          count: 0,
          success: 0,
          failed: 0
        }
      }
      
      dailyData[day].volume += amount
      dailyData[day].count += 1
      
      // Используем улучшенную логику определения статуса
      if (item.isCompleted || item.status === 'Completed' || item.status === 'success' || item.status === 'Success') {
        dailyData[day].success += 1
      } else if (item.isFailed || item.status === 'Failed' || item.status === 'fail' || item.status === 'Fail') {
        dailyData[day].failed += 1
      }
    })

    const result = Object.values(dailyData)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-30) // Последние 30 дней
      
    console.log('📅 Daily processing complete:', {
      totalDays: result.length,
      activeDays: result.filter(d => d.count > 0).length,
      totalSuccess: result.reduce((sum, d) => sum + d.success, 0),
      totalVolume: result.reduce((sum, d) => sum + d.volume, 0),
      dateRange: result.length > 0 ? `${result[0].date} - ${result[result.length - 1].date}` : 'no data'
    })
    
    return result
  }, [data, timezone])

  // Подготовка данных для конверсии по часам
  const hourlyConversionData = useMemo(() => {
    return hourlyVolumeData.map(item => ({
      ...item,
      conversionRate: item.count > 0 ? ((item.success / item.count) * 100).toFixed(1) : 0,
      conversionRateNum: item.count > 0 ? (item.success / item.count) * 100 : 0
    }))
  }, [hourlyVolumeData])

  // Подготовка данных для конверсии по дням
  const dailyConversionData = useMemo(() => {
    return dailyVolumeData.map(item => ({
      ...item,
      conversionRate: item.count > 0 ? ((item.success / item.count) * 100).toFixed(1) : 0,
      conversionRateNum: item.count > 0 ? (item.success / item.count) * 100 : 0,
      displayDate: new Date(item.date).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })
    }))
  }, [dailyVolumeData])

  // Данные для топ часов по объему
  const topHoursData = useMemo(() => {
    return [...hourlyVolumeData]
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 8)
      .map(item => ({
        ...item,
        volumeFormatted: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 0
        }).format(item.volume)
      }))
  }, [hourlyVolumeData])

  // Данные для топ дней по объему
  const topDaysData = useMemo(() => {
    return [...dailyVolumeData]
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 10)
      .map(item => ({
        ...item,
        volumeFormatted: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 0
        }).format(item.volume),
        displayDate: new Date(item.date).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })
      }))
  }, [dailyVolumeData])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const colors = {
    primary: '#8B5CF6',
    secondary: '#06B6D4',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6'
  }

  return (
    <div className="space-y-8">
      {/* Заголовок секции */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Activity className="w-8 h-8 text-purple-400" />
            Временная аналитика
          </h2>
          <p className="text-gray-400 mt-1">
            Анализ объемов и конверсии по времени • Часовой пояс: {timezone}
          </p>
        </div>
      </div>

      {/* Объемы по часам - Горизонтальный график */}
      <Card>
        <CardContent className="p-6">
          <CardTitle className="mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Объемы по часам (24ч)
          </CardTitle>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topHoursData}
                layout="horizontal"
                margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  type="number"
                  stroke="#9CA3AF"
                  tickFormatter={formatCurrency}
                />
                <YAxis 
                  type="category"
                  dataKey="hour"
                  stroke="#9CA3AF"
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                  formatter={(value, name) => [
                    name === 'volume' ? formatCurrency(value) : value,
                    name === 'volume' ? 'Объем' : name
                  ]}
                />
                <Bar 
                  dataKey="volume" 
                  fill={colors.primary}
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Объемы по дням - Горизонтальный график */}
      <Card>
        <CardContent className="p-6">
          <CardTitle className="mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-400" />
            Объемы по дням (топ-10)
          </CardTitle>
          
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topDaysData}
                layout="horizontal"
                margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  type="number"
                  stroke="#9CA3AF"
                  tickFormatter={formatCurrency}
                />
                <YAxis 
                  type="category"
                  dataKey="displayDate"
                  stroke="#9CA3AF"
                  width={70}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                  formatter={(value, name) => [
                    name === 'volume' ? formatCurrency(value) : value,
                    name === 'volume' ? 'Объем' : name
                  ]}
                />
                <Bar 
                  dataKey="volume" 
                  fill={colors.success}
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Конверсия по часам - Горизонтальная область */}
      <Card>
        <CardContent className="p-6">
          <CardTitle className="mb-6 flex items-center gap-2">
            <Percent className="w-5 h-5 text-yellow-400" />
            Конверсия по часам
          </CardTitle>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={hourlyConversionData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="hour"
                  stroke="#9CA3AF"
                />
                <YAxis 
                  stroke="#9CA3AF"
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                  formatter={(value, name) => [
                    `${value}%`,
                    'Конверсия'
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="conversionRateNum"
                  stroke={colors.warning}
                  fill={colors.warning}
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Конверсия по дням - Линейный график */}
      <Card>
        <CardContent className="p-6">
          <CardTitle className="mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Конверсия по дням
          </CardTitle>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dailyConversionData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="displayDate"
                  stroke="#9CA3AF"
                />
                <YAxis 
                  stroke="#9CA3AF"
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                  formatter={(value, name) => [
                    `${value}%`,
                    'Конверсия'
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="conversionRateNum"
                  stroke={colors.info}
                  strokeWidth={3}
                  dot={{ fill: colors.info, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: colors.info, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Сводная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Сумма успешных</p>
                <p className="text-2xl font-bold text-green-400">
                  {formatCurrency(
                    data
                      .filter(d => d.isCompleted || d.status === 'Completed' || d.status === 'success' || d.status === 'Success')
                      .reduce((sum, d) => sum + parseFloat(d.amount || 0), 0)
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {data.filter(d => d.isCompleted || d.status === 'Completed' || d.status === 'success' || d.status === 'Success').length} операций
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Пиковый час</p>
                <p className="text-2xl font-bold text-white">
                  {topHoursData[0]?.hour || '--:--'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {topHoursData[0]?.volumeFormatted || '€0'}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Лучший день</p>
                <p className="text-2xl font-bold text-white">
                  {topDaysData[0]?.displayDate || '--'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {topDaysData[0]?.volumeFormatted || '€0'}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Средняя конверсия</p>
                <p className="text-2xl font-bold text-white">
                  {data.length > 0 ? 
                    ((data.filter(d => d.isCompleted || d.status === 'Completed' || d.status === 'success' || d.status === 'Success').length / data.length) * 100).toFixed(1) + '%'
                    : '0%'
                  }
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  За весь период
                </p>
              </div>
              <Percent className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Активных дней</p>
                <p className="text-2xl font-bold text-white">
                  {dailyVolumeData.filter(d => d.count > 0).length}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  С транзакциями
                </p>
              </div>
              <Activity className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default HorizontalChartsGrid 