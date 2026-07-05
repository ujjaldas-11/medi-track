import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import SeedData from '../components/SeedData';
import { User, Sun, Moon, Bell } from '@phosphor-icons/react';

export default function Settings() {
  const { user, role } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <Layout title="System Settings">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left column: Profile & Preferences */}
        <div className="md:col-span-2 space-y-8">
          
          {/* User Profile */}
          <Card>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 bg-teal-500/10 text-teal-500 rounded-xl">
                <User size={24} weight="bold" />
              </div>
              <div>
                <h4 className="font-bold text-[#0B2A4A] dark:text-slate-100 uppercase tracking-wide">Account Profile</h4>
                <p className="text-xs text-slate-400">Current active account session information</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Email Address</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user?.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Security Role</span>
                  <Badge variant="info" className="mt-1">{role}</Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Theme customizer */}
          <Card>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 bg-teal-500/10 text-teal-500 rounded-xl">
                {theme === 'dark' ? <Moon size={24} weight="bold" /> : <Sun size={24} weight="bold" />}
              </div>
              <div>
                <h4 className="font-bold text-[#0B2A4A] dark:text-slate-100 uppercase tracking-wide">Interface Aesthetics</h4>
                <p className="text-xs text-slate-400">Toggle dark / light appearance themes</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-250 block">Dark Mode Theme</span>
                <span className="text-xs text-slate-405">Optimize display contrast for low-light clinical environments</span>
              </div>
              <button
                onClick={toggleTheme}
                className="w-12 h-6 bg-slate-250 dark:bg-teal-500 rounded-full relative cursor-pointer transition duration-200 outline-none before:content-[''] before:absolute before:w-5 before:h-5 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 dark:before:translate-x-6 before:transition before:shadow-sm"
              />
            </div>
          </Card>

          {/* Notifications config */}
          <Card>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 bg-teal-500/10 text-teal-500 rounded-xl">
                <Bell size={24} weight="bold" />
              </div>
              <div>
                <h4 className="font-bold text-[#0B2A4A] dark:text-slate-100 uppercase tracking-wide">Alert Settings</h4>
                <p className="text-xs text-slate-400">Configure real-time notification warnings</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { title: 'Critical Stock Alerts', desc: 'Display toasts when primary medicines fall below critical thresholds.' },
                { title: 'Staff Absence Warnings', desc: 'Generate system flags if doctors are absent for 3 consecutive days.' },
                { title: 'Beds Occupancy Warning', desc: 'Notify when General or ICU ward occupancy rate crosses 90%.' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800 last:border-0 last:pb-0">
                  <div className="max-w-md">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-250 block">{item.title}</span>
                    <span className="text-xs text-slate-400 leading-normal">{item.desc}</span>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    className="w-8 h-4.5 bg-slate-200 dark:bg-teal-500 rounded-full appearance-none checked:bg-teal-500 relative cursor-pointer outline-none transition duration-200 before:content-[''] before:absolute before:w-3.5 before:h-3.5 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-3.5 before:transition before:shadow-sm"
                  />
                </div>
              ))}
            </div>
          </Card>

        </div>

        {/* Right column: Seeder tools */}
        <div className="md:col-span-1">
          <SeedData />
        </div>

      </div>

    </Layout>
  );
}
