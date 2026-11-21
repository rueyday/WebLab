/* TRINKET LAB — boot */
import {
  $, $$, h, clear, toast, store, tools, groups, getGroup, resolve, rememberedPart, partFor, navigate, startRouter, startShortcuts,
  startTooltips, defineShortcut, defineCommand, openPalette, modal, on, favorites, recents, isFav, toggleFav,
  copy, download, pickFile, readAs, btn, seg, field, current, currentGroup,
} from "./core.js";
import { registerAll } from "./tools/index.js";

registerAll();

/* pins and recents are stored by sidebar entry; old backups may hold ids of tools that are now tabs */
const toGroupIds = (ids) => [...new Set(ids.map((id) => resolve(id)?.group.id).filter((id) => id && id !== "home"))];
store.set("favorites", toGroupIds(favorites()));
store.set("recents", toGroupIds(recents()));

/* ── settings ───────────────────────────────────────────── */
const THEMES = ["midnight", "aurora", "ember", "matrix", "paper"];
const defaults = { theme: "midnight", fx: true, glow: true, motion: true, density: "cozy", railCollapsed: false, clock24: true, showSeconds: true };
const settings = { ...defaults, ...store.get("settings", {}) };
function applySettings() {
  const root = document.documentElement;
  root.dataset.theme = settings.theme;
  root.dataset.fx = settings.fx ? "on" : "off";
  root.dataset.glow = settings.glow ? "on" : "off";
  root.dataset.motion = settings.motion ? "on" : "off";
  root.dataset.density = settings.density;
  $("#shell").classList.toggle("rail-collapsed", !!settings.railCollapsed);
  $("meta[name=theme-color]")?.setAttribute("content", getComputedStyle(document.body).getPropertyValue("--bg").trim() || "#04060d");
  store.set("settings", settings);
}
function setTheme(t) { settings.theme = t; applySettings(); toast("theme · " + t); }
function cycleTheme() { setTheme(THEMES[(THEMES.indexOf(settings.theme) + 1) % THEMES.length]); }
applySettings();

/* ── sidebar rail ───────────────────────────────────────── */
const openGroup = (g, q = "") => {
  navigate(g.id, { part: partFor(g, q).id });
  if (window.innerWidth < 860) { settings.railCollapsed = true; applySettings(); }
};
function renderRail(filter = "") {
  const list = $("#rail-list");
  clear(list);
  const q = filter.trim().toLowerCase();
  const all = groups.filter((g) => g.id !== "home");
  const visible = all.filter((g) => !q || g.search.includes(q));
  const favs = q ? [] : favorites().map(getGroup).filter(Boolean);
  const item = (g) =>
    h("button.rail-item", {
      type: "button", class: currentGroup() === g.id ? "is-active" : "", dataset: { id: g.id },
      "data-tip": g.desc, "data-tip-sub": g.parts.length > 1 ? "tabs: " + g.parts.map((p) => p.tab).join(" · ") : null,
      onclick: () => openGroup(g, q),
    },
      h("span.ri-icon", { text: g.icon }),
      h("span.ri-name", { text: g.name }),
      h("span.ri-star", {
        text: isFav(g.id) ? "★" : "☆", class: isFav(g.id) ? "on" : "", "data-tip": isFav(g.id) ? "unpin" : "pin to top", "data-tip-side": "bottom",
        onclick(e) { e.stopPropagation(); toggleFav(g.id); },
      }));
  list.append(h("button.rail-item", {
    type: "button", class: currentGroup() === "home" ? "is-active" : "", dataset: { id: "home" },
    "data-tip": "Overview of every tool", onclick: () => navigate("home"),
  }, h("span.ri-icon", { text: "⌂" }), h("span.ri-name", { text: "Home" })));
  if (favs.length) {
    list.append(h("div.rail-group", { text: "★ pinned" }));
    for (const g of favs) list.append(item(g));
  }
  list.append(h("div.rail-group", { text: q ? "matches" : "all tools" }));
  for (const g of visible) list.append(item(g));
  if (!visible.length) list.append(h("div.palette-empty", { text: "no tools match" }));
  const foot = $("#rail-foot");
  clear(foot);
  foot.append(
    btn("⌘K", () => openPalette(), "ghost sm"),
    btn("export", exportData, "ghost sm"),
    btn("import", importData, "ghost sm"));
}
$("#rail-filter").addEventListener("input", (e) => renderRail(e.target.value));
$("#rail-filter").addEventListener("keydown", (e) => {
  if (e.key === "Enter") { const first = $('.rail-item[data-id]:not([data-id="home"])', $("#rail-list")); first?.click(); }
  if (e.key === "Escape") { e.target.value = ""; renderRail(); }
});
on("navigate", () => {
  $$(".rail-item").forEach((n) => n.classList.toggle("is-active", n.dataset.id === currentGroup()));
});
on("favorites", () => renderRail($("#rail-filter").value));
$("#rail-toggle").addEventListener("click", () => { settings.railCollapsed = !settings.railCollapsed; applySettings(); });
$("#brand-home").addEventListener("click", () => navigate("home"));
$("#open-palette").addEventListener("click", () => openPalette());
$("#btn-theme").addEventListener("click", cycleTheme);
$("#btn-fullscreen").addEventListener("click", toggleFullscreen);
$("#btn-help").addEventListener("click", showHelp);
$("#btn-settings").addEventListener("click", showSettings);

function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen?.().catch(() => toast("fullscreen blocked", "bad"));
}

/* ── clock ──────────────────────────────────────────────── */
const clockEl = $("#clock");
function tickClock() {
  const d = new Date();
  clockEl.textContent = d.toLocaleTimeString([], {
    hour12: !settings.clock24, hour: "2-digit", minute: "2-digit", second: settings.showSeconds ? "2-digit" : undefined,
  });
}
tickClock();
setInterval(tickClock, 1000);
clockEl.addEventListener("click", () => navigate("time"));

/* ── data export / import ───────────────────────────────── */
function exportData() {
  const data = { app: "trinketlab", version: 2, exportedAt: new Date().toISOString(), data: store.dump() };
  download(JSON.stringify(data, null, 2), `trinketlab-backup-${new Date().toISOString().slice(0, 10)}.json`, "application/json");
}
async function importData() {
  const f = await pickFile({ accept: "application/json,.json" });
  if (!f) return;
  try {
    const parsed = JSON.parse(await readAs.text(f));
    const payload = parsed.app === "trinketlab" ? parsed.data : parsed;
    store.load(payload);
    toast("data imported — reloading", "ok");
    setTimeout(() => location.reload(), 600);
  } catch { toast("that file is not a TRINKET LAB backup", "bad"); }
}

/* ── settings modal ─────────────────────────────────────── */
function showSettings() {
  const themeSeg = seg(THEMES, (v) => setTheme(v), settings.theme);
  const toggle = (key, label) => h("label.check",
    h("input", { type: "checkbox", checked: !!settings[key], onchange(e) { settings[key] = e.target.checked; applySettings(); } }),
    label);
  const body = h("div.col",
    field("theme", themeSeg),
    field("density", seg([["cozy", "cozy"], ["compact", "compact"]], (v) => { settings.density = v; applySettings(); }, settings.density)),
    h("div.row", toggle("fx", "background effects"), toggle("glow", "neon glow"), toggle("motion", "animations")),
    h("div.row", toggle("clock24", "24-hour clock"), toggle("showSeconds", "clock seconds")),
    h("hr", { style: { border: 0, borderTop: "1px solid var(--line)", width: "100%" } }),
    h("div.row",
      btn("Export all data", exportData, "ghost"),
      btn("Import backup", importData, "ghost"),
      btn("Reset everything", () => {
        if (!confirm("Wipe all TRINKET LAB data in this browser (notes, tasks, settings, favorites)?")) return;
        store.wipe();
        location.reload();
      }, "ghost danger")),
    h("p.hint", { text: `storage used: ${storageUsed()} · ${groups.length - 1} tools · ${tools.length - 1} tabs loaded` }));
  modal("Settings", body);
}
function storageUsed() {
  let n = 0;
  try { for (const k of Object.keys(localStorage)) if (k.startsWith("trinket:")) n += (localStorage.getItem(k) || "").length * 2; } catch {}
  return n > 1024 * 1024 ? (n / 1048576).toFixed(2) + " MB" : (n / 1024).toFixed(1) + " KB";
}

/* ── shortcuts + help ───────────────────────────────────── */
const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
const MOD = isMac ? "⌘" : "Ctrl";
defineShortcut(`${MOD} K`, "Command palette", openPalette);
defineShortcut(`${MOD} B`, "Toggle sidebar", () => { settings.railCollapsed = !settings.railCollapsed; applySettings(); },
  { match: (e) => (e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === "b" });
defineShortcut(`${MOD} ⇧ T`, "Cycle theme", cycleTheme,
  { match: (e) => (e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "t" });
defineShortcut("?", "This help", showHelp, { match: (e) => e.key === "?" && !e.metaKey && !e.ctrlKey });
defineShortcut("G then H", "Go home", () => navigate("home"), { match: (e) => e.key === "h" && chord === "g" });
defineShortcut("Alt 1–9", "Jump to pinned tool N", () => {}, { match: () => false });
defineShortcut("Esc", "Close overlays / clear selection", () => {}, { match: () => false });
defineShortcut("/", "Focus sidebar filter", () => { $("#rail-filter").focus(); },
  { match: (e) => e.key === "/" && !e.metaKey && !e.ctrlKey });

let chord = "";
let chordTimer;
document.addEventListener("keydown", (e) => {
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
  if (typing) return;
  if (e.altKey && /^[1-9]$/.test(e.key)) {
    const list = favorites().length ? favorites() : groups.filter((g) => g.id !== "home").map((g) => g.id);
    const g = getGroup(list[+e.key - 1]);
    if (g) { e.preventDefault(); openGroup(g); }
    return;
  }
  if (e.key === "g" && !e.metaKey && !e.ctrlKey) {
    chord = "g";
    clearTimeout(chordTimer);
    chordTimer = setTimeout(() => (chord = ""), 900);
    return;
  }
  if (chord === "g" && e.key !== "h") chord = "";
});
document.addEventListener("keyup", (e) => { if (e.key === "h") chord = ""; });

function showHelp() {
  const rows = [
    [`${MOD} K`, "Command palette — search every tool and action"],
    [`${MOD} B`, "Toggle sidebar"],
    [`${MOD} ⇧ T`, "Cycle colour theme"],
    ["/", "Focus the sidebar filter"],
    ["G then H", "Go home"],
    ["Alt 1–9", "Jump to your Nth pinned tool"],
    ["?", "Show this help"],
    ["Esc", "Close dialogs · clear selections"],
    [`${MOD} V`, "Paste an image anywhere → opens Image Forge"],
    ["Drag & drop", "Drop any image on the page → opens Image Forge"],
  ];
  modal("Keyboard shortcuts",
    h("div",
      rows.map(([k, d]) => h("div.shortcut-row", h("span", { text: d }), h("span.kbd", { text: k }))),
      h("p.hint", { style: { marginTop: "14px" }, text: "Tip: hover any sidebar entry or tab for what it does. Every tool remembers its inputs in this browser. Nothing is ever uploaded." })));
}

/* ── palette commands ───────────────────────────────────── */
defineCommand({ label: "Cycle theme", keywords: "dark light theme colour", run: cycleTheme });
for (const t of THEMES) defineCommand({ label: `Theme: ${t}`, keywords: "theme " + t, icon: "◐", run: () => setTheme(t) });
defineCommand({ label: "Toggle sidebar", keywords: "rail nav", run: () => { settings.railCollapsed = !settings.railCollapsed; applySettings(); } });
defineCommand({ label: "Toggle fullscreen", keywords: "fullscreen", run: toggleFullscreen });
defineCommand({ label: "Settings", keywords: "preferences options", icon: "⚙", run: showSettings });
defineCommand({ label: "Keyboard shortcuts", keywords: "help keys", icon: "?", run: showHelp });
defineCommand({ label: "Export all data (backup)", keywords: "backup download save", icon: "↓", run: exportData });
defineCommand({ label: "Import backup", keywords: "restore upload", icon: "↑", run: importData });
defineCommand({ label: "Copy current tool link", keywords: "share url", icon: "⧉", run: () => copy(location.href, "link copied") });
defineCommand({ label: "Pin / unpin current tool", keywords: "favorite star", icon: "★", run: () => {
  const g = currentGroup();
  if (!g || g === "home") return toast("open a tool first");
  toggleFav(g); toast(isFav(g) ? "pinned" : "unpinned");
} });
defineCommand({ label: "Reload app", keywords: "refresh", icon: "↻", run: () => location.reload() });

/* ── global image capture → Image Forge ─────────────────── */
["dragenter", "dragover"].forEach((ev) => document.addEventListener(ev, (e) => {
  if ([...(e.dataTransfer?.types || [])].includes("Files")) e.preventDefault();
}));
document.addEventListener("drop", (e) => {
  const file = e.dataTransfer?.files?.[0];
  if (!file) return;
  e.preventDefault();
  routeFile(file);
});
document.addEventListener("paste", (e) => {
  const typing = /^(INPUT|TEXTAREA)$/.test(e.target.tagName);
  const item = [...(e.clipboardData?.items || [])].find((i) => i.type.startsWith("image/"));
  if (!item) return;
  if (typing && current() !== "image") return;
  e.preventDefault();
  routeFile(item.getAsFile());
});
function routeFile(file) {
  if (file.type.startsWith("image/")) {
    window.__pendingFile = file;
    if (current() === "image") document.dispatchEvent(new CustomEvent("trinket:file", { detail: file }));
    else navigate("image");
  } else if (/^text\/|json|csv|xml|javascript/.test(file.type) || /\.(txt|md|json|csv|js|ts|html|css|log)$/i.test(file.name)) {
    window.__pendingFile = file;
    if (current() === "text") document.dispatchEvent(new CustomEvent("trinket:file", { detail: file }));
    else navigate("text");
  } else {
    window.__pendingFile = file;
    navigate("hash");
  }
}

/* ── service worker / offline ───────────────────────────── */
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").then((reg) => {
    $("#foot-offline").hidden = false;
    reg.addEventListener("updatefound", () => {
      const w = reg.installing;
      w?.addEventListener("statechange", () => {
        if (w.state === "installed" && navigator.serviceWorker.controller) toast("update ready — reload to get it", "ok");
      });
    });
  }).catch(() => {});
}
window.addEventListener("online", () => toast("back online", "ok"));
window.addEventListener("offline", () => toast("offline — everything still works"));

/* ── PWA install prompt ─────────────────────────────────── */
let installEvt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  installEvt = e;
  defineCommand({ label: "Install as app", keywords: "pwa install desktop", icon: "⇩", run: () => installEvt?.prompt() });
});

/* ── go ─────────────────────────────────────────────────── */
startShortcuts();
startTooltips();
startRouter();
renderRail();
