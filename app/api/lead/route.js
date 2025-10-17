export const runtime = 'edge';

function cors(origin){ const list=(process.env.ALLOWED_ORIGINS||'*').split(',').map(s=>s.trim()); const allow=list.includes('*')?'*':(list.includes(origin)?origin:(list[0]||'*')); return {'Access-Control-Allow-Origin':allow,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Max-Age':'86400'};}
function json(body,{status=200,origin='*'}={}){ return new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json',...cors(origin)}}); }
export async function OPTIONS(request){ return new Response(null,{headers:cors(request.headers.get('origin')||'*')}); }

export async function POST(request){
  const origin = request.headers.get('origin') || '*';
  let body; try{ body = await request.json(); }catch{ return json({ok:false,error:'Invalid JSON'},{status:400,origin}); }
  if ((body.honeypot||'').trim()!=='') return json({ok:false,error:'Bot rejected'},{status:400,origin});
  try{
    const AIRTABLE_API_KEY=process.env.AIRTABLE_API_KEY;
    const AIRTABLE_BASE_ID=process.env.AIRTABLE_BASE_ID;
    const AIRTABLE_TABLE=process.env.AIRTABLE_TABLE||'Leads';
    if(!AIRTABLE_API_KEY||!AIRTABLE_BASE_ID) return json({ok:true,airtableId:null,skipped:true},{origin});
    const fields={ ts:new Date().toISOString(), flow:body.flow||'', state:body.state||'', firstName:body.firstName||'', lastName:body.lastName||'', email:body.email||'', phone:body.phone||'', city:body.city||'', budget:body.budget||'', propertyType:body.propertyType||'', timeline:body.timeline||'', ndaAccepted:!!body.ndaAccepted, message:body.message||'', sourceUrl:body.sourceUrl||'', utm_source:body.utm?.source||'', utm_campaign:body.utm?.campaign||'', utm_medium:body.utm?.medium||'' };
    const rr = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE)}`, { method:'POST', headers:{'Authorization':`Bearer ${AIRTABLE_API_KEY}`,'Content-Type':'application/json'}, body: JSON.stringify({records:[{fields}]}) });
    if(!rr.ok) return json({ok:false,error:`Airtable ${rr.status}`},{status:502,origin});
    const jj = await rr.json();
    return json({ok:true,airtableId: jj.records?.[0]?.id || null},{origin});
  }catch(e){ return json({ok:false,error:e.message||'Airtable failed'},{status:502,origin}); }
}
