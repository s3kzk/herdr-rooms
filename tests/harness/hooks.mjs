// mod が import する Herdr のモジュールを、このフォルダの代役に向ける。
const here = (f) => new URL(f, import.meta.url).href;
const MAP = { herdr: here("./herdr.mjs"), "gpui-kit": here("./gpui.mjs"), "gpui-base": here("./gpui.mjs") };
export async function resolve(spec, ctx, next) {
  return MAP[spec] ? { url: MAP[spec], shortCircuit: true } : next(spec, ctx);
}
