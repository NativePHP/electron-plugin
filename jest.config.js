module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    "electron": "<rootDir>/mocks/electron.ts",
  }
};
