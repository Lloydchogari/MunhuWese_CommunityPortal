export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  // Use a CommonJS setup file so Jest loads it reliably under mixed ESM/TS
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.cjs'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true }],
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  moduleNameMapper: {
    // When TypeScript sources use runtime-style .js imports, resolve them back
    // to the module root (the resolver will find .ts files via extensions).
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
};
