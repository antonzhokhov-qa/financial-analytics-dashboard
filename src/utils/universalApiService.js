class UniversalApiService {
  constructor() {
    this.baseURL = process.env.NODE_ENV === 'production' 
      ? 'https://your-api-domain.com' 
      : 'http://localhost:3002'
    this.wsURL = process.env.NODE_ENV === 'production' 
      ? 'wss://your-api-domain.com:8080' 
      : 'ws://localhost:8080'
    this.ws = null
  }

  // Универсальная обработка файлов
  async processFile(file, provider = 'optipay', mode = 'auto', onProgress = null) {
    try {
      console.log('🚀 Универсальная обработка файла:', file.name, 'Провайдер:', provider, 'Режим:', mode)

      const formData = new FormData()
      formData.append('csvFile', file)
      formData.append('provider', provider)
      formData.append('mode', mode)

      const response = await fetch(`${this.baseURL}/api/process`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ошибка обработки файла')
      }

      const result = await response.json()
      console.log('✅ Ответ сервера:', result)

      // Если это серверная обработка, подключаемся к WebSocket
      if (result.jobId && onProgress) {
        console.log('🔌 Подключаемся к WebSocket для отслеживания прогресса...')
        return await this.subscribeToProgress(result.jobId, onProgress)
      }

      // Если это клиентская обработка, возвращаем результат сразу
      return result

    } catch (error) {
      console.error('❌ Ошибка обработки файла:', error)
      throw error
    }
  }

  // Подписка на прогресс обработки через WebSocket
  async subscribeToProgress(jobId, onProgress) {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.wsURL)

        this.ws.onopen = () => {
          console.log('🔌 WebSocket подключен для задачи:', jobId)
          // Подписываемся на обновления задачи
          this.ws.send(JSON.stringify({
            type: 'subscribe',
            jobId: jobId
          }))
        }

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (data.jobId === jobId) {
              console.log('📊 Прогресс:', data.progress, '%', data.step)
              
              if (onProgress) {
                onProgress({
                  progress: data.progress,
                  step: data.step,
                  jobId: data.jobId
                })
              }

              // Если задача завершена, получаем результат
              if (data.progress >= 100) {
                console.log('✅ Обработка завершена, получаем результат...')
                setTimeout(() => {
                  this.getJobResult(jobId)
                    .then(resolve)
                    .catch(reject)
                }, 1000) // Небольшая задержка для завершения обработки
              }
            }
          } catch (e) {
            console.error('Ошибка парсинга WebSocket сообщения:', e)
          }
        }

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket ошибка:', error)
          reject(new Error('WebSocket connection failed'))
        }

        this.ws.onclose = () => {
          console.log('🔌 WebSocket отключен')
        }

        // Таймаут для предотвращения зависания
        setTimeout(() => {
          if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
            reject(new Error('Timeout: обработка заняла слишком много времени'))
          }
        }, 300000) // 5 минут

      } catch (error) {
        console.error('❌ Ошибка подключения к WebSocket:', error)
        reject(error)
      }
    })
  }

  // Получение результата задачи
  async getJobResult(jobId) {
    try {
      console.log('📥 Получаем результат задачи:', jobId)
      
      const response = await fetch(`${this.baseURL}/api/analytics/result/${jobId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('✅ Результат получен:', {
        dataLength: result.data?.length || 0,
        metrics: result.metrics
      })

      return result

    } catch (error) {
      console.error('❌ Ошибка получения результата:', error)
      throw error
    }
  }

  // Проверка здоровья API
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/api/health`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('❌ API недоступен:', error)
      throw error
    }
  }

  // Закрытие WebSocket соединения
  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

export default UniversalApiService 