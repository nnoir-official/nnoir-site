/* ============================================================
   N-noir HP — main.js
   ============================================================ */

/* ----------------------------------------------------------
   NAV: スクロールで背景切り替え
   ---------------------------------------------------------- */
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
});

/* ----------------------------------------------------------
   ハンバーガーメニュー
   ---------------------------------------------------------- */
const hamburger    = document.getElementById('hamburger');
const drawer       = document.getElementById('mobile-drawer');
const overlay      = document.getElementById('drawer-overlay');
const drawerLinks  = document.querySelectorAll('.nav-drawer-links a');

function openDrawer() {
  hamburger.classList.add('active');
  drawer.classList.add('open');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  hamburger.classList.remove('active');
  drawer.classList.remove('open');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  drawer.classList.contains('open') ? closeDrawer() : openDrawer();
});

overlay.addEventListener('click', closeDrawer);

drawerLinks.forEach(link => {
  link.addEventListener('click', closeDrawer);
});

/* ----------------------------------------------------------
   フェードインアニメーション（Intersection Observer）
   ---------------------------------------------------------- */
const fadeEls = document.querySelectorAll('.fade-in');

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

fadeEls.forEach(el => fadeObserver.observe(el));

/* ----------------------------------------------------------
   ライトボックス
   ---------------------------------------------------------- */
function openLightbox(src) {
  const lb  = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  img.src = src;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

/* ----------------------------------------------------------
   パーティクルキャンバス（ハートが漂う）
   ---------------------------------------------------------- */
(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const PINK = 'rgba(255, 51, 133, ';
  const COUNT = 28;

  const particles = Array.from({ length: COUNT }, () => ({
    x:     Math.random() * canvas.width,
    y:     Math.random() * canvas.height,
    size:  Math.random() * 10 + 5,
    speedX: (Math.random() - 0.5) * 0.4,
    speedY: -(Math.random() * 0.5 + 0.2),
    alpha: Math.random() * 0.15 + 0.05,
  }));

  function drawHeart(ctx, x, y, size, alpha) {
    ctx.save();
    ctx.fillStyle = PINK + alpha + ')';
    ctx.beginPath();
    ctx.translate(x, y);
    ctx.scale(size / 10, size / 10);
    ctx.moveTo(0, -3);
    ctx.bezierCurveTo(0, -6, -5, -6, -5, -2);
    ctx.bezierCurveTo(-5, 1, 0, 5, 0, 7);
    ctx.bezierCurveTo(0, 5, 5, 1, 5, -2);
    ctx.bezierCurveTo(5, -6, 0, -6, 0, -3);
    ctx.fill();
    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      drawHeart(ctx, p.x, p.y, p.size, p.alpha);
      p.x += p.speedX;
      p.y += p.speedY;
      if (p.y < -20) {
        p.y = canvas.height + 20;
        p.x = Math.random() * canvas.width;
      }
      if (p.x < -20) p.x = canvas.width + 20;
      if (p.x > canvas.width + 20) p.x = -20;
    });
    requestAnimationFrame(animate);
  }
  animate();
})();

/* ----------------------------------------------------------
   NEWS: note RSS を rss2json 経由で取得
   ---------------------------------------------------------- */
(function loadNews() {
  const list = document.getElementById('news-list');
  if (!list) return;

  // .news-loading プレースホルダーをスピナーに差し替え（固定NEWSは残す）
  const loading = list.querySelector('.news-loading');
  const spinner = document.createElement('div');
  spinner.className = 'news-spinner';
  spinner.innerHTML = '<div class="spinner"></div>';
  if (loading) loading.replaceWith(spinner);

  const API_URL = 'https://api.rss2json.com/v1/api.json?rss_url=https://note.com/nnoir_official/rss';

  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      if (data.status !== 'ok' || !data.items || !data.items.length) {
        throw new Error('no items');
      }

      // スピナーを削除（固定NEWSは残す）
      spinner.remove();

      const items = data.items.slice(0, 5);

      items.forEach(item => {
        const title = item.title || '';
        const link  = item.link || '#';
        const pub   = item.pubDate || '';
        const date  = pub ? new Date(pub).toLocaleDateString('ja-JP', {
          year: 'numeric', month: '2-digit', day: '2-digit'
        }) : '';

        // 本文冒頭100文字を抽出（HTMLタグ除去）
        const raw     = (item.description || '').replace(/<[^>]*>/g, '');
        const excerpt = raw.length > 100 ? raw.slice(0, 100) + '…' : raw;

        // リンク先がhttpsでない場合は安全のためスキップ
        if (link !== '#' && !link.startsWith('https://')) return;

        const a = document.createElement('a');
        a.className   = 'news-item';
        a.href        = link;
        a.target      = '_blank';
        a.rel         = 'noopener';

        const elDate    = document.createElement('span');
        elDate.className   = 'news-date';
        elDate.textContent = date;

        const elTag     = document.createElement('span');
        elTag.className    = 'news-tag';
        elTag.textContent  = 'NOTE';

        const elTitle   = document.createElement('span');
        elTitle.className  = 'news-title';
        elTitle.textContent = title;

        const elExcerpt = document.createElement('span');
        elExcerpt.className  = 'news-excerpt';
        elExcerpt.textContent = excerpt;

        a.append(elDate, elTag, elTitle, elExcerpt);
        list.appendChild(a);
      });
    })
    .catch(() => {
      // スピナーをエラーメッセージに差し替え（固定NEWSは残す）
      spinner.outerHTML = `
        <p style="text-align:center; color:var(--color-text-muted); font-size:13px; padding: 20px 0;">
          最新情報は<a href="https://note.com/nnoir_official" target="_blank" rel="noopener" style="color:var(--color-pink);">note</a>をご覧ください
        </p>`;
    });
})();
