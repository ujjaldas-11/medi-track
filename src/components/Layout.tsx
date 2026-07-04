import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';

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

  // Role-based menu items
  const getMenuItems = () => {
    switch (role) {
      case 'cmo':
        return [
          { label: 'Command Centre', path: '/' },
          { label: 'All Centres', path: '/all-centres' },
          { label: 'AI Recommendations', path: '/recommendations' },
          { label: 'Performance Flags', path: '/flags' },
        ];
      case 'mo':
        return [
          { label: 'Facility Dashboard', path: '/' },
          { label: 'Stock', path: '/stock' },
          { label: 'Beds', path: '/beds' },
          { label: 'Doctors', path: '/doctors' },
          { label: 'Redistribution', path: '/redistribution' },
        ];
      case 'pharmacist':
        return [
          { label: 'Inventory', path: '/stock' },
          { label: 'Stock Alerts', path: '/alerts' },
          { label: 'Audit', path: '/audit' },
        ];
      case 'frontdesk':
        return [
          { label: 'Patient Registration', path: '/' },
          { label: 'Footfall', path: '/footfall' },
          { label: 'Bed Status', path: '/beds' },
        ];
      case 'staff':
      default:
        return [
          { label: 'My Dashboard', path: '/' },
          { label: 'Attendance', path: '/attendance' },
          { label: 'Tests', path: '/tests' },
        ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">MediTrack</h1>
        
        <div className="flex items-center gap-4">
          <span className="text-sm capitalize font-medium">
            {role} • {auth.currentUser?.email}
          </span>
          <button 
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white h-screen p-4 shadow border-r overflow-auto">
          <nav className="space-y-1">
            {menuItems.map((item, index) => (
              <a 
                key={index}
                href={item.path} 
                className="block py-3 px-4 hover:bg-blue-50 rounded text-gray-700 hover:text-blue-600"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <h2 className="text-2xl font-semibold mb-6">{title}</h2>
          {children}
        </div>
      </div>
    </div>
  );
}