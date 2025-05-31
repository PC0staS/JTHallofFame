import { d as createComponent, j as renderComponent, r as renderTemplate } from "../chunks/astro/server_-cF_Yyy_.mjs";
import "kleur/colors";
import { $ as $$Dashboard$1 } from "../chunks/dashboard_DWLdSaEr.mjs";
import { renderers } from "../renderers.mjs";
const prerender = false;
const $$Dashboard = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "DashboardComponent", $$Dashboard$1, {})}`;
}, "C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/src/pages/dashboard.astro", void 0);
const $$file = "C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/src/pages/dashboard.astro";
const $$url = "/dashboard";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Dashboard,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
