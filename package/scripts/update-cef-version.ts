#!/usr/bin/env bun

/**
 * Checks Spotify CDN for the latest stable CEF version and compares it
 * with the version in src/shared/cef-version.ts.
 *
 * When a newer version exists:
 *   - Overwrites src/shared/cef-version.ts with the new version pair
 *   - Sets has_update=true in $GITHUB_OUTPUT
 *
 * Always outputs version info to $GITHUB_OUTPUT and a human-readable
 * summary to $GITHUB_STEP_SUMMARY.
 */

import { CEF_VERSION, CHROMIUM_VERSION } from "../src/shared/cef-version";
import { appendFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const CEF_INDEX_URL =
	"https://cef-builds.spotifycdn.com/index.json";

interface StableVersion {
	cef_version: string;
	chromium_version: string;
}

async function getLatestStableCEFVersion(): Promise<StableVersion> {
	const response = await fetch(CEF_INDEX_URL);
	if (!response.ok) {
		throw new Error(
			`Failed to fetch CEF builds index: HTTP ${response.status}`,
		);
	}

	const data = (await response.json()) as {
		linux64: {
			versions: Array<{
				cef_version: string;
				chromium_version: string;
				channel: string;
			}>;
		};
	};

	const versions = data.linux64?.versions;
	if (!versions || versions.length === 0) {
		throw new Error("No versions found in CEF builds index");
	}

	const stable = versions.find((v) => v.channel === "stable");
	if (!stable) {
		throw new Error("No stable CEF version found in builds index");
	}

	// The CDN's cef_version includes "+chromium-..." suffix, but cef-version.ts
	// stores just the CEF part (e.g. "144.0.11+ge135be2").
	const cefOnly = stable.cef_version.replace(/\+chromium-.*$/, "");

	return {
		cef_version: cefOnly,
		chromium_version: stable.chromium_version,
	};
}

function setOutput(key: string, value: string) {
	const outputFile = process.env.GITHUB_OUTPUT;
	if (outputFile) {
		appendFileSync(outputFile, `${key}=${value}\n`);
	}
}

function writeSummary(markdown: string) {
	const summaryFile = process.env.GITHUB_STEP_SUMMARY;
	if (summaryFile) {
		appendFileSync(summaryFile, markdown + "\n");
	}
}

async function main() {
	// CEF version is intentionally pinned to 87.x for PepperFlash plugin support.
	// Auto-updating is disabled. Do not change without removing PepperFlash dependency.
	console.log("CEF version is pinned to 87.x for PepperFlash support. Auto-update disabled.");
	console.log(`Pinned:  CEF ${CEF_VERSION}  Chromium ${CHROMIUM_VERSION}`);
	setOutput("current_cef_version", CEF_VERSION);
	setOutput("current_chromium_version", CHROMIUM_VERSION);
	setOutput("has_update", "false");
	writeSummary([
		"## CEF Compatibility Check",
		"",
		`CEF version is **pinned** to \`${CEF_VERSION}\` (Chromium \`${CHROMIUM_VERSION}\`) for PepperFlash support.`,
		"Auto-update is disabled.",
	].join("\n"));
}

main().catch((err) => {
	console.error("Error checking CEF version:", err);
	process.exit(1);
});
