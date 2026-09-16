import React, { useState } from 'react';
import { api } from '@/lib/api';
import type { CreateGrantPayload } from '@/types/patient';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Building2, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface RequestGrantModalProps {
  patientId: string;
  patientName: string;
  targetHospitalId: string;
  targetHospitalName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RequestGrantModal: React.FC<RequestGrantModalProps> = ({
  patientId,
  patientName,
  targetHospitalId,
  targetHospitalName,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [purpose, setPurpose] = useState('Comprehensive longitudinal clinical review and medication reconciliation.');
  const [durationDays, setDurationDays] = useState('30');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose.trim()) {
      toast.error('Clinical justification purpose is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateGrantPayload = {
        patientId,
        targetHospitalId,
        purpose: purpose.trim(),
        durationDays: parseInt(durationDays, 10),
      };

      await api.post('/grants', payload);

      toast.success('Access request submitted', {
        description: `Consent request sent to ${patientName} for records from ${targetHospitalName}`,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error('Failed to submit access grant request', {
        description: err.response?.data?.message || 'Server error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              <DialogTitle className="text-lg font-bold text-foreground">
                Request Cross-Hospital Access
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Request sovereign patient consent to decrypt and inspect medical records held by an external custodian hospital.
            </DialogDescription>
          </DialogHeader>

          {/* Context Info Box */}
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <User className="size-3.5 text-foreground" />
                <span>Patient Subject:</span>
              </div>
              <span className="font-semibold text-foreground">{patientName}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Building2 className="size-3.5 text-foreground" />
                <span>Target Custodian:</span>
              </div>
              <span className="font-semibold text-foreground truncate max-w-[200px]" title={targetHospitalName}>
                {targetHospitalName}
              </span>
            </div>
          </div>

          {/* Purpose / Justification */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Clinical Purpose & Justification *</Label>
            <Textarea
              placeholder="State the clinical need for reviewing external records..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              rows={3}
              className="text-xs resize-none"
              required
            />
          </div>

          {/* Duration */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Authorization Duration</Label>
            <select
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              className="w-full h-9 rounded-md border border-border/80 bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1"
            >
              <option value="7">7 Days (Acute evaluation)</option>
              <option value="14">14 Days (Short follow-up)</option>
              <option value="30">30 Days (Standard care cycle)</option>
              <option value="90">90 Days (Chronic condition management)</option>
            </select>
          </div>

          <DialogFooter className="pt-3 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="cursor-pointer gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Request</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
