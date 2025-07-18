import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.userId });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate.' });
  }
};

export const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};

export const checkHospitalAccess = async (req, res, next) => {
  try {
    if (req.user.role === 'hospital_admin') {
      const hospitalId = req.params.hospitalId || req.body.hospitalId;
      
      if (!hospitalId) {
        return res.status(400).json({ message: 'Hospital ID is required.' });
      }

      if (req.user.hospitalId.toString() !== hospitalId) {
        return res.status(403).json({ 
          message: 'You do not have access to this hospital.' 
        });
      }
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
}; 