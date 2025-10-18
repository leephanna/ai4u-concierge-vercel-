export const runtime = 'edge';

/**
 * POST /api/route
 * body: { prompt: string, mode?: 'copy'|'code'|'extract'|'search', confidence?: 'normal'|'high', prefer?: 'claude'|'gpt' }
 * returns: { ok, modelUsed, text, alt? }  (alt present when confidence='high' to compare)
 *
 * Env:
 *  - OPENAI_API_KEY        (for GPT)
 *  - ANTHROPIC_API_KEY     (for Claude)
 */

function cors(origin){
  const list=(process.env.ALLOWED_ORIGINS||'*').split(',').map(s=>s.trim());
  const allow=list.includes('*')?'*':(list.includes(origin)?origin:(list[0]||'*'));
  return {'Access-Control-Allow-Origin':allow,'Access-Control-Allow-Methods':'POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Max-Age':'86400'};
}
function json(b,{status=200,origin='*'}={}){return new Response(JSON.stringify(b),{status,headers:{'Content-Type':'application/json',...cors(origin)}});}
export async function OPTIONS(req){return new Response(null,{headers:cors(req.headers.get('origin')||'*')});}

async function callGPT(prompt, sys="You are a concise expert assistant.", temperature=0.3){
  const key = process.env.OPENAI_API_KEY;
  if(!key) throw new Error('Missing OPENAI_API_KEY');
  const r = await fetch('https://api.openai.com/v1/chat/completions',{
    method:'POST',
    headers:{'Authorization':`Bearer ${key}`,'Content-Type':'application/json'},
    body: JSON.stringify({
      model: 'gpt-4o-mini', // cheap & capable; swap if you prefer
      temperature,
      messages:[{role:'system',content:sys},{role:'user',content:prompt}]
    })
  });
  const j = await r.json();
  if(!r.ok) throw new Error(`OpenAI ${r.status}: ${j.error?.message||'error'}`);
  return j.choices?.[0]?.message?.content?.trim()||'';
}

async function callClaude(prompt, sys="You are a precise, compliance-aware expert.", temperature=0.3){
  const key = process.env.ANTHROPIC_API_KEY;
  if(!key) throw new Error('Missing ANTHROPIC_API_KEY');
  const r = await fetch('https://api.anthropic.com/v1/messages',{
    method:'POST',
    headers:{
      'x-api-key': key,
      'anthropic-version':'2023-06-01',
      'content-type':'application/json'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20240620',
      temperature,
      system: sys,
      max_tokens: 1200,
      messages:[{role:'user',content:prompt}]
    })
  });
  const j = await r.json();
  if(!r.ok) throw new Error(`Anthropic ${r.status}: ${j.error?.message||'error'}`);
  return (j.content?.[0]?.text||'').trim();
}

function chooseModel({mode, prompt, prefer}){
  if(prefer) return prefer; // user override
  const p = (prompt||'').toLowerCase();
  if(mode==='code' || p.includes('next.js') || p.includes('vercel') || p.includes('cloudflare') || p.includes('api route')) return 'gpt';
  if(mode==='copy' || p.includes('tone') || p.includes('mn') && p.includes('wi') || p.includes('eho') || p.includes('compliance')) return 'claude';
  if(mode==='extract' || p.includes('summarize') || p.includes('turn this doc into')) return 'claude';
  // default
  return 'gpt';
}

export async function POST(req){
  const origin = req.headers.get('origin') || '*';
  let body; try{ body = await req.json(); }catch{ return json({ok:false,error:'Invalid JSON'},{status:400,origin}); }
  const { prompt, mode='copy', confidence='normal', prefer } = body || {};
  if(!prompt) return json({ok:false,error:'Missing prompt'},{status:400,origin});

  const primary = chooseModel({mode, prompt, prefer});
  try{
    if(confidence==='high'){
      // run both and return both so you can compare/merge on the client
      const [a,b] = await Promise.allSettled([
        primary==='gpt' ? callGPT(prompt) : callClaude(prompt),
        primary==='gpt' ? callClaude(prompt) : callGPT(prompt)
      ]);
      const best = a.status==='fulfilled' ? a.value : (b.status==='fulfilled' ? b.value : '');
      const alt  = b.status==='fulfilled' ? b.value : (a.status==='fulfilled' ? a.value : '');
      if(!best) return json({ok:false,error:'Both providers failed'},{status:502,origin});
      return json({ok:true,modelUsed:primary,text:best,alt});
    }else{
      const text = primary==='gpt' ? await callGPT(prompt) : await callClaude(prompt);
      return json({ok:true,modelUsed:primary,text});
    }
  }catch(e){
    // fallback to the other model automatically
    try{
      const other = primary==='gpt' ? 'claude' : 'gpt';
      const text = other==='gpt' ? await callGPT(prompt) : await callClaude(prompt);
      return json({ok:true,modelUsed:other,text,fallback:true});
    }catch(e2){
      return json({ok:false,error:String(e2?.message||e?.message||'Provider error')},{status:502,origin});
    }
  }
}
