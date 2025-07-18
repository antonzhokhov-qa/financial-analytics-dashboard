import { TrendingUp, Target, AlertCircle, Brain } from 'lucide-react'

function PredictiveAnalytics({ data, metrics }) {
  // Простые прогнозы на основе текущих данных
  const predictions = {
    nextWeekConversion: Math.min(100, metrics.conversionRate + (Math.random() - 0.5) * 10),
    expectedRevenue: metrics.successfulRevenue * 1.1,
    riskFactors: [
      { factor: 'Сезонность', impact: 'Средний', probability: 65 },
      { factor: 'Конкуренция', impact: 'Высокий', probability: 45 },
      { factor: 'Технические сбои', impact: 'Низкий', probability: 15 }
    ]
  }

  const recommendations = [
    {
      title: 'Оптимизация конверсии',
      description: 'Улучшить процесс завершения операций',
      impact: 'Высокий',
      effort: 'Средний'
    },
    {
      title: 'Анализ неудачных операций',
      description: 'Выявить причины отказов и устранить их',
      impact: 'Высокий',
      effort: 'Высокий'
    },
    {
      title: 'Мониторинг аномалий',
      description: 'Настроить систему раннего предупреждения',
      impact: 'Средний',
      effort: 'Низкий'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-6 h-6 text-purple-400" />
        <h3 className="text-xl font-semibold text-white">Прогнозная аналитика</h3>
      </div>

      {/* Прогнозы */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-6 border border-blue-500/30">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <h4 className="text-lg font-medium text-white">Прогноз конверсии</h4>
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {predictions.nextWeekConversion.toFixed(1)}%
          </div>
          <div className="text-blue-300 text-sm">
            Ожидаемая конверсия на следующей неделе
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 bg-blue-900/30 rounded-full h-2">
              <div 
                className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${predictions.nextWeekConversion}%` }}
              />
            </div>
            <span className="text-blue-300 text-sm">
              {predictions.nextWeekConversion > metrics.conversionRate ? '+' : ''}
              {(predictions.nextWeekConversion - metrics.conversionRate).toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-6 border border-green-500/30">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-5 h-5 text-green-400" />
            <h4 className="text-lg font-medium text-white">Прогноз дохода</h4>
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {(predictions.expectedRevenue / 1000).toFixed(0)}K
          </div>
          <div className="text-green-300 text-sm">
            Ожидаемый доход (TRY)
          </div>
          <div className="mt-4 text-green-300 text-sm">
            +{((predictions.expectedRevenue / metrics.successfulRevenue - 1) * 100).toFixed(1)}% 
            от текущего уровня
          </div>
        </div>
      </div>

      {/* Факторы риска */}
      <div className="bg-white/5 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-5 h-5 text-orange-400" />
          <h4 className="text-lg font-medium text-white">Факторы риска</h4>
        </div>
        
        <div className="space-y-3">
          {predictions.riskFactors.map((risk, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  risk.impact === 'Высокий' ? 'bg-red-400' :
                  risk.impact === 'Средний' ? 'bg-yellow-400' : 'bg-green-400'
                }`} />
                <span className="text-white font-medium">{risk.factor}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-white/70 text-sm">{risk.impact} риск</span>
                <span className="text-white/70 text-sm">{risk.probability}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Рекомендации */}
      <div className="bg-white/5 rounded-xl p-6">
        <h4 className="text-lg font-medium text-white mb-4">Рекомендации</h4>
        
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div key={index} className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h5 className="text-white font-medium">{rec.title}</h5>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    rec.impact === 'Высокий' ? 'bg-green-500/20 text-green-300' :
                    rec.impact === 'Средний' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-blue-500/20 text-blue-300'
                  }`}>
                    {rec.impact} эффект
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    rec.effort === 'Высокий' ? 'bg-red-500/20 text-red-300' :
                    rec.effort === 'Средний' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-green-500/20 text-green-300'
                  }`}>
                    {rec.effort} усилия
                  </span>
                </div>
              </div>
              <p className="text-white/70 text-sm">{rec.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PredictiveAnalytics 