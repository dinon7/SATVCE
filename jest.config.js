module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/pathwayvce/tests/api/**/*.test.(ts|js)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/pathwayvce/src/$1',
  },
  setupFiles: ['<rootDir>/.env.local'],
}; 