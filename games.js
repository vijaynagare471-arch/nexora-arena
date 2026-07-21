// ══════════════════════════════════════════════════════════
// NEXORA ARENA — CASINO GAMES ENGINE
// ══════════════════════════════════════════════════════════

const CASINO_API = window.location.origin + '/api/casino';
let casinoUser = null;
let casinoBalance = 0;
let casinoSettings = {};
let gameBetHistory = [];

// ── Init ────────────────────────────────────────────────
async function initCasino() {
  try {
    // Read user from sessionStorage (set by main app) or localStorage
    const stored = sessionStorage.getItem('nexora_user') || localStorage.getItem('nexora_user');
    if (stored) {
      casinoUser = JSON.parse(stored);
      casinoBalance = casinoUser.balance || 0;
    }
    const res = await fetch(CASINO_API + '/settings');
    casinoSettings = await res.json();
    updateAllBalanceChips();
    loadBetHistory();
  } catch(e) { console.error('Casino init:', e); }
}

function updateAllBalanceChips() {
  document.querySelectorAll('.game-balance-chip').forEach(el => {
    el.textContent = '₹' + (casinoBalance || 0).toLocaleString('en-IN');
  });
  if (casinoUser) {
    casinoUser.balance = casinoBalance;
    localStorage.setItem('nexora_user', JSON.stringify(casinoUser));
  }
}

function updateBalance(newBalance) {
  casinoBalance = newBalance;
  updateAllBalanceChips();
}

function showGameToast(msg, type='success') {
  const toast = document.getElementById('casino-toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = 'casino-toast ' + type;
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 2500);
}

function showResultOverlay(won, amount, extra='') {
  const overlay = document.getElementById('result-overlay');
  if (!overlay) return;
  overlay.querySelector('.result-emoji').textContent = won ? '🎉' : '💥';
  overlay.querySelector('.result-label').textContent = won ? 'YOU WON!' : 'BETTER LUCK!';
  overlay.querySelector('.result-label').className = 'result-label ' + (won ? 'win' : 'lose');
  overlay.querySelector('.result-amount').textContent = won ? '+₹' + amount.toLocaleString('en-IN') : extra || '';
  overlay.classList.add('show');
  setTimeout(() => overlay.classList.remove('show'), 2800);
}

function loadBetHistory() {
  const key = 'casino_history';
  gameBetHistory = JSON.parse(localStorage.getItem(key) || '[]');
  renderBetHistory();
}

function addBetHistory(game, betAmount, result, winAmount) {
  gameBetHistory.unshift({ game, bet: betAmount, result, win: winAmount, time: new Date().toLocaleTimeString() });
  if (gameBetHistory.length > 20) gameBetHistory.pop();
  localStorage.setItem('casino_history', JSON.stringify(gameBetHistory));
  renderBetHistory();
}

function renderBetHistory() {
  document.querySelectorAll('.bet-history-list').forEach(list => {
    list.innerHTML = gameBetHistory.slice(0, 8).map(b => `
      <div class="bet-history-item">
        <span class="bet-hist-game">${b.game} • ₹${b.bet}</span>
        <span class="bet-hist-result ${b.win > 0 ? 'won' : 'lost'}">${b.win > 0 ? '+₹'+b.win : '-₹'+b.bet}</span>
      </div>`).join('') || '<div style="padding:12px;text-align:center;color:var(--text-muted);font-size:0.75rem;">No bets yet</div>';
  });
}

function getBetAmount(inputId) {
  return Math.max(10, parseInt(document.getElementById(inputId)?.value) || 10);
}

// ══════════════════════════════════════════════════════════
// 🛩 PLANE CRASH GAME
// ══════════════════════════════════════════════════════════
let planeState = { status: 'waiting', multiplier: 1.00, myBet: null, myBetId: null, cashedOut: false };
let planeSSE = null;

function initPlaneCrash() {
  connectPlaneSSE();
  renderPlaneHistory();
}

function connectPlaneSSE() {
  if (planeSSE) planeSSE.close();
  const source = new EventSource('/sse');
  source.addEventListener('plane_round_update', e => {
    const round = JSON.parse(e.data);
    updatePlaneUI(round);
  });
  planeSSE = source;
}

function updatePlaneUI(round) {
  planeState.status = round.status;
  planeState.multiplier = round.multiplier;

  const num = document.getElementById('plane-multiplier-num');
  const statusLabel = document.getElementById('plane-status-label');
  const placeBtn = document.getElementById('plane-place-btn');
  const cashoutBtn = document.getElementById('plane-cashout-btn');
  const countdown = document.getElementById('plane-countdown');
  if (!num) return;

  num.textContent = round.multiplier.toFixed(2) + 'x';

  if (round.status === 'waiting') {
    num.className = 'plane-multiplier-num';
    statusLabel.textContent = 'WAITING FOR BETS...';
    if (countdown) countdown.style.display = 'block';
    placeBtn.style.display = 'block';
    cashoutBtn.style.display = 'none';
    placeBtn.className = 'bet-action-btn btn-place';
    placeBtn.disabled = false;
    placeBtn.textContent = 'PLACE BET';
    planeState.myBet = null;
    planeState.myBetId = null;
    planeState.cashedOut = false;
  } else if (round.status === 'running') {
    if (countdown) countdown.style.display = 'none';
    statusLabel.textContent = 'FLYING!';
    if (planeState.myBet && !planeState.cashedOut) {
      placeBtn.style.display = 'none';
      cashoutBtn.style.display = 'block';
      cashoutBtn.textContent = `CASH OUT @ ${round.multiplier.toFixed(2)}x (₹${Math.floor(planeState.myBet * round.multiplier)})`;
    } else {
      placeBtn.style.display = 'block';
      placeBtn.textContent = round.multiplier.toFixed(2) + 'x';
      placeBtn.className = 'bet-action-btn btn-waiting';
      placeBtn.disabled = true;
      cashoutBtn.style.display = 'none';
    }
    // Draw graph
    drawPlaneGraph(round.multiplier);
  } else if (round.status === 'crashed') {
    num.className = 'plane-multiplier-num crashed';
    statusLabel.textContent = 'FLEW AWAY!';
    placeBtn.style.display = 'block';
    placeBtn.className = 'bet-action-btn btn-crashed';
    placeBtn.textContent = 'FLEW AWAY @ ' + round.multiplier.toFixed(2) + 'x';
    placeBtn.disabled = true;
    cashoutBtn.style.display = 'none';
    if (planeState.myBet && !planeState.cashedOut) {
      showResultOverlay(false, 0, 'Flew away!');
      addBetHistory('Plane', planeState.myBet, round.multiplier.toFixed(2)+'x', 0);
    }
    clearPlaneGraph();
    renderPlaneHistory();
  }
}

function drawPlaneGraph(multiplier) {
  const canvas = document.getElementById('plane-graph-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const progress = Math.min((multiplier - 1) / 9, 1);
  const x = progress * w;
  const y = h - progress * h;
  const grad = ctx.createLinearGradient(0, h, x, y);
  grad.addColorStop(0, 'rgba(124,58,237,0.3)');
  grad.addColorStop(1, 'rgba(124,58,237,0.8)');
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.quadraticCurveTo(x * 0.3, h, x, y);
  ctx.lineTo(x, h);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.quadraticCurveTo(x * 0.3, h, x, y);
  ctx.strokeStyle = '#7c3aed';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Draw plane emoji
  ctx.font = '20px serif';
  ctx.fillText('✈️', x - 10, y - 10);
}

function clearPlaneGraph() {
  const canvas = document.getElementById('plane-graph-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

async function renderPlaneHistory() {
  try {
    const res = await fetch(CASINO_API + '/plane/history');
    const history = await res.json();
    const bar = document.getElementById('plane-history-bar');
    if (!bar) return;
    bar.innerHTML = history.slice(0, 12).map(r => {
      const m = r.crashAt || r.multiplier;
      const cls = m < 2 ? 'low' : m < 5 ? 'mid' : 'high';
      return `<span class="plane-history-chip ${cls}">${parseFloat(m).toFixed(2)}x</span>`;
    }).join('');
  } catch(e) {}
}

window.planePlaceBet = async function() {
  if (!casinoUser) { showGameToast('Please login first', 'error'); return; }
  if (planeState.status !== 'waiting') { showGameToast('Wait for next round', 'error'); return; }
  const amount = getBetAmount('plane-bet-input');
  if (amount > casinoBalance) { showGameToast('Insufficient balance', 'error'); return; }
  const autoCashOut = parseFloat(document.getElementById('plane-auto-cashout')?.value) || 0;
  try {
    const res = await fetch(CASINO_API + '/plane/bet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: casinoUser.id, amount, autoCashOut })
    });
    const data = await res.json();
    if (data.error) { showGameToast(data.error, 'error'); return; }
    planeState.myBet = amount;
    planeState.myBetId = data.bet.id;
    planeState.cashedOut = false;
    updateBalance(data.newBalance);
    showGameToast('Bet placed! ✈️ Ready to fly!', 'success');
    document.getElementById('plane-place-btn').textContent = '✅ BET PLACED (₹' + amount + ')';
    document.getElementById('plane-place-btn').disabled = true;
  } catch(e) { showGameToast('Error placing bet', 'error'); }
};

window.planeCashOut = async function() {
  if (!planeState.myBet || planeState.cashedOut) return;
  try {
    const res = await fetch(CASINO_API + '/plane/cashout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: casinoUser.id, betId: planeState.myBetId })
    });
    const data = await res.json();
    if (data.error) { showGameToast(data.error, 'error'); return; }
    planeState.cashedOut = true;
    updateBalance(data.newBalance);
    const mult = data.multiplier;
    const num = document.getElementById('plane-multiplier-num');
    if (num) num.className = 'plane-multiplier-num cashed';
    showResultOverlay(true, data.winAmount);
    addBetHistory('Plane', planeState.myBet, mult.toFixed(2)+'x', data.winAmount);
    document.getElementById('plane-cashout-btn').style.display = 'none';
    document.getElementById('plane-place-btn').style.display = 'block';
    document.getElementById('plane-place-btn').textContent = '✅ Cashed out @ ' + mult.toFixed(2) + 'x';
    document.getElementById('plane-place-btn').disabled = true;
  } catch(e) { showGameToast('Error cashing out', 'error'); }
};

window.planeBetPreset = function(multiplier) {
  const input = document.getElementById('plane-bet-input');
  if (input) input.value = Math.min(casinoBalance, Math.floor((parseInt(input.value)||10) * multiplier));
};

// ══════════════════════════════════════════════════════════
// 💣 MINES GAME
// ══════════════════════════════════════════════════════════
let minesState = { sessionId: null, active: false, mineCount: 3, revealed: 0, multiplier: 1.00, betAmount: 0 };

function initMines() {
  renderMinesGrid(false);
}

function renderMinesGrid(active) {
  const grid = document.getElementById('mines-grid');
  if (!grid) return;
  grid.innerHTML = Array.from({ length: 25 }, (_, i) => `
    <div class="mine-cell" id="mine-cell-${i}" onclick="${active ? `minesReveal(${i})` : ''}">
      ${active ? '' : '💎'}
    </div>`).join('');
}

window.minesStart = async function() {
  if (!casinoUser) { showGameToast('Please login first', 'error'); return; }
  const amount = getBetAmount('mines-bet-input');
  if (amount > casinoBalance) { showGameToast('Insufficient balance', 'error'); return; }
  minesState.mineCount = parseInt(document.querySelector('.mine-count-btn.active')?.dataset.count) || 3;
  try {
    const res = await fetch(CASINO_API + '/mines/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: casinoUser.id, amount, mineCount: minesState.mineCount })
    });
    const data = await res.json();
    if (data.error) { showGameToast(data.error, 'error'); return; }
    minesState.sessionId = data.sessionId;
    minesState.active = true;
    minesState.revealed = 0;
    minesState.multiplier = 1.00;
    minesState.betAmount = amount;
    updateBalance(data.newBalance);
    renderMinesGrid(true);
    document.getElementById('mines-start-btn').style.display = 'none';
    document.getElementById('mines-cashout-btn').style.display = 'block';
    document.getElementById('mines-multiplier').textContent = '1.00x';
    document.getElementById('mines-cashout-btn').textContent = 'CASH OUT (₹' + amount + ')';
    document.getElementById('mines-cashout-btn').disabled = true;
  } catch(e) { showGameToast('Error starting game', 'error'); }
};

window.minesReveal = async function(cellIndex) {
  if (!minesState.active) return;
  const cell = document.getElementById('mine-cell-' + cellIndex);
  if (!cell || cell.classList.contains('revealed-safe') || cell.classList.contains('revealed-mine')) return;
  try {
    const res = await fetch(CASINO_API + '/mines/reveal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: minesState.sessionId, cellIndex })
    });
    const data = await res.json();
    if (data.isMine) {
      cell.classList.add('revealed-mine');
      cell.textContent = '💣';
      minesState.active = false;
      // Show all mines
      data.minePositions.forEach(idx => {
        const c = document.getElementById('mine-cell-' + idx);
        if (c && !c.classList.contains('revealed-mine')) { c.classList.add('show-mine'); c.textContent = '💣'; }
      });
      showResultOverlay(false, 0, 'Hit a mine!');
      addBetHistory('Mines', minesState.betAmount, 'Mine!', 0);
      document.getElementById('mines-start-btn').style.display = 'block';
      document.getElementById('mines-cashout-btn').style.display = 'none';
      // Re-enable grid click removal after 1.5s
      setTimeout(() => renderMinesGrid(false), 2000);
    } else {
      cell.classList.add('revealed-safe');
      cell.textContent = '💎';
      minesState.revealed++;
      minesState.multiplier = data.multiplier;
      document.getElementById('mines-multiplier').textContent = data.multiplier.toFixed(2) + 'x';
      const cashoutBtn = document.getElementById('mines-cashout-btn');
      const cashWin = Math.floor(minesState.betAmount * data.multiplier);
      cashoutBtn.textContent = `CASH OUT ₹${cashWin} (${data.multiplier.toFixed(2)}x)`;
      cashoutBtn.disabled = false;
    }
  } catch(e) { showGameToast('Error', 'error'); }
};

window.minesCashOut = async function() {
  if (!minesState.active || minesState.revealed === 0) return;
  try {
    const res = await fetch(CASINO_API + '/mines/cashout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: minesState.sessionId })
    });
    const data = await res.json();
    if (data.error) { showGameToast(data.error, 'error'); return; }
    minesState.active = false;
    updateBalance(data.newBalance);
    // Show all mine positions
    data.minePositions.forEach(idx => {
      const c = document.getElementById('mine-cell-' + idx);
      if (c) { c.classList.add('show-mine'); c.textContent = '💣'; }
    });
    showResultOverlay(true, data.winAmount);
    addBetHistory('Mines', minesState.betAmount, data.multiplier.toFixed(2)+'x', data.winAmount);
    document.getElementById('mines-start-btn').style.display = 'block';
    document.getElementById('mines-cashout-btn').style.display = 'none';
    setTimeout(() => renderMinesGrid(false), 2000);
  } catch(e) { showGameToast('Error cashing out', 'error'); }
};

window.minesSetCount = function(btn, count) {
  document.querySelectorAll('.mine-count-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
};

// ══════════════════════════════════════════════════════════
// 🎡 SPIN & WIN GAME
// ══════════════════════════════════════════════════════════
const SPIN_SEGMENTS = [
  { label: '2x', color: '#7c3aed', multiplier: 2 },
  { label: '0x', color: '#1f2937', multiplier: 0 },
  { label: '1.5x', color: '#1d4ed8', multiplier: 1.5 },
  { label: '0x', color: '#1f2937', multiplier: 0 },
  { label: '3x', color: '#b45309', multiplier: 3 },
  { label: '0x', color: '#1f2937', multiplier: 0 },
  { label: '5x', color: '#065f46', multiplier: 5 },
  { label: '0x', color: '#1f2937', multiplier: 0 },
  { label: '10x', color: '#7f1d1d', multiplier: 10 },
  { label: '1x', color: '#374151', multiplier: 1 },
  { label: '0x', color: '#1f2937', multiplier: 0 },
  { label: '1.5x', color: '#1e3a5f', multiplier: 1.5 },
];
let spinBusy = false;
let spinCanvas = null, spinCtx = null;
let spinCurrentAngle = 0;

function initSpin() {
  spinCanvas = document.getElementById('spin-wheel-canvas');
  if (!spinCanvas) return;
  spinCtx = spinCanvas.getContext('2d');
  drawWheel(0);
}

function drawWheel(angle) {
  if (!spinCtx) return;
  const cx = spinCanvas.width / 2, cy = spinCanvas.height / 2;
  const r = cx - 4;
  const segAngle = (Math.PI * 2) / SPIN_SEGMENTS.length;
  spinCtx.clearRect(0, 0, spinCanvas.width, spinCanvas.height);
  SPIN_SEGMENTS.forEach((seg, i) => {
    const start = angle + i * segAngle - Math.PI / 2;
    const end = start + segAngle;
    spinCtx.beginPath();
    spinCtx.moveTo(cx, cy);
    spinCtx.arc(cx, cy, r, start, end);
    spinCtx.closePath();
    spinCtx.fillStyle = seg.color;
    spinCtx.fill();
    spinCtx.strokeStyle = 'rgba(255,255,255,0.1)';
    spinCtx.lineWidth = 1;
    spinCtx.stroke();
    spinCtx.save();
    spinCtx.translate(cx, cy);
    spinCtx.rotate(start + segAngle / 2);
    spinCtx.fillStyle = '#fff';
    spinCtx.font = 'bold 11px Inter,sans-serif';
    spinCtx.textAlign = 'right';
    spinCtx.fillText(seg.label, r - 8, 4);
    spinCtx.restore();
  });
  // Center circle
  spinCtx.beginPath();
  spinCtx.arc(cx, cy, 18, 0, Math.PI * 2);
  spinCtx.fillStyle = '#0d0d1a';
  spinCtx.fill();
  spinCtx.strokeStyle = 'rgba(255,255,255,0.2)';
  spinCtx.lineWidth = 2;
  spinCtx.stroke();
}

window.placeSpin = async function() {
  if (!casinoUser) { showGameToast('Please login first', 'error'); return; }
  if (spinBusy) return;
  const amount = getBetAmount('spin-bet-input');
  if (amount > casinoBalance) { showGameToast('Insufficient balance', 'error'); return; }
  spinBusy = true;
  document.getElementById('spin-place-btn').disabled = true;
  try {
    const res = await fetch(CASINO_API + '/spin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: casinoUser.id, amount })
    });
    const data = await res.json();
    if (data.error) { showGameToast(data.error, 'error'); spinBusy = false; document.getElementById('spin-place-btn').disabled = false; return; }

    const segAngle = (Math.PI * 2) / SPIN_SEGMENTS.length;
    const targetIdx = data.segmentIndex % SPIN_SEGMENTS.length;
    const targetAngle = -(targetIdx * segAngle + segAngle / 2);
    const totalSpins = Math.PI * 2 * 5 + targetAngle - spinCurrentAngle;
    const duration = 4000;
    const start = performance.now();
    const startAngle = spinCurrentAngle;

    function animate(now) {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 4);
      spinCurrentAngle = startAngle + totalSpins * ease;
      drawWheel(spinCurrentAngle);
      if (t < 1) { requestAnimationFrame(animate); }
      else {
        spinCurrentAngle = startAngle + totalSpins;
        drawWheel(spinCurrentAngle);
        updateBalance(data.newBalance);
        const won = data.multiplier > 0;
        const badge = document.getElementById('spin-result-badge');
        if (badge) {
          badge.textContent = won ? `🎉 ${data.result} — +₹${data.winAmount}` : `😞 No Win`;
          badge.className = 'spin-result-badge ' + (won ? 'win' : 'lose');
        }
        if (won) showResultOverlay(true, data.winAmount);
        addBetHistory('Spin', amount, data.result, data.winAmount);
        spinBusy = false;
        document.getElementById('spin-place-btn').disabled = false;
      }
    }
    requestAnimationFrame(animate);
  } catch(e) { showGameToast('Error', 'error'); spinBusy = false; document.getElementById('spin-place-btn').disabled = false; }
};

// ══════════════════════════════════════════════════════════
// 🎲 DICE GAME
// ══════════════════════════════════════════════════════════
let diceIsOver = true;
let dicePrediction = 50;

function initDice() {
  updateDiceStats();
}

function updateDiceStats() {
  const winChance = diceIsOver ? (100 - dicePrediction) : dicePrediction;
  const mult = Math.round(97 / winChance * 100) / 100;
  const el = document.getElementById('dice-prediction-val');
  const wc = document.getElementById('dice-winchance');
  const mlt = document.getElementById('dice-multiplier');
  if (el) el.textContent = dicePrediction;
  if (wc) wc.textContent = winChance.toFixed(1) + '%';
  if (mlt) mlt.textContent = mult.toFixed(2) + 'x';
  const slider = document.getElementById('dice-slider');
  if (slider) slider.style.setProperty('--pct', dicePrediction + '%');
}

window.diceSliderChange = function(val) {
  dicePrediction = parseInt(val);
  if (diceIsOver && dicePrediction > 98) dicePrediction = 98;
  if (!diceIsOver && dicePrediction < 2) dicePrediction = 2;
  document.getElementById('dice-slider').value = dicePrediction;
  updateDiceStats();
};

window.diceSetDirection = function(isOver, btn) {
  diceIsOver = isOver;
  document.querySelectorAll('.dice-direction-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  updateDiceStats();
};

window.rollDice = async function() {
  if (!casinoUser) { showGameToast('Please login first', 'error'); return; }
  const amount = getBetAmount('dice-bet-input');
  if (amount > casinoBalance) { showGameToast('Insufficient balance', 'error'); return; }
  const rollDisplay = document.getElementById('dice-roll-display');
  const btn = document.getElementById('dice-roll-btn');
  btn.disabled = true;
  if (rollDisplay) { rollDisplay.textContent = '🎲'; rollDisplay.className = 'dice-roll-display'; }
  try {
    const res = await fetch(CASINO_API + '/dice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: casinoUser.id, amount, prediction: dicePrediction, isOver: diceIsOver })
    });
    const data = await res.json();
    if (data.error) { showGameToast(data.error, 'error'); btn.disabled = false; return; }
    updateBalance(data.newBalance);
    if (rollDisplay) {
      rollDisplay.textContent = data.roll;
      rollDisplay.className = 'dice-roll-display ' + (data.won ? 'won' : 'lost');
    }
    if (data.won) showResultOverlay(true, data.winAmount);
    addBetHistory('Dice', amount, data.roll + (diceIsOver ? ' > ' : ' < ') + dicePrediction, data.winAmount);
    btn.disabled = false;
  } catch(e) { showGameToast('Error', 'error'); btn.disabled = false; }
};

// ══════════════════════════════════════════════════════════
// 🪙 COINFLIP GAME
// ══════════════════════════════════════════════════════════
let coinChoice = null;
let coinBusy = false;

window.coinSelect = function(choice, btn) {
  coinChoice = choice;
  document.querySelectorAll('.coin-choice-btn').forEach(b => b.className = 'coin-choice-btn');
  btn.classList.add('selected-' + choice);
};

window.flipCoin = async function() {
  if (!casinoUser) { showGameToast('Please login first', 'error'); return; }
  if (!coinChoice) { showGameToast('Pick Heads or Tails!', 'error'); return; }
  if (coinBusy) return;
  const amount = getBetAmount('coin-bet-input');
  if (amount > casinoBalance) { showGameToast('Insufficient balance', 'error'); return; }
  coinBusy = true;
  const btn = document.getElementById('coin-flip-btn');
  btn.disabled = true;
  const coinEl = document.getElementById('coin-el');
  const resultText = document.getElementById('coin-result-text');
  if (coinEl) { coinEl.classList.add('flipping'); }
  if (resultText) { resultText.textContent = ''; resultText.className = 'coin-result-text'; }
  try {
    const res = await fetch(CASINO_API + '/coinflip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: casinoUser.id, amount, choice: coinChoice })
    });
    const data = await res.json();
    if (data.error) { showGameToast(data.error, 'error'); coinBusy = false; btn.disabled = false; if (coinEl) coinEl.classList.remove('flipping'); return; }
    setTimeout(() => {
      if (coinEl) coinEl.classList.remove('flipping');
      updateBalance(data.newBalance);
      if (resultText) {
        resultText.textContent = data.won ? `🎉 ${data.result.toUpperCase()}! +₹${data.winAmount}` : `😞 ${data.result.toUpperCase()}`;
        resultText.className = 'coin-result-text ' + (data.won ? 'win' : 'lose');
      }
      if (data.won) showResultOverlay(true, data.winAmount);
      addBetHistory('Coinflip', amount, data.result, data.winAmount);
      coinBusy = false;
      btn.disabled = false;
    }, 1300);
  } catch(e) { showGameToast('Error', 'error'); coinBusy = false; btn.disabled = false; }
};

// ══════════════════════════════════════════════════════════
// 📈 LIMBO GAME
// ══════════════════════════════════════════════════════════
window.placeLimbo = async function() {
  if (!casinoUser) { showGameToast('Please login first', 'error'); return; }
  const amount = getBetAmount('limbo-bet-input');
  if (amount > casinoBalance) { showGameToast('Insufficient balance', 'error'); return; }
  const target = parseFloat(document.getElementById('limbo-target')?.value) || 2.00;
  if (target < 1.01 || target > 1000) { showGameToast('Target must be 1.01–1000', 'error'); return; }
  const display = document.getElementById('limbo-result-display');
  const btn = document.getElementById('limbo-place-btn');
  btn.disabled = true;
  if (display) { display.textContent = '...'; display.className = 'limbo-result-display'; }
  try {
    const res = await fetch(CASINO_API + '/limbo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: casinoUser.id, amount, targetMultiplier: target })
    });
    const data = await res.json();
    if (data.error) { showGameToast(data.error, 'error'); btn.disabled = false; return; }
    updateBalance(data.newBalance);
    if (display) {
      display.textContent = data.resultMultiplier.toFixed(2) + 'x';
      display.className = 'limbo-result-display ' + (data.won ? 'won' : 'lost');
    }
    if (data.won) showResultOverlay(true, data.winAmount);
    addBetHistory('Limbo', amount, data.resultMultiplier.toFixed(2)+'x', data.winAmount);
    btn.disabled = false;
  } catch(e) { showGameToast('Error', 'error'); btn.disabled = false; }
};

// ══════════════════════════════════════════════════════════
// 🗼 TOWER GAME
// ══════════════════════════════════════════════════════════
let towerState = { sessionId: null, active: false, currentRow: 0, totalRows: 9, betAmount: 0, difficulty: 'easy' };

function initTower() {
  renderTowerGrid(false, 0, 9);
}

function renderTowerGrid(active, currentRow, totalRows) {
  const grid = document.getElementById('tower-grid');
  if (!grid) return;
  const cols = 4;
  grid.innerHTML = Array.from({ length: totalRows }, (_, rowIdx) => `
    <div class="tower-row" id="tower-row-${rowIdx}">
      ${Array.from({ length: cols }, (__, colIdx) => `
        <div class="tower-cell ${!active ? '' : rowIdx === currentRow ? 'current-row' : rowIdx < currentRow ? 'completed' : ''}" 
             id="tower-cell-${rowIdx}-${colIdx}"
             onclick="${active && rowIdx === currentRow ? `towerStep(${colIdx})` : ''}">
          ${rowIdx < currentRow ? '✅' : rowIdx === currentRow && active ? '?' : '🔵'}
        </div>`).join('')}
    </div>`).join('');
}

window.towerStart = async function() {
  if (!casinoUser) { showGameToast('Please login first', 'error'); return; }
  const amount = getBetAmount('tower-bet-input');
  if (amount > casinoBalance) { showGameToast('Insufficient balance', 'error'); return; }
  towerState.difficulty = document.querySelector('.difficulty-btn.active')?.dataset.diff || 'easy';
  try {
    const res = await fetch(CASINO_API + '/tower/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: casinoUser.id, amount, difficulty: towerState.difficulty })
    });
    const data = await res.json();
    if (data.error) { showGameToast(data.error, 'error'); return; }
    towerState.sessionId = data.sessionId;
    towerState.active = true;
    towerState.currentRow = 0;
    towerState.totalRows = data.rows;
    towerState.betAmount = amount;
    updateBalance(data.newBalance);
    renderTowerGrid(true, 0, data.rows);
    document.getElementById('tower-start-btn').style.display = 'none';
    document.getElementById('tower-cashout-btn').style.display = 'block';
    document.getElementById('tower-cashout-btn').disabled = true;
    document.getElementById('tower-multiplier').textContent = '1.00x';
  } catch(e) { showGameToast('Error starting tower', 'error'); }
};

window.towerStep = async function(colIndex) {
  if (!towerState.active) return;
  try {
    const res = await fetch(CASINO_API + '/tower/step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: towerState.sessionId, colIndex })
    });
    const data = await res.json();
    if (data.isMine) {
      // Show mine hit
      const cell = document.getElementById(`tower-cell-${towerState.currentRow}-${colIndex}`);
      if (cell) { cell.classList.remove('current-row'); cell.classList.add('mine-hit'); cell.textContent = '💣'; }
      towerState.active = false;
      showResultOverlay(false, 0, 'Hit a mine!');
      addBetHistory('Tower', towerState.betAmount, towerState.difficulty, 0);
      document.getElementById('tower-start-btn').style.display = 'block';
      document.getElementById('tower-cashout-btn').style.display = 'none';
      setTimeout(() => renderTowerGrid(false, 0, towerState.totalRows), 2000);
    } else {
      const cell = document.getElementById(`tower-cell-${towerState.currentRow}-${colIndex}`);
      if (cell) { cell.classList.remove('current-row'); cell.classList.add('safe'); cell.textContent = '✅'; }
      towerState.currentRow = data.currentRow;
      document.getElementById('tower-multiplier').textContent = data.multiplier.toFixed(2) + 'x';
      document.getElementById('tower-cashout-btn').disabled = false;
      document.getElementById('tower-cashout-btn').textContent = `CASH OUT ₹${Math.floor(towerState.betAmount * data.multiplier)} (${data.multiplier.toFixed(2)}x)`;
      // Highlight next row
      if (!data.isTop) {
        document.querySelectorAll(`#tower-row-${towerState.currentRow} .tower-cell`).forEach(c => {
          c.classList.add('current-row');
          c.textContent = '?';
          const idx = Array.from(c.parentNode.children).indexOf(c);
          c.setAttribute('onclick', `towerStep(${idx})`);
        });
      } else {
        // Auto cashout on top
        window.towerCashOut();
      }
    }
  } catch(e) { showGameToast('Error', 'error'); }
};

window.towerCashOut = async function() {
  if (!towerState.active || towerState.currentRow === 0) return;
  try {
    const res = await fetch(CASINO_API + '/tower/cashout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: towerState.sessionId })
    });
    const data = await res.json();
    if (data.error) { showGameToast(data.error, 'error'); return; }
    towerState.active = false;
    updateBalance(data.newBalance);
    showResultOverlay(true, data.winAmount);
    addBetHistory('Tower', towerState.betAmount, data.multiplier.toFixed(2)+'x', data.winAmount);
    document.getElementById('tower-start-btn').style.display = 'block';
    document.getElementById('tower-cashout-btn').style.display = 'none';
    setTimeout(() => renderTowerGrid(false, 0, towerState.totalRows), 2000);
  } catch(e) { showGameToast('Error', 'error'); }
};

window.towerSetDifficulty = function(btn, diff) {
  document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
};

// ══════════════════════════════════════════════════════════
// 🎨 COLOR PREDICTION
// ══════════════════════════════════════════════════════════
let colorChoice = null;
let colorHistory = [];

window.colorSelect = function(color, btn) {
  colorChoice = color;
  document.querySelectorAll('.color-choice-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
};

window.placeColor = async function() {
  if (!casinoUser) { showGameToast('Please login first', 'error'); return; }
  if (!colorChoice) { showGameToast('Select a color first!', 'error'); return; }
  const amount = getBetAmount('color-bet-input');
  if (amount > casinoBalance) { showGameToast('Insufficient balance', 'error'); return; }
  const btn = document.getElementById('color-place-btn');
  btn.disabled = true;
  const ball = document.getElementById('color-result-ball');
  if (ball) { ball.className = 'color-result-ball'; ball.textContent = '?'; }
  try {
    const res = await fetch(CASINO_API + '/color', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: casinoUser.id, amount, choice: colorChoice })
    });
    const data = await res.json();
    if (data.error) { showGameToast(data.error, 'error'); btn.disabled = false; return; }
    setTimeout(() => {
      updateBalance(data.newBalance);
      if (ball) {
        ball.className = 'color-result-ball ' + data.result;
        const colors = { red: '🔴', green: '🟢', violet: '🟣' };
        ball.textContent = colors[data.result] || '⚪';
      }
      colorHistory.unshift(data.result);
      if (colorHistory.length > 20) colorHistory.pop();
      const histRow = document.getElementById('color-history-row');
      if (histRow) histRow.innerHTML = colorHistory.map(c => `<div class="color-hist-dot ${c}"></div>`).join('');
      if (data.won) showResultOverlay(true, data.winAmount);
      addBetHistory('Color', amount, data.result, data.winAmount);
      btn.disabled = false;
    }, 800);
  } catch(e) { showGameToast('Error', 'error'); btn.disabled = false; }
};

// ══════════════════════════════════════════════════════════
// 🎯 PLINKO GAME
// ══════════════════════════════════════════════════════════
let plinkoRisk = 'medium';

function initPlinko() {
  drawPlinkoBoard();
}

function drawPlinkoBoard() {
  const canvas = document.getElementById('plinko-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#0d1a2e';
  ctx.fillRect(0, 0, w, h);
  const rows = 10, cols = rows + 1;
  const startX = w / 2, startY = 20;
  const spacingY = (h - 60) / rows;
  const pegs = [];
  for (let r = 0; r < rows; r++) {
    const numPegs = r + 2;
    const rowWidth = (numPegs - 1) * 24;
    for (let c = 0; c < numPegs; c++) {
      const x = startX - rowWidth / 2 + c * 24;
      const y = startY + r * spacingY;
      pegs.push({ x, y });
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fill();
    }
  }
  // Draw slots
  const slotColors = { low: ['#10b981','#3b82f6','#6b7280','#374151','#1f2937','#374151','#6b7280','#3b82f6','#10b981'],
    medium: ['#ef4444','#f59e0b','#6b7280','#374151','#1f2937','#374151','#6b7280','#f59e0b','#ef4444'],
    high: ['#ef4444','#dc2626','#6b7280','#1f2937','#111827','#1f2937','#6b7280','#dc2626','#ef4444'] };
  const multipliers = { low: [5.6,2.1,1.1,1.0,0.5,1.0,1.1,2.1,5.6], medium: [13,3,1.3,0.7,0.4,0.7,1.3,3,13], high: [29,4,1.5,0.3,0.2,0.3,1.5,4,29] };
  const slotW = w / 9;
  (slotColors[plinkoRisk] || slotColors.medium).forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(i * slotW + 2, h - 28, slotW - 4, 22, 4);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 8px Inter,sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText((multipliers[plinkoRisk] || multipliers.medium)[i] + 'x', i * slotW + slotW / 2, h - 12);
  });
}

window.setPlinkoRisk = function(risk, btn) {
  plinkoRisk = risk;
  document.querySelectorAll('.plinko-risk-btn').forEach(b => b.className = b.className.replace(/ active[\w]*/g,'') + '');
  document.querySelectorAll('.plinko-risk-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active', risk);
  drawPlinkoBoard();
};

window.dropPlinko = async function() {
  if (!casinoUser) { showGameToast('Please login first', 'error'); return; }
  const amount = getBetAmount('plinko-bet-input');
  if (amount > casinoBalance) { showGameToast('Insufficient balance', 'error'); return; }
  const btn = document.getElementById('plinko-drop-btn');
  btn.disabled = true;
  try {
    const res = await fetch(CASINO_API + '/plinko', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: casinoUser.id, amount, risk: plinkoRisk })
    });
    const data = await res.json();
    if (data.error) { showGameToast(data.error, 'error'); btn.disabled = false; return; }
    updateBalance(data.newBalance);
    animatePlinkoBall(data.path, data.slot, () => {
      if (data.winAmount > 0) showResultOverlay(true, data.winAmount);
      addBetHistory('Plinko', amount, data.multiplier + 'x', data.winAmount);
      btn.disabled = false;
    });
  } catch(e) { showGameToast('Error', 'error'); btn.disabled = false; }
};

function animatePlinkoBall(path, slot, cb) {
  const canvas = document.getElementById('plinko-canvas');
  if (!canvas) { cb(); return; }
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const rows = 10;
  const spacingY = (h - 60) / rows;
  const startX = w / 2, startY = 20;
  let ballX = startX, ballY = startY;
  let step = 0;
  function tick() {
    drawPlinkoBoard();
    ctx.beginPath();
    ctx.arc(ballX, ballY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#f59e0b';
    if (step < path.length) {
      const numPegs = step + 2;
      const rowWidth = (numPegs - 1) * 24;
      const targetX = startX - rowWidth / 2 + (step < path.length ? (path.slice(0, step + 1).filter(d => d === 1).length) : slot) * 24;
      const targetY = startY + (step + 1) * spacingY;
      ballX += (targetX - ballX) * 0.3;
      ballY += (targetY - ballY) * 0.3;
      if (Math.abs(ballY - targetY) < 2) step++;
      requestAnimationFrame(tick);
    } else {
      const slotX = (slot + 0.5) * (w / 9);
      ballX += (slotX - ballX) * 0.3;
      ballY += (h - 20 - ballY) * 0.3;
      if (Math.abs(ballY - (h - 20)) > 2) requestAnimationFrame(tick);
      else { drawPlinkoBoard(); cb(); }
    }
  }
  requestAnimationFrame(tick);
}

// ══════════════════════════════════════════════════════════
// 🔢 KENO GAME
// ══════════════════════════════════════════════════════════
let kenoPicks = new Set();

function initKeno() {
  renderKenoGrid();
}

function renderKenoGrid(drawn = [], hits = []) {
  const grid = document.getElementById('keno-grid');
  if (!grid) return;
  grid.innerHTML = Array.from({ length: 40 }, (_, i) => {
    const n = i + 1;
    const isSelected = kenoPicks.has(n);
    const isDrawn = drawn.includes(n);
    const isHit = hits.includes(n);
    let cls = 'keno-cell';
    if (isHit) cls += ' hit';
    else if (isDrawn) cls += ' drawn';
    else if (isSelected) cls += ' selected';
    return `<div class="${cls}" onclick="kenoToggle(${n}, this)">${n}</div>`;
  }).join('');
}

window.kenoToggle = function(n, el) {
  if (kenoPicks.has(n)) { kenoPicks.delete(n); el.classList.remove('selected'); }
  else if (kenoPicks.size < 10) { kenoPicks.add(n); el.classList.add('selected'); }
  else { showGameToast('Max 10 picks', 'error'); }
  document.getElementById('keno-picks-count').textContent = kenoPicks.size + ' selected';
};

window.kenoQuickPick = function() {
  kenoPicks.clear();
  const nums = Array.from({ length: 40 }, (_, i) => i + 1);
  for (let i = nums.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [nums[i], nums[j]] = [nums[j], nums[i]]; }
  nums.slice(0, 5).forEach(n => kenoPicks.add(n));
  renderKenoGrid();
  document.getElementById('keno-picks-count').textContent = kenoPicks.size + ' selected';
};

window.placeKeno = async function() {
  if (!casinoUser) { showGameToast('Please login first', 'error'); return; }
  if (kenoPicks.size === 0) { showGameToast('Pick at least 1 number', 'error'); return; }
  const amount = getBetAmount('keno-bet-input');
  if (amount > casinoBalance) { showGameToast('Insufficient balance', 'error'); return; }
  const btn = document.getElementById('keno-play-btn');
  btn.disabled = true;
  try {
    const res = await fetch(CASINO_API + '/keno', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: casinoUser.id, amount, picks: Array.from(kenoPicks) })
    });
    const data = await res.json();
    if (data.error) { showGameToast(data.error, 'error'); btn.disabled = false; return; }
    updateBalance(data.newBalance);
    const hits = Array.from(kenoPicks).filter(n => data.drawn.includes(n));
    renderKenoGrid(data.drawn, hits);
    document.getElementById('keno-hits').textContent = `${data.hits} hits`;
    document.getElementById('keno-win').textContent = data.winAmount > 0 ? '+₹' + data.winAmount : '₹0';
    if (data.winAmount > 0) showResultOverlay(true, data.winAmount);
    addBetHistory('Keno', amount, data.hits + ' hits ' + data.multiplier+'x', data.winAmount);
    btn.disabled = false;
  } catch(e) { showGameToast('Error', 'error'); btn.disabled = false; }
};

// ══════════════════════════════════════════════════════════
// 🎁 BONUS WHEEL
// ══════════════════════════════════════════════════════════
const BONUS_PRIZES = ['₹10','₹25','₹50','₹100','₹5','Try Again','₹200','₹500'];
let bonusSpinBusy = false;
let bonusWheelCanvas = null, bonusWheelCtx = null;
let bonusWheelAngle = 0;

function initBonusWheel() {
  bonusWheelCanvas = document.getElementById('bonus-wheel-canvas');
  if (!bonusWheelCanvas) return;
  bonusWheelCtx = bonusWheelCanvas.getContext('2d');
  drawBonusWheel(0);
  checkBonusSpin();
}

function drawBonusWheel(angle) {
  if (!bonusWheelCtx) return;
  const cx = bonusWheelCanvas.width / 2, cy = bonusWheelCanvas.height / 2;
  const r = cx - 4;
  const n = BONUS_PRIZES.length;
  const segAngle = (Math.PI * 2) / n;
  const colors = ['#7c3aed','#db2777','#1d4ed8','#065f46','#b45309','#374151','#7f1d1d','#1e3a5f'];
  bonusWheelCtx.clearRect(0, 0, bonusWheelCanvas.width, bonusWheelCanvas.height);
  BONUS_PRIZES.forEach((prize, i) => {
    const start = angle + i * segAngle - Math.PI / 2;
    const end = start + segAngle;
    bonusWheelCtx.beginPath();
    bonusWheelCtx.moveTo(cx, cy);
    bonusWheelCtx.arc(cx, cy, r, start, end);
    bonusWheelCtx.closePath();
    bonusWheelCtx.fillStyle = colors[i % colors.length];
    bonusWheelCtx.fill();
    bonusWheelCtx.strokeStyle = 'rgba(255,255,255,0.15)';
    bonusWheelCtx.lineWidth = 1;
    bonusWheelCtx.stroke();
    bonusWheelCtx.save();
    bonusWheelCtx.translate(cx, cy);
    bonusWheelCtx.rotate(start + segAngle / 2);
    bonusWheelCtx.fillStyle = '#fff';
    bonusWheelCtx.font = 'bold 10px Inter,sans-serif';
    bonusWheelCtx.textAlign = 'right';
    bonusWheelCtx.fillText(prize, r - 8, 4);
    bonusWheelCtx.restore();
  });
  bonusWheelCtx.beginPath();
  bonusWheelCtx.arc(cx, cy, 16, 0, Math.PI * 2);
  bonusWheelCtx.fillStyle = '#0d0d1a';
  bonusWheelCtx.fill();
  bonusWheelCtx.strokeStyle = 'rgba(255,255,255,0.2)';
  bonusWheelCtx.stroke();
}

async function checkBonusSpin() {
  if (!casinoUser) return;
  try {
    const res = await fetch(`${CASINO_API}/bonus-spin/${casinoUser.id}`);
    const data = await res.json();
    const btn = document.getElementById('bonus-spin-btn');
    if (!data.canSpin && btn) {
      btn.disabled = true;
      btn.textContent = 'Come back tomorrow!';
    }
  } catch(e) {}
}

window.claimBonusSpin = async function() {
  if (!casinoUser || bonusSpinBusy) return;
  bonusSpinBusy = true;
  const btn = document.getElementById('bonus-spin-btn');
  btn.disabled = true;
  try {
    const res = await fetch(`${CASINO_API}/bonus-spin/${casinoUser.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
    const data = await res.json();
    if (data.error) { showGameToast(data.error, 'error'); bonusSpinBusy = false; return; }
    const n = BONUS_PRIZES.length;
    const segAngle = (Math.PI * 2) / n;
    const targetIdx = data.prizeIndex % n;
    const targetAngle = -(targetIdx * segAngle + segAngle / 2);
    const totalSpins = Math.PI * 2 * 6 + targetAngle - bonusWheelAngle;
    const duration = 5000;
    const start = performance.now();
    const startAngle = bonusWheelAngle;
    function animate(now) {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 4);
      bonusWheelAngle = startAngle + totalSpins * ease;
      drawBonusWheel(bonusWheelAngle);
      if (t < 1) { requestAnimationFrame(animate); }
      else {
        bonusWheelAngle = startAngle + totalSpins;
        drawBonusWheel(bonusWheelAngle);
        updateBalance(data.newBalance);
        const prizeEl = document.getElementById('bonus-result-prize');
        if (prizeEl) prizeEl.textContent = data.prize + (data.amount > 0 ? ' Added!' : '');
        if (data.amount > 0) showResultOverlay(true, data.amount);
        bonusSpinBusy = false;
        btn.textContent = 'Come back tomorrow!';
      }
    }
    requestAnimationFrame(animate);
  } catch(e) { showGameToast('Error', 'error'); bonusSpinBusy = false; btn.disabled = false; }
};

// ══════════════════════════════════════════════════════════
// GAMES HUB NAVIGATION
// ══════════════════════════════════════════════════════════
function showGamePage(gameId) {
  const hub = document.getElementById('game-hub');
  if (hub) hub.style.display = 'none';
  document.querySelectorAll('.casino-page').forEach(p => p.style.display = 'none');
  const page = document.getElementById('game-' + gameId);
  if (page) page.style.display = 'flex';
  // Init game-specific logic
  const inits = { plane: initPlaneCrash, mines: initMines, spin: initSpin, dice: initDice, tower: initTower, plinko: initPlinko, keno: initKeno, bonus: initBonusWheel };
  if (inits[gameId]) inits[gameId]();
}

function showGamesHub() {
  const hub = document.getElementById('game-hub');
  if (hub) hub.style.display = 'block';
  document.querySelectorAll('.casino-page').forEach(p => p.style.display = 'none');
}

window.openCasinoGame = function(gameId) {
  showGamePage(gameId);
};

window.backToGamesHub = function() {
  showGamesHub();
};

// ── Auto-init when DOM ready ──────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await initCasino();
  // Read ?game= param from URL
  const urlParams = new URLSearchParams(window.location.search);
  const gameId = urlParams.get('game');
  if (gameId && gameId !== 'hub') {
    showGamePage(gameId);
  } else {
    showGamesHub();
  }
});
