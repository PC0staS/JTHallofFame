import { d as createComponent, j as renderComponent, r as renderTemplate, m as maybeRenderHead, g as addAttribute } from "../chunks/astro/server_-cF_Yyy_.mjs";
import "kleur/colors";
import { $ as $$Layout } from "../chunks/Layout_DE5luIqj.mjs";
import { a as checkDatabaseConnection, t as testTableAccess, b as createSampleData } from "../chunks/supabase_Qhyrp44l.mjs";
import { renderers } from "../renderers.mjs";
const $$Setup = createComponent(async ($$result, $$props, $$slots) => {
  const dbStatus = await checkDatabaseConnection();
  const tableTest = await testTableAccess();
  let sampleDataCreated = false;
  let sampleDataError = "";
  if (tableTest.success && tableTest.count === 0) {
    try {
      const created = await createSampleData();
      sampleDataCreated = created;
    } catch (error) {
      sampleDataError = String(error);
    }
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Configuración - Galería de Memes" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container-fluid p-4"> <div class="row justify-content-center"> <div class="col-12 col-md-8 col-lg-6"> <div class="card shadow"> <div class="card-header bg-primary text-white"> <h4 class="mb-0"> <i class="bi bi-gear me-2"></i>
Estado de la Base de Datos
</h4> </div> <div class="card-body"> <!-- Estado de Conexión --> <div class="mb-4"> <h5>Conexión a Supabase</h5> <div${addAttribute(`alert ${dbStatus.connected ? "alert-success" : "alert-danger"}`, "class")}> <i${addAttribute(`bi ${dbStatus.connected ? "bi-check-circle" : "bi-x-circle"} me-2`, "class")}></i> ${dbStatus.connected ? "Conectado" : "No conectado"} </div> </div> <!-- Estado de la Tabla --> <div class="mb-4"> <h5>Tabla 'photos'</h5> <div${addAttribute(`alert ${dbStatus.tableExists ? "alert-success" : "alert-warning"}`, "class")}> <i${addAttribute(`bi ${dbStatus.tableExists ? "bi-check-circle" : "bi-exclamation-triangle"} me-2`, "class")}></i> ${dbStatus.tableExists ? "Tabla existe" : "Tabla no existe"} </div> ${!dbStatus.tableExists && renderTemplate`<div class="alert alert-info"> <h6>¿Cómo crear la tabla?</h6> <p class="mb-2">Tienes dos opciones:</p> <div class="d-grid gap-2 mb-3"> <a href="/create-table" class="btn btn-primary"> <i class="bi bi-magic me-2"></i>
Crear Automáticamente
</a> </div> <p><strong>O manualmente:</strong></p> <ol> <li>Ve a tu proyecto en <a href="https://supabase.com/dashboard" target="_blank">Supabase Dashboard</a></li> <li>Ve a "SQL Editor"</li> <li>Copia y ejecuta el siguiente SQL:</li> </ol> <pre class="bg-dark text-light p-3 rounded mt-2"><code>CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_data TEXT NOT NULL,
  image_name TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);</code></pre> </div>`} </div> <!-- Datos de Ejemplo --> ${dbStatus.tableExists && renderTemplate`<div class="mb-4"> <h5>Datos de Ejemplo</h5> ${sampleDataCreated && renderTemplate`<div class="alert alert-success"> <i class="bi bi-check-circle me-2"></i>
Datos de ejemplo creados exitosamente
</div>`} ${sampleDataError && renderTemplate`<div class="alert alert-danger"> <i class="bi bi-x-circle me-2"></i>
Error al crear datos de ejemplo: ${sampleDataError} </div>`} </div>`} <!-- Mensaje General --> <div class="alert alert-info"> <strong>Estado:</strong> ${dbStatus.message} </div> <!-- Botones de Navegación --> <div class="d-grid gap-2 d-md-flex justify-content-md-end mt-4"> <a href="/dashboard" class="btn btn-primary"> <i class="bi bi-house me-2"></i>
Ir al Dashboard
</a> <button onclick="window.location.reload()" class="btn btn-secondary"> <i class="bi bi-arrow-clockwise me-2"></i>
Verificar Nuevamente
</button> </div> </div> </div> </div> </div> </div> ` })}`;
}, "C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/src/pages/setup.astro", void 0);
const $$file = "C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/src/pages/setup.astro";
const $$url = "/setup";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Setup,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
