import { useState, useEffect } from 'react'
import { Clock, Globe, Info, AlertTriangle } from 'lucide-react'
import { getTimezoneInfo, getPopularTimezones, shouldShowTimezoneWarning } from '../utils/timezoneUtils'
import { useTranslation } from '../contexts/LanguageContext'

const TimezoneInfo = ({ data = [], showSelector = false, onTimezoneChange }) => {
  const { t } = useTranslation()
  const [timezoneInfo, setTimezoneInfo] = useState(null)
  const [selectedTimezone, setSelectedTimezone] = useState('')
  const [showWarning, setShowWarning] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const info = getTimezoneInfo()
    setTimezoneInfo(info)
    setSelectedTimezone(info.timezone)
    setShowWarning(shouldShowTimezoneWarning(data))
  }, [data])

  const popularTimezones = getPopularTimezones()

  const handleTimezoneChange = (newTimezone) => {
    setSelectedTimezone(newTimezone)
    if (onTimezoneChange) {
      onTimezoneChange(newTimezone)
    }
  }

  if (!timezoneInfo) return null

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
      {/* Заголовок с иконкой */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">
            Часовой пояс
          </h3>
          {showWarning && (
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Основная информация */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Текущий пояс:</span>
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-green-400" />
            <span className="text-white font-medium">
              {timezoneInfo.name}
            </span>
            <span className="text-gray-400 text-sm">
              {timezoneInfo.offsetFormatted}
            </span>
          </div>
        </div>

        {/* Предупреждение о времени */}
        {showWarning && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mt-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-yellow-200 text-sm font-medium">
                  Важно: Время транзакций
                </p>
                <p className="text-yellow-200/80 text-sm mt-1">
                  Все времена автоматически конвертированы из UTC в ваш часовой пояс ({timezoneInfo.offsetFormatted}) для корректного отображения и анализа.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Расширенная информация */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Смещение:</span>
                <div className="text-white font-mono">
                  {timezoneInfo.offsetFormatted}
                </div>
              </div>
              <div>
                <span className="text-gray-400">Формат:</span>
                <div className="text-white font-mono">
                  {new Date().toLocaleString('ru-RU', {
                    timeZone: timezoneInfo.timezone,
                    hour12: false
                  })}
                </div>
              </div>
            </div>

            {/* Селектор часового пояса */}
            {showSelector && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Изменить часовой пояс:
                </label>
                <select
                  value={selectedTimezone}
                  onChange={(e) => handleTimezoneChange(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {popularTimezones.map((tz) => (
                    <option key={tz.value} value={tz.value} className="bg-gray-800">
                      {tz.label} ({tz.offset})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  Изменение часового пояса обновит отображение всех временных данных
                </p>
              </div>
            )}

            {/* Информация о конвертации */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                  <p className="text-blue-200 font-medium">
                    Как работает конвертация времени:
                  </p>
                  <ul className="text-blue-200/80 mt-1 space-y-1 list-disc list-inside">
                    <li>API возвращает время в UTC (Greenwich Mean Time)</li>
                    <li>Автоматически конвертируется в ваш локальный часовой пояс</li>
                    <li>Все графики и аналитика учитывают ваше местное время</li>
                    <li>Фильтры по датам работают в вашем часовом поясе</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TimezoneInfo