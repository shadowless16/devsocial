#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestRunner {
  constructor() {
    this.testTypes = {
      unit: '__tests__/**/*.test.{ts,tsx}',
      integration: '__tests__/integration/**/*.test.{ts,tsx}',
      analytics: '__tests__/analytics/**/*.test.{ts,tsx}',
      auth: '__tests__/auth/**/*.test.{ts,tsx}',
      components: '__tests__/components/**/*.test.{tsx}',
      utils: '__tests__/utils/**/*.test.{ts}',
      api: '__tests__/api/**/*.test.{ts}',
      referrals: '__tests__/referrals/**/*.test.{ts}',
    };
    
    this.commands = {
      help: this.showHelp.bind(this),
      all: this.runAllTests.bind(this),
      unit: this.runUnitTests.bind(this),
      integration: this.runIntegrationTests.bind(this),
      watch: this.runWatchMode.bind(this),
      coverage: this.runCoverage.bind(this),
      analytics: this.runAnalyticsTests.bind(this),
      auth: this.runAuthTests.bind(this),
      components: this.runComponentTests.bind(this),
      utils: this.runUtilsTests.bind(this),
      api: this.runApiTests.bind(this),
      referrals: this.runReferralTests.bind(this),
      lint: this.runLint.bind(this),
      clean: this.cleanTestArtifacts.bind(this),
      setup: this.setupTestEnvironment.bind(this),
      ci: this.runCITests.bind(this),
      debug: this.runDebugMode.bind(this),
      parallel: this.runParallelTests.bind(this),
      specific: this.runSpecificTest.bind(this),
    };
  }

  async run() {
    const args = process.argv.slice(2);
    const command = args[0] || 'help';
    const options = args.slice(1);

    if (!this.commands[command]) {
      console.error(`❌ Unknown command: ${command}`);
      this.showHelp();
      process.exit(1);
    }

    try {
      await this.commands[command](options);
    } catch (error) {
      console.error(`❌ Error running command '${command}':`, error.message);
      process.exit(1);
    }
  }

  showHelp() {
    console.log(`
🧪 DevSocial Test Runner

Usage: node test-runner.js <command> [options]

Commands:
  help          Show this help message
  all           Run all tests
  unit          Run unit tests only
  integration   Run integration tests only
  watch         Run tests in watch mode
  coverage      Run tests with coverage report
  analytics     Run analytics-related tests
  auth          Run authentication tests
  components    Run component tests
  utils         Run utility function tests
  api           Run API endpoint tests
  referrals     Run referral system tests
  lint          Run linting checks
  clean         Clean test artifacts and cache
  setup         Setup test environment
  ci            Run tests in CI mode
  debug         Run tests in debug mode
  parallel      Run tests in parallel
  specific      Run specific test file

Examples:
  node test-runner.js all
  node test-runner.js watch analytics
  node test-runner.js coverage --threshold=80
  node test-runner.js specific signup.test.ts
  node test-runner.js ci --verbose
    `);
  }

  async runAllTests(options = []) {
    console.log('🚀 Running all tests...');
    return this.executeJest(['--passWithNoTests'], options);
  }

  async runUnitTests(options = []) {
    console.log('🔬 Running unit tests...');
    const patterns = [
      this.testTypes.utils,
      this.testTypes.components,
      this.testTypes.auth,
      this.testTypes.analytics
    ];
    return this.executeJest(['--testPathPattern', patterns.join('|')], options);
  }

  async runIntegrationTests(options = []) {
    console.log('🔗 Running integration tests...');
    return this.executeJest(['--testPathPattern', this.testTypes.integration], options);
  }

  async runWatchMode(options = []) {
    console.log('👀 Running tests in watch mode...');
    const testType = options[0];
    const pattern = testType && this.testTypes[testType] ? this.testTypes[testType] : '';
    
    const args = ['--watch'];
    if (pattern) {
      args.push('--testPathPattern', pattern);
    }
    
    return this.executeJest(args, options.slice(1));
  }

  async runCoverage(options = []) {
    console.log('📊 Running tests with coverage...');
    const threshold = this.extractOption(options, '--threshold') || '70';
    
    return this.executeJest([
      '--coverage',
      '--coverageThreshold',
      `{"global":{"branches":${threshold},"functions":${threshold},"lines":${threshold},"statements":${threshold}}}`
    ], options);
  }

  async runAnalyticsTests(options = []) {
    console.log('📈 Running analytics tests...');
    return this.executeJest(['--testPathPattern', this.testTypes.analytics], options);
  }

  async runAuthTests(options = []) {
    console.log('🔐 Running authentication tests...');
    return this.executeJest(['--testPathPattern', this.testTypes.auth], options);
  }

  async runComponentTests(options = []) {
    console.log('🧩 Running component tests...');
    return this.executeJest(['--testPathPattern', this.testTypes.components], options);
  }

  async runUtilsTests(options = []) {
    console.log('🛠️ Running utility tests...');
    return this.executeJest(['--testPathPattern', this.testTypes.utils], options);
  }

  async runApiTests(options = []) {
    console.log('🌐 Running API tests...');
    return this.executeJest(['--testPathPattern', this.testTypes.api], options);
  }

  async runReferralTests(options = []) {
    console.log('🎯 Running referral system tests...');
    return this.executeJest(['--testPathPattern', this.testTypes.referrals], options);
  }

  async runLint(options = []) {
    console.log('🔍 Running linting checks...');
    return this.executeCommand('npm', ['run', 'lint']);
  }

  async cleanTestArtifacts(options = []) {
    console.log('🧹 Cleaning test artifacts...');
    
    const artifactsToClean = [
      'coverage',
      'jest-cache',
      '.nyc_output',
      'test-results.xml',
      'junit.xml'
    ];

    for (const artifact of artifactsToClean) {
      if (fs.existsSync(artifact)) {
        await this.executeCommand('rm', ['-rf', artifact]);
        console.log(`✅ Cleaned ${artifact}`);
      }
    }

    // Clear Jest cache
    await this.executeCommand('npx', ['jest', '--clearCache']);
    console.log('✅ Jest cache cleared');
  }

  async setupTestEnvironment(options = []) {
    console.log('⚙️ Setting up test environment...');
    
    // Check if test dependencies are installed
    const requiredDeps = [
      '@testing-library/jest-dom',
      '@testing-library/react',
      '@testing-library/user-event',
      'jest',
      'ts-jest'
    ];

    console.log('📦 Checking test dependencies...');
    for (const dep of requiredDeps) {
      try {
        require.resolve(dep);
        console.log(`✅ ${dep} is installed`);
      } catch (error) {
        console.log(`❌ ${dep} is missing`);
      }
    }

    // Create test setup files if they don't exist
    await this.createTestSetupFiles();
    
    console.log('✅ Test environment setup complete');
  }

  async runCITests(options = []) {
    console.log('🤖 Running tests in CI mode...');
    
    const ciArgs = [
      '--ci',
      '--coverage',
      '--watchAll=false',
      '--passWithNoTests',
      '--verbose'
    ];

    if (options.includes('--verbose')) {
      ciArgs.push('--verbose');
    }

    return this.executeJest(ciArgs, options);
  }

  async runDebugMode(options = []) {
    console.log('🐛 Running tests in debug mode...');
    
    const debugArgs = [
      '--verbose',
      '--no-cache',
      '--runInBand'
    ];

    return this.executeJest(debugArgs, options);
  }

  async runParallelTests(options = []) {
    console.log('⚡ Running tests in parallel...');
    
    const workers = this.extractOption(options, '--workers') || '4';
    
    return this.executeJest([
      '--maxWorkers', workers,
      '--passWithNoTests'
    ], options);
  }

  async runSpecificTest(options = []) {
    if (!options[0]) {
      console.error('❌ Please specify a test file');
      console.log('Example: node test-runner.js specific signup.test.ts');
      return;
    }

    const testFile = options[0];
    console.log(`🎯 Running specific test: ${testFile}`);
    
    return this.executeJest(['--testNamePattern', testFile], options.slice(1));
  }

  async executeJest(jestArgs = [], additionalOptions = []) {
    const args = ['jest', ...jestArgs, ...additionalOptions];
    return this.executeCommand('npx', args);
  }

  async executeCommand(command, args = []) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: 'inherit',
        shell: true,
        cwd: process.cwd()
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Command failed with exit code ${code}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  extractOption(options, optionName) {
    const index = options.findIndex(opt => opt.startsWith(optionName));
    if (index === -1) return null;
    
    const option = options[index];
    if (option.includes('=')) {
      return option.split('=')[1];
    }
    
    return options[index + 1];
  }

  async createTestSetupFiles() {
    const setupFiles = [
      {
        path: 'jest.setup.ts',
        content: `import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Global test utilities
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};`
      }
    ];

    for (const file of setupFiles) {
      if (!fs.existsSync(file.path)) {
        fs.writeFileSync(file.path, file.content);
        console.log(`✅ Created ${file.path}`);
      }
    }
  }
}

// Run the test runner
if (require.main === module) {
  const runner = new TestRunner();
  runner.run().catch(console.error);
}

module.exports = TestRunner;