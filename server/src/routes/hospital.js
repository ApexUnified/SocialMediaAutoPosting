import express from 'express';
import { body } from 'express-validator';
import { auth, checkRole, checkHospitalAccess } from '../middleware/auth.js';
import {
  getAllHospitals,
  getHospitalById,
  createHospital,
  updateHospital,
  updateHospitalSettings,
  getHospitalStats,
  searchHospitalsByLocation,
  searchHospitalsBySpecialty
} from '../controllers/hospitalController.js';

const router = express.Router();

// Get all hospitals (public)
router.get('/', getAllHospitals);

// Get hospital by ID (public)
router.get('/:id', getHospitalById);

// Create new hospital (admin only)
router.post('/',
  auth,
  checkRole('platform_admin'),
  [
    body('name').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('address').isObject(),
    body('contact').isObject(),
    body('specialties').isArray()
  ],
  createHospital
);

// Update hospital (hospital admin only)
router.put('/:id',
  auth,
  checkRole('hospital_admin'),
  checkHospitalAccess,
  updateHospital
);

// Update hospital settings (hospital admin only)
router.put('/:id/settings',
  auth,
  checkRole('hospital_admin'),
  checkHospitalAccess,
  [
    body('blogAutoPublish').isBoolean(),
    body('socialMediaAutoShare').isBoolean(),
    body('translationEnabled').isBoolean()
  ],
  updateHospitalSettings
);

// Get hospital stats (hospital admin only)
router.get('/:id/stats',
  auth,
  checkRole('hospital_admin'),
  checkHospitalAccess,
  getHospitalStats
);

// Search hospitals by location
router.get('/search/location', searchHospitalsByLocation);

// Search hospitals by specialty
router.get('/search/specialty', searchHospitalsBySpecialty);

export default router; 