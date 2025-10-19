'use client';
import { useEffect, useMemo, useRef, useState } from 'react';

export default function Page() {
  // Market variant from ?market=wayzata|madison
  const [market, setMarket] = useState('wayzata');
  useEffect(() => {
    const m = new URLSearchParams(window.location.search).get('market');
    if (m && ['wayzata','madison'].includes(m.toLowerCase())) setMarket(m.toLowerCase());
  }, []);

  // Capture UTM once
  const utm = useMemo(() => {
    const p = new URLSearchParams(window.location.search);
    return { source: p.get('utm_source')||'', medium: p.get('utm_medium')||'', campaign: p.get('utm_campaign')||'' };
  }, []);

  const dlgRef = useRef(null);
  const [toast, setToast] = useState({ type:'', msg:'' });
  const [busy, setBusy] = useState(false);

  async function postJSON(url, data){
    const r = await fetch(url,{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) });
    const j = await r.json(); if(!r.ok || !j.ok) throw new Error(j.error||'Request failed'); return j;
  }

  async function submitTour(e){
    e.preventDefault();
    const f = e.currentTarget;
    const payload = {
      flow:'privateTour',
      firstName:f.firstName.value, lastName:f.lastName.value,
      email:f.email.value, phone:f.phone.value,
      state:f.state.value, city:f.city.value,
      budget:f.budget.value, date:f.date.value,
      message:f.message.value, ndaAccepted:f.nda.checked,
      sourceUrl: location.href, utm, honeypot: f.company.value || ''
    };
    setBusy(true); setToast({type:'', msg:''});
    try{
      await postJSON('/api/email', payload);
      await postJSON('/api/lead',  payload);
      setToast({type:'ok', msg:'Request sent — we’ll reach out shortly.'});
      f.reset(); setTimeout(()=>dlgRef.current?.close(), 800);
    }catch(err){ setToast({type:'err', msg:'Error: '+err.message}); }
    finally{ setBusy(false); }
  }

  const hero = market==='madison'
    ? { title:'Madison & Lake Country Private Concierge',
        blurb:'Quiet scouting across Shorewood Hills, Maple Bluff, and lakes Mendota • Monona.',
        bg:'linear-gradient(135deg,#eef2ff,#fdf2f8)' }
    : { title:'Wayzata & Lake Minnetonka Private Concierge',
        blurb:'Discreet buyer discovery and off-market previews around Deephaven, Orono, Tonka Bay.',
        bg:'linear-gradient(135deg,#ecfeff,#f0fdf4)' };

  return (
    <main style={{fontFamily:'system-ui,Segoe UI,Roboto,Arial', color:'#0f172a'}}>
      {/* HERO */}
      <section style={{padding:'64px 20px', background: hero.bg}}>
        <div style={{maxWidth:960, margin:'0 auto'}}>
          <h1 style={{margin:0, fontSize:44, lineHeight:1.1}}>{hero.title}</h1>
          <p style={{margin:'12px 0 18px', opacity:.9}}>{hero.blurb}</p>
          <div style={{display:'flex', gap:12, flexWrap:'wrap'}}>
            <a href="#retainer" style={{background:'#111827',color:'#fff',textDecoration:'none',padding:'12px 18px',borderRadius:10}}>Start Retainer</a>
            <button onClick={()=>dlgRef.current?.showModal()} style={{padding:'12px 18px',borderRadius:10,border:'1px solid #e5e7eb',background:'#fff'}}>Request Private Tour</button>
            <small style={{opacity:.7}}>MN & WI only • Equal Housing Opportunity</small>
          </div>
        </div>
      </section>

      {/* RETAINER */}
      <section id="retainer" style={{padding:'28px 20px',maxWidth:960,margin:'28px auto',border:'1px solid #e5e7eb',borderRadius:16,background:'#fff'}}>
        <h2 style={{margin:'0 0 8px',fontSize:28}}>Private Client Retainer — Minnesota & Wisconsin</h2>
        <p style={{margin:'0 0 12px',opacity:.9}}>
          Work directly with <b>Jamie McNeely</b> and the <b>Leonhardt Team</b> for discreet discovery, off-market previews, and white-glove transaction support.
        </p>
        <ul style={{margin:'0 0 16px 18px'}}>
          <li>UHNW intake & confidentiality (optional NDA)</li>
          <li>Wayzata/Lake Minnetonka & Madison/Lake Country scouting</li>
          <li>Private tours, seller introductions, negotiation strategy</li>
        </ul>
        <div style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'center'}}>
          {/* TODO: replace with your real Stripe Payment Link */}
          <a id="stripe-btn" href="https://buy.stripe.com/REPLACE_WITH_YOUR_PAYMENT_LINK"
             style={{display:'inline-block',padding:'12px 18px',borderRadius:10,background:'#111827',color:'#fff',textDecoration:'none'}}>
             Start Retainer
          </a>
          <small style={{opacity:.75}}>Brokerage: Coldwell Banker Realty. Not intended to solicit those under contract. EHO.</small>
        </div>
      </section>

      {/* DIALOG */}
      <dialog ref={dlgRef} style={{border:'none',borderRadius:16,maxWidth:520,width:'92vw',padding:0}}>
        <form onSubmit={submitTour} style={{padding:20}}>
          <h3 style={{margin:'0 0 8px',fontSize:22}}>Request a Private Tour</h3>
          <p style={{margin:'0 0 12px',opacity:.8}}>MN & WI only (beta). We’ll respond discreetly.</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <input name="firstName" placeholder="First name" required />
            <input name="lastName" placeholder="Last name" required />
            <input name="email" type="email" placeholder="Email" required style={{gridColumn:'1/3'}} />
            <input name="phone" placeholder="Phone" />
            <select name="state" required><option value="">State</option><option>MN</option><option>WI</option></select>
            <input name="city" placeholder="City / Lake area" style={{gridColumn:'1/3'}} />
            <input name="date" type="date" style={{gridColumn:'1/3'}} />
            <input name="budget" placeholder="Budget (optional)" style={{gridColumn:'1/3'}} />
            <textarea name="message" placeholder="Anything specific to see?" rows={3} style={{gridColumn:'1/3'}}></textarea>
          </div>
          <label style={{display:'block',margin:'10px 0'}}><input type="checkbox" name="nda" /> Request NDA</label>
          {/* Honeypot */}
          <input type="text" name="company" style={{display:'none'}} tabIndex={-1} autoComplete="off" />
          <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:8}}>
            <button type="button" onClick={()=>dlgRef.current?.close()}>Cancel</button>
            <button type="submit" disabled={busy} style={{background:'#111827',color:'#fff',border:'none',padding:'10px 14px',borderRadius:10}}>
              {busy ? 'Sending…' : 'Send'}
            </button>
          </div>
          {toast.msg && <div style={{marginTop:10,color:toast.type==='ok'?'#065f46':'#7f1d1d'}}>{toast.msg}</div>}
        </form>
      </dialog>

      {/* Project-served brand footer */}
      <script defer src="/footer.js"></script>
    </main>
  );
}
