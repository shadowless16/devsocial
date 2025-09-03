const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://niitsocialhub:devsocial@cluster0.5m149pf.mongodb.net/devsocial-frontend?retryWrites=true&w=majority&appName=Cluster0&ssl=true&authSource=admin";

async function extractData() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('devsocial-frontend');
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    // Extract data from each collection
    for (const collection of collections) {
      const data = await db.collection(collection.name).find({}).toArray();
      console.log(`\n${collection.name} (${data.length} documents):`);
      console.log(JSON.stringify(data, null, 2));
    }
  } finally {
    await client.close();
  }
}

extractData().catch(console.error);