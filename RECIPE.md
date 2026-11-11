# Rooms

Your spaces become the rooms of a pixel-art building in the sidebar, and your
agents are the people in them. Each room is a window with a desk per agent;
the occupant at the desk is dressed for its status: a hard hat and a wrench
while it works, a raised hand or a big red "!" while it waits for you,
confetti when it is done, a starry nightcap and a snot bubble while it is
idle. Under the building sits a calmer agents list, and the rest of the window
is Herdr's own workspace (tabs, framed panes, Files and Changes panels, a
status bar). You pick the building (a school, an office, an apartment, a
hotel, a submarine, a rocket, a castle, a ryokan or a sento), optionally a
town skyline over its roof, and it turns to night after sunset.

![rooms](preview.png)

## What you see

Left to right: a sidebar 268px wide, then the work column. A 1px divider in
the theme's `border` color between them. The title bar is hidden and on
macOS the traffic lights sit at 12, 16.

**Sidebar** (top to bottom):

1. **Brand strip**, 46px, Herdr's `workspace-chrome` mod; dragging it moves
   the window.
2. **The building** (`rooms` mod) and **the agents list** (`agents-calm`
   mod), sharing the rest equally (weight 1 each, at least 90px each).
3. **Footer**, 69px, `workspace-chrome` as a footer.

**The building** (`rooms`):

- A header row, 12px side padding, 8px above and 6px below, wrapping onto two
  lines when narrow. On the left, four counts in 10.5px text in the theme's
  `dim` color, each after a 6px dot in the status color (`blocked`, `done`,
  `working`, `idle` from the theme): `Needs you 0`, `Done 0`, `Working 0`,
  `Idle 0`. On the right, 20px-high controls in 11px text:
  - `Day` or `Night` with a small day or night icon; its tooltip is
    `Sunrise 6:12 · Sunset 16:41` (today's times).
  - The building's name, plus ` · <town>` when a town is picked (for example
    `School · Tokyo`), with a down chevron. It opens a 150px list: the nine
    buildings, a line, a `Town` heading and `No town`, `Tokyo`, `Kyoto`,
    `Osaka`, `Mt. Fuji`. The current choices carry a check in the accent color.
  - A 20px `+` button, tooltip `New space`.
- Under the header, the building, scrolling vertically when it doesn't fit,
  8px side padding and 10px at the bottom. From top to bottom:
  - With a town: a band 64 art pixels high, the town's sky fading from a top
    color to a horizon color (Tokyo by day `#7cc4f2` to `#cfeaf8`, by night
    `#1b1f4a` to `#46306e`; Kyoto `#f3b88f`/`#fbe1c4` and `#1d2340`/`#4a3456`;
    Osaka `#89d0f0`/`#e3f4fb` and `#1a1d3d`/`#5a2850`; Mt. Fuji
    `#6fb0ea`/`#d6ecfa` and `#14203f`/`#2c406e`), a far row of skyline, hills
    or lake repeated across the width, landmarks at both sides, nearer the
    middle and in the middle, and for some towns a train in front.
  - The roof (the building's crown), with two small sky pictures, one each
    side, drawn differently by day and by night.
  - One floor per row of rooms. A floor is the wall color between 2-art-pixel
    side edges, then the building's ledge.
  - When there are rooms without agents: a floor holding one plate,
    `Empty 3` with a chevron, and, unless folded, those rooms on more floors.
  - The ground floor (the building's base): doors, steps and ground.
- **A room**: a name plate (17px high, 10.5px semibold, the building's plate
  color with a 1px ink border, the space's name or `—`, cut short with an
  ellipsis) over a window. The window has a frame (1.5 art pixels, the
  building's frame color; the theme's accent while it is the space you are in
  or its roster is open), maybe dressing above the glass, the glass, things on
  the far wall, curtains at the sides and something under the sill. Inside
  sit the occupants, one seat each, side by side, wrapping into rows; an empty
  room shows two bare desks at 0.7 opacity. All windows on one floor share
  the height of the fullest room.
- **A shoulder badge** at the window's top right corner (9px out), a 20px
  circle with a 2px border in the theme's `chrome` color and a white 12px
  icon: a warning on the theme's `blocked` color if anyone in the room waits
  for you, else a check on the theme's `done` color if anyone finished, else
  nothing.

The buildings, each with its own day colors (night colors are made by
mixing each color 55% toward navy `#1d2140`, while a lit room keeps warm
glass colors and a dark one goes 82% toward navy; the school's night is drawn
by hand):

| Building | Window | Seat | Wall / frame / glass (day) |
|---|---|---|---|
| School | three transom panes, curtains, a sill, a green board on the wall; a clock tower on a stepped red roof | desk | `#e8dcc4` / `#f6f6f2` / `#b7d7ea` |
| Office | blinds, a bar chart on the wall | desk | `#5f7f99` / `#d9e1e8` / `#e8f1f7` |
| Apartment | a shutter, curtains, a balcony (about one room in three airs a pink futon), a TV | sofa | `#c98b6b` / `#d5d9dd` / `#d9ecf5` |
| Hotel | a red valance and tied-back drapes, a planter, a painting; a starred sign | bed | `#7c2f3b` / `#f1e6cf` / `#d6e8f0` |
| Submarine | a round porthole with four rivets, pipes and a gauge, red and green lights | desk | `#4d6170` / `#c99a3a` / `#bfe3d6` |
| Rocket | a round window, three screens, red and green lights; fins, nozzle and flame below | desk | `#eef1f5` / `#8d99a6` / `#dce8f6` |
| Castle | a lattice, shoji, a hanging scroll; a stone base and moat | low table on a cushion | `#f4f0e6` / `#3b2a1e` / `#efe2c0` |
| Ryokan | sudare blinds, shoji, a wooden railing, ikebana; lanterns | low table on a cushion | `#efe5d0` / `#5a3b26` / `#f1e4c4` |
| Sento | three transom panes, a sill, a Mount Fuji mural; a ♨ sign | bath | `#e9dfca` / `#6b4a2e` / `#d8eef0` |

**The agents list** (`agents-calm`): the theme's `chrome` background with a
1px top border. A header 41px high, 16px padding: `Agents` (11.5px, `dim`)
and a sort icon on the right. Then rows in 13px text, 30px high, 8px
padding, 8px radius: the agent's program icon (16px), its name, its time in
its current state (`<1m`, `12m`, `3h`, `2d`, 11px `dim`), and its status:
a spinner (working), a `Needs you` pill (blocked; tinted `blocked` at 15%
alpha; in the Priority view, where the section header already says it, a
14px `!` box instead), a filled 7px dot (done) or a 7px ring (idle). The focused agent's row
has the theme's `selected` background. Group headers are 30px, 11px medium.
Sub-agents sit under their parent in 26px rows indented 39px, with tree
lines drawn in the theme's `input` color. With no agents:
`No agent status yet. Agents show up here when they report their status. Older versions and agents inside tmux may not.`

**The work column** (top to bottom):

1. **Tabs**, 42px (`tabs-graph` mod), dragging it moves the window. Tabs as
   29px pills, 12.8px text, 7px radius; the active one raised with a border
   and a close `x`. Each shows its program's icon, its name (an automatic
   `tbN` name shows the program's name or `Terminal`), ` Z` when zoomed, a
   spinner while working and a 6px dot when blocked or done. On the right:
   a `+` button, then `Files` and `Changes` buttons (`Graph` too, see Watch
   out), and on platforms that draw their own window buttons `−`, `□` and
   a close icon.
2. **Body**, a row with 4px padding and 4px gap:
   - **Panes**, the active tab, framed: 10px radius, 4px gap, a 1px border
     in `border`, 1px `accent` when focused, a transparent background, and a
     single pane is framed too (`"lone": true`). Each pane has a 30px header
     on top, always shown (`pane-calm` mod): the program icon (14px), the
     agent's or terminal's name (medium, at most 260px), the folder with home
     as `~` (`dim`), and the status (spinner, `Needs you` pill, or a 7px
     `done` dot). Hovering it shows four 14px buttons: split right, split
     down, zoom (or unzoom) and close.
   - **Panel**, 368px (280 to 900), hidden at first: a stack of Herdr's
     `files` and `changes` mods, `files` on top.
3. **Status bar**, 28px, Herdr's `workspace-status` mod.

Terminals have `terminal_padding` `[14, 12]` and full opacity.

## How it behaves

**Statuses** in the building (an agent with no status counts as idle):

| Status | Header label | Occupant | Room |
|---|---|---|---|
| working | `Working` | hard hat (one of four colors) and a wrench, a drop of sweat; hops for the first 3 seconds after it starts working | lit |
| blocked | `Needs you` | Claw'd raises its right hand and looks up; the others look up; a red `!` beside it | warning badge |
| done | `Done` | Claw'd throws both arms up; happy `^ ^` eyes, blush, confetti | check badge (if no one waits) |
| idle | `Idle` | closed eyes, a starry pointed nightcap, `Z`, a snot bubble | at night, a room where everyone is idle goes dark and its occupants dim to 0.8 opacity |

- The same agent always wears the same hat color (picked from four by a hash
  of its address).
- A hop: the occupant moves one art pixel left and right and two up on every
  step of a 320ms timer, for 3000ms after it turns to working. Agents already
  working when the mod starts don't hop. Nothing else moves; while nobody
  hops, the building doesn't redraw on a timer.
- **Order.** Rooms with agents come first, then empty rooms. Within each, the
  space that changed most recently first (remembered across restarts), then
  its agents' order of change, then the spaces' own order. Inside a room:
  blocked, done, working, idle, newest first.
- **Day and night** follow the clock: day from sunrise to sunset, checked
  once a minute. Sunrise and sunset are computed for Tokyo when the time zone
  is UTC+9, else for latitude 35° at the time zone's meridian.
- **Size.** The art is drawn in whole screen pixels so it stays crisp: at
  zoom 1 one art pixel is 1.5px (3 device pixels on a 2x screen), and it may
  shrink to 1px (2 device pixels) to fit. Columns are about one per 125px of
  sidebar width (two at 268px); more columns are tried (no room narrower than
  100px) before the art shrinks, then fewer. If nothing fits, the smallest
  size and the shortest building are used and it scrolls. Empty rooms count
  only by their plate, so showing them never shrinks the art.
- **Pointer.**
  - Resting 220ms on a room opens its roster below it: a 280px card with the
    space's name (12.5px semibold), its git branch on the right (11px
    `dim`), then a row per occupant: its picture, its name (the tab's name if
    someone named the tab, else the session title its terminal shows, else
    its program), and its status word in the status color. Clicking a row
    focuses that agent's pane. `No agents` when empty. The roster closes 260ms
    after the pointer leaves both the room and the card.
  - Clicking a room selects that space (`space.select`).
  - Right-clicking a room opens a 240px menu (rows 31px, 12.8px text): `Go
    to space`; `Go to agent that needs you` and `Go to finished agent` when
    there is one; a line; `New tab with <agent>` (the first installed agent,
    in the space's folder) or `New agent tab`; `New terminal tab`; `New
    worktree` in a git checkout (opens Herdr's `worktree` dialog); for a
    local space with a folder, a line, `Open in Finder`, `Open in VS Code`,
    `Open on GitHub` (git only), `Copy path`; a line, `Rename`, and `Close`
    in the `blocked` color (Herdr asks before closing). Up and down move,
    Enter runs, Escape closes.
  - Right-clicking between the rooms opens `New space` and `New space with
    <agent>`.
  - The `Empty N` plate folds the empty rooms away or shows them. While
    folded, it is outlined in the accent color if the space you are in is
    among them.
  - The building list opens on click and closes 300ms after the pointer
    leaves both the label and the list. Building, town and fold are kept, and
    shared by every copy of the mod.
- **The agents list.**
  - The sort icon opens `Sort agents`: `Priority` (default; sections
    `Needs you`, `Done`, `Working`, `Idle`, each with its count) or `Grouped
    by space` (a header per space). A parent takes the place of its most
    urgent sub-agent.
  - A finished agent you look at stays under `Done` until you leave it.
  - Hovering a row swaps its time for a pin button (`Pin to the top` /
    `Unpin`); pinned agents sit in a `Pinned` group first.
  - Clicking a row focuses its pane. Clicking a group header folds it; folded,
    it shows the count and the most urgent status. A row with sub-agents
    has a chevron that folds them.
  - Sub-agents are Herdr's own child terminals. Clicking one peeks at its
    terminal.
  - Narrower than 160px, it becomes a rail of numbers and status marks with
    a `»` button that widens the sidebar back.
- **Tabs.** Click selects, double-click renames, dragging a tab onto another
  moves it there, right-click opens Herdr's tab `menu`, the scroll wheel
  goes to the previous or next tab. `+` opens Herdr's `new-menu` (250 × 512).
  `Files` and `Changes` open the panel on that view, or close it when that
  view is already showing. The panel's
  state is remembered per space and restored when you switch spaces.
- **Pane header.** A click focuses the pane; the buttons run `pane.split`
  (right or down), `pane.zoom` and `pane.close`.
- **Commands** (for `keys.json` or `herdr-app do`; none is bound by
  default): `rooms.next-building`, `rooms.next-town`, `rooms.toggle-empty`,
  `rooms.toggle-place`.

## Built from

**Layout** `layouts/rooms.json`:

```
root (row, divider 1 border, titlebar none, traffic_lights [12,16], terminal_padding [14,12], terminal_opacity 1)
├─ sidebar (column, 268px, min 44, max 480, resizable false)
│  ├─ brand          block 46px  mod workspace-chrome   window_drag
│  ├─ sidebar-lists  column
│  │  ├─ spaces      block weight 1, min 90  mod rooms
│  │  └─ agents      block weight 1, min 90  mod agents-calm
│  └─ sidebar-footer block 69px  mod workspace-chrome  props { footer: true }
└─ work (column, resizable false)
   ├─ tabs       block 42px  mod tabs-graph  window_drag
   ├─ work-body  row, padding 4, gap 4
   │  ├─ main    block  tab active, pane { header { mod pane-calm, reveal always, height 30, top },
   │  │                 background #1e1e2e00, border 1 border, focus 1 accent, radius 10, gap 4, lone true }
   │  └─ panel   column 368px, min 280, max 900, hidden
   │     └─ panel-body  stack, active files: files (mod files), changes (mod changes)
   └─ status     block 28px  mod workspace-status
```

**Layout** `layouts/rooms-top.json` (the building across the top):

```
root (column; window settings as in rooms.json)
├─ strip (row, 240px)
│  ├─ spaces  block weight 1  mod rooms  props { strip: true }
│  └─ agents  block weight 1  mod agents-calm
└─ work (column): tabs, work-body (main, panel > panel-body: files, changes)
   and status, as in rooms.json
```

The ids `sidebar`, `panel`, `panel-body` matter: `agents-calm` resizes
`sidebar`, `tabs-graph` shows, hides and selects in `panel` / `panel-body`.

**Mods in this folder:**

- `mods/rooms/` (no props; `{ role: "menu" }` is its own right-click menu
  popup, `{ strip: true }` draws it as a band across the window's top):
  `main.js` (the building, fit, roster, header), `looks.js` (each building's
  colors, crown, ledge, base and window dressing, and the towns), `menu.js`
  (the right-click menus), `session.js` (reads the session name from an
  agent's terminal title for Pi, Codex, Claude Code and OpenCode; Gemini CLI's
  title carries none),
  `sun.js` (sunrise and sunset), `art.js` (the size of every picture in
  `icons/`, generated). Art: `sprites/` 240 SVGs, 19 × 15 pixel occupants
  (15 bodies × 4 hat colors × 4 statuses: `<body>-<a|b|c|d>-<status>.svg`;
  bodies `claude`, `codex`, `crush`, `kiro`, `pi`, `gemini`, `cursor`,
  `opencode`, `amp`, `grok`, `antigravity`, `kimi`, `qoder`, `hermes`,
  `other`), `icons/` 149 SVGs (each building's roof, sky, sign and entrance
  pictures by day and night, the towns, `warn`, `check`, `time-day`,
  `time-night`, `panel-top`). `tools/` holds the Python scripts that drew
  them (`occupants.py`, `scene.py`, `buildings.py`); the mod doesn't run them.
  Kept in `localStorage`: `building`, `town`, `fold`, `changed`. Shared
  values: `rooms.building`, `rooms.town`, `rooms.fold`.
- `mods/agents-calm/`: a modified copy of Herdr's `agents` (0.1.12).
  Kept in `localStorage`: `changed` (each agent's last status and when),
  `pins`. Shared values: `agents.sort`, `sidebar.width`,
  `sidebar.collapsed`. Its sort menu is itself as a popup
  (`{ sortMenu: true }`, 200 × 140).
- `mods/tabs-graph/`: a modified copy of Herdr's `tabs` (0.1.9). Reads
  shared `workspace.panels` (default `["files", "changes"]`). Kept in
  `localStorage`: `panels`.
- `mods/pane-calm/`: a modified copy of Herdr's `pane` (0.1.12) with its own
  icons `split-right.svg`, `split-down.svg`, `zoom.svg`, `unzoom.svg`,
  `close.svg`. Props from the app: `{ pane, terminal }`.

**Herdr's mods it uses:** `workspace-chrome` (brand strip and footer, and
its icons `chevron-down`, `chevron-right`, `plus`, `sidebar`, `check`,
`spinner`, `clock`, `layers`, `pin`, `pin-off`, `terminal`, `git-branch`,
`git-compare`, `folder`, `file-text`, `files`, `square-pen`, `x`,
`circle-check`), `workspace-status`, `files`, `changes`, `menu` (tab
right-click), `new-menu` (the `+` menu), `worktree` (New worktree), and the
icons `mods/pane/close.svg`, `mods/files/file.svg`,
`mods/changes/changes.svg`.

**`herdr` functions:**

- `rooms`: `spaces`, `agents`, `panes`, `run`, `theme`, `settings`, `props`,
  `openOverlay`, `closeOverlay`, `shared`, `setShared`, `layouts`, `window`,
  `nextCommand`, `exec`, `knownAgents`.
- `agents-calm`: `agents`, `terminals`, `panes`, `focused`, `spaces`,
  `run`, `theme`, `shared`, `setShared`, `setAgentOrder`, `openOverlay`,
  `closeOverlay`, `props`, `window`, `layout`.
- `tabs-graph`: `spaces`, `panes`, `run`, `openOverlay`, `theme`, `window`,
  `shared`, `layout`, `settings`.
- `pane-calm`: `panes`, `props`, `run`, `theme`, `home`.

**Commands run:** `space.select`, `space.new` (with `argv` for an agent),
`space.rename`, `space.close`, `tab.new` (`space`, `folder`, `argv`),
`tab.select`, `tab.move`, `tab.rename`, `tab.close`, `tab.prev`, `tab.next`,
`pane.focus` (`pane` or `terminal`), `pane.split`, `pane.zoom`,
`pane.close`, `terminal.pin`, `terminal.peek`, `layout.resize`,
`layout.show`, `layout.hide`, `layout.select`, `layout.switch`,
`window.minimize`, `window.maximize`, `window.close`.

**Programs run:** see Watch out.

## Watch out

- **Programs the mods run.**
  - `rooms`, when you right-click a room, before the menu opens:
    `git rev-parse --show-toplevel` in the space's folder, to decide whether
    to offer `New worktree` and `Open on GitHub` (on a remote space it runs
    on that machine). From the menu items: `open <folder>` (Open in
    Finder), `open -a "Visual Studio Code" <folder>` (Open in VS Code),
    `gh browse` in the folder (Open on GitHub), `sh -c 'printf %s "$1" | pbcopy'`
    (Copy path). They are not checked per platform: on a machine without
    macOS's `open` and `pbcopy`, without VS Code or without `gh`, the item
    is still listed and does nothing (errors are swallowed). The four
    "open/copy" items are offered only for a local space.
  - `agents-calm`, `tabs-graph` and `pane-calm` run no programs.
- **Network.** None of the mods calls `fetch`. `Open on GitHub` runs
  `gh browse`, which opens github.com in your browser, and `gh` itself may
  contact GitHub to resolve the repository.
- **Files outside their own folders.**
  - `rooms` reads only Herdr's state, its own pictures and Herdr's shipped
    icons; its programs run in the space's folder.
- **The art includes Claude Code's mascot.** The `claude` occupant, and
  `other` (any agent not in the table, Copilot among them), are Claw'd as
  drawn in Claude Code's start screen, in `#D97757` and `#8FA3BF`. The other
  13 bodies are drawn after the program icons that ship with Herdr App. Each
  occupant is 19 × 15 pixels, hidden below the shoulders by its seat in a
  room and shown whole in the roster.
- **Language.** Every word on screen (counts, menus, tooltips, building and
  town names) is English. The theme is Japanese: a ryokan, a sento, a castle,
  Tokyo, Kyoto, Osaka and Mount Fuji, and the sun is reckoned for Tokyo on
  Japan time. The pictures have no lettering (the sento sign is ♨, the hotel
  sign stars). Code comments in `tabs-graph`, and the
  README and comments in `mods/rooms/tools/`, are Japanese.
- **No `Graph` button unless you add one.** `tabs-graph` shows `Graph` only
  when the layout has a node whose id is `graph` (it then uses
  `mods/git-graph/icons/graph.svg`). This repo has neither that node nor a
  git-graph mod, so you see only `Files` and `Changes`.
- **Side/top pairs by name.** `rooms` shows its "Building across the top"
  button (and `rooms.toggle-place` works) only when a layout named
  `<current>-top` is installed; from the `-top` layout it goes back to
  `<current>`. Both `rooms.json` and `rooms-top.json` are shipped; keep the
  names paired if you rename one.
- **Renaming.** The mod names appear inside the code: `rooms` opens its own
  menu as `openOverlay({ mod: "rooms" })` and loads `mods/rooms/...`;
  `agents-calm` opens `{ mod: "agents-calm" }`; `pane-calm` loads
  `mods/pane-calm/<icon>.svg`. Rename those too if you rename a folder.
- **The building has no rail.** When the sidebar is folded (Herdr folds it
  to 44px, 76 on macOS) or anything else makes it narrower than 160px,
  `agents-calm` becomes a rail but `rooms` still draws its building, at one
  column. The sidebar is `resizable: false`, so its edge can't be dragged.
- **Fit counts.** `fit` adds up heights in art pixels from each building's
  `rise` (crown, ledge, base) in `looks.js` plus 17px name plates, so a
  change to a picture's height must change its `rise` too, or the building
  overflows or shrinks too early. Every picture's size comes from `art.js`.
- **Cost.** Every redraw of a mod redraws the whole window, so the building
  is still pictures: no spinning, no native animation loop, only the 320ms
  hop for 3 seconds. Spinners in the list, tabs and pane headers are still
  icons for the same reason.
- **Assumes** Herdr App's shipped mods listed under Built from are present
  (they are in a default install) and agents that report their status to
  Herdr.

## Done when

- `herdr-app check` passes for `mods/rooms`, `mods/agents-calm`,
  `mods/tabs-graph` and `mods/pane-calm`.
- `herdr-app do layout.switch '{"name":"rooms"}'` shows a 268px sidebar with
  a brand strip, the building and an `Agents` list, and a work column with
  tabs, framed panes with 30px headers and a status bar.
- The building's header reads `Needs you N`, `Done N`, `Working N`,
  `Idle N` with the real counts, then `Day` or `Night` matching the clock,
  the building's name and `+`.
- Each space is a room with its name on a plate; a space without agents sits
  under an `Empty N` plate, and pressing the plate folds and unfolds them.
- An agent that starts working appears in its room in a hard hat and hops
  for about 3 seconds; one that waits for you raises a hand and puts a
  warning badge on its window; a finished one throws confetti and puts a
  check on it.
- Picking each of the nine buildings and each town from the list redraws the
  building; the choice survives a restart.
- Resting on a room opens its roster; clicking a room selects its space;
  right-clicking opens the menu, and on macOS `Copy path` puts the folder
  on the clipboard.
- `Files` and `Changes` in the tab bar open the 368px panel; switching
  spaces restores each space's panel.
