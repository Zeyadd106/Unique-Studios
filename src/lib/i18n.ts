export const locales = ['en', 'ar'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية',
}

export const isRTL = (locale: Locale): boolean => locale === 'ar'

export const getDirection = (locale: Locale): 'ltr' | 'rtl' => 
  isRTL(locale) ? 'rtl' : 'ltr'