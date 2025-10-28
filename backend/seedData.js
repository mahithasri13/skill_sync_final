const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for seeding');

    await User.deleteMany({});

    const tutors = await User.create([
      {
        name: 'Dr. Rajesh Sharma',
        email: 'rajesh.sharma@skillsync.com',
        password: 'password123',
        role: 'tutor',
        profile: {
          bio: 'PhD in Mathematics from IIT Delhi with 8 years of teaching experience',
          subjects: ['Mathematics', 'Physics', 'JEE Preparation'],
          education: 'PhD Mathematics - IIT Delhi',
          experience: '8 years',
          hourlyRate: 500
        }
      },
      {
        name: 'Prof. Priya Patel',
        email: 'priya.patel@skillsync.com',
        password: 'password123',
        role: 'tutor',
        profile: {
          bio: 'Computer Science professor with industry experience',
          subjects: ['Computer Science', 'Web Development', 'Python'],
          education: 'M.Tech Computer Science - NIT Surat',
          experience: '6 years',
          hourlyRate: 400
        }
      }
    ]);

    const students = await User.create([
      {
        name: 'Aarav Kumar',
        email: 'aarav.kumar@skillsync.com',
        password: 'password123',
        role: 'student'
      },
      {
        name: 'Sneha Reddy',
        email: 'sneha.reddy@skillsync.com',
        password: 'password123',
        role: 'student'
      }
    ]);

    console.log('✅ Sample data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();