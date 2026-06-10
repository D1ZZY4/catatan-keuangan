---
name: Catat Artha Known Issues
description: Technical quirks, workarounds, and non-obvious decisions in the project
---

# Known Issues & Workarounds

## WatermelonDB Decorators (RESOLVED)
**Issue**: `import { field, Associations } from '@nozbe/watermelondb'` fails — not exported from root.
**Fix**: `import { field } from '@nozbe/watermelondb/decorators'`
**Why**: WatermelonDB separates decorators into subpath exports.
**How to apply**: Any new WatermelonDB model class.

## MMKV v3 Constructor (RESOLVED)
**Issue**: `new MMKV()` fails — TypeScript says MMKV is only a type.
**Fix**: `import { createMMKV } from 'react-native-mmkv'; const store = createMMKV({ id: '...' });`
**Why**: react-native-mmkv v3+ changed from class to factory.

## expo-file-system SDK 54 Types (RESOLVED)
**Issue**: `FileSystem.documentDirectory` and `FileSystem.writeAsStringAsync` missing from types.
**Fix**: Cast as `(FileSystem as unknown as { documentDirectory?: string }).documentDirectory`
**Why**: SDK 54 module structure differs from older versions.

## TypeScript Decorator TS1206 (RESOLVED)
**Fix**: `"experimentalDecorators": true` in tsconfig.json.

## old-code/ TS Noise (RESOLVED)
**Fix**: `"exclude": ["old-code"]` in tsconfig.json.

## Font Paths (canonical)
- `require('../node_modules/@expo-google-fonts/dm-sans/400Regular/DMSans_400Regular.ttf')`
- `require('../node_modules/@expo-google-fonts/dm-sans/500Medium/DMSans_500Medium.ttf')`
- `require('../node_modules/@expo-google-fonts/dm-sans/600SemiBold/DMSans_600SemiBold.ttf')`
- `require('../node_modules/@expo-google-fonts/instrument-serif/400Regular/InstrumentSerif_400Regular.ttf')`
- `require('../node_modules/@expo-google-fonts/jetbrains-mono/400Regular/JetBrainsMono_400Regular.ttf')`

## @shopify/react-native-skia & ccxt Postinstall
**Issue**: Blocked postinstall scripts.
**Fix**: `bun pm trust @shopify/react-native-skia ccxt` before EAS build or native runs.
