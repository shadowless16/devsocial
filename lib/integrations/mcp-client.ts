import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

class MCPClient {
  private client: Record<string, unknown> | null = null;
  private transport: Record<string, unknown> | null = null;

  async connect() {
    if (this.client) return this.client;

    // Spawn MCP server process
    const serverProcess = spawn('node', ['mcp-server/index.js'], {
      stdio: ['pipe', 'pipe', 'inherit'],
      cwd: process.cwd()
    });

    this.transport = new StdioClientTransport({
      reader: serverProcess.stdout,
      writer: serverProcess.stdin
    } as Record<string, unknown>);

    this.client = new Client(
      { name: 'devsocial-client', version: '1.0.0' }
    );

    await this.client.connect(this.transport);
    return this.client;
  }

  async getUserFeed(userId: string, limit = 20) {
    const client = await this.connect();
    const result = await client.request(
      { method: 'tools/call' },
      {
        name: 'get_user_feed',
        arguments: { userId, limit }
      }
    );
    return JSON.parse(result.content[0].text);
  }

  async getLeaderboard(limit = 10) {
    const client = await this.connect();
    const result = await client.request(
      { method: 'tools/call' },
      {
        name: 'get_leaderboard', 
        arguments: { limit }
      }
    );
    return JSON.parse(result.content[0].text);
  }

  async updateUserXP(userId: string, xpGain: number) {
    const client = await this.connect();
    const result = await client.request(
      { method: 'tools/call' },
      {
        name: 'update_user_xp',
        arguments: { userId, xpGain }
      }
    );
    return JSON.parse(result.content[0].text);
  }
}

export const mcpClient = new MCPClient();