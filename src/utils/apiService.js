// API сервис для работы с платформой коллектора
const API_BASE_URL = 'https://payment.woozuki.com/collector1/api/v1'
const API_KEY = 'master-3E193252DE4A4B4C80862F67B2972D3D'

// Класс для работы с API коллектора
export class CollectorAPI {
  constructor() {
    this.baseUrl = API_BASE_URL
    this.apiKey = API_KEY
  }

  // Построение URL с параметрами
  buildUrl(endpoint, params = {}) {
    const url = new URL(`${this.baseUrl}/${endpoint}`)
    
    // Добавляем API ключ
    url.searchParams.set('apikey', this.apiKey)
    
    // Добавляем остальные параметры
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        url.searchParams.set(key, value)
      }
    })
    
    return url.toString()
  }

  // Выполнение запроса к API
  async makeRequest(endpoint, params = {}) {
    const url = this.buildUrl(endpoint, params)
    console.log('API Request URL:', url)
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('API Response:', data)
      
      return data
    } catch (error) {
      console.error('API Request failed:', error)
      throw error
    }
  }

  // Получение операций с фильтрами
  async getOperations(filters = {}) {
    const params = {}
    
    // Проект (обязательный параметр)
    if (filters.project) {
      params.project = filters.project
    }
    
    // Статус операции
    if (filters.status) {
      params.status = filters.status
    }
    
    // Сортировка (новые сверху/снизу)
    if (filters.descending !== undefined) {
      params.descending = filters.descending
    }
    
    // Количество записей
    if (filters.count) {
      params.count = filters.count
    }
    
    // Конкретная дата
    if (filters.date) {
      params.date = filters.date
    }
    
    // Диапазон дат
    if (filters.from) {
      params.from = filters.from
    }
    if (filters.to) {
      params.to = filters.to
    }

    return await this.makeRequest('operation', params)
  }

  // Получение последних операций
  async getLatestOperations(project, count = 100) {
    return await this.getOperations({
      project,
      descending: true,
      count,
      status: 'success'
    })
  }

  // Получение операций за конкретную дату
  async getOperationsByDate(project, date, status = null) {
    const filters = {
      project,
      date,
      descending: false
    }
    
    if (status) {
      filters.status = status
    }
    
    return await this.getOperations(filters)
  }

  // Получение операций за диапазон дат
  async getOperationsByDateRange(project, from, to, status = null) {
    const filters = {
      project,
      from,
      to,
      descending: false
    }
    
    if (status) {
      filters.status = status
    }
    
    return await this.getOperations(filters)
  }

  // Получение всех доступных проектов (статический список)
  getAvailableProjects() {
    return [
      { value: 'monetix', label: 'Monetix' },
      { value: 'caroussel', label: 'Caroussel' }
    ]
  }

  // Получение доступных статусов
  getAvailableStatuses() {
    return [
      { value: 'success', label: 'Успешно' },
      { value: 'fail', label: 'Ошибка' }
    ]
  }
}

// Экспорт экземпляра API
export const collectorAPI = new CollectorAPI()

// Функция для нормализации данных из API в формат приложения
export function normalizeAPIData(apiData) {
  if (!apiData || !Array.isArray(apiData)) {
    console.warn('Invalid API data:', apiData)
    return []
  }

  return apiData.map(operation => ({
    // Основные поля
    id: operation.id || operation.uuid || '',
    status: operation.status || '',
    amount: parseFloat(operation.amount || operation.initial_amount || 0),
    type: operation.type || operation.operation_type || '',
    company: operation.project || operation.company || '',
    fee: parseFloat(operation.fee || 0),
    feeRatio: operation.fee_ratio || '0%',
    
    // Тип транзакции
    transactionType: operation.type || operation.operation_type || '',
    isDeposit: (operation.type || '').toLowerCase().includes('deposit') || (operation.type || '').toLowerCase().includes('payin'),
    isWithdraw: (operation.type || '').toLowerCase().includes('withdraw') || (operation.type || '').toLowerCase().includes('payout'),
    
    // Пользователь
    userName: operation.username || operation.user_name || '',
    userId: operation.user_id || operation.user || '',
    fullName: operation.full_name || operation.name || '',
    
    // Время
    createdAt: operation.created_at || operation.creation_time || operation.date || '',
    processedAt: operation.processed_at || operation.updated_at || '',
    
    // Платежная информация
    paymentMethod: operation.method || operation.payment_method || '',
    paymentGateway: operation.gateway || operation.payment_gateway || '',
    
    // Техническая информация
    hash: operation.hash || operation.transaction_hash || '',
    ipAddress: operation.ip_address || operation.client_ip || '',
    
    // Дополнительные поля
    linkId: operation.link_id || operation.reference_id || '',
    
    // Вычисляемые поля
    isCompleted: (operation.status || '').toLowerCase() === 'success',
    isCanceled: false, // API не возвращает отмененные операции
    isFailed: (operation.status || '').toLowerCase() === 'fail',
    
    // Форматированные суммы (в TRY)
    amountFormatted: new Intl.NumberFormat('tr-TR', { 
      style: 'currency', 
      currency: 'TRY' 
    }).format(parseFloat(operation.amount || operation.initial_amount || 0)),
    
    feeFormatted: new Intl.NumberFormat('tr-TR', { 
      style: 'currency', 
      currency: 'TRY' 
    }).format(parseFloat(operation.fee || 0)),

    // Источник данных
    dataSource: 'api'
  }))
} 