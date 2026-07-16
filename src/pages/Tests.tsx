import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Shield } from '@phosphor-icons/react';
import { toast } from 'react-toastify';

export default function Tests() {
  const { tests, centers, updateTests } = useData();
  const { canManageBeds } = useAuth(); // canManageBeds represents MO/CMO who have clinical operations rights
  const { t } = useTranslation();

  const [selectedCenterFilter, setSelectedCenterFilter] = useState('ALL');

  const handleToggleTest = async (centerId: string, testName: string, currentVal: boolean) => {
    if (!canManageBeds) return;
    const centerTests = tests.find(t => t.centerId === centerId) || {
      bloodTest: false, ecg: false, xray: false, ultrasound: false, oxygen: false, ambulance: false
    };

    try {
      const updateData = {
        bloodTest: centerTests.bloodTest,
        ecg: centerTests.ecg,
        xray: centerTests.xray,
        ultrasound: centerTests.ultrasound,
        oxygen: centerTests.oxygen,
        ambulance: centerTests.ambulance,
        [testName]: !currentVal
      };
      await updateTests(centerId, updateData);
      toast.success('Diagnostic equipment status updated.');
    } catch (e) {
      console.error(e);
      toast.error('Failed to toggle equipment.');
    }
  };

  const displayCenters = centers.filter(c => selectedCenterFilter === 'ALL' || c.id === selectedCenterFilter);

  return (
    <Layout title="Diagnostic Units & Equipment">
      
      {/* Search & Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2">
          <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">{t('facilityFilter')}</span>
          <select
            value={selectedCenterFilter}
            onChange={(e) => setSelectedCenterFilter(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 text-xs font-bold uppercase tracking-wider outline-none"
          >
            <option value="ALL">{t('allCentres')}</option>
            {centers.map(center => (
              <option key={center.id} value={center.id}>{center.name}</option>
            ))}
          </select>
        </div>
 
        {!canManageBeds && (
          <div className="flex items-center gap-1 text-xs font-semibold text-zinc-400">
            <Shield size={16} />
            <span>{t('readOnlyView')}</span>
          </div>
        )}
      </div>

      {/* Equipment status grids per center */}
      <div className="space-y-8">
        {displayCenters.map(center => {
          const centerTests = tests.find(t => t.centerId === center.id) || {
            bloodTest: false,
            ecg: false,
            xray: false,
            ultrasound: false,
            oxygen: false,
            ambulance: false
          };

          const equipments = [
            { name: 'bloodTest', labelKey: 'bloodTestLab', defaultLabel: 'Blood Testing Lab' },
            { name: 'ecg', labelKey: 'ecgMachine', defaultLabel: 'ECG Machine' },
            { name: 'xray', labelKey: 'xrayScanner', defaultLabel: 'X-Ray Scanner' },
            { name: 'ultrasound', labelKey: 'ultrasoundScanner', defaultLabel: 'Ultrasound Scanner' },
            { name: 'oxygen', labelKey: 'oxygenUnit', defaultLabel: 'Oxygen Generation Unit' },
            { name: 'ambulance', labelKey: 'ambulanceFleet', defaultLabel: 'Emergency Ambulance Fleet' },
          ];
 
          return (
            <div key={center.id} className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-zinc-900 dark:text-zinc-200">{center.name}</h4>
                <Badge variant="neutral">{center.type}</Badge>
              </div>
 
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {equipments.map(eq => {
                  const isAvailable = (centerTests as any)[eq.name];
 
                  return (
                    <Card 
                      key={eq.name} 
                      className={`flex flex-col justify-between p-4 h-32 border transition duration-150 ${
                        isAvailable 
                          ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-955/10' 
                          : 'border-zinc-200 dark:border-zinc-800'
                      }`}
                    >
                      <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200 leading-tight">
                        {t(eq.labelKey, eq.defaultLabel)}
                      </span>
 
                      <div className="flex items-center justify-between mt-4">
                        <span className={`text-[10px] font-black uppercase tracking-wider ${isAvailable ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`}>
                          {isAvailable ? t('activeStatus') : t('offlineStatus')}
                        </span>
                        
                        <input
                          type="checkbox"
                          checked={isAvailable}
                          disabled={!canManageBeds} // restricts updating equipment status to MO/CMO
                          onChange={() => handleToggleTest(center.id, eq.name, isAvailable)}
                          className="w-8 h-4.5 bg-zinc-200 dark:bg-zinc-850 rounded-full appearance-none checked:bg-zinc-900 dark:checked:bg-white relative cursor-pointer outline-none transition duration-200 before:content-[''] before:absolute before:w-3.5 before:h-3.5 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-3.5 before:transition before:shadow-sm"
                        />
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

    </Layout>
  );
}