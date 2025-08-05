/**
 * Сервис для работы с курсами валют
 * Использует exchangerate-api.com (1500 бесплатных запросов/месяц)
 */

class CurrencyService {
  constructor() {
    this.baseUrl = 'https://api.exchangerate-api.com/v4/latest'
    this.cache = new Map()
    this.cacheTimeout = 60 * 60 * 1000 // 1 час кэш
    this.fallbackRates = {
      'EUR': 1.09,    // 1 EUR = 1.09 USD
      'TRY': 0.033,   // 1 TRY = 0.033 USD  
      'INR': 0.012,   // 1 INR = 0.012 USD
      'GBP': 1.27,    // 1 GBP = 1.27 USD
      'RUB': 0.011,   // 1 RUB = 0.011 USD
      'UAH': 0.027,   // 1 UAH = 0.027 USD
      'BRL': 0.20,    // 1 BRL = 0.20 USD
      'PLN': 0.25,    // 1 PLN = 0.25 USD
      'CZK': 0.044    // 1 CZK = 0.044 USD
    }
  }

  /**
   * Получить курс валюты к USD
   * @param {string} currency - Код валюты (EUR, TRY, INR, etc)
   * @returns {Promise<number>} - Курс к USD
   */
  async getUSDRate(currency) {
    if (currency === 'USD') return 1

    const cacheKey = `USD_${currency}`
    const cached = this.cache.get(cacheKey)
    
    // Проверяем кэш
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      console.log(`💰 Используем кэшированный курс ${currency}: ${cached.rate}`)
      return cached.rate
    }

    try {
      console.log(`🌐 Запрашиваем курс ${currency} к USD...`)
      const response = await fetch(`${this.baseUrl}/USD`)
      const data = await response.json()
      
      if (data.rates && data.rates[currency]) {
        const apiRate = data.rates[currency] // Сколько единиц валюты за 1 USD
        const usdRate = 1 / apiRate // Сколько USD за 1 единицу валюты
        
        // Кэшируем результат
        this.cache.set(cacheKey, {
          rate: usdRate,
          timestamp: Date.now()
        })
        
        console.log(`✅ Получен курс ${currency}: 1 ${currency} = ${usdRate.toFixed(4)} USD (API rate: ${apiRate})`)
        return usdRate
      } else {
        console.warn(`⚠️ Курс ${currency} не найден в API, используем fallback`)
        return this.fallbackRates[currency] || 1
      }
    } catch (error) {
      console.error(`❌ Ошибка получения курса ${currency}:`, error)
      
      // Используем fallback курсы
      const fallbackRate = this.fallbackRates[currency] || 1
      console.log(`🔄 Используем резервный курс ${currency}: ${fallbackRate}`)
      return fallbackRate
    }
  }

  /**
   * Конвертировать сумму в USD
   * @param {number} amount - Сумма
   * @param {string} fromCurrency - Исходная валюта
   * @returns {Promise<number>} - Сумма в USD
   */
  async convertToUSD(amount, fromCurrency) {
    if (!amount || amount === 0) return 0
    if (fromCurrency === 'USD') return amount

    const rate = await this.getUSDRate(fromCurrency)
    const usdAmount = amount * rate
    
    console.log(`💱 Конвертация: ${amount} ${fromCurrency} = ${usdAmount.toFixed(2)} USD (курс: ${rate})`)
    return usdAmount
  }

  /**
   * Конвертировать массив операций в USD
   * @param {Array} operations - Массив операций с полями amount и currency
   * @returns {Promise<Array>} - Операции с добавленными USD полями
   */
  async convertOperationsToUSD(operations) {
    console.log(`🔄 Начинаем конвертацию ${operations.length} операций в USD...`)
    
    // Получаем уникальные валюты для оптимизации запросов
    const uniqueCurrencies = [...new Set(operations.map(op => op.currency).filter(Boolean))]
    console.log(`💰 Уникальные валюты для конвертации:`, uniqueCurrencies)
    
    // Предзагружаем все курсы
    const ratesPromises = uniqueCurrencies.map(currency => 
      this.getUSDRate(currency).then(rate => ({ currency, rate }))
    )
    
    const rates = await Promise.all(ratesPromises)
    const ratesMap = rates.reduce((acc, { currency, rate }) => {
      acc[currency] = rate
      return acc
    }, {})
    
    console.log(`📊 Загруженные курсы:`, ratesMap)
    
    // Конвертируем операции
    const convertedOperations = operations.map(operation => {
      const currency = operation.currency || 'USD'
      const amount = parseFloat(operation.amount) || 0
      const rate = ratesMap[currency] || 1
      const usdAmount = currency === 'USD' ? amount : amount * rate
      
      return {
        ...operation,
        usdAmount: usdAmount,
        usdAmountFormatted: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(usdAmount),
        exchangeRate: rate,
        originalAmount: amount
      }
    })
    
    console.log(`✅ Конвертация завершена. Первые 3 операции:`, convertedOperations.slice(0, 3))
    return convertedOperations
  }

  /**
   * Получить информацию о поддерживаемых валютах
   * @returns {Promise<Object>} - Объект с информацией о валютах
   */
  async getSupportedCurrencies() {
    try {
      const response = await fetch(`${this.baseUrl}/USD`)
      const data = await response.json()
      return data.rates || {}
    } catch (error) {
      console.error('Ошибка получения списка валют:', error)
      return this.fallbackRates
    }
  }

  /**
   * Очистить кэш курсов
   */
  clearCache() {
    this.cache.clear()
    console.log('🗑️ Кэш курсов валют очищен')
  }

  /**
   * Получить статистику кэша
   * @returns {Object} - Статистика кэша
   */
  getCacheStats() {
    const now = Date.now()
    const validEntries = Array.from(this.cache.entries()).filter(
      ([key, value]) => (now - value.timestamp) < this.cacheTimeout
    )
    
    return {
      totalEntries: this.cache.size,
      validEntries: validEntries.length,
      expiredEntries: this.cache.size - validEntries.length,
      cacheTimeout: this.cacheTimeout / 1000 / 60 + ' минут'
    }
  }
}

// Создаем единственный экземпляр сервиса
const currencyService = new CurrencyService()

export default currencyService