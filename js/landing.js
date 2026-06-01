// ============================================================ LOADER ============================================================
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("loader").classList.add("hide");
  }, 800);
});

// ============================================================ THEME TOGGLE ============================================================
const html = document.documentElement;
const themeBtn = document.getElementById("themeBtn");
const savedTheme = localStorage.getItem("learnup-theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
let currentTheme = savedTheme || (prefersDark ? "dark" : "light");
html.setAttribute("data-theme", currentTheme);

function applyThemeSmooth(newTheme) {
  html.classList.add("theme-changing");
  // Wait one frame so browser registers the transition rules
  // before the theme attribute changes — prevents initial snap
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      html.setAttribute("data-theme", newTheme);
      localStorage.setItem("learnup-theme", newTheme);
      // Remove class just after transition completes (320ms duration)
      setTimeout(() => html.classList.remove("theme-changing"), 350);
    }),
  );
}

themeBtn.addEventListener("click", () => {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  applyThemeSmooth(currentTheme);
});

// ============================================================ NAVBAR SCROLL ============================================================
const navbar = document.getElementById("navbar");
const backTop = document.getElementById("backTop");
window.addEventListener(
  "scroll",
  () => {
    const sy = window.scrollY;
    navbar.classList.toggle("scrolled", sy > 60);
    backTop.classList.toggle("visible", sy > 50);
  },
  { passive: true },
);

// ============================================================ MOBILE MENU ============================================================
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");
const mobOverlay = document.getElementById("mobOverlay");

function openMob() {
  mobileMenu.classList.add("open");
  mobOverlay.classList.add("open");
  hamburger.classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeMob() {
  mobileMenu.classList.remove("open");
  mobOverlay.classList.remove("open");
  hamburger.classList.remove("open");
  document.body.style.overflow = "";
}
hamburger.addEventListener("click", () =>
  mobileMenu.classList.contains("open") ? closeMob() : openMob(),
);
mobOverlay.addEventListener("click", closeMob);

// Hide hamburger on desktop, show on mobile
function updateNavVisibility() {
  const isMobile = window.innerWidth < 1024;
  hamburger.style.display = isMobile ? "flex" : "none";
  document.querySelector(".nav-links").style.display = isMobile
    ? "none"
    : "flex";
  if (!isMobile) closeMob();
}
updateNavVisibility();
window.addEventListener("resize", updateNavVisibility, { passive: true });

// ============================================================ SCROLL REVEAL ============================================================
const revealEls = document.querySelectorAll(".reveal");
const revealObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        revealObs.unobserve(e.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
);
revealEls.forEach((el) => revealObs.observe(el));

// ============================================================ HERO 3D PARALLAX ============================================================
const scene = document.getElementById("hero3dScene");
let mx = 0,
  my = 0,
  tx = 0,
  ty = 0;
document.addEventListener(
  "mousemove",
  (e) => {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  },
  { passive: true },
);
document.addEventListener(
  "touchmove",
  (e) => {
    const t = e.touches[0];
    mx = (t.clientX / window.innerWidth - 0.5) * 2;
    my = (t.clientY / window.innerHeight - 0.5) * 2;
  },
  { passive: true },
);
let heroVisible = true;
const heroObserver = new IntersectionObserver(
  (entries) => {
    heroVisible = entries[0].isIntersecting;
  },
  { threshold: 0 },
);
if (scene) heroObserver.observe(scene);
(function animHero() {
  if (heroVisible) {
    tx += (mx - tx) * 0.06;
    ty += (my - ty) * 0.06;
    if (scene)
      scene.style.transform = `rotateY(${tx * 12}deg) rotateX(${-ty * 10}deg)`;
  }
  requestAnimationFrame(animHero);
})();

// ============================================================ GLASS CARD 3D TILT ============================================================
document.querySelectorAll(".glass-card").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const r = card.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
    const dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
    card.style.transform = `perspective(700px) rotateY(${dx * 5}deg) rotateX(${-dy * 5}deg) translateY(-8px) scale(1.015)`;
  });
  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
});

// ============================================================ COUNTDOWN TIMER ============================================================
const promoEnd = new Date();
promoEnd.setDate(promoEnd.getDate() + 7);
promoEnd.setHours(23, 59, 59, 0);
function updateCd() {
  const d = promoEnd - new Date();
  if (d <= 0) {
    ["cdDays", "cdHours", "cdMins", "cdSecs"].forEach(
      (id) => (document.getElementById(id).textContent = "00"),
    );
    return;
  }
  document.getElementById("cdDays").textContent = String(
    Math.floor(d / 86400000),
  ).padStart(2, "0");
  document.getElementById("cdHours").textContent = String(
    Math.floor((d % 86400000) / 3600000),
  ).padStart(2, "0");
  document.getElementById("cdMins").textContent = String(
    Math.floor((d % 3600000) / 60000),
  ).padStart(2, "0");
  document.getElementById("cdSecs").textContent = String(
    Math.floor((d % 60000) / 1000),
  ).padStart(2, "0");
}
updateCd();
setInterval(updateCd, 1000);

// ============================================================ STAT COUNTER ============================================================
const statData = [
  [0, "stat0", 50000, "K+"],
  [1, "stat1", 500, "+"],
  [2, "stat2", 98, "%"],
];
let statsDone = false;
const statObs = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting && !statsDone) {
      statsDone = true;
      statData.forEach(([, id, end, suffix]) => {
        let cur = 0;
        const step = end / (1800 / 16);
        const t = setInterval(() => {
          cur += step;
          if (cur >= end) {
            cur = end;
            clearInterval(t);
          }
          const v = Math.floor(cur);
          const el = document.getElementById(id);
          if (el)
            el.textContent =
              id === "stat0"
                ? (v >= 1000 ? Math.floor(v / 1000) + "K" : v) + "+"
                : v + suffix;
        }, 16);
      });
    }
  },
  { threshold: 0.5 },
);
const heroSection = document.querySelector("#hero");
if (heroSection) statObs.observe(heroSection);

// ============================================================ EMAIL / TOAST ============================================================
function showToast(msg, type = "success") {
  const toast = document.getElementById("toast");
  const msg_el = document.getElementById("toast-msg");
  const icon = toast.querySelector("i");
  toast.className = `toast ${type}`;
  icon.className =
    type === "success" ? "fas fa-check-circle" : "fas fa-exclamation-circle";
  msg_el.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3500);
}
function handleEmailSubmit() {
  const inp = document.getElementById("emailInput");
  const val = inp.value.trim();
  const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!val || !emailReg.test(val)) {
    inp.classList.add("invalid");
    showToast("Masukkan email yang valid!", "error");
    setTimeout(() => inp.classList.remove("invalid"), 2000);
    return;
  }
  inp.classList.remove("invalid");

  // ── SIMPAN EMAIL KE LOCALSTORAGE (untuk Admin Dashboard) ──
  try {
    const stored = JSON.parse(
      localStorage.getItem("learnup_subscribers") || "[]",
    );
    const alreadyExists = stored.some((s) => s.email === val);
    if (!alreadyExists) {
      stored.push({
        email: val,
        timestamp: new Date().toISOString(),
        source: "landing_page",
        status: "waitlist",
      });
      localStorage.setItem("learnup_subscribers", JSON.stringify(stored));
    }
  } catch (e) {
    console.warn("Storage error:", e);
  }

  showToast(`🎉 Berhasil! Cek email ${val} untuk konfirmasi.`, "success");
  inp.value = "";
}
document.getElementById("emailInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleEmailSubmit();
});

// ============================================================ STAR FIELD BACKGROUND ============================================================
(function initStarField() {
  const canvas = document.getElementById("star-canvas");
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener(
    "resize",
    () => {
      resize();
      buildStars();
    },
    { passive: true },
  );

  const isDark = () =>
    document.documentElement.getAttribute("data-theme") === "dark";

  // Star colors: soft white, light blue, light purple, pale yellow
  const starColors = [
    [255, 255, 255],
    [200, 220, 255],
    [220, 200, 255],
    [255, 245, 200],
    [180, 230, 255],
  ];

  let stars = [];

  function buildStars() {
    stars = [];
    const count = Math.floor((canvas.width * canvas.height) / 8000);
    for (let i = 0; i < count; i++) {
      const [r, g, b] =
        starColors[Math.floor(Math.random() * starColors.length)];
      const driftAngle = Math.random() * Math.PI * 2;
      const driftSpeed = 0.03 + Math.random() * 0.08;
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 0.3 + Math.random() * 1.4,
        baseAlpha: 0.1 + Math.random() * 0.55,
        alpha: 0,
        speed: 0.003 + Math.random() * 0.012,
        phase: Math.random() * Math.PI * 2,
        vx: Math.cos(driftAngle) * driftSpeed,
        vy: Math.sin(driftAngle) * driftSpeed,
        r,
        g,
        b,
      });
    }
  }
  buildStars();

  // Theme change observer
  const observer = new MutationObserver(() => buildStars());
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  let t = 0;
  (function animStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    t += 0.016;
    const dark = isDark();
    stars.forEach((s) => {
      // Drift movement – wrap around edges
      s.x += s.vx;
      s.y += s.vy;
      if (s.x < -2) s.x = canvas.width + 2;
      else if (s.x > canvas.width + 2) s.x = -2;
      if (s.y < -2) s.y = canvas.height + 2;
      else if (s.y > canvas.height + 2) s.y = -2;
      // Twinkle: sine wave on alpha
      const twinkle = Math.sin(t * s.speed * 60 + s.phase);
      s.alpha = s.baseAlpha * (0.5 + 0.5 * twinkle);
      // In light mode stars are subtler
      const finalAlpha = dark ? s.alpha : s.alpha * 0.35;
      if (finalAlpha < 0.01) return;
      ctx.save();
      ctx.globalAlpha = finalAlpha;
      // Glow for bigger stars
      if (s.radius > 1.0) {
        const grd = ctx.createRadialGradient(
          s.x,
          s.y,
          0,
          s.x,
          s.y,
          s.radius * 3.5,
        );
        grd.addColorStop(0, `rgba(${s.r},${s.g},${s.b},${finalAlpha})`);
        grd.addColorStop(1, `rgba(${s.r},${s.g},${s.b},0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius * 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      // Core dot
      ctx.globalAlpha = finalAlpha;
      ctx.fillStyle = `rgb(${s.r},${s.g},${s.b})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    requestAnimationFrame(animStars);
  })();
})();

// ============================================================ CURSOR FOLLOWER – lingkaran biru kecil blur ============================================================
(function initCursorFollower() {
  const isTouch = !window.matchMedia("(pointer:fine)").matches;
  if (isTouch) return; // hanya desktop

  // Buat elemen cursor follower
  const follower = document.createElement("div");
  follower.id = "cursor-follower";
  follower.style.cssText = `
            position: fixed;
            top: 0; left: 0;
            width: 28px; height: 28px;
            border-radius: 50%;
            background: rgba(59, 130, 246, 0.55);
            box-shadow: 0 0 12px 4px rgba(59, 130, 246, 0.45), 0 0 28px 8px rgba(99, 179, 246, 0.25);
            filter: blur(3px);
            pointer-events: none;
            z-index: 99999;
            transform: translate(-50%, -50%);
            transition: opacity 0.3s ease;
            opacity: 0;
            will-change: transform;
          `;
  document.body.appendChild(follower);

  // Target posisi (dari mouse) dan posisi smooth (interpolasi)
  let targetX = -200,
    targetY = -200;
  let currentX = -200,
    currentY = -200;
  let visible = false;

  document.addEventListener(
    "mousemove",
    (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!visible) {
        follower.style.opacity = "1";
        visible = true;
      }
    },
    { passive: true },
  );

  document.addEventListener("mouseleave", () => {
    follower.style.opacity = "0";
    visible = false;
  });
  document.addEventListener("mouseenter", () => {
    follower.style.opacity = "1";
    visible = true;
  });

  // Loop animasi smooth dengan lerp
  const LERP = 0.12; // makin kecil = makin lambat & smooth
  (function animFollower() {
    currentX += (targetX - currentX) * LERP;
    currentY += (targetY - currentY) * LERP;
    follower.style.transform = `translate(calc(${currentX}px - 50%), calc(${currentY}px - 50%))`;
    requestAnimationFrame(animFollower);
  })();
})();
const canvas = document.getElementById("particle-canvas");
const ctx = canvas.getContext("2d");
let particles = [];
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas, { passive: true });
const PCOLS = ["#6C63FF", "#43E6C5", "#FF6584", "#FFD166", "#8B85FF"];
function spawnParticle(x, y, ambient = false) {
  if (particles.length > (ambient ? 160 : 180)) return;
  particles.push({
    x,
    y,
    vx: (Math.random() - 0.5) * (ambient ? 0.4 : 2.5),
    vy: (Math.random() - 0.5) * (ambient ? 0.4 : 2.5) - (ambient ? 0.3 : 1.2),
    r: Math.random() * (ambient ? 2 : 3) + (ambient ? 0.5 : 1.5),
    alpha: ambient ? Math.random() * 0.4 + 0.1 : 1,
    color: PCOLS[Math.floor(Math.random() * PCOLS.length)],
    decay:
      Math.random() * (ambient ? 0.004 : 0.018) + (ambient ? 0.002 : 0.012),
    ambient,
  });
}
document.addEventListener(
  "mousemove",
  (e) => {
    for (let i = 0; i < 2; i++) spawnParticle(e.clientX, e.clientY);
  },
  { passive: true },
);
document.addEventListener(
  "touchmove",
  (e) => {
    const t = e.touches[0];
    for (let i = 0; i < 3; i++) spawnParticle(t.clientX, t.clientY);
  },
  { passive: true },
);
setInterval(
  () =>
    spawnParticle(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      true,
    ),
  250,
);
(function drawP() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles = particles.filter((p) => p.alpha > 0);
  particles.forEach((p) => {
    ctx.save();
    ctx.globalAlpha = p.alpha * (p.ambient ? 0.5 : 0.85);
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
    g.addColorStop(0, p.color);
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= p.decay;
    if (!p.ambient) {
      p.vx *= 0.97;
      p.vy *= 0.97;
    }
  });
  requestAnimationFrame(drawP);
})();

// ============================================================ SMOOTH SCROLL ============================================================
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const t = document.querySelector(a.getAttribute("href"));
    if (t) {
      e.preventDefault();
      t.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

// ============================================================ PERFORMANCE ============================================================
if (window.matchMedia("(prefers-reduced-motion:reduce)").matches) {
  document
    .querySelectorAll('[style*="animation"]')
    .forEach((el) => (el.style.animationDuration = "0.001s"));
}

console.log(
  "%c🎓 LearnUp Landing Page v3.0 – Mobile-First Responsive",
  "color:#6C63FF;font-size:14px;font-weight:bold;",
);

/**
 * dashboard.js – LearnUp Dashboard Progress Belajar
 * Mengelola animasi, interaksi, dan rendering komponen dashboard.
 */

(function () {
  "use strict";

  /* ── HELPER ── */
  function $(sel) {
    return document.querySelector(sel);
  }
  function $$(sel) {
    return document.querySelectorAll(sel);
  }

  /* ──────────────────────────────────────────────
      1. INTERSECTION OBSERVER – reveal animasi
    ────────────────────────────────────────────── */
  const dashRevealEls = $$(".dash-reveal");
  if (dashRevealEls.length) {
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            revealObs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    dashRevealEls.forEach((el) => revealObs.observe(el));
  }

  /* ──────────────────────────────────────────────
      2. ACTIVITY BAR CHART – animasi tinggi bar
    ────────────────────────────────────────────── */
  const actBars = $$(".act-bar[data-height]");
  if (actBars.length) {
    const barObs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          actBars.forEach((bar) => {
            bar.style.height = bar.dataset.height;
          });
          barObs.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    const chartEl = $(".activity-chart");
    if (chartEl) barObs.observe(chartEl);

    // Tooltip hover efek sudah di CSS, tapi tambahkan nilai numerik
    actBars.forEach((bar) => {
      const tip = bar.querySelector(".act-bar-tooltip");
      if (tip) {
        bar.addEventListener("mouseenter", () => {
          tip.style.opacity = "1";
        });
        bar.addEventListener("mouseleave", () => {
          tip.style.opacity = "0";
        });
      }
    });
  }

  /* ──────────────────────────────────────────────
      3. RADIAL PROGRESS (SVG donut charts)
    ────────────────────────────────────────────── */
  const radialFills = $$(".radial-fill[data-pct]");
  if (radialFills.length) {
    const radObs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          radialFills.forEach((fill) => {
            const pct = parseFloat(fill.dataset.pct);
            const r = parseFloat(fill.dataset.r || 36);
            const circ = 2 * Math.PI * r;
            fill.style.strokeDasharray = circ;
            fill.style.strokeDashoffset = circ; // start hidden
            // animate
            requestAnimationFrame(() => {
              setTimeout(() => {
                fill.style.strokeDashoffset = circ * (1 - pct / 100);
              }, 80);
            });
          });
          radObs.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    const radWrap = $(".radial-progress-wrap");
    if (radWrap) radObs.observe(radWrap);
  }

  /* ──────────────────────────────────────────────
      4. LEADERBOARD SCORE BARS – animasi lebar
    ────────────────────────────────────────────── */
  const lbBars = $$(".lb-score-bar[data-width]");
  if (lbBars.length) {
    const lbObs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          lbBars.forEach((bar) => {
            setTimeout(() => {
              bar.style.width = bar.dataset.width;
            }, 150);
          });
          lbObs.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    const lbEl = $(".leaderboard-list");
    if (lbEl) lbObs.observe(lbEl);
  }

  /* ──────────────────────────────────────────────
      5. SUBJECT BARS – animasi lebar
    ────────────────────────────────────────────── */
  const subjBars = $$(".subj-bar-fill[data-width]");
  if (subjBars.length) {
    const subjObs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          subjBars.forEach((bar, i) => {
            setTimeout(() => {
              bar.style.width = bar.dataset.width;
            }, i * 80);
          });
          subjObs.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    const subjEl = $(".subj-list");
    if (subjEl) subjObs.observe(subjEl);
  }

  /* ──────────────────────────────────────────────
      6. STAT COUNTER – animasi angka dashboard
    ────────────────────────────────────────────── */
  const dashStats = $$(".dash-stat-value[data-target]");
  if (dashStats.length) {
    const statObs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          dashStats.forEach((el) => {
            const target = parseFloat(el.dataset.target);
            const suffix = el.dataset.suffix || "";
            const decimals = el.dataset.decimals
              ? parseInt(el.dataset.decimals)
              : 0;
            let cur = 0;
            const duration = 1600;
            const step = target / (duration / 16);
            const timer = setInterval(() => {
              cur += step;
              if (cur >= target) {
                cur = target;
                clearInterval(timer);
              }
              el.textContent =
                decimals > 0
                  ? cur.toFixed(decimals) + suffix
                  : Math.floor(cur) + suffix;
            }, 16);
          });
          statObs.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    const overviewEl = $(".dash-overview");
    if (overviewEl) statObs.observe(overviewEl);
  }

  /* ──────────────────────────────────────────────
      7. HEATMAP – generate sel kalender
    ────────────────────────────────────────────── */
  const heatGrid = $("#heatmapGrid");
  if (heatGrid) {
    // Data simulasi 84 hari terakhir (12 kolom × 7 baris)
    const heatData = [
      0, 1, 2, 3, 4, 5, 3, 2, 1, 0, 2, 4, 3, 2, 4, 5, 3, 2, 4, 3, 2, 1, 3, 4, 5,
      4, 3, 2, 1, 3, 4, 5, 3, 2, 0, 1, 2, 3, 4, 5, 4, 3, 2, 1, 3, 4, 5, 3, 2, 1,
      0, 2, 3, 4, 5, 3, 2, 4, 5, 3, 2, 3, 4, 3, 2, 1, 0, 2, 3, 4, 5, 4, 3, 2, 4,
      5, 4, 3, 2, 1, 3, 4, 5, 4,
    ];

    const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
    // Render cells
    heatData.forEach((val, i) => {
      const cell = document.createElement("div");
      cell.className = "heatmap-cell" + (val > 0 ? ` h${val}` : "");
      // Day label di kiri untuk baris pertama setiap minggu
      const menit = val * 18;
      cell.setAttribute(
        "data-val",
        val === 0 ? "Tidak belajar" : `${menit} mnt`,
      );
      heatGrid.appendChild(cell);
    });
  }

  /* ──────────────────────────────────────────────
      8. HOVER TILT PADA KARTU DASHBOARD
    ────────────────────────────────────────────── */
  // tilt effect dihapus

  /* ──────────────────────────────────────────────
      9. LIVE CLOCK di profile banner
    ────────────────────────────────────────────── */
  const clockEl = $("#dashClock");
  if (clockEl) {
    function updateClock() {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      clockEl.textContent = `${h}:${m}`;
    }
    updateClock();
    setInterval(updateClock, 30000);
  }

  console.log(
    "%c📊 LearnUp Dashboard v1.0 – Loaded",
    "color:#43E6C5;font-size:13px;font-weight:bold;",
  );
})();

/* ============================================================
    SIMULATION PAGE NAVIGATION & INTERACTION
  ============================================================ */

// ── NAVIGATE TO SIMULATION (Fade-Out only) ──
function navigateToSimulation() {
  const overlay = document.getElementById("pageTransitionOverlay");
  const simPage = document.getElementById("sim-page");

  // Remove instant-hide so transition is active
  overlay.classList.remove("instant-hide");
  // Trigger fade-out of landing page
  overlay.classList.add("active");

  setTimeout(() => {
    // Switch pages while still hidden behind overlay
    simPage.style.display = "block";
    simPage.scrollTop = 0;
    document.body.style.overflow = "hidden";
    // Pindahkan canvas ke dalam sim-page agar tampil di kedua halaman
    const starC = document.getElementById("star-canvas");
    const partC = document.getElementById("particle-canvas");
    if (starC) simPage.insertBefore(starC, simPage.firstChild);
    if (partC) simPage.insertBefore(partC, simPage.firstChild);
    // Hide back-to-top button
    document.getElementById("backTop").style.display = "none";

    setTimeout(() => {
      initSimReveal();
      initSimPhoneParallax();
    }, 80);

    // Instantly remove overlay (no fade-in)
    overlay.classList.add("instant-hide");
    overlay.classList.remove("active");
  }, 400);
}

function closeSimulation() {
  const overlay = document.getElementById("pageTransitionOverlay");
  const simPage = document.getElementById("sim-page");

  // Remove instant-hide so transition is active
  overlay.classList.remove("instant-hide");
  // Trigger fade-out of sim page
  overlay.classList.add("active");

  setTimeout(() => {
    // Switch back while behind overlay
    simPage.style.display = "none";
    document.body.style.overflow = "";
    // Kembalikan canvas ke body
    const starC = document.getElementById("star-canvas");
    const partC = document.getElementById("particle-canvas");
    if (starC) document.body.insertBefore(starC, document.body.firstChild);
    if (partC) document.body.insertBefore(partC, document.body.firstChild);
    // Restore back-to-top button
    document.getElementById("backTop").style.display = "";

    // Instantly remove overlay (no fade-in)
    overlay.classList.add("instant-hide");
    overlay.classList.remove("active");
  }, 400);
}

// ── SIM THEME SYNC ──
function toggleSimTheme(e) {
  const html = document.documentElement;
  const current = html.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  html.classList.add("theme-changing");
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      html.setAttribute("data-theme", next);
      localStorage.setItem("learnup-theme", next);
      syncSimThemeBtn();
      setTimeout(() => html.classList.remove("theme-changing"), 350);
    }),
  );
}
function syncSimThemeBtn() {
  const btn = document.getElementById("simThemeBtn");
  if (!btn) return;
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const knob = btn.querySelector(".toggle-knob");
  if (knob) knob.style.transform = isDark ? "translateX(22px)" : "";
}

// ── SIM SCREEN SWITCH ──
const simScreenLabels = [
  "🏠 Home Dashboard",
  "📚 Kursus & Materi",
  "📝 Quiz Adaptif",
  "🔍 Explore",
  "🔔 Notifikasi",
  "👤 Profil & Leaderboard",
];
function simSwitchScreen(idx) {
  // Hide all screens
  for (let i = 0; i < 6; i++) {
    const s = document.getElementById("simScreen" + i);
    if (s) s.style.display = "none";
    const m = document.getElementById("simMenu" + i);
    if (m) m.classList.remove("active");
    const n = document.getElementById("simNav" + i);
    if (n) {
      n.classList.remove("active");
      const dot = n.querySelector(".sbn-dot");
      if (dot) dot.style.display = "none";
    }
  }
  // Show target
  const target = document.getElementById("simScreen" + idx);
  if (target) target.style.display = "flex";
  const menu = document.getElementById("simMenu" + idx);
  if (menu) menu.classList.add("active");
  const nav = document.getElementById("simNav" + idx);
  if (nav) {
    nav.classList.add("active");
    let dot = nav.querySelector(".sbn-dot");
    if (!dot) {
      dot = document.createElement("div");
      dot.className = "sbn-dot";
      nav.appendChild(dot);
    }
    dot.style.display = "block";
  }
  // Update label
  const lbl = document.getElementById("simPhoneLabel");
  if (lbl) lbl.textContent = simScreenLabels[idx];
  // Reset quiz if switching to quiz screen
  if (idx === 2) resetSimQuiz();
  // Clear notif badge when visiting notif screen
  if (idx === 4) {
    const badge = document.querySelector("#simNav4 .sbn-badge");
    if (badge) badge.style.display = "none";
  }
}

// ── SIM QUIZ INTERACTION ──
function simHandleQuiz(el, ans) {
  const opts = document.querySelectorAll("#simQuizOptions .sq-option");
  const anyAnswered = [...opts].some(
    (o) => o.classList.contains("correct") || o.classList.contains("wrong"),
  );
  if (anyAnswered) return;
  opts.forEach((o) => o.classList.remove("selected"));
  el.classList.add("selected");
  setTimeout(() => {
    el.classList.remove("selected");
    if (ans === "B") {
      el.classList.add("correct");
      showToast("✅ Jawaban Benar! +50 XP", "success");
    } else {
      el.classList.add("wrong");
      const correct = document.querySelector('#simQuizOptions [data-ans="B"]');
      if (correct) correct.classList.add("correct");
      showToast("❌ Jawaban Salah. Coba lagi!", "error");
    }
  }, 600);
}
function resetSimQuiz() {
  document.querySelectorAll("#simQuizOptions .sq-option").forEach((o) => {
    o.classList.remove("correct", "wrong", "selected");
  });
}

// ── SIM EMAIL ──
function simHandleEmail() {
  const input = document.getElementById("simEmailInput");
  const v = input.value.trim();
  if (!v || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
    showToast("Masukkan email yang valid", "error");
    return;
  }

  try {
    const stored = JSON.parse(
      localStorage.getItem("learnup_subscribers") || "[]",
    );
    const alreadyExists = stored.some((s) => s.email === v);
    if (!alreadyExists) {
      stored.push({
        email: v,
        timestamp: new Date().toISOString(),
        source: "landing_page",
        status: "waitlist",
      });
      localStorage.setItem("learnup_subscribers", JSON.stringify(stored));
    }
  } catch (e) {
    console.warn("Storage error:", e);
  }

  showToast("🎉 Berhasil! Cek email kamu ya!", "success");
  input.value = "";
}

// ── SIM REVEAL OBSERVER ──
function initSimReveal() {
  const simPage = document.getElementById("sim-page");
  const els = simPage.querySelectorAll(".reveal");
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px", root: simPage },
  );
  els.forEach((el) => obs.observe(el));

  // 3D tilt untuk semua kartu sim-page — identik dengan .glass-card di landing page
  simPage
    .querySelectorAll(
      ".sim-feature-card, .sim-spec-card, .app-menu-item, .dash-chart-card, .dash-leaderboard, .heatmap-card, .achievements-card, .dash-subject-progress, .dash-stat-card, .sq-option",
    )
    .forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
        const dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
        card.style.transform = `perspective(700px) rotateY(${dx * 5}deg) rotateX(${-dy * 5}deg) translateY(-8px) scale(1.015)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
}

// ── SIM PHONE PARALLAX ──
function initSimPhoneParallax() {
  const phone = document.getElementById("simPhoneFrame");
  if (!phone) return;
  let pmx = 0,
    pmy = 0,
    ptx = 0,
    pty = 0;
  const simPage = document.getElementById("sim-page");
  simPage.addEventListener(
    "mousemove",
    (e) => {
      pmx = (e.clientX / window.innerWidth - 0.5) * 2;
      pmy = (e.clientY / window.innerHeight - 0.5) * 2;
    },
    { passive: true },
  );
  (function animPhone() {
    ptx += (pmx - ptx) * 0.05;
    pty += (pmy - pty) * 0.05;
    if (phone && document.getElementById("sim-page").style.display !== "none") {
      phone.style.transform = `scale(1.0) perspective(1200px) rotateY(${ptx * 10}deg) rotateX(${-pty * 8}deg)`;
    }
    requestAnimationFrame(animPhone);
  })();
}

// Smooth scroll inside sim page
document.addEventListener("click", (e) => {
  const a = e.target.closest('a[href^="#sim-"]');
  if (a) {
    e.preventDefault();
    const target = document.getElementById(a.getAttribute("href").slice(1));
    if (target) {
      const simPage = document.getElementById("sim-page");
      const targetTop = target.offsetTop - 80;
      simPage.scrollTo({ top: targetTop, behavior: "smooth" });
    }
  }
});

// Sync theme button on load
document.addEventListener("DOMContentLoaded", () => {
  syncSimThemeBtn();
  // Init bottom nav dots: hide all except first
  for (let i = 1; i < 6; i++) {
    const n = document.getElementById("simNav" + i);
    if (n) {
      const dot = n.querySelector(".sbn-dot");
      if (dot) dot.style.display = "none";
    }
  }
});
setTimeout(syncSimThemeBtn, 500);

// ── SIM PHONE CLOCK ──
function updateSimPhoneClock() {
  const el = document.getElementById("simPhoneClock");
  if (!el) return;
  const now = new Date();
  const h = now.getHours().toString().padStart(2, "0");
  const m = now.getMinutes().toString().padStart(2, "0");
  el.textContent = h + ":" + m;
}
updateSimPhoneClock();
setInterval(updateSimPhoneClock, 10000);

console.log(
  "%c🎓 LearnUp Combined v1.0 – Landing Page + Simulation",
  "color:#6C63FF;font-size:14px;font-weight:bold;",
);
// ============================================================
// ADMIN LOGIN MODAL LOGIC
// ============================================================
function openLoginModal() {
  document.getElementById("loginOverlay").classList.add("show");
  setTimeout(() => document.getElementById("adminPassword").focus(), 100);
}

function closeLoginModal() {
  document.getElementById("loginOverlay").classList.remove("show");
  document.getElementById("adminPassword").value = "";
}

function submitLogin() {
  const pwd = document.getElementById("adminPassword").value;
  if (pwd === "admin123") {
    sessionStorage.setItem("isAdmin", "true");
    showToast("Login berhasil! Mengalihkan...", "success");
    setTimeout(() => {
      window.location.href = "admin.html";
    }, 1000);
  } else {
    showToast("Password salah! Coba lagi.", "error");
  }
}
