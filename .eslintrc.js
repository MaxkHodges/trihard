module.exports = {
  extends: ['expo', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
    'no-console': 'warn',
  },
  ignorePatterns: ['node_modules/', '.expo/', 'dist/', 'types/database.ts'],
};
