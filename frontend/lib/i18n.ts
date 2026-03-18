"use client";

type Translations = {
  [key: string]: {
    [key: string]: string;
  };
};

export const translations: Translations = {
  en: {
    profileSettings: "Profile Settings",
    preferences: "Preferences",
    personalInfo: "Personal Information",
    saveChanges: "Save Changes",
    language: "Language",
    theme: "Theme",
    font: "Font",
    digest: "Email Digest",
    security: "Security Alerts",
    report: "Weekly Report",
    saved: "Preferences saved successfully",
    success: "Success",
  },
  hi: {
    profileSettings: "प्रोफ़ाइल सेटिंग",
    preferences: "प्राथमिकताएं",
    personalInfo: "व्यक्तिगत जानकारी",
    saveChanges: "परिवर्तन सहेजें",
    language: "भाषा",
    theme: "थीम",
    font: "फ़ॉन्ट",
    digest: "ईमेल सारांश",
    security: "सुरक्षा अलर्ट",
    report: "साप्ताहिक रिपोर्ट",
    saved: "प्राथमिकताएं सफलतापूर्वक सहेजी गईं",
    success: "सफलता",
  },
  es: {
    profileSettings: "Configuración del Perfil",
    preferences: "Preferencias",
    personalInfo: "Información Personal",
    saveChanges: "Guardar Cambios",
    language: "Idioma",
    theme: "Tema",
    font: "Fuente",
    digest: "Resumen por Email",
    security: "Alertas de Seguridad",
    report: "Informe Semanal",
    saved: "Preferencias guardadas con éxito",
    success: "Éxito",
  },
  fr: {
    profileSettings: "Paramètres du Profil",
    preferences: "Préférences",
    personalInfo: "Informations Personnelles",
    saveChanges: "Enregistrer les modifications",
    language: "Langue",
    theme: "Thème",
    font: "Police",
    digest: "Résumé par Email",
    security: "Alertes de Sécurité",
    report: "Rapport Hebdomadaire",
    saved: "Préférences enregistrées avec succès",
    success: "Succès",
  },
  de: {
    profileSettings: "Profileinstellungen",
    preferences: "Einstellungen",
    personalInfo: "Persönliche Informationen",
    saveChanges: "Änderungen speichern",
    language: "Sprache",
    theme: "Thema",
    font: "Schriftart",
    digest: "Email-Zusammenfassung",
    security: "Sicherheitswarnungen",
    report: "Wöchentlicher Bericht",
    saved: "Einstellungen erfolgreich gespeichert",
    success: "Erfolg",
  },
  ja: {
    profileSettings: "プロフィール設定",
    preferences: "設定",
    personalInfo: "個人情報",
    saveChanges: "変更を保存",
    language: "言語",
    theme: "テーマ",
    font: "フォント",
    digest: "メールダイジェスト",
    security: "セキュリティアラート",
    report: "週刊レポート",
    saved: "設定が正常に保存されました",
    success: "成功",
  },
  ar: {
    profileSettings: "إعدادات الملف الشخصي",
    preferences: "التفضيلات",
    personalInfo: "معلومات شخصية",
    saveChanges: "حفظ التغييرات",
    language: "اللغة",
    theme: "السمة",
    font: "الخط",
    digest: "ملخص البريد الإلكتروني",
    security: "تنبيهات أمنية",
    report: "التقرير الأسبوعي",
    saved: "تم حفظ التفضيلات بنجاح",
    success: "نجاح",
  }
};

export const useTranslation = (lang: string) => {
  const t = (key: string) => {
    return translations[lang]?.[key] || translations['en'][key] || key;
  };
  return { t };
};
