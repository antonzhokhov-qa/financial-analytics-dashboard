import { useState } from 'react'
import { Upload, Globe, Database, FileText } from 'lucide-react'
import LanguageSwitcher from './LanguageSwitcher'
import { useTranslation } from '../contexts/LanguageContext'

const DataSourceSelector = ({ onSourceChange, currentSource, onReconciliationClick }) => {
  const { t } = useTranslation()
  const [selectedSource, setSelectedSource] = useState(currentSource || 'csv')

  const sources = [
    {
      id: 'csv',
      title: t('dataSources.csvUpload'),
      description: t('dataSources.csvDescription'),
      icon: Upload,
      color: 'from-blue-500 to-cyan-600',
      features: [
        t('dataSources.features.detailedAnalysis'),
        t('dataSources.features.largeFileSupport'),
        t('dataSources.features.historicalAnalytics'),
        t('dataSources.features.providerData')
      ]
    },
    // Скрыт источник API платформы по запросу пользователя
    // {
    //   id: 'api',
    //   title: t('dataSources.platformAPI'),
    //   description: t('dataSources.platformDescription'),
    //   icon: Globe,
    //   color: 'from-green-500 to-emerald-600',
    //   features: [
    //     t('dataSources.features.realTimeInfo'),
    //     t('dataSources.features.projectFiltering'),
    //     t('dataSources.features.liveData'),
    //     t('dataSources.features.platformData')
    //   ]
    // },
    {
      id: 'enhanced-api',
      title: t('dataSources.enhancedAPI'),
      description: t('dataSources.enhancedDescription'),
      icon: Database,
      color: 'from-purple-500 to-pink-600',
      features: [
        '💰 ' + t('dataSources.features.cryptoSupport'),
        '💳 ' + t('dataSources.features.cardInfo'),
        '💱 ' + t('dataSources.features.currencyRates'),
        '🛡️ ' + t('dataSources.features.secureData'),
        '🌍 ' + t('dataSources.features.geolocation')
      ],
      isNew: true
    }
  ]

  const handleSourceSelect = (sourceId) => {
    setSelectedSource(sourceId)
    onSourceChange(sourceId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl space-y-8">
        {/* Панель управления */}
        <div className="flex justify-end">
          <LanguageSwitcher variant="compact" />
        </div>

        {/* Заголовок */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
            <Database className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white">
            {t('navigation.selectDataSource')}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {t('navigation.chooseDataMethod')}
          </p>
        </div>

        {/* Карточки источников данных */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {sources.map((source) => {
            const IconComponent = source.icon
            const isSelected = selectedSource === source.id
            
            return (
              <div
                key={source.id}
                className={`relative group cursor-pointer transition-all duration-300 ${
                  isSelected 
                    ? 'scale-105 z-10' 
                    : 'hover:scale-102 hover:z-10'
                }`}
                onClick={() => handleSourceSelect(source.id)}
              >
                <div className={`
                  bg-white/10 backdrop-blur-xl rounded-2xl p-8 border transition-all duration-300
                  ${isSelected 
                    ? 'border-blue-500/50 bg-white/15 shadow-2xl shadow-blue-500/20' 
                    : 'border-white/20 hover:border-white/30 hover:bg-white/15'
                  }
                `}>
                  {/* Иконка и заголовок */}
                  <div className="flex items-center space-x-4 mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${source.color} rounded-xl flex items-center justify-center`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{source.title}</h3>
                      <p className="text-gray-300">{source.description}</p>
                    </div>
                  </div>

                  {/* Особенности */}
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-white">Возможности:</h4>
                    <ul className="space-y-2">
                      {source.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2 text-gray-300">
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Индикатор выбора */}
                  {isSelected && (
                    <div className="absolute top-4 right-4">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Кнопка действия */}
                  <div className="mt-8">
                    <button
                      className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                        isSelected
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {isSelected ? 'Выбрано' : 'Выбрать этот источник'}
                    </button>
                  </div>
                </div>

                {/* Эффект свечения для выбранной карточки */}
                {isSelected && (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl blur-xl -z-10"></div>
                )}
              </div>
            )
          })}
        </div>

        {/* Дополнительная информация */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Сравнение источников</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-white mb-2">📂 CSV файлы (провайдер)</h4>
              <ul className="space-y-1 text-gray-300">
                <li>• Детальная информация о транзакциях</li>
                <li>• Данные от Carrousel-Zorro, Zro_Monetix</li>
                <li>• Статусы: Completed, Canceled, Failed</li>
                <li>• Полная информация о комиссиях</li>
              </ul>
            </div>
            
            {/* Скрыт раздел API платформы по запросу пользователя */}
            {/* <div>
              <h4 className="font-semibold text-white mb-2">🌐 API платформы</h4>
              <ul className="space-y-1 text-gray-300">
                <li>• Актуальные данные в реальном времени</li>
                <li>• Проекты: Monetix, Caroussel</li>
                <li>• Статусы: Success, Fail</li>
                <li>• Фильтрация по датам и проектам</li>
              </ul>
            </div> */}

            <div>
              <h4 className="font-semibold text-white mb-2">🚀 Расширенный API <span className="text-xs bg-purple-500/30 px-2 py-1 rounded-full">НОВОЕ</span></h4>
              <ul className="space-y-1 text-gray-300">
                <li>• Поддержка криптовалют (fiat/crypto)</li>
                <li>• Информация о картах и 3D Secure</li>
                <li>• Валютные курсы и MCC коды</li>
                <li>• IP адреса и геолокация</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Специальная опция - Сверка данных */}
        <div className="text-center">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-3">🔄 Сверка данных</h3>
            <p className="text-gray-300 mb-4">
              Сравните данные от провайдера и платформы для выявления расхождений
            </p>
            <button
              onClick={onReconciliationClick}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-lg shadow-lg hover:from-orange-600 hover:to-red-700 transition-all duration-200"
            >
              Запустить сверку
            </button>
          </div>
        </div>

        {/* Кнопка продолжения */}
        {selectedSource && (
          <div className="text-center">
            <button
              onClick={() => onSourceChange(selectedSource)}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 text-lg"
            >
              Продолжить с {
                selectedSource === 'csv' ? 'CSV файлами' : 
                selectedSource === 'enhanced-api' ? 'Расширенным API' : 
                'API платформы'
              }
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default DataSourceSelector 