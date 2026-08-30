import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Cart from '../models/Cart.js';
import Gemstone from '../models/Gemstone.js';

const router = express.Router();

// Authentication middleware for customer cart
const authenticateCustomer = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'customer') {
      return res.status(401).json({ success: false, message: 'Invalid token type' });
    }

    req.customerId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

const getOrCreateCart = async (customerId) => {
  let cart = await Cart.findOne({ customer: customerId });
  if (!cart) {
    cart = await Cart.create({ customer: customerId, items: [] });
  }
  return cart;
};

const getPrice = (gemstone) => gemstone.price || gemstone.priceRange?.min || 0;

// ============================================
// GET CART
// ============================================
router.get('/', authenticateCustomer, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.customerId);
    res.status(200).json(cart.toCartJSON());
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to load cart' });
  }
});

// ============================================
// ADD ITEM TO CART
// ============================================
router.post('/add', authenticateCustomer, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive integer' });
    }

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const gemstone = await Gemstone.findOne({ _id: productId, isActive: true });
    if (!gemstone) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const cart = await getOrCreateCart(req.customerId);

    const existingItem = cart.items.find((item) => item.product.toString() === gemstone._id.toString());
    if (existingItem) {
      existingItem.quantity += qty;
    } else {
      cart.items.push({
        product: gemstone._id,
        name: gemstone.name?.english || gemstone.name || 'Gemstone',
        price: getPrice(gemstone),
        quantity: qty
      });
    }

    await cart.save();
    res.status(200).json(cart.toCartJSON());
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to add item to cart' });
  }
});

// ============================================
// UPDATE CART ITEM QUANTITY
// ============================================
router.put('/update/:itemId', authenticateCustomer, async (req, res) => {
  try {
    const { quantity } = req.body;
    const qty = parseInt(quantity, 10);
    if (!Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive integer' });
    }

    const cart = await getOrCreateCart(req.customerId);
    const item = cart.items.id(req.params.itemId);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    item.quantity = qty;
    await cart.save();
    res.status(200).json(cart.toCartJSON());
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to update cart item' });
  }
});

// ============================================
// REMOVE ITEM FROM CART
// ============================================
router.delete('/remove/:itemId', authenticateCustomer, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.customerId);
    const item = cart.items.id(req.params.itemId);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    item.deleteOne();
    await cart.save();
    res.status(200).json(cart.toCartJSON());
  } catch (error) {
    console.error('Remove cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove cart item' });
  }
});

// ============================================
// CLEAR CART
// ============================================
router.delete('/clear', authenticateCustomer, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.customerId);
    cart.items = [];
    await cart.save();
    res.status(200).json(cart.toCartJSON());
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to clear cart' });
  }
});

export default router;