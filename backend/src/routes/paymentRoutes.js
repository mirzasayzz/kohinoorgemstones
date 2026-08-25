import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Initialize Razorpay Instance.
// In TEST_MODE there are no configured keys; stub only the methods CI relies on.
const razorpay = process.env.TEST_MODE === 'true'
  ? {
      orders: {
        async create(options) {
          return { id: `test_order_${Date.now()}`, ...options };
        },
      },
    }
  : new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

// Authentication middleware for customers checking out
const authenticateCustomer = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication token is required.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'customer') {
      return res.status(401).json({ success: false, message: 'Invalid customer token type.' });
    }

    req.customerId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Session expired. Please sign in again.' });
  }
};

// ============================================
// CREATE RAZORPAY ORDER
// ============================================
router.post('/create-order', authenticateCustomer, async (req, res) => {
  try {
    const { amount } = req.body; // Amount in paise passed from frontend (INR * 100)

    if (!amount) {
      return res.status(400).json({ success: false, message: 'Payment amount is required.' });
    }

    // Minimum amount validation: Razorpay requires at least 100 paise (₹1.00)
    if (amount < 100) {
      return res.status(400).json({ success: false, message: 'Payment amount must be at least 100 paise (₹1.00).' });
    }

    const options = {
      amount: Math.round(amount),
      currency: 'INR',
      receipt: `receipt_rcpt_${Math.floor(Math.random() * 1000000)}`
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('Razorpay Create Order Error:', error);
    res.status(500).json({
      success: false,
      message: 'Razorpay payment gateway failed to create order. Please try again later.'
    });
  }
});

// ============================================
// VERIFY RAZORPAY PAYMENT SIGNATURE
// ============================================
router.post('/verify-payment', authenticateCustomer, async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required Razorpay parameters: payment_id, order_id, or signature.'
      });
    }

    // Generate signature using key secret
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Secure comparison of signature
    if (generated_signature === razorpay_signature) {
      res.status(200).json({
        success: true,
        message: 'Payment verified and signature matched successfully.'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed. Invalid transaction signature.'
      });
    }
  } catch (error) {
    console.error('Razorpay Verify Payment Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error validating payment signature.'
    });
  }
});

export default router;
