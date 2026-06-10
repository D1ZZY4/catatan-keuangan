const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);
config.resolver.sourceExts.push('mjs');

// Exclude large directories to stay within Replit's inotify watcher limit (65536).
// Without this, Metro tries to watch 100k+ files and crashes with ENOSPC/EINVAL.
config.resolver.blockList = [
  // Block iOS-specific native project files (not JS, not needed for web)
  /node_modules\/.*\.(xcodeproj|xcworkspace|xib|storyboard|xcassets|pbxproj)(\/.*)?/,
  /node_modules\/.*\.xcframework(\/.*)?/,

  // Block large binary/native SDK directories we will never bundle
  /node_modules\/jsc-android\/.*/,
  /node_modules\/hermes-engine\/.*/,
  /node_modules\/react-native-skia-apple-macos\/.*/,
  /node_modules\/ccxt\/dist\/.*/,
  /node_modules\/ccxt\/js\/.*/,

  // Source maps (waste watcher FDs)
  /node_modules\/.*\.map$/,
];

// Stub out Node.js-only native modules that cannot be bundled for web/React Native.
// These modules are only needed at runtime in Node.js environments, not in the bundle.
const emptyModule = path.join(__dirname, 'src', 'shared', 'utils', 'emptyModule.js');

// Stubs for @expo/metro-runtime subpaths that don't exist in this package version
const stubDir = path.join(__dirname, 'src', 'shared', 'stubs');
const metroRuntimeStubs = {
  '@expo/metro-runtime/error-overlay': path.join(stubDir, 'metroErrorOverlay.js'),
  '@expo/metro-runtime/symbolicate': path.join(stubDir, 'metroSymbolicate.js'),
  '@expo/metro-runtime/src/error-overlay/Data/LogContext': path.join(stubDir, 'metroLogContext.js'),
  '@expo/metro-runtime/src/error-overlay/overlay/LogBoxInspectorStackFrames': path.join(stubDir, 'metroLogBoxInspector.js'),
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Stub missing @expo/metro-runtime subpaths
  if (metroRuntimeStubs[moduleName]) {
    return { type: 'sourceFile', filePath: metroRuntimeStubs[moduleName] };
  }
  // Modules that are Node.js native binaries — stub them out for web/RN bundling
  const nativeOnlyModules = [
    'better-sqlite3',
    'node-gyp',
    'fsevents',
    'sharp',
    'canvas',
    'electron',
  ];
  if (nativeOnlyModules.some(m => moduleName === m || moduleName.startsWith(m + '/'))) {
    return { type: 'sourceFile', filePath: emptyModule };
  }
  // Fall through to default resolution
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './src/shared/theme/global.css' });
