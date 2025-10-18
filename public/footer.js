(()=>{try{
  var s=document.currentScript;
  var cfg={
    brokerage:(s&&s.dataset&&s.dataset.brokerage)||"Coldwell Banker Realty",
    team:(s&&s.dataset&&s.dataset.team)||"Leonhardt Team",
    agent:(s&&s.dataset&&s.dataset.agent)||"Jamie McNeely",
    office:(s&&s.dataset&&s.dataset.office)||"Forest Lake Office — 56 East Broadway Ave. Ste. 104, Forest Lake, MN 55025",
    email:(s&&s.dataset&&s.dataset.email)||"jamiemcneely@leonhardtteam.com",
    work:(s&&s.dataset&&s.dataset.work)||"+1 612-662-8312",
    cell:(s&&s.dataset&&s.dataset.cell)||"+1 651-788-5864",
    site:(s&&s.dataset&&s.dataset.site)||"https://www.leonhardtteam.com"
  };
  var tel=function(v){return (v||"").replace(/[^+\d]/g,"");};
  var html =
    '<footer class="ai4u-footer">' +
      '<div class="ai4u-wrap">' +
        '<div class="ai4u-left">' +
          '<div class="ai4u-brand">AI4U Concierge × <strong>'+cfg.brokerage+'</strong></div>' +
          '<div class="ai4u-lic">Real Estate Team: '+cfg.team+' • Licensed in Minnesota & Wisconsin</div>' +
          '<div class="ai4u-contacts">' +
            '<b>'+cfg.agent+'</b> • Work: <a href="tel:'+tel(cfg.work)+'">'+cfg.work+'</a> • Cell: <a href="tel:'+tel(cfg.cell)+'">'+cfg.cell+'</a><br/>' +
            'Email: <a href="mailto:'+cfg.email+'">'+cfg.email+'</a> • Website: <a href="'+cfg.site+'" target="_blank" rel="noopener">'+cfg.site.replace(/^https?:\/\/(www\.)?/,"")+'</a><br/>' +
            '<span class="ai4u-office">'+cfg.office+'</span>' +
          '</div>' +
        '</div>' +
        '<div class="ai4u-right"><div class="ai4u-eho" aria-label="Equal Housing Opportunity">' +
          '<svg width="36" height="36" viewBox="0 0 24 24" role="img" aria-label="Equal Housing Icon" xmlns="http://www.w3.org/2000/svg"><path d="M12 3l9 7h-3v8H6v-8H3l9-7zM7 12h10v2H7v-2zm0 3h10v2H7v-2z" fill="currentColor"/></svg>' +
          '<span>Equal Housing Opportunity</span>' +
        '</div></div>' +
      '</div>' +
      '<div class="ai4u-fine">Brokerage of record: <strong>'+cfg.brokerage+'</strong>. Advertising complies with MN & WI rules—brokerage name clearly and conspicuously displayed. Not intended to solicit those under contract. © 2025 AI4U, LLC.</div>' +
    '</footer>' +
    '<style>' +
      '.ai4u-footer{font:14px/1.5 system-ui,Segoe UI,Roboto,Arial,sans-serif;color:#0f172a;background:#f8fafc;border-top:1px solid #e2e8f0}' +
      '.ai4u-wrap{max-width:1100px;margin:0 auto;padding:16px 20px;display:flex;gap:16px;align-items:center;justify-content:space-between;flex-wrap:wrap}' +
      '.ai4u-brand{font-weight:700}' +
      '.ai4u-lic,.ai4u-contacts{opacity:.9}' +
      '.ai4u-right{display:flex;align-items:center;gap:8px}' +
      '.ai4u-eho{display:flex;align-items:center;gap:8px}' +
      '.ai4u-fine{max-width:1100px;margin:0 auto;padding:8px 20px 16px;opacity:.75}' +
      '@media (max-width:640px){.ai4u-wrap{flex-direction:column;align-items:flex-start}}' +
    '</style>';
  var mount=document.createElement('div'); mount.innerHTML=html; document.body.appendChild(mount);
}catch(e){console.error('Footer inject failed',e);}})();
