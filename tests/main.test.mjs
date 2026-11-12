// rooms と tabs-graph の main.js を Herdr の代役（tests/harness）の上で描き、
// attention.waiting が件数・窓の印・タブの点に届くかを確かめる。
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";

register(new URL("./harness/hooks.mjs", import.meta.url));
const { world, reset } = await import("./harness/herdr.mjs");
const { texts, byId, hasBg } = await import("./harness/gpui.mjs");
const { default: Rooms } = await import("../mods/rooms/main.js");
const { default: Tabs } = await import("../mods/tabs-graph/main.js");

const cx = { timer: { every: () => {}, after: () => {} }, spawn: () => {}, notify: () => {}, stop_propagation: () => {} };
const KEY = "attention.waiting";

function scene() {
  world.spaces = [{ id: "s1", index: 0, name: "work", active: true, tabs: [{ id: "tbA", name: "a", status: "done", active: true }, { id: "tbB", name: "b", status: "blocked" }] }];
  world.agents = [
    { address: "t1", status: "done", space: "s1", tab: "tbA", seq: 2, app: "claude-code", program: {} },
    { address: "t2", status: "blocked", space: "s1", tab: "tbB", seq: 1, app: "claude-code", program: {} },
  ];
  world.terminals = [{ address: "t1", turn: 5 }, { address: "t2", turn: 3 }];
}
const counts = (tree) => texts(tree).filter((s) => /^(Needs you|Done|Working|Idle) \d+$/.test(s));
const rooms = () => { const v = new Rooms(); v.init({}, cx); return v.render(cx); };
const tabs = () => { const v = new Tabs(); v.init({}, cx); return v.render(cx); };

beforeEach(() => { reset(); scene(); });

test("rooms: キーが無ければ今までどおり blocked だけを Needs you に数え、terminals() も読まない", () => {
  assert.deepEqual(counts(rooms()), ["Needs you 1", "Done 1", "Working 0", "Idle 0"]);
  assert.equal(world.terminalReads, 0);
});

test("rooms: attention.waiting に載った done の端末は Needs you に付け替える", () => {
  world.shared.set(KEY, [{ address: "t1", kind: "decision", since: 1, turn: 5 }]);
  assert.deepEqual(counts(rooms()), ["Needs you 2", "Done 0", "Working 0", "Idle 0"]);
});

test("rooms: turn が進んだ古い値では数えない", () => {
  world.shared.set(KEY, [{ address: "t1", kind: "decision", since: 1, turn: 4 }]);
  assert.deepEqual(counts(rooms()), ["Needs you 1", "Done 1", "Working 0", "Idle 0"]);
});

test("rooms: 窓の印は、待ちがいれば warn（blocked の色）", () => {
  // t2 を除き、t1（done）だけの部屋にする
  world.agents = world.agents.slice(0, 1);
  const room = () => byId(rooms(), "room-s1");
  assert.ok(room());
  assert.equal(hasBg(room(), "blocked"), false);
  assert.equal(hasBg(room(), "done"), true);  // 待ちが無ければ check（done の色）
  world.shared.set(KEY, [{ address: "t1", kind: "decision", since: 1, turn: 5 }]);
  assert.equal(hasBg(room(), "blocked"), true);
});

test("tabs-graph: キーが無ければタブの status のまま（tbA は done の点）", () => {
  const tree = tabs();
  assert.equal(hasBg(byId(tree, "tab-tbA"), "done"), true);
  assert.equal(hasBg(byId(tree, "tab-tbA"), "blocked"), false);
  assert.equal(hasBg(byId(tree, "tab-tbB"), "blocked"), true);
});

test("tabs-graph: そのタブの端末が attention.waiting に載っていれば待ちの点", () => {
  world.shared.set(KEY, [{ address: "t1", kind: "decision", since: 1, turn: 5 }]);
  const tree = tabs();
  assert.equal(hasBg(byId(tree, "tab-tbA"), "blocked"), true);
  assert.equal(hasBg(byId(tree, "tab-tbA"), "done"), false);
});
