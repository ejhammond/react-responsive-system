/* eslint-env commonjs */

module.exports = {
  globals: {
    __DEV__: true,
  },
  roots: ['src'],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./src/test/setup.ts'],
};
