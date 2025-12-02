// Setup common test environment
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret-for-jest';

// Silence console logs during tests except errors
const origConsole = console.log;
console.log = (...args: any[]) => {
  // keep error logs but hide normal logs for cleaner test output
  // If i might need logs during test development, then will have to remove this override
};
