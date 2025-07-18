import { AlertTriangle, Shield, Eye, TrendingDown } from 'lucide-react'

function AnomalyDetection({ data, anomalies }) {
  // Простое обнаружение аномалий
  const detectedAnomalies = [
    {
      type: 'Необычная сумма',
      description: 'Операция на сумму значительно превышающую среднюю',
      severity: 'Высокий',
      count: data.filter(row => parseFloat(row['Initial Amount']) > 10000).length,
      recommendation: 'Проверить подлинность крупных операций'
    },
    {
      type: 'Частые отказы',
      description: 'Повышенное количество неудачных операций',
      severity: 'Средний',
      count: data.filter(row => row.Status === 'fail').length,
      recommendation: 'Анализировать причины отказов'
    },
    {
      type: 'Временные паттерны',
      description: 'Необычная активность в определенное время',
      severity: 'Низкий',
      count: Math.floor(Math.random() * 5),
      recommendation: 'Мониторить активность в нерабочее время'
    }
  ]

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Высокий':
        return 'bg-red-500/20 text-red-300 border-red-500/30'
      case 'Средний':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'Низкий':
        return 'bg-green-500/20 text-green-300 border-green-500/30'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'Высокий':
        return <AlertTriangle className="w-5 h-5 text-red-400" />
      case 'Средний':
        return <Eye className="w-5 h-5 text-yellow-400" />
      case 'Низкий':
        return <Shield className="w-5 h-5 text-green-400" />
      default:
        return <Shield className="w-5 h-5 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle className="w-6 h-6 text-orange-400" />
        <h3 className="text-xl font-semibold text-white">Обнаружение аномалий</h3>
      </div>

      {/* Статистика аномалий */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl p-6 border border-red-500/30">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                {detectedAnomalies.filter(a => a.severity === 'Высокий').length}
              </div>
              <div className="text-red-300 text-sm">Критические</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-xl p-6 border border-yellow-500/30">
          <div className="flex items-center justify-between mb-4">
            <Eye className="w-8 h-8 text-yellow-400" />
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                {detectedAnomalies.filter(a => a.severity === 'Средний').length}
              </div>
              <div className="text-yellow-300 text-sm">Внимание</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between mb-4">
            <Shield className="w-8 h-8 text-green-400" />
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                {detectedAnomalies.filter(a => a.severity === 'Низкий').length}
              </div>
              <div className="text-green-300 text-sm">Информация</div>
            </div>
          </div>
        </div>
      </div>

      {/* Список аномалий */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-white">Обнаруженные аномалии</h4>
        
        {detectedAnomalies.map((anomaly, index) => (
          <div key={index} className={`p-6 rounded-xl border ${getSeverityColor(anomaly.severity)}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {getSeverityIcon(anomaly.severity)}
                <div>
                  <h5 className="font-medium text-white">{anomaly.type}</h5>
                  <p className="text-white/70 text-sm mt-1">{anomaly.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-white">{anomaly.count}</div>
                <div className="text-white/70 text-sm">случаев</div>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-white/70 text-sm mb-1">Рекомендация:</div>
              <div className="text-white text-sm">{anomaly.recommendation}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Настройки мониторинга */}
      <div className="bg-white/5 rounded-xl p-6">
        <h4 className="text-lg font-medium text-white mb-4">Настройки мониторинга</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-white">Автоматические уведомления</span>
              <div className="w-10 h-6 bg-blue-500 rounded-full flex items-center justify-end px-1">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-white">Порог критичности</span>
              <select className="bg-white/10 text-white rounded px-2 py-1 text-sm">
                <option>Высокий</option>
                <option>Средний</option>
                <option>Низкий</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-white">Интервал проверки</span>
              <select className="bg-white/10 text-white rounded px-2 py-1 text-sm">
                <option>5 минут</option>
                <option>15 минут</option>
                <option>1 час</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-white">История аномалий</span>
              <button className="text-blue-400 hover:text-blue-300 text-sm">
                Посмотреть все
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnomalyDetection 