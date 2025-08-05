import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const listUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📡 Connected to MongoDB');

    const users = await User.find({}, 'email username role isActive');
    
    console.log('👥 Users in database:', users.length);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.username}) - Role: ${user.role} - Active: ${user.isActive}`);
    });

  } catch (error) {
    console.error('💥 Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
};

listUsers();
