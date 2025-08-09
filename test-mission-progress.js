// Test script to check mission progress tracking
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb+srv://niitsocialhub:devsocial@cluster0.5m149pf.mongodb.net/devsocial-frontend?retryWrites=true&w=majority&appName=Cluster0');

// Define schemas (simplified)
const missionProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  mission: { type: mongoose.Schema.Types.ObjectId, ref: 'Mission' },
  status: String,
  stepsCompleted: [String],
  joinedAt: Date,
  completedAt: Date
});

const followSchema = new mongoose.Schema({
  follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  following: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const missionSchema = new mongoose.Schema({
  title: String,
  steps: [{
    id: String,
    title: String,
    description: String,
    target: Number,
    metric: String
  }],
  rewards: {
    xp: Number
  }
});

const MissionProgress = mongoose.model('MissionProgress', missionProgressSchema);
const Follow = mongoose.model('Follow', followSchema);
const Mission = mongoose.model('Mission', missionSchema);

async function testMissionProgress() {
  try {
    const userId = '689129532482a94aaaae3583'; // Your user ID
    
    console.log('=== Testing Mission Progress ===');
    
    // 1. Check active missions
    const activeMissions = await MissionProgress.find({
      user: userId,
      status: 'active'
    }).populate('mission');
    
    console.log(`Found ${activeMissions.length} active missions`);
    
    for (const progress of activeMissions) {
      console.log(`\nMission: ${progress.mission.title}`);
      console.log(`Steps completed: ${progress.stepsCompleted.length}/${progress.mission.steps.length}`);
      
      // Check each step
      for (const step of progress.mission.steps) {
        const stepId = step.id || step._id?.toString();
        const isCompleted = progress.stepsCompleted.includes(stepId);
        
        console.log(`  Step: ${step.title} - ${isCompleted ? 'COMPLETED' : 'PENDING'}`);
        
        // Check follow count if it's a follow step
        const stepText = (step.title + ' ' + step.description).toLowerCase();
        if (stepText.includes('follow')) {
          const followCount = await Follow.countDocuments({ follower: userId });
          console.log(`    Current follows: ${followCount}, Target: ${step.target || 1}`);
          
          // Check if should be completed
          if (followCount >= (step.target || 1) && !isCompleted) {
            console.log(`    ⚠️  SHOULD BE COMPLETED BUT ISN'T!`);
          }
        }
      }
    }
    
    // 2. Check total follow count
    const totalFollows = await Follow.countDocuments({ follower: userId });
    console.log(`\nTotal follows by user: ${totalFollows}`);
    
    // 3. Check recent follows
    const recentFollows = await Follow.find({ follower: userId }).sort({ createdAt: -1 }).limit(5);
    console.log(`Recent follows: ${recentFollows.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testMissionProgress();