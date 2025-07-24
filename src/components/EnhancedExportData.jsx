import React, { useState } from 'react'
import { Download, FileText, Table, Image, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

const EnhancedExportData = ({ data, metrics, fileName = 'analytics-data', isServerData = false, jobId = null }) => {
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState('')
  const [exportProgress, setExportProgress] = useState(0)

  // Функция для экспорта в CSV
  const exportToCSV = async () => {
    try {
      setIsExporting(true)
      setExportStatus('Подготовка CSV файла...')
      setExportProgress(10)

      if (data.length === 0) {
        throw new Error('Нет данных для экспорта')
      }

      // Получаем заголовки из первой записи
      const headers = Object.keys(data[0])
      setExportProgress(30)

      // Создаем CSV контент
      let csvContent = headers.join(',') + '\n'
      
      // Обрабатываем данные порциями для больших файлов
      const chunkSize = 1000
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize)
        const chunkContent = chunk.map(row => 
          headers.map(header => {
            const value = row[header]
            // Экранируем запятые и кавычки
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value || ''
          }).join(',')
        ).join('\n')
        
        csvContent += chunkContent
        if (i + chunkSize < data.length) csvContent += '\n'
        
        // Обновляем прогресс
        const progress = 30 + ((i + chunkSize) / data.length) * 60
        setExportProgress(Math.min(progress, 90))
        setExportStatus(`Обработано ${Math.min(i + chunkSize, data.length)} из ${data.length} записей...`)
        
        // Даем браузеру время на обновление UI
        await new Promise(resolve => setTimeout(resolve, 10))
      }

      setExportProgress(95)
      setExportStatus('Создание файла...')

      // Создаем и скачиваем файл
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${fileName}.csv`
      link.click()
      
      setExportProgress(100)
      setExportStatus('Экспорт завершен!')
      
      setTimeout(() => {
        setIsExporting(false)
        setExportStatus('')
        setExportProgress(0)
      }, 2000)

    } catch (error) {
      console.error('Ошибка экспорта CSV:', error)
      setExportStatus(`Ошибка: ${error.message}`)
      setTimeout(() => {
        setIsExporting(false)
        setExportStatus('')
        setExportProgress(0)
      }, 3000)
    }
  }

  // Функция для экспорта в JSON
  const exportToJSON = async () => {
    try {
      setIsExporting(true)
      setExportStatus('Подготовка JSON файла...')
      setExportProgress(10)

      if (data.length === 0) {
        throw new Error('Нет данных для экспорта')
      }

      setExportProgress(50)
      setExportStatus('Сериализация данных...')

      const exportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          totalRecords: data.length,
          fileName: fileName,
          isServerData: isServerData,
          jobId: jobId,
          metrics: metrics
        },
        data: data
      }

      setExportProgress(80)
      setExportStatus('Создание файла...')

      const jsonString = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${fileName}.json`
      link.click()

      setExportProgress(100)
      setExportStatus('Экспорт завершен!')
      
      setTimeout(() => {
        setIsExporting(false)
        setExportStatus('')
        setExportProgress(0)
      }, 2000)

    } catch (error) {
      console.error('Ошибка экспорта JSON:', error)
      setExportStatus(`Ошибка: ${error.message}`)
      setTimeout(() => {
        setIsExporting(false)
        setExportStatus('')
        setExportProgress(0)
      }, 3000)
    }
  }

  // Функция для экспорта отчета с метриками
  const exportReport = async () => {
    try {
      setIsExporting(true)
      setExportStatus('Создание отчета...')
      setExportProgress(10)

      if (!metrics) {
        throw new Error('Нет метрик для создания отчета')
      }

      setExportProgress(30)

      // Создаем HTML отчет
      const reportHTML = `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Аналитический отчет - ${fileName}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e0e0e0; padding-bottom: 20px; }
        .header h1 { color: #2c3e50; margin: 0; font-size: 2.5em; }
        .header p { color: #7f8c8d; margin: 10px 0 0 0; font-size: 1.1em; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0; }
        .metric-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; }
        .metric-card h3 { margin: 0 0 10px 0; font-size: 1.2em; opacity: 0.9; }
        .metric-card .value { font-size: 2.5em; font-weight: bold; margin: 10px 0; }
        .metric-card .change { font-size: 0.9em; opacity: 0.8; }
        .section { margin: 30px 0; }
        .section h2 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        .summary-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .summary-table th, .summary-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e0e0e0; }
        .summary-table th { background: #f8f9fa; font-weight: 600; color: #2c3e50; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #7f8c8d; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Аналитический отчет</h1>
            <p>Сгенерирован: ${new Date().toLocaleString('ru-RU')}</p>
            <p>Файл: ${fileName} • Записей: ${data.length}</p>
            ${isServerData ? '<p style="color: #9b59b6;">🚀 Обработано на сервере</p>' : ''}
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <h3>Всего операций</h3>
                <div class="value">${metrics.total?.toLocaleString() || 'N/A'}</div>
            </div>
            <div class="metric-card">
                <h3>Успешных</h3>
                <div class="value">${metrics.successful?.toLocaleString() || 'N/A'}</div>
                <div class="change">${metrics.conversionRate ? `${metrics.conversionRate.toFixed(1)}%` : 'N/A'}</div>
            </div>
            <div class="metric-card">
                <h3>Неуспешных</h3>
                <div class="value">${metrics.failed?.toLocaleString() || 'N/A'}</div>
            </div>
            <div class="metric-card">
                <h3>Общий доход</h3>
                <div class="value">${metrics.successfulRevenue ? `${metrics.successfulRevenue.toLocaleString()} ${metrics.currency || ''}` : 'N/A'}</div>
            </div>
        </div>

        <div class="section">
            <h2>📈 Сводная информация</h2>
            <table class="summary-table">
                <tr><th>Параметр</th><th>Значение</th></tr>
                <tr><td>Общее количество операций</td><td>${metrics.total?.toLocaleString() || 'N/A'}</td></tr>
                <tr><td>Успешные операции</td><td>${metrics.successful?.toLocaleString() || 'N/A'}</td></tr>
                <tr><td>Неуспешные операции</td><td>${metrics.failed?.toLocaleString() || 'N/A'}</td></tr>
                <tr><td>Отмененные операции</td><td>${metrics.canceled?.toLocaleString() || 'N/A'}</td></tr>
                <tr><td>Конверсия</td><td>${metrics.conversionRate ? `${metrics.conversionRate.toFixed(2)}%` : 'N/A'}</td></tr>
                <tr><td>Успешный доход</td><td>${metrics.successfulRevenue ? `${metrics.successfulRevenue.toLocaleString()} ${metrics.currency || ''}` : 'N/A'}</td></tr>
                <tr><td>Потерянный доход</td><td>${metrics.lostRevenue ? `${metrics.lostRevenue.toLocaleString()} ${metrics.currency || ''}` : 'N/A'}</td></tr>
                <tr><td>Средняя сумма операции</td><td>${metrics.averageAmount ? `${metrics.averageAmount.toFixed(2)} ${metrics.currency || ''}` : 'N/A'}</td></tr>
                <tr><td>Провайдер</td><td>${metrics.provider || 'N/A'}</td></tr>
                <tr><td>Валюта</td><td>${metrics.currency || 'N/A'}</td></tr>
            </table>
        </div>

        <div class="footer">
            <p>Этот отчет создан автоматически системой аналитики финансовых операций</p>
            ${jobId ? `<p>ID задачи: ${jobId}</p>` : ''}
        </div>
    </div>
</body>
</html>`

      setExportProgress(90)
      setExportStatus('Сохранение отчета...')

      const blob = new Blob([reportHTML], { type: 'text/html' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${fileName}-report.html`
      link.click()

      setExportProgress(100)
      setExportStatus('Отчет создан!')
      
      setTimeout(() => {
        setIsExporting(false)
        setExportStatus('')
        setExportProgress(0)
      }, 2000)

    } catch (error) {
      console.error('Ошибка создания отчета:', error)
      setExportStatus(`Ошибка: ${error.message}`)
      setTimeout(() => {
        setIsExporting(false)
        setExportStatus('')
        setExportProgress(0)
      }, 3000)
    }
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
      <div className="flex items-center space-x-3 mb-6">
        <Download className="h-6 w-6 text-white/70" />
        <div>
          <h3 className="text-lg font-semibold text-white">Экспорт данных</h3>
          <p className="text-white/60 text-sm">
            Экспортируйте данные в различных форматах
            {isServerData && <span className="ml-2 text-purple-300">(серверные данные)</span>}
          </p>
        </div>
      </div>

      {/* Прогресс экспорта */}
      {isExporting && (
        <div className="mb-6 p-4 bg-white/10 rounded-lg border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">{exportStatus}</span>
            <span className="text-white/70">{exportProgress}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${exportProgress}%` }}
            />
          </div>
          {exportProgress === 100 && (
            <div className="flex items-center justify-center mt-3 text-green-400">
              <CheckCircle2 className="h-5 w-5 mr-2" />
              <span>Экспорт завершен успешно!</span>
            </div>
          )}
        </div>
      )}

      {/* Кнопки экспорта */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CSV экспорт */}
        <button
          onClick={exportToCSV}
          disabled={isExporting || data.length === 0}
          className="flex flex-col items-center p-6 bg-white/10 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-500/30 transition-colors">
            {isExporting ? (
              <Loader2 className="h-6 w-6 text-green-400 animate-spin" />
            ) : (
              <Table className="h-6 w-6 text-green-400" />
            )}
          </div>
          <h4 className="text-white font-medium mb-1">CSV файл</h4>
          <p className="text-white/60 text-sm text-center">
            Экспорт в Excel-совместимом формате
          </p>
          <div className="mt-2 text-xs text-white/40">
            {data.length.toLocaleString()} записей
          </div>
        </button>

        {/* JSON экспорт */}
        <button
          onClick={exportToJSON}
          disabled={isExporting || data.length === 0}
          className="flex flex-col items-center p-6 bg-white/10 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-500/30 transition-colors">
            {isExporting ? (
              <Loader2 className="h-6 w-6 text-blue-400 animate-spin" />
            ) : (
              <FileText className="h-6 w-6 text-blue-400" />
            )}
          </div>
          <h4 className="text-white font-medium mb-1">JSON файл</h4>
          <p className="text-white/60 text-sm text-center">
            Структурированные данные с метаданными
          </p>
          <div className="mt-2 text-xs text-white/40">
            Включает метрики
          </div>
        </button>

        {/* HTML отчет */}
        <button
          onClick={exportReport}
          disabled={isExporting || !metrics}
          className="flex flex-col items-center p-6 bg-white/10 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-3 group-hover:bg-purple-500/30 transition-colors">
            {isExporting ? (
              <Loader2 className="h-6 w-6 text-purple-400 animate-spin" />
            ) : (
              <Image className="h-6 w-6 text-purple-400" />
            )}
          </div>
          <h4 className="text-white font-medium mb-1">HTML отчет</h4>
          <p className="text-white/60 text-sm text-center">
            Красивый отчет с графиками и метриками
          </p>
          <div className="mt-2 text-xs text-white/40">
            Готов к печати
          </div>
        </button>
      </div>

      {/* Информация о размере данных */}
      <div className="mt-6 p-4 bg-white/5 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <AlertCircle className="h-4 w-4 text-yellow-400" />
          <span className="text-white/70 text-sm font-medium">Информация об экспорте:</span>
        </div>
        <ul className="text-white/60 text-sm space-y-1">
          <li>• Записей для экспорта: {data.length.toLocaleString()}</li>
          <li>• Приблизительный размер CSV: {Math.round(data.length * 0.5)} KB</li>
          <li>• Большие файлы обрабатываются порциями для стабильности</li>
          {isServerData && <li>• Данные получены с сервера и готовы к экспорту</li>}
        </ul>
      </div>
    </div>
  )
}

export default EnhancedExportData 