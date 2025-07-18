import Reservation from '../models/Reservation.js';
import Hospital from '../models/Hospital.js';
import { validationResult } from 'express-validator';

// Get all reservations for a hospital
export const getHospitalReservations = async (req, res) => {
  try {
    const { status, date, page = 1, limit = 10 } = req.query;
    const query = { hospital: req.params.hospitalId };

    if (status) query.status = status;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    const reservations = await Reservation.find(query)
      .populate('patient', 'firstName lastName phone')
      .populate('service', 'name duration')
      .sort({ date: 1, timeSlot: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Reservation.countDocuments(query);

    res.json({
      reservations,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reservations' });
  }
};

// Get patient's reservations
export const getPatientReservations = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { patient: req.user._id };

    if (status) query.status = status;

    const reservations = await Reservation.find(query)
      .populate('hospital', 'name')
      .populate('service', 'name duration')
      .sort({ date: -1, timeSlot: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Reservation.countDocuments(query);

    res.json({
      reservations,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reservations' });
  }
};

// Create new reservation
export const createReservation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { hospital, service, date, timeSlot, notes } = req.body;

    // Check if hospital exists and is active
    const hospitalExists = await Hospital.findOne({
      _id: hospital,
      isActive: true
    });

    if (!hospitalExists) {
      return res.status(404).json({ message: 'Hospital not found or inactive' });
    }

    // Check if time slot is available
    const existingReservation = await Reservation.findOne({
      hospital,
      date,
      timeSlot,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingReservation) {
      return res.status(400).json({ message: 'Time slot is not available' });
    }

    const reservation = new Reservation({
      hospital,
      service,
      patient: req.user._id,
      date,
      timeSlot,
      notes,
      status: 'pending'
    });

    await reservation.save();

    // Populate hospital and service details
    await reservation.populate('hospital', 'name');
    await reservation.populate('service', 'name duration');

    res.status(201).json(reservation);
  } catch (error) {
    res.status(500).json({ message: 'Error creating reservation' });
  }
};

// Get reservation by ID
export const getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('hospital', 'name')
      .populate('service', 'name duration')
      .populate('patient', 'firstName lastName phone');

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Check if user has access to this reservation
    if (req.user.role === 'patient' && reservation.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user.role === 'hospital_admin' && reservation.hospital._id.toString() !== req.user.hospitalId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reservation' });
  }
};

// Update reservation
export const updateReservation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Check if user has access to this reservation
    if (req.user.role === 'patient' && reservation.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updates = Object.keys(req.body);
    const allowedUpdates = ['date', 'timeSlot', 'notes'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates' });
    }

    updates.forEach(update => reservation[update] = req.body[update]);
    await reservation.save();

    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: 'Error updating reservation' });
  }
};

// Delete reservation
export const deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Check if user has access to this reservation
    if (req.user.role === 'patient' && reservation.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await reservation.remove();
    res.json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting reservation' });
  }
};

// Cancel reservation
export const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Check if user has access to this reservation
    if (req.user.role === 'patient' && reservation.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (reservation.status === 'cancelled') {
      return res.status(400).json({ message: 'Reservation is already cancelled' });
    }

    if (reservation.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel a completed reservation' });
    }

    reservation.status = 'cancelled';
    reservation.cancelledAt = new Date();
    reservation.cancelledBy = req.user._id;
    await reservation.save();

    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling reservation' });
  }
};

// Update reservation status (for hospital admins)
export const updateReservationStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Only hospital admins can update status
    if (req.user.role !== 'hospital_admin' || reservation.hospital.toString() !== req.user.hospitalId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if status change is valid
    const validStatusChanges = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['completed', 'cancelled'],
      completed: [],
      cancelled: []
    };

    if (!validStatusChanges[reservation.status].includes(status)) {
      return res.status(400).json({ message: 'Invalid status change' });
    }

    reservation.status = status;
    if (notes) {
      reservation.notes = notes;
    }

    await reservation.save();

    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: 'Error updating reservation status' });
  }
};

// Add message to chat
export const addChatMessage = async (req, res) => {
  try {
    const { message, attachments } = req.body;
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Check if user has access to this reservation
    if (req.user.role === 'patient' && reservation.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user.role === 'hospital_admin' && reservation.hospital.toString() !== req.user.hospitalId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const chatMessage = {
      sender: req.user._id,
      message,
      attachments,
      timestamp: new Date()
    };

    reservation.chat.push(chatMessage);
    await reservation.save();

    res.json(chatMessage);
  } catch (error) {
    res.status(500).json({ message: 'Error adding chat message' });
  }
};

// Get chat messages
export const getChatMessages = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .select('chat')
      .populate('chat.sender', 'firstName lastName role');

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Check if user has access to this reservation
    if (req.user.role === 'patient' && reservation.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user.role === 'hospital_admin' && reservation.hospital.toString() !== req.user.hospitalId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(reservation.chat);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat messages' });
  }
};

// Mark chat messages as read
export const markChatAsRead = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Check if user has access to this reservation
    if (req.user.role === 'patient' && reservation.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user.role === 'hospital_admin' && reservation.hospital.toString() !== req.user.hospitalId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Mark unread messages as read
    reservation.chat.forEach(message => {
      if (!message.readBy.includes(req.user._id)) {
        message.readBy.push(req.user._id);
      }
    });

    await reservation.save();

    res.json({ message: 'Chat messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking chat messages as read' });
  }
};

// Schedule follow-up
export const scheduleFollowUp = async (req, res) => {
  try {
    const { required, date, notes } = req.body;
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Only hospital admins can schedule follow-ups
    if (req.user.role !== 'hospital_admin' || reservation.hospital.toString() !== req.user.hospitalId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    reservation.followUp = {
      required,
      date,
      notes,
      scheduledBy: req.user._id,
      scheduledAt: new Date()
    };

    await reservation.save();

    res.json(reservation.followUp);
  } catch (error) {
    res.status(500).json({ message: 'Error scheduling follow-up' });
  }
}; 