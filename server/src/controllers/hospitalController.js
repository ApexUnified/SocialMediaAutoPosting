import Hospital from '../models/Hospital.js';

// Get all hospitals
export const getAllHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find({ isActive: true })
      .select('name description address contact specialties images socialMedia');
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hospitals' });
  }
};

// Get hospital by ID
export const getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id)
      .select('name description address contact specialties doctors images socialMedia');
    
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    res.json(hospital);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hospital' });
  }
};

// Create new hospital
export const createHospital = async (req, res) => {
  try {
    const hospital = new Hospital(req.body);
    await hospital.save();
    res.status(201).json(hospital);
  } catch (error) {
    res.status(500).json({ message: 'Error creating hospital' });
  }
};

// Update hospital
export const updateHospital = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = [
      'name',
      'description',
      'address',
      'contact',
      'specialties',
      'doctors',
      'images',
      'socialMedia',
      'settings'
    ];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates' });
    }

    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    updates.forEach(update => hospital[update] = req.body[update]);
    await hospital.save();

    res.json(hospital);
  } catch (error) {
    res.status(500).json({ message: 'Error updating hospital' });
  }
};

// Update hospital settings
export const updateHospitalSettings = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    hospital.settings = req.body;
    await hospital.save();

    res.json(hospital.settings);
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings' });
  }
};

// Get hospital stats
export const getHospitalStats = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id)
      .select('stats');
    
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    res.json(hospital.stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
};

// Search hospitals by location
export const searchHospitalsByLocation = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10000 } = req.query; // radius in meters

    const hospitals = await Hospital.find({
      isActive: true,
      'address.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(radius)
        }
      }
    }).select('name description address contact specialties images');

    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: 'Error searching hospitals' });
  }
};

// Search hospitals by specialty
export const searchHospitalsBySpecialty = async (req, res) => {
  try {
    const { specialty } = req.query;

    const hospitals = await Hospital.find({
      isActive: true,
      specialties: specialty
    }).select('name description address contact specialties images');

    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: 'Error searching hospitals' });
  }
}; 