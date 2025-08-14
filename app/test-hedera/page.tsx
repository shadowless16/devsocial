import { TestTransaction } from '@/components/test-transaction'

export default function TestHederaPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Hedera Integration Test</h1>
      <TestTransaction />
    </div>
  )
}