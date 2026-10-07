'use client';

import React, { createContext, useContext } from 'react';
import type { Language, Dictionary } from '@/lib/i18n';
import { dictionaries } from '@/lib/i18n';

interface LanguageContextType {
  lang: Language;
  t: Dictionary;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  t: dictionaries.en,
});

export function LanguageProvider({
  children,
  lang,
}: {
  children: React.ReactNode;
  lang: Language;
}) {
  return (
    <LanguageContext.Provider value={{ lang, t: dictionaries[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}
