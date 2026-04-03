'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { en } from './en'
import { uk } from './uk'
import type { Translations } from './en'

export type Lang = 'en' | 'uk'

const translations: Record<Lang, Translations> = { en, uk }

const STORAGE_KEY = 'forge-lang'

interface LangContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: Translations
}

const LangContext = createContext<LangContextValue>({
  lang: 'en',
  setLang: () => {},
  t: en,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null
    if (stored && (stored === 'en' || stored === 'uk')) {
      setLangState(stored)
    }
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
    localStorage.setItem(STORAGE_KEY, l)
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LangContext.Provider>
  )
}

export function useT() {
  return useContext(LangContext)
}

export type { Translations }
