import { f as createComponent, g as createAstro, r as renderTemplate, v as defineScriptVars, i as addAttribute, m as maybeRenderHead, l as renderComponent, q as renderSlot, n as renderScript } from "./astro/server_Dh3qN3cZ.mjs";
import "kleur/colors";
/* empty css                             */
import "clsx";
import "@clerk/shared/underscore";
import { customAlphabet, urlAlphabet } from "nanoid";
import { $ as $$Layout } from "./Layout_DalQmPku.mjs";
import { a as checkDatabaseConnection, g as getPhotos } from "./supabase_Qhyrp44l.mjs";
var generateSafeId = (defaultSize = 10) => customAlphabet(urlAlphabet, defaultSize)();
var __freeze$2 = Object.freeze;
var __defProp$2 = Object.defineProperty;
var __template$2 = (cooked, raw) => __freeze$2(__defProp$2(cooked, "raw", { value: __freeze$2(raw || cooked.slice()) }));
var _a$2;
const $$Astro$6 = createAstro();
const $$InternalUIComponentRenderer = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$6, $$props, $$slots);
  Astro2.self = $$InternalUIComponentRenderer;
  const { component, id, ...props } = Astro2.props;
  const safeId = id || generateSafeId();
  return renderTemplate(_a$2 || (_a$2 = __template$2(["", "<div", "></div> <script>(function(){", "\n  /**\n   * Store the id and the props for the Astro component in order to mount the correct UI component once clerk is loaded.\n   * The above is handled by `mountAllClerkAstroJSComponents`.\n   */\n  const setOrCreatePropMap = ({ category, id, props }) => {\n    if (!window.__astro_clerk_component_props) {\n      window.__astro_clerk_component_props = new Map();\n    }\n\n    if (!window.__astro_clerk_component_props.has(category)) {\n      const _ = new Map();\n      _.set(id, props);\n      window.__astro_clerk_component_props.set(category, _);\n    }\n\n    window.__astro_clerk_component_props.get(category)?.set(id, props);\n  };\n\n  setOrCreatePropMap({\n    category: component,\n    id: `clerk-${component}-${safeId}`,\n    props,\n  });\n})();<\/script>"], ["", "<div", "></div> <script>(function(){", "\n  /**\n   * Store the id and the props for the Astro component in order to mount the correct UI component once clerk is loaded.\n   * The above is handled by \\`mountAllClerkAstroJSComponents\\`.\n   */\n  const setOrCreatePropMap = ({ category, id, props }) => {\n    if (!window.__astro_clerk_component_props) {\n      window.__astro_clerk_component_props = new Map();\n    }\n\n    if (!window.__astro_clerk_component_props.has(category)) {\n      const _ = new Map();\n      _.set(id, props);\n      window.__astro_clerk_component_props.set(category, _);\n    }\n\n    window.__astro_clerk_component_props.get(category)?.set(id, props);\n  };\n\n  setOrCreatePropMap({\n    category: component,\n    id: \\`clerk-\\${component}-\\${safeId}\\`,\n    props,\n  });\n})();<\/script>"])), maybeRenderHead(), addAttribute(`clerk-${component}-${safeId}`, "data-clerk-id"), defineScriptVars({ props, component, safeId }));
}, "C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/node_modules/@clerk/astro/components/interactive/InternalUIComponentRenderer.astro", void 0);
const $$Astro$5 = createAstro();
const $$UserButton = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$5, $$props, $$slots);
  Astro2.self = $$UserButton;
  return renderTemplate`${renderComponent($$result, "InternalUIComponentRenderer", $$InternalUIComponentRenderer, { ...Astro2.props, "component": "user-button" })} ${renderSlot($$result, $$slots["default"])}`;
}, "C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/node_modules/@clerk/astro/components/interactive/UserButton/UserButton.astro", void 0);
var __freeze$1 = Object.freeze;
var __defProp$1 = Object.defineProperty;
var __template$1 = (cooked, raw) => __freeze$1(__defProp$1(cooked, "raw", { value: __freeze$1(raw || cooked.slice()) }));
var _a$1;
const $$Astro$4 = createAstro();
const $$MenuItemRenderer = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$MenuItemRenderer;
  const { label, href, open, clickIdentifier, parent } = Astro2.props;
  let labelIcon = "";
  if (Astro2.slots.has("label-icon")) {
    labelIcon = await Astro2.slots.render("label-icon");
  }
  const isDevMode = false;
  return renderTemplate(_a$1 || (_a$1 = __template$1(["<script>(function(){", "\nconst parentElement = document.currentScript.parentElement;\n\n// We used a web component in the `<UserButton.MenuItems>` component.\nconst hasParentMenuItem = parentElement.tagName.toLowerCase() === 'clerk-user-button-menu-items';\nif (!hasParentMenuItem) {\n  if (isDevMode) {\n    throw new Error(\n      `Clerk: <UserButton.MenuItems /> component can only accept <UserButton.Action /> and <UserButton.Link /> as its children. Any other provided component will be ignored.`\n    );\n  }\n  return\n}\n\n// Get the user button map from window that we set in the `<InternalUIComponentRenderer />`.\nconst userButtonComponentMap = window.__astro_clerk_component_props.get('user-button');\n\nlet userButton\nif (parent) {\n  userButton = document.querySelector(`[data-clerk-id=\"clerk-user-button-${parent}\"]`);\n} else {\n  userButton = document.querySelector('[data-clerk-id^=\"clerk-user-button\"]');\n}\n\nconst safeId = userButton.getAttribute('data-clerk-id');\nconst currentOptions = userButtonComponentMap.get(safeId);\n\nconst reorderItemsLabels = ['manageAccount', 'signOut'];\nconst isReorderItem = reorderItemsLabels.includes(label);\n\nlet newMenuItem = {\n  label,\n}\n\nif (!isReorderItem) {\n  newMenuItem = {\n    ...newMenuItem,\n    mountIcon: (el) => {\n      el.innerHTML = labelIcon\n    },\n    unmountIcon: () => { /* What to clean up? */}\n  }\n\n  if (href) {\n    newMenuItem.href = href;\n  } else if (open) {\n    newMenuItem.open = open.startsWith('/') ? open : `/${open}`;\n  } else if (clickIdentifier) {\n    const clickEvent = new CustomEvent('clerk:menu-item-click', { detail: clickIdentifier });\n    newMenuItem.onClick = () => {\n      document.dispatchEvent(clickEvent);\n    }\n  }\n}\n\nuserButtonComponentMap.set(safeId, {\n  ...currentOptions,\n  customMenuItems: [\n    ...(currentOptions?.customMenuItems ?? []),\n    newMenuItem,\n  ]\n})\n})();<\/script>"], ["<script>(function(){", "\nconst parentElement = document.currentScript.parentElement;\n\n// We used a web component in the \\`<UserButton.MenuItems>\\` component.\nconst hasParentMenuItem = parentElement.tagName.toLowerCase() === 'clerk-user-button-menu-items';\nif (!hasParentMenuItem) {\n  if (isDevMode) {\n    throw new Error(\n      \\`Clerk: <UserButton.MenuItems /> component can only accept <UserButton.Action /> and <UserButton.Link /> as its children. Any other provided component will be ignored.\\`\n    );\n  }\n  return\n}\n\n// Get the user button map from window that we set in the \\`<InternalUIComponentRenderer />\\`.\nconst userButtonComponentMap = window.__astro_clerk_component_props.get('user-button');\n\nlet userButton\nif (parent) {\n  userButton = document.querySelector(\\`[data-clerk-id=\"clerk-user-button-\\${parent}\"]\\`);\n} else {\n  userButton = document.querySelector('[data-clerk-id^=\"clerk-user-button\"]');\n}\n\nconst safeId = userButton.getAttribute('data-clerk-id');\nconst currentOptions = userButtonComponentMap.get(safeId);\n\nconst reorderItemsLabels = ['manageAccount', 'signOut'];\nconst isReorderItem = reorderItemsLabels.includes(label);\n\nlet newMenuItem = {\n  label,\n}\n\nif (!isReorderItem) {\n  newMenuItem = {\n    ...newMenuItem,\n    mountIcon: (el) => {\n      el.innerHTML = labelIcon\n    },\n    unmountIcon: () => { /* What to clean up? */}\n  }\n\n  if (href) {\n    newMenuItem.href = href;\n  } else if (open) {\n    newMenuItem.open = open.startsWith('/') ? open : \\`/\\${open}\\`;\n  } else if (clickIdentifier) {\n    const clickEvent = new CustomEvent('clerk:menu-item-click', { detail: clickIdentifier });\n    newMenuItem.onClick = () => {\n      document.dispatchEvent(clickEvent);\n    }\n  }\n}\n\nuserButtonComponentMap.set(safeId, {\n  ...currentOptions,\n  customMenuItems: [\n    ...(currentOptions?.customMenuItems ?? []),\n    newMenuItem,\n  ]\n})\n})();<\/script>"])), defineScriptVars({ label, href, open, clickIdentifier, labelIcon, isDevMode, parent }));
}, "C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/node_modules/@clerk/astro/components/interactive/UserButton/MenuItemRenderer.astro", void 0);
const $$Astro$3 = createAstro();
const $$UserButtonLink = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$UserButtonLink;
  const { label, href, parent } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "MenuItemRenderer", $$MenuItemRenderer, { "label": label, "href": href, "parent": parent }, { "label-icon": ($$result2) => renderTemplate`${renderSlot($$result2, $$slots["label-icon"])}` })}`;
}, "C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/node_modules/@clerk/astro/components/interactive/UserButton/UserButtonLink.astro", void 0);
const $$Astro$2 = createAstro();
const $$UserButtonAction = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$UserButtonAction;
  const { label, open, clickIdentifier, parent } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "MenuItemRenderer", $$MenuItemRenderer, { "label": label, "open": open, "clickIdentifier": clickIdentifier, "parent": parent }, { "label-icon": ($$result2) => renderTemplate`${renderSlot($$result2, $$slots["label-icon"])}` })}`;
}, "C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/node_modules/@clerk/astro/components/interactive/UserButton/UserButtonAction.astro", void 0);
const $$UserButtonMenuItems = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "clerk-user-button-menu-items", "clerk-user-button-menu-items", {}, { "default": () => renderTemplate` ${renderSlot($$result, $$slots["default"])} ` })} ${renderScript($$result, "C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/node_modules/@clerk/astro/components/interactive/UserButton/UserButtonMenuItems.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/node_modules/@clerk/astro/components/interactive/UserButton/UserButtonMenuItems.astro", void 0);
var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Astro$1 = createAstro();
const $$UserButtonUserProfilePage = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$UserButtonUserProfilePage;
  const { url, label, parent } = Astro2.props;
  let labelIcon = "";
  let content = "";
  if (Astro2.slots.has("label-icon")) {
    labelIcon = await Astro2.slots.render("label-icon");
  }
  if (Astro2.slots.has("default")) {
    content = await Astro2.slots.render("default");
  }
  return renderTemplate(_a || (_a = __template(["<script>(function(){", "\n// Get the user button map from window that we set in the `<InternalUIComponentRenderer />`.\nconst userButtonComponentMap = window.__astro_clerk_component_props.get('user-button');\n\nlet userButton\nif (parent) {\n  userButton = document.querySelector(`[data-clerk-id=\"clerk-user-button-${parent}\"]`);\n} else {\n  userButton = document.querySelector('[data-clerk-id^=\"clerk-user-button\"]');\n}\n\nconst safeId = userButton.getAttribute('data-clerk-id');\nconst currentOptions = userButtonComponentMap.get(safeId);\n\nconst newCustomPage = {\n  label,\n  url,\n  mountIcon: (el) => {\n    el.innerHTML = labelIcon\n  },\n  unmountIcon: () => { /* What to clean up? */},\n  mount: (el) => {\n    el.innerHTML = content\n  },\n  unmount: () => { /* What to clean up? */},\n}\n\nuserButtonComponentMap.set(safeId, {\n  ...currentOptions,\n  userProfileProps: {\n    customPages: [\n      ...(currentOptions?.userProfileProps?.customPages ?? []),\n      newCustomPage,\n    ]\n  }\n})\n})();<\/script>"], ["<script>(function(){", "\n// Get the user button map from window that we set in the \\`<InternalUIComponentRenderer />\\`.\nconst userButtonComponentMap = window.__astro_clerk_component_props.get('user-button');\n\nlet userButton\nif (parent) {\n  userButton = document.querySelector(\\`[data-clerk-id=\"clerk-user-button-\\${parent}\"]\\`);\n} else {\n  userButton = document.querySelector('[data-clerk-id^=\"clerk-user-button\"]');\n}\n\nconst safeId = userButton.getAttribute('data-clerk-id');\nconst currentOptions = userButtonComponentMap.get(safeId);\n\nconst newCustomPage = {\n  label,\n  url,\n  mountIcon: (el) => {\n    el.innerHTML = labelIcon\n  },\n  unmountIcon: () => { /* What to clean up? */},\n  mount: (el) => {\n    el.innerHTML = content\n  },\n  unmount: () => { /* What to clean up? */},\n}\n\nuserButtonComponentMap.set(safeId, {\n  ...currentOptions,\n  userProfileProps: {\n    customPages: [\n      ...(currentOptions?.userProfileProps?.customPages ?? []),\n      newCustomPage,\n    ]\n  }\n})\n})();<\/script>"])), defineScriptVars({ url, label, content, labelIcon, parent }));
}, "C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/node_modules/@clerk/astro/components/interactive/UserButton/UserButtonUserProfilePage.astro", void 0);
const UserButton = Object.assign($$UserButton, {
  MenuItems: $$UserButtonMenuItems,
  Link: $$UserButtonLink,
  Action: $$UserButtonAction,
  UserProfilePage: $$UserButtonUserProfilePage
});
const $$Navbar = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<nav class="navbar sticky-top shadow-lg py-3" style="background: linear-gradient(90deg, #ffecd2 0%, #fcb69f 100%);" data-astro-cid-5knycien> <div class="container-fluid d-flex align-items-center" data-astro-cid-5knycien> <a href="/" class="navbar-brand d-flex align-items-center gap-3" data-astro-cid-5knycien> <img src="/favicon.png" alt="Logo" width="40" height="40" class="rounded shadow-sm border border-2 border-white" data-astro-cid-5knycien> <span class="fs-3 fw-bold text-dark" style="letter-spacing: 2px; text-shadow: 1px 1px 8px #fff8;" data-astro-cid-5knycien>Hall of Fame</span> </a> <div class="d-flex align-items-center gap-3" data-astro-cid-5knycien> <a href="/setup" class="btn btn-outline-secondary px-3 py-2 fw-semibold" style="border-radius: 1.5rem;" data-astro-cid-5knycien> <i class="bi bi-gear me-2" data-astro-cid-5knycien></i>
Setup
</a> <a href="/upload" class="btn btn-gradient px-4 py-2 fw-semibold shadow-sm" style="background: linear-gradient(90deg, #f7971e 0%, #ffd200 100%); color: #222; border: none; border-radius: 2rem; transition: transform 0.1s;" data-astro-cid-5knycien> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-cloud-arrow-up me-2" viewBox="0 0 16 16" data-astro-cid-5knycien> <path fill-rule="evenodd" d="M8 0a5.53 5.53 0 0 0-5.473 6.01A4.002 4.002 0 0 0 4 16h8a4 4 0 0 0 .473-7.99A5.53 5.53 0 0 0 8 0Zm.5 7.5V12a.5.5 0 0 1-1 0V7.5H5.354a.5.5 0 0 1-.354-.854l2.146-2.147a.5.5 0 0 1 .708 0l2.146 2.147a.5.5 0 0 1-.354.854H8.5Z" data-astro-cid-5knycien></path> </svg>
Upload
</a> <span class="user-btn-scaled" data-astro-cid-5knycien> ${renderComponent($$result, "UserButton", UserButton, { "data-astro-cid-5knycien": true })} </span> </div> </div> </nav> `;
}, "C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/src/components/navbar.astro", void 0);
const $$Astro = createAstro();
const $$Dashboard = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Dashboard;
  const auth = Astro2.locals.auth();
  const userId = auth.userId;
  console.log("Dashboard auth info:", {
    userId,
    hasAuth: !!auth,
    authKeys: Object.keys(auth || {})
  });
  let userName = null;
  if (userId) {
    try {
      const response = await fetch(`${Astro2.url.origin}/api/user-simple`, {
        headers: {
          "Cookie": Astro2.request.headers.get("Cookie") || ""
        }
      });
      if (response.ok) {
        const userData = await response.json();
        userName = userData.displayName || `user-${userId.slice(-8)}`;
        console.log("User data fetched:", { userName, userData });
      } else {
        userName = `user-${userId.slice(-8)}`;
        console.log("User data fetch failed, using fallback:", userName);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      userName = `user-${userId.slice(-8)}`;
    }
  }
  const dbStatus = await checkDatabaseConnection();
  console.log("Database status:", dbStatus);
  let photos = [];
  let errorMessage = "";
  try {
    if (dbStatus.tableExists) {
      photos = await getPhotos();
    } else {
      errorMessage = dbStatus.message;
    }
  } catch (error) {
    console.error("Error al cargar fotos:", error);
    errorMessage = "Error al conectar con la base de datos";
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Galería de Memes" }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "Navbar", $$Navbar, {})} ${errorMessage && renderTemplate`${maybeRenderHead()}<div class="container-fluid p-4"> <div class="alert alert-warning" role="alert"> <h4 class="alert-heading">⚠️ Configuración requerida</h4> <p>${errorMessage}</p> <hr> <p class="mb-0">
Para configurar la base de datos, ejecuta el siguiente comando en tu proyecto de Supabase:
<br> <code class="bg-dark text-light p-2 d-block mt-2">
Copia el contenido de supabase-setup.sql y ejecútalo en el SQL Editor de Supabase
</code> </p> </div> </div>`}${renderComponent($$result2, "Gallery", null, { "photos": photos, "currentUserId": userId || void 0, "currentUserName": userName || void 0, "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/src/components/Gallery.tsx", "client:component-export": "default" })} ` })}`;
}, "C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/src/components/dashboard.astro", void 0);
export {
  $$Dashboard as $,
  $$InternalUIComponentRenderer as a
};
