/**
 * Cloudflare Worker: Render Backend & Database Keep-Alive
 * 
 * Schedule: Runs every 10 minutes (cron: */10 * * * *)
 * Prevents Render free/starter tiers from sleeping after 15 minutes of inactivity.
 */

export default {
  // 1. Cron Trigger Handler
  async scheduled(event, env, ctx) {
    const backendUrl = env.BACKEND_URL || "https://api.arohahouse.com";
    const publishableKey = env.PUBLISHABLE_KEY || "";

    console.log(`[Keep-Alive] Triggered at ${new Date().toISOString()} for ${backendUrl}`);

    const tasks = [];

    // Task A: Ping /health to keep Render web container running
    tasks.push(
      fetch(`${backendUrl}/health`, {
        method: "GET",
        headers: {
          "User-Agent": "Cloudflare-Worker-KeepAlive/1.0",
        },
      })
        .then((res) => {
          console.log(`[Keep-Alive] /health responded: ${res.status}`);
          return { endpoint: "/health", status: res.status, ok: res.ok };
        })
        .catch((err) => {
          console.error(`[Keep-Alive] /health failed:`, err.message);
          return { endpoint: "/health", error: err.message };
        })
    );

    // Task B: Query 1 product to keep Postgres DB connection pool active
    const dbHeaders = {
      "User-Agent": "Cloudflare-Worker-KeepAlive/1.0",
    };
    if (publishableKey) {
      dbHeaders["x-publishable-api-key"] = publishableKey;
    }

    tasks.push(
      fetch(`${backendUrl}/store/products?limit=1`, {
        method: "GET",
        headers: dbHeaders,
      })
        .then((res) => {
          console.log(`[Keep-Alive] /store/products responded: ${res.status}`);
          return { endpoint: "/store/products", status: res.status, ok: res.ok };
        })
        .catch((err) => {
          console.error(`[Keep-Alive] /store/products failed:`, err.message);
          return { endpoint: "/store/products", error: err.message };
        })
    );

    ctx.waitUntil(Promise.all(tasks));
  },

  // 2. HTTP Handler (for manual testing via browser / curl)
  async fetch(request, env, ctx) {
    const backendUrl = env.BACKEND_URL || "https://api.arohahouse.com";
    return new Response(
      JSON.stringify(
        {
          service: "Render Keep-Alive Cloudflare Worker",
          target: backendUrl,
          status: "active",
          schedule: "*/10 * * * * (Every 10 minutes)",
          currentTime: new Date().toISOString(),
        },
        null,
        2
      ),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  },
};
