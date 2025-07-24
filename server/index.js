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
    currency: provider === 'payshack' ? 'INR' : 'TRY'
  }
}

// Анализ по времени
function analyzeByTime(data) {
  const hourlyStats = {}
  const dailyStats = {}
  
  data.forEach(row => {
    if (row.createdAt) {
      try {
        const date = new Date(row.createdAt)
        const hour = date.getHours()
        const day = date.toISOString().split('T')[0]
        
        // Почасовая статистика
        if (!hourlyStats[hour]) {
          hourlyStats[hour] = { count: 0, revenue: 0 }
        }
        hourlyStats[hour].count++
        hourlyStats[hour].revenue += row.amount
        
        // Дневная статистика
        if (!dailyStats[day]) {
          dailyStats[day] = { count: 0, revenue: 0 }
        }
        dailyStats[day].count++
        dailyStats[day].revenue += row.amount
      } catch (e) {
        // Игнорируем неправильные даты
      }
    }
  })
  
  return { hourlyStats, dailyStats }
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

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Analytics API сервер запущен на порту ${PORT}`)
  console.log(`🔌 WebSocket сервер запущен на порту 8080`)
  console.log(`📊 Готов к обработке больших CSV файлов!`)
}) 