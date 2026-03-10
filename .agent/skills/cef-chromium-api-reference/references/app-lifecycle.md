# CEF App & Lifecycle Reference (v87)

## CefApp — Application Entry Point

Subclassed as `ElectrobunApp` (browser process) and `HelperApp` (sub-processes).

### Key Overrides

```cpp
// Called before CEF command line is processed. Use to set chromium flags.
void OnBeforeCommandLineProcessing(const CefString& process_type,
                                    CefRefPtr<CefCommandLine> command_line) override;

// Called to register custom schemes (e.g., views://).
// MUST be implemented in BOTH main app and helper app.
void OnRegisterCustomSchemes(CefRawPtr<CefSchemeRegistrar> registrar) override;

// Return browser process handler (return `this` in ElectrobunApp).
CefRefPtr<CefBrowserProcessHandler> GetBrowserProcessHandler() override;

// Return render process handler (return `this` in helpers, nullptr in main for multi-process).
CefRefPtr<CefRenderProcessHandler> GetRenderProcessHandler() override;
```

### CefBrowserProcessHandler Overrides

```cpp
// Called after CEF context is initialized. Register scheme handler factories here.
void OnContextInitialized() override;

// Called when external message pump work is scheduled (Windows).
void OnScheduleMessagePumpWork(int64_t delay_ms) override;
```

### CefRenderProcessHandler Overrides

```cpp
// Called when a browser is created in the render process.
void OnBrowserCreated(CefRefPtr<CefBrowser> browser,
                      CefRefPtr<CefDictionaryValue> extra_info) override;

// Called when a browser is destroyed in the render process.
void OnBrowserDestroyed(CefRefPtr<CefBrowser> browser) override;

// Called when a V8 context is created for a frame. Used to inject JS bridges.
void OnContextCreated(CefRefPtr<CefBrowser> browser,
                      CefRefPtr<CefFrame> frame,
                      CefRefPtr<CefV8Context> context) override;
```

## Initialization Functions

```cpp
// Initialize CEF. Call once in browser process.
// Returns true on success.
bool CefInitialize(const CefMainArgs& args,
                   const CefSettings& settings,
                   CefRefPtr<CefApp> application,
                   void* windows_sandbox_info);

// Execute a sub-process. Call in helper executable.
// Returns -1 if not a sub-process, otherwise the process exit code.
int CefExecuteProcess(const CefMainArgs& args,
                      CefRefPtr<CefApp> application,
                      void* windows_sandbox_info);

// Run the CEF message loop (macOS). Blocks until CefQuitMessageLoop().
void CefRunMessageLoop();

// Perform a single iteration of message loop work (Linux, Windows).
// Call from your native event loop.
void CefDoMessageLoopWork();

// Quit the CEF message loop.
void CefQuitMessageLoop();

// Shut down CEF. Call on application exit.
void CefShutdown();
```

## CefSettings (used fields)

```cpp
CefSettings settings;
settings.no_sandbox = true;                        // Disable sandbox
settings.multi_threaded_message_loop = false;       // Single-threaded (external pump)
settings.windowless_rendering_enabled = true;       // Enable OSR support
settings.log_severity = LOGSEVERITY_VERBOSE;        // Logging level
CefString(&settings.browser_subprocess_path) = ...; // Path to process_helper
CefString(&settings.root_cache_path) = ...;         // Root cache directory
CefString(&settings.cache_path) = ...;              // Browser cache directory
```

## CefMainArgs

```cpp
// macOS / Linux
CefMainArgs main_args(argc, argv);

// Windows
CefMainArgs main_args(hInstance);
```

## Chromium Flags Pattern (Electrobun)

Electrobun applies flags via `applyDefaultFlags()` and `applyChromiumFlags()` in `OnBeforeCommandLineProcessing()`:

```cpp
command_line->AppendSwitch("flag-name");
command_line->AppendSwitchWithValue("flag-name", "value");
```

User-configurable via `chromiumFlags` in `electrobun.config.ts`.

## Platform-Specific Helpers

| Platform | Utility | Purpose |
|----------|---------|---------|
| macOS | `CefScopedSendingEvent` | Scope NSApp events |
| macOS | `CefScopedLibraryLoader` | Load CEF framework |
| macOS | `CefScopedSandboxContext` | Sandbox context |
| macOS | `CefAppProtocol` | NSApplication protocol |
| Linux | `cef_loader.h/cpp` | `dlopen`-based CEF loading |

## Electrobun Source Files

- **macOS app**: `package/src/native/macos/nativeWrapper.mm` (ElectrobunApp class)
- **Linux app**: `package/src/native/linux/nativeWrapper.cpp` (ElectrobunApp class)
- **Windows app**: `package/src/native/win/nativeWrapper.cpp` (ElectrobunCefApp class)
- **macOS helper**: `package/src/native/macos/cef_process_helper_mac.cc`
- **Linux helper**: `package/src/native/linux/cef_process_helper_linux.cpp`
- **Windows helper**: `package/src/native/win/cef_process_helper_win.cpp`
