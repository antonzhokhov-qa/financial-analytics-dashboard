import React from 'react'
import { FileText, Upload, CheckCircle2 } from 'lucide-react'

const ProviderSelector = ({ onProviderSelect, selectedProvider, onBack }) => {
  const providers = [
    {
      id: 'optipay',
      name: 'Optipay',
      description: 'Турецкий провайдер платежей',
      icon: '🇹🇷',
      fields: ['Tracking Id', 'Status', 'Amount', 'Payment method', 'Company'],
      sampleData: 'TransactionRequestsList.csv'
    },
    {
      id: 'payshack',
      name: 'Payshack',
      description: 'Индийский провайдер платежей',
      icon: '🇮🇳',
      fields: ['Transaction Id', 'Order Id', 'Status', 'Amount', 'UTR'],
      sampleData: 'transaction.csv'
    }
  ]

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          🏦 Выбор провайдера
        </h2>
        <p className="text-gray-600">
          Выберите провайдера для анализа данных
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className={`border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 ${
              selectedProvider === provider.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
            onClick={() => onProviderSelect(provider.id)}
          >
            <div className="text-center">
              <div className="text-4xl mb-4">{provider.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {provider.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {provider.description}
              </p>
              
              <div className="text-left">
                <h4 className="font-medium text-gray-900 mb-2">Основные поля:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {provider.fields.map((field, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle2 className="h-3 w-3 text-green-500 mr-2" />
                      {field}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Пример файла: {provider.sampleData}
                </p>
              </div>

              {selectedProvider === provider.id && (
                <div className="mt-4 flex items-center justify-center text-blue-600">
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  <span className="font-medium">Выбрано</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors mr-4"
        >
          ← Назад
        </button>
        
        <button
          onClick={() => onProviderSelect(selectedProvider)}
          disabled={!selectedProvider}
          className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <Upload className="h-4 w-4 mr-2" />
          Продолжить
        </button>
      </div>
    </div>
  )
}

export default ProviderSelector 