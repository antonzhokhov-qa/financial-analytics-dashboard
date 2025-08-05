import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from '../contexts/LanguageContext'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, Cell, PieChart, Pie } from 'recharts'
import { TrendingUp, TrendingDown, Clock, Calendar, DollarSign, Percent, Activity, Users, Zap, Target, ArrowUp, ArrowDown } from 'lucide-react'
import { Card, CardContent, CardTitle } from './ui/Card'

const BeautifulChartsGrid = ({ data, dataType, timezone = 'UTC' }) => {
  const [animationKey, setAnimationKey] = useState(0)

  const { t } = useTranslation()
  // Триггер анимации при смене данных
  useEffect(() => {
    setAnimationKey(prev => prev + 1)
  }, [data])

  console.log('🎨 BeautifulChartsGrid received data:', {
    dataLength: data?.length || 0,
    dataType: dataType,
    timezone: timezone,
    sampleData: data?.slice(0, 2) || null
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

  // Подготовка данных для горизонтальных линейных графиков по часам
  const hourlyLineData = useMemo(() => {
    console.log('⏰ Processing hourly line data for beautiful charts...')
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log('⚠️ No data available for hourly line charts')
      return []
    }
    
    const hourlyData = {}
    
    data.forEach((item, index) => {
      const dateField = item.createdAt || item.date || item.operation_created_at
      if (!dateField) return
      
      const date = convertToTimezone(dateField, timezone)
      const hour = date.getHours()
      const amount = parseFloat(item.amount || 0)
      
      if (!hourlyData[hour]) {
        hourlyData[hour] = {
          hour: `${hour.toString().padStart(2, '0')}:00`,
          shortHour: `${hour}h`,
          hourNumber: hour,
          volume: 0,
          count: 0,
          success: 0,
          failed: 0,
          successVolume: 0,
          failedVolume: 0,
          conversionRate: 0
        }
      }
      
      hourlyData[hour].volume += amount
      hourlyData[hour].count += 1
      
      const status = (item.status || '').toLowerCase()
      const isSuccess = item.isCompleted || 
                       status === 'completed' || 
                       status === 'success' || 
                       status === 'complete'
      const isFailed = item.isFailed || 
                      status === 'failed' || 
                      status === 'fail' || 
                      status === 'canceled' ||
                      status === 'cancelled'
      
      if (isSuccess) {
        hourlyData[hour].success += 1
        hourlyData[hour].successVolume += amount
      } else if (isFailed) {
        hourlyData[hour].failed += 1
        hourlyData[hour].failedVolume += amount
      }
    })

    const result = Array.from({ length: 24 }, (_, i) => 
      hourlyData[i] || {
        hour: `${i.toString().padStart(2, '0')}:00`,
        shortHour: `${i}h`,
        hourNumber: i,
        volume: 0,
        count: 0,
        success: 0,
        failed: 0,
        successVolume: 0,
        failedVolume: 0,
        conversionRate: 0
      }
    ).map(item => ({
      ...item,
      conversionRate: item.count > 0 ? (item.success / item.count) * 100 : 0
    }))
    
    console.log('⏰ Hourly line processing complete:', {
      totalHours: result.length,
      activeHours: result.filter(h => h.count > 0).length,
      totalVolume: result.reduce((sum, h) => sum + h.volume, 0)
    })
    
    return result
  }, [data, timezone])

  // Подготовка данных для 15-минутных интервалов
  const fifteenMinuteData = useMemo(() => {
    console.log('🕐 Processing 15-minute interval data...')
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log('⚠️ No data available for 15-minute charts')
      return []
    }
    
    const intervalData = {}
    
    data.forEach((item) => {
      const dateField = item.createdAt || item.date || item.operation_created_at
      if (!dateField) return
      
      const date = convertToTimezone(dateField, timezone)
      const hour = date.getHours()
      const minute = date.getMinutes()
      const intervalMinute = Math.floor(minute / 15) * 15 // 0, 15, 30, 45
      const intervalKey = `${hour.toString().padStart(2, '0')}:${intervalMinute.toString().padStart(2, '0')}`
      const amount = parseFloat(item.amount || 0)
      
      if (!intervalData[intervalKey]) {
        intervalData[intervalKey] = {
          time: intervalKey,
          displayTime: `${hour.toString().padStart(2, '0')}:${intervalMinute.toString().padStart(2, '0')}`,
          hourMinute: hour * 60 + intervalMinute,
          volume: 0,
          count: 0,
          success: 0,
          failed: 0,
          successVolume: 0,
          failedVolume: 0
        }
      }
      
      intervalData[intervalKey].volume += amount
      intervalData[intervalKey].count += 1
      
      const status = (item.status || '').toLowerCase()
      const isSuccess = item.isCompleted || 
                       status === 'completed' || 
                       status === 'success' || 
                       status === 'complete'
      const isFailed = item.isFailed || 
                      status === 'failed' || 
                      status === 'fail' || 
                      status === 'canceled' ||
                      status === 'cancelled'
      
      if (isSuccess) {
        intervalData[intervalKey].success += 1
        intervalData[intervalKey].successVolume += amount
      } else if (isFailed) {
        intervalData[intervalKey].failed += 1
        intervalData[intervalKey].failedVolume += amount
      }
    })

    const result = Object.values(intervalData)
      .sort((a, b) => a.hourMinute - b.hourMinute)
      .filter(item => item.count > 0) // Показываем только активные интервалы
      .slice(0, 24) // Топ 24 интервала
    
    console.log('🕐 15-minute processing complete:', {
      activeIntervals: result.length,
      totalVolume: result.reduce((sum, i) => sum + i.volume, 0),
      totalTransactions: result.reduce((sum, i) => sum + i.count, 0)
    })
    
    return result
  }, [data, timezone])

  // Подготовка данных для графиков объемов по дням
  const dailyVolumeData = useMemo(() => {
    console.log('📅 Processing daily data for beautiful charts...')
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log('⚠️ No data available for daily charts')
      return []
    }
    
    const dailyData = {}
    
    data.forEach((item, index) => {
      const dateField = item.createdAt || item.date || item.operation_created_at
      if (!dateField) return
      
      const date = convertToTimezone(dateField, timezone)
      const day = date.toISOString().split('T')[0]
      const amount = parseFloat(item.amount || 0)
      
      if (!dailyData[day]) {
        dailyData[day] = {
          date: day,
          displayDate: date.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' }),
          volume: 0,
          count: 0,
          success: 0,
          failed: 0,
          successVolume: 0,
          failedVolume: 0,
          conversionRate: 0
        }
      }
      
      dailyData[day].volume += amount
      dailyData[day].count += 1
      
      const status = (item.status || '').toLowerCase()
      const isSuccess = item.isCompleted || 
                       status === 'completed' || 
                       status === 'success' || 
                       status === 'complete'
      const isFailed = item.isFailed || 
                      status === 'failed' || 
                      status === 'fail' || 
                      status === 'canceled' ||
                      status === 'cancelled'
      
      if (isSuccess) {
        dailyData[day].success += 1
        dailyData[day].successVolume += amount
      } else if (isFailed) {
        dailyData[day].failed += 1
        dailyData[day].failedVolume += amount
      }
    })

    const result = Object.values(dailyData)
      .map(day => ({
        ...day,
        conversionRate: day.count > 0 ? (day.success / day.count) * 100 : 0
      }))
      .sort((a, b) => b.volume - a.volume) // Сортируем по объему
      .slice(0, 10) // Топ 10 дней
      
    console.log('📅 Daily processing complete:', {
      activeDays: result.length,
      totalSuccess: result.reduce((sum, d) => sum + d.success, 0),
      totalVolume: result.reduce((sum, d) => sum + d.volume, 0)
    })
    
    return result
  }, [data, timezone])

  // Статистические данные с разделением на депозиты и выплаты
  const stats = useMemo(() => {
    const totalOperations = data.length
    const successfulOperations = data.filter(d => {
      const status = (d.status || '').toLowerCase()
      return d.isCompleted || 
             status === 'completed' || 
             status === 'success' || 
             status === 'complete'
    }).length
    const totalVolume = data.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0)
    const successfulVolume = data
      .filter(d => {
        const status = (d.status || '').toLowerCase()
        return d.isCompleted || 
               status === 'completed' || 
               status === 'success' || 
               status === 'complete'
      })
      .reduce((sum, d) => sum + parseFloat(d.amount || 0), 0)
    
    // Депозиты
    const deposits = data.filter(d => d.isDeposit || d.type === 'deposit' || (d.transactionType && d.transactionType.toLowerCase().includes('пополнение')))
    const successfulDeposits = deposits.filter(d => {
      const status = (d.status || '').toLowerCase()
      return d.isCompleted || status === 'completed' || status === 'success' || status === 'complete'
    })
    const depositVolume = deposits.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0)
    const successfulDepositVolume = successfulDeposits.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0)
    
    // Выплаты
    const withdrawals = data.filter(d => d.isWithdraw || d.type === 'withdraw' || (d.transactionType && d.transactionType.toLowerCase().includes('вывод')))
    const successfulWithdrawals = withdrawals.filter(d => {
      const status = (d.status || '').toLowerCase()
      return d.isCompleted || status === 'completed' || status === 'success' || status === 'complete'
    })
    const withdrawalVolume = withdrawals.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0)
    const successfulWithdrawalVolume = successfulWithdrawals.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0)
    
    return {
      totalOperations,
      successfulOperations,
      totalVolume,
      successfulVolume,
      conversionRate: totalOperations > 0 ? (successfulOperations / totalOperations) * 100 : 0,
      averageAmount: totalOperations > 0 ? totalVolume / totalOperations : 0,
      
      // Депозиты
      deposits: {
        total: deposits.length,
        successful: successfulDeposits.length,
        volume: depositVolume,
        successfulVolume: successfulDepositVolume,
        conversionRate: deposits.length > 0 ? (successfulDeposits.length / deposits.length) * 100 : 0,
        averageAmount: deposits.length > 0 ? depositVolume / deposits.length : 0
      },
      
      // Выплаты  
      withdrawals: {
        total: withdrawals.length,
        successful: successfulWithdrawals.length,
        volume: withdrawalVolume,
        successfulVolume: successfulWithdrawalVolume,
        conversionRate: withdrawals.length > 0 ? (successfulWithdrawals.length / withdrawals.length) * 100 : 0,
        averageAmount: withdrawals.length > 0 ? withdrawalVolume / withdrawals.length : 0
      }
    }
  }, [data])

  // Цветовая схема
  const colorScheme = {
    primary: '#8B5CF6',
    secondary: '#06B6D4',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    gradientSuccess: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    gradientWarning: 'linear-gradient(135deg, #FFB75E 0%, #ED8F03 100%)'
  }

  // Определяем валюту из данных
  const getCurrency = useMemo(() => {
    if (!data || data.length === 0) return 'TRY'
    
    // Ищем валюту в данных
    const firstItemWithCurrency = data.find(item => item.currency)
    if (firstItemWithCurrency) {
      console.log('💰 Currency detected from data:', firstItemWithCurrency.currency)
      return firstItemWithCurrency.currency
    }
    
    // Проверяем provider для определения валюты
    const firstItemWithProvider = data.find(item => item.provider)
    if (firstItemWithProvider) {
      const currency = firstItemWithProvider.provider === 'payshack' ? 'INR' : 'TRY'
      console.log('💰 Currency detected from provider:', currency)
      return currency
    }
    
    // Проверяем форматированные суммы для извлечения валюты
    const firstItemWithFormatted = data.find(item => item.amountFormatted)
    if (firstItemWithFormatted) {
      const formatted = firstItemWithFormatted.amountFormatted
      if (formatted.includes('TRY') || formatted.includes('₺')) return 'TRY'
      if (formatted.includes('INR') || formatted.includes('₹')) return 'INR'
      if (formatted.includes('EUR') || formatted.includes('€')) return 'EUR'
      if (formatted.includes('USD') || formatted.includes('$')) return 'USD'
    }
    
    console.log('💰 No currency detected, using default: TRY')
    return 'TRY' // По умолчанию турецкая лира
  }, [data])

  const formatCurrency = (value) => {
    const currency = getCurrency
    let locale = 'en-US'
    
    // Определяем локаль в зависимости от валюты
    if (currency === 'TRY') locale = 'tr-TR'
    else if (currency === 'INR') locale = 'en-IN'
    
    const options = {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }
    
    // Для INR используем специальное форматирование для больших сумм
    if (currency === 'INR') {
      options.maximumFractionDigits = 2
      // Для больших сумм в INR показываем лакхи и кроры
      if (value >= 10000000) { // 1 crore
        return `₹${(value / 10000000).toFixed(1)}Cr`
      } else if (value >= 100000) { // 1 lakh
        return `₹${(value / 100000).toFixed(1)}L`
      }
    }
    
    return new Intl.NumberFormat(locale, options).format(value)
  }

  // Компонент кастомного тултипа
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/95 backdrop-blur-lg border border-purple-500/30 rounded-xl p-4 shadow-2xl">
          <p className="text-white font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-gray-300 text-sm">{entry.name}</span>
              </div>
              <span className="text-white font-medium">
                {typeof entry.value === 'number' && entry.value > 1000 
                  ? formatCurrency(entry.value)
                  : entry.value
                }
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  // Убираем вкладки - показываем все графики сразу

  return (
    <div className="space-y-8">
      {/* Заголовок с анимацией */}
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
          <div className="relative w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto">
            <Activity className="w-12 h-12 text-white animate-bounce" />
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Beautiful Analytics
          </h1>
          <p className="text-xl text-gray-300 mt-2">
            {t('charts.interactive')} • {timezone}
          </p>
        </div>
      </div>

      {/* Статистические карточки с анимацией - Общие */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: t('charts.totalVolume'),
            value: formatCurrency(stats.totalVolume),
            subtitle: `${stats.totalOperations} ${t('table.operations')}`,
            icon: DollarSign,
            gradient: 'from-blue-500 to-cyan-500',
            change: '+12.5%'
          },
          {
            title: t('charts.successful'),
            value: formatCurrency(stats.successfulVolume),
            subtitle: `${stats.successfulOperations} ${t('table.operations')}`,
            icon: TrendingUp,
            gradient: 'from-green-500 to-emerald-500',
            change: '+8.2%'
          },
          {
            title: t('charts.conversionRate'),
            value: `${stats.conversionRate.toFixed(1)}%`,
            subtitle: t('charts.totalConversion'),
            icon: Target,
            gradient: 'from-purple-500 to-pink-500',
            change: '+2.1%'
          },
          {
            title: t('charts.averageCheck'),
            value: formatCurrency(stats.averageAmount),
            subtitle: t('charts.onOperation'),
            icon: Percent,
            gradient: 'from-orange-500 to-red-500',
            change: '+5.8%'
          }
        ].map((stat, index) => (
          <Card key={index} className="group hover:scale-105 transition-all duration-300 cursor-pointer">
            <CardContent className="p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 rounded-full transform translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-300" 
                   style={{ backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))` }}></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-sm text-green-400">
                      <ArrowUp className="w-4 h-4 mr-1" />
                      {stat.change}
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-white mb-1 group-hover:text-purple-400 transition-colors duration-300">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500">{stat.subtitle}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Симметричное сравнение депозитов и выплат */}
      {(stats.deposits.total > 0 || stats.withdrawals.total > 0) && (
        <>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-red-400 bg-clip-text text-transparent">
              Депозиты vs Выплаты
            </h2>
            <p className="text-gray-300">Симметричное сравнение операций для анализа баланса</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Депозиты */}
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-bold text-emerald-400 flex items-center justify-center gap-2">
                  <ArrowDown className="w-6 h-6" />
                  Депозиты (Пополнения)
                </h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="border-emerald-500/20 bg-emerald-500/5">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-400">
                      {stats.deposits.total}
                    </div>
                    <div className="text-sm text-gray-400">Всего операций</div>
                  </CardContent>
                </Card>
                
                <Card className="border-emerald-500/20 bg-emerald-500/5">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-400">
                      {stats.deposits.successful}
                    </div>
                    <div className="text-sm text-gray-400">Успешных</div>
                  </CardContent>
                </Card>
                
                <Card className="border-emerald-500/20 bg-emerald-500/5">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-400">
                      {formatCurrency(stats.deposits.successfulVolume)}
                    </div>
                    <div className="text-sm text-gray-400">Успешный объем</div>
                  </CardContent>
                </Card>
                
                <Card className="border-emerald-500/20 bg-emerald-500/5">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-400">
                      {stats.deposits.conversionRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-400">Конверсия</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Выплаты */}
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-bold text-red-400 flex items-center justify-center gap-2">
                  <ArrowUp className="w-6 h-6" />
                  Выплаты (Выводы)
                </h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="border-red-500/20 bg-red-500/5">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-400">
                      {stats.withdrawals.total}
                    </div>
                    <div className="text-sm text-gray-400">Всего операций</div>
                  </CardContent>
                </Card>
                
                <Card className="border-red-500/20 bg-red-500/5">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-400">
                      {stats.withdrawals.successful}
                    </div>
                    <div className="text-sm text-gray-400">Успешных</div>
                  </CardContent>
                </Card>
                
                <Card className="border-red-500/20 bg-red-500/5">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-400">
                      {formatCurrency(stats.withdrawals.successfulVolume)}
                    </div>
                    <div className="text-sm text-gray-400">Успешный объем</div>
                  </CardContent>
                </Card>
                
                <Card className="border-red-500/20 bg-red-500/5">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-400">
                      {stats.withdrawals.conversionRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-400">Конверсия</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Сравнительный график */}
          <Card className="border-purple-500/20 bg-purple-500/5">
            <CardContent className="p-6">
              <CardTitle className="mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Сравнение депозитов и выплат</h3>
                  <p className="text-sm text-gray-400">Визуальное сравнение объемов и конверсии</p>
                </div>
              </CardTitle>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        type: t('charts.deposits'),
                        volume: stats.deposits.successfulVolume,
                        count: stats.deposits.successful,
                        conversion: stats.deposits.conversionRate
                      },
                      {
                        type: t('charts.withdrawals'),
                        volume: stats.withdrawals.successfulVolume,
                        count: stats.withdrawals.successful,
                        conversion: stats.withdrawals.conversionRate
                      }
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    key={`comparison-${animationKey}`}
                  >
                    <defs>
                      <linearGradient id="depositGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#059669" stopOpacity={0.8}/>
                      </linearGradient>
                      <linearGradient id="withdrawalGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EF4444" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#DC2626" stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis 
                      dataKey="type"
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickFormatter={formatCurrency}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="volume"
                      fill={(entry, index) => index === 0 ? "url(#depositGradient)" : "url(#withdrawalGradient)"}
                      radius={[4, 4, 0, 0]}
                      name={t('charts.volume')}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Убираем табы - показываем все графики сразу */}

      {/* Все графики показываем сразу */}
      <div className="space-y-8">
        
        {/* Первый ряд - Горизонтальные линейные графики по часам и 15 минуткам */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Почасовые линейные графики (горизонтальные) */}
          <Card className="group hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500">
            <CardContent className="p-6">
              <CardTitle className="mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Объем по часам (линейный)</h3>
                  <p className="text-sm text-gray-400">Горизонтальный тренд по 24 часам</p>
                </div>
              </CardTitle>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={hourlyLineData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    key={`hourly-line-${animationKey}`}
                  >
                    <defs>
                      <linearGradient id="hourlyLineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                        <stop offset="50%" stopColor="#06B6D4" stopOpacity={0.6}/>
                        <stop offset="100%" stopColor="#10B981" stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis 
                      dataKey="shortHour"
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickMargin={10}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickFormatter={formatCurrency}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone"
                      dataKey="volume" 
                      stroke="url(#hourlyLineGradient)"
                      strokeWidth={3}
                      dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 7, stroke: '#8B5CF6', strokeWidth: 2, fill: '#FFFFFF' }}
                      name={t('charts.volume')}
                    />
                    <Line 
                      type="monotone"
                      dataKey="count" 
                      stroke="#F59E0B"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: '#F59E0B', strokeWidth: 1, r: 3 }}
                      name={t('charts.quantity')}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 15-минутные интервалы (горизонтальные линейные) */}
          <Card className="group hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-500">
            <CardContent className="p-6">
              <CardTitle className="mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">15-минутные интервалы</h3>
                  <p className="text-sm text-gray-400">Детальная динамика активности</p>
                </div>
              </CardTitle>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={fifteenMinuteData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    key={`fifteen-min-${animationKey}`}
                  >
                    <defs>
                      <linearGradient id="fifteenMinGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.8}/>
                        <stop offset="50%" stopColor="#06B6D4" stopOpacity={0.6}/>
                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                      </linearGradient>
                      <linearGradient id="fifteenMinAreaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.4}/>
                        <stop offset="100%" stopColor="#10B981" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis 
                      dataKey="displayTime"
                      stroke="#9CA3AF"
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickFormatter={formatCurrency}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="volume" 
                      stroke="url(#fifteenMinGradient)"
                      fill="url(#fifteenMinAreaGradient)"
                      strokeWidth={3}
                      name={t('charts.volume')}
                    />
                    <Line 
                      type="monotone"
                      dataKey="count" 
                      stroke="#F59E0B"
                      strokeWidth={2}
                      strokeDasharray="3 3"
                      dot={{ fill: '#F59E0B', strokeWidth: 1, r: 2 }}
                      name={t('charts.transactions')}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Второй ряд - Конверсия по часам (линейный график) */}
        <Card className="group hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500">
          <CardContent className="p-6">
            <CardTitle className="mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Конверсия по часам</h3>
                <p className="text-sm text-gray-400">Процент успешных операций в течение дня</p>
              </div>
            </CardTitle>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={hourlyLineData.filter(h => h.count > 0)}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  key={`conversion-line-${animationKey}`}
                >
                  <defs>
                    <linearGradient id="conversionLineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.8}/>
                      <stop offset="50%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis 
                    dataKey="shortHour"
                    stroke="#9CA3AF"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => `${value}%`}
                    domain={[0, 100]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="conversionRate"
                    stroke="url(#conversionLineGradient)"
                    strokeWidth={3}
                    dot={{ fill: '#F59E0B', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, stroke: '#F59E0B', strokeWidth: 2, fill: '#FFFFFF' }}
                    name={t('charts.conversion')}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Третий ряд - Объемы по дням (для сравнения, можно оставить столбцовым) */}
        <Card className="group hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500">
          <CardContent className="p-6">
            <CardTitle className="mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Топ дни по объему</h3>
                <p className="text-sm text-gray-400">Лучшие дни по выручке</p>
              </div>
            </CardTitle>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dailyVolumeData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  key={`daily-${animationKey}`}
                >
                  <defs>
                    <linearGradient id="dailyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06B6D4" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#0891B2" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis 
                    dataKey="displayDate"
                    stroke="#9CA3AF"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={formatCurrency}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="volume" 
                    fill="url(#dailyGradient)"
                    radius={[4, 4, 0, 0]}
                    name={t('charts.volume')}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Подвал с дополнительной информацией */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Живая аналитика</h3>
                <p className="text-sm text-gray-400">Данные обновляются в реальном времени</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{stats.totalOperations}</p>
              <p className="text-sm text-gray-400">операций обработано</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default BeautifulChartsGrid 