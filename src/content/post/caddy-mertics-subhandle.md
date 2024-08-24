---
title: "Why subroute is the only handler in metrics of caddy"
description: "Why subroute is the only handler in metrics of my caddy instance, and how to debug"
publishDate: "2024-08-24"
tags: ["caddy"]
---

## TL;DR

1. Read JSON, not the Caddyfile.
2. Search and read code in [Caddy's](https://github.com/caddyserver/caddy/tree/master/caddyconfig/httpcaddyfile) repository

---

I encountered this issue while migrating from Nginx + Varnish to Caddy with Souin. I noticed that the handler label in the metrics from Caddy consistently shows as subroute, like this:

```
caddy_http_request_duration_seconds_bucket{code="200", handler="subroute", instance="fgo-caddy-1:80", job="caddy_exporter", le="+Inf", method="GET", server="srv0"}
```

I couldn't find any answers in the Caddy community or GitHub issues, so I decided to investigate it myself.

## 1. Switch to Caddy's native configuration language

> Caddy's native config language is JSON, but writing JSON by hand can be tedious and error-prone. That's why Caddy supports being configured with other languages through config adapters.

So, the first step is to convert my Caddyfile back to JSON:

```sh
caddy adapt --config /path/to/Caddyfile --pretty
```

It outputs something like this [json](https://github.com/caddyserver/caddy/blob/8fa45ebc1ebe74700533ed5917cd6a863955e042/caddytest/integration/caddyfile_adapt/php_fastcgi_matcher.txt)

```json
{
  /// ...
  "srv0": {
    "listen": [":8884"],
    "routes": [
      {
        "handle": [
          {
            "handler": "subroute",
            "routes": [
              /// config in my caddyfile
            ]
          }
        ]
      }
    ]
  }
}
```

It seems like the Caddyfile adapter wraps an extra subroute around my configuration.

## 2. Review Caddy's code

After searching and reading through [Caddy's](https://github.com/caddyserver/caddy) repository, I came across a suspicious piece of code:

```go
	// No need to wrap the handlers in a subroute if this is the only server block
	// and there is no matcher for it (doing so would produce unnecessarily nested
	// JSON), *unless* there is a host matcher within this site block; if so, then
	// we still need to wrap in a subroute because otherwise the host matcher from
	// the inside of the site block would be a top-level host matcher, which is
	// subject to auto-HTTPS (cert management), and using a host matcher within
	// a site block is a valid, common pattern for excluding domains from cert
	// management, leading to unexpected behavior; see issue #5124.
	wrapInSubroute := true
	if len(matcherSetsEnc) == 0 && len(p.serverBlocks) == 1 {
		var hasHostMatcher bool
	outer:
		for _, route := range subroute.Routes {
			for _, ms := range route.MatcherSetsRaw {
				for matcherName := range ms {
					if matcherName == "host" {
						hasHostMatcher = true
						break outer
					}
				}
			}
		}
		wrapInSubroute = hasHostMatcher
	}

	if wrapInSubroute {
		route := caddyhttp.Route{
			// the semantics of a site block in the Caddyfile dictate
			// that only the first matching one is evaluated, since
			// site blocks do not cascade nor inherit
			Terminal: true,
		}
		if len(matcherSetsEnc) > 0 {
			route.MatcherSetsRaw = matcherSetsEnc
		}
		if len(subroute.Routes) > 0 || subroute.Errors != nil {
			route.HandlersRaw = []json.RawMessage{
				caddyconfig.JSONModuleObject(subroute, "handler", "subroute", warnings),
			}
		}
		if len(route.MatcherSetsRaw) > 0 || len(route.HandlersRaw) > 0 {
			routeList = append(routeList, route)
		}
	} else {
		routeList = append(routeList, subroute.Routes...)
	}
```

This code snippet is from [#5130](https://github.com/caddyserver/caddy/pull/5130)

> But if that site block contains a host matcher:

```caddyfile
:443 {
    @example host example.com
    ... @example ...
}
```

> Then previously it would become a host matcher at a top-level route in the JSON, which is used for activating automatic HTTPS. (See #5124.) This is unexpected, so now we only avoid wrapping the site block if there is no host matcher. A host matcher defined in that fashion should stay within a subroute because auto-HTTPS is not expected on it.

## 3. Conclusion

Then I go back and check my caddyfile. I do find there is a host matcher in it. After remove it, there is my handlers came back.
