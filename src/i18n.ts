import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en.json';
import hiTranslation from './locales/hi.json';
import bnTranslation from './locales/bn.json';
import teTranslation from './locales/te.json';
import taTranslation from './locales/ta.json';
import mrTranslation from './locales/mr.json';

const resources = {
  en: {
    translation: enTranslation
  },
  hi: {
    translation: hiTranslation
  },
  bn: {
    translation: bnTranslation
  },
  te: {
    translation: teTranslation
  },
  ta: {
    translation: taTranslation
  },
  mr: {
    translation: mrTranslation
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;