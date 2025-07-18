import { Lightbulb } from 'lucide-react'

function InsightsSection({ insights }) {
  const getInsightColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-green-500/30 bg-green-500/10 text-green-300'
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300'
      case 'danger':
        return 'border-red-500/30 bg-red-500/10 text-red-300'
      case 'info':
      default:
        return 'border-blue-500/30 bg-blue-500/10 text-blue-300'
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Lightbulb className="w-6 h-6 text-yellow-400" />
        <h2 className="text-xl font-semibold text-white">Ключевые инсайты</h2>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 p-4 rounded-lg border ${getInsightColor(insight.type)} animate-slide-up`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <span className="text-2xl flex-shrink-0">{insight.icon}</span>
            <p className="text-sm font-medium leading-relaxed">{insight.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default InsightsSection 