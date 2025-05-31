import { f as createComponent, g as createAstro, l as renderComponent, r as renderTemplate, m as maybeRenderHead, i as addAttribute } from "../chunks/astro/server_Dh3qN3cZ.mjs";
import "kleur/colors";
import { $ as $$Layout } from "../chunks/Layout_DalQmPku.mjs";
import { c as createTableIfNotExists, a as checkDatabaseConnection } from "../chunks/supabase_Brp4vljN.mjs";
import { renderers } from "../renderers.mjs";
const $$Astro = createAstro();
const $$CreateTable = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$CreateTable;
  let result = "";
  let success = false;
  if (Astro2.request.method === "POST") {
    try {
      const created = await createTableIfNotExists();
      if (created) {
        result = "Tabla creada exitosamente";
        success = true;
      } else {
        result = "Error al crear la tabla. Verifica la configuración.";
      }
    } catch (error) {
      result = `Error: ${error}`;
    }
  }
  const dbStatus = await checkDatabaseConnection();
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Crear Tabla - Galería de Memes" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container-fluid p-4"> <div class="row justify-content-center"> <div class="col-12 col-md-8 col-lg-6"> <div class="card shadow"> <div class="card-header bg-primary text-white"> <h4 class="mb-0"> <i class="bi bi-database me-2"></i>
Crear Tabla de Fotos
</h4> </div> <div class="card-body"> ${result && renderTemplate`<div${addAttribute(`alert ${success ? "alert-success" : "alert-danger"}`, "class")}> <i${addAttribute(`bi ${success ? "bi-check-circle" : "bi-x-circle"} me-2`, "class")}></i> ${result} </div>`} <div class="mb-4"> <h5>Estado Actual</h5> <div${addAttribute(`alert ${dbStatus.tableExists ? "alert-success" : "alert-warning"}`, "class")}> <i${addAttribute(`bi ${dbStatus.tableExists ? "bi-check-circle" : "bi-exclamation-triangle"} me-2`, "class")}></i> ${dbStatus.message} </div> </div> ${!dbStatus.tableExists && renderTemplate`<div> <h5>Crear Tabla Automáticamente</h5> <p>Puedes intentar crear la tabla automáticamente desde aquí:</p> <form method="POST"> <button type="submit" class="btn btn-primary me-2"> <i class="bi bi-database-add me-2"></i>
Crear Tabla
</button> </form> <hr class="my-4"> <h5>Crear Manualmente</h5> <p>Si el método automático no funciona, copia y ejecuta este SQL en Supabase:</p> <div class="bg-dark text-light p-3 rounded"> <pre><code>CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_data TEXT NOT NULL,
  image_name TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);</code></pre> </div> <div class="mt-3"> <h6>Pasos:</h6> <ol> <li>Ve a <a href="https://supabase.com/dashboard" target="_blank">Supabase Dashboard</a></li> <li>Selecciona tu proyecto</li> <li>Ve a "SQL Editor"</li> <li>Pega el código SQL de arriba</li> <li>Haz clic en "Run"</li> </ol> </div> </div>`} ${dbStatus.tableExists && renderTemplate`<div class="alert alert-success"> <i class="bi bi-check-circle me-2"></i>
¡La tabla ya existe! Puedes comenzar a usar la aplicación.
</div>`} <div class="d-grid gap-2 d-md-flex justify-content-md-end mt-4"> <a href="/setup" class="btn btn-secondary"> <i class="bi bi-arrow-left me-2"></i>
Volver a Setup
</a> <a href="/dashboard" class="btn btn-primary"> <i class="bi bi-house me-2"></i>
Ir al Dashboard
</a> </div> </div> </div> </div> </div> </div> ` })}`;
}, "C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/src/pages/create-table.astro", void 0);
const $$file = "C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/src/pages/create-table.astro";
const $$url = "/create-table";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$CreateTable,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
