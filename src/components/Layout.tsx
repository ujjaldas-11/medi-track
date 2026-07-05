import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import LanguageSwitcher from './common/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export default function Layout({ children, title }: { 
  children: React.ReactNode, 
  title: string 
}) {
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
const { t } = useTranslation();

const getMenuItems = () => {
  switch (role) {
    case 'cmo':
      return [
        { label: t('commandCentre'), path: '/command' },
        { label: t('allCentres'), path: '/all-centres' },
        { label: t('aiRecommendations'), path: '/recommendations' },
      ];
    case 'mo':
      return [
        { label: t('facilityDashboard'), path: '/' },
        { label: t('stockManagement'), path: '/stock' },
        { label: t('beds'), path: '/beds' },
        { label: t('doctors'), path: '/doctors' },
      ];
    case 'pharmacist':
      return [
        { label: t('stockManagement'), path: '/stock' },
        { label: t('alerts'), path: '/alerts' },
      ];
    case 'frontdesk':
      return [
        { label: t('patientRegistration'), path: '/registration' },
        { label: t('footfall'), path: '/footfall' },
        { label: t('bedStatus'), path: '/beds' },
      ];
    case 'staff':
    default:
      return [
        { label: t('myDashboard'), path: '/' },
        { label: t('attendance'), path: '/doctors' },
        { label: t('tests'), path: '/tests' },
      ];
  }
};
  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">{t('title')}</h1>
        <div className="flex items-center gap-4">
            <LanguageSwitcher/>
          <span className="text-sm capitalize">{role}</span>
          <button 
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-72 bg-white h-screen p-5 shadow border-r">
          <nav className="space-y-2">
            {menuItems.map((item, index) => (
              <a 
                key={index}
                href={item.path}
                className="block py-4 px-5 hover:bg-blue-50 rounded-xl text-gray-700 hover:text-blue-600 font-medium transition"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <h2 className="text-3xl font-semibold mb-8 text-gray-800">{title}</h2>
          {children}
        </div>
      </div>
    </div>
  );
}   