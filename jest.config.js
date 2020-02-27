/* eslint-env commonjs */

module.exports = {
  globals: {
    __DEV__: true,
  },
  roots: ['src', 'test'],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./test/setup.ts'],
};
