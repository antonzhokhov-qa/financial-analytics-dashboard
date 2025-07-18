import { useState } from 'react'
import { BarChart3, PieChart, TrendingUp, Users, CreditCard, Calendar, DollarSign } from 'lucide-react'
import { getAmountRanges, getConversionByAmount, getStatusDistribution, getCompanyDistribution, getPaymentMethodDistribution, getTimeSeriesData, getTopUsers } from '../utils/analytics'

const ChartsGrid = ({ data, metrics, dataType = 'merchant' }) => {
  const [activeTab, setActiveTab] = useState('overview')

  const currency = 'TRY'
  const currencyCode = 'TRY'
  const sourceName = dataType === 'merchant' ? 'провайдера' : 'платформы'

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Получаем данные для графиков
  const amountRanges = getAmountRanges(data)
  const conversionByAmount = getConversionByAmount(data, dataType)
  const statusDistribution = getStatusDistribution(data, dataType)
  const companyDistribution = dataType === 'merchant' ? getCompanyDistribution(data) : {}
  const paymentMethodDistribution = getPaymentMethodDistribution(data)
  const timeSeriesData = getTimeSeriesData(data)
  const topUsers = getTopUsers(data, 10)

  const tabs = [
    { id: 'overview', label: 'Обзор', icon: BarChart3 },
    { id: 'status', label: 'Статусы', icon: PieChart },
    { id: 'amounts', label: 'Суммы', icon: DollarSign },
    { id: 'companies', label: 'Компании', icon: Users, hidden: dataType === 'platform' },
    { id: 'methods', label: 'Методы оплаты', icon: CreditCard },
    { id: 'timeline', label: 'Временная линия', icon: Calendar },
    { id: 'users', label: 'Пользователи', icon: Users }
  ].filter(tab => !tab.hidden)

  const renderOverview = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Распределение по статусам */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <PieChart className="w-5 h-5 mr-2 text-blue-400" />
          Распределение по статусам
        </h3>
        <div className="space-y-3">
          {Object.entries(statusDistribution).map(([status, count], index) => {
            const percentage = ((count / data.length) * 100).toFixed(1)
            const colors = {
              completed: 'from-green-500 to-emerald-500',
              success: 'from-green-500 to-emerald-500',
              failed: 'from-red-500 to-pink-500',
              fail: 'from-red-500 to-pink-500',
              canceled: 'from-yellow-500 to-orange-500'
            }
            const color = colors[status.toLowerCase()] || 'from-gray-500 to-gray-600'
            
            return (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 bg-gradient-to-r ${color} rounded-full`}></div>
                  <span className="text-sm font-medium text-white capitalize">
                    {status === 'completed' ? 'Завершено' : 
                     status === 'success' ? 'Успешно' :
                     status === 'failed' ? 'Неудачно' :
                     status === 'fail' ? 'Ошибка' :
                     status === 'canceled' ? 'Отменено' : status}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-white">{count}</div>
                  <div className="text-xs text-gray-400">{percentage}%</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Распределение по суммам */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-green-400" />
          Распределение по суммам
        </h3>
        <div className="space-y-3">
          {Object.entries(amountRanges).map(([range, count], index) => {
            const percentage = ((count / data.length) * 100).toFixed(1)
            const colors = [
              'from-blue-500 to-cyan-500',
              'from-cyan-500 to-teal-500',
              'from-teal-500 to-emerald-500',
              'from-emerald-500 to-green-500',
              'from-green-500 to-lime-500'
            ]
            
            return (
              <div key={range} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 bg-gradient-to-r ${colors[index % colors.length]} rounded-full`}></div>
                  <span className="text-sm font-medium text-white">{range} {currency}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-white">{count}</div>
                  <div className="text-xs text-gray-400">{percentage}%</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  const renderStatusChart = () => (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
        <PieChart className="w-5 h-5 mr-2 text-blue-400" />
        Детальная статистика по статусам
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(statusDistribution).map(([status, count], index) => {
          const percentage = ((count / data.length) * 100).toFixed(1)
          const colors = {
            completed: 'from-green-500 to-emerald-500',
            success: 'from-green-500 to-emerald-500',
            failed: 'from-red-500 to-pink-500',
            fail: 'from-red-500 to-pink-500',
            canceled: 'from-yellow-500 to-orange-500'
          }
          const color = colors[status.toLowerCase()] || 'from-gray-500 to-gray-600'
          const statusLabel = status === 'completed' ? 'Завершено' : 
                             status === 'success' ? 'Успешно' :
                             status === 'failed' ? 'Неудачно' :
                             status === 'fail' ? 'Ошибка' :
                             status === 'canceled' ? 'Отменено' : status
          
          return (
            <div key={status} className="text-center p-4 bg-white/5 rounded-xl">
              <div className={`w-16 h-16 bg-gradient-to-br ${color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                <span className="text-white font-bold text-lg">{count}</span>
              </div>
              <div className="text-white font-semibold mb-1">{statusLabel}</div>
              <div className="text-gray-400 text-sm">{percentage}%</div>
            </div>
          )
        })}
      </div>
    </div>
  )

  const renderAmountsChart = () => (
    <div className="space-y-6">
      {/* Распределение по суммам */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-green-400" />
          Распределение операций по суммам
        </h3>
        <div className="space-y-4">
          {Object.entries(amountRanges).map(([range, count], index) => {
            const percentage = ((count / data.length) * 100).toFixed(1)
            const colors = [
              'from-blue-500 to-cyan-500',
              'from-cyan-500 to-teal-500',
              'from-teal-500 to-emerald-500',
              'from-emerald-500 to-green-500',
              'from-green-500 to-lime-500'
            ]
            
            return (
              <div key={range} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white">{range} {currency}</span>
                  <span className="text-gray-400">{count} операций ({percentage}%)</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full bg-gradient-to-r ${colors[index % colors.length]} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Конверсия по суммам */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
          Конверсия по диапазонам сумм
        </h3>
        <div className="space-y-4">
          {conversionByAmount.map((item, index) => {
            const colors = [
              'from-blue-500 to-cyan-500',
              'from-cyan-500 to-teal-500',
              'from-teal-500 to-emerald-500',
              'from-emerald-500 to-green-500',
              'from-green-500 to-lime-500'
            ]
            
            return (
              <div key={item.range} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white">{item.range} {currency}</span>
                  <span className="text-gray-400">{item.conversion.toFixed(1)}% конверсия</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full bg-gradient-to-r ${colors[index % colors.length]} transition-all duration-500`}
                    style={{ width: `${Math.min(item.conversion, 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-400">
                  {item.successful} из {item.total} операций успешны
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  const renderCompaniesChart = () => (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Users className="w-5 h-5 mr-2 text-blue-400" />
        Топ компаний по выручке
      </h3>
      <div className="space-y-4">
        {Object.entries(companyDistribution)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .map(([company, count], index) => {
            const percentage = ((count / data.length) * 100).toFixed(1)
            const colors = [
              'from-blue-500 to-cyan-500',
              'from-cyan-500 to-teal-500',
              'from-teal-500 to-emerald-500',
              'from-emerald-500 to-green-500',
              'from-green-500 to-lime-500'
            ]
            
            return (
              <div key={company} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white">{company}</span>
                  <span className="text-gray-400">{count} операций ({percentage}%)</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full bg-gradient-to-r ${colors[index % colors.length]} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )

  const renderMethodsChart = () => (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <CreditCard className="w-5 h-5 mr-2 text-green-400" />
        Распределение по методам оплаты
      </h3>
      <div className="space-y-4">
        {Object.entries(paymentMethodDistribution)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .map(([method, count], index) => {
            const percentage = ((count / data.length) * 100).toFixed(1)
            const colors = [
              'from-blue-500 to-cyan-500',
              'from-cyan-500 to-teal-500',
              'from-teal-500 to-emerald-500',
              'from-emerald-500 to-green-500',
              'from-green-500 to-lime-500'
            ]
            
            return (
              <div key={method} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white">{method}</span>
                  <span className="text-gray-400">{count} операций ({percentage}%)</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full bg-gradient-to-r ${colors[index % colors.length]} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )

  const renderTimelineChart = () => (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Calendar className="w-5 h-5 mr-2 text-purple-400" />
        Динамика операций по времени
      </h3>
      <div className="space-y-4">
        {timeSeriesData.slice(-10).map((item, index) => {
          const colors = [
            'from-blue-500 to-cyan-500',
            'from-cyan-500 to-teal-500',
            'from-teal-500 to-emerald-500',
            'from-emerald-500 to-green-500',
            'from-green-500 to-lime-500'
          ]
          
          return (
            <div key={item.date} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white">{item.date}</span>
                <span className="text-gray-400">
                  {item.total} операций • {item.conversionRate.toFixed(1)}% конверсия
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full bg-gradient-to-r ${colors[index % colors.length]} transition-all duration-500`}
                  style={{ width: `${Math.min((item.total / Math.max(...timeSeriesData.map(t => t.total))) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-400">
                Успешно: {item.completed} • Неудачно: {item.failed}
                {dataType === 'merchant' && item.canceled > 0 && ` • Отменено: ${item.canceled}`}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  const renderUsersChart = () => (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Users className="w-5 h-5 mr-2 text-indigo-400" />
        Топ пользователей по объему операций
      </h3>
      <div className="space-y-4">
        {topUsers.map((user, index) => {
          const colors = [
            'from-blue-500 to-cyan-500',
            'from-cyan-500 to-teal-500',
            'from-teal-500 to-emerald-500',
            'from-emerald-500 to-green-500',
            'from-green-500 to-lime-500'
          ]
          
          return (
            <div key={user.id} className="space-y-2">
              <div className="flex justify-between text-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    {index + 1}
                  </div>
                  <span className="text-white">{user.name}</span>
                </div>
                <span className="text-gray-400">
                  {formatCurrency(user.totalAmount)} • {user.total} операций
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full bg-gradient-to-r ${colors[index % colors.length]} transition-all duration-500`}
                  style={{ width: `${Math.min((user.totalAmount / Math.max(...topUsers.map(u => u.totalAmount))) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-400">
                Успешно: {user.completed} • Неудачно: {user.failed}
                {dataType === 'merchant' && user.canceled > 0 && ` • Отменено: ${user.canceled}`}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'status':
        return renderStatusChart()
      case 'amounts':
        return renderAmountsChart()
      case 'companies':
        return renderCompaniesChart()
      case 'methods':
        return renderMethodsChart()
      case 'timeline':
        return renderTimelineChart()
      case 'users':
        return renderUsersChart()
      default:
        return renderOverview()
    }
  }

  return (
    <div className="space-y-6">
      {/* Заголовок секции */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Аналитика и графики</h2>
          <p className="text-gray-300">
            Детальная визуализация данных • {data.length} записей • Валюта: {currency}
          </p>
        </div>
      </div>

      {/* Табы */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Контент */}
      <div className="animate-fade-in">
        {renderContent()}
      </div>
    </div>
  )
}

export default ChartsGrid 