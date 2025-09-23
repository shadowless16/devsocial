// cd m#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const { config } = require('dotenv');
const path = require('path');

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') });

// Import your models and utilities
const connectDB = require('../lib/db.ts').default;
const User = require('../models/User.ts').default;
const Referral = require('../models/Referral.ts').default;
const UserStats = require('../models/UserStats.ts').default;
const { ReferralSystemFixed } = require('../utils/referral-system-fixed.ts');

class ReferralDebugServer {
  constructor() {
    this.server = new Server(
      {
        name: 'referral-debug-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'check_akdavid_referrals',
          description: 'Check all referrals for AkDavid user and their status',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'debug_referral_system',
          description: 'Get comprehensive referral system debug information',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'check_user_referrals',
          description: 'Check referrals for a specific user by username',
          inputSchema: {
            type: 'object',
            properties: {
              username: {
                type: 'string',
                description: 'Username to check referrals for',
              },
            },
            required: ['username'],
          },
        },
        {
          name: 'validate_referral_code',
          description: 'Validate a specific referral code',
          inputSchema: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                description: 'Referral code to validate',
              },
            },
            required: ['code'],
          },
        },
        {
          name: 'check_signup_flow',
          description: 'Test the referral signup flow with a specific code',
          inputSchema: {
            type: 'object',
            properties: {
              referralCode: {
                type: 'string',
                description: 'Referral code to test signup flow with',
              },
            },
            required: ['referralCode'],
          },
        },
        {
          name: 'fix_pending_referrals',
          description: 'Check and fix any pending referrals that should be completed',
          inputSchema: {
            type: 'object',
            properties: {
              userId: {
                type: 'string',
                description: 'Optional: specific user ID to check, otherwise checks all',
              },
            },
          },
        },
        {
          name: 'get_referral_stats',
          description: 'Get detailed referral statistics for a user',
          inputSchema: {
            type: 'object',
            properties: {
              username: {
                type: 'string',
                description: 'Username to get stats for',
              },
            },
            required: ['username'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        await connectDB();

        switch (name) {
          case 'check_akdavid_referrals':
            return await this.checkAkDavidReferrals();
          
          case 'debug_referral_system':
            return await this.debugReferralSystem();
          
          case 'check_user_referrals':
            return await this.checkUserReferrals(args.username);
          
          case 'validate_referral_code':
            return await this.validateReferralCode(args.code);
          
          case 'check_signup_flow':
            return await this.checkSignupFlow(args.referralCode);
          
          case 'fix_pending_referrals':
            return await this.fixPendingReferrals(args.userId);
          
          case 'get_referral_stats':
            return await this.getReferralStats(args.username);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}\n\nStack: ${error.stack}`,
            },
          ],
        };
      }
    });
  }

  async checkAkDavidReferrals() {
    const possibleUsernames = ['AkDavid', 'akdavid', 'Ak David', 'ak david'];
    let akDavidUser = null;

    for (const username of possibleUsernames) {
      akDavidUser = await User.findOne({
        $or: [
          { username: { $regex: new RegExp(`^${username}$`, 'i') } },
          { email: { $regex: new RegExp(`${username}`, 'i') } }
        ]
      });
      if (akDavidUser) break;
    }

    if (!akDavidUser) {
      const allUsers = await User.find({}).limit(10).select('username email');
      return {
        content: [
          {
            type: 'text',
            text: `❌ Could not find AkDavid user account\n\nAvailable users:\n${allUsers.map(u => `- ${u.username} (${u.email})`).join('\n')}`,
          },
        ],
      };
    }

    // Get all referrals where AkDavid is the referrer
    const referralsAsReferrer = await Referral.find({ referrer: akDavidUser._id })
      .populate('referred', 'username email displayName points')
      .sort({ createdAt: -1 });

    // Get all referrals where AkDavid was referred
    const referralsAsReferred = await Referral.find({ referred: akDavidUser._id })
      .populate('referrer', 'username email displayName')
      .sort({ createdAt: -1 });

    // Get user stats
    const userStats = await UserStats.findOne({ user: akDavidUser._id });

    let report = `🔍 AKDAVID REFERRAL ANALYSIS\n`;
    report += `${'='.repeat(50)}\n\n`;
    
    report += `👤 User Info:\n`;
    report += `- Username: ${akDavidUser.username}\n`;
    report += `- Email: ${akDavidUser.email}\n`;
    report += `- Referral Code: ${akDavidUser.referralCode || 'NOT SET'}\n`;
    report += `- Points/XP: ${akDavidUser.points || 0}\n`;
    report += `- Created: ${akDavidUser.createdAt}\n\n`;

    if (userStats) {
      report += `📊 User Stats:\n`;
      report += `- Total XP: ${userStats.totalXP}\n`;
      report += `- Total Posts: ${userStats.totalPosts}\n`;
      report += `- Total Referrals: ${userStats.totalReferrals}\n\n`;
    }

    report += `📤 REFERRALS MADE BY AKDAVID (${referralsAsReferrer.length} total):\n`;
    report += `${'-'.repeat(40)}\n`;
    
    if (referralsAsReferrer.length === 0) {
      report += `No referrals found where AkDavid is the referrer\n\n`;
    } else {
      referralsAsReferrer.forEach((ref, index) => {
        report += `${index + 1}. ${ref.referred?.username || 'Unknown'} (@${ref.referred?.email || 'no-email'})\n`;
        report += `   Status: ${ref.status}\n`;
        report += `   Code: ${ref.referralCode}\n`;
        report += `   Created: ${ref.createdAt}\n`;
        report += `   Referred User XP: ${ref.referred?.points || 0}\n`;
        if (ref.completedAt) {
          report += `   Completed: ${ref.completedAt}\n`;
        }
        if (ref.expiresAt) {
          report += `   Expires: ${ref.expiresAt}\n`;
        }
        report += `   Rewards Claimed: ${ref.rewardsClaimed}\n`;
        report += `\n`;
      });
    }

    report += `📥 REFERRALS WHERE AKDAVID WAS REFERRED (${referralsAsReferred.length} total):\n`;
    report += `${'-'.repeat(40)}\n`;
    
    if (referralsAsReferred.length === 0) {
      report += `No referrals found where AkDavid was referred\n\n`;
    } else {
      referralsAsReferred.forEach((ref, index) => {
        report += `${index + 1}. Referred by: ${ref.referrer?.username || 'Unknown'}\n`;
        report += `   Status: ${ref.status}\n`;
        report += `   Code: ${ref.referralCode}\n`;
        report += `   Created: ${ref.createdAt}\n`;
        if (ref.completedAt) {
          report += `   Completed: ${ref.completedAt}\n`;
        }
        report += `\n`;
      });
    }

    // Check for issues
    report += `🔧 POTENTIAL ISSUES:\n`;
    report += `${'-'.repeat(40)}\n`;
    
    const issues = [];
    
    if (!akDavidUser.referralCode) {
      issues.push('❌ No referral code set for AkDavid');
    }
    
    const pendingReferrals = referralsAsReferrer.filter(r => r.status === 'pending');
    if (pendingReferrals.length > 0) {
      issues.push(`⚠️  ${pendingReferrals.length} pending referrals that might need completion check`);
      
      for (const pending of pendingReferrals) {
        const referredUserXP = pending.referred?.points || 0;
        if (referredUserXP >= 25) {
          issues.push(`🔥 CRITICAL: ${pending.referred?.username} has ${referredUserXP} XP but referral is still pending!`);
        }
      }
    }
    
    if (issues.length === 0) {
      report += `✅ No obvious issues found\n`;
    } else {
      report += issues.join('\n') + '\n';
    }

    return {
      content: [
        {
          type: 'text',
          text: report,
        },
      ],
    };
  }

  async debugReferralSystem() {
    const debug = await ReferralSystemFixed.debugReferralSystem();
    
    let report = `🔍 REFERRAL SYSTEM DEBUG REPORT\n`;
    report += `${'='.repeat(50)}\n\n`;
    
    report += `📊 Summary:\n`;
    report += `- Total Referrals: ${debug.summary.total}\n`;
    report += `- Pending: ${debug.summary.pending}\n`;
    report += `- Completed: ${debug.summary.completed}\n`;
    report += `- Expired: ${debug.summary.expired}\n\n`;
    
    report += `📋 Recent Referrals (Last 10):\n`;
    report += `${'-'.repeat(40)}\n`;
    
    debug.recentReferrals.forEach((ref, index) => {
      report += `${index + 1}. ${ref.referrer} → ${ref.referred}\n`;
      report += `   Status: ${ref.status}\n`;
      report += `   Code: ${ref.code}\n`;
      report += `   Created: ${ref.createdAt}\n`;
      if (ref.completedAt) {
        report += `   Completed: ${ref.completedAt}\n`;
      }
      report += `\n`;
    });

    return {
      content: [
        {
          type: 'text',
          text: report,
        },
      ],
    };
  }

  async checkUserReferrals(username) {
    const user = await User.findOne({
      $or: [
        { username: { $regex: new RegExp(`^${username}$`, 'i') } },
        { email: { $regex: new RegExp(`${username}`, 'i') } }
      ]
    });

    if (!user) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ User '${username}' not found`,
          },
        ],
      };
    }

    const stats = await ReferralSystemFixed.getReferralStats(user._id.toString());
    
    let report = `🔍 REFERRAL STATS FOR ${user.username}\n`;
    report += `${'='.repeat(50)}\n\n`;
    
    report += `👤 User Info:\n`;
    report += `- Username: ${user.username}\n`;
    report += `- Email: ${user.email}\n`;
    report += `- Referral Code: ${user.referralCode || 'NOT SET'}\n`;
    report += `- Points: ${user.points || 0}\n\n`;
    
    if (Object.keys(stats.stats).length === 0) {
      report += `📭 No referrals found\n`;
    } else {
      report += `📊 Statistics:\n`;
      Object.entries(stats.stats).forEach(([status, data]) => {
        report += `- ${status.toUpperCase()}: ${data.count} referrals, ${data.rewards} XP earned\n`;
      });
      report += `\n`;
    }
    
    if (stats.recentReferrals.length > 0) {
      report += `📋 Recent Referrals:\n`;
      stats.recentReferrals.forEach((ref, index) => {
        report += `${index + 1}. ${ref.referred.displayName || ref.referred.username}\n`;
        report += `   Status: ${ref.status}\n`;
        report += `   Created: ${new Date(ref.createdAt).toLocaleDateString()}\n`;
        if (ref.completedAt) {
          report += `   Completed: ${new Date(ref.completedAt).toLocaleDateString()}\n`;
        }
        report += `\n`;
      });
    }

    return {
      content: [
        {
          type: 'text',
          text: report,
        },
      ],
    };
  }

  async validateReferralCode(code) {
    const validation = await ReferralSystemFixed.validateReferralCode(code);
    
    let report = `🔍 REFERRAL CODE VALIDATION\n`;
    report += `${'='.repeat(50)}\n\n`;
    
    report += `Code: ${code}\n`;
    report += `Valid: ${validation.valid ? '✅ YES' : '❌ NO'}\n`;
    
    if (validation.referrer) {
      report += `Referrer: ${validation.referrer.username} (ID: ${validation.referrer.id})\n`;
    }

    return {
      content: [
        {
          type: 'text',
          text: report,
        },
      ],
    };
  }

  async checkSignupFlow(referralCode) {
    let report = `🔍 TESTING REFERRAL SIGNUP FLOW\n`;
    report += `${'='.repeat(50)}\n\n`;
    
    report += `Testing referral code: ${referralCode}\n\n`;
    
    // Step 1: Validate the code
    const validation = await ReferralSystemFixed.validateReferralCode(referralCode);
    report += `Step 1 - Code Validation: ${validation.valid ? '✅ PASS' : '❌ FAIL'}\n`;
    
    if (!validation.valid) {
      report += `❌ Code is invalid, signup flow would fail\n`;
      return {
        content: [{ type: 'text', text: report }],
      };
    }
    
    report += `Referrer found: ${validation.referrer.username}\n\n`;
    
    // Step 2: Simulate creating a test user (don't actually create)
    report += `Step 2 - Simulating new user signup...\n`;
    report += `✅ Would create referral relationship\n`;
    report += `✅ Would link to referrer: ${validation.referrer.username}\n\n`;
    
    // Step 3: Check if referrer has proper setup
    const referrer = await User.findById(validation.referrer.id);
    report += `Step 3 - Referrer Setup Check:\n`;
    report += `- Has referral code: ${referrer.referralCode ? '✅' : '❌'}\n`;
    report += `- Account active: ${referrer.isActive !== false ? '✅' : '❌'}\n\n`;
    
    report += `🎯 SIGNUP FLOW ANALYSIS:\n`;
    if (validation.valid && referrer.referralCode) {
      report += `✅ Signup flow should work correctly\n`;
      report += `✅ Referral would be created and tracked\n`;
    } else {
      report += `❌ Issues detected that would prevent proper tracking\n`;
    }

    return {
      content: [
        {
          type: 'text',
          text: report,
        },
      ],
    };
  }

  async fixPendingReferrals(userId = null) {
    let report = `🔧 FIXING PENDING REFERRALS\n`;
    report += `${'='.repeat(50)}\n\n`;
    
    if (userId) {
      report += `Checking specific user: ${userId}\n`;
      await ReferralSystemFixed.checkReferralCompletion(userId);
      report += `✅ Checked referral completion for user ${userId}\n`;
    } else {
      report += `Checking all pending referrals...\n`;
      
      const pendingReferrals = await Referral.find({ 
        status: 'pending',
        expiresAt: { $gt: new Date() }
      }).populate('referred', 'username points');
      
      report += `Found ${pendingReferrals.length} pending referrals\n\n`;
      
      let fixed = 0;
      for (const referral of pendingReferrals) {
        const beforeStatus = referral.status;
        await ReferralSystemFixed.checkReferralCompletion(referral.referred._id.toString());
        
        // Reload to check if status changed
        const updatedReferral = await Referral.findById(referral._id);
        if (updatedReferral.status !== beforeStatus) {
          fixed++;
          report += `✅ Fixed referral for ${referral.referred.username} (${referral.referred.points} XP)\n`;
        }
      }
      
      report += `\n🎯 SUMMARY:\n`;
      report += `- Checked: ${pendingReferrals.length} referrals\n`;
      report += `- Fixed: ${fixed} referrals\n`;
    }

    return {
      content: [
        {
          type: 'text',
          text: report,
        },
      ],
    };
  }

  async getReferralStats(username) {
    const user = await User.findOne({
      $or: [
        { username: { $regex: new RegExp(`^${username}$`, 'i') } },
        { email: { $regex: new RegExp(`${username}`, 'i') } }
      ]
    });

    if (!user) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ User '${username}' not found`,
          },
        ],
      };
    }

    // Force check for any completable referrals first
    await ReferralSystemFixed.checkUserReferrals(user._id.toString());
    
    const stats = await ReferralSystemFixed.getReferralStats(user._id.toString());
    
    let report = `📊 DETAILED REFERRAL STATISTICS\n`;
    report += `${'='.repeat(50)}\n\n`;
    
    report += `👤 User: ${user.username}\n`;
    report += `📧 Email: ${user.email}\n`;
    report += `🔗 Referral Code: ${user.referralCode || 'NOT SET'}\n`;
    report += `⭐ Current XP: ${user.points || 0}\n\n`;
    
    if (Object.keys(stats.stats).length === 0) {
      report += `📭 No referral activity found\n`;
    } else {
      report += `📈 Referral Performance:\n`;
      let totalRewards = 0;
      let totalReferrals = 0;
      
      Object.entries(stats.stats).forEach(([status, data]) => {
        report += `- ${status.charAt(0).toUpperCase() + status.slice(1)}: ${data.count} referrals\n`;
        report += `  └─ Rewards earned: ${data.rewards} XP\n`;
        totalRewards += data.rewards;
        totalReferrals += data.count;
      });
      
      report += `\n🎯 Totals:\n`;
      report += `- Total Referrals: ${totalReferrals}\n`;
      report += `- Total XP from Referrals: ${totalRewards}\n\n`;
    }
    
    if (stats.recentReferrals && stats.recentReferrals.length > 0) {
      report += `📋 Referral History (${stats.recentReferrals.length} entries):\n`;
      report += `${'-'.repeat(40)}\n`;
      
      stats.recentReferrals.forEach((ref, index) => {
        const referredUser = ref.referred;
        report += `${index + 1}. ${referredUser.displayName || referredUser.username}\n`;
        report += `   └─ Username: @${referredUser.username}\n`;
        report += `   └─ Status: ${ref.status}\n`;
        report += `   └─ Joined: ${new Date(ref.createdAt).toLocaleDateString()}\n`;
        if (ref.completedAt) {
          report += `   └─ Completed: ${new Date(ref.completedAt).toLocaleDateString()}\n`;
        }
        report += `   └─ Your Reward: ${ref.referrerReward} XP\n`;
        report += `   └─ Their Bonus: ${ref.referredReward} XP\n`;
        report += `\n`;
      });
    }

    return {
      content: [
        {
          type: 'text',
          text: report,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Referral Debug MCP server running on stdio');
  }
}

const server = new ReferralDebugServer();
server.run().catch(console.error);