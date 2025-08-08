// // Rollback script to revert 'affiliation' field back to 'branch' in the database
// // Only run this if you need to undo the migration

// const mongoose = require('mongoose');
// const dotenv = require('dotenv');

// // Load environment variables
// dotenv.config({ path: '.env.local' });

// // MongoDB connection
// const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

// if (!MONGODB_URI) {
//   console.error('Please define the MONGODB_URI or DATABASE_URL environment variable');
//   process.exit(1);
// }

// async function runRollback() {
//   try {
//     // Connect to MongoDB
//     await mongoose.connect(MONGODB_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log('Connected to MongoDB');

//     // Get the users collection
//     const db = mongoose.connection.db;
//     const usersCollection = db.collection('users');

//     // Count documents with 'affiliation' field
//     const documentsWithAffiliation = await usersCollection.countDocuments({ affiliation: { $exists: true } });
//     console.log(`Found ${documentsWithAffiliation} documents with 'affiliation' field`);

//     if (documentsWithAffiliation > 0) {
//       // Confirm rollback
//       console.log('\n⚠️  WARNING: This will revert all affiliation fields back to branch!');
//       console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...');
//       await new Promise(resolve => setTimeout(resolve, 5000));

//       // Update all documents: rename 'affiliation' back to 'branch'
//       const result = await usersCollection.updateMany(
//         { affiliation: { $exists: true } },
//         { 
//           $rename: { 'affiliation': 'branch' }
//         }
//       );

//       console.log(`\nRollback completed successfully!`);
//       console.log(`- Documents matched: ${result.matchedCount}`);
//       console.log(`- Documents modified: ${result.modifiedCount}`);
//     } else {
//       console.log('No documents found with affiliation field. Nothing to rollback.');
//     }

//     // Verify the rollback
//     const documentsWithBranch = await usersCollection.countDocuments({ branch: { $exists: true } });
//     const remainingAffiliationDocs = await usersCollection.countDocuments({ affiliation: { $exists: true } });
    
//     console.log('\nVerification:');
//     console.log(`- Documents with 'branch' field: ${documentsWithBranch}`);
//     console.log(`- Documents still with 'affiliation' field: ${remainingAffiliationDocs}`);

//     // Close the connection
//     await mongoose.connection.close();
//     console.log('\nRollback script completed. Database connection closed.');
    
//   } catch (error) {
//     console.error('Rollback failed:', error);
//     process.exit(1);
//   }
// }

// // Run the rollback
// runRollback();
