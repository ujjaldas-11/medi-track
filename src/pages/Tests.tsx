import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Shield } from '@phosphor-icons/react';
import { toast } from 'react-toastify';

export default function Tests() {
  const { tests, centers, updateTests } = useData();
  const { canManageBeds } = useAuth(); // canManageBeds represents MO/CMO who have clinical operations rights

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
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Facility Filter:</span>
          <select
            value={selectedCenterFilter}
            onChange={(e) => setSelectedCenterFilter(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-bold uppercase tracking-wider"
          >
            <option value="ALL">All Centres</option>
            {centers.map(center => (
              <option key={center.id} value={center.id}>{center.name}</option>
            ))}
          </select>
        </div>

        {!canManageBeds && (
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-400">
            <Shield size={16} />
            <span>Read-Only View</span>
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
            { name: 'bloodTest', label: 'Blood Testing Lab' },
            { name: 'ecg', label: 'ECG Machine' },
            { name: 'xray', label: 'X-Ray Scanner' },
            { name: 'ultrasound', label: 'Ultrasound Scanner' },
            { name: 'oxygen', label: 'Oxygen Generation Unit' },
            { name: 'ambulance', label: 'Emergency Ambulance Fleet' },
          ];

          return (
            <div key={center.id} className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-850">
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-[#0B2A4A] dark:text-slate-200">{center.name}</h4>
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
                          ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/10' 
                          : 'border-slate-250 dark:border-slate-800'
                      }`}
                    >
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200 leading-tight">
                        {eq.label}
                      </span>

                      <div className="flex items-center justify-between mt-4">
                        <span className={`text-[10px] font-black uppercase tracking-wider ${isAvailable ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                          {isAvailable ? 'Active' : 'Offline'}
                        </span>
                        
                        <input
                          type="checkbox"
                          checked={isAvailable}
                          disabled={!canManageBeds} // restricts updating equipment status to MO/CMO
                          onChange={() => handleToggleTest(center.id, eq.name, isAvailable)}
                          className="w-8 h-4.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none checked:bg-teal-500 relative cursor-pointer outline-none transition duration-200 before:content-[''] before:absolute before:w-3.5 before:h-3.5 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-3.5 before:transition before:shadow-sm"
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