export const runtime = 'edge';

function cors(origin) {
  const list = (process.env.ALLOWED_ORIGINS || '*').split(',').map(s=>s.trim());
  const allow = list.includes('*') ? '*' : (list.includes(origin) ? origin : (list[0] || '*'));
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}
function json(body, { status = 200, origin = '*' } = {}) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type':'application/json', ...cors(origin) }});
}
function b64(s){ return btoa(s); }

export async function OPTIONS(request){ return new Response(null, { headers: cors(request.headers.get('origin')||'*') }); }

export async function POST(request) {
  const origin = request.headers.get('origin') || '*';
  let body; try { body = await request.json(); } catch { return json({ ok:false, error:'Invalid JSON' }, { status:400, origin }); }
  if ((body.honeypot||'').trim() !== '') return json({ ok:false, error:'Bot rejected' }, { status:400, origin });
  if (!body.flow || !body.firstName || !body.lastName || !body.email) return json({ ok:false, error:'Missing required fields' }, { status:400, origin });

  const ALLOWED_STATES = new Set(['MN','WI']);
  if (!ALLOWED_STATES.has(body.state)) body.waitlist = true;

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) return json({ ok:false, error:'Missing RESEND_API_KEY' }, { status:500, origin });
  const RESEND_FROM = process.env.RESEND_FROM || 'Concierge <concierge@mg.ai4utech.com>';
  const LEAD_EMAIL = process.env.LEAD_EMAIL || 'jamiemcneely@leonhardtteam.com';

  const S = (v)=> (v??'').toString().replace(/</g,'&lt;');
  const subject = `[Concierge Lead][${S(body.state||'N/A')}] ${(body.flow||'').toUpperCase()} — ${S(body.firstName)} ${S(body.lastName)}`;
  const html = `
    <h2>New ${S(body.flow)} lead (${S(body.state)})</h2>
    <p><b>Name:</b> ${S(body.firstName)} ${S(body.lastName)}<br/>
    <b>Email:</b> ${S(body.email)} · <b>Phone:</b> ${S(body.phone||'—')}<br/>
    <b>City:</b> ${S(body.city||'—')} · <b>Budget:</b> ${S(body.budget||'—')} · <b>Type:</b> ${S(body.propertyType||'—')}<br/>
    <b>Timeline:</b> ${S(body.timeline||'—')} · <b>NDA:</b> ${body.ndaAccepted?'Yes':'No'}<br/>
    <b>Source:</b> ${S(body.sourceUrl||'—')}</p>
    <p><b>Message:</b><br/>${S(body.message)}</p>
    <hr/><small>MN/WI beta. Brokerage name clear & conspicuous. EHO.</small>`;

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type':'application/json' },
    body: JSON.stringify({
      from: RESEND_FROM, to: LEAD_EMAIL, subject, html,
      attachments: [{ filename:'lead.json', content: b64(JSON.stringify(body,null,2)) }]
    })
  });
  if (!r.ok) return json({ ok:false, error:`Resend ${r.status}` }, { status:502, origin });

  // Airtable mirror (best-effort)
  let airId = null;
  try {
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
    const AIRTABLE_TABLE = process.env.AIRTABLE_TABLE || 'Leads';
    if (AIRTABLE_API_KEY && AIRTABLE_BASE_ID) {
      const fields = {
        ts: new Date().toISOString(),
        flow: body.flow, state: body.state,
        firstName: body.firstName, lastName: body.lastName,
        email: body.email, phone: body.phone||'',
        city: body.city||'', budget: body.budget||'',
        propertyType: body.propertyType||'', timeline: body.timeline||'',
        ndaAccepted: !!body.ndaAccepted, message: body.message||'',
        sourceUrl: body.sourceUrl||'',
        utm_source: body.utm?.source||'', utm_campaign: body.utm?.campaign||'', utm_medium: body.utm?.medium||''
      };
      const rr = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE)}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}`, 'Content-Type':'application/json' },
        body: JSON.stringify({ records: [{ fields }] })
      });
      if (rr.ok) { const jj = await rr.json(); airId = jj.records?.[0]?.id || null; }
    }
  } catch {}

  const j = await r.json();
  return json({ ok:true, id:j.id||'sent', airtableId: airId, waitlist: !!body.waitlist }, { origin });
}
