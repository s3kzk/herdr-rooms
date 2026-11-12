// gpui-kit / gpui-base の代役。要素はどの builder でも受け、child・id・bg を覚える。
function el() {
  const e = { kids: [], calls: [] };
  const p = new Proxy(e, {
    get(t, k) {
      if (k === "__el") return t;
      return (...a) => {
        t.calls.push(k);
        if (k === "child") t.kids.push(a[0]);
        else if (k === "children") t.kids.push(...a[0]);
        else if (k === "id") t.id = a[0];
        else if (k === "bg") t.bg = a[0];
        else if (k === "when") { if (a[0]) return a[1](p); }
        return p;
      };
    },
  });
  return p;
}
export class View {}
export const div = el, svg = el, image = el, v_flex = el, h_flex = el;
// Popup.new(id, trigger): 中身を見られるよう trigger を子に持つ
export const Popup = { new: (_id, trigger) => el().child(trigger) };
export function texts(node, out = []) {
  if (typeof node === "string") out.push(node);
  else for (const k of node?.__el?.kids ?? []) texts(k, out);
  return out;
}
export function byId(node, id) {
  const e = node?.__el;
  if (!e) return null;
  if (e.id === id) return e;
  for (const k of e.kids) { const f = byId(k, id); if (f) return f; }
  return null;
}
// その要素の下に、背景がその色の要素があるか
export function hasBg(node, color) {
  const e = node?.__el ?? node;
  if (!e) return false;
  if (e.bg === color) return true;
  return (e.kids ?? []).some((k) => hasBg(k, color));
}
