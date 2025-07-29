import { TrendingUp, TrendingDown, DollarSign, Users, Activity, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react'

const MetricsGrid = ({ metrics, dataType = 'merchant', selectedProvider = null }) => {
  if (!metrics) return null

  // Отладочная информация
  console.log('🔍 MetricsGrid получил метрики:', metrics)
  console.log('🔍 MetricsGrid dataType:', dataType)
  console.log('🔍 MetricsGrid selectedProvider:', selectedProvider)

  // Правильное определение валюты на основе провайдера и данных
  const getCurrency = () => {
    // Приоритет: selectedProvider -> metrics.provider -> metrics.currency -> 'TRY'
    if (selectedProvider === 'payshack') return 'INR'
    if (selectedProvider === 'optipay') return 'TRY'
    if (metrics.provider === 'payshack') return 'INR'
    if (metrics.provider === 'optipay') return 'TRY'
    if (metrics.currency) return metrics.currency
    return 'TRY' // По умолчанию
  }

  const currency = getCurrency()
  const currencyCode = currency
  console.log('💰 Определенная валюта:', currency, 'для провайдера:', selectedProvider || metrics.provider)
  
  const sourceName = dataType === 'merchant' ? 'провайдера' : 'платформы'

  // Улучшенная функция форматирования валют с автоматическим определением
  const formatCurrency = (amount, currencyCode = 'TRY') => {
    if (!amount && amount !== 0) return '—'
    
    // Определяем валюту из метрик если не передана
    if (!currencyCode && metrics?.currency) {
      currencyCode = metrics.currency
    }
    
    let locale = 'tr-TR' // По умолчанию
    const options = { 
      style: 'currency', 
      currency: currencyCode, 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    }
    
    // Настройки форматирования для разных валют
    if (currencyCode === 'INR') {
      locale = 'en-IN'
      options.maximumFractionDigits = 2
      // Для больших сумм в INR показываем лакхи и кроры
      if (amount >= 10000000) { // 1 crore = 10,000,000
        return `₹${(amount / 10000000).toFixed(1)}Cr`
      } else if (amount >= 100000) { // 1 lakh = 100,000
        return `₹${(amount / 100000).toFixed(1)}L`
      }
    } else if (currencyCode === 'TRY') {
      locale = 'tr-TR'
    } else if (currencyCode === 'EUR') {
      locale = 'de-DE'  
    } else if (currencyCode === 'USD') {
      locale = 'en-US'
    } else {
      // Автоматическое определение локали для неизвестных валют
      try {
        // Пытаемся использовать валюту как есть
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currencyCode,
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }).format(amount)
      } catch (error) {
        console.warn('⚠️ Неизвестная валюта:', currencyCode, 'Использую дефолтное форматирование')
        return `${currencyCode} ${amount.toLocaleString()}`
      }
    }
    
    try {
      return new Intl.NumberFormat(locale, options).format(amount)
    } catch (error) {
      console.warn('⚠️ Ошибка форматирования валюты:', error, 'currency:', currencyCode)
      // Fallback форматирование
      if (currencyCode === 'INR') {
        return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
      } else if (currencyCode === 'TRY') {
        return `₺${amount.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
      }
      return `${currencyCode} ${amount.toLocaleString()}`
    }
  }

  const metricsData = [
    {
      title: 'Всего операций',
      value: metrics.total.toLocaleString('tr-TR'),
      icon: Activity,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30'
    },
    {
      title: 'Успешные',
      value: metrics.successful.toLocaleString('tr-TR'),
      subtitle: `${metrics.conversionRate.toFixed(1)}% конверсия`,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30'
    },
    {
      title: 'Неудачные',
      value: metrics.failed.toLocaleString('tr-TR'),
      subtitle: `${((metrics.failed / metrics.total) * 100).toFixed(1)}% отказов`,
      icon: XCircle,
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/30'
    },
    {
      title: 'В ожидании',
      value: (metrics.pending || 0).toLocaleString('tr-TR'),
      subtitle: `${(((metrics.pending || 0) / metrics.total) * 100).toFixed(1)}% в обработке`,
      icon: Clock,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/30'
    },
    {
      title: 'Общая выручка',
      value: formatCurrency(metrics.successfulRevenue),
      subtitle: 'Только успешные операции',
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-500/20',
      borderColor: 'border-emerald-500/30'
    },
    {
      title: 'Потерянная выручка',
      value: formatCurrency(metrics.lostRevenue || 0),
      subtitle: 'Неудачные и отмененные',
      icon: TrendingDown,
      color: 'from-red-500 to-rose-500',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/30'
    },
    {
      title: 'Общая сумма',
      value: formatCurrency(metrics.totalAmount || metrics.totalRevenue || 0),
      subtitle: 'Все операции',
      icon: DollarSign,
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/30'
    },
    {
      title: 'Комиссии',
      value: formatCurrency(metrics.totalFees || 0),
      subtitle: 'Общая сумма комиссий',
      icon: DollarSign,
      color: 'from-indigo-500 to-blue-500',
      bgColor: 'bg-indigo-500/20',
      borderColor: 'border-indigo-500/30'
    },
    {
      title: 'Отмененные',
      value: (metrics.canceled || 0).toLocaleString('tr-TR'),
      subtitle: `${(((metrics.canceled || 0) / metrics.total) * 100).toFixed(1)}% отменено`,
      icon: XCircle,
      color: 'from-gray-500 to-slate-500',
      bgColor: 'bg-gray-500/20',
      borderColor: 'border-gray-500/30'
    },
    {
      title: 'Средняя сумма',
      value: formatCurrency(metrics.averageAmount),
      subtitle: 'Среднее по всем операциям',
      icon: TrendingUp,
      color: 'from-cyan-500 to-blue-500',
      bgColor: 'bg-cyan-500/20',
      borderColor: 'border-cyan-500/30'
    },

  ]

  // Фильтруем метрики в зависимости от типа данных
  const filteredMetrics = metricsData.filter(metric => !metric.hidden)

  return (
    <div className="space-y-6">
      {/* Заголовок секции */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Ключевые метрики</h2>
          <p className="text-gray-300">
            Основные показатели по {sourceName} • Валюта: {currency}
          </p>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-full">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-sm text-white">Актуальные данные</span>
        </div>
      </div>

      {/* Сетка метрик */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMetrics.map((metric, index) => (
          <div
            key={index}
            className={`bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 ${metric.borderColor} hover:bg-white/10 transition-all duration-300`}
          >
            {/* Иконка */}
            <div className={`w-12 h-12 bg-gradient-to-br ${metric.color} rounded-xl flex items-center justify-center mb-4`}>
              <metric.icon className="w-6 h-6 text-white" />
            </div>

            {/* Значение */}
            <div className="mb-2">
              <div className="text-2xl font-bold text-white">{metric.value}</div>
              <div className="text-lg font-semibold text-gray-300">{metric.title}</div>
            </div>

            {/* Подзаголовок */}
            {metric.subtitle && (
              <div className="text-sm text-gray-400">{metric.subtitle}</div>
            )}
          </div>
        ))}
      </div>

      {/* Дополнительная информация */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Статистика по компаниям (только для провайдера) */}
        {dataType === 'merchant' && metrics.companyStats && Object.keys(metrics.companyStats).length > 0 && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-400" />
              Топ компаний
            </h3>
            <div className="space-y-3">
              {Object.entries(metrics.companyStats)
                .sort(([,a], [,b]) => b.revenue - a.revenue)
                .slice(0, 3)
                .map(([company, stats], index) => (
                  <div key={company} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{company}</div>
                        <div className="text-xs text-gray-400">{stats.total} операций</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-white">{formatCurrency(stats.revenue)}</div>
                      <div className="text-xs text-gray-400">
                        {((stats.completed / stats.total) * 100).toFixed(1)}% успех
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Статистика по методам оплаты */}
        {metrics.paymentMethodStats && Object.keys(metrics.paymentMethodStats).length > 0 && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-green-400" />
              Методы оплаты
            </h3>
            <div className="space-y-3">
              {Object.entries(metrics.paymentMethodStats)
                .sort(([,a], [,b]) => b.total - a.total)
                .slice(0, 3)
                .map(([method, stats], index) => (
                  <div key={method} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{method}</div>
                        <div className="text-xs text-gray-400">{stats.total} операций</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-white">{stats.completed}</div>
                      <div className="text-xs text-gray-400">
                        {((stats.completed / stats.total) * 100).toFixed(1)}% успех
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Общая статистика */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
            Эффективность
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">Конверсия</span>
                <span className="text-white font-semibold">{metrics.conversionRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(metrics.conversionRate, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">Средняя сумма</span>
                <span className="text-white font-semibold">{formatCurrency(metrics.averageAmount)}</span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">Комиссии</span>
                                 <span className="text-white font-semibold">{formatCurrency(metrics.totalFees || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MetricsGrid 