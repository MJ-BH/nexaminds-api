module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'], // Look for TypeScript test files
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  clearMocks: true,
};