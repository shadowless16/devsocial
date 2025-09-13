// Force update mission progress
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://niitsocialhub:devsocial@cluster0.5m149pf.mongodb.net/devsocial-frontend?retryWrites=true&w=majority&appName=Cluster0');

const missionProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  mission: { type: mongoose.Schema.Types.ObjectId, ref: 'Mission' },
  status: String,
  stepsCompleted: [String]
});

const followSchema = new mongoose.Schema({
  follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  following: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const MissionProgress = mongoose.model('MissionProgress', missionProgressSchema);
const Follow = mongoose.model('Follow', followSchema);

async function forceUpdateMission() {
  try {
    const userId = '689129532482a94aaaae3583';
    
    // Find Social Butterfly mission progress
    const socialButterflyProgress = await MissionProgress.findOne({
      user: userId,
      status: 'active'
    }).populate('mission');
    
    if (!socialButterflyProgress) {
      console.log('No active mission found');
      return;
    }
    
    console.log('Found mission:', socialButterflyProgress.mission.title);
    
    // Get current follow count
    const followCount = await Follow.countDocuments({ follower: userId });
    console.log('Current follow count:', followCount);
    
    // Find the "Follow 5 Developers" step
    const followStep = socialButterflyProgress.mission.steps.find(step => 
      step.title.toLowerCase().includes('follow') && step.title.toLowerCase().includes('developer')
    );
    
    if (followStep) {
      console.log('Found follow step:', followStep.title);
      console.log('Target:', followStep.target);
      console.log('Step ID:', followStep.id || followStep._id);
      
      const stepId = followStep.id || followStep._id?.toString();
      
      // Check if already completed
      if (socialButterflyProgress.stepsCompleted.includes(stepId)) {
        console.log('Step already completed');
      } else if (followCount >= followStep.target) {
        console.log('Manually completing step...');
        socialButterflyProgress.stepsCompleted.push(stepId);
        await socialButterflyProgress.save();
        console.log('Step completed!');
      } else {
        console.log('Not enough follows yet');
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

forceUpdateMission();