import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// const resources = {
//   en: {
//     translation: {
//       dashboard: "Dashboard",
//       stock: "Stock Management",
//       beds: "Bed Availability",
//       doctors: "Doctor Attendance",
//       tests: "Tests",
//       registration: "Patient Registration",
//       command: "Command Centre",
//       logout: "Logout",
//       lowStock: "Low Stock",
//       add: "Add",
//       save: "Save",
//       refresh: "Refresh",
//       welcome: "Welcome",
//     }
//   },
//   hi: {
//     translation: {
//       dashboard: "डैशबोर्ड",
//       stock: "स्टॉक प्रबंधन",
//       beds: "बेड उपलब्धता",
//       doctors: "डॉक्टर उपस्थिति",
//       tests: "टेस्ट",
//       registration: "मरीज पंजीकरण",
//       command: "कमांड सेंटर",
//       logout: "लॉगआउट",
//       lowStock: "कम स्टॉक",
//       add: "जोड़ें",
//       save: "सेव करें",
//       refresh: "रिफ्रेश",
//       welcome: "स्वागत है",
//     }
//   }
// };

const resources = {
  en: {
    translation: {
      // Sidebar Menu
      commandCentre: "Command Centre",
      healthCentres: "Health Centres",
      mapView: "Map View",
      requests: "Requests",
      alertsFeed: "Alerts Feed",
      analytics: "Analytics",

      facilityDetail: "Facility Detail",
      stock: "Stock",
      beds: "Beds",
      doctors: "Doctors",
      diagnosticUnits: "Diagnostic Units",

      medicinesStock: "Medicines Stock",
      stockAlerts: "Stock Alerts",

      registerPatients: "Register Patients",
      dailyFootfall: "Daily Footfall",
      bedsStatus: "Beds Status",

      doctorsDirectory: "Doctors Directory",
      diagnosticEquipment: "Diagnostic Equipment",

      // Common Buttons
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
      commandCentre: "कमांड सेंटर",
      healthCentres: "स्वास्थ्य केंद्र",
      mapView: "मानचित्र दृश्य",
      requests: "अनुरोध",
      alertsFeed: "अलर्ट फीड",
      analytics: "एनालिटिक्स",

      facilityDetail: "सुविधा विवरण",
      stock: "स्टॉक",
      beds: "बेड",
      doctors: "डॉक्टर",
      diagnosticUnits: "डायग्नोस्टिक यूनिट",

      medicinesStock: "दवाओं का स्टॉक",
      stockAlerts: "स्टॉक अलर्ट",

      registerPatients: "मरीज पंजीकरण",
      dailyFootfall: "दैनिक मरीज आवागमन",
      bedsStatus: "बेड स्थिति",

      doctorsDirectory: "डॉक्टर निर्देशिका",
      diagnosticEquipment: "डायग्नोस्टिक उपकरण",

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