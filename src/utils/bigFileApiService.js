// Сервис для работы с backend API для больших файлов
class BigFileApiService {
  constructor() {
    this.baseURL = process.env.NODE_ENV === 'production' 
      ? 'https://your-api-domain.com' 
      : 'http://localhost:3001'
    this.wsURL = process.env.NODE_ENV === 'production' 
      ? 'wss://your-api-domain.com:8080' 
      : 'ws://localhost:8080'
    this.ws = null
  }

  // Загрузка файла на сервер для обработки
  async uploadFile(file, provider = 'optipay', onProgress = null) {
    try {
      console.log('🚀 Загружаем файл на сервер:', file.name, 'Провайдер:', provider)

      const formData = new FormData()
      formData.append('csvFile', file)
      formData.append('provider', provider)

      const response = await fetch(`${this.baseURL}/api/analytics/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ошибка загрузки файла')
      }

      const result = await response.json()
      console.log('✅ Файл загружен, получен jobId:', result.jobId)

      // Подключаемся к WebSocket для отслеживания прогресса
      if (onProgress) {
        this.subscribeToProgress(result.jobId, onProgress)
      }

      return result

    } catch (error) {
      console.error('❌ Ошибка загрузки файла:', error)
      throw error
    }
  }

  // Подписка на прогресс обработки через WebSocket
  subscribeToProgress(jobId, onProgress) {
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
          if (data.jobId === jobId && onProgress) {
            onProgress(data.progress)
          }
        } catch (e) {
          console.error('Ошибка парсинга WebSocket сообщения:', e)
        }
      }

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket ошибка:', error)
      }

      this.ws.onclose = () => {
        console.log('🔌 WebSocket отключен')
      }

    } catch (error) {
      console.error('❌ Ошибка подключения к WebSocket:', error)
    }
  }

  // Получение статуса задачи
  async getJobStatus(jobId) {
    try {
      const response = await fetch(`${this.baseURL}/api/analytics/job/${jobId}/status`)
      
      if (!response.ok) {
        throw new Error('Задача не найдена')
      }

      return await response.json()
    } catch (error) {
      console.error('❌ Ошибка получения статуса:', error)
      throw error
    }
  }

  // Получение результатов с пагинацией
  async getJobResults(jobId, page = 1, limit = 100) {
    try {
      const response = await fetch(
        `${this.baseURL}/api/analytics/job/${jobId}/results?page=${page}&limit=${limit}`
      )
      
      if (!response.ok) {
        throw new Error('Результаты не готовы')
      }

      return await response.json()
    } catch (error) {
      console.error('❌ Ошибка получения результатов:', error)
      throw error
    }
  }

  // Проверка здоровья API
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/api/health`)
      return await response.json()
    } catch (error) {
      console.error('❌ API недоступен:', error)
      return { status: 'error', error: error.message }
    }
  }

  // Закрытие WebSocket соединения
  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  // Утилита для форматирования размера файла
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Утилита для форматирования времени обработки
  static formatProcessingTime(milliseconds) {
    if (milliseconds < 1000) return `${milliseconds}мс`
    if (milliseconds < 60000) return `${(milliseconds / 1000).toFixed(1)}с`
    return `${(milliseconds / 60000).toFixed(1)}мин`
  }
}

// Экспортируем синглтон
export const bigFileApi = new BigFileApiService()
export default bigFileApi 