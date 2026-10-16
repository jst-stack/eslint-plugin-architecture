import { access } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { normalizePolicy } from './policy.config.mjs'

const configFiles = ['jst.config.ts', 'jst.config.mjs', 'jst.config.js']

export async function loadPolicy(root) {
	for (const file of configFiles) {
		const path = resolve(root, file)
		try {
			await access(path)
		} catch {
			continue
		}
		const module = await import(pathToFileURL(path).href)
		return normalizeLoadedPolicy(module.default)
	}
	return normalizePolicy({})
}

function normalizeLoadedPolicy(loaded) {
	const overrides = loaded ?? {}
	// `defineConfig` from the compatibility bundle returns a deep-frozen,
	// fully-normalized policy that carries quality limits this package does
	// not own. Reuse it as-is instead of re-validating it against the
	// narrower architecture-only defaults.
	return Object.isFrozen(overrides) ? overrides : normalizePolicy(overrides)
}
