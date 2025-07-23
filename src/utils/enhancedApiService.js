// Расширенный API сервис для работы с обновленным коллектором
import { collectorAPI, normalizeAPIData } from './apiService'

class EnhancedCollectorAPI {
  constructor() {
    this.baseApi = collectorAPI
    this.endpoints = {
      // Базовые endpoints (уже существующие)
      operations: 'operation',
      
      // Новые endpoints (будут добавлены на основе документации)
      analytics: 'analytics',
      realtime: 'realtime', 
      notifications: 'notifications',
      insights: 'insights',
      users: 'users',
      geography: 'geography',
      performance: 'performance'
    }
  }

  // Наследуем базовую функциональность
  async getOperations(filters = {}) {
    return await this.baseApi.getOperations(filters)
  }

  getAvailableProjects() {
    return this.baseApi.getAvailableProjects()
  }

  getAvailableStatuses() {
    return this.baseApi.getAvailableStatuses()
  }

  // === НОВЫЕ МЕТОДЫ (будут реализованы после изучения документации) ===

  // Расширенная аналитика с новыми параметрами (использует старый API)
  async getOperationsEnhanced(filters = {}) {
    console.log('🚀 Enhanced API Request - Input filters:', filters)
    
    const params = {}
    
    // Базовые фильтры (переводим в формат старого API)
    if (filters.project_id) params.project = filters.project_id
    if (filters.status) params.status = filters.status
    
    // Курсорная пагинация и остальные параметры
    if (filters.count) params.count = filters.count
    if (filters.descending !== undefined) params.descending = filters.descending
    
    // Фильтры по датам
    if (filters.date) params.date = filters.date
    if (filters.from) params.from = filters.from
    if (filters.to) params.to = filters.to

    console.log('📤 API Request parameters:', params)

    try {
      // Используем тот же API что и базовый
      const rawData = await this.baseApi.makeRequest('operation', params)
      console.log('📥 Raw API Response:', {
        dataType: typeof rawData,
        isArray: Array.isArray(rawData),
        length: Array.isArray(rawData) ? rawData.length : 'not array',
        firstItem: Array.isArray(rawData) && rawData.length > 0 ? rawData[0] : null
      })
      
      if (Array.isArray(rawData) && rawData.length > 0) {
        console.log('📋 Sample data structure:', {
          keys: Object.keys(rawData[0]),
          status: rawData[0].operation_status || rawData[0].status,
          amount: rawData[0].operation_amount || rawData[0].amount,
          date: rawData[0].operation_created_at || rawData[0].date
        })
      }
      
      return rawData
    } catch (error) {
      console.error('❌ Enhanced API Request failed:', error)
      throw error
    }
  }

  // Real-time данные
  async getRealTimeData(params = {}) {
    // Заглушка для real-time обновлений
    console.log('Real-time data - awaiting API documentation')
    return null
  }

  // Уведомления и алерты
  async getNotifications(params = {}) {
    // Заглушка для системы уведомлений
    console.log('Notifications - awaiting API documentation')
    return null
  }

  // AI инсайты
  async getInsights(params = {}) {
    // Заглушка для AI-инсайтов
    console.log('AI Insights - awaiting API documentation')
    return null
  }

  // Пользовательская аналитика
  async getUserAnalytics(params = {}) {
    // Заглушка для пользовательской аналитики
    console.log('User analytics - awaiting API documentation')
    return null
  }

  // Географическая аналитика
  async getGeographyData(params = {}) {
    // Заглушка для географических данных
    console.log('Geography data - awaiting API documentation')
    return null
  }

  // Производительность и метрики
  async getPerformanceMetrics(params = {}) {
    // Заглушка для метрик производительности
    console.log('Performance metrics - awaiting API documentation')
    return null
  }

  // Сравнение периодов
  async getComparativeAnalysis(currentPeriod, previousPeriod) {
    // Заглушка для сравнительного анализа
    console.log('Comparative analysis - awaiting API documentation')
    return null
  }

  // Прогнозирование
  async getForecast(params = {}) {
    // Заглушка для прогнозов
    console.log('Forecast - awaiting API documentation')
    return null
  }

  // === ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ===

  // Унифицированный метод для запросов к новым endpoints
  async makeEnhancedRequest(endpoint, params = {}) {
    // Строим URL для запроса (используем тот же базовый URL)
    const baseUrl = process.env.REACT_APP_API_BASE_URL || 'https://sandbox.finmar.tech/collector/api/v3'
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value)
      }
    })
    
    const url = `${baseUrl}/${endpoint}${searchParams.toString() ? '?' + searchParams.toString() : ''}`
    
    try {
      const credentials = btoa(`${process.env.REACT_APP_API_USERNAME || ''}:${process.env.REACT_APP_API_PASSWORD || ''}`)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log(`Enhanced API Response from ${endpoint}:`, data)
      
      return data
    } catch (error) {
      console.error(`Enhanced API Request to ${endpoint} failed:`, error)
      throw error
    }
  }

  // Проверка доступности новых endpoints
  async checkEndpointAvailability(endpoint) {
    try {
      const baseUrl = process.env.REACT_APP_API_BASE_URL || 'https://sandbox.finmar.tech/collector/api/v3'
      const credentials = btoa(`${process.env.REACT_APP_API_USERNAME || ''}:${process.env.REACT_APP_API_PASSWORD || ''}`)
      
      const response = await fetch(`${baseUrl}/${endpoint}`, {
        method: 'HEAD',
        headers: {
          'Authorization': `Basic ${credentials}`
        }
      })
      return response.ok
    } catch {
      return false
    }
  }

  // Получение схемы нового endpoint
  async getEndpointSchema(endpoint) {
    try {
      const data = await this.makeEnhancedRequest(`${endpoint}/schema`)
      return data
    } catch {
      return null
    }
  }
}

// Создаем и экспортируем экземпляр
export const enhancedAPI = new EnhancedCollectorAPI()

// Расширенная нормализация данных
export function normalizeEnhancedData(apiData, dataType = 'operations') {
  switch (dataType) {
    case 'operations':
      return normalizeEnhancedOperations(apiData)
    
    case 'enhanced-operations':
      return normalizeEnhancedOperations(apiData)
    
    case 'users':
      return normalizeUserData(apiData)
    
    case 'geography':
      return normalizeGeographyData(apiData)
    
    default:
      console.warn(`Unknown data type: ${dataType}`)
      return apiData
  }
}

// Расширенная нормализация операций - адаптирована для старого API
function normalizeEnhancedOperations(apiData) {
  console.log('🔄 Starting data normalization:', {
    inputType: typeof apiData,
    isArray: Array.isArray(apiData),
    length: Array.isArray(apiData) ? apiData.length : 'not array'
  })

  if (!apiData || !Array.isArray(apiData)) {
    console.warn('❌ Invalid enhanced API data:', apiData)
    return []
  }

  // Анализируем доступные поля в первой записи для улучшения обработки
  if (apiData.length > 0) {
    const firstOperation = apiData[0]
    const allKeys = Object.keys(firstOperation)
    const directionKeys = allKeys.filter(key => 
      key.toLowerCase().includes('direction') || 
      key.toLowerCase().includes('type') || 
      key.toLowerCase().includes('method') ||
      key.toLowerCase().includes('operation')
    )
    
    console.log('🔍 Available fields for direction detection:', {
      totalFields: allKeys.length,
      directionRelatedFields: directionKeys,
      sampleKeys: allKeys.slice(0, 10)
    })
  }

  const normalized = apiData.map((operation, index) => {
    if (index < 3) {
      console.log(`🔍 Processing operation ${index + 1}:`, {
        originalKeys: Object.keys(operation),
        operation_status: operation.operation_status,
        status: operation.status,
        operation_amount: operation.operation_amount,
        amount: operation.amount,
        operation_created_at: operation.operation_created_at,
        date: operation.date
      })
    }
    // Исправленная логика для реальной структуры API
    let amount = 0
    let currency = 'TRY'
    let fee = 0
    
    // Извлекаем сумму и валюту из card_start (основной источник для активных операций)
    if (operation.card_start && operation.card_start.length > 0) {
      const cardData = operation.card_start[0]
      amount = parseFloat(cardData.amount || 0)
      currency = cardData.currency || 'TRY'
      // fee пока не извлекаем из card_start, так как его там нет в примере
    }
    
    // Если нет card_start, пробуем create_params
    if (amount === 0 && operation.create_params?.params?.payment?.amount) {
      const createAmount = operation.create_params.params.payment.amount
      amount = parseFloat(createAmount.value || 0) / 100 // API отдает в копейках (350000 = 3500)
      currency = createAmount.currency || 'TRY'
    }
    
    // Фолбэк на старые поля (для обратной совместимости)
    if (amount === 0) {
      amount = parseFloat(
        operation.operation_amount ||
        operation.payment_info?.amount ||
        operation.amount ||
        operation.transactionAmount ||
        0
      )
    }
    
    // Валюта - фолбэк
    if (currency === 'TRY' && operation.operation_currency) {
      currency = operation.operation_currency
    }
    
    if (index < 3) {
      console.log(`💰 Amount extraction for operation ${index + 1}:`, {
        card_start_amount: operation.card_start?.[0]?.amount,
        create_params_amount: operation.create_params?.params?.payment?.amount?.value,
        final_amount: amount,
        currency: currency
      })
    }
    
    // Улучшенное определение типа операции из разных источников
    const operationMethod = operation.create_params?.method || ''
    
    // Проверяем разные источники направления транзакции
    let isDeposit = false
    let isWithdraw = false
    let transactionDirection = 'unknown'
    
    // Источник 1: create_params.method
    if (operationMethod === 'payment.in') {
      isDeposit = true
      transactionDirection = 'deposit'
    } else if (operationMethod === 'payment.out') {
      isWithdraw = true
      transactionDirection = 'withdraw'
    }
    
    // Источник 2: operation_type (если есть)
    if (!isDeposit && !isWithdraw && operation.operation_type) {
      const opType = operation.operation_type.toLowerCase()
      if (opType.includes('deposit') || opType.includes('in') || opType.includes('пополнение')) {
        isDeposit = true
        transactionDirection = 'deposit'
      } else if (opType.includes('withdraw') || opType.includes('out') || opType.includes('вывод')) {
        isWithdraw = true  
        transactionDirection = 'withdraw'
      }
    }
    
    // Источник 3: transaction_type (если есть)
    if (!isDeposit && !isWithdraw && operation.transaction_type) {
      const txType = operation.transaction_type.toLowerCase()
      if (txType.includes('deposit') || txType.includes('in') || txType.includes('пополнение')) {
        isDeposit = true
        transactionDirection = 'deposit'
      } else if (txType.includes('withdraw') || txType.includes('out') || txType.includes('вывод')) {
        isWithdraw = true
        transactionDirection = 'withdraw'  
      }
    }
    
    // Источник 4: payment_info.direction (если есть)
    if (!isDeposit && !isWithdraw && operation.payment_info?.direction) {
      const direction = operation.payment_info.direction.toLowerCase()
      if (direction === 'in' || direction === 'deposit') {
        isDeposit = true
        transactionDirection = 'deposit'
      } else if (direction === 'out' || direction === 'withdraw') {
        isWithdraw = true
        transactionDirection = 'withdraw'
      }
    }
    
    // Источник 5: Прямое поле direction (если есть) 
    if (!isDeposit && !isWithdraw && operation.direction) {
      const direction = operation.direction.toLowerCase()
      if (direction === 'in' || direction === 'deposit' || direction === 'incoming') {
        isDeposit = true
        transactionDirection = 'deposit'
      } else if (direction === 'out' || direction === 'withdraw' || direction === 'outgoing') {
        isWithdraw = true
        transactionDirection = 'withdraw'
      }
    }
    
    // Источник 6: Поле flow (если есть)
    if (!isDeposit && !isWithdraw && operation.flow) {
      const flow = operation.flow.toLowerCase()
      if (flow === 'in' || flow === 'deposit' || flow === 'incoming') {
        isDeposit = true
        transactionDirection = 'deposit'
      } else if (flow === 'out' || flow === 'withdraw' || flow === 'outgoing') {
        isWithdraw = true
        transactionDirection = 'withdraw'
      }
    }
    
    // Источник 7: Анализ суммы (положительная/отрицательная) - последний ресурс
    if (!isDeposit && !isWithdraw && amount !== 0) {
      if (amount > 0) {
        // Положительная сумма обычно означает пополнение
        isDeposit = true
        transactionDirection = 'deposit'
      } else if (amount < 0) {
        // Отрицательная сумма обычно означает вывод
        isWithdraw = true
        transactionDirection = 'withdraw'
        amount = Math.abs(amount) // Делаем сумму положительной для отображения
      }
    }
    
    // Определяем тип платежа из доступных данных
    const paymentMethod = operation.payment_method_code || operation.payment_method || operation.payment_info?.method || 'unknown'
    const paymentMethodType = operation.payment_method_type || 'fiat'
    const isCrypto = paymentMethodType === 'crypto' || 
                    paymentMethod.toLowerCase().includes('crypto') || 
                    paymentMethod.toLowerCase().includes('bitcoin') ||
                    paymentMethod.toLowerCase().includes('ethereum')
    const isFiat = !isCrypto
    
    if (index < 3) {
      console.log(`🏦 Transaction type for operation ${index + 1}:`, {
        // Доступные поля для определения направления
        'create_params.method': operationMethod,
        'operation_type': operation.operation_type,
        'transaction_type': operation.transaction_type,
        'payment_info.direction': operation.payment_info?.direction,
        'direction': operation.direction,
        'flow': operation.flow,
        'amount': amount,
        
        // Итоговое определение
        transactionDirection: transactionDirection,
        isDeposit: isDeposit,
        isWithdraw: isWithdraw,
        
        // Дополнительные поля
        paymentMethod: paymentMethod,
        paymentMethodType: paymentMethodType,
        isCrypto: isCrypto
      })
    }
    
    // Определяем реальный статус операции - используем current_status из реальной структуры API
    const rawStatus = operation.current_status || operation.payment_status || operation.operation_status || operation.status || 'unknown'
    const normalizedStatus = rawStatus.toLowerCase()
    
    if (index < 3) {
      console.log(`📊 Status extraction for operation ${index + 1}:`, {
        current_status: operation.current_status,
        payment_status: operation.payment_status,
        operation_status: operation.operation_status,
        final_status: rawStatus
      })
    }
    
    // Логика определения статуса - адаптируем под разные форматы
    const isSuccessful = normalizedStatus === 'success' || 
                        normalizedStatus === 'completed' || 
                        normalizedStatus === 'complete'
    
    const result = {
      // Базовые поля (совместимые с существующей системой)
      id: operation.operation_id || operation.id,
      status: rawStatus,
      amount: amount,
      currency: currency,
      fee: fee,
      feeRatio: fee > 0 && amount > 0 ? `${((fee / amount) * 100).toFixed(2)}%` : '0%',
      
      // Тип операции с улучшенным определением
      type: transactionDirection,
      isDeposit: isDeposit,
      isWithdraw: isWithdraw,
      transactionType: isDeposit ? 'Пополнение' : (isWithdraw ? 'Вывод' : 'Неизвестно'),
      
      // Метаданные для отладки направления транзакции
      directionSources: {
        'create_params.method': operationMethod,
        'operation_type': operation.operation_type || null,
        'transaction_type': operation.transaction_type || null,
        'payment_info.direction': operation.payment_info?.direction || null,
        'direction': operation.direction || null,
        'flow': operation.flow || null,
        'determined_direction': transactionDirection,
        'detection_success': transactionDirection !== 'unknown'
      },
      
      // Расширенные поля из реального API
      referenceId: operation.reference_id || operation.operation_id || operation.id,
      clientOperationId: operation.client_operation_id || operation.operation_hash || operation.hash,
      
      // Проект
      project: operation.project || operation.project_name || 'unknown',
      credentialsOwner: operation.credentials_owner || operation.project || 'unknown',
      
      // Пользователь из реальных данных
      userId: operation.user_id || operation.id || 'unknown',
      ipAddress: operation.ip_addr || operation.user_ip || null,
      contact: operation.contact || null,
      
      // Платежная информация из реальной структуры API
      paymentProduct: operation.payment_product || 'api_payment',
      paymentMethodType: operation.payment_method_type || (isCrypto ? 'crypto' : 'fiat'),
      paymentMethodCode: operation.payment_method_code || paymentMethod,
      isCrypto: isCrypto,
      isFiat: isFiat,
      
      // Реальные поля из API структуры
      operationState: operation.operation_state || (isSuccessful ? 'complete' : 'in_process'),
      paymentStatusFlag: operation.payment_status_flag || {
        success: isSuccessful,
        in_process: normalizedStatus === 'in_process' || normalizedStatus === 'processing',
        fail: normalizedStatus === 'fail' || normalizedStatus === 'failed',
        user_input_required: normalizedStatus.includes('input')
      },
      
      // Дополнительные поля из реального API
      service: operation.service || null,
      serviceEnv: operation.service_env || null,
      projectEnv: operation.project_env || null,
      integrationType: operation.integration_type || 'api',
      
      // Информация о карте (если есть)
      cardInfo: operation.payment_info ? {
        cardNumber: operation.payment_info.card_number || null,
        panToken: null,
        paymentMethodId: null,
        paymentSystemId: null,
        paymentMethodName: operation.payment_method || paymentMethod,
        paymentSystemName: null,
      } : null,
      
      // Детали завершения операции
      cardFinishInfo: {
        mccCode: null,
        is3DSecureAttempted: false,
        result: rawStatus
      },
      
      // Валютные курсы (пустые для API)
      rates: {},
      hasRates: false,
      
      // Время из реальной структуры API
      createdAt: operation.operation_created_at || operation.date || new Date().toISOString(),
      modifiedAt: operation.operation_modified_at || operation.operation_updated_at || operation.date || new Date().toISOString(),
      completeCreatedAt: operation.operation_created_at || operation.date || new Date().toISOString(),
      completeModifiedAt: operation.operation_modified_at || operation.operation_updated_at || operation.date || new Date().toISOString(),
      
      // Callback информация
      callbacks: [],
      hasCallbacks: false,
      
      // Вычисляемые поля
      isCompleted: isSuccessful,
      isInProcess: normalizedStatus === 'in_process' || normalizedStatus === 'processing',
      isFailed: normalizedStatus === 'fail' || normalizedStatus === 'failed',
      requiresUserInput: normalizedStatus.includes('input'),
      
      // Форматированные значения
      amountFormatted: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0
      }).format(amount),
      
      feeFormatted: new Intl.NumberFormat('en-US', {
        style: 'currency', 
        currency: currency,
        minimumFractionDigits: 0
      }).format(fee),
      
      // Источник данных
      dataSource: 'enhanced-api'
    }

    if (index < 3) {
      console.log(`✅ Normalized operation ${index + 1}:`, {
        id: result.id,
        status: result.status,
        amount: result.amount,
        isCompleted: result.isCompleted,
        isSuccessful: isSuccessful,
        rawStatus: rawStatus,
        normalizedStatus: normalizedStatus
      })
    }

    return result
  })

  // Статистика направлений транзакций
  const directionStats = normalized.reduce((acc, op) => {
    acc.total++
    if (op.isDeposit) acc.deposits++
    if (op.isWithdraw) acc.withdrawals++
    if (op.type === 'unknown') acc.unknown++
    return acc
  }, { total: 0, deposits: 0, withdrawals: 0, unknown: 0 })

  console.log('🏁 Enhanced normalization complete:', {
    totalOperations: normalized.length,
    successfulCount: normalized.filter(op => op.isCompleted).length,
    statusBreakdown: normalized.reduce((acc, op) => {
      acc[op.status] = (acc[op.status] || 0) + 1
      return acc
    }, {}),
    directionBreakdown: {
      deposits: directionStats.deposits,
      withdrawals: directionStats.withdrawals,
      unknown: directionStats.unknown,
      detectionRate: ((directionStats.deposits + directionStats.withdrawals) / directionStats.total * 100).toFixed(1) + '%'
    }
  })

  return normalized
}

// Нормализация пользовательских данных  
function normalizeUserData(data) {
  // Будет реализовано после изучения документации
  return data
}

// Нормализация географических данных
function normalizeGeographyData(data) {
  // Будет реализовано после изучения документации
  return data
}

export default EnhancedCollectorAPI 