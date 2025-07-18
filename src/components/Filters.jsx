import React, { useState } from 'react';
import { Filter, Calendar, DollarSign, CheckCircle } from 'lucide-react';

const Filters = ({ onFiltersChange }) => {
  const [filters, setFilters] = useState({
    status: '',
    currency: '',
    dateFrom: '',
    dateTo: ''
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      status: '',
      currency: '',
      dateFrom: '',
      dateTo: ''
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
            <span>Статус транзакции</span>
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
          >
            <option value="">Все статусы</option>
            <option value="success">Успешные</option>
            <option value="fail">Неуспешные</option>
          </select>
        </div>

        {/* Фильтр по валюте */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-white">
            <DollarSign className="w-4 h-4" />
            <span>Валюта</span>
          </label>
          <select
            value={filters.currency}
            onChange={(e) => handleFilterChange('currency', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
          >
            <option value="">Все валюты</option>
            <option value="TRY">TRY</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
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
      </div>

      {/* Активные фильтры */}
      {(filters.status || filters.currency || filters.dateFrom || filters.dateTo) && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-300">Активные фильтры:</span>
          {filters.status && (
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
              Статус: {filters.status === 'success' ? 'Успешные' : 'Неуспешные'}
            </span>
          )}
          {filters.currency && (
            <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
              Валюта: {filters.currency}
            </span>
          )}
          {filters.dateFrom && (
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
              С: {filters.dateFrom}
            </span>
          )}
          {filters.dateTo && (
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
              До: {filters.dateTo}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Filters; 