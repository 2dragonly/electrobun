# CEF V8 & Process Messages Reference (v87)

## V8 Bridge Injection

Electrobun injects JS bridge objects into the render process via `OnContextCreated()`. Three bridges are created on `window`:

| Bridge Object | IPC Message Name | Purpose |
|---------------|-----------------|---------|
| `__electrobunBunBridge` / `bunBridge` | `BunBridgeMessage` | App ↔ Bun communication |
| `__electrobunEventBridge` / `eventBridge` | `EventBridgeMessage` | Internal event system |
| `__electrobunInternalBridge` / `internalBridge` | `internalMessage` | Webview tag internal IPC |

Each bridge has a `postMessage(stringData)` method that sends a `CefProcessMessage` to the browser process.

## CefV8Handler

Subclassed as `V8Handler` / `V8MessageHandler`:

```cpp
class V8MessageHandler : public CefV8Handler {
public:
    V8MessageHandler(CefRefPtr<CefBrowser> browser, const CefString& messageName);

    // Called when the JS function is invoked.
    bool Execute(const CefString& name,              // Function name
                 CefRefPtr<CefV8Value> object,        // `this` object
                 const CefV8ValueList& arguments,     // Function arguments
                 CefRefPtr<CefV8Value>& retval,       // Return value
                 CefString& exception) override;      // Exception text

    IMPLEMENT_REFCOUNTING(V8MessageHandler);
};
```

## CefV8Value — Creating JS Objects

```cpp
// Create a plain JS object
CefRefPtr<CefV8Value> obj = CefV8Value::CreateObject(nullptr, nullptr);

// Create a JS function bound to a handler
CefRefPtr<CefV8Value> func = CefV8Value::CreateFunction("postMessage", handler);

// Set a property on an object
obj->SetValue("postMessage", func, V8_PROPERTY_ATTRIBUTE_NONE);

// Set on global (window) object
global->SetValue("bridgeName", obj, V8_PROPERTY_ATTRIBUTE_NONE);

// Read a string value from a V8 argument
std::string str = arguments[0]->GetStringValue();

// Check value type
arguments[0]->IsString();
```

### V8 Property Attributes

```cpp
V8_PROPERTY_ATTRIBUTE_NONE       // No special attributes
V8_PROPERTY_ATTRIBUTE_READONLY   // Read-only
V8_PROPERTY_ATTRIBUTE_DONTENUM   // Not enumerable
V8_PROPERTY_ATTRIBUTE_DONTDELETE // Not deletable
```

## CefV8Context

```cpp
// Get V8 context from a frame (render process only)
CefRefPtr<CefV8Context> context = frame->GetV8Context();

// Enter/exit context for V8 operations
context->Enter();
CefRefPtr<CefV8Value> global = context->GetGlobal();
// ... create objects, set properties ...
context->Exit();
```

## Bridge Injection Pattern (OnContextCreated)

```cpp
void OnContextCreated(CefRefPtr<CefBrowser> browser,
                      CefRefPtr<CefFrame> frame,
                      CefRefPtr<CefV8Context> context) override {
    context->Enter();
    CefRefPtr<CefV8Value> global = context->GetGlobal();

    // Create bridge object
    CefRefPtr<CefV8Value> bridge = CefV8Value::CreateObject(nullptr, nullptr);
    CefRefPtr<CefV8Handler> handler = new V8MessageHandler(browser, "BunBridgeMessage");
    CefRefPtr<CefV8Value> postMessage = CefV8Value::CreateFunction("postMessage", handler);
    bridge->SetValue("postMessage", postMessage, V8_PROPERTY_ATTRIBUTE_NONE);
    global->SetValue("bunBridge", bridge, V8_PROPERTY_ATTRIBUTE_NONE);

    context->Exit();
}
```

## Process Messages (IPC)

### Sending (render → browser)

```cpp
// Create a message with a name
CefRefPtr<CefProcessMessage> message = CefProcessMessage::Create("BunBridgeMessage");

// Set arguments
message->GetArgumentList()->SetString(0, msgContent);

// Send from render to browser process
frame->SendProcessMessage(PID_BROWSER, message);
```

### Receiving (browser process)

```cpp
// Override on CefClient
bool OnProcessMessageReceived(CefRefPtr<CefBrowser> browser,
                              CefRefPtr<CefFrame> frame,
                              CefProcessId source_process,
                              CefRefPtr<CefProcessMessage> message) override {
    std::string name = message->GetName();
    std::string data = message->GetArgumentList()->GetString(0);

    if (name == "BunBridgeMessage") {
        bun_bridge_handler_(webview_id_, data.c_str());
        return true;
    }
    return false;
}
```

### CefListValue (message arguments)

```cpp
CefRefPtr<CefListValue> args = message->GetArgumentList();
args->SetString(0, "value");
args->SetInt(1, 42);
args->SetBool(2, true);

std::string s = args->GetString(0);
int i = args->GetInt(1);
bool b = args->GetBool(2);
```

## CefDictionaryValue (extra_info)

Used to pass data from browser process to render process during browser creation:

```cpp
// Browser process — set extra_info before creating browser
CefRefPtr<CefDictionaryValue> extra_info = CefDictionaryValue::Create();
extra_info->SetBool("sandbox", is_sandboxed);
extra_info->SetString("electrobunScript", script);
extra_info->SetString("customScript", custom_script);

// Render process — read in OnBrowserCreated
void OnBrowserCreated(CefRefPtr<CefBrowser> browser,
                      CefRefPtr<CefDictionaryValue> extra_info) override {
    if (extra_info && extra_info->HasKey("sandbox")) {
        bool sandboxed = extra_info->GetBool("sandbox");
    }
}
```

## Process IDs

```cpp
PID_BROWSER   // Browser process
PID_RENDERER  // Renderer process
```

## Key Files

- **V8 bridge injection**: All `cef_process_helper_*.{cc,cpp}` files + Linux `nativeWrapper.cpp`
- **Message handling**: All platform `nativeWrapper.{mm,cpp}` → `OnProcessMessageReceived()`
- **CEF header**: `package/vendors/cef/include/cef_v8.h`, `cef_process_message.h`
