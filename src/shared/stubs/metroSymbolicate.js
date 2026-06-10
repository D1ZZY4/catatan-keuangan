// Stub for @expo/metro-runtime/symbolicate — not available in this package version.
// Returns minimal no-op implementations so error boundaries don't crash.
function parseErrorStack(stack) {
  return [];
}
class LogBoxLog {
  constructor() {
    this.symbolicated = { stack: null };
  }
  symbolicate(type, cb) {
    cb && cb();
  }
}
module.exports = { parseErrorStack, LogBoxLog };
