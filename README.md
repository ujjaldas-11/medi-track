# 🏥 MediTrack — District Health Centre Management System

MediTrack is a role-based web platform for managing public health centres (PHCs/CHCs) across a district. It gives every level of staff — from the Chief Medical Officer down to front-desk clerks — a real-time view of medicine stock, bed occupancy, doctor attendance, and patient footfall, so shortages and problems get caught before they become emergencies.

Built with React, TypeScript, and Firebase, with a clean, mobile-friendly interface designed for non-technical users in a healthcare setting.

---

## ✨ Features

- **Role-based access control** — five distinct roles (CMO, Medical Officer, Pharmacist, Front Desk, Staff), each with its own dashboard and permissions.
- **Command Centre dashboard** — district-wide overview for the CMO: total centres, critical alerts, doctors present, beds available, and rule-based recommendations.
- **Health Centre directory & detail pages** — searchable list of all centres with a computed health score, and a full detail view per centre.
- **Patient registration & daily footfall logging** — front-desk staff can register patients and log daily OPD/Emergency counts.
- **Medicine stock management** — real-time stock levels, daily usage tracking, automatic low-stock highlighting, and reorder thresholds.
- **Doctor attendance tracking** — presence/absence/late status, with automatic flagging of doctors absent for 3+ consecutive days.
- **Bed occupancy tracking** — general and ICU ward occupancy with quick adjustment controls.
- **Diagnostic equipment status** — toggleable status grid for X-ray, ECG, Ultrasound, Oxygen, and Ambulance availability.
- **Inter-centre redistribution requests** — request and approve stock/resource transfers between centres.
- **Real-time alerts** — a live, Firestore-backed alert feed with toast notifications and a notification bell.
- **Analytics dashboards** — visual charts for patient trends, medicine usage, doctor attendance, and bed occupancy.
- **Interactive map view** — all centres plotted on a map, colour-coded by health score, with editable coordinates.
- **Multi-language support** — built-in internationalisation.
- **Light/dark theme** — a soft blue-and-green healthcare theme with full dark mode support.
- **Fully responsive** — usable on desktop, tablet, and mobile.

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS v4 |
| Backend / Database | Firebase (Authentication + Firestore) |
| Forms & Validation | React Hook Form + Zod |
| Charts | Recharts |
| Maps | React Leaflet + OpenStreetMap |
| Animations | Framer Motion |
| Notifications | React Toastify |
| Icons | Phosphor Icons |
| Localisation | i18next |

---

## 📋 Prerequisites

- **[Node.js](https://nodejs.org/)** version 20 or newer (comes with npm)
- A **[Firebase](https://firebase.google.com/)** project with:
  - **Authentication** enabled (Email/Password sign-in method)
  - **Firestore Database** created

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Copy the example environment file and fill in your own Firebase project credentials:
```bash
cp .env.example .env
```

Then open `.env` and fill in each value from **Firebase Console → Project Settings → General → Your apps**:
```env
VITE_FIREBASE_API_KEY=your_value_here
VITE_FIREBASE_AUTH_DOMAIN=your_value_here
VITE_FIREBASE_PROJECT_ID=your_value_here
VITE_FIREBASE_STORAGE_BUCKET=your_value_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_value_here
VITE_FIREBASE_APP_ID=your_value_here
```

> ⚠️ Never commit your real `.env` file — only `.env.example` should be tracked in git.

### 4. Run the development server
```bash
npm run dev
```
The app will be available at **http://localhost:5173**.

### 5. Build for production
```bash
npm run build
```

---

## 👥 User Roles & Permissions

| Role | Access |
|---|---|
| **CMO** (Chief Medical Officer) | Full district-wide access — Command Centre, all centres, doctor management, analytics, map view |
| **MO** (Medical Officer) | Facility-level management — beds, doctors, diagnostics for their centre |
| **Pharmacist** | Medicine stock management and stock alerts |
| **Front Desk** | Patient registration and daily footfall logging |
| **Staff** | Read-only access to doctors directory and diagnostic equipment status |

---

## 📁 Project Structure

src/
├── components/       # Shared UI components (Layout, Card, Button, Modal, Table, Input, Badge)
├── context/          # React Context providers (Auth, Data, Alerts, Theme)
├── hooks/            # Custom hooks (useAuth, etc.)
├── lib/              # Firebase configuration and Firestore helpers
├── pages/            # All route-level pages (Dashboard, CommandCenter, Stock, Doctors, etc.)
├── i18n.ts           # Internationalisation configuration
├── App.tsx           # Route definitions and protected-route logic
└── main.tsx          # Application entry point

---

## 🔒 Security Notes

- Role-based permissions are enforced through helper flags (`canEditStock`, `canManageBeds`, `canManageDoctors`, `canRegisterPatients`) checked before any create/update/delete action.
- Passwords are handled entirely by Firebase Authentication.
- Use Firestore Security Rules on your Firebase project to enforce role checks server-side as well.

---

## 🤝 Contributing

Contributions, issue reports, and feature suggestions are welcome. Please open an issue to discuss any significant changes before submitting a pull request.

---

## 📄 License

This project is available under the license of your choice — add a `LICENSE` file to specify one (e.g. MIT, Apache 2.0).

---

## 📬 Support

For questions or issues, please open an [issue](../../issues) on this repository.
