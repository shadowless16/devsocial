'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TransactionFilters {
  type?: 'transfer' | 'reward' | 'system';
  status?: 'pending' | 'completed' | 'failed';
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
}

interface TransactionFiltersProps {
  onFiltersChange: (filters: TransactionFilters) => void;
  onReset: () => void;
}

export default function TransactionFilters({ onFiltersChange, onReset }: TransactionFiltersProps) {
  const [filters, setFilters] = useState<TransactionFilters>({});

  const handleFilterChange = (key: keyof TransactionFilters, value: unknown) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    setFilters({});
    onReset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter Transactions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Type</label>
            <Select value={filters.type || ''} onValueChange={(value) => handleFilterChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
                <SelectItem value="reward">Reward</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Status</label>
            <Select value={filters.status || ''} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Min Amount</label>
            <Input
              type="number"
              placeholder="0.00"
              value={filters.minAmount || ''}
              onChange={(e) => handleFilterChange('minAmount', parseFloat(e.target.value))}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Max Amount</label>
            <Input
              type="number"
              placeholder="1000.00"
              value={filters.maxAmount || ''}
              onChange={(e) => handleFilterChange('maxAmount', parseFloat(e.target.value))}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Start Date</label>
            <Input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">End Date</label>
            <Input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
        </div>

        <Button onClick={handleReset} variant="outline" className="w-full">
          Reset Filters
        </Button>
      </CardContent>
    </Card>
  );
}