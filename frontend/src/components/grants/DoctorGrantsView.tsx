import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Ban, 
  Building2, 
  User, 
  Loader2,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

interface GrantItem {
  id: string;
  patientId: string;
  patientFirstName: string;
  patientLastName: string;
  patientEmail: string;
  targetHospitalId: string;
  targetHospitalName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED';
  purpose: string;
  createdAt: string;
  expiresAt?: string | null;
  revokedAt?: string | null;
}

interface DoctorGrantsViewProps {
  onSelectPatient: (patientId: string) => void;
}

export const DoctorGrantsView: React.FC<DoctorGrantsViewProps> = ({ onSelectPatient }) => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery<{ grants: GrantItem[]; count: number }>({
    queryKey: ['doctorGrants'],
    queryFn: async () => {
      const res = await api.get<{ grants: GrantItem[]; count: number }>('/grants');
      return res.data;
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (grantId: string) => {
      await api.patch(`/grants/${grantId}`, { status: 'REVOKED' });
    },
    onSuccess: () => {
      toast.success('Access grant revoked');
      queryClient.invalidateQueries({ queryKey: ['doctorGrants'] });
      queryClient.invalidateQueries({ queryKey: ['patientTimeline'] });
    },
    onError: (err: any) => {
      toast.error('Failed to revoke grant', {
        description: err.response?.data?.message || 'Server error',
      });
    },
  });

  const grants = data?.grants || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Access Grants</h1>
        <p className="text-sm text-muted-foreground">
          Track cross-hospital patient consent requests and authorized custodial records.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
          <Loader2 className="size-6 animate-spin text-foreground" />
          <p className="text-sm">Loading access requests...</p>
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center space-y-2">
          <p className="text-sm text-destructive font-semibold">Failed to load access grants</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : grants.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/80 p-12 text-center space-y-2">
          <ShieldCheck className="size-8 text-muted-foreground mx-auto" />
          <p className="text-sm font-semibold text-foreground">No access grants requested yet</p>
          <p className="text-xs text-muted-foreground">
            When you encounter a protected record on a patient's timeline, you can request an access grant.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {grants.map((grant) => {
            const createdDate = new Date(grant.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <Card key={grant.id} className="border-border/60 bg-card/60 shadow-xs">
                <CardContent className="p-4 sm:p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {grant.status === 'PENDING' && (
                        <Badge variant="outline" className="gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs">
                          <Clock className="size-3 text-amber-600 dark:text-amber-400" />
                          Pending Patient Consent
                        </Badge>
                      )}
                      {grant.status === 'APPROVED' && (
                        <Badge variant="outline" className="gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs">
                          <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
                          Active & Authorized
                        </Badge>
                      )}
                      {grant.status === 'REJECTED' && (
                        <Badge variant="outline" className="gap-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 text-xs">
                          <XCircle className="size-3 text-rose-600 dark:text-rose-400" />
                          Declined by Patient
                        </Badge>
                      )}
                      {grant.status === 'REVOKED' && (
                        <Badge variant="outline" className="gap-1 bg-muted text-muted-foreground border-border text-xs">
                          <Ban className="size-3 text-muted-foreground" />
                          Revoked
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground font-mono">Requested {createdDate}</span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelectPatient(grant.patientId)}
                        className="gap-1.5 cursor-pointer text-xs font-medium text-foreground hover:bg-muted"
                      >
                        <span>View Records</span>
                        <ArrowRight className="size-3.5" />
                      </Button>

                      {grant.status === 'APPROVED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => revokeMutation.mutate(grant.id)}
                          disabled={revokeMutation.isPending}
                          className="text-xs cursor-pointer text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                        >
                          Revoke Access
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-foreground">
                      <User className="size-3.5 text-muted-foreground shrink-0" />
                      <span className="font-semibold">{grant.patientFirstName} {grant.patientLastName}</span>
                      <span className="text-muted-foreground">({grant.patientEmail})</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-foreground">
                      <Building2 className="size-3.5 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Target Custodian:</span>
                      <span className="font-semibold truncate">{grant.targetHospitalName}</span>
                    </div>
                  </div>

                  <div className="text-xs p-2.5 rounded-md bg-muted/30 border border-border/40 text-foreground">
                    <span className="font-semibold text-muted-foreground">Justification: </span>
                    {grant.purpose}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
