import { useState, useRef } from 'react'
import { Upload, File, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

const FileUpload = ({ onFileUpload, loading, maxSizeMB = 50 }) => {
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [processingStage, setProcessingStage] = useState('')
  const fileInputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file) => {
    console.log('📁 File selected:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2), 'MB')
    
    // Проверка размера файла
    const fileSizeMB = file.size / 1024 / 1024
    if (fileSizeMB > maxSizeMB) {
      alert(`Файл слишком большой! Максимальный размер: ${maxSizeMB}MB, размер файла: ${fileSizeMB.toFixed(2)}MB`)
      return
    }

    // Проверка типа файла
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Пожалуйста, выберите CSV файл')
      return
    }

    // Симуляция прогресса загрузки
    setUploadProgress(0)
    setProcessingStage('Загрузка файла...')
    
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          setProcessingStage('Обработка данных...')
          return 90
        }
        return prev + 10
      })
    }, 100)

    onFileUpload(file)
  }

  const onButtonClick = () => {
    fileInputRef.current?.click()
  }

  // Обновляем прогресс когда загрузка завершена
  if (loading && uploadProgress < 100) {
    setUploadProgress(100)
    setProcessingStage('Анализ данных...')
  } else if (!loading && uploadProgress > 0) {
    setUploadProgress(0)
    setProcessingStage('')
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Прогресс-бар */}
      {(loading || uploadProgress > 0) && (
        <div className="mb-6 bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">{processingStage}</span>
            <span className="text-white/70">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          {loading && (
            <div className="flex items-center justify-center mt-3">
              <Loader2 className="h-5 w-5 text-white animate-spin mr-2" />
              <span className="text-white/70">Обработка может занять некоторое время для больших файлов...</span>
            </div>
          )}
        </div>
      )}

      {/* Зона загрузки */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
          dragActive
            ? 'border-blue-400 bg-blue-500/10'
            : 'border-white/30 bg-white/5 hover:bg-white/10'
        } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleChange}
          className="hidden"
          disabled={loading}
        />

        <div className="space-y-4">
          <div className="flex justify-center">
            {loading ? (
              <Loader2 className="h-16 w-16 text-blue-400 animate-spin" />
            ) : (
              <Upload className="h-16 w-16 text-white/70" />
            )}
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {loading ? 'Обработка файла...' : 'Загрузите CSV файл'}
            </h3>
            <p className="text-white/70">
              Перетащите файл сюда или нажмите для выбора
            </p>
            <p className="text-white/50 text-sm mt-2">
              Максимальный размер: {maxSizeMB}MB • Поддерживаемые форматы: CSV
            </p>
          </div>

          {!loading && (
            <button
              onClick={onButtonClick}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium"
            >
              <File className="h-5 w-5 mr-2" />
              Выбрать файл
            </button>
          )}
        </div>

        {/* Подсказки для больших файлов */}
        <div className="mt-6 text-left bg-white/5 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 text-yellow-400" />
            Работа с большими файлами:
          </h4>
          <ul className="text-white/70 text-sm space-y-1">
            <li>• Файлы более 10,000 записей обрабатываются частично</li>
            <li>• Для полного анализа больших файлов рекомендуется использовать API</li>
            <li>• Обработка может занимать до 30 секунд</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default FileUpload 