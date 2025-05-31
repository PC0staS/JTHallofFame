import { f as createComponent, g as createAstro, r as renderTemplate, q as renderSlot, p as renderHead, i as addAttribute } from "./astro/server_Dh3qN3cZ.mjs";
import "kleur/colors";
import "clsx";
/* empty css                             */
var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title } = Astro2.props;
  return renderTemplate(_a || (_a = __template(['<html lang="es" data-astro-cid-sckkx6r4> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><link rel="icon" type="image/svg+xml" href="/favicon.png"><meta name="generator"', "><title>", '</title><link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" rel="stylesheet"><link rel="stylesheet" href="/CSS/estilos.css">', "</head> <body data-astro-cid-sckkx6r4> ", '  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" defer><\/script></body></html>'])), addAttribute(Astro2.generator, "content"), title || "MakeItMeme", renderHead(), renderSlot($$result, $$slots["default"]));
}, "C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/src/layouts/Layout.astro", void 0);
export {
  $$Layout as $
};
