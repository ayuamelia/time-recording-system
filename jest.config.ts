import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: './src',
  testMatch: ['**/tests/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  maxWorkers: 1,
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { 
      tsconfig: './tsconfig.json',
    }],
  },
  clearMocks: true,
};

export default config;