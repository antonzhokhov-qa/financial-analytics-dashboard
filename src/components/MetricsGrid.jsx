import { BarChart3, TrendingUp, DollarSign, AlertTriangle, CheckCircle, XCircle, Clock, Building, CreditCard } from 'lucide-react'

function MetricsGrid({ metrics }) {
  const metricCards = [
    {
      title: 'Всего операций',
      value: metrics.total.toLocaleString(),
      icon: BarChart3,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      glowColor: 'shadow-blue-500/25'
    },
    {
      title: 'Конверсия',
      value: `${metrics.conversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: metrics.conversionRate > 70 ? 'text-green-400' : metrics.conversionRate > 50 ? 'text-yellow-400' : 'text-red-400',
      bgColor: metrics.conversionRate > 70 ? 'bg-green-500/20' : metrics.conversionRate > 50 ? 'bg-yellow-500/20' : 'bg-red-500/20',
      glowColor: metrics.conversionRate > 70 ? 'shadow-green-500/25' : metrics.conversionRate > 50 ? 'shadow-yellow-500/25' : 'shadow-red-500/25'
    },
    {
      title: 'Общий оборот',
      value: `${metrics.successfulRevenue.toLocaleString('ru-RU', {maximumFractionDigits: 0})} ₽`,
      icon: DollarSign,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      glowColor: 'shadow-green-500/25'
    },
    {
      title: 'Средний чек',
      value: `${metrics.averageAmount.toLocaleString('ru-RU', {maximumFractionDigits: 0})} ₽`,
      icon: TrendingUp,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      glowColor: 'shadow-purple-500/25'
    },
    {
      title: 'Успешные операции',
      value: metrics.successful.toLocaleString(),
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      glowColor: 'shadow-green-500/25'
    },
    {
      title: 'Отмененные операции',
      value: metrics.canceled.toLocaleString(),
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      glowColor: 'shadow-yellow-500/25'
    },
    {
      title: 'Неудачные операции',
      value: metrics.failed.toLocaleString(),
      icon: XCircle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      glowColor: 'shadow-red-500/25'
    },
    {
      title: 'Общие комиссии',
      value: `${metrics.totalFees.toLocaleString('ru-RU', {maximumFractionDigits: 0})} ₽`,
      icon: DollarSign,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      glowColor: 'shadow-orange-500/25'
    },
    {
      title: 'Максимальная сумма',
      value: `${metrics.maxAmount.toLocaleString('ru-RU', {maximumFractionDigits: 0})} ₽`,
      icon: TrendingUp,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/20',
      glowColor: 'shadow-indigo-500/25'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metricCards.map((metric, index) => (
        <div 
          key={index} 
          className={`bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:scale-105 ${metric.glowColor} animate-slide-up`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${metric.bgColor} ${metric.glowColor}`}>
              <metric.icon className={`w-6 h-6 ${metric.color}`} />
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${metric.color} text-glow`}>
                {metric.value}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-white font-semibold text-lg">{metric.title}</h3>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className={`h-2 rounded-full bg-gradient-to-r ${
                  metric.color.includes('blue') ? 'from-blue-500 to-blue-600' :
                  metric.color.includes('green') ? 'from-green-500 to-green-600' :
                  metric.color.includes('purple') ? 'from-purple-500 to-purple-600' :
                  metric.color.includes('red') ? 'from-red-500 to-red-600' :
                  metric.color.includes('yellow') ? 'from-yellow-500 to-yellow-600' :
                  metric.color.includes('orange') ? 'from-orange-500 to-orange-600' :
                  'from-indigo-500 to-indigo-600'
                }`}
                style={{ 
                  width: metric.title === 'Конверсия' ? `${Math.min(metrics.conversionRate, 100)}%` : 
                         metric.title === 'Всего операций' ? '100%' :
                         metric.title === 'Успешные операции' ? `${(metrics.successful / metrics.total) * 100}%` :
                         metric.title === 'Отмененные операции' ? `${(metrics.canceled / metrics.total) * 100}%` :
                         metric.title === 'Неудачные операции' ? `${(metrics.failed / metrics.total) * 100}%` :
                         '75%'
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default MetricsGrid 