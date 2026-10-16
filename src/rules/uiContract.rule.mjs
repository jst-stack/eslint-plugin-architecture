import { createPolicy } from '../configs/defaultPolicy.config.mjs'
import { matchesPackage } from '../lib/packageName.lib.mjs'
import { getProjectPath } from '../lib/path.lib.mjs'

export const uiContract = {
	meta: {
		docs: {
			description: 'Keep view modules independent from orchestration dependencies.',
			recommended: true,
			url: 'https://github.com/jst-stack/eslint-plugin-architecture/blob/main/docs/rules/ui-contract.md',
		},
		messages: {
			stateImport: 'Do not bind view modules to {{name}}. Observe state in the feature entry and pass plain props and callbacks.',
		},
		schema: [{ type: 'object' }],
		type: 'problem',
	},
	create(context) {
		const policy = createUiPolicy(context.options[0])
		const path = getProjectPath(context.filename)
		const segments = path.split('/')
		const filename = segments.at(-1) ?? ''
		const isComponent = ['.component.js', '.component.jsx', '.component.ts', '.component.tsx']
			.some(suffix => filename.endsWith(suffix))
		if (!segments.includes('ui') || !isComponent) {
			return {}
		}
		return {
			ImportDeclaration(node) {
				const name = node.source.value
				if (typeof name === 'string' && matchesPackage(name, policy.statePackages)) {
					context.report({ data: { name }, messageId: 'stateImport', node })
				}
			},
		}
	},
}

function createUiPolicy(overrides) {
	return createPolicy(overrides ? { ui: overrides } : {}).ui
}
