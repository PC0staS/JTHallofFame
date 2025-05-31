import { f as createComponent, l as renderComponent, r as renderTemplate } from "../chunks/astro/server_Dh3qN3cZ.mjs";
import "kleur/colors";
import { $ as $$Dashboard$1 } from "../chunks/dashboard_BMUr-Yn_.mjs";
import { renderers } from "../renderers.mjs";
const $$Dashboard = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "DashboardComponent", $$Dashboard$1, {})}`;
}, "C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/src/pages/dashboard.astro", void 0);
const $$file = "C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/src/pages/dashboard.astro";
const $$url = "/dashboard";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Dashboard,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
