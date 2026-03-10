import { platform } from "os";

export type SupportedOS = "macos" | "win" | "linux";
export type SupportedArch = "arm64" | "x64";

// Cache platform() result to avoid multiple system calls
const platformName = platform();

// Determine OS once
export const OS: SupportedOS = (() => {
	switch (platformName) {
		case "win32":
			return "win";
		case "darwin":
			return "macos";
		case "linux":
			return "linux";
		default:
			throw new Error(`Unsupported platform: ${platformName}`);
	}
})();

// Determine ARCH once.
// CEF 87.x (pinned for PepperFlash) only ships x64 binaries, so the entire
// build pipeline targets x64 regardless of the host architecture.  On Apple
// Silicon the native toolchain cross-compiles via `-arch x86_64` and the
// resulting app runs under Rosetta 2.
export const ARCH: SupportedArch = "x64";

// Export functions for backwards compatibility if needed
export function getPlatformOS(): SupportedOS {
	return OS;
}

export function getPlatformArch(): SupportedArch {
	return ARCH;
}
