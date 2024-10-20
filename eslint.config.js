import { cowtech } from '@cowtech/eslint-config'

export default [
  ...cowtech,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.test.json'
      }
    }
  }
]
