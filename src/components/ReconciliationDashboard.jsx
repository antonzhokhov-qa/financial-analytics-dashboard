import React, { useState } from 'react'
import ReconciliationUpload from './ReconciliationUpload'
import ReconciliationResults from './ReconciliationResults'

// Функция для форматирования результатов сверки
function formatReconciliationForTable(reconciliationResults) {
  const allRecords = []

  // Проверяем, что у нас есть все необходимые массивы
  if (!reconciliationResults || typeof reconciliationResults !== 'object') {
    console.error('❌ Invalid reconciliation results:', reconciliationResults)
    return []
  }

  const { matched = [], statusMismatch = [], merchantOnly = [], platformOnly = [] } = reconciliationResults

  console.log('📋 Formatting data:', {
    matched: matched.length,
    statusMismatch: statusMismatch.length,
    merchantOnly: merchantOnly.length,
    platformOnly: platformOnly.length
  })

  // Сначала добавляем записи только у провайдера (приоритет 1 - самые проблемные)
  merchantOnly.forEach(record => {
    allRecords.push({
      id: record.merchant?.trackingId || record.trackingId || 'N/A',
      merchantId: record.merchant?.trackingId || record.trackingId || 'N/A',
      platformId: null,
      merchantStatus: record.merchant?.status || record.status || 'N/A',
      platformStatus: null,
      merchantData: { 
        status: record.merchant?.status || record.status || 'N/A', 
        id: record.merchant?.trackingId || record.trackingId || 'N/A',
        amount: record.merchant?.amount || record.amount || 'N/A'
      },
      platformData: null,
      reconciliationStatus: 'merchant_only',
      matchType: 'no_match',
      hasIssue: true,
      issueType: 'missing_platform'
    })
  })

  // Затем записи только на платформе (приоритет 2)
  platformOnly.forEach(record => {
    allRecords.push({
      id: record.platform?.foreignOperationId || record.foreignOperationId || 'N/A',
      merchantId: null,
      platformId: record.platform?.foreignOperationId || record.foreignOperationId || 'N/A',
      merchantStatus: null,
      platformStatus: record.platform?.status || record.status || 'N/A',
      merchantData: null,
      platformData: { 
        status: record.platform?.status || record.status || 'N/A', 
        id: record.platform?.foreignOperationId || record.foreignOperationId || 'N/A',
        amount: record.platform?.amount || record.amount || 'N/A'
      },
      reconciliationStatus: 'platform_only',
      matchType: 'no_match',
      hasIssue: true,
      issueType: 'missing_merchant'
    })
  })

  // Затем записи с расхождениями по статусу или сумме (приоритет 3)
  statusMismatch.forEach(record => {
    const merchantId = record.merchant?.trackingId || record.trackingId || 'N/A'
    const platformId = record.platform?.foreignOperationId || record.foreignOperationId || 'N/A'
    
    allRecords.push({
      id: merchantId,
      merchantId: merchantId,
      platformId: platformId,
      merchantStatus: record.merchant?.status || record.status || 'N/A',
      platformStatus: record.platform?.status || record.status || 'N/A',
      merchantAmount: record.merchant?.amount || record.amount || 'N/A',
      platformAmount: record.platform?.amount || record.amount || 'N/A',
      merchantData: { 
        status: record.merchant?.status || record.status || 'N/A', 
        id: merchantId,
        amount: record.merchant?.amount || record.amount || 'N/A'
      },
      platformData: { 
        status: record.platform?.status || record.status || 'N/A', 
        id: platformId,
        amount: record.platform?.amount || record.amount || 'N/A'
      },
      reconciliationStatus: record.reconciliationStatus || 'status_mismatch',
      matchType: record.matchType || 'status_mismatch',
      hasIssue: true,
      issueType: record.issueType || 'status'
    })
  })

  // В конце добавляем совпадающие записи (приоритет 4 - самые хорошие)
  matched.forEach(record => {
    const merchantId = record.merchant?.trackingId || record.trackingId || 'N/A'
    const platformId = record.platform?.foreignOperationId || record.foreignOperationId || 'N/A'
    
    allRecords.push({
      id: merchantId,
      merchantId: merchantId,
      platformId: platformId,
      merchantStatus: record.merchant?.status || record.status || 'N/A',
      platformStatus: record.platform?.status || record.status || 'N/A',
      merchantAmount: record.merchant?.amount || record.amount || 'N/A',
      platformAmount: record.platform?.amount || record.amount || 'N/A',
      merchantData: { 
        status: record.merchant?.status || record.status || 'N/A', 
        id: merchantId,
        amount: record.merchant?.amount || record.amount || 'N/A'
      },
      platformData: { 
        status: record.platform?.status || record.status || 'N/A', 
        id: platformId,
        amount: record.platform?.amount || record.amount || 'N/A'
      },
      reconciliationStatus: 'matched',
      matchType: 'full_match',
      hasIssue: false
    })
  })

  console.log('✅ Formatted records:', allRecords.length)
  return allRecords
}

const ReconciliationDashboard = () => {
  const [currentStep, setCurrentStep] = useState('upload') // 'upload' | 'results'
  const [reconciliationData, setReconciliationData] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Обработка загруженных файлов
  const handleFilesUploaded = async (filesData) => {
    setIsProcessing(true)
    console.log('🔄 Processing reconciliation results...', filesData)

    try {
      // Проверяем структуру данных
      if (!filesData || !filesData.results) {
        throw new Error('Неверная структура данных от сервера')
      }

      // Результаты уже получены от сервера
      const results = filesData.results
      
      console.log('📊 Raw results from server:', results)
      
      // Форматируем результаты для таблицы
      const formattedData = formatReconciliationForTable(results)

      console.log('✅ Reconciliation completed:', {
        totalRecords: formattedData.length,
        summary: results.summary,
        formattedDataSample: formattedData.slice(0, 3)
      })

      setReconciliationData({
        formattedData,
        rawResults: results,
        metadata: filesData.metadata,
        fileNames: {
          merchant: filesData.merchantFileName,
          platform: filesData.platformFileName
        }
      })

      setCurrentStep('results')
    } catch (error) {
      console.error('❌ Reconciliation error:', error)
      alert('Ошибка при обработке результатов сверки: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  // Возврат к загрузке файлов
  const handleBackToUpload = () => {
    setCurrentStep('upload')
    setReconciliationData(null)
  }

  if (isProcessing) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            🔄 Выполняется сверка...
          </h2>
          <p className="text-gray-600">
            Анализируем данные и ищем расхождения между провайдером и платформой
          </p>
          
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 space-y-1">
              <div>✅ Файлы загружены и обработаны</div>
              <div>🔍 Создание индексов для поиска...</div>
              <div>📊 Сравнение записей...</div>
              <div>🎯 Анализ расхождений...</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  switch (currentStep) {
    case 'upload':
      return <ReconciliationUpload onFilesUploaded={handleFilesUploaded} />
    
    case 'results':
      return (
        <ReconciliationResults
          reconciliationData={reconciliationData.formattedData}
          rawResults={reconciliationData.rawResults}
          fileNames={reconciliationData.fileNames}
          onBack={handleBackToUpload}
        />
      )
    
    default:
      return <ReconciliationUpload onFilesUploaded={handleFilesUploaded} />
  }
}

export default ReconciliationDashboard 