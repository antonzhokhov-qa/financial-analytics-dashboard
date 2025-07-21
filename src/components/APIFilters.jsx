import { useState, useEffect } from 'react'
import { collectorAPI } from '../utils/apiService'
import { Globe, Calendar, Database, Users, Download, RefreshCw } from 'lucide-react'

const APIFilters = ({ onDataLoad, loading, setLoading, onBack = null }) => {
  const [filters, setFilters] = useState({
    project: '', // По умолчанию все проекты
    status: 'success',
    dateMode: 'latest', // latest, single, range
    date: '',
    from: '',
    to: '',
    count: 100,
    descending: true
  })

  const [error, setError] = useState(null)

  const projects = collectorAPI.getAvailableProjects()
  const statuses = collectorAPI.getAvailableStatuses()

  const dateModes = [
    { value: 'latest', label: 'Последние операции' },
    { value: 'single', label: 'Конкретная дата' },
    { value: 'range', label: 'Диапазон дат' }
  ]

  // Загрузка данных
  const handleLoadData = async () => {
    setLoading(true)
    setError(null)

    try {
      let apiFilters = {
        status: filters.status,
        descending: filters.descending
      }

      // Добавляем проект только если он выбран
      if (filters.project) {
        apiFilters.project = filters.project
      }

      // Настройка фильтров в зависимости от режима дат
      switch (filters.dateMode) {
        case 'latest':
          apiFilters.count = filters.count
          break
        
        case 'single':
          if (!filters.date) {
            setError('Выберите дату')
            setLoading(false)
            return
          }
          apiFilters.date = filters.date
          break
        
        case 'range':
          if (!filters.from || !filters.to) {
            setError('Выберите диапазон дат')
            setLoading(false)
            return
          }
          apiFilters.from = filters.from
          apiFilters.to = filters.to
          break
      }

      console.log('Loading data with filters:', apiFilters)
      
      const data = await collectorAPI.getOperations(apiFilters)
      onDataLoad(data, 'api')
      
    } catch (err) {
      console.error('Failed to load API data:', err)
      setError(`Ошибка загрузки данных: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Быстрые предустановки
  const quickPresets = [
    {
      name: 'Все проекты (100 последних)',
      action: () => {
        setFilters({
          ...filters,
          project: '',
          status: 'success',
          dateMode: 'latest',
          count: 100,
          descending: true
        })
      }
    },
    {
      name: 'Все статусы (50 последних)',
      action: () => {
        setFilters({
          ...filters,
          project: '',
          status: '', // Все статусы
          dateMode: 'latest',
          count: 50,
          descending: true
        })
      }
    },
    {
      name: 'Последние 50 Monetix',
      action: () => {
        setFilters({
          ...filters,
          project: 'monetix',
          status: 'success',
          dateMode: 'latest',
          count: 50,
          descending: true
        })
      }
    },
    {
      name: 'Сегодня все проекты',
      action: () => {
        const today = new Date().toISOString().split('T')[0]
        setFilters({
          ...filters,
          project: '',
          status: 'success',
          dateMode: 'single',
          date: today
        })
      }
    },
    {
      name: 'Последняя неделя все проекты',
      action: () => {
        const today = new Date()
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        setFilters({
          ...filters,
          project: '',
          dateMode: 'range',
          from: weekAgo.toISOString().split('T')[0],
          to: today.toISOString().split('T')[0]
        })
      }
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Заголовок */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <Globe className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white">API Коллектора</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Настройте фильтры для получения актуальных данных с платформы
          </p>
          {onBack && (
            <button
              onClick={onBack}
              className="mt-4 px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors duration-200"
            >
              ← Назад к выбору источника
            </button>
          )}
        </div>

        {/* Основная панель фильтров */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Проект */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white flex items-center">
                <Database className="w-4 h-4 text-green-400 mr-2" />
                Проект
              </label>
              <select
                value={filters.project}
                onChange={(e) => setFilters({...filters, project: e.target.value})}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {projects.map(project => (
                  <option key={project.value} value={project.value}>
                    {project.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Статус */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white flex items-center">
                <div className="w-4 h-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mr-2"></div>
                Статус
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Все статусы</option>
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Режим дат */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white flex items-center">
                <Calendar className="w-4 h-4 text-purple-400 mr-2" />
                Режим выборки
              </label>
              <select
                value={filters.dateMode}
                onChange={(e) => setFilters({...filters, dateMode: e.target.value})}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {dateModes.map(mode => (
                  <option key={mode.value} value={mode.value}>
                    {mode.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Дополнительные поля в зависимости от режима */}
            {filters.dateMode === 'latest' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center">
                  <Users className="w-4 h-4 text-blue-400 mr-2" />
                  Количество записей
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={filters.count}
                  onChange={(e) => setFilters({...filters, count: parseInt(e.target.value) || 100})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            )}

            {filters.dateMode === 'single' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center">
                  <Calendar className="w-4 h-4 text-purple-400 mr-2" />
                  Дата
                </label>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => setFilters({...filters, date: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            )}

            {filters.dateMode === 'range' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white flex items-center">
                    <Calendar className="w-4 h-4 text-purple-400 mr-2" />
                    От
                  </label>
                  <input
                    type="date"
                    value={filters.from}
                    onChange={(e) => setFilters({...filters, from: e.target.value})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white flex items-center">
                    <Calendar className="w-4 h-4 text-purple-400 mr-2" />
                    До
                  </label>
                  <input
                    type="date"
                    value={filters.to}
                    onChange={(e) => setFilters({...filters, to: e.target.value})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </>
            )}
          </div>

          {/* Сортировка */}
          <div className="mt-6">
            <label className="flex items-center space-x-2 text-white">
              <input
                type="checkbox"
                checked={filters.descending}
                onChange={(e) => setFilters({...filters, descending: e.target.checked})}
                className="w-4 h-4 text-green-600 bg-white/10 border-white/20 rounded focus:ring-green-500"
              />
              <span>Новые записи сверху</span>
            </label>
          </div>

          {/* Кнопка загрузки */}
          <div className="mt-8">
            <button
              onClick={handleLoadData}
              disabled={loading}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                loading
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
              } text-white`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Загрузка...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Загрузить данные</span>
                </>
              )}
            </button>
          </div>

          {/* Ошибка */}
          {error && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300">
              {error}
            </div>
          )}
        </div>

        {/* Быстрые предустановки */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Быстрые настройки</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickPresets.map((preset, index) => (
              <button
                key={index}
                onClick={preset.action}
                className="p-4 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors duration-200 text-left"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Информация об API */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Информация об API</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
            <div>
              <h4 className="font-semibold text-white mb-2">Доступные проекты:</h4>
              <ul className="space-y-1">
                <li>• <span className="text-green-400">Monetix</span> - основной проект</li>
                <li>• <span className="text-blue-400">Caroussel</span> - дополнительный проект</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Статусы операций:</h4>
              <ul className="space-y-1">
                <li>• <span className="text-green-400">Success</span> - успешные операции</li>
                <li>• <span className="text-red-400">Fail</span> - неудачные операции</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default APIFilters 