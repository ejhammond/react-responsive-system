module.exports = {
  extends: [require.resolve('@tripphamm/trippkit/configs/eslint-config-react')],
  globals: {
    __DEV__: 'readonly',
  },
  rules: {
    '@typescript-eslint/ban-ts-ignore': 'off',
    // we've abstracted our expects into a help fn
    // so we don't necessarily need an `expect` inside of each test block
    'jest/expect-expect': 'off',
  },
};
