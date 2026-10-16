# @jst-stack/eslint-plugin-architecture

Policy-driven architecture boundaries for JST and modular TypeScript applications.

This package enforces dependency direction, slice isolation, public APIs, file roles, effect boundaries, DI ownership, workspace contracts, style ownership, and build budgets. It does not own generic TypeScript or React code-quality rules.

## Install

```bash
npm install --save-dev eslint @jst-stack/eslint-plugin-architecture
```

```js
import architecture, { defineArchitecture } from '@jst-stack/eslint-plugin-architecture'

const policy = defineArchitecture({
	styles: { moduleExtension: 'scss' },
})

export default [
	...architecture.createConfig(policy),
]
```

Run project-wide contracts separately:

```bash
npx jst-architecture architecture styles budgets
```

Use [`@jst-stack/eslint-plugin-quality`](https://github.com/jst-stack/eslint-plugin-quality) for architecture-independent TypeScript and React quality rules. Existing JST projects may continue using [`@jst-stack/eslint-plugin`](https://github.com/jst-stack/eslint-plugin) during migration.

## Policy

The default policy models `app → pages → modules → widgets → features → entities → shared`. Every convention is overrideable through one runtime-validated object. Unknown keys, invalid layers, expired exceptions, and inconsistent combinations fail before linting starts.

The package never decides whether a product should adopt JST. Once a project supplies a policy, it enforces that policy consistently in editors and CI.
