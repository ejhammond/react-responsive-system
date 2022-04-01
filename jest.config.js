/* eslint-env commonjs */

module.exports = {
  roots: ['src'],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./src/test/setup.ts'],
};
