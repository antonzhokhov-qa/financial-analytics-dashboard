import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

function DataTable({ data }) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 25
  
  const totalPages = Math.ceil(data.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = data.slice(startIndex, endIndex)

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const getStatusColor = (status) => {
    const normalizedStatus = status ? status.toLowerCase() : ''
    if (normalizedStatus === 'completed') {
      return 'text-green-300 bg-green-500/20 border-green-500/30'
    } else if (normalizedStatus === 'canceled') {
      return 'text-yellow-300 bg-yellow-500/20 border-yellow-500/30'
    } else if (normalizedStatus === 'failed') {
      return 'text-red-300 bg-red-500/20 border-red-500/30'
    }
    return 'text-gray-300 bg-gray-500/20 border-gray-500/30'
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  const truncateText = (text, maxLength = 20) => {
    if (!text) return '-'
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">📋 Детализация операций</h2>
        <div className="text-sm text-gray-300">
          Показано {startIndex + 1}-{Math.min(endIndex, data.length)} из {data.length} операций
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-white/10">
                <th className="text-left py-4 px-4 font-semibold text-white">ID</th>
                <th className="text-left py-4 px-4 font-semibold text-white">Статус</th>
                <th className="text-left py-4 px-4 font-semibold text-white">Сумма</th>
                <th className="text-left py-4 px-4 font-semibold text-white">Компания</th>
                <th className="text-left py-4 px-4 font-semibold text-white">Пользователь</th>
                <th className="text-left py-4 px-4 font-semibold text-white">Метод оплаты</th>
                <th className="text-left py-4 px-4 font-semibold text-white">Создано</th>
                <th className="text-left py-4 px-4 font-semibold text-white">Обработано</th>
                <th className="text-left py-4 px-4 font-semibold text-white">Комиссия</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((row, index) => {
                const amount = parseFloat(row.amount) || 0
                const fee = parseFloat(row.fee) || 0
                const status = row.status || ''
                
                return (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200">
                    <td className="py-4 px-4 font-mono text-xs text-gray-300" title={row.id}>
                      {truncateText(row.id, 12)}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                        {status}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-medium text-white">
                      {amount.toLocaleString('ru-RU')} ₽
                    </td>
                    <td className="py-4 px-4 text-white" title={row.company}>
                      {truncateText(row.company, 15)}
                    </td>
                    <td className="py-4 px-4 text-white" title={row.fullName}>
                      {truncateText(row.userName || row.fullName, 15)}
                    </td>
                    <td className="py-4 px-4 text-white" title={row.paymentMethod}>
                      {truncateText(row.paymentMethod, 15)}
                    </td>
                    <td className="py-4 px-4 text-gray-300 text-xs">
                      {formatDate(row.createdAt)}
                    </td>
                    <td className="py-4 px-4 text-gray-300 text-xs">
                      {formatDate(row.processedAt)}
                    </td>
                    <td className="py-4 px-4 text-gray-300">
                      {fee > 0 ? `${fee.toLocaleString('ru-RU')} ₽` : '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
            Предыдущая
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-300">
              Страница {currentPage} из {totalPages}
            </span>
          </div>
          
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Следующая
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

export default DataTable 