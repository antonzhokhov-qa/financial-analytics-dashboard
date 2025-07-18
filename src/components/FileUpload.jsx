import { useState, useRef } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react'

const FileUpload = ({ onFileUpload, loading }) => {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      handleFileSelect(file)
    }
  }

  const handleFileSelect = (file) => {
    // Проверяем расширение файла - только CSV
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Пожалуйста, выберите CSV файл')
      return
    }
    
    setSelectedFile(file)
    onFileUpload(file)
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
          dragActive 
            ? 'border-blue-400 bg-blue-500/10' 
            : 'border-white/20 bg-white/5 hover:bg-white/10'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="hidden"
        />
        
        <div className="text-center space-y-4">
          {/* Иконка */}
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : selectedFile ? (
              <CheckCircle className="w-8 h-8 text-white" />
            ) : (
              <Upload className="w-8 h-8 text-white" />
            )}
          </div>
          
          {/* Заголовок */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {loading ? 'Обработка файла...' : 
               selectedFile ? 'Файл загружен' : 
               'Загрузите CSV файл'}
            </h3>
            <p className="text-gray-300">
              {loading ? 'Пожалуйста, подождите...' :
               selectedFile ? selectedFile.name :
               'Перетащите файл сюда или нажмите кнопку'}
            </p>
          </div>
          
          {/* Кнопка загрузки */}
          {!selectedFile && !loading && (
            <button
              onClick={handleButtonClick}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-semibold"
            >
              Выбрать CSV файл
            </button>
          )}
          
          {/* Информация о поддерживаемых форматах */}
          {!selectedFile && !loading && (
            <div className="mt-6 p-4 bg-white/5 rounded-xl">
              <h4 className="text-sm font-semibold text-white mb-2">Поддерживаемые форматы:</h4>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-300">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>CSV файлы (.csv)</span>
              </div>
            </div>
          )}
          
          {/* Статус загрузки */}
          {loading && (
            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-blue-300">Анализируем данные...</span>
              </div>
            </div>
          )}
          
          {/* Успешная загрузка */}
          {selectedFile && !loading && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <span className="text-green-300 font-medium">Файл успешно загружен</span>
                  <p className="text-green-300/70 text-sm">{selectedFile.name}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Подсказки */}
      <div className="mt-6 space-y-3">
        <div className="flex items-start space-x-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
          <div className="text-sm text-yellow-300">
            <p className="font-medium mb-1">Важно:</p>
            <ul className="space-y-1">
              <li>• Файл должен быть в формате CSV</li>
              <li>• Файл должен содержать заголовки в первой строке</li>
              <li>• Поддерживаются разделители: запятая (,), точка с запятой (;)</li>
              <li>• Максимальный размер файла: 10 МБ</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FileUpload 