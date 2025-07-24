import React, { useState } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react'
import { performReconciliationAPI, checkServerHealth } from '../utils/apiService'

const ReconciliationUpload = ({ onFilesUploaded }) => {
  const [merchantFile, setMerchantFile] = useState(null)
  const [platformFile, setPlatformFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = (file, type) => {
    if (type === 'merchant') {
      setMerchantFile(file)
    } else if (type === 'platform') {
      setPlatformFile(file)
    }
  }

  const processBothFiles = async () => {
    if (!merchantFile || !platformFile) {
      alert('Загрузите оба файла для сверки')
      return
    }

    setIsUploading(true)
    console.log('🔄 Starting reconciliation process...')

    try {
      // Проверяем доступность сервера
      const serverAvailable = await checkServerHealth()
      if (!serverAvailable) {
        throw new Error('Сервер сверки недоступен. Проверьте подключение к интернету и попробуйте снова.')
      }

      // Отправляем файлы на сервер для сверки
      const result = await performReconciliationAPI(merchantFile, platformFile)
      
      console.log('✅ Reconciliation completed:', result)

      // Передаем результаты родительскому компоненту
      onFilesUploaded({
        results: result,
        metadata: result.metadata,
        merchantFileName: merchantFile.name,
        platformFileName: platformFile.name
      })

    } catch (error) {
      console.error('❌ Error during reconciliation:', error)
      alert('Ошибка при сверке файлов: ' + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          🔄 Сверка транзакций
        </h2>
        <p className="text-gray-600">
          Загрузите файлы от провайдера и платформы для автоматической сверки
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Загрузка файла провайдера */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
          <div className="text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              📊 Файл провайдера
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              CSV файл с данными от провайдера (Tracking ID, Status, Amount...)
            </p>
            
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => handleFileUpload(e.target.files[0], 'merchant')}
              className="hidden"
              id="merchant-upload"
            />
            
            <label
              htmlFor="merchant-upload"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
            >
              <Upload className="h-4 w-4 mr-2" />
              Выбрать файл
            </label>
            
            {merchantFile && (
              <div className="mt-3 flex items-center justify-center text-green-600">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                <span className="text-sm">{merchantFile.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Загрузка файла платформы */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-green-400 transition-colors">
          <div className="text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🏦 Файл платформы
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              CSV файл с данными платформы (Foreign Operation ID, Status...)
            </p>
            
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => handleFileUpload(e.target.files[0], 'platform')}
              className="hidden"
              id="platform-upload"
            />
            
            <label
              htmlFor="platform-upload"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition-colors"
            >
              <Upload className="h-4 w-4 mr-2" />
              Выбрать файл
            </label>
            
            {platformFile && (
              <div className="mt-3 flex items-center justify-center text-green-600">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                <span className="text-sm">{platformFile.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Информация о сопоставлении полей */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">🔗 Сопоставление полей:</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>ID транзакции:</strong></p>
            <p className="text-gray-600">Foreign Operation Id (платформа) ↔ Tracking Id (провайдер)</p>
          </div>
          <div>
            <p><strong>Статус:</strong></p>
            <p className="text-gray-600">success (платформа) ↔ completed (провайдер)</p>
          </div>
        </div>
      </div>

      {/* Кнопка запуска сверки */}
      <div className="text-center">
        <button
          onClick={processBothFiles}
          disabled={!merchantFile || !platformFile || isUploading}
          className="inline-flex items-center px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Обработка...
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 mr-2" />
              Запустить сверку
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default ReconciliationUpload 