#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const mongoose = require('mongoose');

// Connect to MongoDB with production handling
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/devsocial';
const isProduction = process.env.NODE_ENV === 'production';

mongoose.connect(MONGODB_URI).then(() => {
  console.error('MCP Server: Connected to MongoDB');
}).catch(err => {
  console.error('MCP Server: MongoDB connection error:', err);
  if (isProduction) {
    process.exit(1);
  }
});

// User Schema
const UserSchema = new mongoose.Schema({
  username: String,
  displayName: String,
  points: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  avatar: String,
  role: { type: String, default: 'user' }
});

const User = mongoose.model('User', UserSchema);

// Post Schema  
const PostSchema = new mongoose.Schema({
  content: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', PostSchema);

// Project Schema
const ProjectSchema = new mongoose.Schema({
  title: String,
  description: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  technologies: [String],
  openPositions: [{
    title: String,
    description: String,
    requirements: [String]
  }],
  status: String,
  visibility: String,
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 },
  viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Project = mongoose.model('Project', ProjectSchema);

// Referral Schema
const ReferralSchema = new mongoose.Schema({
  referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referred: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referralCode: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed', 'expired'], default: 'pending' },
  completedAt: Date,
  expiresAt: { type: Date, required: true },
  rewardsClaimed: { type: Boolean, default: false },
  referrerReward: { type: Number, default: 25 },
  referredReward: { type: Number, default: 15 }
}, { timestamps: true });

const Referral = mongoose.model('Referral', ReferralSchema);

// UserStats Schema
const UserStatsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  totalPosts: { type: Number, default: 0 },
  totalXP: { type: Number, default: 0 },
  totalReferrals: { type: Number, default: 0 }
}, { timestamps: true });

const UserStats = mongoose.model('UserStats', UserStatsSchema);

const server = new Server(
  {
    name: 'devsocial-db',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_user_feed',
        description: 'Get user feed with posts',
        inputSchema: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
            limit: { type: 'number', default: 20 }
          },
          required: ['userId']
        }
      },
      {
        name: 'get_leaderboard',
        description: 'Get top users by XP',
        inputSchema: {
          type: 'object',
          properties: {
            limit: { type: 'number', default: 10 }
          }
        }
      },
      {
        name: 'update_user_xp',
        description: 'Update user XP and level',
        inputSchema: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
            xpGain: { type: 'number' }
          },
          required: ['userId', 'xpGain']
        }
      },
      {
        name: 'get_growth_metrics',
        description: 'Get user growth and retention analytics',
        inputSchema: {
          type: 'object',
          properties: {
            days: { type: 'number', default: 30 }
          }
        }
      },
      {
        name: 'get_user_analytics',
        description: 'Get detailed user analytics and activity',
        inputSchema: {
          type: 'object',
          properties: {
            days: { type: 'number', default: 30 }
          }
        }
      },
      {
        name: 'debug_projects',
        description: 'Debug project openPositions field',
        inputSchema: {
          type: 'object',
          properties: {
            limit: { type: 'number', default: 10 }
          }
        }
      },
      {
        name: 'create_test_project',
        description: 'Create a test project with openPositions',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', default: 'Test Project' },
            authorId: { type: 'string' }
          },
          required: ['authorId']
        }
      },
      {
        name: 'fix_project_positions',
        description: 'Add sample openPositions to existing projects',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'string' }
          },
          required: ['projectId']
        }
      },
      {
        name: 'debug_referrals',
        description: 'Debug referral system and show statistics',
        inputSchema: {
          type: 'object',
          properties: {
            limit: { type: 'number', default: 10 }
          }
        }
      },
      {
        name: 'validate_referral_code',
        description: 'Validate a referral code',
        inputSchema: {
          type: 'object',
          properties: {
            referralCode: { type: 'string' }
          },
          required: ['referralCode']
        }
      },
      {
        name: 'process_pending_referrals',
        description: 'Process all pending referrals and check for completion',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'create_test_referral',
        description: 'Create a test referral between two users',
        inputSchema: {
          type: 'object',
          properties: {
            referrerId: { type: 'string' },
            referredId: { type: 'string' }
          },
          required: ['referrerId', 'referredId']
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_user_feed':
        const posts = await Post.find()
          .populate('author', 'username displayName avatar')
          .sort({ createdAt: -1 })
          .limit(args.limit || 20)
          .lean();
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(posts, null, 2)
            }
          ]
        };

      case 'get_leaderboard':
        const topUsers = await User.find()
          .sort({ points: -1 })
          .limit(args.limit || 10)
          .select('username displayName points level avatar')
          .lean();
        
        return {
          content: [
            {
              type: 'text', 
              text: JSON.stringify(topUsers, null, 2)
            }
          ]
        };

      case 'update_user_xp':
        const user = await User.findById(args.userId);
        if (!user) throw new Error('User not found');
        
        user.points += args.xpGain;
        user.level = Math.floor(user.points / 1000) + 1;
        await user.save();
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ 
                success: true, 
                newPoints: user.points, 
                newLevel: user.level 
              })
            }
          ]
        };

      case 'get_growth_metrics':
        const days = args.days || 30;
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        // Get user registration data
        const totalUsers = await User.countDocuments();
        const newUsers = await User.countDocuments({
          createdAt: { $gte: startDate, $lte: endDate }
        });
        
        // Calculate growth rate
        const previousPeriodStart = new Date(startDate);
        previousPeriodStart.setDate(previousPeriodStart.getDate() - days);
        const previousUsers = await User.countDocuments({
          createdAt: { $gte: previousPeriodStart, $lt: startDate }
        });
        
        const growthRate = previousUsers > 0 ? 
          Math.round(((newUsers - previousUsers) / previousUsers) * 100) / 100 : 0;
        
        // Get acquisition channels
        const acquisitionData = await User.aggregate([
          { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
          { $group: { _id: '$registrationSource', count: { $sum: 1 } } }
        ]);
        
        const acquisitionChannels = acquisitionData.map(item => ({
          channel: item._id || 'direct',
          users: item.count,
          percentage: Math.round((item.count / Math.max(newUsers, 1)) * 100)
        }));
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                totalUsers,
                newUsers,
                growthRate,
                acquisitionChannels,
                period: { days, startDate, endDate }
              })
            }
          ]
        };

      case 'get_user_analytics':
        const analyticsDays = args.days || 30;
        const analyticsEndDate = new Date();
        const analyticsStartDate = new Date();
        analyticsStartDate.setDate(analyticsStartDate.getDate() - analyticsDays);
        
        // Active users
        const activeUsers = await User.countDocuments({
          lastActive: { $gte: analyticsStartDate, $lte: analyticsEndDate }
        });
        
        // User activity by day
        const dailyActivity = await User.aggregate([
          {
            $match: {
              lastActive: { $gte: analyticsStartDate, $lte: analyticsEndDate }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$lastActive'
                }
              },
              activeUsers: { $sum: 1 }
            }
          },
          { $sort: { '_id': 1 } }
        ]);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                activeUsers,
                dailyActivity,
                period: { days: analyticsDays, startDate: analyticsStartDate, endDate: analyticsEndDate }
              })
            }
          ]
        };

      case 'debug_projects':
        const projects = await Project.find()
          .populate('author', 'username displayName')
          .sort({ createdAt: -1 })
          .limit(args.limit || 10)
          .lean();
        
        const debugInfo = projects.map(project => ({
          id: project._id,
          title: project.title,
          author: project.author?.username || 'Unknown',
          hasOpenPositions: project.hasOwnProperty('openPositions'),
          openPositionsCount: project.openPositions ? project.openPositions.length : 0,
          openPositions: project.openPositions || [],
          createdAt: project.createdAt
        }));
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(debugInfo, null, 2)
            }
          ]
        };

      case 'create_test_project':
        const testProject = await Project.create({
          title: args.title || 'Test Project with Positions',
          description: 'This is a test project created via MCP to verify openPositions functionality',
          author: args.authorId,
          technologies: ['React', 'Node.js', 'MongoDB'],
          openPositions: [
            {
              title: 'Frontend Developer',
              description: 'Looking for a React developer to help with UI components',
              requirements: ['React', 'JavaScript', 'CSS']
            },
            {
              title: 'Backend Developer',
              description: 'Need help with API development and database design',
              requirements: ['Node.js', 'MongoDB', 'Express']
            }
          ],
          status: 'in-progress',
          visibility: 'public'
        });
        
        const populatedTestProject = await Project.findById(testProject._id)
          .populate('author', 'username displayName')
          .lean();
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                project: populatedTestProject,
                message: 'Test project created successfully with openPositions'
              }, null, 2)
            }
          ]
        };

      case 'fix_project_positions':
        const projectToFix = await Project.findById(args.projectId);
        if (!projectToFix) {
          throw new Error('Project not found');
        }
        
        // Add sample positions if none exist
        if (!projectToFix.openPositions || projectToFix.openPositions.length === 0) {
          projectToFix.openPositions = [
            {
              title: 'Full Stack Developer',
              description: 'Looking for a developer to help with both frontend and backend development',
              requirements: projectToFix.technologies.slice(0, 3) || ['JavaScript', 'React', 'Node.js']
            }
          ];
          await projectToFix.save();
        }
        
        const fixedProject = await Project.findById(args.projectId)
          .populate('author', 'username displayName')
          .lean();
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                project: fixedProject,
                message: 'Project openPositions updated successfully'
              }, null, 2)
            }
          ]
        };

      case 'debug_referrals':
        const referralStats = await Referral.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        
        const recentReferrals = await Referral.find()
          .populate('referrer', 'username displayName')
          .populate('referred', 'username displayName')
          .sort({ createdAt: -1 })
          .limit(args.limit || 10)
          .lean();
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                stats: referralStats.reduce((acc, stat) => {
                  acc[stat._id] = stat.count;
                  return acc;
                }, {}),
                recentReferrals: recentReferrals.map(r => ({
                  id: r._id,
                  referrer: r.referrer?.username || 'Unknown',
                  referred: r.referred?.username || 'Unknown',
                  status: r.status,
                  code: r.referralCode,
                  createdAt: r.createdAt,
                  completedAt: r.completedAt
                }))
              }, null, 2)
            }
          ]
        };

      case 'validate_referral_code':
        const referrer = await User.findOne({ referralCode: args.referralCode });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                valid: !!referrer,
                referrer: referrer ? {
                  id: referrer._id,
                  username: referrer.username,
                  displayName: referrer.displayName
                } : null
              }, null, 2)
            }
          ]
        };

      case 'process_pending_referrals':
        const pendingReferrals = await Referral.find({ status: 'pending' })
          .populate('referred', '_id points')
          .lean();
        
        let processed = 0;
        for (const referral of pendingReferrals) {
          const userStats = await UserStats.findOne({ user: referral.referred._id });
          const totalXP = userStats?.totalXP || referral.referred.points || 0;
          
          if (totalXP >= 25) {
            await Referral.findByIdAndUpdate(referral._id, {
              status: 'completed',
              completedAt: new Date(),
              rewardsClaimed: true
            });
            processed++;
          }
        }
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                totalPending: pendingReferrals.length,
                processed,
                message: `Processed ${processed} referrals out of ${pendingReferrals.length} pending`
              }, null, 2)
            }
          ]
        };

      case 'create_test_referral':
        const testReferrer = await User.findById(args.referrerId);
        const testReferred = await User.findById(args.referredId);
        
        if (!testReferrer || !testReferred) {
          throw new Error('One or both users not found');
        }
        
        const existingTestReferral = await Referral.findOne({
          referrer: args.referrerId,
          referred: args.referredId
        });
        
        if (existingTestReferral) {
          throw new Error('Referral already exists between these users');
        }
        
        const testReferralCode = testReferrer.referralCode || `TEST${Date.now()}`;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        
        const newTestReferral = await Referral.create({
          referrer: args.referrerId,
          referred: args.referredId,
          referralCode: testReferralCode,
          expiresAt,
          status: 'pending'
        });
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                referral: {
                  id: newTestReferral._id,
                  referrer: testReferrer.username,
                  referred: testReferred.username,
                  code: testReferralCode,
                  status: newTestReferral.status
                }
              }, null, 2)
            }
          ]
        };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: error.message })
        }
      ],
      isError: true
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('DevSocial MCP Server running');
}

main().catch(console.error);