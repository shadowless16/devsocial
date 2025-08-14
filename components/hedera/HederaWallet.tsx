'use client';

import { useState } from 'react';
import { Client, AccountBalanceQuery, AccountId, PrivateKey } from '@hashgraph/sdk';

interface HederaWalletProps {
  accountId?: string;
  privateKey?: string;
}

export default function HederaWallet({ 
  accountId = process.env.HEDERA_TESTNET_ACCOUNT_ID,
  privateKey = process.env.HEDERA_TESTNET_PRIVATE_KEY 
}: HederaWalletProps) {
  const [balance, setBalance] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const getBalance = async () => {
    if (!accountId || !privateKey) return;
    
    setLoading(true);
    try {
      const client = Client.forTestnet();
      client.setOperator(AccountId.fromString(accountId), PrivateKey.fromString(privateKey));
      
      const balance = await new AccountBalanceQuery()
        .setAccountId(AccountId.fromString(accountId))
        .execute(client);
      
      setBalance(balance.hbars.toString());
      client.close();
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Hedera Wallet</h3>
      <p className="text-sm text-gray-600 mb-2">Account: {accountId}</p>
      <div className="flex items-center gap-2">
        <button 
          onClick={getBalance}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Get Balance'}
        </button>
        {balance && <span className="font-medium">{balance} ℏ</span>}
      </div>
    </div>
  );
}