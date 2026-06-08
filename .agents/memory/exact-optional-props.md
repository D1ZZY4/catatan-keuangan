---
name: exactOptionalPropertyTypes and optional React props
description: tsconfig exactOptionalPropertyTypes=true requires conditional spread when passing T|undefined to optional props
---

**Rule:** With `exactOptionalPropertyTypes: true` in tsconfig, passing a `T | undefined` value to an optional prop typed as `prop?: T` is a type error.

**Why:** The flag distinguishes between "prop not set" and "prop set to undefined". An optional prop `prop?: T` means only `T`, not `T | undefined`.

**How to apply:** Use conditional spread:
```tsx
// BAD
<Comp editItem={maybeItem} />

// GOOD
<Comp {...(maybeItem !== undefined ? { editItem: maybeItem } : {})} />
```
This applies everywhere: form `editX` props, `category` prop on list items, etc.
