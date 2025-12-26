import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslation from "../locales/en/translation.json";
import arTranslation from "../locales/ar/translation.json";

const resources = {
  en: { translation: enTranslation },
  ar: { translation: arTranslation },
};

const savedLang = localStorage.getItem("lang") || "ar";

i18n.use(initReactI18next).init({
  resources,
  lng: savedLang,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

// ✅ تحديث اتجاه الصفحة ولغتها العامة
document.documentElement.lang = savedLang;
document.documentElement.dir = savedLang === "ar" ? "rtl" : "ltr";

// ✅ كل مرة اللغة تتغير، حدّث الاتجاه تلقائيًا
i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
  localStorage.setItem("lang", lng);
});

export default i18n;
