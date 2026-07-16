import { useData } from '../context/DataContext';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import { Card } from '../components/ui/Card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';
import { ChartLine, Pill, Users, Bed } from '@phosphor-icons/react';

export default function Analytics() {
  const { centers, stock, doctors, beds, footfall } = useData();
  const { t } = useTranslation();

  // Chart 1: Footfall trends
  const getFootfallChartData = () => {
    const dates = Array.from(new Set(footfall.map(f => f.date))).sort();
    return dates.map(date => {
      const dayData = footfall.filter(f => f.date === date);
      const opd = dayData.reduce((sum, curr) => sum + (curr.opdCount || 0), 0);
      const emergency = dayData.reduce((sum, curr) => sum + (curr.emergencyCount || 0), 0);
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        OPD: opd,
        Emergency: emergency
      };
    });
  };

  // Chart 2: Medicine usage
  const getMedicineChartData = () => {
    // Top 8 medicines based on usage
    const medMap: { [name: string]: number } = {};
    stock.forEach(item => {
      medMap[item.medicineName] = (medMap[item.medicineName] || 0) + (item.usedToday || 0);
    });

    return Object.entries(medMap)
      .map(([name, usage]) => ({ name: name.split(' ')[0], Usage: usage })) // Shorten name
      .sort((a, b) => b.Usage - a.Usage)
      .slice(0, 7);
  };

  // Chart 3: Doctor attendance by center
  const getDoctorChartData = () => {
    return centers.map(center => {
      const centerDocs = doctors.filter(d => d.centerId === center.id);
      const present = centerDocs.filter(d => d.isPresent).length;
      const absent = centerDocs.length - present;
      return {
        name: center.name.replace(' CHC', '').replace(' PHC', ''),
        Present: present,
        Absent: absent
      };
    });
  };

  // Chart 4: Bed occupancy
  const getBedsChartData = () => {
    return centers.map(center => {
      const centerBed = beds.find(b => b.centerId === center.id);
      const genTotal = centerBed?.generalTotal || 0;
      const genOcc = centerBed?.generalOccupied || 0;
      const icuTotal = centerBed?.icuTotal || 0;
      const icuOcc = centerBed?.icuOccupied || 0;

      return {
        name: center.name.replace(' CHC', '').replace(' PHC', ''),
        GeneralOccupied: genOcc,
        GeneralFree: genTotal - genOcc,
        IcuOccupied: icuOcc,
        IcuFree: icuTotal - icuOcc
      };
    });
  };

  const footfallData = getFootfallChartData();
  const medicineData = getMedicineChartData();
  const doctorData = getDoctorChartData();
  const bedsData = getBedsChartData();

  return (
    <Layout title="District Health Analytics">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Footfall area chart */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-150 rounded-lg">
              <ChartLine size={20} />
            </div>
            <div>
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-zinc-900 dark:text-zinc-200">{t('patientArrivalsTrend', 'Patient Arrivals Trend')}</h4>
              <p className="text-xs text-zinc-400">{t('totalDailyVisitsDesc', 'Total daily visits (OPD vs Emergency Units)')}</p>
            </div>
          </div>
 
          <div className="h-72">
            {footfallData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-400 text-sm">{t('noDataAvailable', 'No data available')}</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={footfallData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.92 0 0)" className="dark:stroke-zinc-800" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid oklch(0.92 0 0)', 
                      borderRadius: '0.75rem' 
                    }} 
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="OPD" stroke="#18181b" strokeWidth={2} fillOpacity={0.04} fill="#18181b" name={t('opdVisits', 'OPD Visits')} />
                  <Area type="monotone" dataKey="Emergency" stroke="#71717a" strokeWidth={2} fillOpacity={0.02} fill="#71717a" name={t('emergencyVisits', 'Emergency Visits')} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Medicine usage bar chart */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-150 rounded-lg">
              <Pill size={20} />
            </div>
            <div>
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-zinc-900 dark:text-zinc-200">{t('medicineConsumptionRate', 'Medicine Consumption Rate')}</h4>
              <p className="text-xs text-zinc-400">{t('totalDailyConsumedDesc', 'Total daily consumed units across centers')}</p>
            </div>
          </div>
 
          <div className="h-72">
            {medicineData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-400 text-sm">{t('noDataAvailable', 'No data available')}</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={medicineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.92 0 0)" className="dark:stroke-zinc-800" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid oklch(0.92 0 0)', 
                      borderRadius: '0.75rem' 
                    }} 
                  />
                  <Bar dataKey="Usage" fill="#18181b" radius={[4, 4, 0, 0]} name={t('unitsConsumed', 'Units Consumed')} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Doctor attendance stacked bar */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-150 rounded-lg">
              <Users size={20} />
            </div>
            <div>
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-zinc-900 dark:text-zinc-200">{t('doctorPresenceLog', 'Doctor Presence Log')}</h4>
              <p className="text-xs text-zinc-400">{t('attendanceComparisonDesc', 'Attendance comparison by health facility')}</p>
            </div>
          </div>
 
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={doctorData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.92 0 0)" className="dark:stroke-zinc-800" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid oklch(0.92 0 0)', 
                    borderRadius: '0.75rem' 
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Present" fill="#18181b" stackId="a" radius={[0, 0, 0, 0]} name={t('presentStaff', 'Present Staff')} />
                <Bar dataKey="Absent" fill="#e4e4e7" stackId="a" radius={[4, 4, 0, 0]} name={t('absentStaff', 'Absent Staff')} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
 
        {/* Bed occupancy details */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-150 rounded-lg">
              <Bed size={20} />
            </div>
            <div>
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-zinc-900 dark:text-zinc-200">{t('bedOccupancyDetails', 'Bed Occupancy Details')}</h4>
              <p className="text-xs text-zinc-400">{t('generalIcuOccupancyComparison', 'General and ICU ward occupancy comparison')}</p>
            </div>
          </div>
 
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bedsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.92 0 0)" className="dark:stroke-zinc-800" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid oklch(0.92 0 0)', 
                    borderRadius: '0.75rem' 
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="GeneralOccupied" fill="#18181b" name={t('generalOccupied', 'General Occupied')} />
                <Bar dataKey="IcuOccupied" fill="#a1a1aa" name={t('icuOccupied', 'ICU Occupied')} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>

    </Layout>
  );
}
