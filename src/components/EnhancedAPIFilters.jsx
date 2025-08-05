import { useState, useEffect } from 'react'
import { enhancedAPI, normalizeEnhancedData } from '../utils/enhancedApiService'
import { Search, Calendar, Database, CreditCard, Globe, Coins, Filter, RefreshCw, ChevronDown, Activity } from 'lucide-react'
import { Card, CardContent, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { useTranslation } from '../contexts/LanguageContext'

const EnhancedAPIFilters = ({ onDataLoad, loading, setLoading, onBack = null }) => {
  const { t } = useTranslation()
  const [filters, setFilters] = useState({
    // Базовые фильтры
    project_id: '',
    status: 'success',
    payment_method_type: '', // fiat, crypto или все
    operation_state: '',
    
    // Поиск
    reference_id: '',
    client_operation_id: '',
    
    // Даты
    dateMode: 'latest', // latest, single, range
    date: '',
    from: '',
    to: '',
    
    // Пагинация
    count: 100,
    descending: true,
    from_operation_create_id: '',
    
    // Дополнительно
    credentials_owner: ''
  })

  const [error, setError] = useState(null)
  const [expandedFilters, setExpandedFilters] = useState(false)

  // Доступные опции
  const projects = enhancedAPI.getAvailableProjects()
  const statuses = [
    { value: '', label: 'Все статусы' },
    { value: 'success', label: 'Успешно' },
    { value: 'fail', label: 'Ошибка' },
    { value: 'in_process', label: 'В процессе' }
  ]

  const paymentTypes = [
    { value: '', label: 'Все типы' }
  ]

  const operationStates = [
    { value: '', label: 'Все состояния' }
  ]

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
        payment_method_type: filters.payment_method_type,
        operation_state: filters.operation_state,
        descending: filters.descending
      }

      // Добавляем проект только если выбран
      if (filters.project_id) {
        apiFilters.project_id = filters.project_id
      }

      // Поиск по ID
      if (filters.reference_id) {
        apiFilters.reference_id = filters.reference_id
      }
      if (filters.client_operation_id) {
        apiFilters.client_operation_id = filters.client_operation_id
      }

      // Курсорная пагинация
      if (filters.from_operation_create_id) {
        apiFilters.from_operation_create_id = filters.from_operation_create_id
      }

      // Дополнительные параметры
      if (filters.credentials_owner) {
        apiFilters.credentials_owner = filters.credentials_owner
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

      console.log('🎯 Loading enhanced data with filters:', apiFilters)
      
      const data = await enhancedAPI.getOperationsEnhanced(apiFilters)
      console.log('📦 Raw data received from API:', {
        type: typeof data,
        isArray: Array.isArray(data),
        length: Array.isArray(data) ? data.length : 'not array',
        firstItem: Array.isArray(data) && data.length > 0 ? data[0] : null
      })
      
      const normalizedData = normalizeEnhancedData(data, 'enhanced-operations')
      console.log('🔄 Normalized data ready:', {
        length: normalizedData.length,
        successfulCount: normalizedData.filter(d => d.isCompleted).length,
        sampleItem: normalizedData[0] || null
      })
      
      onDataLoad(normalizedData, 'enhanced-api')
      
    } catch (err) {
      console.error('Failed to load enhanced API data:', err)
      setError(`Ошибка загрузки данных: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Быстрые предустановки
  const quickPresets = [
    {
      name: 'Все успешные (100 последних)',
      description: 'Фиат + Крипто',
      action: () => {
        setFilters({
          ...filters,
          project_id: '',
          status: 'success',
          payment_method_type: '',
          dateMode: 'latest',
          count: 100,
          descending: true
        })
      }
    },
    {
      name: 'Последние 50',
      description: 'Недавние операции',
      action: () => {
        setFilters({
          ...filters,
          project_id: '',
          status: 'success',
          payment_method_type: '',
          dateMode: 'latest',
          count: 50,
          descending: true
        })
      }
    },
    {
      name: 'В процессе обработки',
      description: 'Незавершенные операции',
      action: () => {
        setFilters({
          ...filters,
          project_id: '',
          status: 'in_process',
          payment_method_type: '',
          operation_state: 'in_process',
          dateMode: 'latest',
          count: 50,
          descending: true
        })
      }
    },
    {
      name: 'Сегодня все проекты',
      description: 'Операции за сегодня',
      action: () => {
        const today = new Date().toISOString().split('T')[0]
        setFilters({
          ...filters,
          project_id: '',
          status: '',
          dateMode: 'single',
          date: today
        })
      }
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl space-y-8">


        {/* Заголовок */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto">
            <Globe className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white">{t('api.enhancedAPI')}</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {t('filters.interfaceCapabilities')}
          </p>
          {onBack && (
            <button
              onClick={onBack}
              className="mt-4 px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors duration-200"
            >
              ← {t('filters.backToSource')}
            </button>
          )}
        </div>

        {/* Быстрые предустановки */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickPresets.map((preset, index) => (
            <Card key={index} className="cursor-pointer hover:scale-105 transition-transform" onClick={preset.action}>
              <CardContent className="p-4 text-center">
                <h3 className="font-medium text-white mb-1">{preset.name}</h3>
                <p className="text-xs text-gray-400">{preset.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Основные фильтры */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              
              {/* Проект */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center">
                  <Database className="w-4 h-4 text-green-400 mr-2" />
                  Проект
                </label>
                <select
                  value={filters.project_id}
                  onChange={(e) => setFilters({...filters, project_id: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Тип платежа */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center">
                  <Coins className="w-4 h-4 text-yellow-400 mr-2" />
                  Тип платежа
                </label>
                <select
                  value={filters.payment_method_type}
                  onChange={(e) => setFilters({...filters, payment_method_type: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {paymentTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
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
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {dateModes.map(mode => (
                    <option key={mode.value} value={mode.value}>
                      {mode.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Дополнительные поля в зависимости от режима дат */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {filters.dateMode === 'latest' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Количество записей</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={filters.count}
                    onChange={(e) => setFilters({...filters, count: parseInt(e.target.value) || 100})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              {filters.dateMode === 'single' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Дата</label>
                  <input
                    type="date"
                    value={filters.date}
                    onChange={(e) => setFilters({...filters, date: e.target.value})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              {filters.dateMode === 'range' && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">От</label>
                    <input
                      type="date"
                      value={filters.from}
                      onChange={(e) => setFilters({...filters, from: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">До</label>
                    <input
                      type="date"
                      value={filters.to}
                      onChange={(e) => setFilters({...filters, to: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Расширенные фильтры */}
            <div className="border-t border-white/10 pt-4">
              <button
                onClick={() => setExpandedFilters(!expandedFilters)}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-4"
              >
                <Filter className="w-4 h-4" />
                Расширенные фильтры
                <ChevronDown className={`w-4 h-4 transition-transform ${expandedFilters ? 'rotate-180' : ''}`} />
              </button>

              {expandedFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Дополнительные параметры</label>
                    <p className="text-sm text-gray-400">
                      Расширенные параметры фильтрации будут добавлены в следующих обновлениях
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Кнопка загрузки */}
            <div className="flex justify-center mt-6">
              <Button
                onClick={handleLoadData}
                loading={loading}
                size="lg"
                variant="primary"
                className="px-8"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                {t('filters.loadData')}
              </Button>
            </div>

            {/* Ошибки */}
            {error && (
              <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Новые возможности */}
        <Card variant="primary">
          <CardContent className="p-6">
            <CardTitle className="mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              {t('filters.interfaceCapabilities')}
            </CardTitle>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
              <div>
                <h4 className="font-medium text-white mb-2">📊 {t('filters.enhancedAnalytics')}</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Horizontal volume charts</li>
                  <li>• Time-based conversion analysis</li>
                  <li>• Detailed searchable table</li>
                  <li>• Extended statistics</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-white mb-2">🔍 {t('filters.convenientFiltering')}</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Quick presets</li>
                  <li>• Filter by projects and statuses</li>
                  <li>• Flexible date ranges</li>
                  <li>• Sorting and pagination</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default EnhancedAPIFilters 