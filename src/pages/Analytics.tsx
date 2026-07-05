import React from 'react';
import { useData } from '../context/DataContext';
import Layout from '../components/Layout';
import { Card } from '../components/ui/Card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { ChartLine, Pill, Users, Bed } from '@phosphor-icons/react';

export default function Analytics() {
  const { centers, stock, doctors, beds, footfall } = useData();

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
            <div className="p-2 bg-teal-500/10 text-teal-500 rounded-lg">
              <ChartLine size={20} />
            </div>
            <div>
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-[#0B2A4A] dark:text-slate-200">Patient Arrivals Trend</h4>
              <p className="text-xs text-slate-400">Total daily visits (OPD vs Emergency Units)</p>
            </div>
          </div>

          <div className="h-72">
            {footfallData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={footfallData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaOPD" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="areaEMG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="OPD" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#areaOPD)" name="OPD Visits" />
                  <Area type="monotone" dataKey="Emergency" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#areaEMG)" name="Emergency Visits" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Medicine usage bar chart */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-teal-500/10 text-teal-500 rounded-lg">
              <Pill size={20} />
            </div>
            <div>
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-[#0B2A4A] dark:text-slate-200">Medicine Consumption Rate</h4>
              <p className="text-xs text-slate-400">Total daily consumed units across centers</p>
            </div>
          </div>

          <div className="h-72">
            {medicineData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={medicineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="Usage" fill="#0B2A4A" radius={[4, 4, 0, 0]} name="Units Consumed" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Doctor attendance stacked bar */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-teal-500/10 text-teal-500 rounded-lg">
              <Users size={20} />
            </div>
            <div>
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-[#0B2A4A] dark:text-slate-200">Doctor Presence Log</h4>
              <p className="text-xs text-slate-400">Attendance comparison by health facility</p>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={doctorData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Present" fill="#14b8a6" stackId="a" radius={[0, 0, 0, 0]} name="Present Staff" />
                <Bar dataKey="Absent" fill="#f43f5e" stackId="a" radius={[4, 4, 0, 0]} name="Absent Staff" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Bed occupancy details */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-teal-500/10 text-teal-500 rounded-lg">
              <Bed size={20} />
            </div>
            <div>
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-[#0B2A4A] dark:text-slate-200">Bed Occupancy Details</h4>
              <p className="text-xs text-slate-400">General and ICU ward occupancy comparison</p>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bedsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="GeneralOccupied" fill="#14b8a6" name="General Occupied" />
                <Bar dataKey="IcuOccupied" fill="#0B2A4A" name="ICU Occupied" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>

    </Layout>
  );
}
