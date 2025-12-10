// // TypeScript migration script to rename 'branch' field to 'affiliation' in the database
// // Run this script once to update all existing user documents

// import mongoose from "mongoose";
// import connectDB from "../lib/db";
// import User from "../models/User";

// async function runMigration() {
//   try {
//     // Connect to MongoDB using your existing connection function
//     await connectDB();
//     console.log("Connected to MongoDB");

//     // Get the users collection
//     const usersCollection = mongoose.connection.db.collection("users");

//     // Count documents with 'branch' field
//     const documentsWithBranch = await usersCollection.countDocuments({ 
//       branch: { $exists: true } 
//     });
//     console.log(`Found ${documentsWithBranch} documents with 'branch' field`);

//     if (documentsWithBranch > 0) {
//       // Update all documents: rename 'branch' to 'affiliation'
//       const result = await usersCollection.updateMany(
//         { branch: { $exists: true } },
//         { 
//           $rename: { "branch": "affiliation" }
//         }
//       );

//       console.log(`Migration completed successfully!`);
//       console.log(`- Documents matched: ${result.matchedCount}`);
//       console.log(`- Documents modified: ${result.modifiedCount}`);

//       // Also update any indexes if they exist
//       try {
//         const indexes = await usersCollection.indexes();
//         const branchIndex = indexes.find(idx => idx.key && idx.key.branch);
        
//         if (branchIndex) {
//           console.log("Found index on branch field, recreating for affiliation...");
//           await usersCollection.dropIndex({ branch: 1 });
//           await usersCollection.createIndex({ affiliation: 1 });
//           console.log("Index updated successfully");
//         }
//       } catch (indexError: unknown) {
//         console.log("No index updates needed");
//       }
//     } else {
//       console.log("No documents found with branch field. Migration may have already been completed.");
//     }

//     // Verify the migration
//     const documentsWithAffiliation = await usersCollection.countDocuments({ 
//       affiliation: { $exists: true } 
//     });
//     const remainingBranchDocs = await usersCollection.countDocuments({ 
//       branch: { $exists: true } 
//     });
    
//     console.log("\nVerification:");
//     console.log(`- Documents with 'affiliation' field: ${documentsWithAffiliation}`);
//     console.log(`- Documents still with 'branch' field: ${remainingBranchDocs}`);

//     // Sample check - show a few affiliations
//     const sampleUsers = await usersCollection.find(
//       { affiliation: { $exists: true } },
//       { projection: { username: 1, affiliation: 1 } }
//     ).limit(5).toArray();
    
//     if (sampleUsers.length > 0) {
//       console.log("\nSample migrated users:");
//       sampleUsers.forEach(user => {
//         console.log(`- ${user.username}: ${user.affiliation}`);
//       });
//     }

//     // Close the connection
//     await mongoose.connection.close();
//     console.log("\nMigration script completed. Database connection closed.");
    
//   } catch (error: unknown) {
//     console.error("Migration failed:", error);
//     process.exit(1);
//   }
// }

// // Run the migration
// runMigration();
