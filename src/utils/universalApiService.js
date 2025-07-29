class UniversalApiService {
  constructor() {
    this.baseURL = process.env.NODE_ENV === 'production' 
      ? 'https://your-api-domain.com' 
      : 'http://localhost:3002'
    this.wsURL = process.env.NODE_ENV === 'production' 
      ? 'wss://your-api-domain.com:8080' 
      : 'ws://localhost:8080'
    this.ws = null
    
    // Конфигурация провайдеров
    this.providerConfig = {
      payshack: {
        name: 'Payshack',
        currency: 'INR',
        country: 'India',
        flag: '🇮🇳',
        expectedColumns: ['Transaction Id', 'Status', 'Amount', 'Created Date', 'Payment Method'],
        statusMapping: {
          'success': 'completed',
          'initiated': 'pending', 
          'failed': 'failed',
          'cancelled': 'cancelled'
        }
      },
      optipay: {
        name: 'Optipay',
        currency: 'TRY',
        country: 'Turkey',
        flag: '🇹🇷',
        expectedColumns: ['Tracking Id', 'Status', 'Amount', 'Creation time', 'Payment method', 'Company'],
        statusMapping: {
          'completed': 'completed',
          'in progress': 'pending',
          'failed': 'failed',
          'canceled': 'cancelled'
        }
      }
    }
  }

  // Получение конфигурации провайдера
  getProviderConfig(provider) {
    const config = this.providerConfig[provider]
    if (!config) {
      console.warn(`⚠️ Неизвестный провайдер: ${provider}. Используется базовая конфигурация.`)
      return {
        name: provider,
        currency: 'USD',
        country: 'Unknown',
        flag: '🌍',
        expectedColumns: [],
        statusMapping: {}
      }
    }
    return config
  }

  // Валидация файла для конкретного провайдера
  async validateFileForProvider(file, provider) {
    return new Promise((resolve, reject) => {
      const config = this.getProviderConfig(provider)
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const text = e.target.result
          const lines = text.split('\n')
          const header = lines[0]
          
          if (!header) {
            reject(new Error('Файл пуст или не содержит заголовков'))
            return
          }
          
          console.log(`🔍 Валидация файла для провайдера ${provider}:`)
          console.log(`📋 Ожидаемые колонки: ${config.expectedColumns.join(', ')}`)
          console.log(`📄 Найденные колонки: ${header}`)
          
          // Проверяем наличие ключевых колонок
          const hasRequiredColumns = config.expectedColumns.some(expectedCol => 
            header.toLowerCase().includes(expectedCol.toLowerCase())
          )
          
          if (!hasRequiredColumns && config.expectedColumns.length > 0) {
            console.warn(`⚠️ Не найдены ожидаемые колонки для ${provider}`)
            // Не отклоняем, а предупреждаем - возможно файл все равно валидный
          }
          
          resolve({
            isValid: true,
            lineCount: lines.length - 1, // Исключаем заголовок
            headerColumns: header.split(',').map(col => col.trim()),
            providerConfig: config
          })
          
        } catch (error) {
          reject(new Error(`Ошибка чтения файла: ${error.message}`))
        }
      }
      
      reader.onerror = () => {
        reject(new Error('Ошибка чтения файла'))
      }
      
      // Читаем только первые 1KB для валидации
      const slice = file.slice(0, 1024)
      reader.readAsText(slice)
    })
  }

  // Универсальная обработка файлов с улучшенной логикой провайдеров
  async processFile(file, provider = 'optipay', mode = 'auto', onProgress = null) {
    try {
      console.log(`🚀 Универсальная обработка файла:`, {
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
        provider: provider,
        mode: mode
      })

      // Валидируем файл для выбранного провайдера
      const validation = await this.validateFileForProvider(file, provider)
      console.log(`✅ Валидация прошла успешно:`, validation)

      // Уведомляем о прогрессе
      if (onProgress) {
        onProgress({
          progress: 5,
          step: `Файл валидирован для провайдера ${validation.providerConfig.name}`,
          provider: provider,
          validation: validation
        })
      }

      const formData = new FormData()
      formData.append('csvFile', file)
      formData.append('provider', provider)
      formData.append('mode', mode)
      formData.append('validation', JSON.stringify(validation))

      console.log(`📤 Отправка файла на сервер...`)
      if (onProgress) {
        onProgress({
          progress: 10,
          step: 'Отправка файла на сервер...',
          provider: provider
        })
      }

      const response = await fetch(`${this.baseURL}/api/process`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log(`✅ Ответ сервера:`, {
        jobId: result.jobId,
        mode: result.mode,
        hasData: !!result.data,
        dataLength: result.data?.length || 0
      })

      // Если это серверная обработка, подключаемся к WebSocket
      if (result.jobId && onProgress) {
        console.log(`🔌 Подключаемся к WebSocket для отслеживания прогресса задачи: ${result.jobId}`)
        return await this.subscribeToProgress(result.jobId, onProgress, provider)
      }

      // Если это клиентская обработка, возвращаем результат сразу
      if (result.data) {
        // Обогащаем результат информацией о провайдере
        result.providerConfig = validation.providerConfig
        result.provider = provider
        
        if (result.metrics) {
          result.metrics.provider = provider
          result.metrics.currency = validation.providerConfig.currency
          result.metrics.providerConfig = validation.providerConfig
        }
      }

      return result

    } catch (error) {
      console.error(`❌ Ошибка обработки файла для провайдера ${provider}:`, error)
      throw new Error(`Ошибка обработки файла: ${error.message}`)
    }
  }

  // Подписка на прогресс обработки через WebSocket с поддержкой провайдеров
  async subscribeToProgress(jobId, onProgress, provider) {
    return new Promise((resolve, reject) => {
      try {
        console.log(`🔌 Устанавливаем WebSocket соединение для задачи ${jobId} (провайдер: ${provider})`)
        this.ws = new WebSocket(this.wsURL)

        this.ws.onopen = () => {
          console.log(`✅ WebSocket подключен для задачи: ${jobId}`)
          // Подписываемся на обновления задачи
          this.ws.send(JSON.stringify({
            type: 'subscribe',
            jobId: jobId,
            provider: provider
          }))
        }

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (data.jobId === jobId) {
              console.log(`📊 Прогресс ${provider}:`, data.progress, '%', data.step || data.stage)
              
              if (onProgress) {
                onProgress({
                  progress: data.progress,
                  step: data.step || data.stage,
                  jobId: data.jobId,
                  provider: provider,
                  metrics: data.metrics
                })
              }

              // Если задача завершена, получаем результат
              if (data.progress >= 100 || data.completed) {
                console.log(`✅ Обработка ${provider} завершена, получаем результат...`)
                setTimeout(() => {
                  this.getJobResult(jobId, provider)
                    .then(resolve)
                    .catch(reject)
                }, 1000) // Небольшая задержка для завершения обработки
              }
              
              // Обработка ошибок
              if (data.error) {
                console.error(`❌ Ошибка обработки ${provider}:`, data.error)
                reject(new Error(data.error))
              }
            }
          } catch (e) {
            console.error('❌ Ошибка парсинга WebSocket сообщения:', e)
          }
        }

        this.ws.onerror = (error) => {
          console.error(`❌ WebSocket ошибка для ${provider}:`, error)
          reject(new Error(`WebSocket connection failed для провайдера ${provider}`))
        }

        this.ws.onclose = () => {
          console.log(`🔌 WebSocket отключен для задачи ${jobId}`)
        }

        // Таймаут для предотвращения зависания (увеличен для больших файлов)
        setTimeout(() => {
          if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
            this.disconnect()
            reject(new Error(`Timeout: обработка ${provider} заняла слишком много времени (>10 минут)`))
          }
        }, 600000) // 10 минут

      } catch (error) {
        console.error(`❌ Ошибка подключения к WebSocket для ${provider}:`, error)
        reject(error)
      }
    })
  }

  // Получение результата задачи с поддержкой провайдеров
  async getJobResult(jobId, provider = null) {
    try {
      console.log(`📥 Получаем результат задачи: ${jobId} (провайдер: ${provider || 'unknown'})`)
      
      const response = await fetch(`${this.baseURL}/api/analytics/job/${jobId}/results`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      // Обогащаем результат информацией о провайдере
      if (provider && this.providerConfig[provider]) {
        result.providerConfig = this.providerConfig[provider]
        result.provider = provider
        
        if (result.metrics) {
          result.metrics.provider = provider
          result.metrics.currency = this.providerConfig[provider].currency
          result.metrics.providerConfig = this.providerConfig[provider]
        }
      }
      
      console.log(`✅ Результат получен:`, {
        dataLength: result.data?.length || 0,
        provider: result.provider || provider,
        currency: result.metrics?.currency,
        processingTime: result.processingTime
      })

      return result

    } catch (error) {
      console.error(`❌ Ошибка получения результата для ${provider}:`, error)
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