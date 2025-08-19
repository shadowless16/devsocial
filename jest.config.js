/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest.env-setup.js'],
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  collectCoverageFrom: [
    'utils/**/*.ts',
    'models/**/*.ts',
    'app/**/*.tsx',
    'components/**/*.tsx',
    '!**/*.d.ts',
  ],
  globalSetup: '<rootDir>/jest.global-setup.ts',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx'
      },
      isolatedModules: true
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  // Performance optimizations
  maxWorkers: '50%',
  testTimeout: 30000,
  // Cache configuration
  cacheDirectory: '<rootDir>/.jest-cache',
  // Faster test execution
  clearMocks: true,
  restoreMocks: true,
  // Skip coverage for faster runs
  collectCoverage: false
}

module.exports = config