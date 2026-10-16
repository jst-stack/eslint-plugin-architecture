# `jst/ui-contract`

Keeps `*.component.tsx` modules independent from state managers and orchestration dependencies.

```tsx
// valid
export function OrderList({ items, onSelect }: OrderListProps) {
  return items.map(item => <button onClick={() => onSelect(item.id)}>{item.name}</button>)
}

// invalid: observe state in an entry and pass plain props
import { atom } from '@reatom/core'
```

Configure state packages and forbidden import patterns under `ui` in `jst.config.ts`. Generic component maintainability belongs to `@jst-stack/eslint-plugin-quality`.
