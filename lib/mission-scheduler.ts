// lib/mission-scheduler.ts
import { MissionAgent } from './agents/missionAgent';
import connectDB from './db';
import Mission from '@/models/Mission';
import User from '@/models/User';

export class MissionScheduler {
  private missionAgent: MissionAgent;
  private isRunning = false;

  constructor() {
    this.missionAgent = new MissionAgent();
  }

  // Auto-generate missions based on user activity
  async triggerMissionCreation(trigger: 'user_signup' | 'daily_check' | 'weekly_check' | 'user_milestone') {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      await connectDB();

      switch (trigger) {
        case 'user_signup':
          await this.createWelcomeMissions();
          break;
        case 'daily_check':
          await this.createDailyMissions();
          break;
        case 'weekly_check':
          await this.createWeeklyMissions();
          break;
        case 'user_milestone':
          await this.createMilestoneMissions();
          break;
      }
    } catch (error) {
      console.error('Mission scheduler error:', error);
    } finally {
      this.isRunning = false;
    }
  }

  private async createWelcomeMissions() {
    const welcomeMissions = [
      {
        title: "Welcome to DevSocial",
        description: "Complete your profile setup and make your first post",
        type: "engagement",
        difficulty: "beginner",
        duration: "weekly",
        steps: [
          {
            id: "profile_setup",
            title: "Complete Profile",
            description: "Add your bio, skills, and profile picture",
            target: 1,
            metric: "profile_completion"
          },
          {
            id: "first_post",
            title: "Make Your First Post",
            description: "Share something with the community",
            target: 1,
            metric: "posts"
          }
        ],
        rewards: { xp: 50, badge: "New Member" }
      }
    ];

    for (const missionData of welcomeMissions) {
      const existingMission = await Mission.findOne({ title: missionData.title });
      if (!existingMission) {
        await Mission.create({
          ...missionData,
          createdBy: null, // System generated
          aiGenerated: true,
          isActive: true
        });
      }
    }
  }

  private async createDailyMissions() {
    const dailyMissions = [
      {
        title: "Daily Engagement",
        description: "Stay active in the community today",
        type: "social",
        difficulty: "beginner",
        duration: "daily",
        steps: [
          {
            id: "daily_likes",
            title: "Give 5 Likes",
            description: "Show appreciation for community content",
            target: 5,
            metric: "likes_given"
          }
        ],
        rewards: { xp: 10 }
      }
    ];

    // Only create if no daily missions exist for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingDaily = await Mission.findOne({
      duration: 'daily',
      createdAt: { $gte: today }
    });

    if (!existingDaily) {
      for (const missionData of dailyMissions) {
        await Mission.create({
          ...missionData,
          createdBy: null,
          aiGenerated: true,
          isActive: true
        });
      }
    }
  }

  private async createWeeklyMissions() {
    // Check if we need new weekly missions
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentWeekly = await Mission.findOne({
      duration: 'weekly',
      createdAt: { $gte: oneWeekAgo }
    });

    if (!recentWeekly) {
      // Generate new weekly missions using AI
      try {
        const response = await fetch(`${process.env.MISTRAL_API_BASE || 'https://api.mistral.ai'}/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'mistral-small-latest',
            messages: [
              {
                role: 'system',
                content: 'Generate 2 weekly developer missions in JSON format. Focus on community building and skill development.'
              },
              {
                role: 'user',
                content: `Create 2 weekly missions for developers. Format:
[{
  "title": "Mission Title",
  "description": "Mission description",
  "type": "social",
  "difficulty": "intermediate",
  "duration": "weekly",
  "steps": [{
    "id": "step1",
    "title": "Step title",
    "description": "Step description", 
    "target": 3,
    "metric": "posts"
  }],
  "rewards": {"xp": 75, "badge": "Weekly Achiever"}
}]`
              }
            ],
            max_tokens: 800,
            temperature: 0.7,
          }),
        });

        const data = await response.json();
        const content = data.choices[0]?.message?.content?.trim();
        const missions = JSON.parse(content.replace(/```json\n?|\n?```/g, ''));

        for (const missionData of missions) {
          await Mission.create({
            ...missionData,
            createdBy: null,
            aiGenerated: true,
            isActive: true
          });
        }
      } catch (error) {
        console.error('Failed to generate weekly missions:', error);
      }
    }
  }

  private async createMilestoneMissions() {
    // Create missions based on user milestones
    const userCount = await User.countDocuments();
    
    // Every 100 new users, create a special mission
    if (userCount % 100 === 0) {
      const milestoneMission = {
        title: `Community Milestone: ${userCount} Members!`,
        description: "Celebrate our growing community by engaging more",
        type: "achievement",
        difficulty: "intermediate", 
        duration: "weekly",
        steps: [
          {
            id: "celebrate_milestone",
            title: "Welcome New Members",
            description: "Follow and welcome 3 new community members",
            target: 3,
            metric: "follows"
          }
        ],
        rewards: { xp: 100, badge: "Community Builder" }
      };

      await Mission.create({
        ...milestoneMission,
        createdBy: null,
        aiGenerated: true,
        isActive: true
      });
    }
  }

  // Method to be called from API endpoints or cron jobs
  async scheduleDailyCheck() {
    await this.triggerMissionCreation('daily_check');
  }

  async scheduleWeeklyCheck() {
    await this.triggerMissionCreation('weekly_check');
  }

  async onUserSignup() {
    await this.triggerMissionCreation('user_signup');
  }

  async onUserMilestone() {
    await this.triggerMissionCreation('user_milestone');
  }
}

export const missionScheduler = new MissionScheduler();