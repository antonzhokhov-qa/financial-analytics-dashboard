import React, { useState } from 'react'
import { Globe, ChevronDown } from 'lucide-react'
import { useLanguage, useTranslation } from '../contexts/LanguageContext'
import { getAvailableLanguages } from '../utils/i18n'

const LanguageSwitcher = ({ variant = 'default' }) => {
  const { language, changeLanguage } = useLanguage()
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  
  const languages = getAvailableLanguages()
  const currentLang = languages.find(lang => lang.code === language)

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode)
    setIsOpen(false)
  }

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  // Вариант для хедера (компактный)
  if (variant === 'compact') {
    return (
      <div className="relative">
        <button
          onClick={toggleDropdown}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 border border-white/20 backdrop-blur-sm"
          title={t('languages.switchLanguage')}
        >
          <Globe className="w-4 h-4 text-white" />
          <span className="text-sm font-medium text-white">{currentLang?.flag}</span>
          <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown menu */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl z-20 overflow-hidden">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-white/20 transition-colors duration-200 ${
                    language === lang.code ? 'bg-white/15' : ''
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className="text-white font-medium">{lang.name}</span>
                  {language === lang.code && (
                    <div className="ml-auto w-2 h-2 bg-green-400 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  // Полный вариант для настроек
  if (variant === 'full') {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Globe className="w-5 h-5" />
          <span>{t('languages.switchLanguage')}</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                language === lang.code
                  ? 'border-blue-400 bg-blue-500/20 text-white'
                  : 'border-white/20 bg-white/5 text-gray-300 hover:bg-white/10 hover:border-white/30'
              }`}
            >
              <span className="text-2xl">{lang.flag}</span>
              <div className="flex-1 text-left">
                <div className="font-semibold">{lang.name}</div>
                <div className="text-sm opacity-75">{lang.code.toUpperCase()}</div>
              </div>
              {language === lang.code && (
                <div className="w-3 h-3 bg-blue-400 rounded-full flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Кнопка-переключатель (toggle)
  if (variant === 'toggle') {
    return (
      <button
        onClick={() => changeLanguage(language === 'ru' ? 'en' : 'ru')}
        className="relative inline-flex items-center h-8 w-16 rounded-full bg-white/20 border border-white/30 transition-colors duration-200 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent"
        title={t('languages.switchLanguage')}
      >
        <span className="sr-only">{t('languages.switchLanguage')}</span>
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-200 flex items-center justify-center text-xs font-bold ${
            language === 'en' ? 'translate-x-8' : 'translate-x-1'
          }`}
        >
          {language === 'ru' ? '🇷🇺' : '🇺🇸'}
        </span>
      </button>
    )
  }

  // Стандартная кнопка (default)
  return (
    <button
      onClick={() => changeLanguage(language === 'ru' ? 'en' : 'ru')}
      className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 border border-white/20 backdrop-blur-sm group"
      title={t('languages.switchLanguage')}
    >
      <Globe className="w-5 h-5 text-white group-hover:rotate-12 transition-transform duration-200" />
      <span className="text-white font-medium">{currentLang?.flag} {currentLang?.name}</span>
    </button>
  )
}

export default LanguageSwitcher