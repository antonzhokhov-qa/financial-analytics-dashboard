import { useState } from 'react'
import Dashboard from './components/Dashboard'
import DataSourceSelector from './components/DataSourceSelector'
import APIFilters from './components/APIFilters'
import EnhancedAPIFilters from './components/EnhancedAPIFilters'
import EnhancedDataTable from './components/EnhancedDataTable'
import ReconciliationDashboard from './components/ReconciliationDashboard'
import { normalizeAPIData } from './utils/apiService'
import './index.css'

function App() {
  console.log('App component rendering...')
  
  const [currentView, setCurrentView] = useState('selector') // 'selector', 'csv', 'api', 'enhanced-api', 'dashboard', 'enhanced-dashboard', 'reconciliation'
  const [dataSource, setDataSource] = useState(null)
  const [apiData, setApiData] = useState(null)
  const [enhancedApiData, setEnhancedApiData] = useState(null)
  const [loading, setLoading] = useState(false)

  // Обработка выбора источника данных
  const handleSourceChange = (source) => {
    setDataSource(source)
    if (source === 'csv') {
      setCurrentView('csv')
    } else if (source === 'api') {
      setCurrentView('api')
    } else if (source === 'enhanced-api') {
      setCurrentView('enhanced-api')
    }
  }

  // Обработка загрузки данных с API
  const handleAPIDataLoad = (data, source) => {
    console.log('API data loaded:', data.length, 'items')
    
    // Нормализуем данные из API
    const normalizedData = normalizeAPIData(data)
    setApiData(normalizedData)
    setCurrentView('dashboard')
  }

  // Обработка загрузки данных с расширенного API
  const handleEnhancedAPIDataLoad = (data, source) => {
    console.log('Enhanced API data loaded:', data.length, 'items')
    
    // Данные уже нормализованы в EnhancedAPIFilters
    setEnhancedApiData(data)
    setCurrentView('enhanced-dashboard')
  }

  // Возврат к выбору источника
  const handleBackToSelector = () => {
    setCurrentView('selector')
    setDataSource(null)
    setApiData(null)
    setEnhancedApiData(null)
  }

  // Переход к сверке данных
  const handleReconciliationView = () => {
    setCurrentView('reconciliation')
  }

  return (
    <div className="App">
      {currentView === 'selector' && (
        <DataSourceSelector 
          onSourceChange={handleSourceChange}
          currentSource={dataSource}
          onReconciliationClick={handleReconciliationView}
        />
      )}
      
      {currentView === 'csv' && (
        <Dashboard 
          dataSource="csv"
          onBackToSelector={handleBackToSelector}
        />
      )}
      
      {currentView === 'api' && (
        <APIFilters
          onDataLoad={handleAPIDataLoad}
          loading={loading}
          setLoading={setLoading}
          onBack={handleBackToSelector}
        />
      )}

      {currentView === 'enhanced-api' && (
        <EnhancedAPIFilters
          onDataLoad={handleEnhancedAPIDataLoad}
          loading={loading}
          setLoading={setLoading}
          onBack={handleBackToSelector}
        />
      )}
      
      {currentView === 'dashboard' && apiData && (
        <Dashboard 
          dataSource="api"
          preloadedData={apiData}
          onBackToSelector={handleBackToSelector}
        />
      )}

      {currentView === 'enhanced-dashboard' && enhancedApiData && (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
          <div className="mb-6">
            <button
              onClick={handleBackToSelector}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors duration-200"
            >
              ← Назад к выбору источника
            </button>
          </div>
          <EnhancedDataTable data={enhancedApiData} />
        </div>
      )}
      
      {currentView === 'reconciliation' && (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
          <div className="mb-6">
            <button
              onClick={handleBackToSelector}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors duration-200"
            >
              ← Назад к выбору источника
            </button>
          </div>
          <ReconciliationDashboard />
        </div>
      )}
    </div>
  )
}

export default App 