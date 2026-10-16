# `jst/disable-directive`

Rejects inline architecture suppressions. Generic suppression explanations belong to `@jst-stack/eslint-plugin-quality`.

```ts
// valid
// eslint-disable-next-line no-console -- required CLI output
console.log(message)

// invalid: use a reviewed jst.config.ts exception
// eslint-disable-next-line jst/import-contract
```

Project exceptions require `files`, `rules`, and `reason`; `owner` and `expires` are optional.
