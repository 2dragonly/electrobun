// Default CEF version shipped with this Electrobun release.
// All platforms use the same version. Update this single pair when bumping CEF.
// NOTE: CEF 87.x / Chromium 87 is intentionally pinned for PepperFlash plugin support.
// This version only supports x64 architecture.
export const CEF_VERSION = `87.1.14+ga29e9a3`;
export const CHROMIUM_VERSION = `87.0.4280.141`;
export const DEFAULT_CEF_VERSION_STRING = `${CEF_VERSION}+chromium-${CHROMIUM_VERSION}`;
