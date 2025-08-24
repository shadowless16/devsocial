
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.test' });

const resetPassword = async () => {
  const uri = process.env.MONGODB_TEST_URI;
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const database = client.db();
    console.log('Database name:', database.databaseName);
    const usersCollection = database.collection('users');

    const userId = '68a5c3208fc2fdb8ec155d58';
    const newPassword = 'password123';
    const newRole = 'admin';

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const query = { _id: new ObjectId(userId) };
    console.log('Query:', query);

    const result = await usersCollection.updateOne(
      query,
      {
        $set: {
          password: hashedPassword,
          role: newRole,
        },
      }
    );

    if (result.matchedCount > 0) {
      console.log('User password and role updated successfully.');
    } else {
      console.log('User not found.');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
};

resetPassword();
