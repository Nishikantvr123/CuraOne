import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { GrantItem } from '@/types/grant';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Send, 
  Clock, 
  CheckCircle2, 
  Ban, 
  Building2, 
  User, 
  Loader2, 
  Stethoscope,
  XCircle,
  Hourglass,
  ShieldCheck,
  AlertTriangle,
  Key
} from 'lucide-react';
import { PaginationControl } from '@/components/ui/pagination-control';

type StatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'EXPIRED' | 'REVOKED';

export const HospitalOutboundGrantsView: React.FC = () => {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState<StatusFilter>('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, isError, refetch } = useQuery<{ grants: GrantItem[]; count: number }>({
    queryKey: ['hospitalGrants'],
    queryFn: async () => {
      const res = await api.get<{ grants: GrantItem[]; count: number }>('/grants');
      return res.data;
    },
  });

  const now = new Date();

  // Outbound: Requests initiated by our hospital's doctors
  const outboundGrants = (data?.grants || []).filter((g) => {
    const currentHospitalId = user?.hospitalId || user?.id;
    return g.requestingHospitalId === currentHospitalId;
  });

  // Calculate status counts
  const pendingCount = outboundGrants.filter((g) => g.status === 'PENDING').length;
  const approvedCount = outboundGrants.filter(
    (g) => g.status === 'APPROVED' && (!g.expiresAt || new Date(g.expiresAt) > now)
  ).length;
  const expiredCount = outboundGrants.filter(
    (g) => g.status === 'APPROVED' && g.expiresAt && new Date(g.expiresAt) <= now
  ).length;
  const revokedCount = outboundGrants.filter(
    (g) => g.status === 'REVOKED' || g.status === 'REJECTED'
  ).length;

  const filteredGrants = outboundGrants.filter((g) => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'PENDING') return g.status === 'PENDING';
    if (selectedFilter === 'APPROVED') {
      return g.status === 'APPROVED' && (!g.expiresAt || new Date(g.expiresAt) > now);
    }
    if (selectedFilter === 'EXPIRED') {
      return g.status === 'APPROVED' && g.expiresAt && new Date(g.expiresAt) <= now;
    }
    if (selectedFilter === 'REVOKED') {
      return g.status === 'REVOKED' || g.status === 'REJECTED';
    }
    return true;
  });

  const handleFilterChange = (filter: StatusFilter) => {
    setSelectedFilter(filter);
    setPage(1);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Send className="size-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Outbound Doctor Requests</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Monitor cross-hospital data requests submitted by attending medical staff affiliated with your institution.
        </p>
      </div>

      {/* 2. Status Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-b border-border/60 pb-3">
        <button
          type="button"
          onClick={() => handleFilterChange('ALL')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
            selectedFilter === 'ALL'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background hover:bg-muted text-muted-foreground border-border/60'
          }`}
        >
          All ({outboundGrants.length})
        </button>

        <button
          type="button"
          onClick={() => handleFilterChange('PENDING')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border flex items-center gap-1.5 ${
            selectedFilter === 'PENDING'
              ? 'bg-amber-500 text-white border-amber-500'
              : 'bg-background hover:bg-muted text-muted-foreground border-border/60'
          }`}
        >
          <Clock className="size-3" />
          <span>Pending Clearance ({pendingCount})</span>
        </button>

        <button
          type="button"
          onClick={() => handleFilterChange('APPROVED')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border flex items-center gap-1.5 ${
            selectedFilter === 'APPROVED'
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-background hover:bg-muted text-muted-foreground border-border/60'
          }`}
        >
          <CheckCircle2 className="size-3" />
          <span>Active Grants ({approvedCount})</span>
        </button>

        <button
          type="button"
          onClick={() => handleFilterChange('EXPIRED')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border flex items-center gap-1.5 ${
            selectedFilter === 'EXPIRED'
              ? 'bg-muted text-foreground border-border font-semibold'
              : 'bg-background hover:bg-muted text-muted-foreground border-border/60'
          }`}
        >
          <Hourglass className="size-3" />
          <span>Expired ({expiredCount})</span>
        </button>

        <button
          type="button"
          onClick={() => handleFilterChange('REVOKED')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border flex items-center gap-1.5 ${
            selectedFilter === 'REVOKED'
              ? 'bg-rose-600 text-white border-rose-600'
              : 'bg-background hover:bg-muted text-muted-foreground border-border/60'
          }`}
        >
          <Ban className="size-3" />
          <span>Revoked ({revokedCount})</span>
        </button>
      </div>

      {/* 3. Outbound Requests List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <Loader2 className="size-6 animate-spin text-foreground" />
            <p className="text-sm">Loading staff requests...</p>
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center space-y-2">
            <p className="text-sm text-destructive font-semibold">Failed to load requests</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : filteredGrants.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 p-12 text-center space-y-2">
            <ShieldCheck className="size-8 text-muted-foreground mx-auto" />
            <p className="text-sm font-semibold text-foreground">No outbound requests found</p>
            <p className="text-xs text-muted-foreground">
              {selectedFilter === 'ALL'
                ? 'Your hospital doctors have not requested external records yet.'
                : `No outbound requests with status "${selectedFilter.toLowerCase()}".`}
            </p>
          </div>
        ) : (
          filteredGrants.slice((page - 1) * pageSize, page * pageSize).map((grant) => {
            const createdDate = new Date(grant.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            const isExpired = grant.status === 'APPROVED' && grant.expiresAt && new Date(grant.expiresAt) <= now;
            const patientConsentStatus = grant.patientConsent?.status || 'PENDING';
            const hospitalClearanceStatus = grant.hospitalClearance?.status || 'PENDING';
            const isFlaggedForReview = grant.hospitalClearance?.flaggedForHostReview;

            return (
              <Card key={grant.id} className="border-border/60 bg-card/60 shadow-xs">
                <CardContent className="p-4 sm:p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {grant.status === 'PENDING' && (
                        <Badge variant="outline" className="gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs font-semibold">
                          <Clock className="size-3" />
                          Pending Dual-Key Authorization
                        </Badge>
                      )}
                      {grant.status === 'APPROVED' && !isExpired && (
                        <Badge variant="outline" className="gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs font-semibold">
                          <CheckCircle2 className="size-3" />
                          Approved & Active
                        </Badge>
                      )}
                      {isExpired && (
                        <Badge variant="outline" className="gap-1 bg-muted text-muted-foreground border-border text-xs">
                          <Hourglass className="size-3" />
                          Authorization Expired
                        </Badge>
                      )}
                      {grant.status === 'REJECTED' && (
                        <Badge variant="outline" className="gap-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 text-xs">
                          <XCircle className="size-3" />
                          Declined
                        </Badge>
                      )}
                      {grant.status === 'REVOKED' && (
                        <Badge variant="outline" className="gap-1 bg-muted text-muted-foreground border-border text-xs">
                          <Ban className="size-3" />
                          Revoked
                        </Badge>
                      )}

                      {/* Emergency Break-Glass Indicator */}
                      {grant.isBreakGlass && (
                        <Badge variant="destructive" className="gap-1 text-[11px] font-semibold">
                          <AlertTriangle className="size-3" />
                          Break-Glass Emergency
                        </Badge>
                      )}

                      {/* Host Peer Review Flag Alert */}
                      {isFlaggedForReview && (
                        <Badge variant="destructive" className="gap-1 text-[11px] font-bold animate-bounce">
                          🚨 Staff Peer Review Required
                        </Badge>
                      )}

                      <span className="text-xs text-muted-foreground font-mono">
                        Requested on {createdDate}
                      </span>
                    </div>
                  </div>

                  {/* Dual-Key Tracking Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-muted/20 border border-border/40 rounded-md p-2.5">
                    <div className="flex items-center justify-between gap-2 pr-2 border-r border-border/40">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Key className="size-3.5 text-primary" />
                        <span className="font-medium">Patient Sovereign Consent:</span>
                      </div>
                      <span className={`font-semibold ${
                        patientConsentStatus === 'APPROVED' ? 'text-emerald-600 dark:text-emerald-400' :
                        patientConsentStatus === 'BYPASSED_BREAK_GLASS' ? 'text-amber-600 dark:text-amber-400' :
                        patientConsentStatus === 'REJECTED' ? 'text-destructive' : 'text-amber-500'
                      }`}>
                        {patientConsentStatus === 'APPROVED' ? 'Granted ✓' :
                         patientConsentStatus === 'BYPASSED_BREAK_GLASS' ? 'Emergency Bypassed ⚠️' :
                         patientConsentStatus === 'REJECTED' ? 'Refused ✗' : 'Awaiting Patient'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pl-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Building2 className="size-3.5 text-primary" />
                        <span className="font-medium">Target Custodian Clearance:</span>
                      </div>
                      <span className={`font-semibold ${
                        hospitalClearanceStatus === 'APPROVED' ? 'text-emerald-600 dark:text-emerald-400' :
                        hospitalClearanceStatus === 'REJECTED' ? 'text-destructive' : 'text-amber-500'
                      }`}>
                        {hospitalClearanceStatus === 'APPROVED' ? 'Cleared ✓' :
                         hospitalClearanceStatus === 'REJECTED' ? 'Denied ✗' : 'Awaiting Custodian'}
                      </span>
                    </div>
                  </div>

                  {/* Doctor & Target Hospital */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="flex items-start gap-2 text-foreground">
                      <Stethoscope className="size-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">{grant.requestingDoctorName || 'Attending Physician'}</p>
                        <p className="text-muted-foreground">Requesting Staff Member</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-foreground">
                      <Building2 className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">{grant.targetHospitalName}</p>
                        <p className="text-muted-foreground">Target Custodian Hospital</p>
                      </div>
                    </div>
                  </div>

                  {/* Patient Subject */}
                  <div className="flex items-center gap-1.5 text-xs text-foreground bg-muted/20 p-2 rounded-md">
                    <User className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">Patient Subject:</span>
                    <span className="font-semibold">{grant.patientName}</span>
                    <span className="text-muted-foreground">({grant.patientEmail})</span>
                  </div>

                  {/* Host Peer Review Notice */}
                  {isFlaggedForReview && (
                    <div className="rounded-md border border-destructive/40 bg-destructive/10 p-2.5 text-xs text-destructive space-y-1">
                      <p className="font-semibold flex items-center gap-1.5">
                        <AlertTriangle className="size-3.5" />
                        <span>Peer Review Action Required:</span>
                      </p>
                      <p className="text-[11px] leading-relaxed">
                        {grant.hospitalClearance?.hostReviewNotes || 'An incident dispute was filed against this cross-hospital access request. Conduct clinical peer review of attending physician.'}
                      </p>
                    </div>
                  )}

                  {/* Stated Purpose */}
                  <div className="text-xs p-3 rounded-md bg-muted/30 border border-border/40 text-foreground">
                    <span className="font-semibold text-muted-foreground">Clinical Justification: </span>
                    {grant.purpose}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}

        {filteredGrants.length > 0 && (
          <PaginationControl
            currentPage={page}
            totalPages={Math.ceil(filteredGrants.length / pageSize)}
            totalItems={filteredGrants.length}
            pageSize={pageSize}
            onPageChange={setPage}
            itemLabel="requests"
          />
        )}
      </div>
    </div>
  );
};
