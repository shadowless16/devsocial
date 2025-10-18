'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function BotsManagement() {
  const [bots, setBots] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [personality, setPersonality] = useState('friendly');
  const [frequency, setFrequency] = useState(5);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBots();
    fetchUsers();
  }, []);

  const fetchBots = async () => {
    const res = await fetch('/api/admin/bots');
    const data = await res.json();
    if (data.success) setBots(data.bots);
  };

  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    const data = await res.json();
    if (data.success) setUsers(data.users);
  };

  const addBot = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/bots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: selectedUser, personality, commentFrequency: frequency })
    });
    const data = await res.json();
    if (data.success) {
      fetchBots();
      setSelectedUser('');
    }
    setLoading(false);
  };

  const runBots = async () => {
    setLoading(true);
    await fetch('/api/admin/bots/run', { method: 'POST' });
    setLoading(false);
    alert('Bots ran successfully!');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🤖 Bot Management</h1>
      
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Add Bot Account</h2>
        <div className="space-y-4">
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger>
              <SelectValue placeholder="Select user" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user: any) => (
                <SelectItem key={user._id} value={user._id}>{user.username}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={personality} onValueChange={setPersonality}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="friendly">Friendly</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
            </SelectContent>
          </Select>
          
          <input 
            type="number" 
            value={frequency} 
            onChange={(e) => setFrequency(Number(e.target.value))}
            className="w-full p-2 border rounded"
            placeholder="Comments per run"
            min="1"
            max="20"
          />
          
          <Button onClick={addBot} disabled={loading || !selectedUser}>
            Add Bot
          </Button>
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <Button onClick={runBots} disabled={loading} className="w-full">
          🚀 Run All Bots Now
        </Button>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Active Bots ({bots.length})</h2>
        <div className="space-y-2">
          {bots.map((bot: any) => (
            <div key={bot._id} className="flex items-center justify-between p-3 border rounded">
              <div>
                <p className="font-semibold">{bot.userId?.username}</p>
                <p className="text-sm text-gray-500">{bot.personality} • {bot.commentFrequency} comments/run</p>
              </div>
              <div className="text-sm">
                <p>💬 {bot.stats.totalComments} comments</p>
                <p>↩️ {bot.stats.totalReplies} replies</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
