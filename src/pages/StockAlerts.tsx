import { useState } from 'react';
import { useAlerts } from '../context/AlertsContext';
import { useData } from '../context/DataContext';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { ArrowRight } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';

export default function StockAlerts() {
  const { alerts, markAsRead } = useAlerts();
  const { centers } = useData();
  const navigate = useNavigate();
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING'>('ALL');
  const { t } = useTranslation();

  // Filter alerts for stock issues
  const stockAlerts = alerts.filter(a => {
    const isStockAlert = a.type === 'low_stock' || a.type === 'critical_stock';
    if (!isStockAlert) return false;

    if (severityFilter === 'ALL') return true;
    if (severityFilter === 'CRITICAL') return a.severity === 'critical';
    if (severityFilter === 'WARNING') return a.severity === 'warning';
    
    return true;
  });

  return (
    <Layout title="Low Stock Alerts Feed">
      
      {/* Search & Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2">
          <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">{t('severityFilter', 'Severity Filter:')}</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="px-4 py-2 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 text-xs font-bold uppercase tracking-wider outline-none"
          >
            <option value="ALL">{t('allStockAlerts', 'All Stock Alerts')}</option>
            <option value="CRITICAL">{t('criticalIssuesOnly', 'Critical Issues Only')}</option>
            <option value="WARNING">{t('warningsOnly', 'Warnings Only')}</option>
          </select>
        </div>
      </div>

      {/* Alerts Table */}
      <Card className="p-0 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('timeReceived', 'Time Received')}</TableHead>
              <TableHead>{t('centreFacility')}</TableHead>
              <TableHead>{t('severity', 'Severity')}</TableHead>
              <TableHead>{t('alertDetails', 'Alert Details')}</TableHead>
              <TableHead className="text-right">{t('actionsCol')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stockAlerts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-zinc-400 font-semibold">
                  {t('noStockAlertsFound', 'No active low-stock alerts found matching criteria.')}
                </TableCell>
              </TableRow>
            ) : (
              stockAlerts.map((alert) => {
                const centerName = centers.find(c => c.id === alert.centerId)?.name || alert.centerName || 'Unknown Facility';
                const dateStr = alert.createdAt 
                  ? new Date(alert.createdAt.seconds * 1000).toLocaleString() 
                  : 'N/A';

                return (
                  <TableRow 
                    key={alert.id}
                    className={!alert.isRead ? 'bg-zinc-900/5 dark:bg-zinc-50/5 font-semibold' : ''}
                  >
                    <TableCell className="text-xs text-zinc-400 font-mono">{dateStr}</TableCell>
                    <TableCell className="font-bold text-zinc-800 dark:text-zinc-200">{centerName}</TableCell>
                    <TableCell>
                      <Badge variant={alert.severity === 'critical' ? 'critical' : 'warning'}>
                        {alert.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-zinc-700 dark:text-zinc-300">
                      {alert.message}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2">
                        {!alert.isRead && (
                          <Button 
                            onClick={async () => {
                              await markAsRead(alert.id);
                            }}
                            size="sm" 
                            variant="outline"
                            className="text-xs py-1"
                          >
                            {t('markRead', 'Mark Read')}
                          </Button>
                        )}
                        <Button
                          onClick={() => navigate('/requests')}
                          size="sm"
                          className="text-xs py-1 flex items-center gap-1"
                        >
                          {t('redistribute', 'Redistribute')}
                          <ArrowRight size={12} weight="bold" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

    </Layout>
  );
}
