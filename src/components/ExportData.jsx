import { useState } from 'react'
import { Download, FileText, Table, Image, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardTitle } from './ui/Card'
import { Button } from './ui/Button'

const ExportData = ({ data, metrics, fileName = 'analytics-export' }) => {
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(null)

  // CSV экспорт
  const exportToCSV = () => {
    const headers = [
      'ID', 'Статус', 'Сумма', 'Комиссия', 'Тип', 'Компания', 
      'Пользователь', 'Метод оплаты', 'Дата создания', 'Дата обработки'
    ]
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => [
        row.id || '',
        row.status || '',
        row.amount || 0,
        row.fee || 0,
        row.transactionType || '',
        row.company || '',
        row.fullName || row.userName || '',
        row.paymentMethod || '',
        row.createdAt || '',
        row.processedAt || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${fileName}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  // JSON экспорт
  const exportToJSON = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalRecords: data.length,
      metrics: metrics,
      data: data
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${fileName}.json`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  // PDF экспорт (требует jspdf)
  const exportToPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()

      // Заголовок
      doc.setFontSize(20)
      doc.text('Отчет по операциям', 20, 30)
      
      doc.setFontSize(12)
      doc.text(`Дата экспорта: ${new Date().toLocaleDateString('ru-RU')}`, 20, 45)
      doc.text(`Всего записей: ${data.length}`, 20, 55)

      // Метрики
      if (metrics) {
        doc.setFontSize(16)
        doc.text('Основные метрики:', 20, 75)
        
        doc.setFontSize(12)
        let yPos = 90
        
        if (metrics.totalRevenue) {
          doc.text(`Общий доход: ${new Intl.NumberFormat('tr-TR', {
            style: 'currency', currency: 'TRY'
          }).format(metrics.totalRevenue)}`, 25, yPos)
          yPos += 10
        }
        
        if (metrics.totalTransactions) {
          doc.text(`Всего операций: ${metrics.totalTransactions}`, 25, yPos)
          yPos += 10
        }
        
        if (metrics.conversionRate) {
          doc.text(`Конверсия: ${metrics.conversionRate.toFixed(1)}%`, 25, yPos)
          yPos += 10
        }
      }

      // Сохранение
      doc.save(`${fileName}.pdf`)
    } catch (error) {
      console.error('Error exporting to PDF:', error)
      alert('Ошибка при экспорте в PDF')
    }
  }

  const handleExport = async (type) => {
    setIsExporting(true)
    setExportSuccess(null)

    try {
      switch (type) {
        case 'csv':
          exportToCSV()
          break
        case 'json':
          exportToJSON()
          break
        case 'pdf':
          await exportToPDF()
          break
        default:
          throw new Error('Неподдерживаемый формат')
      }
      
      setExportSuccess(type)
      setTimeout(() => setExportSuccess(null), 3000)
    } catch (error) {
      console.error('Export error:', error)
      alert('Ошибка при экспорте данных')
    } finally {
      setIsExporting(false)
    }
  }

  const exportOptions = [
    {
      id: 'csv',
      title: 'CSV таблица',
      description: 'Для Excel и Google Sheets',
      icon: Table,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    {
      id: 'json',
      title: 'JSON данные',
      description: 'Структурированные данные',
      icon: FileText,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      id: 'pdf',
      title: 'PDF отчет',
      description: 'Готовый к печати документ',
      icon: Image,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20'
    }
  ]

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-500/20 rounded-xl">
            <Download className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <CardTitle>Экспорт данных</CardTitle>
            <p className="text-sm text-gray-400 mt-1">
              Выгрузите {data.length} записей в удобном формате
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {exportOptions.map((option) => {
            const Icon = option.icon
            const isSuccess = exportSuccess === option.id
            
            return (
              <div key={option.id} className="relative">
                <Card 
                  variant="glass" 
                  className="cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => handleExport(option.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 ${option.bgColor} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                      {isSuccess ? (
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      ) : (
                        <Icon className={`w-6 h-6 ${option.color}`} />
                      )}
                    </div>
                    
                    <h3 className="font-medium text-white mb-1">
                      {option.title}
                    </h3>
                    <p className="text-xs text-gray-400 mb-3">
                      {option.description}
                    </p>
                    
                    <Button
                      size="sm"
                      variant={isSuccess ? 'success' : 'outline'}
                      loading={isExporting}
                      className="w-full"
                      disabled={isExporting}
                    >
                      {isSuccess ? 'Готово!' : 'Скачать'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>

        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-yellow-400 text-xs font-bold">!</span>
            </div>
            <div>
              <p className="text-sm text-yellow-300 font-medium">
                Учтите конфиденциальность данных
              </p>
              <p className="text-xs text-yellow-400/80 mt-1">
                Экспортируемые файлы содержат конфиденциальную информацию. 
                Храните их в безопасном месте и не передавайте третьим лицам.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ExportData 