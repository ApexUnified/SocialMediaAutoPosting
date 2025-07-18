import express from 'express';
import { body } from 'express-validator';
import { auth, checkRole } from '../middleware/auth.js';
import {
  getHospitalReservations,
  getPatientReservations,
  createReservation,
  getReservationById,
  updateReservation,
  deleteReservation,
  cancelReservation,
  updateReservationStatus,
  addChatMessage,
  getChatMessages,
  markChatAsRead,
  scheduleFollowUp
} from '../controllers/reservationController.js';

const router = express.Router();

// Get all reservations (role-based)
router.get(
  '/',
  auth,
  (req, res, next) => {
    if (req.user.role === 'hospital_admin') {
      return getHospitalReservations(req, res, next);
    }
    return getPatientReservations(req, res, next);
  }
);

// Create new reservation
router.post(
  '/',
  auth,
  checkRole(['patient']),
  [
    body('hospital').notEmpty(),
    body('service').notEmpty(),
    body('date').isISO8601(),
    body('timeSlot').notEmpty(),
    body('notes').optional()
  ],
  createReservation
);

// Get reservation by ID
router.get(
  '/:id',
  auth,
  getReservationById
);

// Update reservation
router.put(
  '/:id',
  auth,
  checkRole(['patient']),
  [
    body('date').optional().isISO8601(),
    body('timeSlot').optional(),
    body('notes').optional()
  ],
  updateReservation
);

// Delete reservation
router.delete(
  '/:id',
  auth,
  checkRole(['patient']),
  deleteReservation
);

// Cancel reservation
router.post(
  '/:id/cancel',
  auth,
  checkRole(['patient']),
  cancelReservation
);

// Update reservation status (hospital admin only)
router.patch(
  '/:id/status',
  auth,
  checkRole(['hospital_admin']),
  [
    body('status').isIn(['pending', 'confirmed', 'completed', 'cancelled']),
    body('notes').optional()
  ],
  updateReservationStatus
);

// Chat routes
router.post(
  '/:id/chat',
  auth,
  [
    body('message').notEmpty(),
    body('attachments').optional().isArray()
  ],
  addChatMessage
);

router.get(
  '/:id/chat',
  auth,
  getChatMessages
);

router.post(
  '/:id/chat/read',
  auth,
  markChatAsRead
);

// Follow-up routes
router.post(
  '/:id/follow-up',
  auth,
  checkRole(['hospital_admin']),
  [
    body('required').isBoolean(),
    body('date').isISO8601(),
    body('notes').optional()
  ],
  scheduleFollowUp
);

export default router;