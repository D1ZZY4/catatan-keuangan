---
name: Vite plugin-react version compatibility
description: @vitejs/plugin-react major version must match Vite major version
---

**Rule:** @vitejs/plugin-react version must be compatible with the Vite version:
- v4.x → Vite 4/5
- v5.x → Vite 5/6
- v6.x → Vite 7+

**Why:** v6 imports `vite/internal` which is only exported in Vite 7+. Running v6 with Vite 6 crashes at startup with `ERR_PACKAGE_PATH_NOT_EXPORTED`.

**How to apply:** If the dev server crashes on startup with that error, run `bun add -d @vitejs/plugin-react@5` to downgrade to the v5 line.
