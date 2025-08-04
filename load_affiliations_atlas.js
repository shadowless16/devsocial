const fs = require('fs');
const { MongoClient } = require('mongodb');

async function loadAffiliationsToAtlas() {
  // MongoDB Atlas connection string
  const uri = "mongodb+srv://niitsocialhub:devsocial@cluster0.5m149pf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
  const client = new MongoClient(uri);

  try {
    console.log('Connecting to MongoDB Atlas...');
    await client.connect();
    
    // Connect to the database (will create if it doesn't exist)
    const database = client.db('devsocial-frontend');
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
    console.log('Upserting affiliations data to Atlas...');
    const result = await collection.replaceOne(
      { type: 'affiliations' },
      { 
        type: 'affiliations',
        data: transformedData,
        lastUpdated: new Date()
      },
      { upsert: true }
    );
    
    console.log('✅ Affiliations data loaded successfully to Atlas!');
    console.log(`📊 Data Summary:`);
    console.log(`   • Tech Bootcamps: ${techBootcamps.length}`);
    console.log(`   • Federal Universities: ${federal.length}`);
    console.log(`   • State Universities: ${state.length}`);
    console.log(`   • Private Universities: ${privateUniversities.length}`);
    console.log(`   • Affiliated Institutions: ${affiliatedInstitutions.length}`);
    console.log(`   • Distance Learning: ${distanceLearning.length}`);
    console.log(`   • Total Affiliations: ${Object.values(transformedData).flat().length}`);
    
    if (result.upsertedId) {
      console.log(`📝 Document inserted with ID: ${result.upsertedId}`);
    } else {
      console.log(`📝 Document updated (matched: ${result.matchedCount}, modified: ${result.modifiedCount})`);
    }
    
  } catch (error) {
    console.error('❌ Error loading affiliations data to Atlas:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔒 MongoDB Atlas connection closed.');
  }
}

loadAffiliationsToAtlas();
