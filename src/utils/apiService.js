// API сервис для работы с платформой коллектора
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://payment.woozuki.com/collector1/api/v1'
const API_KEY = import.meta.env.VITE_API_KEY || 'master-3E193252DE4A4B4C80862F67B2972D3D'

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
      { value: '', label: 'Все проекты' },
      { value: 'monetix', label: 'Monetix' },
      { value: 'caroussel', label: 'Caroussel' }
    ]
  }

  // Получение доступных статусов
  getAvailableStatuses() {
    return [
      { value: 'success', label: 'Успешно' },
      { value: 'fail', label: 'Ошибка' },
      { value: 'in_process', label: 'В процессе' }
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

  console.log(`Normalizing ${apiData.length} operations from API`)

  const result = apiData.map((operation, index) => {
    console.log(`Processing operation ${index + 1}:`, {
      id: operation.operation_id,
      status: operation.current_status,
      hasComplete: !!operation.complete_amount,
      hasCardStart: !!(operation.card_start && operation.card_start.length > 0),
      hasCreateParams: !!operation.create_params
    })

    // Извлекаем имя пользователя из create_params
    let fullName = ''
    let firstName = ''
    let lastName = ''
    
    try {
      if (operation.create_params?.params?.payment?.payer?.person) {
        const person = operation.create_params.params.payment.payer.person
        firstName = person.first_name || ''
        lastName = person.last_name || ''
        fullName = `${firstName} ${lastName}`.trim()
      }
    } catch (e) {
      console.warn('Error extracting user name:', e)
    }

    // Определяем тип операции на основе метода
    const method = operation.create_params?.method || ''
    const isPaymentIn = method === 'payment.in'
    const isPaymentOut = method === 'payment.out'
    
    // Извлекаем сумму и валюту (приоритет: complete_amount -> card_start -> create_params)
    let amount = 0
    let currency = 'TRY'
    
    if (operation.complete_amount) {
      // Завершенная операция
      amount = parseFloat(operation.complete_amount)
      currency = operation.complete_currency || 'TRY'
    } else if (operation.card_start && operation.card_start.length > 0) {
      // Операция в процессе - берем из card_start
      amount = parseFloat(operation.card_start[0].amount || 0)
      currency = operation.card_start[0].currency || 'TRY'
    } else {
      // Операция только создана - берем из create_params
      try {
        const createAmount = operation.create_params?.params?.payment?.amount
        if (createAmount) {
          amount = parseFloat(createAmount.value || 0) / 100 // API возвращает в копейках
          currency = createAmount.currency || 'TRY'
        }
      } catch (e) {
        console.warn('Error extracting amount from create_params:', e)
      }
    }

    console.log(`Operation ${operation.operation_id}: amount=${amount} ${currency}, source=${
      operation.complete_amount ? 'complete' : 
      (operation.card_start && operation.card_start.length > 0) ? 'card_start' : 'create_params'
    }`)
    
    // Извлекаем комиссию из card_finish если есть
    let fee = 0
    try {
      if (operation.card_finish && operation.card_finish.length > 0) {
        fee = parseFloat(operation.card_finish[0].charged_fee || 0)
      }
    } catch (e) {
      console.warn('Error extracting fee:', e)
    }

    return {
      // Основные поля
      id: operation.operation_id || operation.reference_id || '',
      status: operation.current_status || operation.payment_status || '',
      amount: amount,
      type: isPaymentIn ? 'deposit' : (isPaymentOut ? 'withdraw' : 'unknown'),
      company: operation.project || '',
      fee: fee,
      feeRatio: fee > 0 && amount > 0 ? `${((fee / amount) * 100).toFixed(2)}%` : '0%',
      
      // Тип транзакции
      transactionType: isPaymentIn ? 'Пополнение' : (isPaymentOut ? 'Вывод' : 'Неизвестно'),
      isDeposit: isPaymentIn,
      isWithdraw: isPaymentOut,
      
      // Пользователь
      userName: fullName || operation.user_id || '',
      userId: operation.user_id || '',
      fullName: fullName,
      
      // Время
      createdAt: operation.operation_created_at || operation.complete_created_at || '',
      processedAt: operation.complete_modified_at || operation.operation_modified_at || '',
      
      // Платежная информация
      paymentMethod: operation.payment_method_code || operation.payment_product || '',
      paymentGateway: operation.payment_product || '',
      
      // Техническая информация
      hash: operation.operation_id || '',
      ipAddress: operation.ip_addr || '',
      
      // Дополнительные поля
      linkId: operation.reference_id || '',
      clientOperationId: operation.client_operation_id || '',
      
      // Вычисляемые поля
      isCompleted: (operation.current_status || '').toLowerCase() === 'success',
      isCanceled: false, // API не возвращает отмененные операции
      isFailed: (operation.current_status || '').toLowerCase() === 'fail',
      isInProcess: (operation.current_status || '').toLowerCase() === 'in_process',
      
      // Форматированные суммы
      amountFormatted: new Intl.NumberFormat('tr-TR', { 
        style: 'currency', 
        currency: currency
      }).format(amount),
      
      feeFormatted: new Intl.NumberFormat('tr-TR', { 
        style: 'currency', 
        currency: currency
      }).format(fee),

      // Дополнительная информация
      operationState: operation.operation_state || '',
      paymentMethodType: operation.payment_method_type || '',
      integrationMethod: operation.integration_type || '',
      serviceEnv: operation.service_env || '',
      projectEnv: operation.project_env || '',

      // Источник данных
      dataSource: 'api'
    }
  }).filter(operation => {
    // Фильтруем операции с некорректными данными
    // Операции в процессе могут иметь нулевую сумму, поэтому проверяем только ID
    const isValid = operation.id && (operation.amount > 0 || operation.status === 'in_process')
    if (!isValid) {
      console.warn('Skipping invalid operation:', {
        id: operation.id,
        amount: operation.amount,
        status: operation.status
      })
    }
    return isValid
  })

  console.log(`Successfully normalized ${result.length} valid operations`)
  if (result.length > 0) {
    console.log('Sample normalized operation:', result[0])
  }
  
  return result
} 