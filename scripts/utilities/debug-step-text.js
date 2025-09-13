// Debug script to check exact step text
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://niitsocialhub:devsocial@cluster0.5m149pf.mongodb.net/devsocial-frontend?retryWrites=true&w=majority&appName=Cluster0');

const missionProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  mission: { type: mongoose.Schema.Types.ObjectId, ref: 'Mission' },
  status: String,
  stepsCompleted: [String]
});

const missionSchema = new mongoose.Schema({
  title: String,
  steps: [{
    id: String,
    title: String,
    description: String,
    target: Number
  }]
});

const MissionProgress = mongoose.model('MissionProgress', missionProgressSchema);
const Mission = mongoose.model('Mission', missionSchema);

async function debugStepText() {
  try {
    const userId = '689129532482a94aaaae3583';
    
    const activeMissions = await MissionProgress.find({
      user: userId,
      status: 'active'
    }).populate('mission');
    
    for (const progress of activeMissions) {
      console.log(`\n=== ${progress.mission.title} ===`);
      
      for (const step of progress.mission.steps) {
        const stepText = ((step.title || '') + ' ' + (step.description || '')).toLowerCase();
        console.log(`Step: "${step.title}"`);
        console.log(`Description: "${step.description || 'none'}"`);
        console.log(`Combined text: "${stepText}"`);
        console.log(`Contains 'follow': ${stepText.includes('follow')}`);
        console.log(`Contains 'user': ${stepText.includes('user')}`);
        console.log(`Contains 'developer': ${stepText.includes('developer')}`);
        console.log(`Target: ${step.target}`);
        console.log('---');
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debugStepText();