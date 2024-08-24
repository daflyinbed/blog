---
title: "Download big file with reqwest"
description: "Download and write chunks one by one using reqwest."
publishDate: "2024-03-10"
tags: ["rust", "notes"]
---

## use tokio::fs

Originally posted by @jtara1 in [comment](https://github.com/seanmonstar/reqwest/issues/1266#issuecomment-1106187437_)

```rust
use std::borrow::BorrowMut;
use tokio::io::AsyncWriteExt;

let mut response = client.get(dbg!(url)).send().await?;
let mut file = tokio::fs::File::create(path).await?;

while let Some(mut item) = response.chunk().await? {
    file.write_all_buf(item.borrow_mut()).await?;
}
```

## use std::fs

```rust
use std::borrow::BorrowMut;

let mut response = client.get(dbg!(url)).send().await?;
let mut file = std::fs::File::create(path)?;

while let Some(mut item) = response.chunk().await? {
    file.write_all(item.borrow_mut())?;
}
```
