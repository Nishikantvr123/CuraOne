import React from 'react';
import type { TimelineEncounter } from '@/types/patient';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Stethoscope, 
  Calendar, 
  FileText, 
  Pill, 
  Activity, 
  ShieldCheck, 
  Fingerprint
} from 'lucide-react';

interface EncounterDetailModalProps {
  encounter: TimelineEncounter | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EncounterDetailModal: React.FC<EncounterDetailModalProps> = ({
  encounter,
  isOpen,
  onClose,
}) => {
  if (!encounter) return null;

  const conditions = encounter.clinicalEvents.filter((e) => e.eventType === 'CONDITION');
  const medications = encounter.clinicalEvents.filter((e) => e.eventType === 'MEDICATION');
  const procedures = encounter.clinicalEvents.filter((e) => e.eventType === 'PROCEDURE');
  const otherEvents = encounter.clinicalEvents.filter(
    (e) => !['CONDITION', 'MEDICATION', 'PROCEDURE'].includes(e.eventType)
  );

  const formattedDate = new Date(encounter.startDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-6">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between gap-2 pr-4">
            <DialogTitle className="text-xl font-bold text-foreground">
              {encounter.encounterClass || 'Clinical Encounter'}
            </DialogTitle>
            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1">
              <ShieldCheck className="size-3 text-emerald-600 dark:text-emerald-400" />
              {encounter.accessReason === 'CUSTODIAL_OWNER' ? 'Unlocked (Local Custodian)' : 'Unlocked (Active Grant)'}
            </Badge>
          </div>
          <DialogDescription className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="size-3.5 text-muted-foreground" />
            <span>Recorded on {formattedDate}</span>
          </DialogDescription>
        </DialogHeader>

        {/* 1. Custodian & Provider Metadata Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg border border-border/60 bg-muted/30 text-xs">
          <div className="flex items-start gap-2">
            <Building2 className="size-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">{encounter.hospitalName}</p>
              <p className="text-muted-foreground">{encounter.hospitalCity}, {encounter.hospitalState}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Stethoscope className="size-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">{encounter.doctorName || 'Attending Physician'}</p>
              <p className="text-muted-foreground">{encounter.doctorSpecialty || 'General Practice'}</p>
            </div>
          </div>
        </div>

        {/* 2. Clinical Notes / Reason */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <FileText className="size-3.5 text-foreground" />
            <span>Clinical Notes & Summary</span>
          </div>
          <div className="p-3.5 rounded-lg border border-border/60 bg-background text-sm leading-relaxed text-foreground">
            <p className="font-medium text-foreground mb-1">{encounter.description || 'Routine medical examination.'}</p>
            {encounter.reasonDescription && (
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Chief Complaint / Reason:</span> {encounter.reasonDescription}
              </p>
            )}
          </div>
        </div>

        {/* 3. Diagnoses / Conditions */}
        {conditions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Activity className="size-3.5 text-foreground" />
              <span>Diagnoses & Conditions ({conditions.length})</span>
            </div>
            <div className="space-y-1.5">
              {conditions.map((c) => (
                <div key={c.id} className="p-2.5 rounded-md border border-border/50 bg-card/60 text-xs flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{c.description}</p>
                    {c.reasonDescription && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">Clinical Note: {c.reasonDescription}</p>
                    )}
                  </div>
                  {c.code && (
                    <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
                      {c.code}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Medications & Orders */}
        {medications.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Pill className="size-3.5 text-foreground" />
              <span>Medications & Prescriptions ({medications.length})</span>
            </div>
            <div className="space-y-1.5">
              {medications.map((m) => (
                <div key={m.id} className="p-2.5 rounded-md border border-border/50 bg-card/60 text-xs flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{m.description}</p>
                    {m.reasonDescription && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">Instructions: {m.reasonDescription}</p>
                    )}
                  </div>
                  {m.code && (
                    <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
                      RxNorm: {m.code}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Procedures */}
        {procedures.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Procedures & Interventions ({procedures.length})
            </p>
            <div className="space-y-1.5">
              {procedures.map((p) => (
                <div key={p.id} className="p-2.5 rounded-md border border-border/50 bg-card/60 text-xs">
                  <p className="font-semibold text-foreground">{p.description}</p>
                  {p.reasonDescription && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">Reason: {p.reasonDescription}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Other Events (Immunizations/Careplans) */}
        {otherEvents.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Other Clinical Events ({otherEvents.length})
            </p>
            <div className="space-y-1.5">
              {otherEvents.map((e) => (
                <div key={e.id} className="p-2.5 rounded-md border border-border/50 bg-card/60 text-xs">
                  <span className="font-semibold text-foreground">[{e.eventType}]</span> {e.description}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. Provenance Bar */}
        <div className="pt-3 border-t border-border/50 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1 font-mono">
            <Fingerprint className="size-3 text-muted-foreground" />
            <span>ID: {encounter.id}</span>
          </div>
          <span>Custodial EHR Node: {encounter.hospitalName}</span>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" size="sm" onClick={onClose} className="cursor-pointer">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
