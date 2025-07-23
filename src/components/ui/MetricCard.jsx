import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent } from './Card'

const MetricCard = ({ 
  title,
  value,
  previousValue,
  icon: Icon,
  iconColor = 'text-blue-400',
  iconBg = 'bg-blue-500/20',
  currency = false,
  percentage = false,
  compact = false,
  trend = true,
  className = ''
}) => {
  // Вычисляем изменение
  const hasChange = previousValue !== undefined && previousValue !== null
  const change = hasChange ? value - previousValue : 0
  const changePercent = hasChange && previousValue !== 0 ? ((change / previousValue) * 100) : 0
  
  const isPositive = change > 0
  const isNegative = change < 0
  const isNeutral = change === 0

  // Форматирование значений
  const formatValue = (val) => {
    if (currency) {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(val)
    }
    
    if (percentage) {
      return `${val.toFixed(1)}%`
    }
    
    return val.toLocaleString('tr-TR')
  }

  const getTrendIcon = () => {
    if (isPositive) return TrendingUp
    if (isNegative) return TrendingDown
    return Minus
  }

  const getTrendColor = () => {
    if (isPositive) return 'text-green-400'
    if (isNegative) return 'text-red-400'
    return 'text-gray-400'
  }

  const TrendIcon = getTrendIcon()

  if (compact) {
    return (
      <Card className={`hover:scale-105 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 truncate">{title}</p>
              <p className="text-xl font-bold text-white">
                {formatValue(value)}
              </p>
            </div>
            
            {Icon && (
              <div className={`p-2 rounded-lg ${iconBg}`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
            )}
          </div>
          
          {trend && hasChange && (
            <div className="flex items-center gap-1 mt-2">
              <TrendIcon className={`w-3 h-3 ${getTrendColor()}`} />
              <span className={`text-xs ${getTrendColor()}`}>
                {Math.abs(changePercent).toFixed(1)}%
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`hover:scale-[1.02] ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {Icon && (
                <div className={`p-2 rounded-xl ${iconBg}`}>
                  <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
              )}
              <h3 className="text-sm font-medium text-gray-400">{title}</h3>
            </div>
            
            <div className="space-y-1">
              <p className="text-3xl font-bold text-white">
                {formatValue(value)}
              </p>
              
              {trend && hasChange && (
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                    isPositive ? 'bg-green-500/20 text-green-400' :
                    isNegative ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    <TrendIcon className="w-3 h-3" />
                    <span>{Math.abs(changePercent).toFixed(1)}%</span>
                  </div>
                  
                  <span className="text-xs text-gray-500">
                    {isPositive ? 'увеличение' : isNegative ? 'уменьшение' : 'без изменений'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { MetricCard } 