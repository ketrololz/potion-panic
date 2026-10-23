import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'
import globals from 'globals'
import prettier from 'eslint-config-prettier/flat'

export default defineConfig([
    { ignores: ['dist/**', 'coverage/**'] },
    {
        files: ['**/*.{js,mjs,ts}'],
        extends: [js.configs.recommended, tseslint.configs.recommended]
    },
    {
        files: ['src/**/*.ts'],
        languageOptions: { globals: globals.browser }
    },
    prettier,
    {
        files: ['**/*.{js,mjs,ts}'],
        rules: {
            'no-sequences': ['error', { allowInParentheses: false }]
        }
    }
])
