export default {
  '*.{js,ts}': ['eslint --fix', 'prettier --write'],
  '*.{json,css,scss,md,yml,yaml}': 'prettier --write',
};