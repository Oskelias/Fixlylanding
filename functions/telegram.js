export async function onRequestPost(context) {
  try {
    const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = context.env;
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing env' }), { status: 500 });
    }
    const body = await context.request.json();
    const name = (body?.name || '').toString().trim().slice(0,120);
    const phone = (body?.phone || '').toString().trim().slice(0,60);
    const message = (body?.message || '').toString().trim().slice(0,2000);
    const source = (body?.source || 'landing_modal_integrado_v3').toString().trim().slice(0,80);
    if (!name || !message) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid payload' }), { status: 400 });
    }
    const ip = context.request.headers.get('cf-connecting-ip') || '0.0.0.0';
    const ua = context.request.headers.get('user-agent') || '';
    const text = `🆕 Nueva consulta (${source})
👤 ${name}
📞 ${phone || '—'}
🌐 IP: ${ip}
🧭 UA: ${ua}
💬 ${message}`;
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const tgRes = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text }) });
    const tgJson = await tgRes.json();
    if (!tgJson.ok) return new Response(JSON.stringify({ ok:false, error:'Telegram API error', detail: tgJson }), { status: 502 });
    return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ ok:false, error: err?.message || 'Unknown error' }), { status: 500 });
  }
}