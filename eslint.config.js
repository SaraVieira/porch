//  @ts-check
import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  {
    ignores: [
      'dist',
      'node_modules',
      'chrome-extension',
      '.output',
      '.nitro',
      '*.config.js',
      '**/*.config.js',
    ],
  },
  ...tanstackConfig,
  {
    rules: {
      'import/order': 'off',
      '@typescript-eslint/array-type': 'off',
      'sort-imports': 'off',
    },
  },
]
