module.exports = {
  extends: ['plugin:@ejhammond/react'],
  globals: {
    __DEV__: 'readonly',
  },
  rules: {
    '@typescript-eslint/ban-ts-ignore': 'off',
    // sometimes things can be any...
    '@typescript-eslint/no-explicit-any': 'off',
    // we've abstracted our expects into a help fn
    // so we don't necessarily need an `expect` inside of each test block
    'jest/expect-expect': 'off',
  },
  overrides: [
    {
      files: ['*rc.js', '*.config.js'],
      extends: ['plugin:@ejhammond/node'],
    },
  ],
};
