import { h, defineTool, tools, groups, navigate, favorites, recents, getGroup, isFav, openPalette, store, btn, rememberedPart } from "../core.js";

defineTool({
  id: "home", name: "Home", icon: "⌂", cat: "misc", desc: "",
  mount(root) {
    const open = (g, part) => navigate(g.id, { part: (part || rememberedPart(g)).id });
    const card = (g, i) => h("button.home-card", { type: "button", onclick: () => open(g) },
      h("span.hc-idx", { text: String(i + 1).padStart(2, "0") }),
      h("span.hc-icon", { text: g.icon }),
      h("span.hc-name", { text: g.name }),
      h("span.hc-desc", { text: g.desc }),
      g.parts.length > 1
        ? h("span.hc-parts", g.parts.map((p) => h("span.hc-part", {
            text: p.tab, "data-tip": p.desc, "data-tip-side": "bottom",
            onclick(e) { e.stopPropagation(); open(g, p); },
          })))
        : null,
      isFav(g.id) ? h("span.hc-fav", { text: "★" }) : null);

    const all = groups.filter((g) => g.id !== "home");
    const toolCount = tools.length - 1;
    const favs = favorites().map(getGroup).filter(Boolean);
    const rec = recents().map(getGroup).filter(Boolean).slice(0, 6);
    const notes = store.get("notes", []);
    const tasks = store.get("tasks", []);
    const openTasks = tasks.filter((t) => !t.done).length;

    const hero = h("section.card", { style: { marginBottom: "18px" } },
      h("div.card-body",
        h("div.row", { style: { justifyContent: "space-between", alignItems: "flex-start" } },
          h("div",
            h("h2", { style: { margin: "0 0 6px", fontFamily: "var(--mono)", letterSpacing: ".08em", fontSize: "22px", color: "var(--text-hi)" } },
              `${all.length} tools · ${toolCount} jobs · zero uploads.`),
            h("p", { style: { margin: 0, color: "var(--muted)", maxWidth: "58ch", lineHeight: 1.6 } },
              "Each tool bundles related jobs as tabs — hover anything for a one-line explanation. Everything runs inside this tab, works offline, and remembers your inputs.")),
          h("div.col", { style: { alignItems: "flex-end", gap: "8px" } },
            btn("⌕  search everything   ⌘K", () => openPalette(), "primary"),
            h("div.row.tight",
              h("span.chip", { text: `${favs.length} pinned` }),
              h("span.chip", { text: `${notes.length} notes` }),
              h("span.chip", { text: `${openTasks} open tasks` }))))));

    const section = (title, items) => items.length
      ? h("div", { style: { marginBottom: "22px" } },
          h("div.rail-group", { style: { padding: 0, margin: "0 0 10px" }, text: title }),
          h("div.home-grid", items.map((g) => card(g, all.indexOf(g)))))
      : null;

    root.append(...[hero, section("★ pinned", favs), section("recent", rec), section("all tools", all)].filter(Boolean));
  },
});
