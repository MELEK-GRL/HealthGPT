module.exports = {
  root: true,
  parser: '@typescript-eslint/parser', // TypeScript parser
  parserOptions: {
    project: './tsconfig.json', // tsconfig yolu
    tsconfigRootDir: __dirname,
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'import',
    'jsx-a11y',
  ],
  extends: [
    '@react-native',                      // react-native'nin temel kuralları
    'plugin:@typescript-eslint/recommended',  // typescript kuralları
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:jsx-a11y/recommended',
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
  },
};
