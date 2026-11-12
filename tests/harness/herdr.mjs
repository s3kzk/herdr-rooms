// Herdr の `herdr` モジュールの代役。生きたデータは world から読む。
export const world = {};
export function reset() {
  Object.assign(world, { spaces: [], panes: [], agents: [], terminals: [], shared: new Map(), runs: [], props: {}, layout: null, terminalReads: 0 });
}
reset();
const store = new Map();
globalThis.localStorage ??= { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) };
export const spaces = () => world.spaces, panes = () => world.panes, agents = () => world.agents;
export const terminals = () => { world.terminalReads++; return world.terminals; };
export const shared = (k) => world.shared.get(k);
export const setShared = (k, v) => { world.shared.set(k, v); };
export const run = (name, args) => { world.runs.push([name, args]); };
export const theme = () => new Proxy({}, { get: (_t, k) => String(k) });
export const settings = () => ({ zoom: 1, font_family: "Mono" });
export const props = () => world.props;
export const layout = () => world.layout;
export const layouts = () => [];
export const window = () => ({ platform: "macos", fullscreen: false, buttons: false });
export const openOverlay = () => "o1", closeOverlay = () => {};
export const nextCommand = () => new Promise(() => {});
export const exec = async () => ({ code: 0, stdout: "", stderr: "" });
export const knownAgents = () => [];
