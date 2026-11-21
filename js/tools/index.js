/* Tool registry.
   Every module below self-registers one tool via defineTool().
   defineGroups() then bundles related tools into the 15 entries the sidebar shows;
   each tool becomes a tab inside its group (tabs: short labels for the strip). Order here = order on screen.
   Old links keep working: #/hash → Crypto Kit › Hash, #/regex → Text Studio › Regex. */
import { defineGroups } from "../core.js";
import "./home.js";
import "./text.js";
import "./transform.js";
import "./regex.js";
import "./diff.js";
import "./markdown.js";
import "./glyphs.js";
import "./json.js";
import "./table.js";
import "./code.js";
import "./sandbox.js";
import "./cheats.js";
import "./pdf.js";
import "./archive.js";
import "./hash.js";
import "./encode.js";
import "./cipher.js";
import "./secrets.js";
import "./image.js";
import "./draw.js";
import "./color.js";
import "./css.js";
import "./qr.js";
import "./media.js";
import "./audio.js";
import "./calc.js";
import "./units.js";
import "./time.js";
import "./weather.js";
import "./api.js";
import "./net.js";
import "./url.js";
import "./device.js";
import "./hardware.js";
import "./input.js";
import "./notes.js";
import "./links.js";
import "./random.js";

export const GROUPS = [
  { id: "text", name: "Text Studio", icon: "≡",
    desc: "Everything for plain text: counts & readability, case and line tools, regex, diffs, Markdown preview, symbols & fancy unicode.",
    parts: ["text", "transform", "regex", "diff", "markdown", "glyphs"],
    tabs: { text: "Metrics", transform: "Transform", regex: "Regex", diff: "Compare", markdown: "Markdown", glyphs: "Symbols" } },
  { id: "data", name: "Data Studio", icon: "{}",
    desc: "JSON and tabular data: format, validate, query, convert between JSON / CSV / YAML / Markdown / SQL / Excel.",
    parts: ["json", "table"],
    tabs: { json: "JSON", table: "Tables & CSV" } },
  { id: "code", name: "Code Tools", icon: "</>",
    desc: "Beautify & minify, escape strings, a live HTML/CSS/JS sandbox, and searchable cheat sheets for git, bash, vim, docker…",
    parts: ["code", "sandbox", "cheats"],
    tabs: { code: "Format & Escape", sandbox: "Sandbox", cheats: "Cheat Sheets" } },
  { id: "files", name: "File Workshop", icon: "⎘",
    desc: "PDF merge / split / rotate / watermark, images ⇄ PDF, plus zip, unzip and gzip — all without uploading.",
    parts: ["pdf", "archive"],
    tabs: { pdf: "PDF", archive: "Zip" } },
  { id: "crypto", name: "Crypto Kit", icon: "⚿",
    desc: "Hashes & checksums, Base64 / hex / JWT encoders, AES encryption, password & ID generators, keypairs.",
    parts: ["hash", "encode", "cipher", "secrets"],
    tabs: { hash: "Hash", encode: "Encode", cipher: "Encrypt", secrets: "Passwords & IDs" } },
  { id: "image", name: "Image Forge", icon: "▣",
    desc: "Edit images (crop, resize, filters, redact, watermark, OCR, convert) or draw on a blank sketchpad.",
    parts: ["image", "draw"],
    tabs: { image: "Edit", draw: "Sketch" } },
  { id: "design", name: "Design Kit", icon: "◈",
    desc: "Colour conversion, palettes, WCAG contrast, and CSS generators for shadows, radius, easing, type scales.",
    parts: ["color", "css"],
    tabs: { color: "Colour", css: "CSS" } },
  { id: "qr", name: "QR Studio", icon: "▦",
    desc: "Generate QR codes & barcodes for links, Wi-Fi, contacts, events; scan with the camera or an image.",
    parts: ["qr"] },
  { id: "media", name: "Media Bench", icon: "🎞",
    desc: "Video → GIF / frames / audio, trim audio, record screen / mic / camera, tone generator, metronome, tuner, speech.",
    parts: ["media", "audio"],
    tabs: { media: "Video & Record", audio: "Audio Bench" } },
  { id: "numbers", name: "Numbers", icon: "∑",
    desc: "Calculator with graphing, matrices & money maths; unit and currency converter; binary / hex / roman numerals.",
    parts: ["calc", "units", "base"],
    tabs: { calc: "Calculator", units: "Units & Currency", base: "Bases & Bits" } },
  { id: "time", name: "Time & Weather", icon: "◷",
    desc: "Timestamps, world clocks, date maths, timers, Pomodoro, cron — and a no-tracking weather forecast.",
    parts: ["time", "weather"],
    tabs: { time: "Time", weather: "Weather" } },
  { id: "net", name: "Network", icon: "⇌",
    desc: "HTTP & WebSocket client, DNS, my IP, speed test, subnet calculator, HTTP codes, ports, MIME, URL parser.",
    parts: ["api", "net", "url"],
    tabs: { api: "HTTP & Ping", net: "Network Kit", url: "URL" } },
  { id: "device", name: "Device Lab", icon: "◉",
    desc: "What the browser knows about this machine, display / camera / mic / speaker tests, keyboard & gamepad tester.",
    parts: ["device", "hardware", "input"],
    tabs: { device: "Device Info", hardware: "Hardware Test", input: "Input Tester" } },
  { id: "workspace", name: "Workspace", icon: "✎",
    desc: "Autosaving notes with Markdown, a to-do list, and a bookmark launchpad — stored only in this browser.",
    parts: ["notes", "links"],
    tabs: { notes: "Notes & Tasks", links: "Bookmarks" } },
  { id: "random", name: "Randomizer", icon: "⚄",
    desc: "Dice, coins, wheel picker, shuffler, lorem ipsum, fake data, decision maker.",
    parts: ["random"] },
];

export function registerAll() { defineGroups(GROUPS); }
