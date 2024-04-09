module.export = [
  {
    "extends": [
      "eslint:recommended"
    ],
    "env": {
      "node": true,
      "es6": true
    },
    "parserOptions": {
      "sourceType": "module",
      "ecmaVersion": 2018
    },
    "rules": {
      "array-bracket-spacing": ["error", "never"],
      "curly": [2, "all"],
      "object-curly-spacing": [2, "always"],
      "brace-style": [2, "1tbs"],
      "space-infix-ops": ["error"],
      "semi": ["error", "always"],
      "space-before-function-paren": ["error", "never"],
      "no-console": 0,
      "no-var": 2,
      "prefer-const": ["error", { "destructuring": "all" }],
      "prefer-template": 2,
      "prefer-spread": 2,
      "prefer-rest-params": 2,
      "eqeqeq": 2,
      "no-alert": 2,
      "no-multi-spaces": 2,
      "no-unused-expressions": 2,
      "no-tabs": 2,
      "indent": [2, 2, { "SwitchCase": 1 }],
      "sort-imports": 1
    }
  }
];
