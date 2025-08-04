const fs = require('fs');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function loadAffiliations() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not found in environment variables');
    return;
  }

  const client = new MongoClient(uri);

  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    const database = client.db();
    const collection = database.collection('affiliations');

    // Read the JSON file
    console.log('Reading affiliations JSON file...');
    const fileContent = fs.readFileSync('docs/affiliations.json', 'utf-8');
    const affiliationsData = JSON.parse(fileContent);

    // Transform the data structure to match what the frontend expects
    const techBootcamps = [
      ...(affiliationsData.TechbootCamps?.NIIT_Centres || []),
      ...(affiliationsData.TechbootCamps?.Top_Bootcamps_Tech_Programmes || []),
    ];

    const nigerian = affiliationsData.Nigerian_Universities || {};
    const federal = nigerian.Federal || [];
    const state = nigerian.State || [];
    const privateUniversities = nigerian.Private || [];
    const affiliatedInstitutions = nigerian.Affiliated_Institutions || [];
    const distanceLearning = nigerian.Distance_Learning || [];

    const transformedData = {
      techBootcamps,
      federal,
      state,
      privateUniversities,
      affiliatedInstitutions,
      distanceLearning,
    };

    // Upsert the data (update if exists, insert if doesn't)
    console.log('Upserting affiliations data...');
    await collection.replaceOne(
      { type: 'affiliations' },
      { 
        type: 'affiliations',
        data: transformedData,
        lastUpdated: new Date()
      },
      { upsert: true }
    );
    
    console.log('Affiliations data loaded successfully!');
    console.log(`Tech Bootcamps: ${techBootcamps.length}`);
    console.log(`Federal Universities: ${federal.length}`);
    console.log(`State Universities: ${state.length}`);
    console.log(`Private Universities: ${privateUniversities.length}`);
    console.log(`Affiliated Institutions: ${affiliatedInstitutions.length}`);
    console.log(`Distance Learning: ${distanceLearning.length}`);
  } catch (error) {
    console.error('Error loading affiliations data:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed.');
  }
}

loadAffiliations();
