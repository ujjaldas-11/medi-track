import React from 'react';
import { useData } from '../context/DataContext';
import { useAlerts } from '../context/AlertsContext';
import Layout from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { 
  Buildings, 
  Warning, 
  Users, 
  Bed, 
  Lightbulb, 
  ArrowRight,
  TrendUp,
  Stethoscope,
  Heartbeat
} from '@phosphor-icons/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { useNavigate } from 'react-router-dom';

export default function CommandCenter() {
  const { centers, stock, doctors, beds, tests, requests, footfall } = useData();
  const { alerts } = useAlerts();
  const navigate = useNavigate();

  // 1. Calculations for aggregate stats
  const totalCentres = centers.length;
  const phcCount = centers.filter(c => c.type === 'PHC').length;
  const chcCount = centers.filter(c => c.type === 'CHC').length;

  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.isRead).length;

  const totalDoctors = doctors.length;
  const doctorsPresent = doctors.filter(d => d.isPresent).length;
  const doctorPresentRatio = totalDoctors > 0 ? `${doctorsPresent}/${totalDoctors}` : '0/0';

  let totalBedsAvailable = 0;
  let totalBedsCapacity = 0;
  beds.forEach(b => {
    totalBedsCapacity += b.generalTotal + b.icuTotal;
    totalBedsAvailable += (b.generalTotal - b.generalOccupied) + (b.icuTotal - b.icuOccupied);
  });

  // 2. Generate Rule-Based AI Recommendations
  const getAIRecommendations = () => {
    const recommendations: { id: string; type: 'stock' | 'doctor' | 'bed'; title: string; desc: string; actionText: string; actionPath: string }[] = [];

    // Rule A: Medicine stock-out or critical low
    const criticalStocks = stock.filter(s => s.currentStock <= s.minStock * 0.2);
    if (criticalStocks.length > 0) {
      const firstLow = criticalStocks[0];
      const targetCenterName = centers.find(c => c.id === firstLow.centerId)?.name || 'Facility';
      
      // Find another center with excess stock
      const supplier = stock.find(s => s.medicineName === firstLow.medicineName && s.centerId !== firstLow.centerId && s.currentStock > s.reorderThreshold);
      const supplierCenterName = supplier ? (centers.find(c => c.id === supplier.centerId)?.name || '') : '';

      recommendations.push({
        id: `rec-stock-${firstLow.id}`,
        type: 'stock',
        title: 'Medicine Redistribution Opportunity',
        desc: supplier 
          ? `${firstLow.medicineName} is critically low at ${targetCenterName} (${firstLow.currentStock} units). ${supplierCenterName} has excess stock (${supplier.currentStock} units). Consider a transfer.`
          : `${firstLow.medicineName} is critically low at ${targetCenterName} (${firstLow.currentStock} units). Reorder urgently or request redistribution.`,
        actionText: 'Initiate Request',
        actionPath: '/requests'
      });
    }

    // Rule B: Consecutive absences
    const longAbsences = doctors.filter(d => d.consecutiveAbsences >= 3);
    if (longAbsences.length > 0) {
      const doctor = longAbsences[0];
      const centerName = centers.find(c => c.id === doctor.centerId)?.name || 'Facility';
      recommendations.push({
        id: `rec-doc-${doctor.id}`,
        type: 'doctor',
        title: 'Consecutive Doctor Absence',
        desc: `${doctor.name} (${doctor.specialty}) at ${centerName} has been absent for ${doctor.consecutiveAbsences} days. Staff replacement or backup scheduling is advised.`,
        actionText: 'Manage Doctors',
        actionPath: '/doctors'
      });
    }

    // Rule C: Overloaded Beds
    const overloadedBeds = beds.filter(b => {
      const total = b.generalTotal + b.icuTotal;
      const occupied = b.generalOccupied + b.icuOccupied;
      return total > 0 && (occupied / total) >= 0.85;
    });
    if (overloadedBeds.length > 0) {
      const firstB = overloadedBeds[0];
      const center = centers.find(c => c.id === firstB.centerId);
      const total = firstB.generalTotal + firstB.icuTotal;
      const occupied = firstB.generalOccupied + firstB.icuOccupied;
      recommendations.push({
        id: `rec-bed-${firstB.id}`,
        type: 'bed',
        title: 'High Bed Occupancy Alert',
        desc: `${center?.name || 'Facility'} occupancy is at ${Math.round((occupied/total)*100)}% (${occupied}/${total} beds). Suggest diverting emergency admissions to neighboring clinics.`,
        actionText: 'View Bed Status',
        actionPath: `/centres/${firstB.centerId}`
      });
    }

    // Fallback recommendation
    if (recommendations.length === 0) {
      recommendations.push({
        id: 'rec-default',
        type: 'stock',
        title: 'All Resource Levels Stable',
        desc: 'District medicine stock levels, doctor attendance rates, and bed capacities are currently within normal thresholds.',
        actionText: 'Review Stock Levels',
        actionPath: '/stock'
      });
    }

    return recommendations;
  };

  const recommendations = getAIRecommendations();

  // 3. Flagged/Underperforming Centres (Health score < 70)
  const flaggedCentres = [...centers]
    .filter(c => (c.healthScore || 100) < 70)
    .sort((a, b) => (a.healthScore || 0) - (b.healthScore || 0));

  // 4. Analytics: Patient Footfall Trend Chart (Aggregated per date)
  const getAggregatedFootfall = () => {
    const dates = Array.from(new Set(footfall.map(f => f.date))).sort();
    return dates.map(date => {
      const dayData = footfall.filter(f => f.date === date);
      const opd = dayData.reduce((sum, current) => sum + (current.opdCount || 0), 0);
      const emergency = dayData.reduce((sum, current) => sum + (current.emergencyCount || 0), 0);
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        OPD: opd,
        Emergency: emergency,
        Total: opd + emergency
      };
    });
  };

  const footfallChartData = getAggregatedFootfall();

  // 5. Analytics: Bed Occupancy Chart by Center
  const getBedOccupancyChartData = () => {
    return centers.map(center => {
      const centerBed = beds.find(b => b.centerId === center.id);
      const generalOccupied = centerBed?.generalOccupied || 0;
      const generalTotal = centerBed?.generalTotal || 0;
      const icuOccupied = centerBed?.icuOccupied || 0;
      const icuTotal = centerBed?.icuTotal || 0;

      return {
        name: center.name.replace(" CHC", "").replace(" PHC", ""),
        General: generalOccupied,
        GeneralCap: generalTotal,
        ICU: icuOccupied,
        ICUCap: icuTotal
      };
    });
  };

  const bedOccupancyData = getBedOccupancyChartData();

  return (
    <Layout title="District Command Centre">
      
      {/* 1. Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        <Card variant="premium" hoverEffect>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Total Centres</p>
              <h3 className="text-3xl font-extrabold mt-1 text-[#0B2A4A] dark:text-slate-100">{totalCentres}</h3>
              <p className="text-xs text-slate-400 mt-1">{chcCount} CHCs / {phcCount} PHCs</p>
            </div>
            <div className="p-3 bg-teal-500/10 text-teal-500 rounded-2xl">
              <Buildings size={28} weight="duotone" />
            </div>
          </div>
        </Card>

        <Card variant="default" hoverEffect className="border-rose-500/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Critical Stock Alerts</p>
              <h3 className="text-3xl font-extrabold mt-1 text-rose-600 dark:text-rose-500">{criticalAlerts}</h3>
              <Badge variant={criticalAlerts > 0 ? "critical" : "healthy"} className="mt-1.5">
                {criticalAlerts > 0 ? "Action Required" : "System Clear"}
              </Badge>
            </div>
            <div className={`p-3 rounded-2xl ${criticalAlerts > 0 ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
              <Warning size={28} weight="duotone" />
            </div>
          </div>
        </Card>

        <Card variant="default" hoverEffect>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Doctors Attendance</p>
              <h3 className="text-3xl font-extrabold mt-1 text-[#0B2A4A] dark:text-slate-100">{doctorPresentRatio}</h3>
              <p className="text-xs text-emerald-500 mt-1 font-semibold flex items-center gap-1">
                <TrendUp size={14} />
                Present Duty
              </p>
            </div>
            <div className="p-3 bg-teal-500/10 text-teal-500 rounded-2xl">
              <Users size={28} weight="duotone" />
            </div>
          </div>
        </Card>

        <Card variant="default" hoverEffect>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Available Beds</p>
              <h3 className="text-3xl font-extrabold mt-1 text-[#0B2A4A] dark:text-slate-100">{totalBedsAvailable}</h3>
              <p className="text-xs text-slate-450 mt-1">Out of {totalBedsCapacity} total</p>
            </div>
            <div className="p-3 bg-teal-500/10 text-teal-500 rounded-2xl">
              <Bed size={28} weight="duotone" />
            </div>
          </div>
        </Card>

      </div>

      {/* 2. AI recommendations & Flagged Centers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2">
            <Lightbulb size={24} className="text-teal-500" weight="duotone" />
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-[#0B2A4A] dark:text-slate-200">AI Resource Recommendations</h4>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {recommendations.map((rec) => (
              <Card key={rec.id} className="border-l-4 border-l-teal-500 bg-white dark:bg-slate-800 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <span className="text-[10px] font-black uppercase text-teal-600 dark:text-teal-400 tracking-widest">{rec.title}</span>
                    <p className="text-sm text-slate-650 dark:text-slate-350 mt-1">{rec.desc}</p>
                  </div>
                  <Button 
                    onClick={() => navigate(rec.actionPath)}
                    size="sm"
                    className="self-start sm:self-center flex items-center gap-1 shadow-sm"
                  >
                    {rec.actionText}
                    <ArrowRight size={14} weight="bold" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Flagged Centers */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Warning size={24} className="text-rose-500" weight="duotone" />
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-[#0B2A4A] dark:text-slate-200">Flagged Centres</h4>
          </div>

          <Card className="p-0 overflow-hidden shadow-sm">
            {flaggedCentres.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-400">
                <p>✅ All health centres are currently performing above standard thresholds.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-750">
                {flaggedCentres.map((center) => (
                  <div 
                    key={center.id} 
                    onClick={() => navigate(`/centres/${center.id}`)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750/30 transition duration-150"
                  >
                    <div>
                      <h5 className="font-bold text-sm text-[#0B2A4A] dark:text-slate-200">{center.name}</h5>
                      <span className="text-xs text-slate-400 capitalize">{center.address}</span>
                    </div>
                    <Badge variant={(center.healthScore || 0) < 60 ? "critical" : "warning"}>
                      Score: {center.healthScore}%
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

      </div>

      {/* 3. Recharts Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Patient Footfall */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-[#0B2A4A] dark:text-slate-250">Patient Footfall Trend</h4>
              <p className="text-xs text-slate-400">District-wide daily patient arrivals (OPD & Emergency)</p>
            </div>
            <TrendUp size={24} className="text-teal-500" />
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={footfallChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOPD" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEmergency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: 'none', 
                    borderRadius: '1rem',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }} 
                  labelStyle={{ fontWeight: 'bold', color: '#0B2A4A' }}
                />
                <Area type="monotone" dataKey="OPD" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#colorOPD)" />
                <Area type="monotone" dataKey="Emergency" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorEmergency)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Bed occupancy */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-[#0B2A4A] dark:text-slate-250">Bed Occupancy Levels</h4>
              <p className="text-xs text-slate-400">Current active ward occupancy by facility</p>
            </div>
            <Heartbeat size={24} className="text-teal-500" />
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bedOccupancyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: 'none', 
                    borderRadius: '1rem',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 'semibold' }} />
                <Bar dataKey="General" stackId="a" fill="#14b8a6" radius={[4, 4, 0, 0]} name="General Beds" />
                <Bar dataKey="ICU" stackId="b" fill="#0B2A4A" radius={[4, 4, 0, 0]} name="ICU Beds" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>

      {/* 4. Complete health scores directory */}
      <div className="flex items-center gap-2 mb-6">
        <Buildings size={24} className="text-teal-500" weight="duotone" />
        <h4 className="font-extrabold text-sm uppercase tracking-wider text-[#0B2A4A] dark:text-slate-200">District Health Scorecard</h4>
      </div>

      <Card className="p-0 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Centre Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Medicines Stock</TableHead>
              <TableHead>Beds Available</TableHead>
              <TableHead>Present Doctors</TableHead>
              <TableHead>Overall Health Score</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {centers.map((center) => {
              const centerStock = stock.filter(s => s.centerId === center.id);
              const healthyStock = centerStock.filter(s => s.currentStock >= s.minStock).length;
              const stockRatio = centerStock.length > 0 ? `${healthyStock}/${centerStock.length}` : '0/0';

              const centerBed = beds.find(b => b.centerId === center.id);
              const totalB = (centerBed?.generalTotal || 0) + (centerBed?.icuTotal || 0);
              const occupiedB = (centerBed?.generalOccupied || 0) + (centerBed?.icuOccupied || 0);
              const bedRatio = `${totalB - occupiedB} Free`;

              const centerDoc = doctors.filter(d => d.centerId === center.id);
              const docRatio = `${centerDoc.filter(d => d.isPresent).length}/${centerDoc.length}`;

              const score = center.healthScore || 100;
              let scoreColor: 'healthy' | 'warning' | 'critical' = 'healthy';
              if (score < 60) scoreColor = 'critical';
              else if (score < 80) scoreColor = 'warning';

              return (
                <TableRow key={center.id}>
                  <TableCell className="font-bold text-[#0B2A4A] dark:text-slate-200">{center.name}</TableCell>
                  <TableCell><Badge variant="neutral">{center.type}</Badge></TableCell>
                  <TableCell>{stockRatio} Healthy</TableCell>
                  <TableCell>{bedRatio}</TableCell>
                  <TableCell>{docRatio} Active</TableCell>
                  <TableCell><Badge variant={scoreColor}>{score}%</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button 
                      onClick={() => navigate(`/centres/${center.id}`)}
                      size="sm"
                      variant="outline"
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
      
    </Layout>
  );
}