/**
 * Inventory Routes for CuraOne
 * Medicine/Product stock management
 */

import express from 'express';
import { getInventory, createInventoryItem, updateInventoryItem, getLowStockItems, deleteInventoryItem } from '../controllers/inventoryController.js';
import { protect, admin, practitioner } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/inventory - Get all inventory items
router.get('/', getInventory);

// GET /api/inventory/low-stock - Get items with low stock
router.get('/low-stock', getLowStockItems);

// POST /api/inventory - Create new inventory item (admin only)
router.post('/', admin, createInventoryItem);

// PUT /api/inventory/:id - Update inventory item (admin or practitioner)
router.put('/:id', practitioner, updateInventoryItem);

// DELETE /api/inventory/:id - Delete inventory item (admin only)
router.delete('/:id', admin, deleteInventoryItem);

export default router;
