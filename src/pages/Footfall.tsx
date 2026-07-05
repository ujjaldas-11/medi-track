import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Input, Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';
import { Plus, Warning } from '@phosphor-icons/react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const footfallSchema = z.object({
  centerId: z.string().min(1, 'Please select a health centre'),
  date: z.string().min(1, 'Please select a date'),
  opdCount: z.number().min(0, 'Must be 0 or more'),
  emergencyCount: z.number().min(0, 'Must be 0 or more')
});

type FootfallFormData = z.infer<typeof footfallSchema>;

export default function Footfall() {
  const { centers, footfall, logFootfall } = useData();
  const { canRegisterPatients } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [selectedCenterFilter, setSelectedCenterFilter] = useState('ALL');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FootfallFormData>({
    resolver: zodResolver(footfallSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      opdCount: 20,
      emergencyCount: 5
    }
  });

  const onSubmit = async (data: FootfallFormData) => {
    setSubmitting(true);
    try {
      await logFootfall(data.centerId, Number(data.opdCount), Number(data.emergencyCount), data.date);
      toast.success('Patient footfall counts logged successfully!');
      reset({
        date: new Date().toISOString().split('T')[0],
        opdCount: 20,
        emergencyCount: 5,
        centerId: ''
      });
    } catch (e) {
      console.error(e);
      toast.error('Failed to log footfall.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter footfall logs by center
  const filteredFootfallLogs = [...footfall]
    .filter(log => selectedCenterFilter === 'ALL' || log.centerId === selectedCenterFilter)
    .sort((a, b) => b.date.localeCompare(a.date));

  // Compute chart data: group by date
  const getChartData = () => {
    const dailyMap: { [date: string]: { date: string; OPD: number; Emergency: number } } = {};
    
    // Sort dates first
    const sortedLogs = [...footfall].sort((a,b) => a.date.localeCompare(b.date));
    
    sortedLogs.forEach(log => {
      // If we are filtering by center and it doesn't match, skip
      if (selectedCenterFilter !== 'ALL' && log.centerId !== selectedCenterFilter) return;

      if (!dailyMap[log.date]) {
        dailyMap[log.date] = {
          date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          OPD: 0,
          Emergency: 0
        };
      }
      dailyMap[log.date].OPD += (log.opdCount || 0);
      dailyMap[log.date].Emergency += (log.emergencyCount || 0);
    });

    return Object.values(dailyMap);
  };

  const chartData = getChartData();

  return (
    <Layout title="Patient Footfall Tracking">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Logger Form */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 bg-teal-500/10 text-teal-500 rounded-xl">
                <Plus size={24} weight="bold" />
              </div>
              <div>
                <h4 className="font-bold text-[#0B2A4A] dark:text-slate-100 uppercase tracking-wide">Log Daily Counts</h4>
                <p className="text-xs text-slate-400">Record daily visitor footfalls per facility</p>
              </div>
            </div>

            {canRegisterPatients ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Select
                  label="Health Centre"
                  error={errors.centerId?.message}
                  {...register('centerId')}
                >
                  <option value="">-- Select Center --</option>
                  {centers.map(center => (
                    <option key={center.id} value={center.id}>
                      {center.name}
                    </option>
                  ))}
                </Select>

                <Input
                  label="Log Date"
                  type="date"
                  error={errors.date?.message}
                  {...register('date')}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="OPD Counts"
                    type="number"
                    error={errors.opdCount?.message}
                    {...register('opdCount', { valueAsNumber: true })}
                  />
                  <Input
                    label="Emergency Counts"
                    type="number"
                    error={errors.emergencyCount?.message}
                    {...register('emergencyCount', { valueAsNumber: true })}
                  />
                </div>

                <Button
                  type="submit"
                  loading={submitting}
                  className="w-full mt-4"
                >
                  Save Daily Log
                </Button>
              </form>
            ) : (
              <div className="p-4 rounded-2xl bg-rose-500/5 text-rose-500 text-xs border border-rose-500/10 flex flex-col items-center text-center">
                <Warning size={20} className="mb-2" />
                <span className="font-bold uppercase tracking-wider">Access Restricted</span>
                <p className="mt-1 text-slate-500">Only Front Desk staff and CMOs are permitted to log daily patient counts.</p>
              </div>
            )}
          </Card>
        </div>

        {/* Right Side: Charts & Historical Records */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Trend Chart */}
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-[#0B2A4A] dark:text-slate-200">Patient Volume Trend</h4>
                <p className="text-xs text-slate-400">Visitor counts grouped by date</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Center:</span>
                <select
                  value={selectedCenterFilter}
                  onChange={(e) => setSelectedCenterFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200"
                >
                  <option value="ALL">All Centres</option>
                  {centers.map(center => (
                    <option key={center.id} value={center.id}>{center.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="h-72">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm font-semibold">
                  No visitor stats available for selected filters.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="opdColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="emgColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="OPD" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#opdColor)" name="OPD Visits" />
                    <Area type="monotone" dataKey="Emergency" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#emgColor)" name="Emergency Units" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* Historical Logs List */}
          <div>
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-[#0B2A4A] dark:text-slate-200 mb-4">Historical Visitor Log</h4>
            <Card className="p-0 overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Log Date</TableHead>
                    <TableHead>Centre Name</TableHead>
                    <TableHead>OPD Count</TableHead>
                    <TableHead>Emergency Count</TableHead>
                    <TableHead>Total Visitations</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFootfallLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-slate-400">
                        No footfall history recorded.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFootfallLogs.map((log) => {
                      const centerName = centers.find(c => c.id === log.centerId)?.name || 'Unknown Centre';
                      return (
                        <TableRow key={log.id}>
                          <TableCell className="font-semibold text-slate-800 dark:text-slate-200">
                            {new Date(log.date).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                          </TableCell>
                          <TableCell>{centerName}</TableCell>
                          <TableCell>{log.opdCount}</TableCell>
                          <TableCell>{log.emergencyCount}</TableCell>
                          <TableCell className="font-bold text-slate-800 dark:text-slate-200">
                            {(log.opdCount || 0) + (log.emergencyCount || 0)} visits
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>

        </div>

      </div>

    </Layout>
  );
}
