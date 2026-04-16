import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { findMany, updateOne, deleteOne } from '../config/database.js';

const router = express.Router();
router.use(protect, admin);

// GET /api/admin/unactivated-patients
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
router.post('/activate-patient', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ 
      success: false, error: 'userId is required' 
    });

    const users = await findMany('users', { role: 'patient' });
    const user = users.find(u => u.id === userId);
    
    if (!user) return res.status(404).json({ 
      success: false, error: 'Patient not found' 
    });
    if (user.addedToDashboard) return res.status(400).json({ 
      success: false, error: 'Patient already activated' 
    });

    const updated = await updateOne('users', { id: userId }, { 
      addedToDashboard: true 
    });
    res.json({ 
      success: true, 
      message: 'Patient activated on dashboard', 
      data: updated 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/practitioners - Get all practitioners
router.get('/practitioners', async (req, res) => {
  try {
    const practitioners = await findMany('users', { role: 'practitioner' });
    
    // Remove sensitive data
    const sanitizedPractitioners = practitioners.map(p => ({
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      email: p.email,
      specialization: p.specialization || [],
      experience: p.experience || 0,
      isActive: p.isActive
    }));
    
    res.json({ 
      success: true, 
      data: { practitioners: sanitizedPractitioners }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/admin/practitioners/:id - Delete a practitioner
router.delete('/practitioners/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const practitioners = await findMany('users', { role: 'practitioner' });
    const practitioner = practitioners.find(p => p.id === id || p.email === id);
    
    if (!practitioner) {
      return res.status(404).json({ success: false, error: 'Practitioner not found' });
    }
    
    // Delete the practitioner
    await deleteOne('users', { email: practitioner.email });
    
    res.json({ 
      success: true, 
      message: `Practitioner ${practitioner.firstName} ${practitioner.lastName} deleted successfully`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;