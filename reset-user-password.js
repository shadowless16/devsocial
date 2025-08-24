
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Assuming the User model is in ./models/User
require('dotenv').config({ path: '.env.test' });

const resetPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    const userEmail = 'essieneno10@gmail.com';
    const newPassword = 'password123';
    const newRole = 'admin';

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const user = await User.findOneAndUpdate(
      { email: userEmail },
      {
        $set: {
          password: hashedPassword,
          role: newRole,
        },
      },
      { new: true }
    );

    if (user) {
      console.log('User password and role updated successfully:');
      console.log(user);
    } else {
      console.log('User not found.');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

resetPassword();
