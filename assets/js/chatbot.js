/* Exonol Pharmaceuticals — website assistant (runs in the browser, no server needed).
   Answers come from the KB below. Edit the text there to change what the assistant says. */
(function () {
  if (window.__exonolBot) return; window.__exonolBot = true;
  const EX = window.EXONOL || {};
  const WA = EX.whatsapp || 'https://wa.me/917393044779';
  const PHONE = EX.phone || '+91 73930 44779';
  const EMAIL = EX.email || 'contact@exonolpharma.com';
  const STORE = EX.store || 'https://store.exonolpharma.com/';
  const link = (href, text) => `<a href="${href}"${/^https?:/.test(href) ? ' target="_blank" rel="noopener"' : ''}>${text}</a>`;

  /* Questions about doses, side effects or treatment are always sent to a doctor or pharmacist. */
  const MEDICAL = /(dose|dosage|how many|how much|side ?effect|pregnan|breast ?feed|child|kid|interact|overdose|can i take|should i take|safe to|alcohol|missed|allerg(y|ic) to|symptom|treat my|cure|prescri)/i;
  const MEDICAL_REPLY = `I can’t give medical advice, including doses, side effects or whether a medicine is right for you. Please ask your doctor or pharmacist. All Exonol medicines are prescription medicines and should be used only under the guidance of a registered medical practitioner.`;

  const KB = [
    { k: /(hello|hi\b|hey|namaste|good (morning|evening|afternoon))/i,
      a: `Hello! I can help with our company, divisions and medicines, stockists, partnerships and careers. What would you like to know?` },
    { k: /(exozine|levocetirizine|anti.?allerg|antihistamine|urticaria|itch)/i,
      a: `<b>EXOZINE 5mg Tablets</b> (Levocetirizine Dihydrochloride Tablets IP 5 mg) is in our Anti-Allergic division. ${link('exozine-5mg-tablets.html', 'View EXOZINE 5mg')}` },
    { k: /(exzole|itraconazole|anti.?fung|fungal|ringworm|dermatophyt)/i,
      a: `<b>EXZOLE-SB 130mg Capsules</b> (Itraconazole Capsules IP 130 mg, Supra Bioavailable) is in our Anti-Fungal division. ${link('exzole-sb-130mg-capsules.html', 'View EXZOLE-SB 130mg')}` },
    { k: /(edox|doxycycline|antibiotic|acne|rosacea|ssti)/i,
      a: `<b>EDOX-LB Capsules</b> (Doxycycline 100 mg + Lactic Acid Bacillus 5 Billion Spores) is in our Anti-Biotic division. ${link('edox-lb-capsules.html', 'View EDOX-LB')}` },
    { k: /(division|therapeutic|categor)/i,
      a: `We have three divisions: <b>Anti-Allergic</b> (EXOZINE 5mg), <b>Anti-Fungal</b> (EXZOLE-SB 130mg) and <b>Anti-Biotic</b> (EDOX-LB). ${link('divisions.html', 'See all divisions')}` },
    { k: /(medicine|product|brand|portfolio|range|tablet|capsule)/i,
      a: `Our available brands are EXOZINE 5mg Tablets, EXZOLE-SB 130mg Capsules and EDOX-LB Capsules. ${link('medicines.html', 'Browse medicines')}` },
    { k: /(stockist|distributor|dealer|where.*(buy|get)|lucknow|availab|wholesale)/i,
      a: `Our registered stockists in Lucknow are <b>Adapt Healthcare Pvt. Ltd.</b> (Chowk) and <b>Adapt Pharma</b> (Aminabad). ${link('company.html#business', 'See addresses and phone numbers')}` },
    { k: /(order|e-?pharmacy|online|deliver|purchase|buy)/i,
      a: `You can order Exonol medicines on our E-Pharmacy with a valid prescription. ${link(STORE, 'Open E-Pharmacy')}` },
    { k: /(international|export|partner|collaborat|distribution|cphi|iphex|overseas|global)/i,
      a: `We welcome partnerships in India and abroad. You can meet us at CPHI and iPHEX, or reach the team directly. ${link('international.html#partner', 'Partner with us')} · ${link(WA, 'WhatsApp us')}` },
    { k: /(career|job|vacanc|hiring|opening|cv|resume|intern|work (with|for|at))/i,
      a: `We’d love to hear from you. ${link('careers.html#apply', 'Send your CV')} on our Careers page.` },
    { k: /(licen|certif|gst|20b|21b|quality|manufactur|windlas|unimarck|gmp|plant)/i,
      a: `Our medicines are made by established manufacturers Windlas Biotech and Unimarck Healthcare. We hold Form 20B and Form 21B wholesale drug licences and GST registration. ${link('company.html#quality', 'See Quality')}` },
    { k: /(profile|brochure|pdf|deck)/i,
      a: `You can download our company profile from the Company page. ${link('company.html', 'Go to Company')}` },
    { k: /(about|company|who are you|exonol|name|exon|mission|vision|value)/i,
      a: `Exonol Pharmaceuticals Pvt. Ltd. is a Mumbai-based company making patient-focused, high-quality medicines. Our name comes from the Exon — the part of DNA that does the work. ${link('company.html', 'About the company')}` },
    { k: /(contact|phone|call|email|mail|address|office|reach|whatsapp|number)/i,
      a: `Call ${link('tel:' + (EX.tel || '+917393044779'), PHONE)}, email ${link('mailto:' + EMAIL, EMAIL)} or ${link(WA, 'chat on WhatsApp')}. Our head office is at WeWork Enam Sambhav, BKC, Mumbai.` },
    { k: /(thank|thanks|great|ok|okay|bye)/i,
      a: `You’re welcome! Anything else I can help with?` }
  ];
  const FALLBACK = `I don’t have an answer for that yet. Our team can help — ${link(WA, 'chat on WhatsApp')}, call ${PHONE} or use the ${link('contact.html', 'contact form')}.`;
  const CHIPS = ['Our divisions', 'Where can I buy?', 'Partner with Exonol', 'Careers', 'Contact the team'];

  function reply(q) {
    if (MEDICAL.test(q)) return MEDICAL_REPLY;
    const hit = KB.find(x => x.k.test(q));
    return hit ? hit.a : FALLBACK;
  }

  /* ---------- UI ---------- */
  const root = document.createElement('div');
  root.className = 'xb';
  root.innerHTML = `
    <button class="xb-fab" type="button" aria-expanded="false" aria-controls="xb-panel" aria-label="Chat with Exonol">
      <svg class="xb-i1" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.2 3.6c-.5.4-1.3.1-1.3-.6V16A2.5 2.5 0 0 1 4 13.5z" fill="currentColor"/><circle cx="8.5" cy="9.6" r="1.2" fill="#005A90"/><circle cx="12" cy="9.6" r="1.2" fill="#005A90"/><circle cx="15.5" cy="9.6" r="1.2" fill="#005A90"/></svg>
      <svg class="xb-i2" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
    </button>
    <section class="xb-panel" id="xb-panel" role="dialog" aria-label="Exonol assistant" hidden>
      <header class="xb-head">
        <span class="xb-av"><svg viewBox="0 0 22 23" aria-hidden="true"><use href="#exm"/></svg></span>
        <div><b>Exonol Assistant</b><small>Usually answers instantly</small></div>
        <a class="xb-wa" href="${WA}" target="_blank" rel="noopener" aria-label="Chat with our team on WhatsApp"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#wa"/></svg></a>
      </header>
      <p class="xb-note">General information only — not medical advice. For doses or treatment, please ask your doctor or pharmacist.</p>
      <div class="xb-log" aria-live="polite"></div>
      <div class="xb-chips"></div>
      <form class="xb-form">
        <label class="sr-only" for="xb-in">Type your question</label>
        <input id="xb-in" autocomplete="off" placeholder="Ask about Exonol…" maxlength="300">
        <button type="submit" aria-label="Send"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12l16-8-6 16-2.5-6.5z" fill="currentColor"/></svg></button>
      </form>
    </section>`;
  document.body.appendChild(root);

  const fab = root.querySelector('.xb-fab');
  const panel = root.querySelector('.xb-panel');
  const log = root.querySelector('.xb-log');
  const chips = root.querySelector('.xb-chips');
  const form = root.querySelector('.xb-form');
  const input = root.querySelector('#xb-in');

  function add(who, html) {
    const m = document.createElement('div');
    m.className = 'xb-msg ' + who;
    if (who === 'me') m.textContent = html; else m.innerHTML = html;
    log.appendChild(m);
    log.scrollTop = log.scrollHeight;
  }
  function ask(q) {
    q = q.trim(); if (!q) return;
    add('me', q);
    const t = document.createElement('div'); t.className = 'xb-msg bot typing'; t.innerHTML = '<i></i><i></i><i></i>';
    log.appendChild(t); log.scrollTop = log.scrollHeight;
    setTimeout(() => { t.remove(); add('bot', reply(q)); }, 450);
  }
  CHIPS.forEach(c => {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = c;
    b.addEventListener('click', () => ask(c));
    chips.appendChild(b);
  });
  let greeted = false;
  function toggle(open) {
    root.classList.toggle('open', open);
    panel.hidden = !open;
    fab.setAttribute('aria-expanded', open);
    if (open && !greeted) { greeted = true; add('bot', 'Hi! I’m the Exonol assistant. Ask me about our divisions, stockists, partnerships or careers.'); }
    if (open) setTimeout(() => input.focus(), 50);
  }
  fab.addEventListener('click', () => toggle(!root.classList.contains('open')));
  form.addEventListener('submit', (e) => { e.preventDefault(); ask(input.value); input.value = ''; });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && root.classList.contains('open')) { toggle(false); fab.focus(); } });
})();
