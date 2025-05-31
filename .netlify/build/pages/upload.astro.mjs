import { d as createComponent, e as createAstro, j as renderComponent, r as renderTemplate } from "../chunks/astro/server_-cF_Yyy_.mjs";
import "kleur/colors";
import { $ as $$Layout } from "../chunks/Layout_DE5luIqj.mjs";
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { u as uploadPhoto } from "../chunks/supabase_Qhyrp44l.mjs";
import { renderers } from "../renderers.mjs";
function Upload({ onUploadSuccess, userId, userName }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        setError("Por favor selecciona solo archivos de imagen");
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("El archivo es demasiado grande. Máximo 5MB");
        return;
      }
      setFile(selectedFile);
      setError("");
      const reader = new FileReader();
      reader.onload = (e2) => {
        setPreview(e2.target?.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title.trim() || !userId) {
      setError("Por favor completa todos los campos");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const uploaderName = userName || userId;
      const result = await uploadPhoto(file, title.trim(), uploaderName);
      if (result) {
        setTitle("");
        setFile(null);
        setPreview("");
        if (onUploadSuccess) {
          onUploadSuccess();
        } else {
          window.location.href = "/dashboard";
        }
        alert("¡Imagen subida exitosamente!");
      } else {
        setError("Error al subir la imagen. Inténtalo de nuevo");
      }
    } catch (error2) {
      console.error("Upload error:", error2);
      setError("Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };
  const clearPreview = () => {
    setFile(null);
    setPreview("");
    setError("");
  };
  return /* @__PURE__ */ jsx("div", { className: "container-fluid p-4", children: /* @__PURE__ */ jsx("div", { className: "row justify-content-center", children: /* @__PURE__ */ jsx("div", { className: "col-12 col-md-8 col-lg-6", children: /* @__PURE__ */ jsxs("div", { className: "card shadow", children: [
    /* @__PURE__ */ jsx("div", { className: "card-header bg-primary text-white", children: /* @__PURE__ */ jsxs("h4", { className: "mb-0", children: [
      /* @__PURE__ */ jsx("i", { className: "bi bi-cloud-upload me-2" }),
      "Subir Nueva Imagen"
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "card-body", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "title", className: "form-label", children: "Título del meme" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            className: "form-control",
            id: "title",
            value: title,
            onChange: (e) => setTitle(e.target.value),
            placeholder: "Dale un título divertido a tu meme...",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "file", className: "form-label", children: "Seleccionar imagen" }),
        "                  ",
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "file",
            className: "form-control form-control-custom",
            id: "file",
            accept: "image/*",
            onChange: handleFileChange,
            required: !file
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "form-text", children: "Formatos soportados: JPG, PNG, GIF, WebP. Máximo 5MB." })
      ] }),
      preview && /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
        /* @__PURE__ */ jsx("label", { className: "form-label", children: "Vista previa" }),
        /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
          "                      ",
          /* @__PURE__ */ jsx(
            "img",
            {
              src: preview,
              alt: "Preview",
              className: "img-fluid rounded border preview-image",
              style: { maxHeight: "300px", width: "100%", objectFit: "contain" }
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "btn btn-sm btn-danger position-absolute top-0 end-0 m-2",
              onClick: clearPreview,
              children: /* @__PURE__ */ jsx("i", { className: "bi bi-x" })
            }
          )
        ] })
      ] }),
      error && /* @__PURE__ */ jsxs("div", { className: "alert alert-danger", role: "alert", children: [
        /* @__PURE__ */ jsx("i", { className: "bi bi-exclamation-triangle me-2" }),
        error
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "d-grid gap-2 d-md-flex justify-content-md-end", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            className: "btn btn-secondary",
            onClick: () => window.history.back(),
            disabled: uploading,
            children: [
              /* @__PURE__ */ jsx("i", { className: "bi bi-arrow-left me-2" }),
              "Cancelar"
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            className: "btn btn-primary",
            disabled: uploading || !file || !title.trim(),
            children: uploading ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("span", { className: "spinner-border spinner-border-sm me-2", role: "status" }),
              "Subiendo..."
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("i", { className: "bi bi-upload me-2" }),
              "Subir Imagen"
            ] })
          }
        )
      ] })
    ] }) })
  ] }) }) }) });
}
const $$Astro = createAstro();
const prerender = false;
const $$Upload = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Upload;
  const auth = Astro2.locals.auth();
  const userId = auth.userId;
  if (!userId) {
    return Astro2.redirect("/");
  }
  let userName = `user-${userId.slice(-8)}`;
  try {
    const response = await fetch(`${Astro2.url.origin}/api/user-simple`, {
      headers: {
        "Cookie": Astro2.request.headers.get("Cookie") || ""
      }
    });
    if (response.ok) {
      const userData = await response.json();
      userName = userData.displayName || userName;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Subir Imagen - Galería de Memes" }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "UploadComponent", Upload, { "client:load": true, "userId": userId, "userName": userName, "client:component-hydration": "load", "client:component-path": "C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/src/components/Upload.tsx", "client:component-export": "default" })} ` })}`;
}, "C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/src/pages/upload.astro", void 0);
const $$file = "C:/Users/pablo/OneDrive/Documentos/Proyectos/memes/src/pages/upload.astro";
const $$url = "/upload";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Upload,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
