import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { useAlerts } from '../context/AlertsContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  List, 
  X, 
  User, 
  SignOut, 
  Heartbeat,
  MapPin,
  Hospital,
  Warning,
  ChartBar,
  Pill,
  Users,
  Bed,
  TestTube,
  FileText,
  UserPlus,
  CaretLeft,
  CaretRight
} from '@phosphor-icons/react';
import { Badge } from './ui/Badge';
// import { Button } from './ui/Button';
// import { Button } from './ui/Button';
import LanguageSwitcher from './common/LanguageSwitcher';
import Chatbot from './common/Chatbot';

export default function Layout({ children, title }: { 
  children: React.ReactNode; 
  title: string; 
}) {
  const { role, logout, user } = useAuth();
  const { alerts, unreadCount, markAsRead, markAllAsRead } = useAlerts();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const titleKeys: Record<string, string> = {
    "District Command Centre": "commandCentre",
    "Medicines Stock Management": "medicinesStock",
    "Bed Availability Telemetry": "bedsStatus",
    "Doctors Attendance Directory": "doctorsDirectory",
    "Diagnostic & Equipment Units": "diagnosticEquipment",
    "Patient Registration Console": "registerPatients",
    "Daily Footfall Telemetry": "dailyFootfall",
    "Redistribution Requests": "requests",
    "Stock Alerts Feed": "alertsFeed",
    "District Analytics": "analytics",
    "Centres Telemetry Map": "mapView",
    "District Settings": "settings"
  };

  const displayTitle = titleKeys[title] ? t(titleKeys[title]) : title;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // const { t } = useTranslation();

 const getNavLinks = () => {
  const { t } = useTranslation();

  switch (role) {
    case 'cmo':
      return [
        { label: t('commandCentre'), path: '/command', icon: <Heartbeat size={20} /> },
        { label: t('healthCentres'), path: '/centres', icon: <Hospital size={20} /> },
        { label: t('registerPatients'), path: '/registration', icon: <UserPlus size={20} /> },
        { label: t('mapView'), path: '/map', icon: <MapPin size={20} /> },
        { label: t('requests'), path: '/requests', icon: <FileText size={20} /> },
        { label: t('alertsFeed'), path: '/alerts-feed', icon: <Warning size={20} /> },
        { label: t('analytics'), path: '/analytics', icon: <ChartBar size={20} /> },
      ];
    case 'mo':
      return [
        { label: t('facilityDetail'), path: '/centres', icon: <Heartbeat size={20} /> },
        { label: t('stock'), path: '/stock', icon: <Pill size={20} /> },
        { label: t('beds'), path: '/beds', icon: <Bed size={20} /> },
        { label: t('doctors'), path: '/doctors', icon: <Users size={20} /> },
        { label: t('diagnosticUnits'), path: '/tests', icon: <TestTube size={20} /> },
        { label: t('requests'), path: '/requests', icon: <FileText size={20} /> },
      ];
    case 'pharmacist':
      return [
        { label: t('medicinesStock'), path: '/stock', icon: <Pill size={20} /> },
        { label: t('requests'), path: '/requests', icon: <FileText size={20} /> },
        { label: t('stockAlerts'), path: '/alerts-feed', icon: <Warning size={20} /> },
      ];
    case 'frontdesk':
      return [
        { label: t('registerPatients'), path: '/registration', icon: <UserPlus size={20} /> },
        { label: t('dailyFootfall'), path: '/footfall', icon: <ChartBar size={20} /> },
        { label: t('bedsStatus'), path: '/beds', icon: <Bed size={20} /> },
      ];
    case 'staff':
    default:
      return [
        { label: t('doctorsDirectory'), path: '/doctors', icon: <Users size={20} /> },
        { label: t('diagnosticEquipment'), path: '/tests', icon: <TestTube size={20} /> },
      ];
  }
};
  const navLinks = getNavLinks();

  const handleLinkClick = (path: string) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/70 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo + Mobile Hamburger */}
          <div className="flex items-center gap-3">
            {/* Hamburger Button for Mobile (opens sidebar drawer) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-zinc-105 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
            >
              {mobileMenuOpen ? <X size={20} weight="bold" /> : <List size={20} weight="bold" />}
            </button>

            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00e1b2] to-[#0c5989] flex items-center justify-center text-white font-bold text-xl shadow-sm">
                M
              </div>
              <span className="font-extrabold text-lg tracking-tight uppercase">MediTrack</span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => {
                  setAlertsOpen(!alertsOpen);
                  setProfileOpen(false);
                }}
                className={`p-2 rounded-xl bg-zinc-55 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 transition relative ${alertsOpen ? 'bg-zinc-100 dark:bg-zinc-700' : ''}`}
                title="Notifications"
              >
                <Bell size={20} weight="bold" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-950 rounded-full text-[10px] font-black flex items-center justify-center animate-pulse shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {alertsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setAlertsOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 overflow-hidden text-zinc-800 dark:text-zinc-100"
                    >
                      <div className="p-4 border-b border-zinc-100 dark:border-zinc-850 flex justify-between items-center bg-zinc-55 dark:bg-zinc-950">
                        <span className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-300">Alert Feed ({unreadCount} new)</span>
                        {unreadCount > 0 && (
                          <button 
                            onClick={async () => {
                              await markAllAsRead();
                            }}
                            className="text-[10px] font-bold uppercase text-zinc-900 dark:text-zinc-250 hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
                        {alerts.length === 0 ? (
                          <div className="p-6 text-center text-sm text-zinc-400">No active alerts.</div>
                        ) : (
                          alerts.map((alert) => (
                            <div 
                              key={alert.id} 
                              onClick={async () => {
                                if (!alert.isRead) await markAsRead(alert.id);
                              }}
                              className={`p-4 text-xs transition cursor-pointer flex items-start gap-3 hover:bg-zinc-55 dark:hover:bg-zinc-800/40 ${!alert.isRead ? 'bg-zinc-900/5 dark:bg-zinc-50/5 font-semibold' : ''}`}
                            >
                              <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                                alert.severity === 'critical' 
                                  ? 'bg-rose-500' 
                                  : alert.severity === 'warning' 
                                    ? 'bg-amber-500' 
                                    : 'bg-zinc-500'
                              }`} />
                              <div className="flex-1">
                                <p className="text-zinc-700 dark:text-zinc-200">{alert.message}</p>
                                <span className="text-[10px] text-zinc-400 mt-1 block">
                                  {alert.createdAt ? new Date(alert.createdAt.seconds * 1000).toLocaleTimeString() : ''}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <LanguageSwitcher />

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setAlertsOpen(false);
                }}
                className={`p-2 rounded-xl bg-zinc-55 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-250 transition flex items-center gap-1.5 ${profileOpen ? 'bg-zinc-100 dark:bg-zinc-700' : ''}`}
                title="Profile"
              >
                <User size={20} weight="bold" />
                <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider">{role}</span>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 overflow-hidden text-zinc-800 dark:text-zinc-100"
                    >
                      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-55/50 dark:bg-zinc-950/50">
                        <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Signed In As</p>
                        <p className="text-sm font-semibold truncate text-zinc-900 dark:text-zinc-200">{user?.email}</p>
                        <Badge variant="info" className="mt-1.5">{role}</Badge>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            navigate('/settings');
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                        >
                          Account Settings
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition flex items-center gap-1.5 mt-1"
                        >
                          <SignOut size={16} weight="bold" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Role-Based Quick CTA
            {canRegisterPatients && (
              <Button 
                onClick={() => navigate('/registration')}
                size="sm"
                variant="primary"
                className="hidden md:flex items-center gap-1.5"
              >
                <Plus size={16} weight="bold" />
                Register
              </Button>
            )} */}

          </div>
        </div>
      </header>

      {/* Body: Sidebar + Main content */}
      <div className="flex-1 flex w-full max-w-[1600px] mx-auto">

        {/* Desktop Sidebar */}
        <aside 
          className={`hidden lg:flex flex-col shrink-0 sticky top-16 h-[calc(100vh-4rem)] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 ${
            sidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => handleLinkClick(link.path)}
                  title={sidebarCollapsed ? link.label : undefined}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    sidebarCollapsed ? 'justify-center' : ''
                  } ${
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-650 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  {link.icon}
                  {!sidebarCollapsed && <span>{link.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Collapse Toggle */}
          <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100 transition ${
                sidebarCollapsed ? 'justify-center' : ''
              }`}
              title={sidebarCollapsed ? 'Expand' : 'Collapse'}
            >
              {sidebarCollapsed ? <CaretRight size={18} weight="bold" /> : <><CaretLeft size={18} weight="bold" /> Collapse</>}
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="fixed top-0 left-0 z-50 h-full w-72 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-2xl lg:hidden flex flex-col border-r border-zinc-200 dark:border-zinc-800"
              >
                <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00e1b2] to-[#0c5989] flex items-center justify-center text-white font-bold text-xl shadow-sm">
                      M
                    </div>
                    <span className="font-extrabold text-lg tracking-tight uppercase">MediTrack</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                  >
                    <X size={20} weight="bold" />
                  </button>
                </div>
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                  {navLinks.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                      <button
                        key={link.path}
                        onClick={() => handleLinkClick(link.path)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                          isActive 
                            ? 'bg-primary text-primary-foreground shadow-sm' 
                            : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-650 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                        }`}
                      >
                        {link.icon}
                        {link.label}
                      </button>
                    );
                  })}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-8">
          {/* Animated Page Transitions */}
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight uppercase">
                {displayTitle}
              </h2>
            </div>
            {children}
          </motion.div>
        </main>
      </div>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} MediTrack District Health Management System. All rights reserved.
      </footer>
      
      {/* Context-aware Chatbot Assistant */}
      <Chatbot />
    </div>
  );
}