import React, { createContext, useContext, useState, useEffect } from 'react'
import i18n, { getCurrentLanguage, setLanguage, subscribe } from '../utils/i18n'

// Создаем контекст для языка
const LanguageContext = createContext()

// Хук для использования контекста языка
export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Хук для переводов
export const useTranslation = () => {
  const { language } = useLanguage()
  
  const t = (path, fallback) => {
    return i18n.t(path, fallback)
  }

  return { t, language }
}

// Провайдер контекста языка
export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(getCurrentLanguage())

  useEffect(() => {
    // Подписываемся на изменения языка
    const unsubscribe = subscribe((newLanguage) => {
      setLanguageState(newLanguage)
    })

    return unsubscribe
  }, [])

  const changeLanguage = (newLanguage) => {
    const success = setLanguage(newLanguage)
    if (success) {
      setLanguageState(newLanguage)
    }
    return success
  }

  const toggleLanguage = () => {
    const newLanguage = language === 'ru' ? 'en' : 'ru'
    return changeLanguage(newLanguage)
  }

  const value = {
    language,
    changeLanguage,
    toggleLanguage,
    isRussian: language === 'ru',
    isEnglish: language === 'en'
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}