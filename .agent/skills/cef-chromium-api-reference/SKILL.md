---
name: cef-chromium-api-reference
description: 'CEF and Chromium v87 API reference for Electrobun native code. Use when: working with CEF handlers, browser creation, V8 bindings, scheme handlers, response filters, process messages, OSR rendering, or any CefXxx class in the native wrapper code. Also use for Chromium 87 web API compatibility checks.'
---

# CEF & Chromium v87 API Reference

Quick-access reference for the Chromium Embedded Framework (CEF 87.1.14) and Chromium 87.0.4280.141 APIs used in Electrobun's native wrappers.

## When to Use

- Implementing or modifying CEF handler overrides in `package/src/native/`
- Adding new browser features (context menus, downloads, dialogs, keyboard shortcuts)
- Working with V8 bridge injection or IPC between render and browser processes
- Creating or modifying custom scheme handlers (`views://`)
- Checking which web platform APIs are available in Chromium 87
- Debugging CEF lifecycle, navigation, or rendering issues
- Working with off-screen rendering (OSR) for transparent windows

## Version Info

| Component | Version |
|-----------|---------|
| CEF | 87.1.14+ga29e9a3 |
| Chromium | 87.0.4280.141 |
| Vendor path | `package/vendors/cef/` |
| Headers | `package/vendors/cef/include/` |

Version constants are in `package/build.ts` (`CEF_VERSION`, `CHROMIUM_VERSION`).

## Electrobun CEF Architecture

Electrobun uses CEF in a **multi-process** model:

1. **Browser process** — runs `CefInitialize()` + message loop, hosts native UI
2. **Render/GPU sub-processes** — spawned via `process_helper` executable, run `CefExecuteProcess()`

Key integration points:
- `ElectrobunApp` (subclasses `CefApp`) — app lifecycle, chromium flags, scheme registration
- `ElectrobunClient` / `ElectrobunWebViewHandler` (subclasses `CefClient`) — all browser event handlers
- `ElectrobunResponseFilter` — injects preload scripts via response filtering
- `ViewsSchemeHandlerFactory` / `ElectrobunSchemeHandlerFactory` — serves `views://` scheme from ASAR or filesystem
- `V8MessageHandler` / `V8Handler` — creates `window.__electrobunBunBridge` etc. in render process

## Procedure

### 1. Identify the API Category

Determine which CEF subsystem your task involves:

- **App lifecycle** → See [CEF App & Lifecycle Reference](./references/app-lifecycle.md)
- **Browser & client handlers** → See [CEF Client Handlers Reference](./references/client-handlers.md)
- **V8 & IPC** → See [CEF V8 & Process Messages Reference](./references/v8-ipc.md)
- **Scheme handlers & response filters** → See [CEF Scheme & Response Filter Reference](./references/scheme-handlers.md)
- **Chromium 87 web APIs** → See [Chromium 87 Web API Compatibility](./references/chromium87-web-apis.md)

### 2. Find the Source File

| Platform | Main wrapper | Process helper |
|----------|-------------|----------------|
| macOS | `package/src/native/macos/nativeWrapper.mm` | `package/src/native/macos/cef_process_helper_mac.cc` |
| Linux | `package/src/native/linux/nativeWrapper.cpp` | `package/src/native/linux/cef_process_helper_linux.cpp` |
| Windows | `package/src/native/win/nativeWrapper.cpp` | `package/src/native/win/cef_process_helper_win.cpp` |
| Shared | `package/src/native/shared/cef_response_filter.h` | — |

### 3. Check the CEF Header

Browse `package/vendors/cef/include/cef_*.h` for the exact C++ API signature. Key headers:

| Header | Provides |
|--------|----------|
| `cef_app.h` | `CefApp`, `CefBrowserProcessHandler`, `CefRenderProcessHandler` |
| `cef_client.h` | `CefClient` base class |
| `cef_browser.h` | `CefBrowser`, `CefBrowserHost` |
| `cef_life_span_handler.h` | `OnAfterCreated`, `OnBeforeClose`, `OnBeforePopup` |
| `cef_load_handler.h` | `OnLoadStart`, `OnLoadEnd`, `OnLoadError` |
| `cef_request_handler.h` | `OnBeforeBrowse`, `GetResourceRequestHandler` |
| `cef_resource_request_handler.h` | `GetResourceResponseFilter` |
| `cef_context_menu_handler.h` | `OnBeforeContextMenu`, `OnContextMenuCommand` |
| `cef_keyboard_handler.h` | `OnPreKeyEvent`, `OnKeyEvent` |
| `cef_dialog_handler.h` | `OnFileDialog` |
| `cef_download_handler.h` | `OnBeforeDownload`, `OnDownloadUpdated` |
| `cef_render_handler.h` | `GetViewRect`, `OnPaint` (OSR) |
| `cef_display_handler.h` | `OnTitleChange` |
| `cef_v8.h` | `CefV8Value`, `CefV8Handler`, `CefV8Context` |
| `cef_process_message.h` | `CefProcessMessage` IPC |
| `cef_scheme.h` | `CefSchemeHandlerFactory`, `CefSchemeRegistrar` |
| `cef_resource_handler.h` | `CefResourceHandler` |
| `cef_response_filter.h` | `CefResponseFilter` |
| `cef_request_context.h` | `CefRequestContext` partition isolation |
| `cef_command_line.h` | `CefCommandLine` for chromium flags |
| `cef_task.h` | `CefTask`, `CefPostTask`, `TID_UI` |

### 4. Consult Upstream Docs

- **CEF API docs (v87)**: https://cef-builds.spotifycdn.com/docs/87.1.14+ga29e9a3/index.html
- **CEF C++ API index**: https://cef-builds.spotifycdn.com/docs/87.1.14+ga29e9a3/classCefApp.html (replace class name)
- **Chromium 87 release notes**: https://developer.chrome.com/blog/new-in-chrome-87/
- **CEF Wiki (general)**: https://bitbucket.org/chromiumembedded/cef/wiki/Home
- **CEF forum**: https://magpcss.org/ceforum/

### 5. Implement Following Electrobun Patterns

When adding new handler methods, follow these conventions:

- Subclass the appropriate `CefXxxHandler` and add it to `ElectrobunClient` / `ElectrobunWebViewHandler`
- Return `this` from the corresponding `GetXxxHandler()` method on `CefClient`
- Use `IMPLEMENT_REFCOUNTING()` macro on all CefBase-derived classes
- Forward events to Bun via the existing callback function pointers (e.g., `webview_event_handler_`)
- Implement for all three platforms (macOS `.mm`, Linux `.cpp`, Windows `.cpp`)
- Use the shared header in `package/src/native/shared/` for cross-platform logic

## Example Prompts

- "How do I add a new CefFocusHandler to Electrobun?"
- "What CEF methods handle navigation events?"
- "Is the Intersection Observer API available in Chromium 87?"
- "How does the V8 bridge injection work across processes?"
- "Show me the CefResourceHandler interface for custom scheme serving"
