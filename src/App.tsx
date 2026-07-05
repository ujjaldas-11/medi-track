import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import CommandCenter from './pages/CommandCenter';
// import CentresDirectory from './pages/CentresDirectory';
import CentresDirectory from './pages/CentersDirectory';
// import CentreDetail from '../pages/CentreDetail';
import CentreDetail from './pages/CenterDetail';
import Stock from './pages/Stock';
import Beds from './pages/Beds';
import Doctors from './pages/Doctors';
import Tests from './pages/Tests';
import Registration from './pages/Registration';
import Footfall from './pages/Footfall';
import RedistributionRequests from './pages/RedistributionRequests';
import StockAlerts from './pages/StockAlerts';
import Analytics from './pages/Analytics';
import MapView from './pages/MapView';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/command" element={<CommandCenter />} />
          <Route path="/centres" element={<CentresDirectory />} />
          <Route path="/centres/:id" element={<CentreDetail />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/beds" element={<Beds />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/footfall" element={<Footfall />} />
          <Route path="/requests" element={<RedistributionRequests />} />
          <Route path="/alerts-feed" element={<StockAlerts />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <svg className="animate-spin h-10 w-10 text-teal-500 mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Verifying Session...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default App;