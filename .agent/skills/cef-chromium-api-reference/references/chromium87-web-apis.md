# Chromium 87 Web API Compatibility

Electrobun ships Chromium 87.0.4280.141 (released Jan 2021). This reference covers what web platform APIs are available and notably absent.

## Supported Web APIs (available in Chromium 87)

### Core JavaScript
- ES2020 fully supported (optional chaining `?.`, nullish coalescing `??`, `BigInt`, `Promise.allSettled`, `globalThis`, dynamic `import()`)
- ES2021 partial (`String.prototype.replaceAll`, `Promise.any`, `WeakRef`, `FinalizationRegistry`, logical assignment `&&=` `||=` `??=`)
- **NOT available**: ES2022+ features (top-level await, `.at()`, `Object.hasOwn()`, `structuredClone`, etc.)

### DOM & Layout
- CSS Grid (full support)
- CSS Custom Properties (CSS Variables)
- CSS `aspect-ratio` — **NOT available** (added in Chrome 88)
- CSS `contain` property
- CSS `:is()` and `:where()` selectors
- CSS `gap` for flexbox — **NOT available** (Chrome 84 for row-gap, but full flexbox gap in Chrome 88+)
- `ResizeObserver`
- `IntersectionObserver` (v1)
- `MutationObserver`
- `requestAnimationFrame`
- `requestIdleCallback`

### Networking & Fetch
- `fetch()` API
- `AbortController` / `AbortSignal`
- `Headers`, `Request`, `Response`
- Streams API (basic `ReadableStream`)
- `WebSocket`
- **NOT available**: `fetch()` streaming request bodies (Chrome 105+)

### Storage
- `localStorage` / `sessionStorage`
- `IndexedDB`
- `Cache API` (Service Workers)
- **NOT available**: `StorageManager.estimate()` quota details may be limited
- **NOT available**: Storage Buckets API (Chrome 122+)

### Media
- `<video>` and `<audio>` with common codecs
- Media Source Extensions (MSE)
- Web Audio API
- `MediaRecorder` API
- `getUserMedia` (camera/microphone)
- `getDisplayMedia` (screen capture)
- **NOT available**: WebCodecs (Chrome 94+)

### Graphics
- `<canvas>` 2D
- WebGL 1.0 and 2.0
- **NOT available**: WebGPU (Chrome 113+)
- **NOT available**: OffscreenCanvas in workers fully (partial support)

### Workers
- Web Workers
- Service Workers
- Shared Workers
- **NOT available**: Module workers (`type: "module"`) — Chrome 80+ but may have issues

### Other APIs
- `Clipboard API` (read/write)
- `Notification API`
- `Geolocation API`
- `Pointer Events`
- `Touch Events`
- `Gamepad API`
- `Web Animations API`
- `Performance Observer`
- `Broadcast Channel`
- `TextEncoder`/`TextDecoder`
- `URL` / `URLSearchParams`
- `Crypto.getRandomValues()`
- `SubtleCrypto` (Web Crypto API)

## Notable Missing APIs (added after Chrome 87)

| API | Chrome Version | Notes |
|-----|---------------|-------|
| `aspect-ratio` CSS | 88 | Use padding-top hack instead |
| `CSS.supports()` for `aspect-ratio` | 88 | |
| Top-level await | 89 | Wrap in async IIFE |
| `replaceChildren()` | 86 | Available! |
| `structuredClone()` | 98 | Use `JSON.parse(JSON.stringify())` or manual alternatives |
| `Array.prototype.at()` | 92 | Use bracket notation with length calc |
| `Object.hasOwn()` | 93 | Use `Object.prototype.hasOwnProperty.call()` |
| `crypto.randomUUID()` | 92 | Use `crypto.getRandomValues()` + manual UUID |
| `AbortSignal.timeout()` | 103 | Implement manually |
| Container Queries | 105 | Not available |
| `@layer` (CSS Cascade Layers) | 99 | Not available |
| View Transitions API | 111 | Not available |
| Popover API | 114 | Not available |
| WebGPU | 113 | Not available (but Electrobun has separate wgpu support) |
| `dialog` element | 37 | Available! |
| `<details>` / `<summary>` | Full support | Available |
| CSS `color-mix()` | 111 | Not available |
| CSS Nesting | 112 | Not available, use preprocessors |
| `Intl.Segmenter` | 87 | Available! |
| `Intl.DisplayNames` | 81 | Available |
| `RegExp` match indices (`/d` flag) | 90 | Not available |
| Import assertions / Import attributes | 91+ | Not available |

## Chrome 87 Specific Features (newly added in this version)

These features were specifically added in Chrome 87:

- **Camera pan/tilt/zoom** — `MediaStreamTrack` constraints for PTZ
- **Range requests in Service Workers** — better media streaming
- **`Intl.Segmenter`** — text segmentation for CJK etc.
- **Flow-relative shorthand properties** — `margin-inline`, `padding-block`, etc.
- **`transferable` option for `postMessage()`** — transfer `ReadableStream` etc.
- **Cross-origin isolation** — `Cross-Origin-Embedder-Policy`, `Cross-Origin-Opener-Policy` headers
- **Cookie Store API** (behind flag)

## User-Agent String

```
Mozilla/5.0 (...) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36
```

## Polyfill Recommendations

If your app requires newer APIs:

- **`structuredClone`**: Use the `@ungap/structured-clone` polyfill
- **`Array.at()`**: Use `core-js` or a simple shim
- **`Object.hasOwn()`**: `const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key)`
- **CSS `aspect-ratio`**: Use the classic padding-top percentage trick
- **Top-level await**: Wrap in `(async () => { ... })()`

## Checking Compatibility

For any web API, check:
1. https://caniuse.com — filter by Chrome 87
2. https://developer.mozilla.org/en-US/docs/Web/API — check browser compat tables
3. Chrome Platform Status: https://chromestatus.com/features — filter by milestone 87
