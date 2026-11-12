// Spaces as rooms in a building, agents as the people in them: Claw'd, or the
// agent's own character drawn from Herdr's icons (see tools/occupants.py). The header
// shows the time of day (day from sunrise to sunset, by the clock) and the building (a
// press lists them: a school, an apartment, a hotel, a submarine, a rocket, a castle;
// looks.js draws each). A floor of windows per row of rooms, rooms with agents first
// and the most recently changed first within each; the rooms without agents sit under
// a plate that folds them away or shows them all. Through each window, a desk per
// agent with its occupant sitting at it, dressed for its status (hard hat and wrench
// while working, a hand up or a big "!" while it waits for you, confetti when done,
// a nightcap and a snot bubble while idle). At night a room whose occupants all sleep
// goes dark.
// The window's shoulder carries a warning (someone waits for you) or a check
// (someone finished). Resting the pointer on a window lists its occupants; a click
// goes to the space or the agent.
//
// The building is sized to the panel: its art shrinks in whole screen pixels, to half
// the usual size at most, and its columns change, so that it fits whole when it can.
//
// Cost: everything is still pictures. Every redraw of a mod redraws the whole window,
// so an occupant hops only for the first seconds after it starts working, in steps
// on a slow timer, then sits still; a building where nobody just started doesn't
// redraw the window.
// render reads spaces() and agents() once and builds the hovered roster only. Resizing
// the panel redraws only when the size or columns picked for it change.
import { View, div, svg, image } from "gpui-kit";
import { v_flex, h_flex, Popup } from "gpui-base";
import { spaces, agents, terminals, run, theme, settings, props, openOverlay, shared, setShared, layouts, window, nextCommand } from "herdr";
import { session } from "./session.js";
import { waitingSet, isWaiting, statusOf } from "./attention.js";
import { Menu, menuItems, blankItems, menuHeight, probe, probeBlank, MENU_WIDTH } from "./menu.js";
import { sunTimes } from "./sun.js";
import { BUILDING_LIST, TOWNS, skyline, townSky, look, BUILDINGS, rise, windowTop, windowSides, backdrop, windowUnder, rivets } from "./looks.js";

// What was picked when looks were stored by position.
const OLD_LOOKS = ["school", "school", "apartment", "hotel", "submarine", "rocket", "castle"];

// Where the sun is reckoned for: Tokyo on Japan time, else the time zone's meridian.
const ZONE = new Date().getTimezoneOffset();
const [LAT, LNG] = ZONE === -540 ? [35.68, 139.77] : [35, -ZONE / 4];
const clock = (ms) => { const d = new Date(ms); return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`; };

// A room narrower than this cuts its name plate short.
const MIN_TILE = 100;

// How long an occupant hops after it starts working.
const HOP_MS = 3000;

const LABEL = { working: "Working", blocked: "Needs you", done: "Done", idle: "Idle" };
const ORDER = { blocked: 0, done: 1, working: 2, idle: 3 };
const ACC = ["a", "b", "c", "d"];

const hash = (s) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
const pick = (list, key) => list[hash(key) % list.length];

// The program table's key first: its `match` folds names like "kiro-cli" and
// "cursor-agent" into one key, which the agent's own report alone would miss.
const BODIES = ["claude", "codex", "crush", "kiro", "pi", "gemini", "cursor", "opencode",
  "amp", "grok", "antigravity", "kimi", "qoder", "hermes"];
const ALIAS = new Map([["omp", "pi"], ["agy", "antigravity"]]);
function body(a) {
  const key = String(a.program?.key || "").toLowerCase();
  if (BODIES.includes(key)) return key;
  const k = String(a.app || key).toLowerCase();
  if (ALIAS.has(k)) return ALIAS.get(k);
  // "pi" only whole: as a prefix it would catch unrelated names.
  return BODIES.find((b) => b !== "pi" && k.startsWith(b)) ?? (k === "pi" ? "pi" : "other");
}
const status = (a) => a.status ?? "idle";

// The layout with the building on the other side: "<name>-top" across the window's top,
// "<name>" as a sidebar. Null when that layout isn't installed.
function otherLayout() {
  const name = String(shared("layout") ?? "");
  if (!name) return null;
  const other = name.endsWith("-top") ? name.slice(0, -4) : `${name}-top`;
  return layouts().includes(other) ? other : null;
}

// In the strip across the top the block drags the window (`window_drag`), so a press
// on anything that acts stops there.
const keep = (el) => el.on_mouse_down("left", (_e, cx) => cx.stop_propagation());
// The same agent keeps the same hat color.
const sprite = (a) => `mods/rooms/sprites/${body(a)}-${pick(ACC, a.address)}-${status(a)}.svg`;

// The name a person gave the tab first, else the session the agent is on, else its program.
function nameOf(a, tabs) {
  const tab = tabs.get(a.tab);
  if (tab?.named && tab.name) return tab.name;
  return session(a) || a.program?.name || a.app || "Agent";
}

export default class Rooms extends View {
  init(_props, cx) {
    // This mod also draws a room's right-click menu, as a popup.
    if (props()?.role === "menu") { this.part = new Menu(); this.part.init(cx); return; }
    // { strip: true }: the building across the window's top (layouts/rooms-top.json).
    this.strip = Boolean(props()?.strip);
    this.building = "school";
    try {
      const b = localStorage.getItem("building");
      this.building = BUILDING_LIST.some((x) => x.key === b) ? b : OLD_LOOKS[Number(localStorage.getItem("pattern") ?? 0) || 0] ?? "school";
    } catch {}
    this.folded = false;
    try { this.folded = localStorage.getItem("fold") === "1"; } catch {}
    this.town = "";
    try { const tw = localStorage.getItem("town"); if (TOWNS.some((x) => x.key === tw)) this.town = tw; } catch {}
    // Before shared values held them, each copy kept its own: the copy that has one seeds them.
    try {
      if (shared("rooms.building") == null && localStorage.getItem("building")) setShared("rooms.building", this.building);
      if (shared("rooms.fold") == null && localStorage.getItem("fold") != null) setShared("rooms.fold", this.folded);
      if (shared("rooms.town") == null && localStorage.getItem("town") != null) setShared("rooms.town", this.town);
    } catch {}
    // Day or night by the clock: checked once a minute, redrawn only when it turns.
    this.time = this.timeNow();
    cx.timer.every(60000, (cx) => { const now = this.timeNow(); if (now !== this.time) { this.time = now; cx.notify(); } });
    // The building list under its label: open while the pointer is on either.
    this.picking = false;
    this.overPick = false;
    this.overList = false;
    // The panel's size, and the art size and columns picked for it (see fit).
    this.box = null;
    this.fitIn = null;
    this.fitted = null;
    // The roster shown: only the hovered room's is built.
    this.open = null;
    this.overTile = null;
    this.overCard = false;
    // An occupant who starts working hops in steps, about 3 a second, for HOP_MS,
    // then sits still. A native loop would redraw the whole window about 30 times
    // a second, and even 3 steps a second cost as much as everything else idle.
    this.step = 0;
    this.busy = false;
    // When each working agent started; the ones already working at the first render don't hop.
    this.started = null;
    this.hopping = () => false;
    cx.timer.every(320, (cx) => { if (this.busy) { this.step ^= 1; cx.notify(); } });
    // Commands for keys.json ("rooms.next-building", "rooms.next-town", "rooms.toggle-empty",
    // "rooms.toggle-place") and `herdr-app do`.
    cx.spawn(async (cx) => {
      for (;;) {
        const c = await nextCommand();
        if (c === "next-town") {
          const i = TOWNS.findIndex((x) => x.key === this.town);
          this.setTown(TOWNS[(i + 1) % TOWNS.length].key);
        } else if (c === "next-building") {
          const i = BUILDING_LIST.findIndex((b) => b.key === this.building);
          this.setBuilding(BUILDING_LIST[(i + 1) % BUILDING_LIST.length].key);
        } else if (c === "toggle-empty") {
          this.setFolded(!this.folded);
        } else if (c === "toggle-place") {
          const other = otherLayout();
          if (other) run("layout.switch", { name: other });
        }
        cx.notify();
      }
    });
  }

  // Kept in shared values too: localStorage is per props, and the sidebar and the strip
  // across the top (props { strip }) should show the same building.
  setBuilding(building) {
    this.building = building;
    setShared("rooms.building", building);
    try { localStorage.setItem("building", building); } catch {}
  }

  setTown(town) {
    this.town = town;
    setShared("rooms.town", town);
    try { localStorage.setItem("town", town); } catch {}
  }

  setFolded(folded) {
    this.folded = folded;
    setShared("rooms.fold", folded);
    try { localStorage.setItem("fold", folded ? "1" : "0"); } catch {}
  }

  // What the other copy picked since this one started.
  follow() {
    const b = shared("rooms.building"), f = shared("rooms.fold"), tw = shared("rooms.town");
    if (BUILDING_LIST.some((x) => x.key === b)) this.building = b;
    if (TOWNS.some((x) => x.key === tw)) this.town = tw;
    if (typeof f === "boolean") this.folded = f;
  }

  // The plate over the rooms without agents: a press folds them away or shows them.
  // While folded it is outlined if the space you are in is among them.
  foldPlate(empty, p, t) {
    const here = this.folded && empty.some((s) => s.active);
    return keep(h_flex().id("fold")).h(17).px(6).gap(4).items_center().cursor_pointer()
      .bg(p.plate).border(1).border_color(here ? t.accent : p.ink)
      .text_size(10.5).font_semibold().text_color(p.ink).hover((st) => st.opacity(0.85))
      .on_click((_e, cx) => { this.setFolded(!this.folded); cx.notify(); })
      .child(svg(`mods/workspace-chrome/chevron-${this.folded ? "right" : "down"}.svg`).size(10).text_color(p.ink))
      .child(`Empty ${empty.length}`);
  }

  // The art's pixel size (k screen pixels on a 2x screen) and the columns for a panel:
  // the largest k from the usual one down to half of it at which the building fits,
  // with the usual columns if they fit, else more (no narrower than a name plate
  // needs), else fewer. If none fits, the smallest k and the lowest building; it scrolls.
  // Heights are counted as render draws them: art pixels from looks.js, and the
  // name plates (17), each floor's padding and the gaps around a room. The panel is
  // measured zoomed and the building is drawn before the zoom, so the panel is
  // divided by it; the usual columns still count the zoomed width, as they always have.
  // Rooms without agents count only by their plate: shown, they run on below and
  // scroll, so opening them never shrinks the art.
  fit(inp, box) {
    const { full, empty, inset, h, z } = inp;
    const Wz = box?.width ?? 268, W = Wz / z, H = (box?.height ?? Infinity) / z - 2;
    const kDef = Math.max(2, Math.round(3.2 * z)), kMin = Math.max(2, Math.ceil(kDef / 2));
    const colsDef = Math.max(1, Math.floor(Wz / 125));
    let best = null;
    // Across the top the band is short and wide: the art may grow past the usual size to fill it.
    const kTop = this.strip ? Math.round(kDef * 1.5) : kDef;
    for (let k = kTop; k >= kMin; k--) {
      const u = k / (2 * z), side = 8 + inset * u + 7 * u, gap = 5 * u;
      const colsHi = Math.max(colsDef, Math.floor((W - 2 * side + gap) / (MIN_TILE + gap)));
      const order = [colsDef];
      for (let c = colsDef + 1; c <= colsHi; c++) order.push(c);
      for (let c = colsDef - 1; c >= 1; c--) order.push(c);
      for (const cols of order) {
        const tileW = (W - 2 * side - (cols - 1) * gap) / cols;
        const perRow = Math.max(1, Math.floor((tileW - 10 * u) / (23 * u)));
        const floor = (n) => 17 + u * (22 + h.win + 18 * Math.max(1, Math.ceil(n / perRow)) + h.ledge);
        let total = 10 + u * (h.crown + h.base);
        for (let i = 0; i < full.length; i += cols) total += floor(Math.max(...full.slice(i, i + cols)));
        if (empty > 0) total += 17 + u * (6 + h.ledge);
        const f = { k, u, cols, perRow, total };
        if (total <= H) return f;
        if (k === kMin && (!best || total < best.total)) best = f;
      }
    }
    return best;
  }

  // The panel was resized: redraw only if it changes the art size or the columns.
  resized(size, cx) {
    const was = this.box;
    if (was && Math.abs(size.width - was.width) < 1 && Math.abs(size.height - was.height) < 1) return;
    this.box = { width: size.width, height: size.height };
    if (!this.fitIn) return;
    const f = this.fit(this.fitIn, this.box), now = this.fitted;
    if (!now || f.k !== now.k || f.cols !== now.cols || f.perRow !== now.perRow) cx.notify();
  }

  timeNow() {
    const now = Date.now();
    this.sun = sunTimes(now, LAT, LNG);
    return now >= this.sun[0] && now < this.sun[1] ? "day" : "night";
  }

  // When each space last changed. Herdr knows only changes since it started (a tab's
  // changed_at), so the latest seen is kept here and survives a restart; it is
  // written only when a space has changed again.
  remember(sp) {
    if (!this.seen) {
      this.seen = {};
      try { this.seen = JSON.parse(localStorage.getItem("changed") ?? "{}") || {}; } catch {}
    }
    let moved = false;
    for (const s of sp) {
      const at = Math.max(0, ...s.tabs.map((tb) => tb.changed_at ?? 0));
      if (at > (this.seen[s.id] ?? 0)) { this.seen[s.id] = at; moved = true; }
    }
    if (moved) {
      const live = new Set(sp.map((s) => s.id));
      for (const id of Object.keys(this.seen)) if (!live.has(id)) delete this.seen[id];
      try { localStorage.setItem("changed", JSON.stringify(this.seen)); } catch {}
    }
    return (s) => this.seen[s.id] ?? 0;
  }

  closePickSoon(cx) {
    cx.timer.after(300, (cx) => {
      if (this.picking && !this.overPick && !this.overList) { this.picking = false; cx.notify(); }
    });
  }

  // Day/Night follows the clock; the building opens a list under it; + makes a space;
  // the last button moves the building to the window's top or back to the side.
  controls(t) {
    const label = (id) => keep(h_flex().id(id)).h(20).px(6).gap(5).items_center().rounded(5).cursor_pointer()
      .text_size(11).text_color(t.muted).hover((st) => st.bg(t.hover).text_color(t.foreground));
    const button = (id, icon, tip, action) => keep(h_flex().id(id)).size(20).flex_none().items_center().justify_center().rounded(5)
      .cursor_pointer().text_color(t.muted).hover((st) => st.bg(t.hover).text_color(t.foreground))
      .tooltip(tip).on_click(action).child(svg(icon).size(13));
    const other = otherLayout();
    const time = h_flex().id("time").h(20).px(6).gap(5).items_center().text_size(11).text_color(t.dim)
      .tooltip(`Sunrise ${clock(this.sun[0])} · Sunset ${clock(this.sun[1])}`)
      .child(svg(`mods/rooms/icons/time-${this.time}.svg`).size(11)).child(this.time === "night" ? "Night" : "Day");
    const town = this.town ? TOWNS.find((x) => x.key === this.town)?.name : "";
    const name = (BUILDING_LIST.find((b) => b.key === this.building)?.name ?? "") + (town ? ` · ${town}` : "");
    const trigger = label("building").when(this.picking, (el) => el.bg(t.selected).text_color(t.foreground))
      .on_hover((h, cx) => { this.overPick = h; if (!h) this.closePickSoon(cx); })
      .on_click((_e, cx) => { this.picking = !this.picking; cx.notify(); })
      .child(name).child(svg("mods/workspace-chrome/chevron-down.svg").size(11));
    // The buildings, then the towns they can stand in.
    const item = (id, label, on, pickIt) => h_flex().id(id).h(26).px(8).gap(6).items_center().rounded(5).cursor_pointer()
      .text_size(12).text_color(t.foreground).hover((st) => st.bg(t.hover))
      .on_click((_e, cx) => { pickIt(); this.picking = false; cx.notify(); })
      .child(div().flex_1().child(label))
      .when(on, (el) => el.child(svg("mods/workspace-chrome/check.svg").size(12).text_color(t.accent)));
    const list = keep(v_flex().id("building-list")).w(150).p(4).gap(1).bg(t.popover).rounded(8).border(1).border_color(t.border)
      .on_hover((h, cx) => { this.overList = h; if (!h) this.closePickSoon(cx); })
      .children(BUILDING_LIST.map((b) => item(`building-${b.key}`, b.name, b.key === this.building, () => this.setBuilding(b.key))))
      .child(div().mx(6).my(3).h(1).bg(t.border))
      .child(div().px(8).h(18).text_size(10.5).text_color(t.dim).child("Town"))
      .children(TOWNS.map((x) => item(`town-${x.key || "none"}`, x.name, x.key === this.town, () => this.setTown(x.key))));
    return h_flex().gap(2).items_center()
      .child(time)
      .child(Popup.new("building-pop", trigger).anchor("top_right").when(this.picking, (el) => el.content(list)))
      .child(button("new-space", "mods/workspace-chrome/plus.svg", "New space", () => run("space.new")))
      .when(Boolean(other), (el) => el.child(this.strip
        ? button("to-side", "mods/workspace-chrome/sidebar.svg", "Building in the sidebar", () => run("layout.switch", { name: other }))
        : button("to-top", "mods/rooms/icons/panel-top.svg", "Building across the top", () => run("layout.switch", { name: other }))));
  }

  // The menu between the rooms: a new space, empty or with an agent.
  openBlankMenu(cx) {
    this.open = null;
    cx.notify();
    cx.spawn(async () => {
      const info = await probeBlank();
      openOverlay({ mod: "rooms", kind: "popup", width: MENU_WIDTH, height: menuHeight(blankItems(info)), props: { role: "menu", info } });
    });
  }

  // A short rest opens a roster; leaving both window and roster closes it, after a
  // moment so the pointer can cross from one to the other.
  enter(id, cx) {
    this.overTile = id;
    if (this.quiet === id) return;
    cx.timer.after(220, (cx) => { if (this.overTile === id && this.open !== id && this.quiet !== id) { this.open = id; cx.notify(); } });
  }
  leave(id, cx) {
    if (this.overTile === id) this.overTile = null;
    if (this.quiet === id) this.quiet = null;
    this.closeSoon(cx);
  }
  closeSoon(cx) {
    cx.timer.after(260, (cx) => {
      if (this.open && !this.overCard && this.overTile !== this.open) { this.open = null; cx.notify(); }
    });
  }

  // The right-click menu: what it offers is looked up first, as its height depends on it.
  // No roster over the menu: none opens on this room until the pointer leaves it.
  openMenu(s, cx) {
    this.open = null;
    this.quiet = s.id;
    cx.notify();
    cx.spawn(async () => {
      const info = await probe(s);
      openOverlay({ mod: "rooms", kind: "popup", width: MENU_WIDTH, height: menuHeight(menuItems(s, info)), props: { role: "menu", space: s.id, info } });
    });
  }

  // A shoulder badge: warning if anyone waits for you, else a check if anyone finished.
  // Waiting includes what another mod publishes as attention.waiting (attention.js), when it does.
  badge(list, t) {
    const waits = list.some((a) => isWaiting(a, this.wait));
    const done = list.some((a) => a.status === "done");
    if (!waits && !done) return null;
    return h_flex().absolute().top(-9).right(-9).size(20).rounded(10).items_center().justify_center()
      .bg(waits ? t.blocked : t.done).border(2).border_color(t.chrome)
      .child(svg(`mods/rooms/icons/${waits ? "warn" : "check"}.svg`).size(12).text_color("#ffffff"));
  }

  // An occupant at the building's furniture (looks.js `seat`), which hides it below
  // the shoulders: a desk, a sofa, a bed's quilt, a low table or a bath.
  // A working one hops between two spots on each step of the timer (see init).
  seat(a, p, c, dim) {
    const { u } = this;
    const kid = image(sprite(a, p)).w(19 * u).h(15 * u).when(dim, (el) => el.opacity(0.8));
    const hop = this.hopping(a) ? (this.step ? 1 : -1) : 0;
    const box = (top, left, w, h, bg) => div().absolute().top(top * u).left(left * u).w(w * u).h(h * u).bg(bg);
    const out = div().relative().w(22 * u).h(17 * u).flex_none()
      .child(div().absolute().top(hop > 0 ? -2 * u : 0).left(1.5 * u + hop * u).child(kid));
    switch (p.seat) {
      case "sofa":
        return out.child(box(10, 1, 3, 7, p.desk)).child(box(10, 18, 3, 7, p.desk))
          .child(box(11, 4, 14, 3, p.deskTop)).child(box(14, 1, 20, 2, p.desk))
          .child(box(16, 3, 1, 1, p.leg)).child(box(16, 18, 1, 1, p.leg));
      case "bed":
        return out.child(box(10, 1, 20, 7, p.deskTop)).child(box(10, 1, 20, 1, p.desk)).child(box(13, 1, 20, 1, p.desk))
          .child(box(16, 0, 22, 1, p.leg));
      case "low":
        return out.child(box(12, 2, 18, 5, p.cushion)).child(box(13, 4, 14, 1.5, p.deskTop))
          .child(box(14.5, 5, 12, 1, p.desk)).child(box(15.5, 6, 1, 1.5, p.leg)).child(box(15.5, 15, 1, 1.5, p.leg))
          .child(box(12, 13, 2, 1, p.cup));
      case "tub":
        return out.child(box(10.5, 1, 20, 1.5, p.water)).child(box(12, 1, 20, 5, p.water).opacity(0.85))
          .child(box(10, 0, 1.5, 7, p.deskTop)).child(box(10, 20.5, 1.5, 7, p.deskTop))
          .child(box(16, 0, 22, 1, p.desk)).child(box(13, 1.5, 19, 0.5, p.desk));
      default:
        return out
          .child(box(11, 2.5, 17, 2, p.deskTop)).child(box(13, 3.5, 15, 2, p.desk))
          .child(box(15, 4, 1, 2, p.leg)).child(box(15, 17, 1, 2, p.leg))
          .when(Boolean(p.win.lights), (el) => el.child(box(13.5, 7, 1, 1, p.lights[0])).child(box(13.5, 10, 1, 1, p.lights[1])));
    }
  }

  // A room: its name plate over a window dressed by the building (looks.js), its
  // occupants at their desks inside.
  tile(s, list, tabs, p, t, roomH) {
    const { u } = this, w = p.win;
    const lit = !p.off || list.some((a) => status(a) !== "idle");
    const c = lit ? p : { ...p, ...p.off };
    const plate = h_flex().justify_center()
      .child(div().max_w_full().px(6).h(17).flex().items_center().bg(p.plate).border(1).border_color(p.ink)
        .text_size(10.5).font_semibold().text_color(p.ink).truncate().child(s.name || "—"));
    const room = h_flex().relative().w_full().h(roomH).bg(c.glass)
      .when(Boolean(w.round), (el) => el.rounded((w.round - 1.5) * u).overflow_hidden())
      .when(Boolean(w.prop), (el) => el.child(backdrop(w.prop, c, u)))
      .child(h_flex().w_full().h_full().flex_wrap().content_end().justify_center().items_end().gap(u).px(4 * u).pb(u)
        .when(list.length === 0, (el) => el.child(h_flex().gap(4 * u).pb(u)
          .child(div().w(17 * u).h(2 * u).bg(p.deskTop).opacity(0.7)).child(div().w(17 * u).h(2 * u).bg(p.deskTop).opacity(0.7))))
        .children(list.map((a) => this.seat(a, p, c, !lit))))
      .children(windowSides(w.side, c, u));
    const on = s.active || this.open === s.id;
    const head = windowTop(w.top, c, u);
    const frame = v_flex().relative().w_full().gap(u).p(1.5 * u).bg(on ? t.accent : p.frame)
      .when(Boolean(w.round), (el) => el.rounded(w.round * u))
      .when(Boolean(head), (el) => el.child(head))
      .child(room)
      .when(Boolean(w.rivets), (el) => el.children(rivets(p, u)));
    const b = this.badge(list, t);
    const under = windowUnder(w.under, c, u, hash(s.id) % 3 === 0);
    const trigger = keep(v_flex().id(`room-${s.id}`)).relative().w_full().gap(2 * u).cursor_pointer()
      .on_hover((h, cx) => (h ? this.enter(s.id, cx) : this.leave(s.id, cx)))
      .on_click(() => run("space.select", { id: s.id }))
      // Stopped here: between the rooms a right-click opens the building's menu instead.
      .on_mouse_down("right", (_e, cx) => { cx.stop_propagation(); this.openMenu(s, cx); })
      .child(plate)
      .child(v_flex().w_full().child(b ? frame.child(b) : frame).when(Boolean(under), (el) => el.child(under)));
    return Popup.new(`pop-${s.id}`, trigger).anchor("top_left")
      .when(this.open === s.id, (el) => el.content(this.roster(s, list, tabs, p, t)));
  }

  roster(s, list, tabs, p, t) {
    const head = h_flex().gap(6).items_center().pb(6).border_b(1).border_color(t.border)
      .child(div().flex_1().min_w(0).truncate().text_size(12.5).font_semibold().text_color(t.foreground).child(s.name || "—"))
      .when(Boolean(s.branch), (el) => el.child(div().max_w(120).truncate().text_size(11).text_color(t.dim).child(s.branch)));
    const row = (a) => keep(h_flex().id(`st-${a.address}`)).py(4).px(6).gap(8).items_center().rounded(6).cursor_pointer()
      .hover((st) => st.bg(t.hover))
      .on_click(() => run("pane.focus", { pane: a.pane }))
      .child(image(sprite(a, p)).w(19 * this.uDef).h(15 * this.uDef).flex_none())
      .child(div().flex_1().min_w(0).truncate().text_size(12).text_color(t.foreground).child(nameOf(a, tabs)))
      .child(div().flex_none().text_size(10.5).font_semibold().text_color(t[status(a)] ?? t.dim).child(LABEL[status(a)]));
    return v_flex().id(`roster-${s.id}`).w(280).p(8).gap(2).bg(t.popover).rounded(10).border(1).border_color(t.border)
      .on_hover((h, cx) => { this.overCard = h; if (!h) this.closeSoon(cx); })
      .child(head)
      .when(list.length === 0, (el) => el.child(div().py(6).text_size(11.5).text_color(t.dim).child("No agents")))
      .children(list.map(row));
  }

  render(cx) {
    if (this.part) return this.part.render(cx);
    this.follow();
    const t = theme(), p = look(this.building, this.time, this.town), house = BUILDINGS[p.kind];
    // One pixel of the art is a whole number of screen pixels (4 on a 2x screen at the
    // usual size), so it stays crisp. The roster keeps the usual size.
    const z = settings()?.zoom ?? 1;
    this.uDef = Math.max(2, Math.round(3.2 * z)) / (z * 2);
    // One read of each per render: these copy every space and agent.
    const sp = spaces(), ag = agents();
    // Who waits for you: Herdr's blocked, plus attention.waiting when a mod publishes it
    // (terminals() is read only then, to drop entries left from an earlier turn).
    const published = shared("attention.waiting");
    this.wait = Array.isArray(published) ? waitingSet(published, terminals()) : null;
    const tabs = new Map(sp.flatMap((s) => s.tabs.map((tb) => [tb.id, tb])));
    const by = new Map(sp.map((s) => [s.id, []]));
    for (const a of ag) by.get(a.space)?.push(a);
    for (const list of by.values()) list.sort((x, y) => (ORDER[status(x)] ?? 9) - (ORDER[status(y)] ?? 9) || (y.seq ?? 0) - (x.seq ?? 0));
    // Rooms with agents first, then empty ones; within each, the most recently
    // changed first, then the agents' order of change, then the spaces' order.
    const filled = (s) => (by.get(s.id).length > 0 ? 1 : 0);
    const changed = this.remember(sp);
    const recent = (s) => Math.max(0, ...by.get(s.id).map((a) => a.seq ?? 0));
    const rooms = [...sp].sort((x, y) => filled(y) - filled(x) || changed(y) - changed(x) || recent(y) - recent(x) || x.index - y.index);
    const count = { blocked: 0, done: 0, working: 0, idle: 0 };
    for (const a of ag) count[statusOf(a, this.wait)] += 1;
    const now = Date.now(), was = this.started;
    this.started = new Map();
    for (const a of ag) if (status(a) === "working") this.started.set(a.address, was ? (was.get(a.address) ?? now) : 0);
    this.hopping = (a) => status(a) === "working" && now - (this.started.get(a.address) ?? 0) < HOP_MS;
    this.busy = ag.some(this.hopping);

    // A floor per row of windows (about one per 125 pixels of width, see fit); the
    // windows of a floor share the height of its fullest room.
    const full = rooms.filter((s) => filled(s));
    const empty = rooms.slice(full.length);
    this.fitIn = { full: full.map((s) => by.get(s.id).length), empty: empty.length, inset: house.inset, h: rise(p), z };
    this.fitted = this.fit(this.fitIn, this.box);
    const { cols, perRow } = this.fitted;
    this.u = this.fitted.u;
    const { u } = this;
    const ins = house.inset * u, gap = 5 * u;
    const height = (n) => { const r = Math.max(1, Math.ceil(n / perRow)); return 8 * u + r * 17 * u + (r - 1) * u + u; };
    const floorsOf = (list) => { const out = []; for (let i = 0; i < list.length; i += cols) out.push(list.slice(i, i + cols)); return out; };
    const storey = (id, inner) => v_flex().id(id).w_full()
      .child(h_flex().w_full().px(ins).child(v_flex().flex_1().min_w(0).bg(p.wall).border_l(2 * u).border_r(2 * u).border_color(p.edge).child(inner)))
      .child(house.ledge(p, u, ins));
    const floor = (id, r) => {
      const roomH = Math.max(...r.map((s) => height(by.get(s.id).length)));
      return storey(id, h_flex().w_full().px(5 * u).pt(5 * u).pb(4 * u).gap(gap).items_start().children([
        ...r.map((s) => div().flex_1().min_w(0).child(this.tile(s, by.get(s.id), tabs, p, t, roomH))),
        ...Array.from({ length: cols - r.length }, () => div().flex_1().min_w(0)),
      ]));
    };
    const wall = v_flex().w_full()
      .children(floorsOf(full).map((r, i) => floor(`floor-${i}`, r)))
      .when(empty.length > 0, (el) => el.child(storey("fold-floor", h_flex().w_full().justify_center().py(3 * u).child(this.foldPlate(empty, p, t)))))
      .when(empty.length > 0 && !this.folded, (el) => el.children(floorsOf(empty).map((r, i) => floor(`empty-${i}`, r))));

    // The counts, then the controls; they go under the counts when the sidebar is narrow.
    // Across the top, the header starts right of the macOS traffic lights.
    const w = window();
    const lights = this.strip && w?.platform === "macos" && !w?.fullscreen;
    const header = h_flex().flex_wrap().justify_between().px(12).when(lights, (el) => el.pl(76)).pt(8).pb(6).gap_x(12).gap_y(4).items_center()
      .child(h_flex().h(20).gap(10).text_size(10.5).text_color(t.dim)
        .children(["blocked", "done", "working", "idle"].map((k) =>
          h_flex().gap(4).items_center().child(div().size(6).rounded(3).bg(t[k] ?? t.dim)).child(`${LABEL[k]} ${count[k]}`))))
      .child(this.controls(t));

    return v_flex().id("root").size_full().min_h(0).min_w(0)
      .child(header)
      .child(v_flex().id("building").flex_1().min_h(0).overflow_y_scrollbar()
        .on_size_change((size, cx) => this.resized(size, cx))
        .on_mouse_down("right", (_e, cx) => this.openBlankMenu(cx))
        .child(v_flex().w_full().px(8).pb(10).when(Boolean(p.town), (el) => el.child(skyline(p, u, (this.box?.width ?? 268) / z)))
          .child(p.town ? v_flex().w_full().bg(townSky(p)[1]).child(house.crown(p, u, ins)) : house.crown(p, u, ins)).child(wall).child(house.base(p, u, ins))));
  }
}
