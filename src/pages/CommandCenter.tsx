import { useData } from '../context/DataContext';
import { useAlerts } from '../context/AlertsContext';
import { useTranslation } from 'react-i18next';
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
  const { centers, stock, doctors, beds, footfall } = useData();
  const { alerts } = useAlerts();
  const navigate = useNavigate();
  const { t } = useTranslation();

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
        
        <Card variant="default" hoverEffect>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">{t('totalCentres')}</p>
              <h3 className="text-3xl font-extrabold mt-1 text-zinc-900 dark:text-zinc-50">{totalCentres}</h3>
              <p className="text-xs text-zinc-400 mt-1">{t('chcPhcCount', { chcCount, phcCount, defaultValue: `${chcCount} CHCs / ${phcCount} PHCs` })}</p>
            </div>
            <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 rounded-2xl">
              <Buildings size={28} weight="duotone" />
            </div>
          </div>
        </Card>

        <Card variant="default" hoverEffect className="border-rose-500/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">{t('criticalStockAlerts')}</p>
              <h3 className="text-3xl font-extrabold mt-1 text-rose-650 dark:text-rose-500">{criticalAlerts}</h3>
              <Badge variant={criticalAlerts > 0 ? "critical" : "healthy"} className="mt-1.5">
                {criticalAlerts > 0 ? t('actionRequired') : t('systemClear')}
              </Badge>
            </div>
            <div className={`p-3 rounded-2xl ${criticalAlerts > 0 ? 'bg-rose-500/10 text-rose-500' : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800'}`}>
              <Warning size={28} weight="duotone" />
            </div>
          </div>
        </Card>

        <Card variant="default" hoverEffect>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">{t('doctorsAttendance')}</p>
              <h3 className="text-3xl font-extrabold mt-1 text-zinc-900 dark:text-zinc-55">{doctorPresentRatio}</h3>
              <p className="text-xs text-emerald-600 mt-1 font-semibold flex items-center gap-1">
                <TrendUp size={14} />
                {t('presentDuty')}
              </p>
            </div>
            <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 rounded-2xl">
              <Users size={28} weight="duotone" />
            </div>
          </div>
        </Card>

        <Card variant="default" hoverEffect>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">{t('availableBeds')}</p>
              <h3 className="text-3xl font-extrabold mt-1 text-zinc-900 dark:text-zinc-55">{totalBedsAvailable}</h3>
              <p className="text-xs text-zinc-400 mt-1">{t('outOfTotal', { total: totalBedsCapacity, defaultValue: `Out of ${totalBedsCapacity} total` })}</p>
            </div>
            <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 rounded-2xl">
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
            <Lightbulb size={22} className="text-zinc-900 dark:text-zinc-100" />
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-zinc-900 dark:text-zinc-200">{t('aiRecommendations')}</h4>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {recommendations.map((rec) => (
              <Card key={rec.id} className="border-l-4 border-l-zinc-900 dark:border-l-zinc-50 bg-white dark:bg-zinc-900 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <span className="text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400 tracking-widest">{rec.title}</span>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">{rec.desc}</p>
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
            <Warning size={22} className="text-rose-500" />
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-zinc-900 dark:text-zinc-200">{t('flaggedCentres')}</h4>
          </div>

          <Card className="p-0 overflow-hidden shadow-sm">
            {flaggedCentres.length === 0 ? (
              <div className="p-6 text-center text-sm text-zinc-400">
                <p>✅ {t('allCentresPerforming')}</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {flaggedCentres.map((center) => (
                  <div 
                    key={center.id} 
                    onClick={() => navigate(`/centres/${center.id}`)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition duration-150"
                  >
                    <div>
                      <h5 className="font-bold text-sm text-zinc-900 dark:text-zinc-200">{center.name}</h5>
                      <span className="text-xs text-zinc-400 capitalize">{center.address}</span>
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
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-zinc-900 dark:text-zinc-100">{t('patientFootfallTrend')}</h4>
              <p className="text-xs text-zinc-400">{t('footfallSub')}</p>
            </div>
            <TrendUp size={22} className="text-zinc-500" />
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={footfallChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.92 0 0)" className="dark:stroke-zinc-800" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid oklch(0.92 0 0)', 
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                  }} 
                  labelStyle={{ fontWeight: 'bold', color: '#18181b' }}
                />
                <Area type="monotone" dataKey="OPD" stroke="#18181b" strokeWidth={2} fillOpacity={0.04} fill="#18181b" />
                <Area type="monotone" dataKey="Emergency" stroke="#71717a" strokeWidth={2} fillOpacity={0.02} fill="#71717a" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        {/* Bed occupancy */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-zinc-900 dark:text-zinc-100">{t('bedOccupancyLevels')}</h4>
              <p className="text-xs text-zinc-400">{t('bedOccupancySub')}</p>
            </div>
            <Heartbeat size={22} className="text-zinc-500" />
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bedOccupancyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.92 0 0)" className="dark:stroke-zinc-800" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid oklch(0.92 0 0)', 
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 'semibold' }} />
                <Bar dataKey="General" stackId="a" fill="#18181b" radius={[4, 4, 0, 0]} name={t('generalBeds')} />
                <Bar dataKey="ICU" stackId="b" fill="#a1a1aa" radius={[4, 4, 0, 0]} name={t('icuBeds')} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>

      {/* 4. Complete health scores directory */}
      <div className="flex items-center gap-2 mb-6">
        <Buildings size={22} className="text-zinc-900 dark:text-zinc-100" />
        <h4 className="font-extrabold text-sm uppercase tracking-wider text-zinc-900 dark:text-zinc-200">{t('healthScorecard')}</h4>
      </div>

      <Card className="p-0 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('centreName')}</TableHead>
              <TableHead>{t('type')}</TableHead>
              <TableHead>{t('medicinesStockCol')}</TableHead>
              <TableHead>{t('bedsAvailable')}</TableHead>
              <TableHead>{t('presentDoctors')}</TableHead>
              <TableHead>{t('overallHealthScore')}</TableHead>
              <TableHead className="text-right">{t('action')}</TableHead>
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
              const bedFreeCount = totalB - occupiedB;

              const centerDoc = doctors.filter(d => d.centerId === center.id);
              const docRatio = `${centerDoc.filter(d => d.isPresent).length}/${centerDoc.length}`;

              const score = center.healthScore || 100;
              let scoreColor: 'healthy' | 'warning' | 'critical' = 'healthy';
              if (score < 60) scoreColor = 'critical';
              else if (score < 80) scoreColor = 'warning';

              return (
                <TableRow key={center.id}>
                  <TableCell className="font-bold text-zinc-900 dark:text-zinc-250">{center.name}</TableCell>
                  <TableCell><Badge variant="neutral">{center.type}</Badge></TableCell>
                  <TableCell>{t('healthyRatio', { stockRatio, defaultValue: `${stockRatio} Healthy` })}</TableCell>
                  <TableCell>{t('bedsFree', { count: bedFreeCount, defaultValue: `${bedFreeCount} Free` })}</TableCell>
                  <TableCell>{t('activeRatio', { docRatio, defaultValue: `${docRatio} Active` })}</TableCell>
                  <TableCell><Badge variant={scoreColor}>{score}%</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button 
                      onClick={() => navigate(`/centres/${center.id}`)}
                      size="sm"
                      variant="outline"
                    >
                      {t('viewDetails')}
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