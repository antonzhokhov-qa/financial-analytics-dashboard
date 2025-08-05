import { TrendingUp, TrendingDown, DollarSign, Users, Activity, AlertTriangle, CheckCircle, XCircle, Clock, Globe, Building, ArrowUpCircle, ArrowDownCircle, Coins } from 'lucide-react'
import { useTranslation } from '../contexts/LanguageContext'

const MetricsGrid = ({ metrics, dataType = 'merchant', selectedProvider = null }) => {
  const { t } = useTranslation()
  if (!metrics) return null

  // Отладочная информация
  console.log('🔍 MetricsGrid получил метрики:', metrics)
  console.log('🔍 MetricsGrid dataType:', dataType)
  console.log('🔍 MetricsGrid selectedProvider:', selectedProvider)
  console.log('🔍 MetricsGrid currencyBreakdown:', metrics.currencyBreakdown)
  console.log('🔍 MetricsGrid merchantBreakdown:', metrics.merchantBreakdown)

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

  // Проверяем есть ли мультивалютность
  const isMultiCurrency = metrics.currencyBreakdown && metrics.currencyBreakdown.length > 1
  const hasCurrencyBreakdown = metrics.currencyBreakdown && metrics.currencyBreakdown.length > 0
  const hasMerchantBreakdown = metrics.merchantBreakdown && metrics.merchantBreakdown.length > 0

  console.log('🌍 Мультивалютность:', {
    isMultiCurrency,
    hasCurrencyBreakdown,
    currencyCount: metrics.currencyBreakdown?.length || 0,
    merchantCount: metrics.merchantBreakdown?.length || 0
  })

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
      title: t('metrics.totalOperations'),
      value: metrics.total.toLocaleString('tr-TR'),
      icon: Activity,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30'
    },
    {
      title: t('metrics.successful'),
      value: metrics.successful.toLocaleString('tr-TR'),
      subtitle: `${metrics.conversionRate.toFixed(1)}% ${t('metrics.conversionText')}`,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30'
    },
    {
      title: t('metrics.failed'),  
      value: metrics.failed.toLocaleString('tr-TR'),
      subtitle: `${((metrics.failed / metrics.total) * 100).toFixed(1)}% ${t('metrics.rejectionsText')}`,
      icon: XCircle,
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/30'
    },
    {
      title: t('metrics.pending'),
      value: (metrics.pending || 0).toLocaleString('tr-TR'),
      subtitle: `${(((metrics.pending || 0) / metrics.total) * 100).toFixed(1)}% ${t('metrics.inProcessing')}`,
      icon: Clock,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/30'
    },
    {
      title: isMultiCurrency ? t('metrics.totalRevenueAllCurrencies') : t('metrics.totalRevenue'),
      value: isMultiCurrency ? 
        `${metrics.currencyBreakdown.length} ${t('metrics.multiCurrency')}` : 
        formatCurrency(metrics.successfulRevenue),
      subtitle: isMultiCurrency ? 
        t('metrics.seeBelowDetails') : 
        t('metrics.successfulOnly'),
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-500/20',
      borderColor: 'border-emerald-500/30'
    },
    {
      title: t('metrics.lostRevenue'),
      value: isMultiCurrency ?
        `${metrics.currencyBreakdown.reduce((total, curr) => total + (curr.lostRevenue || 0), 0).toLocaleString()} ${t('metrics.total')}` :
        formatCurrency(metrics.lostRevenue || 0),
      subtitle: t('metrics.failedAndCanceled'),
      icon: TrendingDown,
      color: 'from-red-500 to-rose-500',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/30'
    },
    {
      title: isMultiCurrency ? t('metrics.totalAmountAllCurrencies') : t('metrics.totalAmount'),
      value: isMultiCurrency ?
        `${metrics.currencyBreakdown.length} ${t('metrics.multiCurrency')}` :
        formatCurrency(metrics.totalAmount || metrics.totalRevenue || 0),
      subtitle: isMultiCurrency ? 
        t('metrics.seeBelowDetails') :
        t('metrics.allOperationsText'),
      icon: DollarSign,
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/30'
    },
    {
      title: t('metrics.commissions'),
      value: formatCurrency(metrics.totalFees || 0),
      subtitle: t('metrics.totalCommissions'),
      icon: DollarSign,
      color: 'from-indigo-500 to-blue-500',
      bgColor: 'bg-indigo-500/20',
      borderColor: 'border-indigo-500/30',
      hidden: true // Скрываем комиссии по запросу пользователя
    },
    {
      title: t('metrics.canceled'),
      value: (metrics.canceled || 0).toLocaleString('tr-TR'),
      subtitle: `${(((metrics.canceled || 0) / metrics.total) * 100).toFixed(1)}% ${t('metrics.canceledText')}`,
      icon: XCircle,
      color: 'from-gray-500 to-slate-500',
      bgColor: 'bg-gray-500/20',
      borderColor: 'border-gray-500/30'
    },
    {
      title: 'Средняя сумма',
      value: isMultiCurrency ? 
        'По валютам' :
        formatCurrency(metrics.averageAmount),
      subtitle: isMultiCurrency ?
        'Смотрите детальную разбивку ниже' :
        'Среднее по всем операциям',
      icon: TrendingUp,
      color: 'from-cyan-500 to-blue-500',
      bgColor: 'bg-cyan-500/20',
      borderColor: 'border-cyan-500/30'
    },
  ]

  // Фильтруем метрики в зависимости от типа данных
  // Скрываем плитки согласно требованиям пользователя
  const filteredMetrics = metricsData.filter((metric, index) => {
    // Скрываем плитки по индексам: 4 (Общая выручка), 5 (Потерянная выручка), 6 (Общая сумма), 9 (Средняя сумма)
    const hiddenIndices = [4, 5, 6, 9]
    return !metric.hidden && !hiddenIndices.includes(index)
  })

  return (
    <div className="space-y-6">
      {/* Заголовок секции */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{t('metrics.keyMetrics')}</h2>
          <p className="text-gray-300">
            {t('metrics.mainIndicators')} {sourceName} • 
            {isMultiCurrency ? 
              ` ${metrics.currencyBreakdown.length} ${t('metrics.multiCurrency')}` : 
              ` ${t('common.currency')}: ${currency}`
            }
            {hasMerchantBreakdown && ` • ${metrics.merchantBreakdown.length} ${t('common.merchants').toLowerCase()}`}
          </p>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-full">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-sm text-white">{t('metrics.actualData')}</span>
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
              <div className="text-2xl font-bold text-white tracking-tight">{metric.value}</div>
              <div className="text-lg font-semibold text-gray-300 leading-tight">{metric.title}</div>
            </div>

            {/* Подзаголовок */}
            {metric.subtitle && (
              <div className="text-sm text-gray-400 leading-relaxed">{metric.subtitle}</div>
            )}
          </div>
        ))}
      </div>

      {/* Детальная разбивка по валютам */}
      {hasCurrencyBreakdown && (
        <div className="mt-8">
          <div className="flex items-center space-x-3 mb-6">
            <Globe className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-bold text-white">{t('breakdowns.currencyBreakdown')}</h3>
            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full">
              {metrics.currencyBreakdown.length} {t('metrics.multiCurrency')}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.currencyBreakdown.map((currencyData, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-white">{currencyData.currency}</span>
                  <span className="text-sm text-gray-400">{currencyData.conversionRate}</span>
                </div>
                
                <div className="space-y-3 text-sm">
                  {/* Основная статистика */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-blue-300 uppercase tracking-wide border-b border-blue-500/20 pb-1">
                      {t('breakdowns.mainStats')}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">{t('breakdowns.operations')}:</span>
                      <span className="text-white font-medium">{currencyData.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">{t('breakdowns.successful')}:</span>
                      <span className="text-green-400 font-medium">{currencyData.successful.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {/* Финансовые показатели */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-green-300 uppercase tracking-wide border-b border-green-500/20 pb-1">
                      {t('breakdowns.financialMetrics')}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">{t('breakdowns.totalAmount')}:</span>
                      <span className="text-white font-medium">
                        {formatCurrency(currencyData.totalAmount, currencyData.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">{t('breakdowns.revenue')}:</span>
                      <span className="text-green-400 font-medium">
                        {formatCurrency(currencyData.successfulRevenue, currencyData.currency)}
                      </span>
                    </div>
                    {currencyData.successfulUSDFormatted && (
                      <div className="flex justify-between">
                        <span className="text-yellow-300">{t('breakdowns.revenue')} (USD):</span>
                        <span className="text-yellow-400 font-bold">{currencyData.successfulUSDFormatted}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Разбивка операций */}
                  {(currencyData.deposits > 0 || currencyData.withdraws > 0) && (
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-purple-300 uppercase tracking-wide border-b border-purple-500/20 pb-1">
                        {t('breakdowns.operationsBreakdown')}
                      </div>
                      {currencyData.deposits > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-green-300">{t('operations.deposits')}:</span>
                            <span className="text-green-300">{currencyData.deposits} {t('breakdowns.pieces')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-300">{t('breakdowns.successful')}:</span>
                            <span className="text-green-300">{currencyData.depositsSuccessful} {t('breakdowns.pieces')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-300">{t('breakdowns.amount')}:</span>
                            <span className="text-green-300">
                              {formatCurrency(currencyData.depositsAmount, currencyData.currency)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-300">{t('breakdowns.revenue')}:</span>
                            <span className="text-green-300">
                              {formatCurrency(currencyData.depositsRevenue, currencyData.currency)}
                            </span>
                          </div>
                          {currencyData.depositsRevenueUSDFormatted && (
                            <div className="flex justify-between">
                              <span className="text-green-300">USD:</span>
                              <span className="text-green-300">{currencyData.depositsRevenueUSDFormatted}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {currencyData.withdraws > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-red-300">{t('operations.withdraws')}:</span>
                            <span className="text-red-300">{currencyData.withdraws} {t('breakdowns.pieces')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-red-300">{t('breakdowns.successful')}:</span>
                            <span className="text-red-300">{currencyData.withdrawsSuccessful} {t('breakdowns.pieces')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-red-300">{t('breakdowns.amount')}:</span>
                            <span className="text-red-300">
                              {formatCurrency(currencyData.withdrawsAmount, currencyData.currency)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-red-300">{t('breakdowns.revenue')}:</span>
                            <span className="text-red-300">
                              {formatCurrency(currencyData.withdrawsRevenue, currencyData.currency)}
                            </span>
                          </div>
                          {currencyData.withdrawsRevenueUSDFormatted && (
                            <div className="flex justify-between">
                              <span className="text-red-300">USD:</span>
                              <span className="text-red-300">{currencyData.withdrawsRevenueUSDFormatted}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Информация про мерчантов */}
                  {currencyData.merchants && currencyData.merchants.length > 0 && (
                    <div className="flex justify-between border-t border-gray-600 pt-2">
                      <span className="text-gray-300">{t('common.merchants')}:</span>
                      <span className="text-blue-400 font-medium">{currencyData.merchants.length}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Детальная разбивка по мерчантам */}
      {hasMerchantBreakdown && (
        <div className="mt-8">
          <div className="flex items-center space-x-3 mb-6">
            <Building className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-bold text-white">{t('breakdowns.merchantBreakdown')}</h3>
            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full">
              {metrics.merchantBreakdown.length} {t('common.merchants').toLowerCase()}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.merchantBreakdown.map((merchantData, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-white capitalize">{merchantData.merchant}</span>
                  <span className="text-sm text-gray-400">{merchantData.conversionRate}</span>
                </div>
                
                <div className="space-y-3 text-sm">
                  {/* Основная статистика */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-blue-300 uppercase tracking-wide border-b border-blue-500/20 pb-1">
                      {t('breakdowns.mainStats')}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">{t('breakdowns.operations')}:</span>
                      <span className="text-white font-medium">{merchantData.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">{t('breakdowns.successful')}:</span>
                      <span className="text-green-400 font-medium">{merchantData.successful.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {/* Финансовые показатели */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-green-300 uppercase tracking-wide border-b border-green-500/20 pb-1">
                      {t('breakdowns.financialMetrics')}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">{t('breakdowns.totalAmount')}:</span>
                      <span className="text-white font-medium">
                        {merchantData.currencies.length > 1 ? 
                          `${merchantData.currencies.length} ${t('metrics.multiCurrency')}` :
                          formatCurrency(merchantData.totalAmount, merchantData.currencies[0])
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">{t('breakdowns.revenue')}:</span>
                      <span className="text-green-400 font-medium">
                        {merchantData.currencies.length > 1 ? 
                          `${merchantData.currencies.length} ${t('metrics.multiCurrency')}` :
                          formatCurrency(merchantData.successfulRevenue, merchantData.currencies[0])
                        }
                      </span>
                    </div>
                    {merchantData.successfulUSDFormatted && (
                      <div className="flex justify-between">
                        <span className="text-yellow-300">{t('breakdowns.revenue')} (USD):</span>
                        <span className="text-yellow-400 font-bold">{merchantData.successfulUSDFormatted}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Разбивка операций */}
                  {(merchantData.deposits > 0 || merchantData.withdraws > 0) && (
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-purple-300 uppercase tracking-wide border-b border-purple-500/20 pb-1">
                        {t('breakdowns.operationsBreakdown')}
                      </div>
                      {merchantData.deposits > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-green-300">{t('operations.deposits')}:</span>
                            <span className="text-green-300">{merchantData.deposits} {t('breakdowns.pieces')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-300">{t('breakdowns.successful')}:</span>
                            <span className="text-green-300">{merchantData.depositsSuccessful} {t('breakdowns.pieces')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-300">{t('breakdowns.amount')}:</span>
                            <span className="text-green-300">
                              {merchantData.currencies.length > 1 ? 
                                merchantData.depositsUSDFormatted :
                                formatCurrency(merchantData.depositsAmount, merchantData.currencies[0])
                              }
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-300">{t('breakdowns.revenue')}:</span>
                            <span className="text-green-300">
                              {merchantData.currencies.length > 1 ? 
                                merchantData.depositsRevenueUSDFormatted :
                                formatCurrency(merchantData.depositsRevenue, merchantData.currencies[0])
                              }
                            </span>
                          </div>
                          {merchantData.depositsRevenueUSDFormatted && (
                            <div className="flex justify-between">
                              <span className="text-green-300">USD:</span>
                              <span className="text-green-300">{merchantData.depositsRevenueUSDFormatted}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {merchantData.withdraws > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-red-300">{t('operations.withdraws')}:</span>
                            <span className="text-red-300">{merchantData.withdraws} {t('breakdowns.pieces')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-red-300">{t('breakdowns.successful')}:</span>
                            <span className="text-red-300">{merchantData.withdrawsSuccessful} {t('breakdowns.pieces')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-red-300">{t('breakdowns.amount')}:</span>
                            <span className="text-red-300">
                              {merchantData.currencies.length > 1 ? 
                                merchantData.withdrawsUSDFormatted :
                                formatCurrency(merchantData.withdrawsAmount, merchantData.currencies[0])
                              }
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-red-300">{t('breakdowns.revenue')}:</span>
                            <span className="text-red-300">
                              {merchantData.currencies.length > 1 ? 
                                merchantData.withdrawsRevenueUSDFormatted :
                                formatCurrency(merchantData.withdrawsRevenue, merchantData.currencies[0])
                              }
                            </span>
                          </div>
                          {merchantData.withdrawsRevenueUSDFormatted && (
                            <div className="flex justify-between">
                              <span className="text-red-300">USD:</span>
                              <span className="text-red-300">{merchantData.withdrawsRevenueUSDFormatted}</span>
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  )}
                  {merchantData.currencies && merchantData.currencies.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">{t('breakdowns.currencies')}:</span>
                      <span className="text-blue-400 font-medium">
                        {merchantData.currencies.length > 2 ? 
                          `${merchantData.currencies.slice(0, 2).join(', ')}...` :
                          merchantData.currencies.join(', ')
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Разбивка по типам операций (Депозиты/Выплаты) */}
      {false && metrics.operationTypeBreakdown && metrics.hasMultipleOperationTypes && (
        <div className="mt-8">
          <div className="flex items-center space-x-3 mb-6">
            <ArrowUpCircle className="w-6 h-6 text-green-400" />
            <h3 className="text-xl font-bold text-white">{t('breakdowns.operationTypes')}</h3>
            <span className="px-2 py-1 bg-green-500/20 text-green-300 text-sm rounded-full">
              {t('breakdowns.depositsAndWithdraws')}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.operationTypeBreakdown.filter(typeData => typeData.total > 0).map((typeData, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {typeData.type === 'deposit' ? 
                      <ArrowUpCircle className="w-5 h-5 text-green-400" /> :
                      typeData.type === 'withdraw' ?
                      <ArrowDownCircle className="w-5 h-5 text-red-400" /> :
                      <Clock className="w-5 h-5 text-gray-400" />
                    }
                    <span className="text-lg font-bold text-white">{typeData.label}</span>
                  </div>
                  <span className="text-sm text-gray-400">{typeData.conversionRate}</span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">{t('breakdowns.operations')}:</span>
                    <span className="text-white font-medium">{typeData.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">{t('breakdowns.successful')}:</span>
                    <span className="text-green-400 font-medium">{typeData.successful.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">{t('breakdowns.amount')} (USD):</span>
                    <span className="text-white font-medium">{typeData.totalUSDFormatted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">{t('breakdowns.revenue')} (USD):</span>
                    <span className="text-green-400 font-medium">{typeData.successfulUSDFormatted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">{t('breakdowns.share')}:</span>
                    <span className="text-blue-400 font-medium">{typeData.percentage}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Сводка в USD */}
      {false && metrics.totalUSD && metrics.totalUSD > 0 && (
        <div className="mt-8">
          <div className="flex items-center space-x-3 mb-6">
            <Coins className="w-6 h-6 text-yellow-400" />
            <h3 className="text-xl font-bold text-white">{t('breakdowns.usdSummary')}</h3>
            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-sm rounded-full">
              {t('breakdowns.unifiedCurrency')}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-gray-300">{t('breakdowns.totalAmount')}</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(metrics.totalUSD)}
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm text-gray-300">{t('breakdowns.successfulRevenue')}</span>
              </div>
              <div className="text-2xl font-bold text-green-400">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(metrics.successfulUSD)}
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                <span className="text-sm text-gray-300">{t('breakdowns.averageAmount')}</span>
              </div>
              <div className="text-2xl font-bold text-cyan-400">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(metrics.averageUSD)}
              </div>
            </div>
            
            {metrics.depositsUSD > 0 && metrics.withdrawsUSD > 0 && (
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
                <div className="flex items-center space-x-2 mb-3">
                  <Activity className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-gray-300">{t('breakdowns.depositsVsWithdraws')}</span>
                </div>
                <div className="text-sm text-white space-y-2">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-green-300">{t('operations.deposits')}:</span>
                      <span className="text-green-300">{metrics.totalDeposits} {t('breakdowns.pieces')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-300">{t('breakdowns.amount')}:</span>
                      <span className="text-green-300">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(metrics.depositsUSD)}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-red-300">{t('operations.withdraws')}:</span>
                      <span className="text-red-300">{metrics.totalWithdraws} {t('breakdowns.pieces')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-300">{t('breakdowns.amount')}:</span>
                      <span className="text-red-300">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(metrics.withdrawsUSD)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Дополнительная информация */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Статистика по компаниям (только для провайдера) */}
        {dataType === 'merchant' && metrics.companyStats && Object.keys(metrics.companyStats).length > 0 && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-400" />
              {t('breakdowns.topCompanies')}
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
              {t('breakdowns.paymentMethods')}
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