module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: 'airbnb',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    ["max-len"]: ["error", { "code": 120 }],
    "max-classes-per-file": "off",
  },
};
