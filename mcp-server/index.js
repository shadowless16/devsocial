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