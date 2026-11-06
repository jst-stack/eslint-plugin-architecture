# Changelog

## 0.1.2

- Require Node.js 22.18.0 or newer, where type stripping for `.ts` ESLint configs is available.
- Cover Node.js 22.18.0 and 24.15.0 against ESLint 9 and 10 in CI.

## 0.1.1

- Accept an already-normalized compatibility policy from `jst.config.ts` without re-validating quality limits against the architecture-only schema.

## 0.1.0

- Extract JST architecture, effect, DI, workspace, style ownership, and build-budget contracts.
- Remove generic TypeScript/React quality concerns from the architecture package.
- Publish the `jst-architecture` project-check CLI.
