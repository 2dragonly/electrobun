# CEF Scheme Handlers & Response Filters Reference (v87)

## Custom Scheme Registration

Electrobun registers the `views://` scheme for serving app content from ASAR archives or the filesystem.

### Step 1: Register the scheme (both main + helper processes)

```cpp
void OnRegisterCustomSchemes(CefRawPtr<CefSchemeRegistrar> registrar) override {
    registrar->AddCustomScheme("views",
        CEF_SCHEME_OPTION_STANDARD |       // Follows standard URL rules
        CEF_SCHEME_OPTION_CORS_ENABLED |   // CORS requests allowed
        CEF_SCHEME_OPTION_SECURE |         // Treated as secure origin
        CEF_SCHEME_OPTION_CSP_BYPASSING |  // Bypasses CSP restrictions
        CEF_SCHEME_OPTION_FETCH_ENABLED);  // Can be used with fetch()
}
```

### Step 2: Register handler factory (in OnContextInitialized)

```cpp
void OnContextInitialized() override {
    CefRegisterSchemeHandlerFactory("views", "", new ViewsSchemeHandlerFactory());
}
```

Or on a specific request context (macOS pattern):

```cpp
request_context->RegisterSchemeHandlerFactory("views", "", factory);
```

## CefSchemeHandlerFactory

```cpp
class ViewsSchemeHandlerFactory : public CefSchemeHandlerFactory {
public:
    CefRefPtr<CefResourceHandler> Create(
        CefRefPtr<CefBrowser> browser,
        CefRefPtr<CefFrame> frame,
        const CefString& scheme_name,
        CefRefPtr<CefRequest> request) override {
        // Resolve webview ID from browser
        // Return a new resource handler
        return new ViewsResourceHandler(webviewId);
    }

    IMPLEMENT_REFCOUNTING(ViewsSchemeHandlerFactory);
};
```

## CefResourceHandler

Serves content for custom scheme requests:

```cpp
class ViewsResourceHandler : public CefResourceHandler {
public:
    // Called to open/process the request. Set handle_request=true if handled synchronously.
    bool Open(CefRefPtr<CefRequest> request,
              bool& handle_request,
              CefRefPtr<CefCallback> callback) override {
        std::string url = request->GetURL();
        // Parse URL, load file from ASAR or filesystem
        // Set data_ and mimeType_
        handle_request = true;
        return true;
    }

    // Called to set response headers.
    void GetResponseHeaders(CefRefPtr<CefResponse> response,
                            int64_t& response_length,
                            CefString& redirectUrl) override {
        response->SetStatus(200);
        response->SetMimeType(mimeType_);
        response->SetStatusText("OK");
        response_length = data_.length();
    }

    // Called to read response data.
    bool Read(void* data_out,
              int bytes_to_read,
              int& bytes_read,
              CefRefPtr<CefResourceReadCallback> callback) override {
        // Copy data_ to data_out, track offset
        return has_data;
    }

    // Called to cancel the request.
    void Cancel() override {}

    IMPLEMENT_REFCOUNTING(ViewsResourceHandler);
};
```

### Content Sources

The handler serves content from two sources in order:

1. **ASAR archive** (`Resources/app.asar`) — production builds
2. **Flat filesystem** (`Resources/app/views/`) — development fallback

### MIME Type Detection

```cpp
// Pattern used in Electrobun scheme handlers:
if (path.find(".html") != std::string::npos) mimeType = "text/html";
else if (path.find(".css") != std::string::npos) mimeType = "text/css";
else if (path.find(".js") != std::string::npos) mimeType = "text/javascript";
else if (path.find(".json") != std::string::npos) mimeType = "application/json";
else if (path.find(".png") != std::string::npos) mimeType = "image/png";
else if (path.find(".jpg") != std::string::npos) mimeType = "image/jpeg";
else if (path.find(".svg") != std::string::npos) mimeType = "image/svg+xml";
else if (path.find(".woff") != std::string::npos) mimeType = "font/woff";
else if (path.find(".woff2") != std::string::npos) mimeType = "font/woff2";
else if (path.find(".ttf") != std::string::npos) mimeType = "font/ttf";
else mimeType = "application/octet-stream";
```

## CefResponseFilter — Preload Script Injection

Electrobun uses `CefResponseFilter` to inject preload scripts into HTML responses before they reach the renderer.

### How it's connected

```cpp
// In CefResourceRequestHandler::GetResourceResponseFilter()
CefRefPtr<CefResponseFilter> GetResourceResponseFilter(
    CefRefPtr<CefBrowser> browser,
    CefRefPtr<CefFrame> frame,
    CefRefPtr<CefRequest> request,
    CefRefPtr<CefResponse> response) override {
    // Only filter HTML responses
    std::string mimeType = response->GetMimeType();
    if (mimeType == "text/html") {
        return new ElectrobunResponseFilter(electrobun_script_, custom_script_);
    }
    return nullptr;
}
```

### ElectrobunResponseFilter Implementation

```cpp
class ElectrobunResponseFilter : public CefResponseFilter {
    std::string buffer_;
    bool injected_;

    bool InitFilter() override { return true; }

    FilterStatus Filter(void* data_in, size_t data_in_size,
                        size_t& data_in_read,
                        void* data_out, size_t data_out_size,
                        size_t& data_out_written) override {
        // Buffer incoming data
        buffer_.append(static_cast<const char*>(data_in), data_in_size);
        data_in_read = data_in_size;

        if (!injected_) {
            // Injection points (in preference order):
            // 1. After <head>
            // 2. After <html> (wraps with <head>)
            // 3. At beginning (wraps with <html><head>)
            std::string script_tag = "<script>\n" + combined_script + "\n</script>\n";
            buffer_.insert(inject_pos, script_tag);
            injected_ = true;
        }

        // Output buffered data
        size_t copy_size = std::min(data_out_size, buffer_.size());
        std::memcpy(data_out, buffer_.data(), copy_size);
        buffer_.erase(0, copy_size);
        data_out_written = copy_size;

        return buffer_.empty() ? RESPONSE_FILTER_DONE : RESPONSE_FILTER_NEED_MORE_DATA;
    }

    IMPLEMENT_REFCOUNTING(ElectrobunResponseFilter);
};
```

### FilterStatus Values

```cpp
RESPONSE_FILTER_NEED_MORE_DATA  // More data expected / buffer not empty
RESPONSE_FILTER_DONE            // Filtering complete
RESPONSE_FILTER_ERROR           // Error occurred (not used in Electrobun)
```

## CefRequest API

```cpp
CefRefPtr<CefRequest> request;
std::string url = request->GetURL();
std::string method = request->GetMethod();
```

## CefResponse API

```cpp
CefRefPtr<CefResponse> response;
response->SetStatus(200);
response->SetStatusText("OK");
response->SetMimeType("text/html");
std::string mimeType = response->GetMimeType();
```

## Key Files

- **Shared filter**: `package/src/native/shared/cef_response_filter.h`
- **macOS scheme handler**: `package/src/native/macos/nativeWrapper.mm` (ElectrobunSchemeHandler)
- **Linux scheme handler**: `package/src/native/linux/nativeWrapper.cpp` (ViewsResourceHandler)
- **Windows scheme handler**: `package/src/native/win/nativeWrapper.cpp` (ElectrobunSchemeHandler)
- **CEF headers**: `include/cef_scheme.h`, `include/cef_resource_handler.h`, `include/cef_response_filter.h`
