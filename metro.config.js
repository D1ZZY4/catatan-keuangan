const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  '@': './src',
};

// Ensure @babel/runtime resolves to the root installation (fixes nested resolution issues)
config.resolver.extraNodeModules = {
  '@babel/runtime': path.resolve(__dirname, 'node_modules/@babel/runtime'),
};

// WatermelonDB: exclude Node.js native modules that aren't available on React Native / web
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const nodeOnlyModules = ['better-sqlite3', 'react-native-quick-sqlite'];
  if (nodeOnlyModules.some(m => moduleName === m || moduleName.startsWith(m + '/'))) {
    return { type: 'empty' };
  }
  return context.resolveRequest(context, moduleName, platform);
};

// Extend Expo default sourceExts (don't replace them — merge instead)
const defaultSourceExts = config.resolver.sourceExts ?? ['js', 'jsx', 'json', 'ts', 'tsx'];
config.resolver.sourceExts = [...new Set([...defaultSourceExts, 'cjs', 'mjs'])];

module.exports = config;
