// attention.waiting（承認一覧などが公開する「人を待っている端末」）の読み方。
// rooms と tabs-graph は同じ処理の写しを持つので、同じ表を両方に当てる（片方だけ変わったら落ちる）。
import { test } from "node:test";
import assert from "node:assert/strict";
import * as rooms from "../mods/rooms/attention.js";
import * as tabs from "../mods/tabs-graph/attention.js";

const agent = (address, status, tab = "tb1") => ({ address, status, tab });
const entry = (address, turn = 5, kind = "decision") => ({ address, kind, since: 1, turn });
const term = (address, turn = 5) => ({ address, turn });

for (const [name, m] of [["rooms", rooms], ["tabs-graph", tabs]]) {
  test(`${name}: キーが無い・配列でないときは null（今までどおり blocked だけを待ちとする）`, () => {
    for (const v of [undefined, null, {}, "x", 3]) assert.equal(m.waitingSet(v, []), null, String(v));
    const set = m.waitingSet(undefined, []);
    assert.equal(m.isWaiting(agent("t1", "blocked"), set), true);
    assert.equal(m.isWaiting(agent("t1", "done"), set), false);
    assert.equal(m.isWaiting(agent("t1", "idle"), set), false);
    assert.equal(m.statusOf(agent("t1", "done"), set), "done");
    assert.equal(m.statusOf({ address: "t1" }, set), "idle");
  });

  test(`${name}: 公開に載った done・idle の端末（判断待ち）は待ちとして数える`, () => {
    const set = m.waitingSet([entry("t1"), entry("t2")], [term("t1"), term("t2")]);
    assert.equal(m.isWaiting(agent("t1", "done"), set), true);
    assert.equal(m.isWaiting(agent("t2", "idle"), set), true);
    assert.equal(m.statusOf(agent("t1", "done"), set), "blocked");
  });

  test(`${name}: 載っていない端末は今までどおり。blocked は載っていなくても待ち（隠したもの・ほかのエージェント）`, () => {
    const set = m.waitingSet([entry("t1")], [term("t1"), term("t9")]);
    assert.equal(m.isWaiting(agent("t9", "done"), set), false);
    assert.equal(m.isWaiting(agent("t9", "blocked"), set), true);
    assert.equal(m.statusOf(agent("t9", "idle"), set), "idle");
  });

  test(`${name}: working に戻った端末は、載っていても待ちにしない（公開が 1 秒遅れるため）`, () => {
    const set = m.waitingSet([entry("t1")], [term("t1")]);
    assert.equal(m.isWaiting(agent("t1", "working"), set), false);
    assert.equal(m.statusOf(agent("t1", "working"), set), "working");
  });

  test(`${name}: turn が進んだ端末の古い値は捨てる（承認一覧が止まった後に残った値で数えない）`, () => {
    const set = m.waitingSet([entry("t1", 5)], [term("t1", 6)]);
    assert.equal(m.isWaiting(agent("t1", "done"), set), false);
  });

  test(`${name}: turn は両方が整数のときだけ比べる（片方・両方が null なら載っているとおり）`, () => {
    assert.equal(m.waitingSet([entry("t1", null)], [term("t1", null)]).has("t1"), true);
    assert.equal(m.waitingSet([entry("t1", null)], [term("t1", 6)]).has("t1"), true);
    assert.equal(m.waitingSet([entry("t1", 5)], [term("t1", undefined)]).has("t1"), true);
    assert.equal(m.waitingSet([entry("t1", 5)], undefined).has("t1"), true);
  });

  test(`${name}: もう無い端末の値と、形の壊れた要素は捨てる`, () => {
    const set = m.waitingSet([entry("gone"), null, { kind: "decision" }, { address: 3 }, entry("t1")], [term("t1")]);
    assert.deepEqual([...set], ["t1"]);
  });

  test(`${name}: 空の配列は「待ちは無い」（blocked だけが残る）`, () => {
    const set = m.waitingSet([], [term("t1")]);
    assert.notEqual(set, null);
    assert.equal(m.isWaiting(agent("t1", "done"), set), false);
    assert.equal(m.isWaiting(agent("t1", "blocked"), set), true);
  });

  test(`${name}: 付け替えなので、同じ端末を Needs you と Idle の両方には数えない`, () => {
    const set = m.waitingSet([entry("t1")], [term("t1")]);
    const count = { blocked: 0, done: 0, working: 0, idle: 0 };
    for (const a of [agent("t1", "idle"), agent("t2", "idle"), agent("t3", "blocked")]) count[m.statusOf(a, set)] += 1;
    assert.deepEqual(count, { blocked: 2, done: 0, working: 0, idle: 1 });
  });
}

test("tabs-graph: タブの点。タブ自身が blocked か、そのタブの端末が待ちなら待ち", () => {
  const set = tabs.waitingSet([entry("t1")], [term("t1")]);
  const ag = [agent("t1", "done", "tbA"), agent("t2", "idle", "tbB")];
  assert.equal(tabs.tabStatus({ id: "tbA", status: "done" }, ag, set), "blocked");
  assert.equal(tabs.tabStatus({ id: "tbB", status: "idle" }, ag, set), "idle");
  assert.equal(tabs.tabStatus({ id: "tbC", status: "blocked" }, ag, set), "blocked");
  assert.equal(tabs.tabStatus({ id: "tbA", status: "working" }, [agent("t1", "working", "tbA")], set), "working");
  // キーが無いときはタブの status のまま
  assert.equal(tabs.tabStatus({ id: "tbA", status: "done" }, ag, null), "done");
});

test("rooms と tabs-graph の attention.js は同じ内容（片方だけ直すと落ちる）", async () => {
  const { readFileSync } = await import("node:fs");
  const read = (d) => readFileSync(new URL(`../mods/${d}/attention.js`, import.meta.url), "utf8");
  assert.equal(read("tabs-graph"), read("rooms"));
});
