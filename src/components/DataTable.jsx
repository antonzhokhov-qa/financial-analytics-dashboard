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
    return normalizedStatus === 'success' 
      ? 'text-green-300 bg-green-500/20 border-green-500/30' 
      : 'text-red-300 bg-red-500/20 border-red-500/30'
  }

  const getOperationStateColor = (state) => {
    const normalizedState = state ? state.toLowerCase() : ''
    return normalizedState === 'complete' 
      ? 'text-blue-300 bg-blue-500/20 border-blue-500/30'
      : 'text-purple-300 bg-purple-500/20 border-purple-500/30'
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
                <th className="text-left py-4 px-6 font-semibold text-white">Reference ID</th>
                <th className="text-left py-4 px-6 font-semibold text-white">Client Operation ID</th>
                <th className="text-left py-4 px-6 font-semibold text-white">Method</th>
                <th className="text-left py-4 px-6 font-semibold text-white">Состояние</th>
                <th className="text-left py-4 px-6 font-semibold text-white">Статус</th>
                <th className="text-left py-4 px-6 font-semibold text-white">Сумма (TRY)</th>
                <th className="text-left py-4 px-6 font-semibold text-white">Списано (TRY)</th>
                <th className="text-left py-4 px-6 font-semibold text-white">Результат</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((row, index) => {
                const initialAmount = parseFloat(row['Initial Amount']) || 0
                const chargedAmount = parseFloat(row['Charged Amount']) || 0
                const status = row.Status ? row.Status.toLowerCase() : ''
                const result = status === 'success' 
                  ? `+${chargedAmount.toLocaleString('ru-RU')} TRY`
                  : `${initialAmount.toLocaleString('ru-RU')} TRY`
                
                return (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200">
                    <td className="py-4 px-6 font-mono text-xs text-gray-300">{row['Reference ID']}</td>
                    <td className="py-4 px-6 text-white">{row['Client Operation id']}</td>
                    <td className="py-4 px-6 text-white">{row['Method']}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getOperationStateColor(row['Operation State'])}`}>
                        {row['Operation State']}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(row.Status)}`}>
                        {row.Status}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-white">{initialAmount.toLocaleString('ru-RU')}</td>
                    <td className="py-4 px-6 font-medium text-white">{chargedAmount.toLocaleString('ru-RU')}</td>
                    <td className={`py-4 px-6 font-bold ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                      {result}
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