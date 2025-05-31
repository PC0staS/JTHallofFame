import "@astrojs/internal-helpers/path";
import "kleur/colors";
import { w as NOOP_MIDDLEWARE_HEADER, x as decodeKey } from "./chunks/astro/server_Dh3qN3cZ.mjs";
import "clsx";
import "cookie";
import "./chunks/shared_ROG18RWD.mjs";
import "es-module-lexer";
import "html-escaper";
const NOOP_MIDDLEWARE_FN = async (_ctx, next) => {
  const response = await next();
  response.headers.set(NOOP_MIDDLEWARE_HEADER, "true");
  return response;
};
function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}
function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}
function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}
const manifest = deserializeManifest({"hrefRoot":"file:///C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/","cacheDir":"file:///C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/node_modules/.astro/","outDir":"file:///C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/dist/","srcDir":"file:///C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/src/","publicDir":"file:///C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/public/","buildClientDir":"file:///C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/dist/","buildServerDir":"file:///C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/.netlify/build/","adapterName":"@astrojs/netlify","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/page.i3_u1wtv.js"}],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/page.i3_u1wtv.js"}],"styles":[],"routeData":{"route":"/api/user","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/user\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"user","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/user.ts","pathname":"/api/user","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/page.i3_u1wtv.js"}],"styles":[],"routeData":{"route":"/api/user-simple","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/user-simple\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"user-simple","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/user-simple.ts","pathname":"/api/user-simple","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/page.i3_u1wtv.js"}],"styles":[{"type":"external","src":"/_astro/dashboard.BblBlVWA.css"}],"routeData":{"route":"/create-table","isIndex":false,"type":"page","pattern":"^\\/create-table\\/?$","segments":[[{"content":"create-table","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/create-table.astro","pathname":"/create-table","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/page.i3_u1wtv.js"}],"styles":[{"type":"inline","content":".btn-gradient[data-astro-cid-5knycien]:hover{transform:scale(1.05);box-shadow:0 4px 16px #fcb69f4d;background:linear-gradient(90deg,#ffd200,#f7971e);color:#111}.user-btn-scaled[data-astro-cid-5knycien]{transform:scale(1.5)}\n"},{"type":"external","src":"/_astro/dashboard.BblBlVWA.css"}],"routeData":{"route":"/dashboard","isIndex":false,"type":"page","pattern":"^\\/dashboard\\/?$","segments":[[{"content":"dashboard","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/dashboard.astro","pathname":"/dashboard","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/page.i3_u1wtv.js"}],"styles":[{"type":"external","src":"/_astro/dashboard.BblBlVWA.css"}],"routeData":{"route":"/health-check","isIndex":false,"type":"page","pattern":"^\\/health-check\\/?$","segments":[[{"content":"health-check","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/health-check.astro","pathname":"/health-check","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/page.i3_u1wtv.js"}],"styles":[{"type":"external","src":"/_astro/dashboard.BblBlVWA.css"}],"routeData":{"route":"/setup","isIndex":false,"type":"page","pattern":"^\\/setup\\/?$","segments":[[{"content":"setup","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/setup.astro","pathname":"/setup","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/page.i3_u1wtv.js"}],"styles":[],"routeData":{"route":"/test-db","isIndex":false,"type":"page","pattern":"^\\/test-db\\/?$","segments":[[{"content":"test-db","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/test-db.astro","pathname":"/test-db","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/page.i3_u1wtv.js"}],"styles":[{"type":"external","src":"/_astro/dashboard.BblBlVWA.css"}],"routeData":{"route":"/upload","isIndex":false,"type":"page","pattern":"^\\/upload\\/?$","segments":[[{"content":"upload","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/upload.astro","pathname":"/upload","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/page.i3_u1wtv.js"}],"styles":[{"type":"inline","content":".btn-gradient[data-astro-cid-5knycien]:hover{transform:scale(1.05);box-shadow:0 4px 16px #fcb69f4d;background:linear-gradient(90deg,#ffd200,#f7971e);color:#111}.user-btn-scaled[data-astro-cid-5knycien]{transform:scale(1.5)}\n"},{"type":"external","src":"/_astro/dashboard.BblBlVWA.css"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/src/pages/test-db.astro",{"propagation":"none","containsHead":true}],["C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/src/pages/dashboard.astro",{"propagation":"none","containsHead":true}],["C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/src/pages/index.astro",{"propagation":"none","containsHead":true}],["C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/src/pages/create-table.astro",{"propagation":"none","containsHead":true}],["C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/src/pages/health-check.astro",{"propagation":"none","containsHead":true}],["C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/src/pages/setup.astro",{"propagation":"none","containsHead":true}],["C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/src/pages/upload.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000astro-internal:middleware":"_astro-internal_middleware.mjs","\u0000noop-actions":"_noop-actions.mjs","\u0000@astro-page:src/pages/api/user@_@ts":"pages/api/user.astro.mjs","\u0000@astro-page:src/pages/api/user-simple@_@ts":"pages/api/user-simple.astro.mjs","\u0000@astro-page:src/pages/create-table@_@astro":"pages/create-table.astro.mjs","\u0000@astro-page:src/pages/dashboard@_@astro":"pages/dashboard.astro.mjs","\u0000@astro-page:src/pages/health-check@_@astro":"pages/health-check.astro.mjs","\u0000@astro-page:src/pages/setup@_@astro":"pages/setup.astro.mjs","\u0000@astro-page:src/pages/test-db@_@astro":"pages/test-db.astro.mjs","\u0000@astro-page:src/pages/upload@_@astro":"pages/upload.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_Dw4EbmHG.mjs","C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/node_modules/unstorage/drivers/fs-lite.mjs":"chunks/fs-lite_BcglG1vc.mjs","C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_BwEiGbqY.mjs","astro:scripts/before-hydration.js":"_astro/astro_scripts/before-hydration.js.BZWCJkNB.js","C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/src/components/Upload.tsx":"_astro/Upload.BWccV47n.js","C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/src/components/Gallery.tsx":"_astro/Gallery.CSsbe4-B.js","@astrojs/react/client.js":"_astro/client.BPIbHqJh.js","C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/src/pages/health-check.astro?astro&type=script&index=0&lang.ts":"_astro/health-check.astro_astro_type_script_index_0_lang.DTtH4STO.js","C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/src/pages/test-db.astro?astro&type=script&index=0&lang.ts":"_astro/test-db.astro_astro_type_script_index_0_lang.DL1m_VNx.js","C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/node_modules/@clerk/astro/components/control/ProtectCSR.astro?astro&type=script&index=0&lang.ts":"_astro/ProtectCSR.astro_astro_type_script_index_0_lang.DHhsEQjp.js","C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/node_modules/@clerk/astro/components/interactive/UserButton/UserButtonMenuItems.astro?astro&type=script&index=0&lang.ts":"_astro/UserButtonMenuItems.astro_astro_type_script_index_0_lang.DjJJDhXb.js","C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/node_modules/@clerk/astro/components/control/SignedInCSR.astro?astro&type=script&index=0&lang.ts":"_astro/SignedInCSR.astro_astro_type_script_index_0_lang.DUKBYtMH.js","C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/node_modules/@clerk/astro/components/control/SignedOutCSR.astro?astro&type=script&index=0&lang.ts":"_astro/SignedOutCSR.astro_astro_type_script_index_0_lang.DIDtSRiO.js","astro:scripts/page.js":"_astro/page.i3_u1wtv.js","\u0000astro:transitions/client":"_astro/client.Djg46rLP.js"},"inlinedScripts":[["C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/src/pages/health-check.astro?astro&type=script&index=0&lang.ts","document.addEventListener(\"DOMContentLoaded\",()=>{const s=performance.now(),o=document.getElementById(\"pageLoadTime\");o&&(o.textContent=Math.round(s).toString());const r=document.getElementById(\"memoryUsage\");if(r)if(\"memory\"in performance&&performance.memory){const e=performance.memory,t=Math.round(e.usedJSHeapSize/1024/1024);r.textContent=t.toString()}else r.textContent=\"N/A\";document.getElementById(\"createSampleBtn\")?.addEventListener(\"click\",async()=>{const e=document.getElementById(\"createSampleBtn\");if(e){e.disabled=!0,e.innerHTML='<i class=\"bi bi-hourglass-split\"></i> Creating...';try{const n=await(await fetch(\"/test-db\",{method:\"POST\",headers:{\"Content-Type\":\"application/json\"}})).json();if(n.success)e.innerHTML='<i class=\"bi bi-check-circle-fill\"></i> Success!',e.className=\"btn btn-success\",setTimeout(()=>{window.location.reload()},1e3);else throw new Error(n.error||\"Unknown error\")}catch(t){const n=t instanceof Error?t.message:\"Unknown error occurred\";e.innerHTML='<i class=\"bi bi-exclamation-triangle-fill\"></i> Error',e.className=\"btn btn-danger\",alert(\"Error: \"+n),setTimeout(()=>{e.disabled=!1,e.innerHTML='<i class=\"bi bi-plus-circle-fill\"></i> Create Sample Data',e.className=\"btn btn-outline-success\"},2e3)}}})});"],["C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/src/pages/test-db.astro?astro&type=script&index=0&lang.ts","document.getElementById(\"createSampleBtn\")?.addEventListener(\"click\",async()=>{const e=document.getElementById(\"createSampleBtn\");if(e){e.disabled=!0,e.textContent=\"Creating...\";try{const t=await(await fetch(\"/test-db\",{method:\"POST\",headers:{\"Content-Type\":\"application/json\"}})).json();t.success?(alert(\"Sample data created successfully! Refreshing page...\"),window.location.reload()):(alert(\"Error: \"+(t.error||\"Unknown error\")),e.disabled=!1,e.textContent=\"Create Sample Data\")}catch(r){const t=r instanceof Error?r.message:\"Unknown error occurred\";alert(\"Error: \"+t),e.disabled=!1,e.textContent=\"Create Sample Data\"}}});"],["C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/node_modules/@clerk/astro/components/interactive/UserButton/UserButtonMenuItems.astro?astro&type=script&index=0&lang.ts","class e extends HTMLElement{constructor(){super()}}customElements.define(\"clerk-user-button-menu-items\",e);"]],"assets":["/_astro/dashboard.BblBlVWA.css","/background.png","/favicon.png","/CSS/estilos.css","/_astro/BaseClerkControlElement.CHa7D9Ab.js","/_astro/browser.8cOdFYqr.js","/_astro/chunk-K6S4O6NY.RSQ76uOP.js","/_astro/client.BPIbHqJh.js","/_astro/client.Djg46rLP.js","/_astro/Gallery.CSsbe4-B.js","/_astro/index.BJEVNWhK.js","/_astro/index.BVOCwoKb.js","/_astro/page.i3_u1wtv.js","/_astro/preload-helper.BlTxHScW.js","/_astro/ProtectCSR.astro_astro_type_script_index_0_lang.DHhsEQjp.js","/_astro/SignedInCSR.astro_astro_type_script_index_0_lang.DUKBYtMH.js","/_astro/SignedOutCSR.astro_astro_type_script_index_0_lang.DIDtSRiO.js","/_astro/supabase.DvmKiyw-.js","/_astro/Upload.BWccV47n.js","/_astro/astro_scripts/before-hydration.js.BZWCJkNB.js","/_astro/page.i3_u1wtv.js"],"buildFormat":"directory","checkOrigin":true,"serverIslandNameMap":[],"key":"b1ki0gRn298zRaL31jJYkCVeT8P8DAXV19V1oj4W33w=","sessionConfig":{"driver":"fs-lite","options":{"base":"C:\\Users\\pablo\\OneDrive\\Documentos\\Proyectos\\memes\\node_modules\\.astro\\sessions"}}});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = () => import("./chunks/fs-lite_BcglG1vc.mjs");
export {
  manifest
};
