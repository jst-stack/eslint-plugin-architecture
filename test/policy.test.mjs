import { strict as assert } from 'node:assert'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { test } from 'node:test'
import { loadPolicy } from '../src/configs/loadPolicy.config.mjs'
import plugin, { defineArchitecture } from '../src/index.mjs'
import policySchema from '../schema/jst-policy.schema.json' with { type: 'json' }

test('normalizes, validates, and deeply freezes project policy', () => {
	const policy = defineArchitecture({
		files: { roleDirectories: { controller: 'services' }, testSuffixes: ['spec'] },
		generator: { layers: { entity: 'domain' } },
		imports: { layers: { domain: ['domain', 'shared'] }, slicedLayers: ['domain'] },
		styles: { moduleExtension: 'scss' },
	})

	assert.equal(policy.files.roleDirectories.controller, 'services')
	assert.deepEqual(policy.files.testSuffixes, ['spec'])
	assert.equal(policy.generator.layers.entity, 'domain')
	assert.equal(policy.styles.moduleExtension, 'scss')
	assert.equal(policy.performance.budgets.gzipCssBytes, 50_000)
	assert.deepEqual(policy.performance.budgets.unexpectedChunks, [])
	assert.equal(Object.isFrozen(policy.files.roleDirectories), true)
	assert.throws(() => defineArchitecture({ files: { typo: true } }), /Unknown JST policy key: files\.typo/u)
	assert.throws(() => defineArchitecture({ limits: { maxPublicApiExports: 0 } }), /positive integer/u)
	assert.throws(() => defineArchitecture({ styles: { moduleExtension: 'less' } }), /must be css or scss/u)
	assert.throws(() => defineArchitecture({ imports: { slicedLayers: ['missing'] } }), /unknown layer/u)
	assert.throws(() => defineArchitecture({ generator: { layers: { entity: 'missing' } } }), /unknown layer/u)
	assert.throws(() => defineArchitecture({ exceptions: [{ files: ['src/legacy/**'], reason: '', rules: ['jst/import-contract'] }] }), /reason is required/u)
	assert.throws(() => defineArchitecture({ exceptions: [{ expires: '2000-01-01', files: ['src/legacy/**'], reason: 'Migration', rules: ['jst/import-contract'] }] }), /exception expired/u)
})

test('turns reviewed policy exceptions into narrow ESLint overrides', async () => {
	const { default: plugin } = await import('../src/index.mjs')
	const [,, exception] = plugin.createConfig({
		exceptions: [{ files: ['src/legacy/**'], owner: 'platform', reason: 'Remove after migration', rules: ['jst/import-contract'] }],
	})
	assert.deepEqual(exception.files, ['src/legacy/**'])
	assert.deepEqual(exception.rules, { 'jst/import-contract': 'off' })
})

test('derives UI import restrictions from the configured alias and policy patterns', () => {
	const [, uiConfig] = plugin.createConfig({
		imports: { alias: '~/' },
		ui: { forbiddenImportPatterns: ['{alias}composition/**', '**/*.store'] },
	})
	const [restriction] = uiConfig.rules['no-restricted-imports']
	assert.equal(restriction, 'error')
	assert.deepEqual(uiConfig.rules['no-restricted-imports'][1].patterns[0].group, ['~/composition/**', '**/*.store'])
})

test('loads the shared project policy from jst.config.ts', async () => {
	const root = await mkdtemp(resolve(tmpdir(), 'jst-policy-'))
	try {
		await writeFile(resolve(root, 'jst.config.ts'), "export default { styles: { moduleExtension: 'scss' } } as const\n")
		const policy = await loadPolicy(root)
		assert.equal(policy.styles.moduleExtension, 'scss')
	}
	finally {
		await rm(root, { force: true, recursive: true })
	}
})

test('publishes an exact top-level schema for every policy section', () => {
	assert.equal(policySchema.additionalProperties, false)
	assert.deepEqual(Object.keys(policySchema.properties).sort(), Object.keys(plugin.defaultPolicy).sort())
	for (const definition of Object.values(policySchema.$defs)) {
		if (definition.type === 'object' && definition.properties) {
			assert.equal(definition.additionalProperties, false)
		}
	}
})

test('rejects adversarial policy shapes without mutating defaults', () => {
	const invalidValues = [null, [], '', 0, false, new Date(0)]
	for (const value of invalidValues) {
		assert.throws(() => defineArchitecture(value), /policy must be an object/u)
	}
	for (let index = 0; index < 256; index += 1) {
		const key = `unknown_${index.toString(36)}`
		assert.throws(() => defineArchitecture({ [key]: index }), new RegExp(`Unknown JST policy key: ${key}`, 'u'))
	}
	assert.equal(plugin.defaultPolicy.limits.maxPublicApiExports, 30)
})

test('preserves valid public API budgets and freezes every result', () => {
	for (let index = 1; index <= 256; index += 1) {
		const policy = defineArchitecture({ limits: { maxPublicApiExports: index } })
		assert.equal(policy.limits.maxPublicApiExports, index)
		assert.equal(Object.isFrozen(policy), true)
		assert.equal(Object.isFrozen(policy.limits), true)
	}
})
