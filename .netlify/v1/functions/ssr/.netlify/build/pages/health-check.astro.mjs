import { d as createComponent, e as createAstro, j as renderComponent, r as renderTemplate, m as maybeRenderHead, g as addAttribute, k as renderScript } from "../chunks/astro/server_-cF_Yyy_.mjs";
import "kleur/colors";
import { $ as $$Layout } from "../chunks/Layout_DE5luIqj.mjs";
import { t as testTableAccess, g as getPhotos } from "../chunks/supabase_Qhyrp44l.mjs";
import { renderers } from "../renderers.mjs";
const $$Astro = createAstro();
const $$HealthCheck = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$HealthCheck;
  const tableTest = await testTableAccess();
  const photos = await getPhotos();
  const currentTime = (/* @__PURE__ */ new Date()).toLocaleString();
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "🧪 Complete System Test - MakeItMeme" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container mt-5 fade-in"> <div class="row"> <div class="col-12"> <div class="custom-card p-4 mb-4"> <h1 class="text-center mb-4"> <i class="bi bi-gear-fill text-primary"></i>
System Health Check
</h1> <p class="text-center text-muted">
Last checked: ${currentTime} </p> </div> </div> </div> <div class="row"> <!-- Database Status --> <div class="col-md-6 mb-4"> <div class="custom-card p-4 h-100"> <h3 class="mb-3"> <i class="bi bi-database-fill"></i>
Database Status
</h3> <div${addAttribute(`alert ${tableTest.success ? "alert-success" : "alert-danger"} alert-custom`, "class")}> <strong>${tableTest.success ? "✅ Connected" : "❌ Error"}:</strong> ${tableTest.message} ${tableTest.count !== void 0 && renderTemplate`<div>Records: ${tableTest.count}</div>`} </div> <div class="mt-3"> <h5>Photo Count: <span class="badge bg-primary">${photos.length}</span></h5> ${photos.length > 0 && renderTemplate`<div class="mt-2"> <small class="text-muted">
Latest: ${photos[0]?.title || "No title"}
(${new Date(photos[0]?.uploaded_at || "").toLocaleDateString()})
</small> </div>`} </div> </div> </div> <!-- Quick Actions --> <div class="col-md-6 mb-4"> <div class="custom-card p-4 h-100"> <h3 class="mb-3"> <i class="bi bi-lightning-fill"></i>
Quick Actions
</h3> <div class="d-grid gap-2"> <a href="/dashboard" class="btn btn-custom"> <i class="bi bi-grid-3x3-gap-fill"></i>
View Gallery
</a> <a href="/upload" class="btn btn-outline-primary"> <i class="bi bi-cloud-upload-fill"></i>
Upload Photo
</a> <button id="createSampleBtn" class="btn btn-outline-success"> <i class="bi bi-plus-circle-fill"></i>
Create Sample Data
</button> <a href="/setup" class="btn btn-outline-info"> <i class="bi bi-tools"></i>
Setup Page
</a> </div> </div> </div> </div> <!-- System Components Status --> <div class="row"> <div class="col-12 mb-4"> <div class="custom-card p-4"> <h3 class="mb-3"> <i class="bi bi-check2-square"></i>
Component Status
</h3> <div class="row"> <div class="col-md-3 col-sm-6 mb-3"> <div class="text-center"> <i class="bi bi-server text-success fs-1"></i> <h6 class="mt-2">Astro Server</h6> <span class="badge bg-success">Running</span> </div> </div> <div class="col-md-3 col-sm-6 mb-3"> <div class="text-center"> <i class="bi bi-shield-lock-fill text-primary fs-1"></i> <h6 class="mt-2">Clerk Auth</h6> <span class="badge bg-primary">Active</span> </div> </div> <div class="col-md-3 col-sm-6 mb-3"> <div class="text-center"> <i${addAttribute(`bi bi-database-fill ${tableTest.success ? "text-success" : "text-danger"} fs-1`, "class")}></i> <h6 class="mt-2">Supabase DB</h6> <span${addAttribute(`badge ${tableTest.success ? "bg-success" : "bg-danger"}`, "class")}> ${tableTest.success ? "Connected" : "Error"} </span> </div> </div> <div class="col-md-3 col-sm-6 mb-3"> <div class="text-center"> <i class="bi bi-palette-fill text-info fs-1"></i> <h6 class="mt-2">Bootstrap UI</h6> <span class="badge bg-info">Loaded</span> </div> </div> </div> </div> </div> </div> <!-- Recent Photos Preview --> ${photos.length > 0 && renderTemplate`<div class="row"> <div class="col-12 mb-4"> <div class="custom-card p-4"> <h3 class="mb-3"> <i class="bi bi-images"></i>
Recent Photos Preview
</h3> <div class="row"> ${photos.slice(0, 4).map((photo) => renderTemplate`<div class="col-md-3 col-sm-6 mb-3"> <div class="card"> <img${addAttribute(photo.image_data, "src")} class="card-img-top"${addAttribute(photo.title, "alt")} style="height: 150px; object-fit: cover;"> <div class="card-body p-2"> <h6 class="card-title mb-1">${photo.title}</h6> <small class="text-muted">${photo.uploaded_by}</small> </div> </div> </div>`)} </div> </div> </div> </div>`} <!-- Performance Metrics --> <div class="row"> <div class="col-12 mb-4"> <div class="custom-card p-4"> <h3 class="mb-3"> <i class="bi bi-speedometer2"></i>
System Info
</h3> <div class="row text-center"> <div class="col-md-4 mb-3"> <h4 class="text-primary" id="pageLoadTime">--</h4> <p class="mb-0">Page Load Time (ms)</p> </div> <div class="col-md-4 mb-3"> <h4 class="text-success">${photos.length}</h4> <p class="mb-0">Total Images</p> </div> <div class="col-md-4 mb-3"> <h4 class="text-info" id="memoryUsage">--</h4> <p class="mb-0">Memory Usage (MB)</p> </div> </div> </div> </div> </div> <!-- Navigation --> <div class="row"> <div class="col-12 text-center"> <div class="custom-card p-3"> <a href="/" class="btn btn-outline-primary me-2"> <i class="bi bi-house-fill"></i>
Home
</a> <a href="/dashboard" class="btn btn-primary me-2"> <i class="bi bi-grid-3x3-gap-fill"></i>
Gallery
</a> <a href="/upload" class="btn btn-success"> <i class="bi bi-cloud-upload-fill"></i>
Upload
</a> </div> </div> </div> </div> ${renderScript($$result2, "C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/src/pages/health-check.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/src/pages/health-check.astro", void 0);
const $$file = "C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/src/pages/health-check.astro";
const $$url = "/health-check";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$HealthCheck,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
