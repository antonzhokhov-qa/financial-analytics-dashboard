const express = require('express')
const multer = require('multer')
const cors = require('cors')
const csv = require('csv-parser')
const fs = require('fs')
const path = require('path')
const { Worker } = require('worker_threads')
const WebSocket = require('ws')

const app = express()
const PORT = process.env.PORT || 3002

// Middleware
app.use(cors())
app.use(express.json())

// WebSocket сервер для прогресса
const wss = new WebSocket.Server({ port: 8080 })

// Хранилище активных задач
const jobs = new Map()

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`
    cb(null, uniqueName)
  }
})

const upload = multer({ 
  storage,
  limits: { 
    fileSize: 100 * 1024 * 1024 // 100MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.toLowerCase().endsWith('.csv')) {
      cb(null, true)
    } else {
      cb(new Error('Только CSV файлы разрешены'))
    }
  }
})

// Утилита для генерации ID задач
function generateJobId() {
  return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Функция для отправки прогресса через WebSocket
function broadcastProgress(jobId, progress) {
  const message = JSON.stringify({ jobId, progress })
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message)
    }
  })
}

// API endpoint для загрузки и обработки CSV
app.post('/api/analytics/upload', upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не загружен' })
    }

    const { provider = 'optipay' } = req.body
    const jobId = generateJobId()
    const filePath = req.file.path

    console.log(`🚀 Новая задача: ${jobId}, файл: ${req.file.originalname}, провайдер: ${provider}`)

    // Создаем запись о задаче
    jobs.set(jobId, {
      id: jobId,
      status: 'processing',
      fileName: req.file.originalname,
      fileSize: req.file.size,
      provider,
      startTime: new Date(),
      progress: 0,
      stage: 'Подготовка к обработке...'
    })

    // Отправляем немедленный ответ с ID задачи
    res.json({
      jobId,
      status: 'processing',
      message: 'Файл загружен, начинается обработка'
    })

    // Запускаем обработку в фоне
    processCSVFile(jobId, filePath, provider)

  } catch (error) {
    console.error('❌ Ошибка загрузки:', error)
    res.status(500).json({ error: error.message })
  }
})

// API endpoint для получения статуса задачи
app.get('/api/analytics/job/:jobId/status', (req, res) => {
  const { jobId } = req.params
  const job = jobs.get(jobId)

  if (!job) {
    return res.status(404).json({ error: 'Задача не найдена' })
  }

  res.json(job)
})

// API endpoint для получения результатов
app.get('/api/analytics/job/:jobId/results', (req, res) => {
  const { jobId } = req.params
  const { page = 1, limit = 100 } = req.query
  
  const job = jobs.get(jobId)
  if (!job || job.status !== 'completed') {
    return res.status(404).json({ error: 'Результаты не готовы' })
  }

  // Пагинация результатов
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + parseInt(limit)
  
  const paginatedData = job.results.data.slice(startIndex, endIndex)
  
  res.json({
    data: paginatedData,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: job.results.data.length,
      totalPages: Math.ceil(job.results.data.length / limit)
    },
    metrics: job.results.metrics,
    processingTime: job.processingTime
  })
})

// Функция обработки CSV файла
async function processCSVFile(jobId, filePath, provider) {
  const job = jobs.get(jobId)
  
  try {
    broadcastProgress(jobId, { stage: 'Чтение файла...', progress: 10 })
    job.stage = 'Чтение файла...'
    job.progress = 10

    // Подсчитываем общее количество строк для прогресса
    const totalLines = await countLines(filePath)
    console.log(`📊 Общее количество строк: ${totalLines}`)

    broadcastProgress(jobId, { stage: 'Парсинг данных...', progress: 20 })
    job.stage = 'Парсинг данных...'
    job.progress = 20

    const data = []
    let processedLines = 0

    // Потоковое чтение CSV
    const stream = fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Нормализуем данные в зависимости от провайдера
        const normalizedRow = normalizeDataRow(row, provider)
        data.push(normalizedRow)
        
        processedLines++
        
        // Обновляем прогресс каждые 1000 строк
        if (processedLines % 1000 === 0) {
          const progress = Math.min(20 + (processedLines / totalLines) * 60, 80)
          broadcastProgress(jobId, { 
            stage: `Обработано ${processedLines} из ${totalLines} записей...`, 
            progress 
          })
          job.progress = progress
          job.stage = `Обработано ${processedLines} из ${totalLines} записей...`
        }
      })
      .on('end', async () => {
        console.log(`✅ Парсинг завершен: ${data.length} записей`)
        
        broadcastProgress(jobId, { stage: 'Вычисление аналитики...', progress: 85 })
        job.stage = 'Вычисление аналитики...'
        job.progress = 85

        // Вычисляем метрики
        const metrics = calculateAdvancedMetrics(data, provider)
        
        broadcastProgress(jobId, { stage: 'Завершение...', progress: 95 })
        job.stage = 'Завершение...'
        job.progress = 95

        // Сохраняем результаты
        job.status = 'completed'
        job.progress = 100
        job.stage = 'Готово'
        job.endTime = new Date()
        job.processingTime = job.endTime - job.startTime
        job.results = {
          data,
          metrics,
          totalRecords: data.length
        }

        broadcastProgress(jobId, { 
          stage: 'Готово!', 
          progress: 100,
          completed: true,
          metrics: metrics
        })

        // Очищаем файл через час
        setTimeout(() => {
          fs.unlink(filePath, (err) => {
            if (err) console.error('Ошибка удаления файла:', err)
            else console.log(`🗑️ Файл удален: ${filePath}`)
          })
        }, 60 * 60 * 1000)

        console.log(`🎉 Задача ${jobId} завершена за ${job.processingTime}мс`)
      })
      .on('error', (error) => {
        console.error(`❌ Ошибка обработки ${jobId}:`, error)
        job.status = 'failed'
        job.error = error.message
        broadcastProgress(jobId, { 
          stage: 'Ошибка обработки', 
          progress: 0, 
          error: error.message 
        })
      })

  } catch (error) {
    console.error(`❌ Критическая ошибка ${jobId}:`, error)
    job.status = 'failed'
    job.error = error.message
    broadcastProgress(jobId, { 
      stage: 'Критическая ошибка', 
      progress: 0, 
      error: error.message 
    })
  }
}

// Утилита для подсчета строк в файле
function countLines(filePath) {
  return new Promise((resolve, reject) => {
    let lineCount = 0
    fs.createReadStream(filePath)
      .on('data', (buffer) => {
        let idx = -1
        lineCount-- // Because the loop will run once for idx=-1
        do {
          idx = buffer.indexOf(10, idx + 1)
          lineCount++
        } while (idx !== -1)
      })
      .on('end', () => resolve(lineCount))
      .on('error', reject)
  })
}

// Нормализация данных по провайдеру
function normalizeDataRow(row, provider) {
  const cleanRow = {}
  
  // Очищаем BOM символы из ключей
  Object.keys(row).forEach(key => {
    const cleanKey = key.replace(/^\uFEFF/, '').trim()
    cleanRow[cleanKey] = row[key]
  })

  if (provider === 'payshack') {
    return {
      trackingId: cleanRow['Transaction Id'] || cleanRow['Order Id'] || '',
      status: cleanRow['Status'] || '',
      amount: parseFloat(cleanRow['Amount']) || 0,
      createdAt: cleanRow['Created Date'] || '',
      paymentMethod: cleanRow['Payment Method'] || '',
      currency: 'INR',
      provider: 'payshack',
      originalData: cleanRow
    }
  } else {
    // Optipay формат
    return {
      trackingId: cleanRow['Tracking Id'] || '',
      status: cleanRow['Status'] || '',
      amount: parseFloat(cleanRow['Amount']) || 0,
      createdAt: cleanRow['Creation time'] || '',
      paymentMethod: cleanRow['Payment method'] || '',
      company: cleanRow['Company'] || '',
      currency: 'TRY',
      provider: 'optipay',
      originalData: cleanRow
    }
  }
}

// Расширенные метрики
function calculateAdvancedMetrics(data, provider) {
  const total = data.length
  
  // Функции для определения статусов
  const isSuccessful = (row) => {
    const status = row.status.toLowerCase()
    return provider === 'payshack' ? status === 'success' : status === 'completed'
  }
  
  const isFailed = (row) => {
    const status = row.status.toLowerCase()
    return provider === 'payshack' ? status === 'failed' : status === 'failed'
  }
  
  const isPending = (row) => {
    const status = row.status.toLowerCase()
    return provider === 'payshack' ? 
      (status === 'initiated' || status === 'pending') : 
      (status === 'in progress' || status === 'pending')
  }

  const successful = data.filter(isSuccessful).length
  const failed = data.filter(isFailed).length
  const pending = data.filter(isPending).length
  const canceled = data.filter(row => row.status.toLowerCase() === 'canceled').length

  const successfulRevenue = data.filter(isSuccessful)
    .reduce((sum, row) => sum + row.amount, 0)
  
  const totalRevenue = data.reduce((sum, row) => sum + row.amount, 0)
  
  const conversionRate = total > 0 ? (successful / total) * 100 : 0

  // Анализ по времени
  const timeAnalysis = analyzeByTime(data)
  
  // Анализ по методам оплаты
  const paymentMethodStats = analyzeByPaymentMethod(data, isSuccessful, isFailed, isPending)
  
  // Анализ по компаниям (только для Optipay)
  const companyStats = provider === 'optipay' ? analyzeByCompany(data, isSuccessful, isFailed, isPending) : {}

  return {
    total,
    successful,
    failed,
    pending,
    canceled,
    conversionRate,
    successfulRevenue,
    totalRevenue,
    averageAmount: total > 0 ? totalRevenue / total : 0,
    provider,
    timeAnalysis,
    paymentMethodStats,
    companyStats,
    currency: provider === 'payshack' ? 'INR' : 'TRY'
  }
}

// Анализ по времени
function analyzeByTime(data) {
  const hourlyStats = {}
  const dailyStats = {}
  const weeklyStats = {}
  const monthlyStats = {}
  
  // Инициализируем часы
  for (let i = 0; i < 24; i++) {
    hourlyStats[i] = { count: 0, revenue: 0, successful: 0, failed: 0, pending: 0 }
  }
  
  data.forEach(row => {
    if (row.createdAt) {
      try {
        const date = new Date(row.createdAt)
        const hour = date.getHours()
        const day = date.toISOString().split('T')[0]
        const week = getWeekNumber(date)
        const month = date.toISOString().substring(0, 7) // YYYY-MM
        const dayOfWeek = date.getDay() // 0 = Sunday, 1 = Monday, etc.
        
        // Почасовая статистика
        hourlyStats[hour].count++
        hourlyStats[hour].revenue += row.amount
        
        // Статистика по статусам
        const status = row.status.toLowerCase()
        if (status === 'success' || status === 'completed') {
          hourlyStats[hour].successful++
        } else if (status === 'failed') {
          hourlyStats[hour].failed++
        } else if (status === 'initiated' || status === 'pending' || status === 'in progress') {
          hourlyStats[hour].pending++
        }
        
        // Дневная статистика
        if (!dailyStats[day]) {
          dailyStats[day] = { count: 0, revenue: 0, successful: 0, failed: 0, pending: 0, dayOfWeek }
        }
        dailyStats[day].count++
        dailyStats[day].revenue += row.amount
        
        if (status === 'success' || status === 'completed') {
          dailyStats[day].successful++
        } else if (status === 'failed') {
          dailyStats[day].failed++
        } else if (status === 'initiated' || status === 'pending' || status === 'in progress') {
          dailyStats[day].pending++
        }
        
        // Недельная статистика
        if (!weeklyStats[week]) {
          weeklyStats[week] = { count: 0, revenue: 0, successful: 0, failed: 0, pending: 0 }
        }
        weeklyStats[week].count++
        weeklyStats[week].revenue += row.amount
        
        if (status === 'success' || status === 'completed') {
          weeklyStats[week].successful++
        } else if (status === 'failed') {
          weeklyStats[week].failed++
        } else if (status === 'initiated' || status === 'pending' || status === 'in progress') {
          weeklyStats[week].pending++
        }
        
        // Месячная статистика
        if (!monthlyStats[month]) {
          monthlyStats[month] = { count: 0, revenue: 0, successful: 0, failed: 0, pending: 0 }
        }
        monthlyStats[month].count++
        monthlyStats[month].revenue += row.amount
        
        if (status === 'success' || status === 'completed') {
          monthlyStats[month].successful++
        } else if (status === 'failed') {
          monthlyStats[month].failed++
        } else if (status === 'initiated' || status === 'pending' || status === 'in progress') {
          monthlyStats[month].pending++
        }
        
      } catch (e) {
        // Игнорируем неправильные даты
      }
    }
  })
  
  // Вычисляем пиковые часы и дни
  const peakHour = Object.entries(hourlyStats)
    .sort(([,a], [,b]) => b.count - a.count)[0]
  
  const peakDay = Object.entries(dailyStats)
    .sort(([,a], [,b]) => b.count - a.count)[0]
  
  return { 
    hourlyStats, 
    dailyStats, 
    weeklyStats, 
    monthlyStats,
    insights: {
      peakHour: peakHour ? { hour: parseInt(peakHour[0]), ...peakHour[1] } : null,
      peakDay: peakDay ? { date: peakDay[0], ...peakDay[1] } : null,
      totalDays: Object.keys(dailyStats).length,
      averageDailyTransactions: Object.keys(dailyStats).length > 0 ? 
        Object.values(dailyStats).reduce((sum, day) => sum + day.count, 0) / Object.keys(dailyStats).length : 0
    }
  }
}

// Утилита для получения номера недели
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}

// Анализ по методам оплаты
function analyzeByPaymentMethod(data, isSuccessful, isFailed, isPending) {
  const stats = {}
  
  data.forEach(row => {
    const method = row.paymentMethod || 'Unknown'
    if (!stats[method]) {
      stats[method] = { total: 0, successful: 0, failed: 0, pending: 0, revenue: 0 }
    }
    
    stats[method].total++
    stats[method].revenue += row.amount
    
    if (isSuccessful(row)) stats[method].successful++
    else if (isFailed(row)) stats[method].failed++
    else if (isPending(row)) stats[method].pending++
  })
  
  return stats
}

// Анализ по компаниям (для Optipay)
function analyzeByCompany(data, isSuccessful, isFailed, isPending) {
  const stats = {}
  
  data.forEach(row => {
    const company = row.originalData?.Company || row.company || 'Unknown'
    if (!stats[company]) {
      stats[company] = { total: 0, successful: 0, failed: 0, pending: 0, revenue: 0, completed: 0 }
    }
    
    stats[company].total++
    stats[company].revenue += row.amount
    
    if (isSuccessful(row)) {
      stats[company].successful++
      stats[company].completed++
    } else if (isFailed(row)) {
      stats[company].failed++
    } else if (isPending(row)) {
      stats[company].pending++
    }
  })
  
  return stats
}

// WebSocket обработка подключений
wss.on('connection', (ws) => {
  console.log('🔌 WebSocket клиент подключен')
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message)
      if (data.type === 'subscribe' && data.jobId) {
        ws.jobId = data.jobId
        console.log(`📡 Клиент подписался на задачу: ${data.jobId}`)
      }
    } catch (e) {
      console.error('Ошибка обработки WebSocket сообщения:', e)
    }
  })
  
  ws.on('close', () => {
    console.log('🔌 WebSocket клиент отключен')
  })
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    activeJobs: jobs.size 
  })
})

// Универсальный endpoint для обработки CSV файлов
app.post('/api/process', upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'CSV файл не предоставлен' })
    }

    const { provider = 'optipay', mode = 'auto' } = req.body
    const filePath = req.file.path
    const fileSizeMB = req.file.size / (1024 * 1024)
    
    console.log(`📁 Получен файл: ${req.file.originalname}`)
    console.log(`📊 Размер файла: ${fileSizeMB.toFixed(2)}MB`)
    console.log(`🏪 Провайдер: ${provider}`)
    console.log(`⚙️ Режим: ${mode}`)

    // Определяем режим обработки
    let processingMode = mode
    if (mode === 'auto') {
      processingMode = fileSizeMB > 5 ? 'server' : 'client'
      console.log(`🎯 Автоматически выбран режим: ${processingMode}`)
    }

    if (processingMode === 'server' || fileSizeMB > 10) {
      // Серверная обработка для больших файлов
      const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
      console.log(`🚀 Запуск серверной обработки, jobId: ${jobId}`)

      // Создаем задачу
      jobs.set(jobId, {
        status: 'processing',
        progress: 0,
        startTime: Date.now(),
        fileName: req.file.originalname,
        provider: provider
      })

      // Запускаем обработку в worker thread
      const worker = new Worker(path.join(__dirname, 'csvWorker.js'), {
        workerData: { filePath, provider, jobId }
      })

      worker.on('message', (message) => {
        if (message.type === 'progress') {
          const job = jobs.get(jobId)
          if (job) {
            job.progress = message.progress
            job.currentStep = message.step
            
            // Отправляем прогресс через WebSocket
            wss.clients.forEach(client => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  jobId,
                  progress: message.progress,
                  step: message.step
                }))
              }
            })
          }
        } else if (message.type === 'complete') {
          const job = jobs.get(jobId)
          if (job) {
            job.status = 'completed'
            job.progress = 100
            job.result = message.result
            job.endTime = Date.now()
            console.log(`✅ Задача ${jobId} завершена за ${job.endTime - job.startTime}мс`)
          }
        } else if (message.type === 'error') {
          const job = jobs.get(jobId)
          if (job) {
            job.status = 'failed'
            job.error = message.error
            job.endTime = Date.now()
            console.error(`❌ Задача ${jobId} завершилась с ошибкой:`, message.error)
          }
        }
      })

      worker.on('error', (error) => {
        const job = jobs.get(jobId)
        if (job) {
          job.status = 'failed'
          job.error = error.message
          job.endTime = Date.now()
        }
        console.error(`❌ Worker error для ${jobId}:`, error)
      })

      // Очищаем файл после обработки
      worker.on('exit', () => {
        setTimeout(() => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
            console.log(`🗑️ Удален временный файл: ${filePath}`)
          }
        }, 5000) // Удаляем через 5 секунд
      })

      res.json({ 
        jobId,
        message: 'Файл принят к обработке',
        mode: 'server',
        estimatedTime: `${Math.ceil(fileSizeMB / 10)} секунд`
      })

    } else {
      // Клиентская обработка для небольших файлов
      console.log(`🖥️ Клиентская обработка файла`)
      
      const csvData = []
      const startTime = Date.now()

      // Читаем и парсим CSV
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => {
            csvData.push(row)
          })
          .on('end', resolve)
          .on('error', reject)
      })

      // Нормализуем данные используя полную нормализацию
      const normalizedData = csvData.map(row => normalizeDataRow(row, provider))

      // Вычисляем полные метрики (как на сервере)
      const metrics = calculateAdvancedMetrics(normalizedData, provider)
      metrics.processingTime = Date.now() - startTime
      metrics.mode = 'client'
      
      console.log(`✅ Клиентская обработка завершена:`, {
        records: normalizedData.length,
        provider: provider,
        successful: metrics.successful,
        failed: metrics.failed,
        revenue: metrics.successfulRevenue
      })

      // Очищаем файл
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }

      res.json({
        success: true,
        data: normalizedData,
        metrics: metrics,
        mode: 'client'
      })
    }

  } catch (error) {
    console.error('❌ Ошибка обработки файла:', error)
    
    // Очищаем файл при ошибке
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }
    
    res.status(500).json({ 
      error: 'Ошибка обработки файла: ' + error.message 
    })
  }
})

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Analytics API сервер запущен на порту ${PORT}`)
  console.log(`🔌 WebSocket сервер запущен на порту 8080`)
  console.log(`📊 Готов к обработке больших CSV файлов!`)
}) 