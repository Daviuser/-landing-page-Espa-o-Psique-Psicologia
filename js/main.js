/* ===== CONFIGURAÇÃO: troque pelos dados reais ===== */
const CONFIG = {
  whatsapp: '5500000000000', // DDI + DDD + número, só dígitos
  mensagem: 'Olá! Gostaria de agendar uma consulta no Espaço Psique.',
  instagram: 'https://instagram.com/espacopsique'
};

(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  /* links reais */
  $('#wa-btn').href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(CONFIG.mensagem)}`;
  $('#ig-link').href = CONFIG.instagram;
  $('#year').textContent = new Date().getFullYear();

  /* menu mobile */
  const burger = $('#burger'), nav = $('#nav');
  const toggle = open => {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => toggle(!nav.classList.contains('open')));
  $$('a', nav).forEach(a => a.addEventListener('click', () => toggle(false)));
  document.addEventListener('keydown', e => e.key === 'Escape' && toggle(false));

  /* reveal na entrada (IntersectionObserver) */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  if (reduce) return; // conteúdo já fica visível via CSS

  /* palavras reveladas conforme o scroll */
  const wordEls = $$('[data-words]').map(el => {
    const spans = el.textContent.trim().split(/\s+/).map(w => {
      const s = document.createElement('span'); s.textContent = w + ' '; return s;
    });
    el.textContent = ''; spans.forEach(s => el.appendChild(s));
    return { el, spans };
  });

  const editorial = $('[data-editorial]');
  const phrases = $$('.phrase', editorial);
  const bar = $('.progress i', editorial);
  const stage = $('.stage', editorial);
  const parallax = $$('[data-speed]');
  const masks = $$('.mask-img');
  const header = $('#header');
  const vh = () => window.innerHeight;

  function update() {
    const y = window.scrollY, h = vh();
    header.classList.toggle('solid', y > 40);

    /* palavras: progresso do bloco entre 85% e 35% da viewport */
    wordEls.forEach(({ el, spans }) => {
      const r = el.getBoundingClientRect();
      const p = clamp((h * 0.85 - r.top) / (h * 0.5 + r.height * 0.6));
      const n = spans.length;
      spans.forEach((s, i) => { s.style.opacity = (0.14 + 0.86 * clamp(p * (n + 4) - i, 0, 1)).toFixed(2); });
    });

    /* editorial: frases entram, ganham foco e saem */
    const er = editorial.getBoundingClientRect();
    const total = er.height - h;
    const p = clamp(-er.top / total);
    const seg = 1 / phrases.length;
    phrases.forEach((ph, i) => {
      const local = clamp((p - i * seg) / seg);
      let o = Math.min(clamp(local / 0.25), clamp((1 - local) / 0.25));
      if (i === 0 && p < seg) o = Math.min(1, clamp(local / 0.12 + 0.0) , clamp((1 - local) / 0.25));
      const out = local > 0.5 ? (local - 0.5) * 2 : 0;
      ph.style.opacity = o.toFixed(3);
      ph.style.transform = `translateY(${((1 - clamp(local / 0.25)) * 30 - out * 30).toFixed(1)}px)`;
      ph.style.filter = `blur(${((1 - o) * 8).toFixed(1)}px)`;
    });
    bar.style.transform = `scaleX(${p.toFixed(3)})`;
    stage.style.setProperty('--glow', (0.8 + p * 0.7).toFixed(2));

    /* parallax suave (desligado em telas pequenas para ficar leve) */
    if (window.innerWidth > 700) {
      parallax.forEach(el => {
        const r = el.getBoundingClientRect();
        const c = r.top + r.height / 2 - h / 2;
        el.style.transform = `translate3d(0,${(c * -parseFloat(el.dataset.speed)).toFixed(1)}px,0)`;
      });
    }

    /* imagens: máscara que abre com o scroll */
    masks.forEach(m => {
      const r = m.getBoundingClientRect();
      const t = clamp((h * 0.95 - r.top) / (h * 0.55));
      m.style.setProperty('--clip', ((1 - t) * 14).toFixed(2) + '%');
    });
  }

  let ticking = false;
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { update(); ticking = false; }); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
