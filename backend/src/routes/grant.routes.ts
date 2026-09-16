import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import * as grantController from '../controllers/grant.controller';

export const grantRouter = Router();

// All grant endpoints require authentication
grantRouter.use(authenticate);

/**
 * 1. Doctor requests access to records from target hospital for a patient
 */
grantRouter.post(
  '/',
  requireRole('DOCTOR'),
  grantController.createGrant
);

/**
 * 2. List grants (auto-scoped to calling user's role)
 * Patient sees incoming consent requests; Doctor/Hospital sees outgoing or facility grants
 */
grantRouter.get(
  '/',
  requireRole('DOCTOR', 'HOSPITAL', 'PATIENT', 'SYSTEM_ADMIN'),
  grantController.listGrants
);

/**
 * 3. Get single grant details
 */
grantRouter.get(
  '/:id',
  requireRole('DOCTOR', 'HOSPITAL', 'PATIENT', 'SYSTEM_ADMIN'),
  grantController.getGrantById
);

/**
 * 4. Update grant status
 * Patient can approve, reject, or revoke consent; Doctor can revoke/cancel their own request
 */
grantRouter.patch(
  '/:id',
  requireRole('PATIENT', 'DOCTOR'),
  grantController.updateGrantStatus
);
