import { d as createComponent, e as createAstro, l as renderHead, g as addAttribute, k as renderScript, r as renderTemplate } from "../chunks/astro/server_-cF_Yyy_.mjs";
import "kleur/colors";
import "clsx";
import { t as testTableAccess, b as createSampleData, g as getPhotos } from "../chunks/supabase_Qhyrp44l.mjs";
import { renderers } from "../renderers.mjs";
const $$Astro = createAstro();
const $$TestDb = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$TestDb;
  if (Astro2.request.method === "POST") {
    try {
      const tableTest2 = await testTableAccess();
      console.log("Table access test:", tableTest2);
      if (!tableTest2.success) {
        return new Response(JSON.stringify({
          error: "Cannot access table",
          details: tableTest2.message
        }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
      const sampleCreated = await createSampleData();
      if (sampleCreated) {
        const photos2 = await getPhotos();
        return new Response(JSON.stringify({
          success: true,
          message: "Sample data created successfully!",
          photoCount: photos2.length
        }), {
          headers: { "Content-Type": "application/json" }
        });
      } else {
        return new Response(JSON.stringify({
          error: "Failed to create sample data"
        }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    } catch (error) {
      return new Response(JSON.stringify({
        error: "Server error",
        details: error.message
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  const tableTest = await testTableAccess();
  const photos = await getPhotos();
  return renderTemplate`<html lang="es"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Database Test</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">${renderHead()}</head> <body> <div class="container mt-5"> <h1 class="mb-4">🧪 Database Test</h1> <div class="card mb-4"> <div class="card-header"> <h3>Table Access Test</h3> </div> <div class="card-body"> <div${addAttribute(`alert ${tableTest.success ? "alert-success" : "alert-danger"}`, "class")}> <strong>${tableTest.success ? "✅ Success" : "❌ Error"}:</strong> ${tableTest.message} ${tableTest.count !== void 0 && renderTemplate`<span> (Records: ${tableTest.count})</span>`} </div> </div> </div> <div class="card mb-4"> <div class="card-header"> <h3>Current Photos</h3> </div> <div class="card-body"> <p><strong>Total photos:</strong> ${photos.length}</p> ${photos.length === 0 && renderTemplate`<div> <p class="text-muted">No photos found. Click the button below to create sample data.</p> <button id="createSampleBtn" class="btn btn-primary">Create Sample Data</button> </div>`} ${photos.length > 0 && renderTemplate`<div> <h5>Photos in database:</h5> <ul class="list-group"> ${photos.map((photo) => renderTemplate`<li class="list-group-item"> <strong>${photo.title}</strong> - ${photo.image_name} <br> <small class="text-muted">Uploaded by: ${photo.uploaded_by} at ${new Date(photo.uploaded_at).toLocaleString()}</small> </li>`)} </ul> </div>`} </div> </div> <div class="mt-4"> <a href="/dashboard" class="btn btn-success">Go to Gallery</a> <a href="/setup" class="btn btn-info">Setup Page</a> </div> </div> ${renderScript($$result, "C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/src/pages/test-db.astro?astro&type=script&index=0&lang.ts")} </body> </html>`;
}, "C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/src/pages/test-db.astro", void 0);
const $$file = "C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/src/pages/test-db.astro";
const $$url = "/test-db";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$TestDb,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
