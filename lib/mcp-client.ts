const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
const { spawn } = require('child_process');

class MCPClient {
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;

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
    });

    this.client = new Client(
      { name: 'devsocial-client', version: '1.0.0' },
      { capabilities: {} }
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

const mcpClient = new MCPClient();

module.exports = { mcpClient };