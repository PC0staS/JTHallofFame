import { f as createComponent, g as createAstro, l as renderComponent, n as renderScript, q as renderSlot, r as renderTemplate, m as maybeRenderHead } from "../chunks/astro/server_Dh3qN3cZ.mjs";
import "kleur/colors";
import { a as $$InternalUIComponentRenderer, $ as $$Dashboard } from "../chunks/dashboard_COXnyNhC.mjs";
import { $ as $$Layout } from "../chunks/Layout_DalQmPku.mjs";
import "clsx";
import { renderers } from "../renderers.mjs";
const $$Astro$7 = createAstro();
const $$SignedInCSR = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$7, $$props, $$slots);
  Astro2.self = $$SignedInCSR;
  const { class: className } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "clerk-signed-in", "clerk-signed-in", { "class": className, "hidden": true }, { "default": () => renderTemplate` ${renderSlot($$result, $$slots["default"])} ` })} ${renderScript($$result, "C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/node_modules/@clerk/astro/components/control/SignedInCSR.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/node_modules/@clerk/astro/components/control/SignedInCSR.astro", void 0);
const $$Astro$6 = createAstro();
const $$SignedInSSR = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$6, $$props, $$slots);
  Astro2.self = $$SignedInSSR;
  const { userId } = Astro2.locals.auth();
  return renderTemplate`${userId ? renderTemplate`${renderSlot($$result, $$slots["default"])}` : null}`;
}, "C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/node_modules/@clerk/astro/components/control/SignedInSSR.astro", void 0);
const configOutput = "server";
function isStaticOutput(forceStatic) {
  if (forceStatic !== void 0) {
    return forceStatic;
  }
  return configOutput === "static";
}
const $$Astro$5 = createAstro();
const $$SignedIn = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$5, $$props, $$slots);
  Astro2.self = $$SignedIn;
  const { isStatic, class: className } = Astro2.props;
  const SignedInComponent = isStaticOutput(isStatic) ? $$SignedInCSR : $$SignedInSSR;
  return renderTemplate`${renderComponent($$result, "SignedInComponent", SignedInComponent, { "class": className }, { "default": ($$result2) => renderTemplate` ${renderSlot($$result2, $$slots["default"])} ` })}`;
}, "C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/node_modules/@clerk/astro/components/control/SignedIn.astro", void 0);
const $$Astro$4 = createAstro();
const $$SignedOutCSR = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$SignedOutCSR;
  const { class: className } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "clerk-signed-out", "clerk-signed-out", { "class": className, "hidden": true }, { "default": () => renderTemplate` ${renderSlot($$result, $$slots["default"])} ` })} ${renderScript($$result, "C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/node_modules/@clerk/astro/components/control/SignedOutCSR.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/node_modules/@clerk/astro/components/control/SignedOutCSR.astro", void 0);
const $$Astro$3 = createAstro();
const $$SignedOutSSR = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$SignedOutSSR;
  const { userId } = Astro2.locals.auth();
  return renderTemplate`${!userId ? renderTemplate`${renderSlot($$result, $$slots["default"])}` : null}`;
}, "C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/node_modules/@clerk/astro/components/control/SignedOutSSR.astro", void 0);
const $$Astro$2 = createAstro();
const $$SignedOut = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$SignedOut;
  const { isStatic, class: className } = Astro2.props;
  const SignedOutComponent = isStaticOutput(isStatic) ? $$SignedOutCSR : $$SignedOutSSR;
  return renderTemplate`${renderComponent($$result, "SignedOutComponent", SignedOutComponent, { "class": className }, { "default": ($$result2) => renderTemplate` ${renderSlot($$result2, $$slots["default"])} ` })}`;
}, "C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/node_modules/@clerk/astro/components/control/SignedOut.astro", void 0);
const $$Astro$1 = createAstro();
const $$SignIn$1 = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$SignIn$1;
  return renderTemplate`${renderComponent($$result, "InternalUIComponentRenderer", $$InternalUIComponentRenderer, { ...Astro2.props, "component": "sign-in" })}`;
}, "C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/node_modules/@clerk/astro/components/interactive/SignIn.astro", void 0);
const $$SignIn = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="container-fluid d-flex flex-column align-items-center justify-content-center vh-100" style="background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/background.png'); background-size: cover; background-position: center;"> <div> ${renderComponent($$result, "ClerkSignIn", $$SignIn$1, {})} </div> </div>`;
}, "C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/src/components/SignIn.astro", void 0);
const $$Astro = createAstro();
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "SignedOut", $$SignedOut, {}, { "default": ($$result3) => renderTemplate` ${renderComponent($$result3, "SignIn", $$SignIn, {})} ` })} ${renderComponent($$result2, "SignedIn", $$SignedIn, {}, { "default": ($$result3) => renderTemplate` ${renderComponent($$result3, "Dashboard", $$Dashboard, {})} ` })} ` })}`;
}, "C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/src/pages/index.astro", void 0);
const $$file = "C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/src/pages/index.astro";
const $$url = "";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
