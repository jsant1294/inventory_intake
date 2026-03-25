'use client';
import React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

const LangContext = createContext({ lang: 'en', setLang: () => {} });

export function LangProvider({ children }) {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('jrtools-lang') : null;
    if (saved === 'en' || saved === 'es') {
      setLang(saved);
      return;
    }
    const browserLang = typeof navigator !== 'undefined' ? navigator.language : 'en';
    setLang(browserLang?.toLowerCase().startsWith('es') ? 'es' : 'en');
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('jrtools-lang', lang);
      document.documentElement.lang = lang;
    }
  }, [lang]);

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
