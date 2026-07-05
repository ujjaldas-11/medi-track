import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAlerts } from '../context/AlertsContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Sun, 
  Moon, 
  List, 
  X, 
  User, 
  SignOut, 
  Plus, 
  Heartbeat,
  MapPin,
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
import { Button } from './ui/Button';
import LanguageSwitcher from './common/LanguageSwitcher';

export default function Layout({ children, title }: { 
  children: React.ReactNode; 
  title: string; 
}) {
  const { role, logout, user, canRegisterPatients, canEditStock, canManageBeds } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { alerts, unreadCount, markAsRead, markAllAsRead } = useAlerts();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
        { label: t('healthCentres'), path: '/centres', icon: <MapPin size={20} /> },
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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-[#0B2A4A] text-white shadow-md">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo + Mobile Hamburger */}
          <div className="flex items-center gap-3">
            {/* Hamburger Button for Mobile (opens sidebar drawer) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200"
            >
              {mobileMenuOpen ? <X size={20} weight="bold" /> : <List size={20} weight="bold" />}
            </button>

            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-[#0B2A4A] font-bold text-xl shadow-inner">
                M
              </div>
              <span className="font-extrabold text-lg tracking-wider uppercase">MediTrack</span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-teal-400 hover:text-teal-300 transition"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={20} weight="bold" /> : <Moon size={20} weight="bold" />}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => {
                  setAlertsOpen(!alertsOpen);
                  setProfileOpen(false);
                }}
                className={`p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white transition relative ${alertsOpen ? 'bg-slate-700' : ''}`}
                title="Notifications"
              >
                <Bell size={20} weight="bold" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 rounded-full text-[10px] font-black flex items-center justify-center animate-pulse">
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
                      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden text-slate-800 dark:text-slate-100"
                    >
                      <div className="p-4 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                        <span className="font-bold text-xs uppercase tracking-wider text-[#0B2A4A] dark:text-slate-350">Alert Feed ({unreadCount} new)</span>
                        {unreadCount > 0 && (
                          <button 
                            onClick={async () => {
                              await markAllAsRead();
                            }}
                            className="text-[10px] font-bold uppercase text-teal-600 dark:text-teal-400 hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50">
                        {alerts.length === 0 ? (
                          <div className="p-6 text-center text-sm text-slate-400">No active alerts.</div>
                        ) : (
                          alerts.map((alert) => (
                            <div 
                              key={alert.id} 
                              onClick={async () => {
                                if (!alert.isRead) await markAsRead(alert.id);
                              }}
                              className={`p-4 text-xs transition cursor-pointer flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/40 ${!alert.isRead ? 'bg-teal-500/5 font-semibold' : ''}`}
                            >
                              <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                                alert.severity === 'critical' 
                                  ? 'bg-rose-500' 
                                  : alert.severity === 'warning' 
                                    ? 'bg-amber-500' 
                                    : 'bg-sky-500'
                              }`} />
                              <div className="flex-1">
                                <p className="text-slate-700 dark:text-slate-200">{alert.message}</p>
                                <span className="text-[10px] text-slate-400 mt-1 block">
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
                className={`p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white transition flex items-center gap-1.5 ${profileOpen ? 'bg-slate-700' : ''}`}
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
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden text-slate-800 dark:text-slate-100"
                    >
                      <div className="p-4 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/50">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Signed In As</p>
                        <p className="text-sm font-semibold truncate text-[#0B2A4A] dark:text-slate-200">{user?.email}</p>
                        <Badge variant="info" className="mt-1.5">{role}</Badge>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            navigate('/settings');
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
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
          className={`hidden lg:flex flex-col shrink-0 sticky top-16 h-[calc(100vh-4rem)] bg-[#0B2A4A] text-white shadow-md transition-all duration-300 ${
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
                      ? 'bg-teal-500 text-[#0B2A4A]' 
                      : 'hover:bg-slate-800 text-slate-200 hover:text-white'
                  }`}
                >
                  {link.icon}
                  {!sidebarCollapsed && <span>{link.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Collapse Toggle */}
          <div className="p-3 border-t border-white/10">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-300 hover:bg-slate-800 hover:text-white transition ${
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
                className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="fixed top-0 left-0 z-50 h-full w-72 bg-[#0B2A4A] text-white shadow-2xl lg:hidden flex flex-col"
              >
                <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-[#0B2A4A] font-bold text-xl shadow-inner">
                      M
                    </div>
                    <span className="font-extrabold text-lg tracking-wider uppercase">MediTrack</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200"
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
                            ? 'bg-teal-500 text-[#0B2A4A]' 
                            : 'hover:bg-slate-800 text-slate-200 hover:text-white'
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
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2A4A] dark:text-slate-100 tracking-tight uppercase">
                {title}
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
    </div>
  );
}