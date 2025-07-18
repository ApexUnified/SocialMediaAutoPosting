import express from 'express';
import { body } from 'express-validator';
import { auth, checkRole, checkHospitalAccess } from '../middleware/auth.js';
import {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  subscribeToPlan,
  getCurrentSubscription,
  updateUsage,
  cancelSubscription,
  getSubscriptionHistory
} from '../controllers/subscriptionController.js';

const router = express.Router();

// Get all subscription plans (public)
router.get('/plans', getAllPlans);

// Get subscription plan by ID (public)
router.get('/plans/:id', getPlanById);

// Create new subscription plan (admin only)
router.post('/plans',
  auth,
  checkRole('platform_admin'),
  [
    body('name').trim().notEmpty(),
    body('description').optional().trim(),
    body('features').isObject(),
    body('pricing.amount').isNumeric(),
    body('pricing.currency').isString(),
    body('pricing.billingCycle').isIn(['monthly', 'quarterly', 'yearly']),
    body('limits').isObject()
  ],
  createPlan
);

// Update subscription plan (admin only)
router.put('/plans/:id',
  auth,
  checkRole('platform_admin'),
  updatePlan
);

// Subscribe hospital to a plan
router.post('/subscribe',
  auth,
  checkRole('hospital_admin'),
  [
    body('subscriptionId').notEmpty(),
    body('startDate').isISO8601(),
    body('payment').isObject()
  ],
  subscribeToPlan
);

// Get hospital's current subscription
router.get('/current',
  auth,
  checkRole('hospital_admin'),
  checkHospitalAccess,
  getCurrentSubscription
);

// Update subscription usage
router.put('/usage',
  auth,
  checkRole('hospital_admin'),
  checkHospitalAccess,
  [
    body('type').isIn(['reservations', 'blogPosts', 'coupons', 'translations', 'storage']),
    body('amount').isNumeric()
  ],
  updateUsage
);

// Cancel subscription
router.post('/cancel',
  auth,
  checkRole('hospital_admin'),
  checkHospitalAccess,
  cancelSubscription
);

// Get subscription history
router.get('/history',
  auth,
  checkRole('hospital_admin'),
  checkHospitalAccess,
  getSubscriptionHistory
);

export default router; 