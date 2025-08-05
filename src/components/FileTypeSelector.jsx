import { useState } from 'react'
import { FileText, Database, Settings } from 'lucide-react'

const FileTypeSelector = ({ onTypeSelect, onBack }) => {
  const [selectedType, setSelectedType] = useState('')

  const handleTypeSelect = (type) => {
    setSelectedType(type)
    onTypeSelect(type)
  }

  const fileTypes = [
    {
      id: 'platform',
      title: 'Выгрузка из платформы',
      description: 'Стандартный формат данных от платежной платформы',
      icon: Database,
      features: [
        'Разделитель: запятая (,)',
        'Поля: Reference ID, Status, Amount, Method',
        'Статусы: success/fail',
        'Валюта: TRY (турецкие лиры)'
      ],
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30'
    },
    {
      id: 'merchant',
      title: 'Выгрузка от провайдера',
      description: 'Расширенный формат данных от провайдера/мерчанта',
      icon: FileText,
      features: [
        'Разделитель: точка с запятой (;)',
        'Поля: Идентификатор, Status, Компания, Пользователь',
        'Статусы: completed/canceled/failed',
        'Валюта: TRY (турецкие лиры)'
      ],
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/30'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Заголовок */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
            <Settings className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white">Выберите источник данных</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Укажите, откуда получен CSV файл для правильной обработки
          </p>
        </div>

        {/* Карточки типов */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {fileTypes.map((type) => (
            <div
              key={type.id}
              onClick={() => handleTypeSelect(type.id)}
              className={`relative group cursor-pointer transition-all duration-300 hover:scale-105 ${
                selectedType === type.id ? 'ring-4 ring-blue-400' : ''
              }`}
            >
              <div className={`bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 ${type.borderColor} hover:bg-white/10 transition-all duration-300`}>
                {/* Иконка */}
                <div className={`w-16 h-16 bg-gradient-to-br ${type.color} rounded-xl flex items-center justify-center mb-6`}>
                  <type.icon className="w-8 h-8 text-white" />
                </div>

                {/* Заголовок */}
                <h3 className="text-2xl font-bold text-white mb-3">{type.title}</h3>
                
                {/* Описание */}
                <p className="text-gray-300 mb-6">{type.description}</p>

                {/* Особенности */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wide">Особенности:</h4>
                  <ul className="space-y-2">
                    {type.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-300">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Индикатор выбора */}
                {selectedType === type.id && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Кнопки управления */}
        <div className="flex justify-center gap-4 pt-8">
          <button
            onClick={onBack}
            className="px-8 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors duration-200 border border-white/20"
          >
            Назад
          </button>
          
          {selectedType && (
            <button
              onClick={() => onTypeSelect(selectedType)}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-semibold"
            >
              Продолжить с {selectedType === 'platform' ? 'платформой' : 'провайдером'}
            </button>
          )}
        </div>

        {/* Подсказка */}
        <div className="text-center">
          <p className="text-sm text-gray-400">
            💡 {t('analytics.providerExportTip')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default FileTypeSelector 