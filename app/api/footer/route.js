export const runtime = 'edge';

function cors(origin){ const list=(process.env.ALLOWED_ORIGINS||'*').split(',').map(s=>s.trim()); const allow=list.includes('*')?'*':(list.includes(origin)?origin:(list[0]||'*')); return {'Access-Control-Allow-Origin':allow,'Access-Control-Allow-Methods':'GET, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Max-Age':'86400'}; }

function footerJS(){
  const d = {
    brokerage: process.env.FOOTER_BROKERAGE || 'Coldwell Banker Realty',
    team:      process.env.FOOTER_TEAM || 'Leonhardt Team',
    agent:     process.env.FOOTER_AGENT || 'Jamie McNeely',
    office:    process.env.FOOTER_OFFICE || 'Forest Lake Office — 56 East Broadway Ave. Ste. 104, Forest Lake, MN 55025',
    email:     process.env.FOOTER_EMAIL || 'jamiemcneely@leonhardtteam.com',
    work:      process.env.FOOTER_WORK || '+1 612-662-8312',
    cell:      process.env.FOOTER_CELL || '+1 651-788-5864',
    site:      process.env.FOOTER_SITE || 'https://www.leonhardtteam.com'
  };
  return `(()=>{try{
    const s=document.currentScript;
    const cfg={ brokerage:s?.dataset?.brokerage||'${d.brokerage}', team:s?.dataset?.team||'${d.team}', agent:s?.dataset?.agent||'${d.agent}', office:s?.dataset?.office||'${d.office}', email:s?.dataset?.email||'${d.email}', work:s?.dataset?.work||'${d.work}', cell:s?.dataset?.cell||'${d.cell}', site:s?.dataset?.site||'${d.site}' };
    const tel=(v)=>v.replace(/[^+\\d]/g,'');
    const html=\\`
<footer class="ai4u-footer">
  <div class="ai4u-wrap">
    <div class="ai4u-left">
      <div class="ai4u-brand">AI4U Concierge × <strong>\\${cfg.brokerage}</strong></div>
      <div class="ai4u-lic">Real Estate Team: \\${cfg.team} • Licensed in Minnesota & Wisconsin</div>
      <div class="ai4u-contacts">
        <b>\\${cfg.agent}</b> • Work: <a href="tel:\\${tel(cfg.work)}">\\${cfg.work}</a> • Cell: <a href="tel:\\${tel(cfg.cell)}">\\${cfg.cell}</a><br/>
        Email: <a href="mailto:\\${cfg.email}">\\${cfg.email}</a> • Website: <a href="\\${cfg.site}" target="_blank" rel="noopener">\\${cfg.site.replace(/^https?:\\\\/\\\\//,'')}</a><br/>
        <span class="ai4u-office">\\${cfg.office}</span>
      </div>
    </div>
    <div class="ai4u-right">
      <div class="ai4u-eho" aria-label="Equal Housing Opportunity">
        <svg width="36" height="36" viewBox="0 0 24 24" role="img" aria-label="Equal Housing Icon" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3l9 7h-3v8H6v-8H3l9-7zM7 12h10v2H7v-2zm0 3h10v2H7v-2z" fill="currentColor"/>
        </svg>
        <span>Equal Housing Opportunity</span>
      </div>
    </div>
  </div>
  <div class="ai4u-fine">
    Brokerage of record: <strong>\\${cfg.brokerage}</strong>. Advertising complies with MN & WI rules—brokerage name clearly and conspicuously displayed. Not intended to solicit those under contract. © 2025 AI4U, LLC.
  </div>
</footer>
<style>
.ai4u-footer{font:14px/1.5 system-ui,Segoe UI,Roboto,Arial,sans-serif;color:#0f172a;background:#f8fafc;border-top:1px solid #e2e8f0}
.ai4u-wrap{max-width:1100px;margin:0 auto;padding:16px 20px;display:flex;gap:16px;align-items:center;justify-content:space-between;flex-wrap:wrap}
.ai4u-brand{font-weight:700}
.ai4u-lic,.ai4u-contacts{opacity:.9}
.ai4u-right{display:flex;align-items:center;gap:8px}
.ai4u-eho{display:flex;align-items:center;gap:8px}
.ai4u-fine{max-width:1100px;margin:0 auto;padding:8px 20px 16px;opacity:.75}
@media (max-width:640px){.ai4u-wrap{flex-direction:column;align-items:flex-start}}
</style>\\`;
    const mount=document.createElement('div'); mount.innerHTML=html.trim(); document.body.appendChild(mount);
  }catch(e){console.error('Footer inject failed',e)}})();`;
}

export async function OPTIONS(request){ return new Response(null,{headers:cors(request.headers.get('origin')||'*')}); }
export async function GET(request){
  const origin = request.headers.get('origin') || '*';
  return new Response(footerJS(), { status:200, headers:{ 'Content-Type':'application/javascript; charset=utf-8', ...cors(origin) }});
}
