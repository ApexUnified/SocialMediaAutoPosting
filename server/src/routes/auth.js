import express from 'express';
import { body } from 'express-validator';
import { auth } from '../middleware/auth.js';
import {
  register,
  login,
  verifyToken,
  updateProfile,
  changePassword,
  getProfile
} from '../controllers/authController.js';

const router = express.Router();

// Register new user
router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
    body('phone').trim().notEmpty(),
    body('role').isIn(['patient', 'hospital_admin', 'platform_admin', 'ai_journalist'])
  ],
  register
);

// Login user
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').exists()
  ],
  login
);


//  get user profile
router.get('/profile', auth, getProfile);

// Verify token
router.get('/verify', auth, verifyToken);

// Update user profile
router.put('/profile', auth, updateProfile);

// Change password
router.put('/change-password', auth,
  [
    body('currentPassword').exists(),
    body('newPassword').isLength({ min: 6 })
  ],
  changePassword
);

export default router; 