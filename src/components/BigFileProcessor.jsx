import React, { useState, useEffect } from 'react'
import { Upload, Server, Wifi, WifiOff, Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import bigFileApi from '../utils/bigFileApiService'

const BigFileProcessor = ({ selectedProvider, onResults }) => {
  const [file, setFile] = useState(null)
  const [jobId, setJobId] = useState(null)
  const [progress, setProgress] = useState({ stage: '', progress: 0 })
  const [status, setStatus] = useState('idle') // idle, uploading, processing, completed, error
  const [apiHealth, setApiHealth] = useState(null)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  // Проверяем здоровье API при загрузке
  useEffect(() => {
    checkApiHealth()
  }, [])

  // Очистка WebSocket при размонтировании
  useEffect(() => {
    return () => {
      bigFileApi.disconnect()
    }
  }, [])

  const checkApiHealth = async () => {
    const health = await bigFileApi.healthCheck()
    setApiHealth(health)
  }

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile)
    setError(null)
    setResults(null)
    setStatus('idle')
  }

  const handleUpload = async () => {
    if (!file || !selectedProvider) return

    try {
      setStatus('uploading')
      setError(null)
      
      // Загружаем файл с прогрессом
      const uploadResult = await bigFileApi.uploadFile(
        file, 
        selectedProvider.id,
        handleProgress
      )
      
      setJobId(uploadResult.jobId)
      setStatus('processing')
      
      // Ждем завершения обработки
      await pollForCompletion(uploadResult.jobId)
      
    } catch (error) {
      console.error('❌ Ошибка загрузки:', error)
      setError(error.message)
      setStatus('error')
    }
  }

  const handleProgress = (progressData) => {
    setProgress(progressData)
    
    // Если обработка завершена
    if (progressData.completed) {
      setStatus('completed')
      setResults({
        metrics: progressData.metrics,
        jobId: jobId
      })
      
      // Передаем результаты родительскому компоненту
      if (onResults) {
        onResults({
          data: [], // Данные будут загружены по требованию
          metrics: progressData.metrics,
          jobId: jobId,
          isServerProcessed: true
        })
      }
    }
  }

  const pollForCompletion = async (jobId) => {
    const maxAttempts = 60 // 5 минут максимум
    let attempts = 0
    
    const poll = async () => {
      try {
        const jobStatus = await bigFileApi.getJobStatus(jobId)
        
        if (jobStatus.status === 'completed') {
          const jobResults = await bigFileApi.getJobResults(jobId, 1, 50)
          setResults(jobResults)
          setStatus('completed')
          
          if (onResults) {
            onResults({
              data: jobResults.data,
              metrics: jobResults.metrics,
              jobId: jobId,
              isServerProcessed: true,
              pagination: jobResults.pagination
            })
          }
          return
        }
        
        if (jobStatus.status === 'failed') {
          setError(jobStatus.error || 'Ошибка обработки на сервере')
          setStatus('error')
          return
        }
        
        // Продолжаем опрос
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000) // Опрос каждые 5 секунд
        } else {
          setError('Превышено время ожидания обработки')
          setStatus('error')
        }
        
      } catch (error) {
        console.error('❌ Ошибка опроса статуса:', error)
        setError('Ошибка связи с сервером')
        setStatus('error')
      }
    }
    
    poll()
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
      case 'completed':
        return <CheckCircle2 className="h-6 w-6 text-green-400" />
      case 'error':
        return <XCircle className="h-6 w-6 text-red-400" />
      default:
        return <Upload className="h-6 w-6 text-white/70" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'uploading':
        return 'Загрузка файла на сервер...'
      case 'processing':
        return progress.stage || 'Обработка данных...'
      case 'completed':
        return 'Обработка завершена!'
      case 'error':
        return 'Ошибка обработки'
      default:
        return 'Готов к загрузке'
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Статус API */}
      <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Server className="h-5 w-5 text-white/70" />
            <span className="text-white font-medium">Статус Backend API</span>
          </div>
          <div className="flex items-center space-x-2">
            {apiHealth?.status === 'ok' ? (
              <>
                <Wifi className="h-4 w-4 text-green-400" />
                <span className="text-green-400 text-sm">Онлайн</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-400" />
                <span className="text-red-400 text-sm">Недоступен</span>
              </>
            )}
          </div>
        </div>
        {apiHealth?.activeJobs !== undefined && (
          <p className="text-white/60 text-sm mt-2">
            Активных задач: {apiHealth.activeJobs}
          </p>
        )}
      </div>

      {/* Выбор файла */}
      <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Upload className="h-6 w-6 mr-2" />
          Обработка больших файлов на сервере
        </h3>
        
        <div className="space-y-4">
          <div>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFileSelect(e.target.files[0])}
              className="block w-full text-sm text-white/70
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-medium
                file:bg-blue-500 file:text-white
                hover:file:bg-blue-600 file:cursor-pointer"
              disabled={status === 'processing' || status === 'uploading'}
            />
          </div>

          {file && (
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-white/60 text-sm">
                    {bigFileApi.constructor.formatFileSize(file.size)} • 
                    Провайдер: {selectedProvider?.name}
                  </p>
                </div>
                <button
                  onClick={handleUpload}
                  disabled={status === 'processing' || status === 'uploading' || apiHealth?.status !== 'ok'}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {status === 'uploading' || status === 'processing' ? 'Обработка...' : 'Загрузить'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Прогресс обработки */}
      {(status === 'uploading' || status === 'processing') && (
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
          <div className="flex items-center space-x-3 mb-4">
            {getStatusIcon()}
            <span className="text-white font-medium">{getStatusText()}</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-white/70">{progress.stage}</span>
              <span className="text-white/70">{progress.progress}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.progress}%` }}
              />
            </div>
          </div>
          
          {jobId && (
            <p className="text-white/50 text-xs mt-3">
              ID задачи: {jobId}
            </p>
          )}
        </div>
      )}

      {/* Результаты */}
      {status === 'completed' && results && (
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle2 className="h-6 w-6 text-green-400" />
            <span className="text-white font-medium">Обработка завершена!</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-white/60 text-sm">Всего записей</p>
              <p className="text-white text-xl font-bold">
                {results.metrics?.total || results.pagination?.total || 'N/A'}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-white/60 text-sm">Успешных</p>
              <p className="text-green-400 text-xl font-bold">
                {results.metrics?.successful || 'N/A'}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-white/60 text-sm">Конверсия</p>
              <p className="text-blue-400 text-xl font-bold">
                {results.metrics?.conversionRate ? `${results.metrics.conversionRate.toFixed(1)}%` : 'N/A'}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-white/60 text-sm">Доход</p>
              <p className="text-purple-400 text-xl font-bold">
                {results.metrics?.successfulRevenue 
                  ? `${results.metrics.successfulRevenue.toLocaleString()} ${results.metrics.currency || ''}`
                  : 'N/A'
                }
              </p>
            </div>
          </div>
          
          {results.processingTime && (
            <p className="text-white/60 text-sm">
              Время обработки: {bigFileApi.constructor.formatProcessingTime(results.processingTime)}
            </p>
          )}
        </div>
      )}

      {/* Ошибки */}
      {status === 'error' && error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-2">
            <XCircle className="h-6 w-6 text-red-400" />
            <span className="text-red-400 font-medium">Ошибка обработки</span>
          </div>
          <p className="text-red-300 text-sm">{error}</p>
          <button
            onClick={() => {
              setStatus('idle')
              setError(null)
              setProgress({ stage: '', progress: 0 })
            }}
            className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      )}

      {/* Информация о преимуществах */}
      <div className="bg-white/5 rounded-xl p-4">
        <h4 className="text-white font-medium mb-2 flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2 text-yellow-400" />
          Преимущества серверной обработки:
        </h4>
        <ul className="text-white/70 text-sm space-y-1">
          <li>• Обработка файлов любого размера (до 100MB)</li>
          <li>• Не нагружает браузер пользователя</li>
          <li>• Реальный прогресс обработки через WebSocket</li>
          <li>• Расширенная аналитика и метрики</li>
          <li>• Пагинированные результаты для больших наборов данных</li>
        </ul>
      </div>
    </div>
  )
}

export default BigFileProcessor 