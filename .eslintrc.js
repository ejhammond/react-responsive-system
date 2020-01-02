module.exports = {
  extends: [require.resolve('trippkit/configs/eslint-config-react')],
  globals: {
    __DEV__: 'readonly',
  },
};
