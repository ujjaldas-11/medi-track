// utils/speechLang.ts
const SPEECH_LANG_MAP: Record<string, string> = {
  en: 'en-US',
  hi: 'hi-IN',
  bn: 'bn-IN',
  te: 'te-IN',
  ta: 'ta-IN',
  mr: 'mr-IN',
};

export const toSpeechLang = (i18nLang: string) =>
  SPEECH_LANG_MAP[i18nLang?.split('-')[0]] || 'en-US';