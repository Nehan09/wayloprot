import { createContext, useContext, useState, type ReactNode } from "react";

export type Language = "English" | "Hindi" | "Telugu";

export const translations = {
  English: {
    search: "Search",
    list: "List",
    cart: "Cart",
    map: "Map",
    scan: "Scan Product",
    checkout: "Checkout",
    openMap: "Open map",
    liveBill: "Live Bill",
    total: "Total",
    items: "items",
  },

  Hindi: {
    search: "खोजें",
    list: "सूची",
    cart: "कार्ट",
    map: "मानचित्र",
    scan: "उत्पाद स्कैन करें",
    checkout: "चेकआउट",
    openMap: "मैप खोलें",
    liveBill: "लाइव बिल",
    total: "कुल",
    items: "आइटम",
  },

  Telugu: {
    search: "వెతకండి",
    list: "జాబితా",
    cart: "కార్ట్",
    map: "మ్యాప్",
    scan: "ఉత్పత్తిని స్కాన్ చేయండి",
    checkout: "చెక్‌అవుట్",
    openMap: "మ్యాప్ తెరవండి",
    liveBill: "లైవ్ బిల్",
    total: "మొత్తం",
    items: "ఐటమ్స్",
  },
};

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (typeof translations)[Language];
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [language, setLanguage] = useState<Language>("English");

  const t = translations[language];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider",
    );
  }

  return context;
}