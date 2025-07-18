import React, { useState, useEffect } from 'react';
import { parseCSV } from '../utils/csvParser';
import { calculateMetrics, generateInsights } from '../utils/analytics';
import { exportToPDF } from '../utils/pdfExport';
import FileUpload from './FileUpload';
import MetricsGrid from './MetricsGrid';
import ChartsGrid from './ChartsGrid';
import DataTable from './DataTable';
import Filters from './Filters';
import InsightsSection from './InsightsSection';
import EnhancedChartsGrid from './EnhancedChartsGrid';
import PredictiveAnalytics from './PredictiveAnalytics';
import AnomalyDetection from './AnomalyDetection';
import TimeRangeSelector from './TimeRangeSelector';
import { Download, FileText } from 'lucide-react';

const EnhancedDashboard = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({
    status: '',
    currency: '',
    dateFrom: '',
    dateTo: ''
  });
  const [timeRange, setTimeRange] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleFileUpload = async (file) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const text = await file.text();
      const parsedData = parseCSV(text);
      
      if (parsedData.length === 0) {
        throw new Error('Файл пуст или имеет неверный формат');
      }
      
      setData(parsedData);
      setFilteredData(parsedData);
      setMetrics(calculateMetrics(parsedData));
    } catch (err) {
      console.error('Ошибка при обработке файла:', err);
      setError(err.message || 'Ошибка при обработке файла');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    
    let filtered = [...data];
    
    if (newFilters.status) {
      filtered = filtered.filter(item => item.status === newFilters.status);
    }
    
    if (newFilters.currency) {
      filtered = filtered.filter(item => item.initialCurrency === newFilters.currency);
    }
    
    if (newFilters.dateFrom || newFilters.dateTo) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.date || '2025-01-01');
        const fromDate = newFilters.dateFrom ? new Date(newFilters.dateFrom) : null;
        const toDate = newFilters.dateTo ? new Date(newFilters.dateTo) : null;
        
        if (fromDate && itemDate < fromDate) return false;
        if (toDate && itemDate > toDate) return false;
        return true;
      });
    }
    
    setFilteredData(filtered);
    setMetrics(calculateMetrics(filtered));
  };

  const resetDashboard = () => {
    setData([]);
    setFilteredData([]);
    setMetrics(null);
    setError(null);
    setFilters({
      status: '',
      currency: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const handleExportPDF = async () => {
    if (!data.length || !metrics) {
      alert('Нет данных для экспорта');
      return;
    }

    setIsExporting(true);
    try {
      await exportToPDF(filteredData, metrics);
      // Показываем уведомление об успешном экспорте
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-up';
      notification.textContent = 'PDF отчет успешно создан!';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
    } catch (error) {
      console.error('Ошибка экспорта:', error);
      alert('Ошибка при создании PDF отчета');
    } finally {
      setIsExporting(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Обзор', icon: '📊' },
    { id: 'analytics', label: 'Аналитика', icon: '📈' },
    { id: 'forecasts', label: 'Прогнозы', icon: '🔮' },
    { id: 'anomalies', label: 'Аномалии', icon: '⚠️' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8 animate-fade-in">
            {metrics && (
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">📊 Основные метрики</h2>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handleExportPDF}
                      disabled={isExporting}
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 shadow-lg"
                    >
                      {isExporting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Создание PDF...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          <span>Экспорт в PDF</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={resetDashboard}
                      className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-all duration-200"
                    >
                      Загрузить новый файл
                    </button>
                  </div>
                </div>
                <MetricsGrid metrics={metrics} />
              </div>
            )}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">📈 Графики и аналитика</h2>
              <ChartsGrid data={filteredData} />
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
              <DataTable data={filteredData} />
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">🔍 Расширенная аналитика</h2>
                <button
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  {isExporting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Создание PDF...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      <span>Экспорт отчета</span>
                    </>
                  )}
                </button>
              </div>
              <EnhancedChartsGrid data={filteredData} />
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">💡 Ключевые инсайты</h2>
              <InsightsSection insights={generateInsights(filteredData, metrics)} />
            </div>
          </div>
        );
      case 'forecasts':
        return (
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">🔮 Прогнозная аналитика</h2>
              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <Download className="w-5 h-5" />
                <span>Экспорт</span>
              </button>
            </div>
            <PredictiveAnalytics data={filteredData} metrics={metrics} />
          </div>
        );
      case 'anomalies':
        return (
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">⚠️ Детекция аномалий</h2>
              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <Download className="w-5 h-5" />
                <span>Экспорт</span>
              </button>
            </div>
            <AnomalyDetection data={filteredData} anomalies={[]} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-violet-900 relative overflow-hidden">
      {/* Анимированный фон */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto shadow-2xl">
              <span className="text-4xl">🚀</span>
            </div>
          </div>
          <h1 className="text-6xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Analytics Dashboard 2025
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Профессиональная аналитическая платформа для анализа финансовых транзакций 
            с использованием современных алгоритмов машинного обучения и искусственного интеллекта
          </p>
        </div>

        {/* Основной контент */}
        {data.length === 0 ? (
          // Экран загрузки файла
          <div className="space-y-8">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
              <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} />
              {error && (
                <div className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 animate-pulse">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">⚠️</span>
                    <span>{error}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Дашборд с данными
          <div className="space-y-8">
            {/* Фильтры и временной диапазон */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Filters onFiltersChange={applyFilters} />
                </div>
                <div>
                  <TimeRangeSelector 
                    selectedRange={timeRange} 
                    onRangeChange={setTimeRange}
                  />
                </div>
              </div>
            </div>

            {/* Вкладки */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
              {/* Навигация по вкладкам */}
              <div className="border-b border-white/10 bg-white/5">
                <nav className="flex space-x-1 px-8 py-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-3 px-8 py-4 rounded-xl font-medium transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105 shadow-blue-500/25'
                          : 'text-gray-300 hover:text-white hover:bg-white/10 hover:scale-102'
                      }`}
                    >
                      <span className="text-2xl">{tab.icon}</span>
                      <span className="text-lg">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Контент вкладок */}
              <div className="p-8">
                {renderTabContent()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedDashboard; 