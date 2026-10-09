import eslintReact from '@eslint-react/eslint-plugin'
import eslint from '@eslint/js'
import betterTailwind from 'eslint-plugin-better-tailwindcss'
import reactHooks from 'eslint-plugin-react-hooks'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig(
  eslint.configs.recommended,

  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
      '@typescript-eslint/consistent-type-definitions': ['error', 'type']
    }
  },

  eslintReact.configs['recommended-typescript'],

  reactHooks.configs.flat.recommended,

  {
    languageOptions: {
      parser: tseslint.parser,

      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: { jsx: true }
      },

      globals: {
        ...globals.node,
        ...globals.browser
      }
    }
  },

  { settings: { react: { version: 'detect' } } },

  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'better-tailwindcss': betterTailwind },
    settings: {
      'better-tailwindcss': {
        // Tailwind v4: CSS entry that holds @import 'tailwindcss' and @theme
        entryPoint: 'src/index.css'
      }
    },
    rules: {
      ...betterTailwind.configs.recommended.rules,
      'better-tailwindcss/no-unknown-classes': 'error',
      // Formatting is handled by oxfmt (class sorting, whitespace, wrapping)
      'better-tailwindcss/enforce-consistent-line-wrapping': 'off',
      'better-tailwindcss/enforce-consistent-class-order': 'off',
      'better-tailwindcss/no-unnecessary-whitespace': 'off'
    }
  },

  { ignores: ['dist/'] },

  {
    files: ['**/*.js'],
    extends: [tseslint.configs.disableTypeChecked]
  }
)
