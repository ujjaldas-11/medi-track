import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

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

  const getMenuItems = () => {
    switch (role) {
      case 'cmo':
        return [
          { label: 'Command Centre', path: '/command' },
          { label: 'All Centres', path: '/all-centres' },
          { label: 'AI Recommendations', path: '/recommendations' },
        ];
      case 'mo':
        return [
          { label: 'Facility Dashboard', path: '/' },
          { label: 'Stock', path: '/stock' },
          { label: 'Beds', path: '/beds' },
          { label: 'Doctors', path: '/doctors' },
        ];
      case 'pharmacist':
        return [
          { label: 'Stock Management', path: '/stock' },
          { label: 'Alerts', path: '/alerts' },
        ];
      case 'frontdesk':
        return [
          { label: 'Patient Registration', path: '/registration' },
          { label: 'Footfall', path: '/footfall' },
          { label: 'Bed Status', path: '/beds' },
        ];
      case 'staff':
      default:
        return [
          { label: 'My Dashboard', path: '/' },
          { label: 'Attendance', path: '/doctors' },
          { label: 'Tests', path: '/tests' },
        ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">MediTrack</h1>
        <div className="flex items-center gap-4">
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