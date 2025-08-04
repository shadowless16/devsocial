// Migration script to rename 'branch' field to 'affiliation' in the database
// Run this script once to update all existing user documents

const mongoose = require('mongoose');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to get MongoDB URI from user
function getMongoDBURI() {
  return new Promise((resolve) => {
    console.log('\nMongoDB Migration Script - Rename "branch" to "affiliation"\n');
    console.log('Please enter your MongoDB connection string.');
    console.log('(It should look like: mongodb://... or mongodb+srv://...)\n');
    
    rl.question('MongoDB URI: ', (uri) => {
      rl.close();
      resolve(uri.trim());
    });
  });
}

async function runMigration() {
  try {
    // Get MongoDB URI from user
    const MONGODB_URI = await getMongoDBURI();
    
    if (!MONGODB_URI) {
      console.error('MongoDB URI is required');
      process.exit(1);
    }
    
    // Connect to MongoDB
    console.log('\nConnecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Get the users collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Count documents with 'branch' field
    const documentsWithBranch = await usersCollection.countDocuments({ branch: { $exists: true } });
    console.log(`Found ${documentsWithBranch} documents with 'branch' field`);

    if (documentsWithBranch > 0) {
      // Update all documents: rename 'branch' to 'affiliation'
      const result = await usersCollection.updateMany(
        { branch: { $exists: true } },
        { 
          $rename: { 'branch': 'affiliation' }
        }
      );

      console.log(`Migration completed successfully!`);
      console.log(`- Documents matched: ${result.matchedCount}`);
      console.log(`- Documents modified: ${result.modifiedCount}`);
    } else {
      console.log('No documents found with branch field. Migration may have already been completed.');
    }

    // Verify the migration
    const documentsWithAffiliation = await usersCollection.countDocuments({ affiliation: { $exists: true } });
    const remainingBranchDocs = await usersCollection.countDocuments({ branch: { $exists: true } });
    
    console.log('\nVerification:');
    console.log(`- Documents with 'affiliation' field: ${documentsWithAffiliation}`);
    console.log(`- Documents still with 'branch' field: ${remainingBranchDocs}`);

    // Close the connection
    await mongoose.connection.close();
    console.log('\nMigration script completed. Database connection closed.');
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration();
