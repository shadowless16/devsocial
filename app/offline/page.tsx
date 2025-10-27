'use client'

import { WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <WifiOff className="h-24 w-24 text-muted-foreground mb-6" />
      <h1 className="text-3xl font-bold mb-2">You're Offline</h1>
      <p className="text-muted-foreground text-center mb-6 max-w-md">
        It looks like you've lost your internet connection. Some features may not be available.
      </p>
      <Button onClick={() => window.location.reload()}>
        Try Again
      </Button>
    </div>
  );
}
