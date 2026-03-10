# CEF Client Handlers Reference (v87)

## CefClient — Handler Dispatch

The main client class dispatches to specific handlers via `GetXxxHandler()` methods:

```cpp
class ElectrobunClient : public CefClient,
                         public CefLoadHandler,
                         public CefRequestHandler,
                         public CefContextMenuHandler,
                         public CefKeyboardHandler,
                         public CefResourceRequestHandler,
                         public CefLifeSpanHandler,
                         public CefDialogHandler,
                         public CefDownloadHandler,
                         public CefRenderHandler {
    // Return `this` for each handler interface implemented:
    CefRefPtr<CefDisplayHandler> GetDisplayHandler() override { return this; }
    CefRefPtr<CefLifeSpanHandler> GetLifeSpanHandler() override { return this; }
    CefRefPtr<CefLoadHandler> GetLoadHandler() override { return this; }
    CefRefPtr<CefRequestHandler> GetRequestHandler() override { return this; }
    CefRefPtr<CefContextMenuHandler> GetContextMenuHandler() override { return this; }
    CefRefPtr<CefKeyboardHandler> GetKeyboardHandler() override { return this; }
    CefRefPtr<CefDialogHandler> GetDialogHandler() override { return this; }
    CefRefPtr<CefDownloadHandler> GetDownloadHandler() override { return this; }
    CefRefPtr<CefRenderHandler> GetRenderHandler() override { return this; }

    // IPC from render process
    bool OnProcessMessageReceived(CefRefPtr<CefBrowser> browser,
                                  CefRefPtr<CefFrame> frame,
                                  CefProcessId source_process,
                                  CefRefPtr<CefProcessMessage> message) override;
};
```

## CefLifeSpanHandler

```cpp
// Called after a new browser is created.
void OnAfterCreated(CefRefPtr<CefBrowser> browser) override;

// Called when a browser window close is requested. Return true to cancel.
bool DoClose(CefRefPtr<CefBrowser> browser) override;

// Called after a browser has been destroyed.
void OnBeforeClose(CefRefPtr<CefBrowser> browser) override;

// Called before a popup window is created. Return true to cancel popup.
bool OnBeforePopup(CefRefPtr<CefBrowser> browser,
                   CefRefPtr<CefFrame> frame,
                   const CefString& target_url,
                   const CefString& target_frame_name,
                   WindowOpenDisposition target_disposition,
                   bool user_gesture,
                   const CefPopupFeatures& popupFeatures,
                   CefWindowInfo& windowInfo,
                   CefRefPtr<CefClient>& client,
                   CefBrowserSettings& settings,
                   CefRefPtr<CefDictionaryValue>& extra_info,
                   bool* no_javascript_access) override;
```

## CefLoadHandler

```cpp
// Called when loading state changes (start/stop/can go back/forward).
void OnLoadingStateChange(CefRefPtr<CefBrowser> browser,
                          bool isLoading,
                          bool canGoBack,
                          bool canGoForward) override;

// Called when a frame starts loading.
void OnLoadStart(CefRefPtr<CefBrowser> browser,
                 CefRefPtr<CefFrame> frame,
                 TransitionType transition_type) override;

// Called when a frame finishes loading.
void OnLoadEnd(CefRefPtr<CefBrowser> browser,
               CefRefPtr<CefFrame> frame,
               int httpStatusCode) override;

// Called when a frame fails to load.
void OnLoadError(CefRefPtr<CefBrowser> browser,
                 CefRefPtr<CefFrame> frame,
                 ErrorCode errorCode,
                 const CefString& errorText,
                 const CefString& failedUrl) override;
```

## CefDisplayHandler

```cpp
// Called when the page title changes.
void OnTitleChange(CefRefPtr<CefBrowser> browser,
                   const CefString& title) override;
```

## CefRequestHandler

```cpp
// Called before browser navigation. Return true to cancel.
bool OnBeforeBrowse(CefRefPtr<CefBrowser> browser,
                    CefRefPtr<CefFrame> frame,
                    CefRefPtr<CefRequest> request,
                    bool user_gesture,
                    bool is_redirect) override;

// Return a handler for resource requests (for response filtering, etc.).
CefRefPtr<CefResourceRequestHandler> GetResourceRequestHandler(
    CefRefPtr<CefBrowser> browser,
    CefRefPtr<CefFrame> frame,
    CefRefPtr<CefRequest> request,
    bool is_navigation,
    bool is_download,
    const CefString& request_initiator,
    bool& disable_default_handling) override;
```

## CefResourceRequestHandler

```cpp
// Return a response filter for modifying response data (preload injection).
CefRefPtr<CefResponseFilter> GetResourceResponseFilter(
    CefRefPtr<CefBrowser> browser,
    CefRefPtr<CefFrame> frame,
    CefRefPtr<CefRequest> request,
    CefRefPtr<CefResponse> response) override;
```

## CefContextMenuHandler

```cpp
// Called before the context menu is displayed. Modify the menu model here.
void OnBeforeContextMenu(CefRefPtr<CefBrowser> browser,
                         CefRefPtr<CefFrame> frame,
                         CefRefPtr<CefContextMenuParams> params,
                         CefRefPtr<CefMenuModel> model) override;

// Called when a context menu command is selected.
bool OnContextMenuCommand(CefRefPtr<CefBrowser> browser,
                          CefRefPtr<CefFrame> frame,
                          CefRefPtr<CefContextMenuParams> params,
                          int command_id,
                          EventFlags event_flags) override;

// Called to run a custom context menu (Linux uses this for GTK menus).
bool RunContextMenu(CefRefPtr<CefBrowser> browser,
                    CefRefPtr<CefFrame> frame,
                    CefRefPtr<CefContextMenuParams> params,
                    CefRefPtr<CefMenuModel> model,
                    CefRefPtr<CefRunContextMenuCallback> callback) override;
```

## CefKeyboardHandler

```cpp
// Called before a key event is sent to the renderer.
bool OnPreKeyEvent(CefRefPtr<CefBrowser> browser,
                   const CefKeyEvent& event,
                   CefEventHandle os_event,
                   bool* is_keyboard_shortcut) override;

// Called after the renderer processes a key event.
bool OnKeyEvent(CefRefPtr<CefBrowser> browser,
                const CefKeyEvent& event,
                CefEventHandle os_event) override;
```

### CefKeyEvent Fields

```cpp
event.type              // KEYEVENT_RAWKEYDOWN, KEYEVENT_KEYUP, KEYEVENT_CHAR, KEYEVENT_KEYDOWN
event.native_key_code   // Platform-specific key code
event.windows_key_code  // Windows virtual key code
event.modifiers         // EVENTFLAG_SHIFT_DOWN, EVENTFLAG_CONTROL_DOWN,
                        // EVENTFLAG_ALT_DOWN, EVENTFLAG_COMMAND_DOWN
event.character         // Character value
event.unmodified_character // Unmodified character value
```

## CefDialogHandler

```cpp
// Called to show a file dialog (open, save, etc.).
bool OnFileDialog(CefRefPtr<CefBrowser> browser,
                  FileDialogMode mode,
                  const CefString& title,
                  const CefString& default_file_path,
                  const std::vector<CefString>& accept_filters,
                  int selected_accept_filter,
                  CefRefPtr<CefFileDialogCallback> callback) override;
```

## CefDownloadHandler

```cpp
// Called before a download begins.
void OnBeforeDownload(CefRefPtr<CefBrowser> browser,
                      CefRefPtr<CefDownloadItem> download_item,
                      const CefString& suggested_name,
                      CefRefPtr<CefBeforeDownloadCallback> callback) override;

// Called when download status is updated.
void OnDownloadUpdated(CefRefPtr<CefBrowser> browser,
                       CefRefPtr<CefDownloadItem> download_item,
                       CefRefPtr<CefDownloadItemCallback> callback) override;
```

## CefRenderHandler (Off-Screen Rendering)

```cpp
// Return the view rectangle for this browser.
void GetViewRect(CefRefPtr<CefBrowser> browser, CefRect& rect) override;

// Called when new paint data is available.
void OnPaint(CefRefPtr<CefBrowser> browser,
             PaintElementType type,
             const RectList& dirtyRects,
             const void* buffer,
             int width,
             int height) override;
```

## Browser Creation

```cpp
// Synchronous browser creation (macOS, Windows)
CefRefPtr<CefBrowser> browser = CefBrowserHost::CreateBrowserSync(
    windowInfo,       // CefWindowInfo
    client,           // CefRefPtr<CefClient>
    url,              // CefString
    browserSettings,  // CefBrowserSettings
    extra_info,       // CefRefPtr<CefDictionaryValue> - passed to renderer
    request_context   // CefRefPtr<CefRequestContext>
);

// Asynchronous browser creation (Linux)
CefBrowserHost::CreateBrowser(
    windowInfo, client, url, browserSettings, extra_info, request_context
);
```

### CefWindowInfo Setup

```cpp
CefWindowInfo window_info;

// Embed in native window
window_info.SetAsChild(parent_window_handle, CefRect(x, y, width, height));

// Off-screen rendering (transparent windows)
window_info.SetAsWindowless(parent_window_handle);
```

### CefBrowserHost Methods

```cpp
host->ShowDevTools(windowInfo, client, browserSettings, inspectPoint);
host->CloseBrowser(force_close);
host->WasResized();

// OSR input forwarding
host->SendMouseClickEvent(mouseEvent, buttonType, mouseUp, clickCount);
host->SendMouseMoveEvent(mouseEvent, mouseLeave);
host->SendMouseWheelEvent(mouseEvent, deltaX, deltaY);
host->SendKeyEvent(keyEvent);
host->SendFocusEvent(setFocus);
```

## Request Context (Partition Isolation)

```cpp
CefRequestContextSettings contextSettings;
CefString(&contextSettings.cache_path) = partition_cache_path;

CefRefPtr<CefRequestContext> context = CefRequestContext::CreateContext(
    contextSettings,
    nullptr  // CefRefPtr<CefRequestContextHandler>
);
```

## Platform Differences

| Feature | macOS | Linux | Windows |
|---------|-------|-------|---------|
| Client class | `ElectrobunWebViewHandler` | `ElectrobunClient` | `ElectrobunCefClient` |
| Handler pattern | Monolithic | Monolithic | Separate handler classes |
| Browser creation | `CreateBrowserSync` | `CreateBrowser` (async) | `CreateBrowserSync` |
| Message loop | `CefRunMessageLoop` | `CefDoMessageLoopWork` | `CefDoMessageLoopWork` |
| OSR input | Full (mouse, key, wheel) | Mouse clicks only | (basic) |
