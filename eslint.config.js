import js from '@eslint/js'
import quality from '@jst-stack/eslint-plugin-quality'
import jst from './src/index.mjs'

export default [
	{ ignores: ['**/*.d.ts'] },
	js.configs.recommended,
	...quality.createRulesConfig({ limits: { maxLineLength: 160 } }),
	{
		files: ['**/*.{js,mjs}'],
		languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },
		rules: {
			curly: ['error', 'all'],
			'no-console': ['error', { allow: ['error', 'log'] }],
			'no-else-return': 'error',
			'object-shorthand': 'error',
			'prefer-const': 'error',
		},
	},
	{
		files: ['src/{checks,configs,lib,rules}/**/*.mjs'],
		plugins: { jst },
		rules: { 'jst/file-contract': 'error' },
	},
	{
		files: ['src/configs/policy.config.mjs'],
		rules: {
			// The policy schema and validation stay together so their accepted shape cannot drift.
			'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
		},
	},
]
