import { renderers } from "./renderers.mjs";
import { s as serverEntrypointModule } from "./chunks/_@astrojs-ssr-adapter_DYQ_v7bF.mjs";
import { manifest } from "./manifest_BviQCKXS.mjs";
import { createExports } from "@astrojs/netlify/ssr-function.js";
const serverIslandMap = /* @__PURE__ */ new Map();
;
const _page0 = () => import("./pages/_image.astro.mjs");
const _page1 = () => import("./pages/api/user-simple.astro.mjs");
const _page2 = () => import("./pages/create-table.astro.mjs");
const _page3 = () => import("./pages/dashboard.astro.mjs");
const _page4 = () => import("./pages/health-check.astro.mjs");
const _page5 = () => import("./pages/setup.astro.mjs");
const _page6 = () => import("./pages/test-db.astro.mjs");
const _page7 = () => import("./pages/upload.astro.mjs");
const _page8 = () => import("./pages/index.astro.mjs");
const pageMap = /* @__PURE__ */ new Map([
  ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
  ["src/pages/api/user-simple.ts", _page1],
  ["src/pages/create-table.astro", _page2],
  ["src/pages/dashboard.astro", _page3],
  ["src/pages/health-check.astro", _page4],
  ["src/pages/setup.astro", _page5],
  ["src/pages/test-db.astro", _page6],
  ["src/pages/upload.astro", _page7],
  ["src/pages/index.astro", _page8]
]);
const _manifest = Object.assign(manifest, {
  pageMap,
  serverIslandMap,
  renderers,
  actions: () => import("./_noop-actions.mjs"),
  middleware: () => import("./_astro-internal_middleware.mjs")
});
const _args = {
  "middlewareSecret": "753938af-0452-4648-8081-b0ebf06c636c"
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = "start";
if (_start in serverEntrypointModule) {
  serverEntrypointModule[_start](_manifest, _args);
}
export {
  __astrojsSsrVirtualEntry as default,
  pageMap
};
