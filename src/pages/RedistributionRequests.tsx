import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input, Select } from '../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';
import { Plus, ArrowRight, Check, X, ShieldCheck } from '@phosphor-icons/react';

const requestSchema = z.object({
  fromCenterId: z.string().min(1, 'Please select your health centre'),
  toCenterId: z.string().min(1, 'Please select the supplying health centre'),
  resourceType: z.enum(['medicine', 'bed', 'doctor', 'other']),
  resourceName: z.string().min(2, 'Resource name is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1')
});

type RequestFormInput = z.input<typeof requestSchema>;
type RequestFormData = z.output<typeof requestSchema>;

export default function RedistributionRequests() {
  const { requests, centers, createRedistributionRequest, updateRequestStatus } = useData();
  const { role, user, isAdmin } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<RequestFormInput, any, RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      resourceType: 'medicine',
      quantity: 100
    }
  });

  const selectedFromCenter = watch('fromCenterId');

  const onSubmit = async (data: RequestFormData) => {
    if (data.fromCenterId === data.toCenterId) {
      toast.error('Source and supplier centres cannot be the same.');
      return;
    }
    setSubmitting(true);
    try {
      await createRedistributionRequest({
        ...data,
        requestedBy: user?.email || 'Unknown User'
      });
      toast.success('Redistribution request submitted successfully!');
      reset({
        fromCenterId: data.fromCenterId,
        toCenterId: '',
        resourceType: 'medicine',
        resourceName: '',
        quantity: 100
      });
    } catch (e) {
      console.error(e);
      toast.error('Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await updateRequestStatus(id, 'Approved');
      toast.success('Request approved successfully.');
    } catch (e) {
      console.error(e);
      toast.error('Failed to approve request.');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateRequestStatus(id, 'Rejected');
      toast.success('Request rejected.');
    } catch (e) {
      console.error(e);
      toast.error('Failed to reject request.');
    }
  };

  // Group requests: CMO sees all. Other roles see relevant requests.
  // We can let other users filter requests by their center.
  // Since we don't have a strict center binding in user profile (for mock simplicity), we can let users select their center,
  // or display all requests but highlight which ones are incoming and outgoing relative to a selected "My Center" dropdown.
  // Let's create a "Viewing Facility" selector that filters the incoming/outgoing tables, defaulting to the first center.
  const [myCenterId, setMyCenterId] = useState<string>(centers[0]?.id || '');

  // Outgoing: requested FROM other centers BY my center (fromCenterId === myCenterId)
  const outgoingRequests = requests.filter(r => isAdmin ? true : r.fromCenterId === myCenterId);
  // Incoming: requested FROM my center BY other centers (toCenterId === myCenterId)
  const incomingRequests = requests.filter(r => isAdmin ? true : r.toCenterId === myCenterId);

  return (
    <Layout title="Resource Redistribution Requests">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Request Form */}
        <div className="lg:col-span-1">
          <Card>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-850">
              <div className="p-2.5 bg-teal-500/10 text-teal-500 rounded-xl">
                <Plus size={24} weight="bold" />
              </div>
              <div>
                <h4 className="font-bold text-[#0B2A4A] dark:text-slate-100 uppercase tracking-wide">Request Resource</h4>
                <p className="text-xs text-slate-400">Request stock or support from another clinic</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              <Select
                label="Your Centre (Requestor)"
                error={errors.fromCenterId?.message}
                {...register('fromCenterId')}
              >
                <option value="">-- Select Your Center --</option>
                {centers.map(center => (
                  <option key={center.id} value={center.id}>{center.name}</option>
                ))}
              </Select>

              <Select
                label="Supply Centre (Supplier)"
                error={errors.toCenterId?.message}
                {...register('toCenterId')}
              >
                <option value="">-- Select Supplying Center --</option>
                {centers.filter(c => c.id !== selectedFromCenter).map(center => (
                  <option key={center.id} value={center.id}>{center.name}</option>
                ))}
              </Select>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Resource Type"
                  error={errors.resourceType?.message}
                  {...register('resourceType')}
                >
                  <option value="medicine">Medicine</option>
                  <option value="bed">Beds / Wards</option>
                  <option value="doctor">Doctors / Staff</option>
                  <option value="other">Other / Support</option>
                </Select>
                
                <Input
                  label="Quantity"
                  type="number"
                  error={errors.quantity?.message}
                  {...register('quantity')}
                />
              </div>

              <Input
                label="Resource Name"
                placeholder="e.g. Paracetamol 500mg, ECG Machine"
                error={errors.resourceName?.message}
                {...register('resourceName')}
              />

              <Button
                type="submit"
                loading={submitting}
                className="w-full mt-4"
              >
                Submit Request
              </Button>

            </form>
          </Card>
        </div>

        {/* Right: Requests tables */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Facility context filter */}
          {!isAdmin && (
            <Card className="p-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-[#0B2A4A] dark:text-slate-350 tracking-wider">Select My Facility Workspace:</span>
              <select
                value={myCenterId}
                onChange={(e) => setMyCenterId(e.target.value)}
                className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl text-slate-800 dark:text-slate-200"
              >
                {centers.map(center => (
                  <option key={center.id} value={center.id}>{center.name}</option>
                ))}
              </select>
            </Card>
          )}

          {/* Incoming Requests */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={20} className="text-teal-500" />
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-[#0B2A4A] dark:text-slate-200">
                {isAdmin ? 'All District Requests' : 'Incoming Requests (Supply Requests)'}
              </h4>
            </div>

            <Card className="p-0 overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From Facility</TableHead>
                    <TableHead>To Facility</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incomingRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-slate-400">
                        No incoming requests found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    incomingRequests.map((req) => {
                      const fromName = centers.find(c => c.id === req.fromCenterId)?.name || 'Unknown';
                      const toName = centers.find(c => c.id === req.toCenterId)?.name || 'Unknown';

                      let badgeVar: 'neutral' | 'healthy' | 'critical' = 'neutral';
                      if (req.status === 'Approved') badgeVar = 'healthy';
                      else if (req.status === 'Rejected') badgeVar = 'critical';

                      // CMO can approve anything. For MO, they can approve if supplier is myCenterId.
                      const canApprove = isAdmin || (['mo', 'pharmacist'].includes(role || '') && req.toCenterId === myCenterId);

                      return (
                        <TableRow key={req.id}>
                          <TableCell className="font-semibold text-slate-800 dark:text-slate-200">{fromName}</TableCell>
                          <TableCell>{toName}</TableCell>
                          <TableCell>
                            <span className="font-bold text-xs uppercase tracking-wide">{req.resourceType}: </span>
                            {req.resourceName}
                          </TableCell>
                          <TableCell>{req.quantity}</TableCell>
                          <TableCell><Badge variant={badgeVar}>{req.status}</Badge></TableCell>
                          <TableCell className="text-right">
                            {req.status === 'Pending' && canApprove ? (
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => handleApprove(req.id)}
                                  className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition active:scale-90"
                                  title="Approve Request"
                                >
                                  <Check size={16} weight="bold" />
                                </button>
                                <button
                                  onClick={() => handleReject(req.id)}
                                  className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition active:scale-90"
                                  title="Reject Request"
                                >
                                  <X size={16} weight="bold" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">No Action</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>

          {/* Outgoing Requests (Only shown for non-admins to keep it simple, as admins see all above) */}
          {!isAdmin && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ArrowRight size={20} className="text-teal-500" />
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-[#0B2A4A] dark:text-slate-200">
                  Outgoing Requests (My Requests)
                </h4>
              </div>

              <Card className="p-0 overflow-hidden shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Requested Supplying Clinic</TableHead>
                      <TableHead>Resource Required</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {outgoingRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-slate-400">
                          No outgoing requests submitted.
                        </TableCell>
                      </TableRow>
                    ) : (
                      outgoingRequests.map((req) => {
                        const toName = centers.find(c => c.id === req.toCenterId)?.name || 'Unknown';
                        
                        let badgeVar: 'neutral' | 'healthy' | 'critical' = 'neutral';
                        if (req.status === 'Approved') badgeVar = 'healthy';
                        else if (req.status === 'Rejected') badgeVar = 'critical';

                        return (
                          <TableRow key={req.id}>
                            <TableCell className="font-semibold text-slate-850 dark:text-slate-200">{toName}</TableCell>
                            <TableCell>
                              <span className="font-bold text-xs uppercase text-slate-450">{req.resourceType}: </span>
                              {req.resourceName}
                            </TableCell>
                            <TableCell>{req.quantity}</TableCell>
                            <TableCell><Badge variant={badgeVar}>{req.status}</Badge></TableCell>
                            <TableCell className="text-xs text-slate-450 truncate max-w-xs">{req.requestedBy}</TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

        </div>

      </div>

    </Layout>
  );
}
