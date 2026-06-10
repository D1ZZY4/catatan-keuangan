// Stub for @expo/metro-runtime/error-overlay — not available in this package version.
// The error overlay is a dev-only feature that wraps the root component.
// We provide a no-op pass-through so bundling succeeds.
function withErrorOverlay(Component) {
  return Component;
}
module.exports = { withErrorOverlay };
