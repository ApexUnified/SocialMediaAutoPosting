import Coupon from '../models/Coupon.js';
import { validationResult } from 'express-validator';

// Create new coupon
export const createCoupon = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const coupon = new Coupon({
      ...req.body,
      hospital: req.user.hospitalId,
      createdBy: req.user._id
    });

    await coupon.save();
    const qrCode = await coupon.generateQRCode();

    res.status(201).json({ coupon, qrCode });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all coupons for a hospital
export const getHospitalCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({ hospital: req.user.hospitalId })
      .sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get coupon by ID
export const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({
      _id: req.params.id,
      hospital: req.user.hospitalId
    });

    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    const qrCode = await coupon.generateQRCode();
    res.json({ coupon, qrCode });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update coupon
export const updateCoupon = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const coupon = await Coupon.findOne({
      _id: req.params.id,
      hospital: req.user.hospitalId
    });

    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    const updates = Object.keys(req.body);
    const allowedUpdates = [
      'type', 'value', 'minPurchase', 'maxDiscount',
      'startDate', 'endDate', 'usageLimit', 'description',
      'conditions', 'isActive'
    ];

    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates' });
    }

    updates.forEach(update => coupon[update] = req.body[update]);
    await coupon.save();

    res.json(coupon);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete coupon
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findOneAndDelete({
      _id: req.params.id,
      hospital: req.user.hospitalId
    });

    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Validate coupon
export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({
      code,
      hospital: req.user.hospitalId
    });

    if (!coupon) {
      return res.status(404).json({ error: 'Invalid coupon code' });
    }

    if (!coupon.isValid()) {
      return res.status(400).json({ error: 'Coupon is not valid' });
    }

    const discount = coupon.calculateDiscount(req.body.amount || 0);
    res.json({ coupon, discount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Apply coupon
export const applyCoupon = async (req, res) => {
  try {
    const { code, amount } = req.body;
    const coupon = await Coupon.findOne({
      code,
      hospital: req.user.hospitalId
    });

    if (!coupon) {
      return res.status(404).json({ error: 'Invalid coupon code' });
    }

    if (!coupon.isValid()) {
      return res.status(400).json({ error: 'Coupon is not valid' });
    }

    const discount = coupon.calculateDiscount(amount);
    if (discount === 0) {
      return res.status(400).json({ error: 'Coupon cannot be applied to this amount' });
    }

    const success = await coupon.incrementUsage();
    if (!success) {
      return res.status(400).json({ error: 'Coupon usage limit reached' });
    }

    res.json({ coupon, discount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 