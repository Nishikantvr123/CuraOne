import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { findMany, updateOne } from '../config/database.js';

const router = express.Router();
router.use(protect, admin);

// GET /api/admin/unactivated-patients
// Returns registered patients where addedToDashboard is false/missing
router.get('/unactivated-patients', async (req, res) => {
  try {
    const all = await findMany('users', { role: 'patient' });
    const unactivated = all.filter(u => !u.addedToDashboard);
    res.json({ success: true, data: unactivated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/activate-patient
// Sets addedToDashboard: true for a given userId
router.post('/activate-patient', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, error: 'userId is required' });

    const user = await findMany('users', { role: 'patient' }).then(list =>
      list.find(u => u.id === userId)
    );
    if (!user) return res.status(404).json({ success: false, error: 'Patient not found' });
    if (user.addedToDashboard) return res.status(400).json({ success: false, error: 'Patient already activated' });

    const updated = await updateOne('users', { id: userId }, { addedToDashboard: true });
    res.json({ success: true, message: 'Patient activated on dashboard', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
