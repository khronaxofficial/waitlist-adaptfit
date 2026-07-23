import './style.css';
import { joinWaitlist, isSupabaseConfigured } from './supabaseClient.js';

// ---------------------------------------------------------------
// Waitlist form
// ---------------------------------------------------------------
const form = document.getElementById('waitlistForm');
const msgEl = document.getElementById('formMsg');
const btn = document.getElementById('waitlistBtn');

function showMsg(text, kind) {
  msgEl.textContent = text;
  msgEl.className = kind;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const gear = document.getElementById('gear').value;
  const honey = form.company.value;

  if (honey) return; // honeypot tripped — silently drop

  if (!email) {
    showMsg('Enter an email to join the waitlist.', 'err');
    return;
  }

  if (!isSupabaseConfigured) {
    showMsg("Signup isn't connected yet — add your Supabase credentials to .env", 'err');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Joining…';

  const result = await joinWaitlist(email, gear);

  if (result.ok) {
    showMsg("You're on the list. We'll be in touch.", 'ok');
    form.reset();
  } else if (result.reason === 'duplicate') {
    showMsg("You're already on the list — thanks!", 'ok');
  } else if (result.reason === 'network') {
    console.error('Network error when connecting to Supabase:', result.errorMessage);
    showMsg(
      'Unable to reach Supabase. Check your project URL, anon key, and internet connection.',
      'err'
    );
  } else if (result.reason === 'not_configured') {
    showMsg("Signup isn't connected yet — add your Supabase credentials to .env", 'err');
  } else {
    console.error('Supabase error:', result.errorMessage);
    showMsg('Something went wrong. Please try again.', 'err');
  }

  btn.disabled = false;
  btn.textContent = 'Join the waitlist';
});

// ---------------------------------------------------------------
// Pin-impression hero canvas — a literal, interactive version of
// the product mechanism: a grid of "pins" that push toward the
// viewer near the cursor, just like the pin-art toy the invention
// is built from.
// ---------------------------------------------------------------
const canvas = document.getElementById('pinCanvas');
const ctx = canvas.getContext('2d');
let W, H, cols, rows, spacing = 34;
const mouse = { x: -9999, y: -9999 };
let pins = [];

function resize() {
  W = canvas.width = canvas.offsetWidth * devicePixelRatio;
  H = canvas.height = canvas.offsetHeight * devicePixelRatio;
  canvas.style.width = canvas.offsetWidth + 'px';
  spacing = 34 * devicePixelRatio;
  cols = Math.ceil(W / spacing) + 1;
  rows = Math.ceil(H / spacing) + 1;
  pins = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      pins.push({ x: c * spacing, y: r * spacing, d: 0 });
    }
  }
}

window.addEventListener('resize', resize);

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = (e.clientX - rect.left) * devicePixelRatio;
  mouse.y = (e.clientY - rect.top) * devicePixelRatio;
});
canvas.addEventListener('mouseleave', () => {
  mouse.x = -9999;
  mouse.y = -9999;
});
canvas.addEventListener(
  'touchmove',
  (e) => {
    const rect = canvas.getBoundingClientRect();
    const t = e.touches[0];
    mouse.x = (t.clientX - rect.left) * devicePixelRatio;
    mouse.y = (t.clientY - rect.top) * devicePixelRatio;
  },
  { passive: true }
);

const RADIUS = 170 * devicePixelRatio;

function draw() {
  ctx.clearRect(0, 0, W, H);
  for (const p of pins) {
    const dx = p.x - mouse.x;
    const dy = p.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const target = dist < RADIUS ? 1 - dist / RADIUS : 0;
    p.d += (target - p.d) * 0.14;

    const size = 1.6 + p.d * 5.5 * devicePixelRatio;
    const alpha = 0.1 + p.d * 0.55;
    ctx.beginPath();
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200, 199, 188, ${alpha})`;
    ctx.fill();
  }
  requestAnimationFrame(draw);
}

resize();
draw();
