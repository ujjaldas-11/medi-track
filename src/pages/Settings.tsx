import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import SeedData from '../components/SeedData';
import { User, Bell } from '@phosphor-icons/react';

export default function Settings() {
  const { user, role } = useAuth();
  const { t } = useTranslation();

  return (
    <Layout title="System Settings">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left column: Profile & Preferences */}
        <div className="md:col-span-2 space-y-8">
          
          {/* User Profile */}
          <Card>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="p-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-150 rounded-xl">
                <User size={24} weight="bold" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">{t('accountProfile', 'Account Profile')}</h4>
                <p className="text-xs text-zinc-400">{t('accountProfileDesc', 'Current active account session information')}</p>
              </div>
            </div>
 
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider block">{t('emailAddress', 'Email Address')}</span>
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{user?.email}</span>
                </div>
                <div>
                  <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider block">{t('securityRole', 'Security Role')}</span>
                  <Badge variant="info" className="mt-1">{role}</Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Notifications config */}
          <Card>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="p-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-150 rounded-xl">
                <Bell size={24} weight="bold" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">{t('alertSettings', 'Alert Settings')}</h4>
                <p className="text-xs text-zinc-400">{t('alertSettingsDesc', 'Configure real-time notification warnings')}</p>
              </div>
            </div>
 
            <div className="space-y-4">
              {[
                { title: t('criticalStockAlerts', 'Critical Stock Alerts'), desc: t('settingsCriticalStockDesc', 'Display toasts when primary medicines fall below critical thresholds.') },
                { title: t('staffAbsenceWarnings', 'Staff Absence Warnings'), desc: t('settingsStaffAbsenceDesc', 'Generate system flags if doctors are absent for 3 consecutive days.') },
                { title: t('bedsOccupancyWarning', 'Beds Occupancy Warning'), desc: t('settingsBedsOccupancyDesc', 'Notify when General or ICU ward occupancy rate crosses 90%.') }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0 last:pb-0">
                  <div className="max-w-md">
                    <span className="text-sm font-bold text-zinc-700 dark:text-zinc-250 block">{item.title}</span>
                    <span className="text-xs text-zinc-400 leading-normal">{item.desc}</span>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    className="w-8 h-4.5 bg-zinc-200 dark:bg-zinc-850 rounded-full appearance-none checked:bg-zinc-900 dark:checked:bg-white relative cursor-pointer outline-none transition duration-200 before:content-[''] before:absolute before:w-3.5 before:h-3.5 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-3.5 before:transition before:shadow-sm"
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
