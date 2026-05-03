"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import dictionaries, { type Lang } from "@/i18n";

interface LanguageContextValue {
  lang: Lang;
  setLanguage: (lang: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "stag-lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const [isChanging, setIsChanging] = useState(false);

  /* Hydrate from localStorage */
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (stored && dictionaries[stored]) {
      setLang(stored);
    }
  }, []);

  /* Sync lang attribute + localStorage on change */
  useEffect(() => {
    document.documentElement.dir = "ltr";
    document.documentElement.lang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const setLanguage = useCallback(
    (newLang: Lang) => {
      if (newLang === lang) return;
      setIsChanging(true);
      setTimeout(() => {
        setLang(newLang);
        setIsChanging(false);
      }, 150); // half duration of the transition
    },
    [lang]
  );

  const t = useCallback(
    (key: string): string => {
      return dictionaries[lang][key] ?? dictionaries.en[key] ?? key;
    },
    [lang],
  );

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, t }}>
      <div
        className={`flex flex-col min-h-screen w-full transition-all duration-300 ease-in-out ${
          isChanging ? "opacity-0 blur-[2px] scale-[0.99]" : "opacity-100 blur-0 scale-100"
        }`}
      >
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
