import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Stock from './pages/Stock';
import Beds from './pages/Beds';
import Doctors from './pages/Doctors';
import Tests from './pages/Tests';
import Admin from './pages/Admin';
import CommandCentre from './pages/CommandCenter';
import Registration from './pages/Registration';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/command" element={<CommandCentre />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/beds" element={<Beds />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/registration" element={<Registration />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default App;