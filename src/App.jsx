import { useState } from 'react'
import Dashboard from './components/Dashboard'
import DataSourceSelector from './components/DataSourceSelector'
import APIFilters from './components/APIFilters'
import { normalizeAPIData } from './utils/apiService'
import './index.css'

function App() {
  console.log('App component rendering...')
  
  const [currentView, setCurrentView] = useState('selector') // 'selector', 'csv', 'api', 'dashboard'
  const [dataSource, setDataSource] = useState(null)
  const [apiData, setApiData] = useState(null)
  const [loading, setLoading] = useState(false)

  // Обработка выбора источника данных
  const handleSourceChange = (source) => {
    setDataSource(source)
    if (source === 'csv') {
      setCurrentView('csv')
    } else if (source === 'api') {
      setCurrentView('api')
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

  // Возврат к выбору источника
  const handleBackToSelector = () => {
    setCurrentView('selector')
    setDataSource(null)
    setApiData(null)
  }

  return (
    <div className="App">
      {currentView === 'selector' && (
        <DataSourceSelector 
          onSourceChange={handleSourceChange}
          currentSource={dataSource}
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
      
      {currentView === 'dashboard' && apiData && (
        <Dashboard 
          dataSource="api"
          preloadedData={apiData}
          onBackToSelector={handleBackToSelector}
        />
      )}
    </div>
  )
}

export default App 