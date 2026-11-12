// 「人を待っている端末」の数え方。Herdr の status（blocked）に、ほかの mod が共有の値
// attention.waiting で公開した待ち（判断待ちなど、Herdr からは done・idle に見えるもの）を足す。
// 値は承認一覧（herdr-approval-inbox）が書く。入っていないときは Herdr の status だけで数える（前提なしで動く）。
// rooms と tabs-graph に同じ内容の写しを置く（mod を 1 つずつ入れても動くように）。tests/attention.test.mjs が両方を縛る。
//   attention.waiting: [{ address, kind: "permission"|"question"|"decision"|"denied", since: ms, turn: number|null }]
// herdr を import しないので node --test で試せる。

// 待ちとみなす address の集合。値が配列でなければ null（今までどおり blocked だけ）。
// terms は terminals()。もう無い端末と、turn が進んだ端末（書き手が止まった後に残った古い値）の要素は捨てる
export function waitingSet(value, terms) {
  if (!Array.isArray(value)) return null;
  const turnOf = new Map((Array.isArray(terms) ? terms : []).map((t) => [t?.address, t?.turn]));
  const out = new Set();
  for (const e of value) {
    if (typeof e?.address !== "string") continue;
    if (Array.isArray(terms)) {
      if (!turnOf.has(e.address)) continue;
      const now = turnOf.get(e.address);
      if (Number.isInteger(e.turn) && Number.isInteger(now) && e.turn !== now) continue;
    }
    out.add(e.address);
  }
  return out;
}

// blocked は載っていなくても待ち（隠したもの・承認一覧が見ないエージェント）。working に戻ったものは載っていても待ちにしない
export function isWaiting(agent, set) {
  if (agent?.status === "blocked") return true;
  return Boolean(set?.has(agent?.address)) && agent?.status !== "working";
}

// 数えるための status。待ちは blocked に付け替える（足すと同じ端末を 2 か所で数えるため）
export function statusOf(agent, set) {
  return isWaiting(agent, set) ? "blocked" : agent?.status ?? "idle";
}

// タブの点: タブ自身が blocked か、そのタブの端末が待ちなら blocked
export function tabStatus(tab, agents, set) {
  if (tab?.status === "blocked") return "blocked";
  if (set && (agents ?? []).some((a) => a?.tab === tab?.id && isWaiting(a, set))) return "blocked";
  return tab?.status;
}
