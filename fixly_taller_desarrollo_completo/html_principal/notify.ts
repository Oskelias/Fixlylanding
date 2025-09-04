export interface Env {
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors() });
  }

  try {
    const { message } = await request.json();

    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
      return new Response(JSON.stringify({ ok: false, error: "Missing env vars" }), {
        status: 500, headers: cors()
      });
    }
    if (!message) {
      return new Response(JSON.stringify({ ok: false, error: "Missing message" }), {
        status: 400, headers: cors()
      });
    }

    const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: message })
    });
    const json = await res.json();

    return new Response(JSON.stringify(json), {
      status: res.ok ? 200 : 500,
      headers: cors()
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: "Bad JSON" }), { status: 400, headers: cors() });
  }
};

function cors() {
  return {
    "content-type": "application/json",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "POST, OPTIONS"
  };
}
