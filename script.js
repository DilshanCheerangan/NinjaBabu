const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const heroTab = document.getElementById("heroTab");
const startOverlay = document.getElementById("startOverlay");
const startBtn = document.getElementById("startBtn");
const playAgainBtn = document.getElementById("playAgainBtn");
const scoreEl = document.getElementById("score");
const bombHitsEl = document.getElementById("bombHits");
const comboTextEl = document.getElementById("comboText");
const lifePipsEl = document.getElementById("lifePips");
const prankOverlayEl = document.getElementById("prankOverlay");
const prankMessageEl = document.getElementById("prankMessage");
const prankBtnEl = document.getElementById("prankBtn");

let score = 0;
const maxLives = 5;
let lives = maxLives;
let bombHits = 0;
let running = false;
let handDetected = true;
let comboCount = 0;
let lastFruitSliceAt = 0;
let fruitCuts = 0;
let prankTriggered = false;
let prankRunning = false;
let prankHitTarget = 3;
let prankEverShown = false;

let lastTime = 0;
let spawnTimer = 0;
let smoothFingerPoint = null;
let pointerPoint = null;
let pointerActive = false;
let slowMoUntil = 0;
let shakeUntil = 0;
let shakeStrength = 0;
const fingerTrail = [];
const trailMaxLength = 22;
const objects = [];
const particles = [];
const splits = [];
const explosions = [];

const gravity = 1100;
const spawnIntervalBase = 540;
const fruitTypes = [
  { key: "watermelon", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f349.png", radius: [38, 45] },
  { key: "pineapple", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f34d.png", radius: [32, 38] },
  { key: "orange", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f34a.png", radius: [28, 34] },
  { key: "apple", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f34e.png", radius: [26, 32] },
  { key: "banana", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f34c.png", radius: [24, 30] },
  { key: "strawberry", url: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f353.png", radius: [19, 24] }
];
const bombImageUrl = "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4a3.png";
const fruitSprites = {};
let bombSprite = null;

function loadSprite(url) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = url;
  return img;
}

function setupSprites() {
  for (const t of fruitTypes) {
    fruitSprites[t.key] = loadSprite(t.url);
  }
  bombSprite = loadSprite(bombImageUrl);
}

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function setStatus(text) {
  // Status text removed for cleaner HUD
}

function updateLivesUI() {
  if (lifePipsEl.children.length !== maxLives) {
    lifePipsEl.innerHTML = "";
    for (let i = 0; i < maxLives; i += 1) {
      const pip = document.createElement("span");
      pip.className = "pip";
      lifePipsEl.appendChild(pip);
    }
  }
  const pips = lifePipsEl.querySelectorAll(".pip");
  pips.forEach((pip, idx) => {
    pip.classList.toggle("active", idx < lives);
  });
}

function showCombo() {
  if (comboCount < 2) {
    return;
  }
  comboTextEl.classList.remove("show");
  comboTextEl.innerHTML = `${comboCount} FRUIT<br/>COMBO +${comboCount}`;
  void comboTextEl.offsetWidth;
  comboTextEl.classList.add("show");
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function setPrankMessage(text) {
  prankMessageEl.textContent = text;
}

function waitForPrankButton(label = "Next") {
  return new Promise((resolve) => {
    prankBtnEl.textContent = label;
    prankBtnEl.classList.remove("hidden");
    prankBtnEl.onclick = () => {
      prankBtnEl.onclick = null;
      resolve();
    };
  });
}

function movePrankButtonRandomly() {
  const card = prankBtnEl.closest(".prank-card");
  if (!card) {
    return;
  }
  const cardRect = card.getBoundingClientRect();
  const btnRect = prankBtnEl.getBoundingClientRect();
  const maxX = Math.max(0, cardRect.width - btnRect.width - 30);
  const maxY = Math.max(0, cardRect.height - btnRect.height - 30);
  prankBtnEl.style.left = `${Math.floor(rand(0, maxX))}px`;
  prankBtnEl.style.top = `${Math.floor(rand(0, maxY))}px`;
}
const playArea = document.getElementById("play");
const navLinks = document.querySelectorAll(".nav-link");

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

async function runPrankSequence() {
  if (prankTriggered || prankRunning) {
    return;
  }
  prankTriggered = true;
  prankRunning = true;
  prankEverShown = true;
  running = false;
  slowMoUntil = 0;
  prankOverlayEl.classList.remove("hidden");
  prankBtnEl.classList.add("hidden");

  setPrankMessage(
    "APRIL FOOL MODE ACTIVATED.\nEverything you see is not what it seems.\nSometimes the sweet fruit is trouble,\nand the scary bomb is just drama."
  );
  await waitForPrankButton("Next");

  setPrankMessage(
    "Wait... thought that was it?\nNo chance.\nWe hacked your computer and renamed the FIRST folder in your Documents to Ninja Babu."
  );
  
  const winAlertEl = document.getElementById("winAlert");
  if (winAlertEl) {
    winAlertEl.classList.remove("hidden");
  }

  await waitForPrankButton("Okay...");
  
  if (winAlertEl) {
    winAlertEl.classList.add("hidden");
  }

  setPrankMessage(
    "Relax.\nCute Ninja Babu is too stylish to hack anything.\nBut yes, we absolutely got you there."
  );
  await waitForPrankButton("Continue");

  setPrankMessage("The prank is over.\nGet back to slicing.");
  prankBtnEl.textContent = "Play Again";
  prankBtnEl.style.left = "0px";
  prankBtnEl.style.top = "0px";

  let dodges = 0;
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  const dodgeHandler = (e) => {
    // On mobile, we dodge on click. On desktop, we dodge on hover.
    if (isTouch && e.type === 'mouseenter') return;
    
    dodges += 1;
    movePrankButtonRandomly();
    
    if (dodges >= 5) {
      prankBtnEl.removeEventListener("mouseenter", dodgeHandler);
      prankBtnEl.removeEventListener("click", dodgeHandler);
      setPrankMessage(
        "Sorry, promise we will behave now.\nHere is your real button.\nHappy April Fools - be a legendary fool."
      );
      prankBtnEl.style.left = "0px";
      prankBtnEl.style.top = "0px";
      prankBtnEl.onclick = async () => {
        prankOverlayEl.classList.add("hidden");
        prankBtnEl.classList.add("hidden");
        prankBtnEl.onclick = null;
        prankRunning = false;
        await startGame();
      };
    }
  };

  if (isTouch) {
    prankBtnEl.addEventListener("click", dodgeHandler);
  } else {
    prankBtnEl.addEventListener("mouseenter", dodgeHandler);
  }
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function spawnObject() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const isBomb = Math.random() < 0.18;
  const fruitType = fruitTypes[Math.floor(rand(0, fruitTypes.length))];
  const r = isBomb ? rand(22, 28) : rand(fruitType.radius[0], fruitType.radius[1]);
  const lift = isBomb ? rand(-980, -860) : rand(-1040, -860) + (30 - r) * 5;
  objects.push({
    x: rand(r + 20, w - r - 20),
    y: h + r + 10,
    vx: rand(-190, 190),
    vy: lift,
    radius: r,
    isBomb,
    color: isBomb ? "#111111" : "#ff8a80",
    sprite: isBomb
      ? bombSprite
      : fruitSprites[fruitType.key] || null,
    sliced: false,
    rotation: rand(0, Math.PI * 2),
    rotationSpeed: rand(-2.2, 2.2)
  });
}

function spawnSliceBurst(x, y, color, intensity) {
  const count = Math.floor(intensity);
  for (let i = 0; i < count; i += 1) {
    particles.push({
      x,
      y,
      vx: rand(-320, 320),
      vy: rand(-320, 180),
      life: rand(0.3, 0.7),
      age: 0,
      color,
      size: rand(2, 6)
    });
  }
}

function spawnFruitSplit(o, slashDx, slashDy) {
  const mag = Math.hypot(slashDx, slashDy) || 1;
  const nx = slashDx / mag;
  const ny = slashDy / mag;
  const size = o.radius * 2.35;
  for (const side of [-1, 1]) {
    splits.push({
      x: o.x + side * nx * 10,
      y: o.y + side * ny * 10,
      vx: side * 220 + nx * 130,
      vy: -120 - Math.abs(ny) * 130,
      rotation: o.rotation,
      rotationSpeed: side * rand(3.4, 5.2),
      life: 0.48,
      age: 0,
      side,
      sprite: o.sprite,
      size,
      color: o.color,
      radius: o.radius
    });
  }
}

function triggerBombEffect(x, y) {
  slowMoUntil = performance.now() + 2000;
  shakeUntil = performance.now() + 700;
  shakeStrength = 16;
  explosions.push({
    x,
    y,
    age: 0,
    life: 2.0,
    maxR: 210
  });
  spawnSliceBurst(x, y, "rgba(255,210,120,ALPHA)", 55);
  spawnSliceBurst(x, y, "rgba(255,120,60,ALPHA)", 45);
}

function segmentCircleHit(x1, y1, x2, y2, cx, cy, r) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) {
    const ddx = cx - x1;
    const ddy = cy - y1;
    return ddx * ddx + ddy * ddy <= r * r;
  }
  const t = Math.max(0, Math.min(1, ((cx - x1) * dx + (cy - y1) * dy) / lenSq));
  const px = x1 + t * dx;
  const py = y1 + t * dy;
  const ox = cx - px;
  const oy = cy - py;
  return ox * ox + oy * oy <= r * r;
}

function drawFruit(o) {
  ctx.save();
  ctx.translate(o.x, o.y);
  ctx.rotate(o.rotation);
  if (o.sprite && o.sprite.complete) {
    const size = o.radius * 2.35;
    ctx.drawImage(o.sprite, -size / 2, -size / 2, size, size);
  } else {
    const grad = ctx.createRadialGradient(-8, -8, 2, 0, 0, o.radius);
    grad.addColorStop(0, "#ffffffcc");
    grad.addColorStop(0.2, o.color);
    grad.addColorStop(1, "#00000088");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, o.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawBomb(o) {
  ctx.save();
  ctx.translate(o.x, o.y);
  if (o.sprite && o.sprite.complete) {
    const size = o.radius * 2.2;
    ctx.drawImage(o.sprite, -size / 2, -size / 2, size, size);
  } else {
    const grad = ctx.createRadialGradient(-6, -6, 2, 0, 0, o.radius);
    grad.addColorStop(0, "#6e6e6e");
    grad.addColorStop(0.6, "#171717");
    grad.addColorStop(1, "#020202");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, o.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawTrail() {
  if (fingerTrail.length < 2) {
    return;
  }
  
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  for (let i = 1; i < fingerTrail.length; i++) {
    const p1 = fingerTrail[i - 1];
    const p2 = fingerTrail[i];
    const alpha = i / fingerTrail.length;
    
    // Outer glow
    ctx.beginPath();
    ctx.strokeStyle = `rgba(132, 241, 255, ${alpha * 0.3})`;
    ctx.lineWidth = 14 * alpha;
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();

    // Inner core
    ctx.beginPath();
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
    ctx.lineWidth = 4 * alpha;
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }

  const tip = fingerTrail[fingerTrail.length - 1];
  ctx.fillStyle = "#fff";
  ctx.shadowBlur = 15;
  ctx.shadowColor = "#84f1ff";
  ctx.beginPath();
  ctx.arc(tip.x, tip.y, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const p = particles[i];
    p.age += dt;
    if (p.age >= p.life) {
      particles.splice(i, 1);
      continue;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 800 * dt;
    const t = 1 - p.age / p.life;
    ctx.fillStyle = p.color.replace("ALPHA", t.toFixed(3));
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * t, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSplits(dt) {
  for (let i = splits.length - 1; i >= 0; i -= 1) {
    const s = splits[i];
    s.age += dt;
    if (s.age >= s.life) {
      splits.splice(i, 1);
      continue;
    }
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.vy += 850 * dt;
    s.rotation += s.rotationSpeed * dt;
    const alpha = 1 - s.age / s.life;

    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rotation);
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    if (s.side < 0) {
      ctx.rect(-s.size / 2, -s.size / 2, s.size / 2, s.size);
    } else {
      ctx.rect(0, -s.size / 2, s.size / 2, s.size);
    }
    ctx.clip();
    if (s.sprite && s.sprite.complete) {
      ctx.drawImage(s.sprite, -s.size / 2, -s.size / 2, s.size, s.size);
    } else {
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(0, 0, s.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawExplosions(dt) {
  for (let i = explosions.length - 1; i >= 0; i -= 1) {
    const e = explosions[i];
    e.age += dt;
    if (e.age >= e.life) {
      explosions.splice(i, 1);
      continue;
    }
    const t = e.age / e.life;
    const r = e.maxR * (0.2 + t);
    const alpha = 1 - t;
    const grad = ctx.createRadialGradient(e.x, e.y, r * 0.18, e.x, e.y, r);
    grad.addColorStop(0, `rgba(255,245,200,${0.9 * alpha})`);
    grad.addColorStop(0.45, `rgba(255,145,70,${0.7 * alpha})`);
    grad.addColorStop(1, "rgba(255,80,50,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(e.x, e.y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function updateGame(dt) {
  if (!running) {
    return;
  }

  const nowTs = performance.now();
  const slowMoActive = nowTs < slowMoUntil;
  const gameplayDt = dt * (slowMoActive ? 0.22 : 1);

  spawnTimer -= gameplayDt * 1000;
  if (spawnTimer <= 0) {
    const wave = Math.random() < 0.25 ? 2 : 1;
    for (let i = 0; i < wave; i += 1) {
      spawnObject();
    }
    const speedFactor = Math.min(220, score * 3);
    spawnTimer = spawnIntervalBase - speedFactor + rand(-80, 120);
  }

  const prevPoint = fingerTrail.length > 1 ? fingerTrail[fingerTrail.length - 2] : null;
  const tip = fingerTrail.length > 0 ? fingerTrail[fingerTrail.length - 1] : null;
  const speed = prevPoint && tip ? Math.hypot(tip.x - prevPoint.x, tip.y - prevPoint.y) / Math.max(gameplayDt, 0.0001) : 0;
  const slicing = speed > 300;

  for (let i = objects.length - 1; i >= 0; i -= 1) {
    const o = objects[i];
    const gravityMul = o.isBomb ? 1 : 0.9 + (o.radius - 18) / 60;
    o.vy += gravity * gravityMul * gameplayDt;
    o.x += o.vx * gameplayDt;
    o.y += o.vy * gameplayDt;
    o.rotation += o.rotationSpeed * gameplayDt;

    if (!o.sliced && slicing && prevPoint && tip) {
      if (segmentCircleHit(prevPoint.x, prevPoint.y, tip.x, tip.y, o.x, o.y, o.radius + 6)) {
        o.sliced = true;
        objects.splice(i, 1);

        if (o.isBomb) {
          bombHits += 1;
          lives -= 1;
          bombHitsEl.textContent = String(bombHits);
          comboCount = 0;
          updateLivesUI();
          triggerBombEffect(o.x, o.y);
          spawnSliceBurst(o.x, o.y, "rgba(255,80,110,ALPHA)", 45);
          setStatus("Bomb sliced! Be careful.");
          if (lives <= 0) {
            running = false;
            startOverlay.classList.remove("hidden");
            setStatus("Game over. Press start to play again.");
          }
        } else {
          const slashDx = tip.x - prevPoint.x;
          const slashDy = tip.y - prevPoint.y;
          fruitCuts += 1;
          score += 10;
          scoreEl.textContent = String(score);
          const now = performance.now();
          comboCount = now - lastFruitSliceAt < 700 ? comboCount + 1 : 1;
          lastFruitSliceAt = now;
          showCombo();
          spawnFruitSplit(o, slashDx, slashDy);
          spawnSliceBurst(o.x, o.y, "rgba(110,255,180,ALPHA)", 28);
          spawnSliceBurst(o.x, o.y, "rgba(255,255,255,ALPHA)", 14);
          if (!prankEverShown && !prankTriggered && fruitCuts === prankHitTarget) {
            runPrankSequence();
          }
        }
      }
    }

    if (o.y - o.radius > canvas.clientHeight + 20) {
      objects.splice(i, 1);
      if (!o.isBomb) {
        comboCount = 0;
      }
    }
  }
}

function drawGame(dt) {
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  const slowMoActive = performance.now() < slowMoUntil;
  const shakeActive = performance.now() < shakeUntil;

  ctx.save();
  if (shakeActive) {
    const k = (shakeUntil - performance.now()) / 700;
    const mag = shakeStrength * Math.max(0.1, k);
    const ox = rand(-mag, mag);
    const oy = rand(-mag, mag);
    ctx.translate(ox, oy);
  }

  const glow = ctx.createLinearGradient(0, 0, 0, canvas.clientHeight);
  glow.addColorStop(0, "rgba(248,183,88,0.06)");
  glow.addColorStop(1, "rgba(38,18,8,0.3)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

  if (!prankRunning) {
    for (const o of objects) {
      if (o.isBomb) {
        drawBomb(o);
      } else {
        drawFruit(o);
      }
    }
  }

  drawExplosions(dt);
  drawSplits(dt);
  drawParticles(dt);
  drawTrail();

  if (slowMoActive) {
    ctx.fillStyle = "rgba(255,240,190,0.12)";
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    ctx.fillStyle = "rgba(255,223,157,0.95)";
    ctx.font = "700 22px Inter";
    ctx.fillText("SLOW MOTION!", canvas.clientWidth / 2 - 72, 42);
  }

  /* Status text removed */
  ctx.restore();
}

// Slice to start logic removed to favor standard clicking as requested

function loop(ts) {
  if (!lastTime) {
    lastTime = ts;
  }
  const dt = Math.min(0.033, (ts - lastTime) / 1000);
  lastTime = ts;

  if (pointerActive && pointerPoint) {
    if (!smoothFingerPoint) {
      smoothFingerPoint = { x: pointerPoint.x, y: pointerPoint.y };
    } else {
      const isTouch = 'ontouchstart' in window;
      const smoothing = isTouch ? 0.35 : 0.45; // Enhanced smoothing for mobile
      smoothFingerPoint.x += (pointerPoint.x - smoothFingerPoint.x) * smoothing;
      smoothFingerPoint.y += (pointerPoint.y - smoothFingerPoint.y) * smoothing;
    }
    fingerTrail.push({ x: smoothFingerPoint.x, y: smoothFingerPoint.y });
    if (fingerTrail.length > trailMaxLength) {
      fingerTrail.shift();
    }
  } else if (!handDetected && fingerTrail.length > 0) {
    fingerTrail.shift();
  }

  updateGame(dt);
  if (!running) {
    updateMagicText();
  }
  drawGame(dt);
  requestAnimationFrame(loop);
}

function initMagicText() {
  const container = document.getElementById("magicTextContainer");
  if (!container) return;

  const paragraphs = container.querySelectorAll(".about-description");
  paragraphs.forEach((p) => {
    const text = p.textContent.trim();
    const words = text.split(/\s+/);
    p.innerHTML = "";
    
    words.forEach((word) => {
      const span = document.createElement("span");
      span.className = "magic-word";
      
      const base = document.createElement("span");
      base.className = "magic-word-base";
      base.textContent = word + " ";
      
      const fill = document.createElement("span");
      fill.className = "magic-word-fill";
      fill.textContent = word + " ";
      
      span.appendChild(base);
      span.appendChild(fill);
      p.appendChild(span);
    });
  });
}

function updateMagicText() {
  const container = document.getElementById("magicTextContainer");
  if (!container || running) return;

  const fills = container.querySelectorAll(".magic-word-fill");
  const rect = container.getBoundingClientRect();
  const windowHeight = window.innerHeight;
  
  // Animation starts when card is 85% from top, finishes at 30%
  const start = windowHeight * 0.85;
  const end = windowHeight * 0.3;
  const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
  
  fills.forEach((fill, i) => {
    const wordStart = i / fills.length;
    const wordEnd = (i + 1.5) / fills.length; // Slight overlap for smoothness
    
    let opacity = 0;
    if (progress > wordStart) {
      opacity = Math.min(1, (progress - wordStart) / (wordEnd - wordStart));
    }
    fill.style.opacity = opacity;
  });
}

/* Title split logic removed */
function updateSplitText(hoverIndex) {}
function initSplitText() {}

function pushCursorPoint(ev) {
  const rect = canvas.getBoundingClientRect();
  const x = ev.clientX - rect.left;
  const y = ev.clientY - rect.top;
  pointerPoint = { x, y };
  pointerActive = true;
}

async function startGame() {
  score = 0;
  lives = maxLives;
  bombHits = 0;
  comboCount = 0;
  lastFruitSliceAt = 0;
  fruitCuts = 0;
  prankTriggered = prankEverShown;
  prankRunning = false;
  prankHitTarget = Math.random() < 0.5 ? 3 : 5;
  objects.length = 0;
  particles.length = 0;
  splits.length = 0;
  explosions.length = 0;
  slowMoUntil = 0;
  fingerTrail.length = 0;
  smoothFingerPoint = null;
  scoreEl.textContent = "0";
  bombHitsEl.textContent = "0";
  comboTextEl.textContent = "";
  prankOverlayEl.classList.add("hidden");
  prankBtnEl.classList.add("hidden");
  prankBtnEl.style.left = "0px";
  prankBtnEl.style.top = "0px";
  prankBtnEl.onclick = null;
  updateLivesUI();
  spawnTimer = 200;
  running = true;
  playArea.classList.add("active");
  resizeCanvas(); // Ensure canvas has correct size after showing
  startOverlay.classList.add("hidden");
  setStatus("Mouse active. Slice fruits, avoid bombs.");
}

startBtn.addEventListener("click", async () => {
  console.log("Start button clicked!");
  if (startBtn.disabled) return;
  startBtn.disabled = true;
  try {
    await startGame();
    heroTab.classList.add("hidden");
    startOverlay.classList.add("hidden");
  } catch (err) {
    console.error("Game start error:", err);
    startBtn.disabled = false;
  }
});

navLinks.forEach(link => {
  link.addEventListener("click", (e) => {
    if (link.getAttribute("href") === "#play") {
      e.preventDefault();
      startBtn.click();
    }
  });
});

playAgainBtn.addEventListener("click", async () => {
  playAgainBtn.disabled = true;
  try {
    await startGame();
    startOverlay.classList.add("hidden");
  } finally {
    playAgainBtn.disabled = false;
  }
});

window.addEventListener("resize", resizeCanvas);
window.addEventListener("mousemove", (ev) => {
  pushCursorPoint(ev);
});
window.addEventListener("mouseleave", () => {
  pointerActive = false;
});
window.addEventListener("touchstart", (ev) => {
  const t = ev.touches[0];
  if (t) {
    pushCursorPoint(t);
  }
}, { passive: true });
window.addEventListener("touchmove", (ev) => {
  const t = ev.touches[0];
  if (t) {
    if (running) ev.preventDefault(); // Prevent scrolling while playing
    pushCursorPoint(t);
  }
}, { passive: false });
window.addEventListener("touchend", () => {
  pointerActive = false;
});

function updateScrollSpy() {
  const sections = document.querySelectorAll("section, .app");
  const navLinks = document.querySelectorAll(".nav-link");
  
  let current = "heroTab";
  sections.forEach((section) => {
    // Only consider sections that are actually visible (not display: none)
    if (section.offsetHeight === 0) return;
    
    const sectionTop = section.offsetTop;
    if (window.pageYOffset >= sectionTop - 150) {
      const id = section.getAttribute("id");
      if (id) current = id;
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    const href = link.getAttribute("href");
    if (href && href.includes(current)) {
      link.classList.add("active");
    }
  });
}

// Premium Scroll Spy & Mobile Touch Prevention
window.addEventListener("scroll", updateScrollSpy);

canvas.addEventListener("touchstart", (e) => {
  if (running) e.preventDefault();
}, { passive: false });

canvas.addEventListener("touchmove", (e) => {
  if (running) e.preventDefault();
}, { passive: false });

setupSprites();
updateLivesUI();
resizeCanvas();
initMagicText();
initSplitText();
updateScrollSpy(); // Initialize scroll spy state

const winAlertElTopLevel = document.getElementById("winAlert");
const closeWinAlert = document.getElementById("closeWinAlert");
const winCheckBtn = document.getElementById("winCheckBtn");

if (closeWinAlert) {
  closeWinAlert.addEventListener("click", () => {
    if (winAlertElTopLevel) winAlertElTopLevel.classList.add("hidden");
  });
}
if (winCheckBtn) {
  winCheckBtn.addEventListener("click", () => {
    if (winAlertElTopLevel) winAlertElTopLevel.classList.add("hidden");
  });
}

requestAnimationFrame(loop);
