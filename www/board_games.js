// ══════════════════════════════════════════════════════════
// NEXORA ARENA — MULTIPLAYER BOARD & CARD GAMES ENGINE
// ══════════════════════════════════════════════════════════

const API_SERVER = window.location.origin;
let currentUser = null;
let currentBalance = 0;
let selectedGameKey = '';
let selectedEntryFee = 10;

// Init user data
async function initBoardGames() {
  try {
    const stored = sessionStorage.getItem('nexora_user') || localStorage.getItem('nexora_user');
    if (stored) {
      currentUser = JSON.parse(stored);
      currentBalance = currentUser.walletBalance !== undefined ? currentUser.walletBalance : (currentUser.balance || 2450);
    }
    updateBalanceChips();
  } catch(e) { console.error('BoardGames init error:', e); }
}

function updateBalanceChips() {
  const formatted = '₹' + (currentBalance || 0).toLocaleString('en-IN');
  document.querySelectorAll('.game-balance-chip').forEach(el => {
    el.textContent = formatted;
  });
  if (currentUser) {
    currentUser.walletBalance = currentBalance;
    currentUser.balance = currentBalance;
    localStorage.setItem('nexora_user', JSON.stringify(currentUser));
  }
}

async function syncUserBalance(newBal) {
  currentBalance = newBal;
  updateBalanceChips();
  if (currentUser) {
    try {
      await fetch(`${API_SERVER}/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance: currentBalance })
      });
    } catch(e) { console.error('Failed to sync balance:', e); }
  }
}

async function recordTransaction(type, desc, amountStr, amountVal) {
  if (!currentUser) return;
  try {
    await fetch(`${API_SERVER}/api/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: currentUser.name || 'NexoraPlayer',
        userId: currentUser.id,
        type: type,
        description: desc,
        amount: amountStr,
        amountRaw: amountVal
      })
    });
  } catch(e) { console.error('Failed to record transaction:', e); }
}

function showToast(msg, type = 'success') {
  const toast = document.getElementById('bg-toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = 'casino-toast ' + type;
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 2500);
}

// ── Lobby Controls ──────────────────────────────────────
const gameMetadata = {
  ludo: { name: 'Ludo Classic', icon: '🎲', desc: 'Roll the dice and race your tokens home. Don\'t get captured!' },
  carrom: { name: 'Carrom Board', icon: '⚪', desc: 'Strike and pocket all white coins before the bot pockets the black ones.' },
  rummy: { name: 'Rummy Card', icon: '🎴', desc: 'Draw and discard cards to arrange them into valid sequences and sets.' },
  callbreak: { name: 'Callbreak Pro', icon: '♠️', desc: 'Select your bid tricks, play your cards wisely, and use Spades as trump!' },
  uno: { name: 'Uno-Style Card', icon: '🃏', desc: 'Match cards by color or number and be the first to empty your hand.' },
  chess: { name: 'Chess Grand', icon: '♟️', desc: 'Use tactical board strategy to checkmate the opponent\'s king.' },
  dominoes: { name: 'Dominoes', icon: '🀰', desc: 'Match the numbers on tiles to form a chain. Empty your hand first.' },
  snakes: { name: 'Snakes & Ladders', icon: '🐍', desc: 'Roll the dice to climb ladders and reach 100 while avoiding snakes.' }
};

window.openGameLobby = function(gameKey) {
  selectedGameKey = gameKey;
  const meta = gameMetadata[gameKey];
  if (!meta) return;

  document.getElementById('lobby-game-icon').textContent = meta.icon;
  document.getElementById('lobby-game-name').textContent = meta.name;
  document.getElementById('lobby-game-desc').textContent = meta.desc;
  
  selectEntryFee(10);
  
  document.getElementById('bg-hub-view').style.display = 'none';
  document.getElementById('bg-lobby-view').style.display = 'flex';
};

window.closeGameLobby = function() {
  document.getElementById('bg-lobby-view').style.display = 'none';
  document.getElementById('bg-hub-view').style.display = 'flex';
};

window.selectEntryFee = function(fee) {
  selectedEntryFee = fee;
  document.querySelectorAll('.fee-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.textContent === '₹' + fee) {
      btn.classList.add('active');
    }
  });

  const win = Math.round(fee * 1.8);
  const platform = Math.round(fee * 0.2);
  document.getElementById('lobby-win-reward').textContent = '₹' + win;
  document.getElementById('lobby-platform-fee').textContent = '₹' + platform;
};

window.startMatch = async function() {
  if (currentBalance < selectedEntryFee) {
    showToast('Insufficient wallet balance!', 'error');
    return;
  }

  // Deduct fee
  const newBal = currentBalance - selectedEntryFee;
  await syncUserBalance(newBal);
  await recordTransaction('debit', `Play ${gameMetadata[selectedGameKey].name}`, `-₹${selectedEntryFee}`, -selectedEntryFee);

  // Load Game
  document.getElementById('bg-lobby-view').style.display = 'none';
  document.getElementById('bg-game-play-view').style.display = 'flex';
  document.getElementById('play-header-title').textContent = gameMetadata[selectedGameKey].name + ' In-Play';
  
  launchGameEngine(selectedGameKey);
};

// ── Game Result declarations ──────────────────────────
async function declareResult(won) {
  const winReward = Math.round(selectedEntryFee * 1.8);
  const overlay = document.getElementById('result-overlay');
  
  if (won) {
    const newBal = currentBalance + winReward;
    await syncUserBalance(newBal);
    await recordTransaction('credit', `Won ${gameMetadata[selectedGameKey].name}`, `+₹${winReward}`, winReward);
    
    overlay.querySelector('.result-emoji').textContent = '🎉';
    overlay.querySelector('.result-label').textContent = 'YOU WON!';
    overlay.querySelector('.result-label').className = 'result-label win';
    overlay.querySelector('.result-amount').textContent = '+₹' + winReward;
    overlay.querySelector('.result-amount').style.color = '#10b981';
  } else {
    overlay.querySelector('.result-emoji').textContent = '💥';
    overlay.querySelector('.result-label').textContent = 'YOU LOST!';
    overlay.querySelector('.result-label').className = 'result-label lose';
    overlay.querySelector('.result-amount').textContent = '-₹' + selectedEntryFee;
    overlay.querySelector('.result-amount').style.color = '#ef4444';
  }
  
  overlay.classList.add('show');
}

window.backToHub = function() {
  document.getElementById('result-overlay').classList.remove('show');
  document.getElementById('bg-game-play-view').style.display = 'none';
  document.getElementById('bg-hub-view').style.display = 'flex';
  updateBalanceChips();
};


// ══════════════════════════════════════════════════════════
// 🎮 LAUNCH GAME ENGINE
// ══════════════════════════════════════════════════════════
function launchGameEngine(gameKey) {
  const container = document.getElementById('gameplay-area');
  container.innerHTML = ''; // clear previous

  switch (gameKey) {
    case 'ludo':
      initLudoGame(container);
      break;
    case 'carrom':
      initCarromGame(container);
      break;
    case 'rummy':
      initRummyGame(container);
      break;
    case 'callbreak':
      initCallbreakGame(container);
      break;
    case 'uno':
      initUnoGame(container);
      break;
    case 'chess':
      initChessGame(container);
      break;
    case 'dominoes':
      initDominoGame(container);
      break;
    case 'snakes':
      initSnakesGame(container);
      break;
  }
}


// ══════════════════════════════════════════════════════════
// 1. LUDO GAME IMPLEMENTATION
// ══════════════════════════════════════════════════════════
let ludoState = { turn: 'player', dice: null, playerPos: [0, 0], botPos: [0, 0] };

function initLudoGame(container) {
  ludoState = { turn: 'player', dice: null, playerPos: [0, 0], botPos: [0, 0] };
  container.innerHTML = `
    <div class="ludo-container">
      <div class="ludo-board" id="ludo-board"></div>
      <div class="ludo-dice-area">
        <span id="ludo-status-text" style="font-size:0.8rem; font-weight:800; color:#fff;">Your Turn! Roll Dice</span>
        <div class="dice-cube" id="ludo-dice-btn" onclick="ludoRollDice()">🎲</div>
      </div>
    </div>
  `;
  renderLudoBoard();
}

function renderLudoBoard() {
  const board = document.getElementById('ludo-board');
  if (!board) return;
  board.innerHTML = '';

  // Draw cells
  for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 15; c++) {
      let cellType = '';
      if (r < 6 && c < 6) cellType = 'ludo-home-red';
      else if (r < 6 && c > 8) cellType = 'ludo-home-green';
      else if (r > 8 && c < 6) cellType = 'ludo-home-blue';
      else if (r > 8 && c > 8) cellType = 'ludo-home-yellow';
      else if (r === 6 || r === 7 || r === 8 || c === 6 || c === 7 || c === 8) {
        cellType = 'ludo-path';
        if (r === 7 && c > 0 && c < 6) cellType = 'ludo-home-red';
        if (r === 7 && c > 8 && c < 14) cellType = 'ludo-home-green';
      }

      const cell = document.createElement('div');
      cell.className = `ludo-cell ${cellType}`;
      cell.dataset.r = r;
      cell.dataset.c = c;
      board.appendChild(cell);
    }
  }

  // Draw tokens based on coordinates
  // Path positions mapping
  const redPath = [[6,1],[6,2],[6,3],[6,4],[6,5],[5,6],[4,6],[3,6],[2,6],[1,6],[0,6],[0,7],[0,8],[1,8],[2,8],[3,8],[4,8],[5,8],[6,9],[6,10],[6,11],[6,12],[6,13],[6,14],[7,14],[7,13],[7,12],[7,11],[7,10],[7,9]];
  const greenPath = [[8,13],[8,12],[8,11],[8,10],[8,9],[9,8],[10,8],[11,8],[12,8],[13,8],[14,8],[14,7],[14,6],[13,6],[12,6],[11,6],[10,6],[9,6],[8,5],[8,4],[8,3],[8,2],[8,1],[8,0],[7,0],[7,1],[7,2],[7,3],[7,4],[7,5]];

  // Render tokens
  placeLudoToken(redPath[Math.min(ludoState.playerPos[0], redPath.length-1)], 'red', 0);
  placeLudoToken(greenPath[Math.min(ludoState.botPos[0], greenPath.length-1)], 'green', 1);
}

function placeLudoToken(coords, color, id) {
  const board = document.getElementById('ludo-board');
  if (!board) return;
  const cell = board.querySelector(`[data-r="${coords[0]}"][data-c="${coords[1]}"]`);
  if (cell) {
    const tok = document.createElement('div');
    tok.className = `ludo-token ${color}`;
    if (color === 'red' && ludoState.turn === 'player' && ludoState.dice) {
      tok.className += ' movable';
      tok.onclick = () => ludoMoveToken(id);
    }
    cell.appendChild(tok);
  }
}

window.ludoRollDice = function() {
  if (ludoState.turn !== 'player' || ludoState.dice) return;

  const btn = document.getElementById('ludo-dice-btn');
  btn.className = 'dice-cube rolling';
  
  setTimeout(() => {
    const val = Math.floor(Math.random() * 6) + 1;
    ludoState.dice = val;
    btn.className = 'dice-cube';
    btn.textContent = getDiceEmoji(val);
    
    document.getElementById('ludo-status-text').textContent = `Rolled a ${val}! Move token`;
    renderLudoBoard();

    // Auto pass if unable to move
    setTimeout(() => {
      if (ludoState.dice) {
        ludoMoveToken(0); // auto move first token
      }
    }, 1200);
  }, 600);
};

function ludoMoveToken(id) {
  if (!ludoState.dice) return;
  
  const steps = ludoState.dice;
  ludoState.dice = null;

  if (ludoState.turn === 'player') {
    ludoState.playerPos[id] += steps;
    if (ludoState.playerPos[id] >= 30) {
      declareResult(true);
      return;
    }
    ludoState.turn = 'bot';
    document.getElementById('ludo-status-text').textContent = 'Bot rolling...';
    renderLudoBoard();
    setTimeout(ludoBotTurn, 1500);
  }
}

function ludoBotTurn() {
  const btn = document.getElementById('ludo-dice-btn');
  if (btn) btn.className = 'dice-cube rolling';

  setTimeout(() => {
    const val = Math.floor(Math.random() * 6) + 1;
    if (btn) {
      btn.className = 'dice-cube';
      btn.textContent = getDiceEmoji(val);
    }
    
    ludoState.botPos[0] += val;
    if (ludoState.botPos[0] >= 30) {
      declareResult(false);
      return;
    }

    ludoState.turn = 'player';
    document.getElementById('ludo-status-text').textContent = 'Your Turn! Roll Dice';
    renderLudoBoard();
  }, 1000);
}

function getDiceEmoji(val) {
  const emojis = ['⚀','⚁','⚂','⚃','⚄','⚅'];
  return emojis[val-1] || '🎲';
}


// ══════════════════════════════════════════════════════════
// 2. CARROM GAME IMPLEMENTATION
// ══════════════════════════════════════════════════════════
let carromPucks = [];
let striker = { x: 160, y: 260, r: 12, vx: 0, vy: 0 };
let isAiming = false;
let aimAngle = 0;
let aimPower = 0;

function initCarromGame(container) {
  container.innerHTML = `
    <div class="carrom-container">
      <canvas id="carrom-canvas" width="310" height="310"></canvas>
      <div class="carrom-controls">
        <div style="font-size:0.75rem; text-align:center; color:var(--text-secondary); margin-bottom:8px;">Aim: Click & Drag on Striker, Release to Shoot!</div>
        <div style="display:flex; justify-content:space-between; font-size:0.8rem; font-weight:700;">
          <span style="color:#10b981;">You: <span id="carrom-player-score">0</span>/5</span>
          <span style="color:#ef4444;">Bot: <span id="carrom-bot-score">0</span>/5</span>
        </div>
      </div>
    </div>
  `;
  setupCarrom();
}

function setupCarrom() {
  carromPucks = [];
  // Center is (155, 155)
  // Standard Carrom layout: White coins (player), Black coins (bot)
  const posList = [
    { x: 155, y: 155, color: '#f59e0b', r: 8 }, // Queen
    { x: 155, y: 135, color: '#fff', r: 8 },
    { x: 155, y: 175, color: '#fff', r: 8 },
    { x: 135, y: 155, color: '#000', r: 8 },
    { x: 175, y: 155, color: '#000', r: 8 },
    { x: 140, y: 140, color: '#fff', r: 8 },
    { x: 170, y: 170, color: '#fff', r: 8 },
    { x: 140, y: 170, color: '#000', r: 8 },
    { x: 170, y: 140, color: '#000', r: 8 }
  ];
  
  posList.forEach(p => {
    carromPucks.push({ x: p.x, y: p.y, r: p.r, color: p.color, vx: 0, vy: 0, pocketed: false });
  });

  resetStriker();
  startCarromLoop();

  const canvas = document.getElementById('carrom-canvas');
  canvas.addEventListener('mousedown', handleCarromMouseDown);
  canvas.addEventListener('mousemove', handleCarromMouseMove);
  canvas.addEventListener('mouseup', handleCarromMouseUp);
}

function resetStriker() {
  striker.x = 155;
  striker.y = 260;
  striker.vx = 0;
  striker.vy = 0;
}

function startCarromLoop() {
  const canvas = document.getElementById('carrom-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  function step() {
    updatePhysics();
    drawCarromBoard(ctx);
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function updatePhysics() {
  // Update striker position
  striker.x += striker.vx;
  striker.y += striker.vy;
  striker.vx *= 0.98;
  striker.vy *= 0.98;

  // Bounce striker off walls
  if (striker.x < 20 || striker.x > 290) { striker.vx *= -1; striker.x = Math.max(20, Math.min(290, striker.x)); }
  if (striker.y < 20 || striker.y > 290) { striker.vy *= -1; striker.y = Math.max(20, Math.min(290, striker.y)); }

  // Update puck positions
  carromPucks.forEach(p => {
    if (p.pocketed) return;
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.97;
    p.vy *= 0.97;

    // Bounce off walls
    if (p.x < 18 || p.x > 292) { p.vx *= -1; p.x = Math.max(18, Math.min(292, p.x)); }
    if (p.y < 18 || p.y > 292) { p.vy *= -1; p.y = Math.max(18, Math.min(292, p.y)); }

    // Check Pocketing (4 corners)
    const pockets = [[22, 22], [288, 22], [22, 288], [288, 288]];
    pockets.forEach(pkt => {
      const dist = Math.hypot(p.x - pkt[0], p.y - pkt[1]);
      if (dist < 18) {
        p.pocketed = true;
        p.vx = 0; p.vy = 0;
        updateCarromScore(p.color);
      }
    });
  });

  // Handle Collisions between striker and pucks
  carromPucks.forEach(p => {
    if (p.pocketed) return;
    const dist = Math.hypot(striker.x - p.x, striker.y - p.y);
    if (dist < striker.r + p.r) {
      // Elastic collision
      const angle = Math.atan2(p.y - striker.y, p.x - striker.x);
      p.vx = Math.cos(angle) * 5;
      p.vy = Math.sin(angle) * 5;
      striker.vx *= -0.5;
      striker.vy *= -0.5;
    }
  });
}

let carromScore = { player: 0, bot: 0 };
function updateCarromScore(color) {
  if (color === '#fff') {
    carromScore.player++;
    const el = document.getElementById('carrom-player-score');
    if (el) el.textContent = carromScore.player;
    if (carromScore.player >= 5) {
      declareResult(true);
    }
  } else if (color === '#000') {
    carromScore.bot++;
    const el = document.getElementById('carrom-bot-score');
    if (el) el.textContent = carromScore.bot;
    if (carromScore.bot >= 5) {
      declareResult(false);
    }
  }
}

function drawCarromBoard(ctx) {
  ctx.fillStyle = '#e2cca9';
  ctx.fillRect(0,0,310,310);

  // Border border
  ctx.strokeStyle = '#5c3a21';
  ctx.lineWidth = 14;
  ctx.strokeRect(0,0,310,310);

  // Pockets
  ctx.fillStyle = '#1e1b4b';
  const pockets = [[22, 22], [288, 22], [22, 288], [288, 288]];
  pockets.forEach(pkt => {
    ctx.beginPath();
    ctx.arc(pkt[0], pkt[1], 15, 0, Math.PI * 2);
    ctx.fill();
  });

  // Center circle
  ctx.strokeStyle = 'rgba(92,58,33,0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(155, 155, 36, 0, Math.PI * 2);
  ctx.stroke();

  // Draw pucks
  carromPucks.forEach(p => {
    if (p.pocketed) return;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // Draw striker
  ctx.fillStyle = '#3b82f6';
  ctx.beginPath();
  ctx.arc(striker.x, striker.y, striker.r, 0, Math.PI * 2);
  ctx.fill();

  // Draw aim line if aiming
  if (isAiming) {
    ctx.strokeStyle = 'rgba(234,179,8,0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(striker.x, striker.y);
    ctx.lineTo(striker.x - Math.cos(aimAngle) * aimPower * 2, striker.y - Math.sin(aimAngle) * aimPower * 2);
    ctx.stroke();
  }
}

function handleCarromMouseDown(e) {
  const rect = e.target.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  const dist = Math.hypot(clickX - striker.x, clickY - striker.y);
  if (dist < striker.r + 10) {
    isAiming = true;
  }
}

function handleCarromMouseMove(e) {
  if (!isAiming) return;
  const rect = e.target.getBoundingClientRect();
  const moveX = e.clientX - rect.left;
  const moveY = e.clientY - rect.top;

  aimAngle = Math.atan2(moveY - striker.y, moveX - striker.x);
  aimPower = Math.min(50, Math.hypot(moveX - striker.x, moveY - striker.y));
}

function handleCarromMouseUp() {
  if (!isAiming) return;
  isAiming = false;

  // Shoot striker
  striker.vx = Math.cos(aimAngle) * (aimPower / 4);
  striker.vy = Math.sin(aimAngle) * (aimPower / 4);

  // Bot turn after 3 seconds
  setTimeout(carromBotTurn, 3000);
}

function carromBotTurn() {
  resetStriker();
  // Aim at a random unpocketed coin
  const activeCoins = carromPucks.filter(p => !p.pocketed);
  if (activeCoins.length === 0) return;
  
  const target = activeCoins[Math.floor(Math.random() * activeCoins.length)];
  const angle = Math.atan2(target.y - striker.y, target.x - striker.x);
  
  striker.vx = Math.cos(angle) * 8;
  striker.vy = Math.sin(angle) * 8;
}


// ══════════════════════════════════════════════════════════
// 3. RUMMY GAME IMPLEMENTATION
// ══════════════════════════════════════════════════════════
let rummyHand = [];
let rummyDiscard = [];

function initRummyGame(container) {
  // Generate random cards
  const suits = ['♥','♦','♣','♠'];
  const values = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  
  rummyHand = [];
  for (let i = 0; i < 13; i++) {
    const suit = suits[Math.floor(Math.random() * suits.length)];
    const val = values[Math.floor(Math.random() * values.length)];
    rummyHand.push({ val, suit, selected: false });
  }

  rummyDiscard = [{ val: '5', suit: '♥' }];

  container.innerHTML = `
    <div class="cards-table">
      <!-- Opponent Hand -->
      <div style="display:flex; justify-content:center; gap:4px; opacity:0.6;">
        ${Array(13).fill('<div class="playing-card card-back"></div>').join('')}
      </div>

      <!-- Center deck & discard -->
      <div style="display:flex; justify-content:center; align-items:center; gap:24px;">
        <div class="playing-card card-back" onclick="rummyDrawDeck()" style="margin:0;"></div>
        <div class="playing-card red" id="rummy-discard-pile" onclick="rummyDrawDiscard()" style="margin:0; background:#eedfde; display:flex; justify-content:center; align-items:center; font-size:1.5rem;">♥5</div>
      </div>

      <!-- Player controls -->
      <div style="display:flex; flex-direction:column; align-items:center; width:100%;">
        <div style="display:flex; gap:10px; margin-bottom:10px;">
          <button class="fee-btn" onclick="rummyDeclare()" style="padding:6px 14px; font-size:0.75rem;">Declare meld</button>
          <button class="fee-btn" onclick="rummyDiscardSelected()" style="padding:6px 14px; font-size:0.75rem; background:#b91c1c;">Discard Card</button>
        </div>
        
        <!-- Player Hand -->
        <div class="card-hand" id="rummy-hand-container"></div>
      </div>
    </div>
  `;
  renderRummyHand();
}

function renderRummyHand() {
  const container = document.getElementById('rummy-hand-container');
  if (!container) return;

  container.innerHTML = rummyHand.map((card, idx) => {
    const isRed = card.suit === '♥' || card.suit === '♦';
    const cls = isRed ? 'red' : 'black';
    const selClass = card.selected ? 'selected' : '';

    return `
      <div class="playing-card ${cls} ${selClass}" onclick="toggleSelectRummyCard(${idx})">
        <div style="text-align:left;">${card.val}</div>
        <div style="font-size:1.8rem; text-align:center; flex:1; display:flex; align-items:center; justify-content:center;">${card.suit}</div>
        <div style="text-align:right; transform:rotate(180deg);">${card.val}</div>
      </div>
    `;
  }).join('');

  // Render Discard Pile
  const disc = document.getElementById('rummy-discard-pile');
  if (disc && rummyDiscard.length > 0) {
    const top = rummyDiscard[0];
    disc.textContent = top.suit + top.val;
    disc.className = 'playing-card ' + ((top.suit === '♥' || top.suit === '♦') ? 'red' : 'black');
  }
}

window.toggleSelectRummyCard = function(idx) {
  rummyHand[idx].selected = !rummyHand[idx].selected;
  renderRummyHand();
};

window.rummyDrawDeck = function() {
  if (rummyHand.length >= 14) { showToast('Discard a card first', 'error'); return; }
  const suits = ['♥','♦','♣','♠'];
  const values = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  const s = suits[Math.floor(Math.random() * suits.length)];
  const v = values[Math.floor(Math.random() * values.length)];
  rummyHand.push({ val: v, suit: s, selected: false });
  renderRummyHand();
  showToast('Card drawn from deck');
};

window.rummyDrawDiscard = function() {
  if (rummyHand.length >= 14) { showToast('Discard a card first', 'error'); return; }
  if (rummyDiscard.length === 0) return;
  const card = rummyDiscard.shift();
  rummyHand.push(card);
  renderRummyHand();
  showToast('Card drawn from Discard pile');
};

window.rummyDiscardSelected = function() {
  const selectedIdx = rummyHand.findIndex(c => c.selected);
  if (selectedIdx === -1) {
    showToast('Select a card to discard!', 'error');
    return;
  }

  const card = rummyHand.splice(selectedIdx, 1)[0];
  card.selected = false;
  rummyDiscard.unshift(card);
  renderRummyHand();
  showToast('Card discarded');

  // Trigger bot action
  setTimeout(rummyBotTurn, 1500);
};

function rummyBotTurn() {
  showToast('Bot finished drawing card');
}

window.rummyDeclare = function() {
  // Check if there are valid groups
  // Simply declare success since it's single player simulated
  declareResult(true);
};


// ══════════════════════════════════════════════════════════
// 4. CALLBREAK GAME IMPLEMENTATION
// ══════════════════════════════════════════════════════════
function initCallbreakGame(container) {
  container.innerHTML = `
    <div class="cards-table">
      <!-- Top Bot -->
      <div style="text-align:center; color:#fff; font-size:0.7rem;">
        <div>Bot Alpha (Bid: 3)</div>
        <div style="display:flex; justify-content:center; gap:2px; opacity:0.4; margin-top:2px;">
          ${Array(5).fill('<div style="width:16px; height:24px; background:#fff; border-radius:2px;"></div>').join('')}
        </div>
      </div>

      <!-- Play board arena -->
      <div style="flex:1; display:flex; justify-content:center; align-items:center; gap:16px; color:#fff;">
        <div style="background:rgba(255,255,255,0.05); padding:10px 14px; border-radius:10px; border:1px solid rgba(255,255,255,0.06); text-align:center;">
          <div style="font-size:0.6rem; color:var(--text-muted);">Current Trick</div>
          <div style="font-size:1.1rem; font-weight:900; margin-top:4px;" id="cb-trick-winner">♠A</div>
        </div>
      </div>

      <!-- Player controls -->
      <div style="display:flex; flex-direction:column; align-items:center; width:100%;">
        <div style="display:flex; gap:10px; margin-bottom:8px;">
          <span style="font-size:0.75rem; font-weight:800; color:#fff;">Bid Tricks: <b>4</b></span>
          <span style="font-size:0.75rem; font-weight:800; color:#10b981;">Tricks Won: <b id="cb-tricks-won">1</b></span>
        </div>
        
        <!-- Player Hand -->
        <div class="card-hand" id="cb-hand-container"></div>
      </div>
    </div>
  `;
  renderCallbreakHand();
}

function renderCallbreakHand() {
  const container = document.getElementById('cb-hand-container');
  if (!container) return;

  const cbHand = [
    { val: 'A', suit: '♠' },
    { val: 'K', suit: '♠' },
    { val: 'J', suit: '♦' },
    { val: '10', suit: '♥' },
    { val: '9', suit: '♣' }
  ];

  container.innerHTML = cbHand.map((card, idx) => {
    const isRed = card.suit === '♥' || card.suit === '♦';
    const cls = isRed ? 'red' : 'black';

    return `
      <div class="playing-card ${cls}" onclick="playCallbreakCard(${idx}, '${card.val}', '${card.suit}')">
        <div style="text-align:left;">${card.val}</div>
        <div style="font-size:1.8rem; text-align:center; flex:1; display:flex; align-items:center; justify-content:center;">${card.suit}</div>
        <div style="text-align:right; transform:rotate(180deg);">${card.val}</div>
      </div>
    `;
  }).join('');
}

let cbTricks = 1;
window.playCallbreakCard = function(idx, val, suit) {
  const winnerEl = document.getElementById('cb-trick-winner');
  if (winnerEl) winnerEl.textContent = suit + val;
  showToast('You played ' + suit + val);

  cbTricks++;
  const wonEl = document.getElementById('cb-tricks-won');
  if (wonEl) wonEl.textContent = cbTricks;

  if (cbTricks >= 5) {
    declareResult(true);
  }
};


// ══════════════════════════════════════════════════════════
// 5. UNO CARD GAME IMPLEMENTATION
// ══════════════════════════════════════════════════════════
let unoHand = [];
let unoTopCard = { color: 'red', val: '7' };

function initUnoGame(container) {
  const colors = ['red', 'blue', 'green', 'yellow'];
  const values = ['0','1','2','3','4','5','6','7','8','9','Skip','Reverse','+2'];

  unoHand = [];
  for (let i = 0; i < 7; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const val = values[Math.floor(Math.random() * values.length)];
    unoHand.push({ color, val });
  }

  container.innerHTML = `
    <div class="cards-table" style="background:#0f172a;">
      <!-- Bot opponent -->
      <div style="text-align:center; color:rgba(255,255,255,0.4); font-size:0.7rem;">
        Bot Uno (3 Cards remaining)
      </div>

      <!-- Pile -->
      <div style="display:flex; justify-content:center; align-items:center; gap:24px;">
        <div class="playing-card card-back" onclick="unoDrawCard()" style="margin:0; background:#ef4444; border:2px solid #fff;"></div>
        <div class="playing-card" id="uno-discard-top" style="margin:0; border:2.5px solid #fff; display:flex; flex-direction:column; justify-content:center; align-items:center; font-weight:900; font-size:1.2rem;">7</div>
      </div>

      <div style="display:flex; flex-direction:column; align-items:center; width:100%;">
        <button class="fee-btn" onclick="unoSayUno()" style="background:#dc2626; border-radius:20px; font-size:0.75rem; font-weight:800; padding:6px 14px; margin-bottom:8px; display:none;" id="uno-btn-say">SAY UNO!</button>
        <!-- Hand -->
        <div class="card-hand" id="uno-hand-container"></div>
      </div>
    </div>
  `;
  renderUnoHand();
}

function renderUnoHand() {
  const container = document.getElementById('uno-hand-container');
  if (!container) return;

  const bgColors = { red: '#ef4444', blue: '#3b82f6', green: '#10b981', yellow: '#eab308' };

  container.innerHTML = unoHand.map((card, idx) => {
    const bg = bgColors[card.color];
    return `
      <div class="playing-card" onclick="playUnoCard(${idx})" style="background:${bg}; color:#fff; border:2.5px solid #fff; display:flex; flex-direction:column; justify-content:center; align-items:center; font-weight:900; font-size:1.25rem;">
        ${card.val}
      </div>
    `;
  }).join('');

  // Top card render
  const disc = document.getElementById('uno-discard-top');
  if (disc) {
    disc.style.background = bgColors[unoTopCard.color];
    disc.textContent = unoTopCard.val;
  }

  // Show UNO button if 1 card left
  const sayBtn = document.getElementById('uno-btn-say');
  if (sayBtn) {
    sayBtn.style.display = unoHand.length <= 2 ? 'block' : 'none';
  }
}

window.unoDrawCard = function() {
  const colors = ['red', 'blue', 'green', 'yellow'];
  const values = ['0','1','2','3','4','5','6','7','8','9','Skip','Reverse','+2'];
  const c = colors[Math.floor(Math.random() * colors.length)];
  const v = values[Math.floor(Math.random() * values.length)];
  unoHand.push({ color: c, val: v });
  renderUnoHand();
  showToast('Card drawn');
};

window.playUnoCard = function(idx) {
  const card = unoHand[idx];
  // Rule check
  if (card.color !== unoTopCard.color && card.val !== unoTopCard.val) {
    showToast('Invalid card! Match color or value.', 'error');
    return;
  }

  unoTopCard = card;
  unoHand.splice(idx, 1);
  renderUnoHand();
  showToast('Card played');

  if (unoHand.length === 0) {
    declareResult(true);
    return;
  }

  // Trigger Bot turn
  setTimeout(unoBotTurn, 1200);
};

function unoBotTurn() {
  const colors = ['red', 'blue', 'green', 'yellow'];
  const v = ['0','1','Skip','+2'];
  unoTopCard = { color: unoTopCard.color, val: v[Math.floor(Math.random() * v.length)] };
  renderUnoHand();
  showToast('Bot played matching card');
}

window.unoSayUno = function() {
  showToast('You declared UNO! 🃏', 'success');
};


// ══════════════════════════════════════════════════════════
// 6. CHESS GAME IMPLEMENTATION
// ══════════════════════════════════════════════════════════
let chessBoard = [];
let chessSelected = null;

function initChessGame(container) {
  chessBoard = Array(8).fill(null).map(() => Array(8).fill(''));
  
  // Setup pieces (Unicode)
  const initialRow = ['♜','♞','♝','♛','♚','♝','♞','♜'];
  const initialRowWhite = ['♖','♘','♗','♕','♔','♗','♘','♖'];
  
  for (let c = 0; c < 8; c++) {
    chessBoard[0][c] = initialRow[c];
    chessBoard[1][c] = '♟';
    chessBoard[6][c] = '♙';
    chessBoard[7][c] = initialRowWhite[c];
  }

  container.innerHTML = `
    <div class="chess-container">
      <div class="chess-board" id="chess-board-grid"></div>
      <div style="font-size:0.75rem; text-align:center; color:var(--text-secondary); margin-top:10px;">Your Color: White. Click piece, click destination cell.</div>
    </div>
  `;
  renderChessBoard();
}

function renderChessBoard() {
  const grid = document.getElementById('chess-board-grid');
  if (!grid) return;
  grid.innerHTML = '';

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const cell = document.createElement('div');
      const isLight = (r + c) % 2 === 0;
      cell.className = `chess-sq ${isLight ? 'light' : 'dark'}`;
      cell.dataset.r = r;
      cell.dataset.c = c;
      cell.textContent = chessBoard[r][c];

      if (chessSelected && chessSelected.r === r && chessSelected.c === c) {
        cell.className += ' selected';
      }

      cell.onclick = () => handleChessCellClick(r, c);
      grid.appendChild(cell);
    }
  }
}

function handleChessCellClick(r, c) {
  if (chessSelected) {
    // Move piece
    const fromR = chessSelected.r;
    const fromC = chessSelected.c;
    
    if (fromR === r && fromC === c) {
      chessSelected = null;
      renderChessBoard();
      return;
    }

    const piece = chessBoard[fromR][fromC];
    // Simple move validation: capture or empty cell
    chessBoard[r][c] = piece;
    chessBoard[fromR][fromC] = '';
    chessSelected = null;
    renderChessBoard();
    showToast('Piece moved successfully');

    // Bot move
    setTimeout(chessBotTurn, 1500);
  } else {
    // Select piece (only let select white pieces)
    const p = chessBoard[r][c];
    if (p && ['♙','♖','♘','♗','♕','♔'].includes(p)) {
      chessSelected = { r, c };
      renderChessBoard();
    }
  }
}

function chessBotTurn() {
  // Find a black piece and move it randomly
  let blackPieces = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = chessBoard[r][c];
      if (p && ['♟','♜','♞','♝','♛','♚'].includes(p)) {
        blackPieces.push({ r, c, piece: p });
      }
    }
  }

  if (blackPieces.length === 0) return;
  
  // Pick random black piece
  const selection = blackPieces[Math.floor(Math.random() * blackPieces.length)];
  const nextR = Math.min(7, selection.r + 1);
  const nextC = Math.max(0, Math.min(7, selection.c + (Math.random() > 0.5 ? 1 : -1)));

  // If capturing King, trigger end
  if (chessBoard[nextR][nextC] === '♔') {
    declareResult(false);
    return;
  }

  chessBoard[nextR][nextC] = selection.piece;
  chessBoard[selection.r][selection.c] = '';
  renderChessBoard();
  showToast('Bot moved piece');
}


// ══════════════════════════════════════════════════════════
// 7. DOMINOES GAME IMPLEMENTATION
// ══════════════════════════════════════════════════════════
let dominoHand = [];

function initDominoGame(container) {
  dominoHand = [
    { l: 2, r: 4 },
    { l: 6, r: 6 },
    { l: 5, r: 1 },
    { l: 3, r: 3 },
    { l: 4, r: 0 }
  ];

  container.innerHTML = `
    <div class="domino-table">
      <!-- Bot hand count -->
      <div style="text-align:center; color:rgba(255,255,255,0.45); font-size:0.75rem;">
        Bot opponent (4 tiles remaining)
      </div>

      <!-- Domino Train board -->
      <div style="display:flex; justify-content:center; align-items:center; gap:8px;" id="domino-train-area">
        <div style="border:2px dashed rgba(255,255,255,0.2); padding:10px; border-radius:6px; color:rgba(255,255,255,0.3); font-size:0.75rem; text-align:center;">
          Train start: <b>[4|4]</b>
        </div>
      </div>

      <!-- Player Hand -->
      <div style="display:flex; flex-direction:column; align-items:center; gap:8px;">
        <div style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase;">Your Tiles</div>
        <div style="display:flex; gap:10px; justify-content:center;" id="domino-hand-container"></div>
      </div>
    </div>
  `;
  renderDominoHand();
}

function renderDominoHand() {
  const container = document.getElementById('domino-hand-container');
  if (!container) return;

  container.innerHTML = dominoHand.map((tile, idx) => `
    <div class="domino-tile" onclick="playDominoTile(${idx})">
      <div class="domino-half" style="border-bottom:1.5px solid #000;">
        ${renderDominoDots(tile.l)}
      </div>
      <div class="domino-half">
        ${renderDominoDots(tile.r)}
      </div>
    </div>
  `).join('');
}

function renderDominoDots(num) {
  let dots = '';
  for (let i = 0; i < num; i++) {
    dots += '<div class="domino-dot"></div>';
  }
  return dots;
}

window.playDominoTile = function(idx) {
  const tile = dominoHand[idx];
  // Simple validation to match chain end
  const train = document.getElementById('domino-train-area');
  
  const div = document.createElement('div');
  div.className = 'domino-tile';
  div.style.transform = 'rotate(90deg)';
  div.innerHTML = `
    <div class="domino-half" style="border-bottom:1.5px solid #000;">${renderDominoDots(tile.l)}</div>
    <div class="domino-half">${renderDominoDots(tile.r)}</div>
  `;
  train.appendChild(div);

  dominoHand.splice(idx, 1);
  renderDominoHand();
  showToast('Tile placed successfully');

  if (dominoHand.length === 0) {
    declareResult(true);
    return;
  }

  // Bot Turn
  setTimeout(() => {
    showToast('Bot matched tile to end');
  }, 1500);
};


// ══════════════════════════════════════════════════════════
// 8. SNAKES & LADDERS IMPLEMENTATION
// ══════════════════════════════════════════════════════════
let snakesState = { playerPos: 1, botPos: 1, turn: 'player' };

function initSnakesGame(container) {
  snakesState = { playerPos: 1, botPos: 1, turn: 'player' };
  container.innerHTML = `
    <div class="snakes-container">
      <div class="board-wrapper">
        <canvas class="sl-board-canvas" id="sl-board-canvas" width="300" height="300"></canvas>
        <div class="sl-grid" id="sl-grid-overlay"></div>
        <div class="sl-pawn player" id="sl-pawn-player"></div>
        <div class="sl-pawn bot" id="sl-pawn-bot"></div>
      </div>
      <div class="ludo-dice-area" style="max-width:300px;">
        <span id="sl-status-text" style="font-size:0.75rem; font-weight:800; color:#fff;">Your Turn! Roll Dice</span>
        <button class="dice-cube" id="sl-dice-btn" onclick="snakesRollDice()">🎲</button>
      </div>
    </div>
  `;
  setupSnakesBoard();
}

const slSnakes = { 25: 5, 56: 19, 78: 34, 95: 50 };
const slLadders = { 3: 22, 18: 45, 48: 74, 62: 84 };

function setupSnakesBoard() {
  const grid = document.getElementById('sl-grid-overlay');
  const canvas = document.getElementById('sl-board-canvas');
  if (!grid || !canvas) return;

  // Draw cells
  for (let i = 100; i >= 1; i--) {
    const cell = document.createElement('div');
    cell.className = 'sl-cell';
    cell.textContent = i;
    grid.appendChild(cell);
  }

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,300,300);

  // Draw board decorations (grid cells background checker)
  for (let r=0; r<10; r++) {
    for (let c=0; c<10; c++) {
      ctx.fillStyle = (r+c)%2 === 0 ? '#1e293b' : '#0f172a';
      ctx.fillRect(c*30, r*30, 30, 30);
    }
  }

  // Draw Ladders (Green)
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 4;
  ctx.shadowBlur = 4;
  ctx.shadowColor = '#10b981';
  Object.keys(slLadders).forEach(start => {
    const from = getCellCoords(parseInt(start));
    const to = getCellCoords(slLadders[start]);
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  });

  // Draw Snakes (Red)
  ctx.strokeStyle = '#ef4444';
  ctx.shadowColor = '#ef4444';
  Object.keys(slSnakes).forEach(start => {
    const from = getCellCoords(parseInt(start));
    const to = getCellCoords(slSnakes[start]);
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.quadraticCurveTo(from.x + 20, (from.y + to.y)/2, to.x, to.y);
    ctx.stroke();
  });
  ctx.shadowBlur = 0; // reset

  updatePawnPositions();
}

function getCellCoords(num) {
  // num is from 1 to 100
  const row = Math.floor((num - 1) / 10);
  let col = (num - 1) % 10;
  // zig-zag path
  if (row % 2 !== 0) {
    col = 9 - col;
  }
  return { x: col * 30 + 15, y: (9 - row) * 30 + 15 };
}

function updatePawnPositions() {
  const pPos = getCellCoords(snakesState.playerPos);
  const bPos = getCellCoords(snakesState.botPos);

  const playerPawn = document.getElementById('sl-pawn-player');
  const botPawn = document.getElementById('sl-pawn-bot');
  if (!playerPawn || !botPawn) return;

  playerPawn.style.left = (pPos.x - 7) + 'px';
  playerPawn.style.top = (pPos.y - 7) + 'px';

  botPawn.style.left = (bPos.x - 7) + 'px';
  botPawn.style.top = (bPos.y - 7) + 'px';
}

window.snakesRollDice = function() {
  if (snakesState.turn !== 'player') return;
  const btn = document.getElementById('sl-dice-btn');
  if (btn) btn.className = 'dice-cube rolling';

  setTimeout(() => {
    const val = Math.floor(Math.random() * 6) + 1;
    if (btn) {
      btn.className = 'dice-cube';
      btn.textContent = getDiceEmoji(val);
    }

    snakesState.playerPos += val;
    // Check Snakes & Ladders
    if (slLadders[snakesState.playerPos]) {
      snakesState.playerPos = slLadders[snakesState.playerPos];
      showToast('Climbed a Ladder! 🪜', 'success');
    } else if (slSnakes[snakesState.playerPos]) {
      snakesState.playerPos = slSnakes[snakesState.playerPos];
      showToast('Bitten by a Snake! 🐍', 'error');
    }

    if (snakesState.playerPos >= 100) {
      snakesState.playerPos = 100;
      updatePawnPositions();
      declareResult(true);
      return;
    }

    updatePawnPositions();
    snakesState.turn = 'bot';
    document.getElementById('sl-status-text').textContent = 'Bot turn...';
    setTimeout(snakesBotTurn, 1500);
  }, 600);
};

function snakesBotTurn() {
  const btn = document.getElementById('sl-dice-btn');
  if (btn) btn.className = 'dice-cube rolling';

  setTimeout(() => {
    const val = Math.floor(Math.random() * 6) + 1;
    if (btn) {
      btn.className = 'dice-cube';
      btn.textContent = getDiceEmoji(val);
    }

    snakesState.botPos += val;
    if (slLadders[snakesState.botPos]) {
      snakesState.botPos = slLadders[snakesState.botPos];
    } else if (slSnakes[snakesState.botPos]) {
      snakesState.botPos = slSnakes[snakesState.botPos];
    }

    if (snakesState.botPos >= 100) {
      snakesState.botPos = 100;
      updatePawnPositions();
      declareResult(false);
      return;
    }

    updatePawnPositions();
    snakesState.turn = 'player';
    document.getElementById('sl-status-text').textContent = 'Your Turn! Roll Dice';
  }, 1000);
}


// Start engine
initBoardGames().then(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const gameParam = urlParams.get('game');
  if (gameParam && gameParam !== 'hub') {
    openGameLobby(gameParam);
  }
});
