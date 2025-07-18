import React, { useState } from 'react';
import { Filter, Calendar, DollarSign, CheckCircle, Building, User, CreditCard } from 'lucide-react';

const Filters = ({ onFiltersChange, data = [] }) => {
  const [filters, setFilters] = useState({
    status: '',
    company: '',
    paymentMethod: '',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: ''
  });

  // Получаем уникальные значения для фильтров
  const companies = [...new Set(data.map(row => row.company).filter(Boolean))].sort();
  const paymentMethods = [...new Set(data.map(row => row.paymentMethod).filter(Boolean))].sort();

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      status: '',
      company: '',
      paymentMethod: '',
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Filter className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Фильтры</h2>
            <p className="text-gray-300">Настройте параметры для анализа данных</p>
          </div>
        </div>
        <button
          onClick={clearFilters}
          className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors duration-200"
        >
          Очистить
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Фильтр по статусу */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-white">
            <CheckCircle className="w-4 h-4" />
            <span>Статус операции</span>
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
          >
            <option value="">Все статусы</option>
            <option value="completed">Завершены</option>
            <option value="canceled">Отменены</option>
            <option value="failed">Неудачные</option>
          </select>
        </div>

        {/* Фильтр по компании */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-white">
            <Building className="w-4 h-4" />
            <span>Компания</span>
          </label>
          <select
            value={filters.company}
            onChange={(e) => handleFilterChange('company', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
          >
            <option value="">Все компании</option>
            {companies.map(company => (
              <option key={company} value={company}>{company}</option>
            ))}
          </select>
        </div>

        {/* Фильтр по методу оплаты */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-white">
            <CreditCard className="w-4 h-4" />
            <span>Метод оплаты</span>
          </label>
          <select
            value={filters.paymentMethod}
            onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
          >
            <option value="">Все методы</option>
            {paymentMethods.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </div>

        {/* Фильтр по дате "с" */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-white">
            <Calendar className="w-4 h-4" />
            <span>Дата с</span>
          </label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
          />
        </div>

        {/* Фильтр по дате "до" */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-white">
            <Calendar className="w-4 h-4" />
            <span>Дата до</span>
          </label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
          />
        </div>

        {/* Фильтр по минимальной сумме */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-white">
            <DollarSign className="w-4 h-4" />
            <span>Сумма от (₽)</span>
          </label>
          <input
            type="number"
            placeholder="0"
            value={filters.amountMin}
            onChange={(e) => handleFilterChange('amountMin', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
          />
        </div>

        {/* Фильтр по максимальной сумме */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-white">
            <DollarSign className="w-4 h-4" />
            <span>Сумма до (₽)</span>
          </label>
          <input
            type="number"
            placeholder="∞"
            value={filters.amountMax}
            onChange={(e) => handleFilterChange('amountMax', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
          />
        </div>
      </div>

      {/* Активные фильтры */}
      {(filters.status || filters.company || filters.paymentMethod || filters.dateFrom || filters.dateTo || filters.amountMin || filters.amountMax) && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-300">Активные фильтры:</span>
          {filters.status && (
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
              Статус: {filters.status === 'completed' ? 'Завершены' : filters.status === 'canceled' ? 'Отменены' : 'Неудачные'}
            </span>
          )}
          {filters.company && (
            <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
              Компания: {filters.company}
            </span>
          )}
          {filters.paymentMethod && (
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
              Метод: {filters.paymentMethod}
            </span>
          )}
          {filters.dateFrom && (
            <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm">
              С: {filters.dateFrom}
            </span>
          )}
          {filters.dateTo && (
            <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm">
              До: {filters.dateTo}
            </span>
          )}
          {filters.amountMin && (
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm">
              От: {filters.amountMin} ₽
            </span>
          )}
          {filters.amountMax && (
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm">
              До: {filters.amountMax} ₽
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Filters; 