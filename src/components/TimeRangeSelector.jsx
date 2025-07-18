import { Calendar, Clock } from 'lucide-react'

function TimeRangeSelector({ selectedRange, onRangeChange }) {
  const ranges = [
    { id: '1d', label: '24 часа', icon: Clock },
    { id: '7d', label: '7 дней', icon: Calendar },
    { id: '30d', label: '30 дней', icon: Calendar },
    { id: '90d', label: '90 дней', icon: Calendar },
    { id: 'all', label: 'Все время', icon: Calendar }
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Временной диапазон</h3>
      
      <div className="flex flex-wrap gap-3">
        {ranges.map(range => (
          <button
            key={range.id}
            onClick={() => onRangeChange(range.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              selectedRange === range.id
                ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
            }`}
          >
            <range.icon className="w-4 h-4" />
            {range.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white/5 rounded-lg p-4">
          <div className="text-white/70 text-sm mb-1">Период анализа</div>
          <div className="text-white font-medium">
            {ranges.find(r => r.id === selectedRange)?.label || 'Все время'}
          </div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-4">
          <div className="text-white/70 text-sm mb-1">Последнее обновление</div>
          <div className="text-white font-medium">
            {new Date().toLocaleString('ru-RU', {
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-4">
          <div className="text-white/70 text-sm mb-1">Статус данных</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-white font-medium">Актуально</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TimeRangeSelector 