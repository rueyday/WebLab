# TRINKET LAB

**One tab, every small web tool.** A static site hosted on GitHub Pages — no build
step, no server, no accounts, no ads, no uploads. Everything runs in your browser and
keeps working offline once loaded (it's an installable PWA). The only tools that talk
to the network are the ones that must (weather, DNS, my-IP, speed test, HTTP client),
and PDF / OCR libraries load lazily from a CDN the first time you use them.

**Live:** https://rueyday.github.io/WebLab/

## Tools

The sidebar shows **15 tools**. Each bundles related jobs as tabs (38 in total), so
there is one place to look for anything to do with text, one for data, and so on.
Hover any sidebar entry, tab or header button for a one-line explanation.

| tool | tabs |
| --- | --- |
| Text Studio | Text Metrics · Text Transform · Regex Lab · Text Compare · Markdown Studio · Glyphs & Fancy Text |
| Data Studio | JSON Studio · Table Lab |
| Code Tools | Code Tools (beautify/minify/escape) · Code Sandbox · Cheat Sheets |
| File Workshop | PDF Workshop · Zip & Unzip |
| Crypto Kit | Hash & Checksum · Encoder Ring · Encrypt / Decrypt · Passwords & IDs |
| Image Forge | Image Forge · Sketchpad |
| Design Kit | Color Lab · CSS Studio |
| QR Studio | QR codes, barcodes, scanner |
| Media Bench | Media Tools (video/GIF/record) · Audio Bench (tone, metronome, tuner, TTS) |
| Numbers | Calculator · Unit Converter · Number Base & Bits |
| Time & Weather | Time Machine · Weather |
| Network | Net Console (HTTP, WebSocket, DNS, my IP, speed) · Network Kit (subnets, UA, ports, MIME) · URL Inspector |
| Device Lab | Device Scope · Hardware Test · Input Tester |
| Workspace | Notes & Tasks · Launchpad (bookmarks) |
| Randomizer | dice, wheel, picker, lorem, fake data |

URLs are `#/tool/tab` (e.g. `#/crypto/hash`). Old single-tool links such as `#/hash`
or `#/regex` still resolve to the right tab. The command palette lists both the
15 tools and every tab, so searching "base64" or "diff" jumps straight there.

Global: command palette (`⌘K`), sidebar filter (`/`), pinned favourites (`Alt 1–9`),
5 themes, settings, backup export/import, drag-and-drop / paste routing, offline PWA.

## Files

```
index.html          shell (header, sidebar, view, overlays)
styles.css          design system + themes
js/main.js          boot: settings, rail, shortcuts, palette commands, SW
js/core.js          registry, router, storage, ui kit, palette, modal
js/lib/*.js         pure logic (qrcode, barcode, markdown, diff, expr, units, colorkit, hashes, textkit, zip, gif, exif)
js/tools/*.js       one module per tool, self-registers via defineTool(); index.js groups them
sw.js               service worker (offline cache)
manifest.webmanifest, icon.svg, privacy.html
```

### Adding a tool

Create `js/tools/mytool.js`:

```js
import { defineTool, h, card } from "../core.js";
defineTool({
  id: "mytool", name: "My Tool", icon: "✦",
  desc: "What it does (shown on hover and under the title).", tags: ["search", "words"],
  mount(root) { root.append(card("Hello", h("p", "world"))); return () => {/* cleanup */}; },
});
```

then in `js/tools/index.js` add `import "./mytool.js";` and either list `"mytool"` in
the `parts` of an existing group (it becomes a tab there) or add a new group entry.
A tool left out of every group shows up in the sidebar on its own. Finally add the
file path to `SHELL` in `sw.js`.

## Deploying

GitHub Pages serves straight from `main` / root. Every push republishes.
Bump `VERSION` in `sw.js` when shipping changes so clients refresh their cache.

Locally: `python3 -m http.server 8777` then open http://localhost:8777
(ES modules need http://, not file://).
