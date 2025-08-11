#!/usr/bin/env node

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