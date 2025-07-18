import express from 'express';
import { body } from 'express-validator';
import { auth, checkRole } from '../middleware/auth.js';
import {
  createCoupon,
  getHospitalCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  applyCoupon
} from '../controllers/couponController.js';

const router = express.Router();

// Get all coupons for the current hospital admin
router.get(
  '/',
  auth,
  checkRole(['hospital_admin']),
  getHospitalCoupons
);

// Create a new coupon
router.post(
  '/',
  auth,
  checkRole(['hospital_admin']),
  [
    body('name').notEmpty(),
    body('type').isIn(['percentage', 'fixed']),
    body('value').isNumeric(),
    body('startDate').isISO8601(),
    body('endDate').isISO8601(),
    body('usageLimit').optional().isInt({ min: 1 }),
  ],
  createCoupon
);

// Get a coupon by ID
router.get(
  '/:id',
  auth,
  checkRole(['hospital_admin']),
  getCouponById
);

// Update a coupon
router.put(
  '/:id',
  auth,
  checkRole(['hospital_admin']),
  [
    body('type').optional().isIn(['percentage', 'fixed']),
    body('value').optional().isNumeric(),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601(),
    body('usageLimit').optional().isInt({ min: 1 }),
  ],
  updateCoupon
);

// Delete a coupon
router.delete(
  '/:id',
  auth,
  checkRole(['hospital_admin']),
  deleteCoupon
);

// Validate a coupon (for patients)
router.post(
  '/validate',
  auth,
  checkRole(['patient']),
  validateCoupon
);

// Apply a coupon (for patients)
router.post(
  '/apply',
  auth,
  checkRole(['patient']),
  applyCoupon
);

export default router;