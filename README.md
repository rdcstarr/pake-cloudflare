# The Cloudflare dashboard, as a desktop app

[dash.cloudflare.com](https://dash.cloudflare.com) packaged with [Pake](https://github.com/tw93/Pake)
into a native window — the system webview, not a bundled browser, so the whole
thing is a few megabytes rather than a few hundred.

## Install

```bash
curl -fsSL https://get.rec.tools/cloudflare | bash
```

Linux and macOS. On Linux the script installs the `.deb` where `dpkg` exists and
falls back to the AppImage in `~/.local` where it does not. On Windows, download
the `.msi` from [the latest release](https://github.com/rdcstarr/pake-cloudflare/releases/latest).

The command is `pake-cloudflare` — Pake prefixes the Linux binary, and the
AppImage path is named to match so it is the same either way.

## Signing in

Email and password, and the two-factor prompt that follows: both live on
`dash.cloudflare.com`, so the whole flow stays inside the window.

The **Google, Apple and GitHub buttons do not work**: those providers refuse to
authenticate inside an embedded webview. "Continue with SSO" leaves the host
too. This is a property of the providers, not something the app can fix.

## One host, deliberately

`safeDomain` lists `dash.cloudflare.com` and nothing else. Everything the
dashboard itself does happens on that host, while the docs, the blog and the
marketing site are exactly the places a click should hand you to your browser —
which is what an unlisted host does.

`safeDomain` **replaces** the set of URLs that stay in the app rather than
adding to it, so leaving the app's own host out would send every internal link
to the browser. `scripts/check-config.mjs` reads the regex Pake compiled for the
build and fails the workflow if the dashboard, the login or the token page ever
stop matching.

## What builds, and where

| Platform | Format | Architecture |
| --- | --- | --- |
| Linux | `.deb`, `.AppImage` | x86_64 |
| macOS | `.dmg` | Apple Silicon |
| Windows | `.msi` | x64 |

Pushing a `v*` tag builds all three in GitHub Actions and publishes them to a
release. Every asset is renamed to a name that never changes, so
`releases/latest/download/cloudflare-macos-arm64.dmg` is a permanent URL — that
is what lets `install.sh` skip `api.github.com` entirely, and with it the 60
requests per hour that unauthenticated callers get.

`workflow_dispatch` runs the same build without publishing, for when the
workflow itself is what changed.

## The app definition

Everything the app is lives in [`app.json`](app.json) — URL, window size, the
one host that stays inside. It follows [Pake's schema](https://raw.githubusercontent.com/tw93/Pake/main/schema/pake.schema.json),
so an editor with schema support will complete and validate it.

## What this is not

Nothing here is signed or notarised: macOS needs the quarantine flag cleared
(the installer does it) and may still want a right-click → Open the first time,
and Windows shows a SmartScreen warning. There is no auto-update — reinstalling
with the same command is the update.
