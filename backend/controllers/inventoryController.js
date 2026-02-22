/**
 * Inventory Controller for CuraOne
 * Medicine/Product stock management
 */

import { findMany, findOne, insertOne, updateOne, deleteOne } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const LOW_STOCK_THRESHOLD = 10;

/**
 * @desc    Get all inventory items
 * @route   GET /api/inventory
 * @access  Private
 */
export const getInventory = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 50 } = req.query;

    let items = findMany('inventory', {}, {
      sortBy: 'name',
      sortOrder: 'asc'
    });

    if (category) {
      items = items.filter(item => item.category?.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const searchLower = search.toLowerCase();
      items = items.filter(item => 
        item.name?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.sku?.toLowerCase().includes(searchLower)
      );
    }

    const total = items.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const paginatedItems = items.slice(startIndex, startIndex + parseInt(limit));

    const itemsWithStatus = paginatedItems.map(item => ({
      ...item,
      stockStatus: item.quantity <= 0 ? 'out_of_stock' : 
                   item.quantity <= LOW_STOCK_THRESHOLD ? 'low_stock' : 'in_stock'
    }));

    res.json({
      success: true,
      data: {
        items: itemsWithStatus,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        },
        summary: {
          totalItems: items.length,
          outOfStock: items.filter(i => i.quantity <= 0).length,
          lowStock: items.filter(i => i.quantity > 0 && i.quantity <= LOW_STOCK_THRESHOLD).length,
          inStock: items.filter(i => i.quantity > LOW_STOCK_THRESHOLD).length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get items with low stock
 * @route   GET /api/inventory/low-stock
 * @access  Private
 */
export const getLowStockItems = async (req, res, next) => {
  try {
    const { threshold = LOW_STOCK_THRESHOLD } = req.query;

    const items = findMany('inventory');
    const lowStockItems = items.filter(item => item.quantity <= parseInt(threshold));

    res.json({
      success: true,
      data: {
        items: lowStockItems.map(item => ({
          ...item,
          stockStatus: item.quantity <= 0 ? 'out_of_stock' : 'low_stock'
        })),
        count: lowStockItems.length,
        threshold: parseInt(threshold)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new inventory item
 * @route   POST /api/inventory
 * @access  Private (Admin only)
 */
export const createInventoryItem = async (req, res, next) => {
  try {
    const {
      name,
      sku,
      category,
      description,
      quantity,
      unit,
      unitPrice,
      reorderLevel,
      supplier
    } = req.body;

    if (!name || quantity === undefined) {
      res.status(400);
      throw new Error('Name and quantity are required');
    }

    const existingItem = findOne('inventory', { name: name.trim() });
    if (existingItem) {
      res.status(400);
      throw new Error('An item with this name already exists');
    }

    const item = {
      id: uuidv4(),
      name: name.trim(),
      sku: sku || `SKU-${Date.now().toString(36).toUpperCase()}`,
      category: category || 'general',
      description: description || '',
      quantity: parseInt(quantity),
      unit: unit || 'units',
      unitPrice: parseFloat(unitPrice) || 0,
      reorderLevel: parseInt(reorderLevel) || LOW_STOCK_THRESHOLD,
      supplier: supplier || '',
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await insertOne('inventory', item);

    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: {
        ...item,
        stockStatus: item.quantity <= 0 ? 'out_of_stock' : 
                     item.quantity <= item.reorderLevel ? 'low_stock' : 'in_stock'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update inventory item
 * @route   PUT /api/inventory/:id
 * @access  Private (Admin or Practitioner)
 */
export const updateInventoryItem = async (req, res, next) => {
  try {
    const item = findOne('inventory', { id: req.params.id });

    if (!item) {
      res.status(404);
      throw new Error('Inventory item not found');
    }

    const {
      name,
      category,
      description,
      quantity,
      unit,
      unitPrice,
      reorderLevel,
      supplier,
      adjustment
    } = req.body;

    let newQuantity = item.quantity;
    if (quantity !== undefined) {
      newQuantity = parseInt(quantity);
    } else if (adjustment !== undefined) {
      newQuantity = item.quantity + parseInt(adjustment);
    }

    if (newQuantity < 0) {
      res.status(400);
      throw new Error('Quantity cannot be negative');
    }

    const updatedItem = updateOne('inventory', { id: req.params.id }, {
      ...(name && { name: name.trim() }),
      ...(category && { category }),
      ...(description !== undefined && { description }),
      quantity: newQuantity,
      ...(unit && { unit }),
      ...(unitPrice !== undefined && { unitPrice: parseFloat(unitPrice) }),
      ...(reorderLevel !== undefined && { reorderLevel: parseInt(reorderLevel) }),
      ...(supplier !== undefined && { supplier }),
      updatedBy: req.user.id,
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Inventory item updated successfully',
      data: {
        ...updatedItem,
        stockStatus: updatedItem.quantity <= 0 ? 'out_of_stock' : 
                     updatedItem.quantity <= (updatedItem.reorderLevel || LOW_STOCK_THRESHOLD) ? 'low_stock' : 'in_stock'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete inventory item
 * @route   DELETE /api/inventory/:id
 * @access  Private (Admin only)
 */
export const deleteInventoryItem = async (req, res, next) => {
  try {
    const item = findOne('inventory', { id: req.params.id });

    if (!item) {
      res.status(404);
      throw new Error('Inventory item not found');
    }

    await deleteOne('inventory', { id: req.params.id });

    res.json({
      success: true,
      message: 'Inventory item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getInventory,
  getLowStockItems,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem
};
