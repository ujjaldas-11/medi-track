import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Sidebar Menu
      title: "MEdiTrack",
      commandCentre: "Command Centre",
      allCentres: "All Centres",
      aiRecommendations: "AI Recommendations",
      facilityDashboard: "Facility Dashboard",
      stockManagement: "Stock Management",
      beds: "Beds",
      doctors: "Doctors",
      alerts: "Alerts",
      patientRegistration: "Patient Registration",
      footfall: "Footfall",
      bedStatus: "Bed Status",
      myDashboard: "My Dashboard",
      attendance: "Attendance",
      tests: "Tests",

      // Common
      logout: "Logout",
      refresh: "Refresh",
      add: "Add",
      save: "Save",
      welcome: "Welcome",
      lowStock: "Low Stock",
    }
  },
  hi: {
    translation: {
      title: "मेडीट्रैक",
      commandCentre: "कमांड सेंटर",
      allCentres: "सभी केंद्र",
      aiRecommendations: "AI सिफारिशें",
      facilityDashboard: "सुविधा डैशबोर्ड",
      stockManagement: "स्टॉक प्रबंधन",
      beds: "बेड",
      doctors: "डॉक्टर",
      alerts: "अलर्ट",
      patientRegistration: "मरीज पंजीकरण",
      footfall: "मरीज आवागमन",
      bedStatus: "बेड स्थिति",
      myDashboard: "मेरा डैशबोर्ड",
      attendance: "उपस्थिति",
      tests: "टेस्ट",

      logout: "लॉगआउट",
      refresh: "रिफ्रेश",
      add: "जोड़ें",
      save: "सेव करें",
      welcome: "स्वागत है",
      lowStock: "कम स्टॉक",
    }
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