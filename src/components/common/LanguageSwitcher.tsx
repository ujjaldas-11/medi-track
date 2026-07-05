import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    console.log("changed")
  };

  return (
    <div className="flex gap-2">
          <button
            onClick={() => changeLanguage('en')}
            className="text-sm px-3 py-1 rounded"
          >
            English
          </button>

          <h1>
            |
          </h1>

          <button
            onClick={() => changeLanguage('hi')}
            className="text-sm px-3 py-1 rounded"
          >
            हिंदी
          </button>


    </div>
  );
}