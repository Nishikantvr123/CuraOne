import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { DoctorSidebar } from '@/components/layout/DoctorSidebar';
import { PatientSearchDirectory } from '@/components/patients/PatientSearchDirectory';
import { PatientTimelineView } from '@/components/patients/PatientTimelineView';
import { DoctorGrantsView } from '@/components/grants/DoctorGrantsView';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  User as UserIcon, 
  Shield, 
  Users, 
  KeyRound, 
  Sparkles, 
  CheckCircle2,
  ArrowRight,
  Bot
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [sidebarView, setSidebarView] = useState<'patients' | 'grants' | 'copilot'>('patients');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Fetch pending grants count for doctor's badge
  const { data: grantsData } = useQuery<{ grants: any[]; count: number }>({
    queryKey: ['doctorGrants'],
    queryFn: async () => {
      const res = await api.get('/grants');
      return res.data;
    },
    enabled: user?.role === 'DOCTOR',
  });

  const pendingGrantsCount = grantsData?.grants?.filter((g) => g.status === 'PENDING').length || 0;

  if (!user) return null;

  // 1. DOCTOR WORKSTATION LAYOUT
  if (user.role === 'DOCTOR') {
    return (
      <div className="flex flex-1 min-h-[calc(100vh-4rem)]">
        {/* Left Sidebar */}
        <DoctorSidebar
          activeView={sidebarView}
          onSelectView={(view) => {
            setSidebarView(view);
          }}
          isPatientSelected={!!selectedPatientId}
          pendingGrantsCount={pendingGrantsCount}
        />

        {/* Main Workstation Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-background/50">
          {sidebarView === 'patients' && (
            selectedPatientId ? (
              <PatientTimelineView
                patientId={selectedPatientId}
                onBack={() => setSelectedPatientId(null)}
              />
            ) : (
              <PatientSearchDirectory
                onSelectPatient={(id) => setSelectedPatientId(id)}
              />
            )
          )}

          {sidebarView === 'grants' && (
            <DoctorGrantsView
              onSelectPatient={(id) => {
                setSelectedPatientId(id);
                setSidebarView('patients');
              }}
            />
          )}

          {sidebarView === 'copilot' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">AI Clinical Copilot</h1>
                  <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    Slice 4 Upcoming
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Authorized contextual retrieval & grounding over longitudinal medical records.
                </p>
              </div>

              <Card className="border-border/60 bg-card/60 shadow-xs">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Bot className="size-5 text-primary" />
                    <CardTitle className="text-base font-semibold">Gated Semantic Search Architecture</CardTitle>
                  </div>
                  <CardDescription>Research core powering clinical question-answering</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                  <p>
                    Unlike standard medical LLM tools that search open unverified data, the CuraOne Copilot strictly queries{' '}
                    <strong className="text-foreground">768-dimensional Gemini embeddings</strong> stored in PostgreSQL with <code className="text-foreground font-mono text-xs">pgvector</code>.
                  </p>
                  <div className="rounded-lg border border-border/60 bg-muted/30 p-4 space-y-2 text-xs">
                    <p className="font-semibold text-foreground">Strict Authorization Rule:</p>
                    <p>
                      Similarity retrieval is dynamically gated by active <code className="text-foreground font-mono text-xs">access_grants</code>. Records from external hospitals with expired or absent consent grants are never retrieved into the prompt context.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSidebarView('patients')}
                    className="cursor-pointer"
                  >
                    Return to Patients Directory
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    );
  }

  // 2. OTHER ROLES (HOSPITAL, PATIENT, SYSTEM_ADMIN) OVERVIEW
  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-border/60 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Welcome, {user.name}
              </h1>
              <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wider bg-background/80">
                {user.role}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Connected to CuraOne decentralized cross-hospital research network.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="size-3.5" />
              API Session Live
            </span>
          </div>
        </div>
      </div>

      {user.role === 'HOSPITAL' && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-border/60 shadow-xs">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Hospital Custodianship</CardTitle>
                <Building2 className="size-4 text-foreground" />
              </div>
              <CardDescription>Institutional identity and node status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Facility Name:</span>
                <span className="font-medium text-foreground">{user.name}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Admin Account:</span>
                <span className="font-medium text-foreground">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Jurisdiction Node ID:</span>
                <span className="font-mono text-xs text-foreground truncate max-w-[200px]">{user.id}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-xs">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Doctor Provisioning</CardTitle>
                <Users className="size-4 text-foreground" />
              </div>
              <CardDescription>Manage authorized medical personnel</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                As a hospital administrator, you can provision new attending doctors and assign them to your facility.
              </p>
              <div className="mt-4">
                <Button variant="outline" size="sm" className="gap-2 cursor-pointer">
                  Manage Medical Staff
                  <ArrowRight className="size-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {user.role === 'PATIENT' && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-border/60 shadow-xs">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Your Health Identity</CardTitle>
                <UserIcon className="size-4 text-foreground" />
              </div>
              <CardDescription>Longitudinal records custodian summary</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Patient Name:</span>
                <span className="font-medium text-foreground">{user.name}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium text-foreground">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Patient ID:</span>
                <span className="font-mono text-xs text-foreground truncate max-w-[200px]">{user.id}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-xs">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Consent & Access Grants</CardTitle>
                <KeyRound className="size-4 text-foreground" />
              </div>
              <CardDescription>Cross-hospital sharing authorizations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You have sovereign control over which external hospitals can access your historical clinical encounters.
              </p>
              <div className="mt-4">
                <Button variant="outline" size="sm" className="gap-2 cursor-pointer">
                  Review Access Requests
                  <ArrowRight className="size-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {user.role === 'SYSTEM_ADMIN' && (
        <Card className="border-border/60 shadow-xs">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Network Administration</CardTitle>
              <Shield className="size-4 text-foreground" />
            </div>
            <CardDescription>Platform root configuration and hospital provisioning</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              You are logged in as the System Administrator. You can provision new hospital nodes and oversee platform-wide health metrics.
            </p>
          </CardContent>
        </Card>
      )}

      {/* FYP Research Subsystems Roadmap Card */}
      <Card className="border-border/60 bg-muted/30 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">CuraOne Architecture Roadmap</CardTitle>
          <CardDescription>Current vertical slice progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="size-4" />
                Slice 1: Auth & Portals
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                4-role JWT authentication, patient registration, and session routing active.
              </p>
            </div>

            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="size-4" />
                Slice 2: Doctor Workstation
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Search directory, gated longitudinal timeline, record details & live encounters.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-background/50 p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <KeyRound className="size-4 text-muted-foreground" />
                Slice 3: Access Grants Portal
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Patient consent inbox, grant approval/rejection & sovereign audit trail.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-background/50 p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Sparkles className="size-4 text-muted-foreground" />
                Slice 4: Semantic RAG
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Gemini embeddings + pgvector similarity search with source citations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
