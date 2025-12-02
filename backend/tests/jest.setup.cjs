// CommonJS-compatible Jest setup file
// We avoid using ES module syntax here so Jest can load it consistently
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-for-jest';

// Keep console.log as-is to aid debug while running tests locally

module.exports = {};
