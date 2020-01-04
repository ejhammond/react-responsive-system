module.exports = {
  extends: [require.resolve('@tripphamm/trippkit/configs/eslint-config-react')],
  globals: {
    __DEV__: 'readonly',
  },
};
