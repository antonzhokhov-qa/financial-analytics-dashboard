import { useState } from 'react'
import { Clock, Globe, MapPin } from 'lucide-react'

const TimezoneSelector = ({ onTimezoneSelect, selectedTimezone = 'UTC' }) => {
  const [isOpen, setIsOpen] = useState(false)

  const timezones = [
    { id: 'UTC', name: 'UTC (Всемирное время)', offset: '+00:00' },
    { id: 'Europe/Moscow', name: 'Москва (MSK)', offset: '+03:00' },
    { id: 'Europe/Istanbul', name: 'Стамбул (TRT)', offset: '+03:00' },
    { id: 'Europe/London', name: 'Лондон (GMT)', offset: '+00:00' },
    { id: 'Europe/Berlin', name: 'Берлин (CET)', offset: '+01:00' },
    { id: 'Asia/Dubai', name: 'Дубай (GST)', offset: '+04:00' },
    { id: 'Asia/Tokyo', name: 'Токио (JST)', offset: '+09:00' },
    { id: 'America/New_York', name: 'Нью-Йорк (EST)', offset: '-05:00' },
    { id: 'America/Los_Angeles', name: 'Лос-Анджелес (PST)', offset: '-08:00' }
  ]

  const currentTimezone = timezones.find(tz => tz.id === selectedTimezone) || timezones[0]

  const handleSelect = (timezone) => {
    onTimezoneSelect(timezone.id)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors duration-200 flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <Globe className="w-5 h-5 text-blue-400" />
          <div className="text-left">
            <div className="font-medium">{currentTimezone.name}</div>
            <div className="text-sm text-gray-300">{currentTimezone.offset}</div>
          </div>
        </div>
        <div className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
          {timezones.map((timezone) => (
            <button
              key={timezone.id}
              onClick={() => handleSelect(timezone)}
              className={`w-full px-4 py-3 text-left hover:bg-white/20 transition-colors duration-200 flex items-center justify-between ${
                selectedTimezone === timezone.id ? 'bg-blue-500/20 text-blue-300' : 'text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4" />
                <div>
                  <div className="font-medium">{timezone.name}</div>
                  <div className="text-sm text-gray-300">{timezone.offset}</div>
                </div>
              </div>
              {selectedTimezone === timezone.id && (
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default TimezoneSelector 