import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { findMany } from '../config/database.js';

const router = express.Router();

// GET /api/practitioners - Get all active practitioners (public for booking)
router.get('/', protect, async (req, res) => {
  try {
    const practitioners = await findMany('users', { 
      role: 'practitioner',
      isActive: true 
    });
    
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

export default router;
