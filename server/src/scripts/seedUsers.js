import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const sampleUsers = [
  {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    password: "Patient@123",
    role: "patient",
    phone: "+1234567890",
    personalData: JSON.stringify({
      dateOfBirth: "1990-01-01",
      gender: "male",
      address: "123 Main St",
      medicalHistory: []
    }),
    isActive: true
  },
  {
    firstName: "Sarah",
    lastName: "Smith",
    email: "sarah.smith@hospital.com",
    password: "Hospital@123",
    role: "hospital_admin",
    phone: "+1987654321",
    hospitalId: "YOUR_HOSPITAL_ID", // Replace with actual hospital ID
    personalData: JSON.stringify({
      position: "Hospital Administrator",
      department: "Administration"
    }),
    isActive: true
  },
  {
    firstName: "AI",
    lastName: "Reporter",
    email: "ai.reporter@healthnews.com",
    password: "AI@123",
    role: "ai_journalist",
    phone: "+1122334455",
    aiSettings: {
      writingStyle: "professional",
      topics: ["healthcare", "medical research", "hospital news"],
      language: "en",
      tone: "informative"
    },
    socialMediaAccounts: [
      {
        platform: "twitter",
        accountId: "ai_health_reporter",
        accessToken: "YOUR_ACCESS_TOKEN",
        refreshToken: "YOUR_REFRESH_TOKEN"
      }
    ],
    isActive: true
  },
  {
    firstName: "Admin",
    lastName: "User",
    email: "admin@platform.com",
    password: "Admin@123",
    role: "platform_admin",
    phone: "+1555666777",
    personalData: JSON.stringify({
      position: "System Administrator",
      permissions: ["all"]
    }),
    isActive: true
  }
];

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Insert sample users
    const users = await User.insertMany(sampleUsers);
    console.log('Inserted sample users:', users.map(u => u.email));

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

// Run the seed function
seedUsers(); 