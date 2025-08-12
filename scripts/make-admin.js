const mongoose = require('mongoose');
const User = require('../models/User').default;

// MongoDB connection string - update this to match your database
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/devsocial';

async function makeUserAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find and update the user "akdavid" to admin role
    const result = await User.findOneAndUpdate(
      { username: 'AkDavid' },
      { role: 'admin' },
      { new: true }
    );

    if (result) {
      console.log(`✅ Successfully updated user "${result.username}" to admin role`);
      console.log(`User ID: ${result._id}`);
      console.log(`Email: ${result.email}`);
      console.log(`Role: ${result.role}`);
    } else {
      console.log('❌ User "akdavid" not found');
    }

  } catch (error) {
    console.error('Error updating user role:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the script
makeUserAdmin();