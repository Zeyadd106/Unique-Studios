'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import React from 'react'
import { Locale, defaultLocale, isRTL, getDirection } from '@/lib/i18n'

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  isRTL: boolean
  direction: 'ltr' | 'rtl'
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedLocale = localStorage.getItem('locale') as Locale
    if (savedLocale && (savedLocale === 'en' || savedLocale === 'ar')) {
      setLocaleState(savedLocale)
    }
  }, [])

  const handleSetLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)

    document.documentElement.dir = getDirection(newLocale)
    document.documentElement.lang = newLocale

    // Single brand font (Cairo) for both languages — Van-Graph style.
    document.body.style.fontFamily = 'var(--font-cairo), Arial, sans-serif'
  }

  useEffect(() => {
    if (mounted) {
      const direction = getDirection(locale)
      document.documentElement.dir = direction
      document.documentElement.lang = locale

      document.body.style.fontFamily = 'var(--font-cairo), Arial, sans-serif'
    }
  }, [locale, mounted])

  const contextValue = {
    locale,
    setLocale: handleSetLocale,
    isRTL: isRTL(locale),
    direction: getDirection(locale)
  }

  return React.createElement(
    LocaleContext.Provider,
    { value: contextValue },
    children
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}