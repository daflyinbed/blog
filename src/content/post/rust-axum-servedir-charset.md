---
title: "Fixing charset issue with tower_http ServeDir in Axum"
description: "How to properly handle charset in text files when using tower_http ServeDir in Rust Axum web servers"
publishDate: "2024-09-25"
tags: ["rust", "axum", "tower-http"]
---

## TL;DR

tower_http's `ServeDir` doesn't automatically add charset to text/plain responses. You need to override the Content-Type header to include `charset=utf-8` for proper text file handling.

---

## The Problem

When using `tower_http::services::ServeDir` to serve static files in a Rust Axum web server, I noticed that text files were being served without the proper charset declaration in the Content-Type header. This can cause issues with text encoding in browsers.

```rust
// This serves files but doesn't set charset for text files
let service = ServeDir::new("./static");
```

The response headers for text files look like:
```
Content-Type: text/plain
```

Instead of the preferred:
```
Content-Type: text/plain; charset=utf-8
```

## The Solution

To fix this, we need to create a custom layer that checks if the response is `text/plain` and adds the charset if needed.

```rust
use axum::{
    http::{header::CONTENT_TYPE, HeaderValue, Response},
    routing::{get_service, MethodRouter},
};
use std::{path::PathBuf, time::Duration};
use tower::ServiceBuilder;
use tower_http::{services::ServeDir, set_header::SetResponseHeaderLayer};

fn set_text_plain_charset<B>(response: &Response<B>) -> Option<HeaderValue> {
    response
        .headers()
        .get(CONTENT_TYPE)
        .and_then(|v| v.to_str().ok())
        .filter(|ct| ct.starts_with("text/plain"))
        .map(|_| HeaderValue::from_static("text/plain; charset=utf-8"))
}

pub fn serve_dir_with_charset(path: PathBuf) -> MethodRouter {
    let header_layer = SetResponseHeaderLayer::overriding(CONTENT_TYPE, set_text_plain_charset);

    get_service(
        ServiceBuilder::new()
            .layer(header_layer)
            .service(ServeDir::new(path)),
    )
}
```

## Usage Example

Here's how to use it in your Axum application:

```rust
use axum::{routing::get, Router};
use tower_http::services::ServeDir;

let app = Router::new()
    .nest_service("/static", serve_dir_with_charset(PathBuf::from("./static")));
```

