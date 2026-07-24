import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 60000,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: ['**/lib/**/*.test.ts'],
  // Nested worktrees ship their own lib/*.test.ts copies; running them
  // double-counts suites and can fire real macOS notifications from
  // unmocked notify() tests.
  testPathIgnorePatterns: [
    '/node_modules/',
    '/\\.worktrees/',
    '/\\.claude/worktrees/',
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: false,
    }],
  },
};

export default config;