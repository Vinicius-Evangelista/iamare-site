// iamaré · comportamento da loja
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- WhatsApp ----------
  const number = document.body.dataset.whatsapp;
  const waUrl = text => `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
  const generalMessage = 'Olá, iamaré! Vim pelo site e gostaria de conhecer as peças disponíveis.';
  const pieceMessage = (piece, price) =>
    `Olá, iamaré! Tenho interesse na peça ${piece} (${price}). Estou em SP e gostaria de saber sobre disponibilidade e entrega.`;

  const toast = document.querySelector('.toast');
  let toastTimer;
  const showToast = text => {
    toast.textContent = text;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2800);
  };

  document.querySelectorAll('[data-wa]').forEach(link => {
    const { piece, price } = link.dataset;
    link.href = waUrl(piece ? pieceMessage(piece, price) : generalMessage);
    link.target = '_blank';
    link.rel = 'noopener';
    if (piece) link.setAttribute('aria-label', `Pedir ${piece}, ${price}, pelo WhatsApp (abre em nova aba)`);
    link.addEventListener('click', () => {
      showToast(piece ? `Abrindo o WhatsApp com o pedido de ${piece}…` : 'Abrindo o WhatsApp…');
    });
  });

  // ---------- SVGs da marca, inseridos inline para animar cada traço ----------
  document.querySelectorAll('[data-svg]').forEach(async slot => {
    try {
      const res = await fetch(slot.dataset.svg, { cache: 'no-cache' });
      slot.innerHTML = await res.text();
      const svg = slot.querySelector('svg');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
      if (slot.dataset.fit) svg.setAttribute('preserveAspectRatio', slot.dataset.fit);
      requestAnimationFrame(() => slot.classList.add('is-ready'));
    } catch {
      slot.classList.add('is-ready');
    }
  });

  // ---------- Título do hero em palavras ----------
  document.querySelectorAll('.js-split').forEach(el => {
    let i = 0;
    const wrap = node => {
      const w = document.createElement('span');
      w.className = 'w';
      const inner = document.createElement('span');
      inner.style.setProperty('--w', i++);
      inner.append(node);
      w.append(inner);
      return w;
    };
    const parts = [];
    el.childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split(/(\s+)/).forEach(chunk => {
          if (!chunk) return;
          parts.push(/^\s+$/.test(chunk) ? document.createTextNode(chunk) : wrap(document.createTextNode(chunk)));
        });
      } else {
        parts.push(wrap(node.cloneNode(true)));
      }
    });
    el.replaceChildren(...parts);
  });

  requestAnimationFrame(() => document.body.classList.add('is-loaded'));

  // ---------- Revelação ao rolar ----------
  const revealables = document.querySelectorAll('[data-reveal], .divider, .essence__symbol');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(el => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    revealables.forEach(el => io.observe(el));
  }

  // ---------- Header e botão flutuante ----------
  const header = document.querySelector('.header');
  const float = document.querySelector('.wa-float');
  const hero = document.querySelector('.hero');
  let lastY = window.scrollY;

  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 8);
    header.classList.toggle('is-hidden', y > lastY && y > 480);
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Some no hero, na peça e no fechamento, que já têm o próprio botão de WhatsApp.
  const inView = new Map();
  const floatObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => inView.set(entry.target, entry.isIntersecting));
    float.classList.toggle('is-visible', ![...inView.values()].some(Boolean));
  }, { threshold: 0.15 });
  [hero, ...document.querySelectorAll('.piece'), document.querySelector('.closing'), document.querySelector('.footer')]
    .forEach(el => floatObserver.observe(el));
})();
