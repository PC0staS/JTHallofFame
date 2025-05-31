import { renderers } from "../../renderers.mjs";
const GET = async ({ locals }) => {
  const auth = locals.auth();
  if (!auth.userId) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const userData = {
      id: auth.userId,
      displayName: `user-${auth.userId.slice(-8)}`
    };
    return new Response(JSON.stringify(userData), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return new Response(JSON.stringify({
      error: "Failed to fetch user data",
      fallback: {
        id: auth.userId,
        displayName: `user-${auth.userId.slice(-8)}`
      }
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
