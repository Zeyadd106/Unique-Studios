'use client'

import { useLocale } from './use-locale'
import enMessages from '@/messages/en.json'
import arMessages from '@/messages/ar.json'

const messages = {
  en: enMessages,
  ar: arMessages,
}

export function useTranslation() {
  const { locale } = useLocale()
  
  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = messages[locale]

    for (const k of keys) {
      value = value?.[k]
    }

    return value || key
  }

  // For message values that are string arrays (e.g. FAQ lists).
  const tList = (key: string): string[] => {
    const keys = key.split('.')
    let value: any = messages[locale]

    for (const k of keys) {
      value = value?.[k]
    }

    return Array.isArray(value) ? value : []
  }

  return { t, tList, locale }
}