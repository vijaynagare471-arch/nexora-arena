/* =====================================================
   NEXORA ARENA — Admin Panel JS
   API calls + Real-time state management
   ===================================================== */

'use strict';

const SERVER = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')
  ? window.location.origin
  : 'https://nexora-arena.onrender.com';
const API = SERVER + '/api';
let db = {};
let revenueChart = null;
let tFilter = 'all';
let txFilter = 'all';
let wdFilter = 'all';

// ── Init ─────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
  await loadAllData();
  renderAll();
  initChart();
  connectSSE();
});

async function loadAllData() {
  try {
    const res = await fetch(`${API}/data`);
    db = await res.json();
  } catch {
    showToast('Cannot connect to server. Is it running?', 'error');
  }
}

function connectSSE() {
  console.log('SSE replaced with periodic database polling in Admin.');
  
  async function pollAdminData() {
    try {
      const res = await fetch(`${API}/data`);
      if (!res.ok) return;
      const data = await res.json();
      
      // Sync local db object
      const previousUsers = db.users || [];
      db = { ...db, ...data };
      
      // Handle user registration toast
      if (previousUsers.length > 0 && data.users && data.users.length > previousUsers.length) {
        const newUser = data.users[data.users.length - 1];
        showToast(`New user registered! ${newUser.name} has been added.`, 'success');
      }
      
      // Update UI elements
      renderUsers();
      renderKycList();
      renderDashboard();
      renderTransactions();
      renderWithdrawals();
      updatePendingBadge();
      renderTournaments();
      renderTicketsList();
      updateTicketsBadge();
      
      if (typeof renderEmployeesList === 'function') renderEmployeesList();
      if (typeof renderRolesList === 'function') renderRolesList();
      if (typeof renderEmployeeTasksList === 'function') renderEmployeeTasksList();
      if (typeof renderDepartmentsList === 'function') renderDepartmentsList();
      
      const predPage = document.getElementById('page-predictions');
      if (predPage && predPage.classList.contains('active')) {
        loadAdminPredictions();
      }
      
      if (typeof renderEmployeeSettings === 'function') renderEmployeeSettings();
      
      const predBannersPage = document.getElementById('page-predictions-banners');
      if (predBannersPage && predBannersPage.classList.contains('active')) {
        renderPredictionsBanners();
      }
      
      if (data.qrPaymentRequests) {
        allQrRequests = data.qrPaymentRequests;
        const qrPage = document.getElementById('page-qr-payments');
        if (qrPage && qrPage.classList.contains('active')) {
          renderQrRequests();
          updateQrStats();
        }
        const pendingCount = allQrRequests.filter(r => r.status === 'pending').length;
        const qrBadge = document.getElementById('qr-pending-badge');
        if (qrBadge) {
          qrBadge.textContent = pendingCount;
          qrBadge.style.display = pendingCount ? 'inline' : 'none';
        }
      }
      
      const feedbacksPage = document.getElementById('page-feedbacks');
      if (feedbacksPage && feedbacksPage.classList.contains('active')) {
        renderFeedbacksList(db.feedbacks || []);
      }
      
    } catch (err) {
      console.error("Failed to poll admin live data:", err);
    }
  }
  
  // Initial poll immediately
  pollAdminData();
  
  // Set up periodic interval
  setInterval(pollAdminData, 10000);
}

function renderAll() {
  renderDashboard();
  renderTournaments();
  renderGames();
  renderUsers();
  renderTransactions();
  renderWithdrawals();
  renderCommission();
  renderBankVerifications();
  renderBanners();
  renderPredictionsBanners();
  renderNotices();
  loadSettings();
  if (typeof renderFeedbacksList === 'function') {
    renderFeedbacksList(db.feedbacks || []);
  }
  updatePendingBadge();
}

// ── Page Navigation ───────────────────────────────────
window.showPage = function(page, navEl) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.add('active');
  if (navEl) {
    navEl.classList.add('active');
    const cloned = navEl.cloneNode(true);
    cloned.querySelectorAll('.nav-badge').forEach(b => b.remove());
    cloned.querySelectorAll('svg').forEach(s => s.remove());
    document.getElementById('header-title').textContent = cloned.textContent.trim();
  } else {
    document.getElementById('header-title').textContent = page;
  }

  if (page === 'tickets') {
    loadTickets();
  } else if (page === 'kyc') {
    renderKycList();
  } else if (page === 'support-settings') {
    loadSupportSettings();
  } else if (page === 'employees') {
    loadEmployees();
  } else if (page === 'roles') {
    loadRoles();
  } else if (page === 'activity-logs') {
    loadActivityLogs();
  } else if (page === 'employee-tasks') {
    loadEmployeeTasks();
  } else if (page === 'feedbacks') {
    renderFeedbacksList(db.feedbacks || []);
  } else if (page === 'departments') {
    loadDepartments();
  } else if (page === 'employee-settings') {
    loadEmployeeSettings();
  } else if (page === 'predictions') {
    loadAdminPredictions();
  } else if (page === 'predictions-banners') {
    loadPredictionsBanners();
  } else if (page === 'casino') {
    loadCasinoAdmin();
  } else if (page === 'qr-payments') {
    loadAdminQrPayments();
  }
};

// ── DASHBOARD ─────────────────────────────────────────
function renderDashboard() {
  if (!db.stats) return;
  document.getElementById('stat-users').textContent       = db.stats.totalUsers?.toLocaleString('en-IN') || '–';
  document.getElementById('stat-tournaments').textContent = db.stats.totalTournaments || '–';
  document.getElementById('stat-revenue').textContent     = '₹' + (db.stats.totalRevenue || 0).toLocaleString('en-IN');
  document.getElementById('stat-withdrawals').textContent = '₹' + (db.stats.totalWithdrawals || 0).toLocaleString('en-IN');

  // Top games
  const topGames = [...(db.games || [])].filter(g => g.active).slice(0, 5);
  const maxRev = 925000;
  const revenues = [925000, 435000, 375000, 235000, 186000];
  document.getElementById('top-games-list').innerHTML = topGames.map((g, i) => `
    <div class="top-game-row">
      <div class="top-game-rank">${i + 1}</div>
      <div class="top-game-emoji">${g.emoji}</div>
      <div class="top-game-name">${g.name}</div>
      <div class="top-game-bar-wrap">
        <div class="top-game-bar" style="width:${Math.round((revenues[i] || 50000) / maxRev * 100)}%"></div>
      </div>
      <div class="top-game-rev">₹${((revenues[i] || 50000) / 100).toLocaleString('en-IN')}</div>
    </div>
  `).join('');

  // Recent tournaments
  const recent = [...(db.tournaments || [])].slice(0, 5);
  document.getElementById('recent-tournaments-list').innerHTML = recent.map(t => `
    <div class="recent-t">
      <div class="recent-t-emoji">${getGameEmoji(t.game)}</div>
      <div class="recent-t-info">
        <div class="recent-t-name">${t.name}</div>
        <div class="recent-t-sub">${t.game} · ${t.date || ''}</div>
      </div>
      <div class="recent-t-right">
        <span class="badge ${t.status}">${t.status.toUpperCase()}</span>
        <div class="recent-t-slots" style="margin-top:3px">${t.filled}/${t.slots} Slots</div>
      </div>
    </div>
  `).join('') || '<div class="empty-state"><p>No tournaments</p></div>';
}

function initChart() {
  const ctx = document.getElementById('revenueChart');
  if (!ctx || !db.revenueChart) return;
  if (revenueChart) revenueChart.destroy();
  revenueChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: db.revenueChart.labels,
      datasets: [{
        label: 'Revenue (₹)',
        data: db.revenueChart.data,
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168,85,247,0.12)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#a855f7',
        pointRadius: 4,
        pointHoverRadius: 6,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#6b7280', font: { size: 11 } } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#6b7280', font: { size: 11 }, callback: v => '₹' + (v/1000).toFixed(0) + 'k' } }
      }
    }
  });
}

window.setChartPeriod = function(period, btn) {
  document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
};

// ── TOURNAMENTS ───────────────────────────────────────
function renderTournaments(filter = tFilter) {
  const tbody = document.getElementById('tournament-tbody');
  if (!tbody) return;
  let list = db.tournaments || [];
  if (filter !== 'all') list = list.filter(t => t.status === filter);
  tbody.innerHTML = list.map((t, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><b>${t.name}</b></td>
      <td>${getGameEmoji(t.game)} ${t.game}</td>
      <td>${t.mode} · ${t.type}</td>
      <td>₹${t.fee}</td>
      <td style="color:var(--warning);font-weight:700">₹${t.prize.toLocaleString('en-IN')}</td>
      <td>${t.slots}</td>
      <td>${t.registered || t.filled}</td>
      <td><span class="badge ${t.status}">${t.status.toUpperCase()}</span></td>
      <td>
        <div class="actions-row">
          <button class="btn btn-ghost btn-icon btn-sm" title="Edit" onclick="editTournament('${t.id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn btn-ghost btn-icon btn-sm" title="View Joined Users" onclick="viewTournamentUsers('${t.id}')">
            👥
          </button>
          <button class="btn btn-warning btn-icon btn-sm" title="Announce Winners" onclick="openAnnounceWinners('${t.id}')">
            🏆
          </button>
          <button class="btn btn-success btn-icon btn-sm" title="Set Live" onclick="setTStatus('${t.id}','live')">▶</button>
          <button class="btn btn-danger btn-icon btn-sm" title="Delete" onclick="deleteTournament('${t.id}','${t.name}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="10" style="text-align:center;color:var(--text-muted);padding:30px">No tournaments found</td></tr>';
}

window.filterT = function(f, btn) {
  tFilter = f;
  document.querySelectorAll('#t-filter-tabs .ftab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTournaments(f);
};

window.searchT = function(q) {
  const list = (db.tournaments || []).filter(t =>
    t.name.toLowerCase().includes(q.toLowerCase()) || t.game.toLowerCase().includes(q.toLowerCase())
  );
  const tbody = document.getElementById('tournament-tbody');
  tbody.innerHTML = list.map((t, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><b>${t.name}</b></td>
      <td>${getGameEmoji(t.game)} ${t.game}</td>
      <td>${t.mode} · ${t.type}</td>
      <td>₹${t.fee}</td>
      <td style="color:var(--warning);font-weight:700">₹${t.prize.toLocaleString('en-IN')}</td>
      <td>${t.slots}</td>
      <td>${t.registered || t.filled}</td>
      <td><span class="badge ${t.status}">${t.status.toUpperCase()}</span></td>
      <td>
        <div class="actions-row">
          <button class="btn btn-ghost btn-icon btn-sm" title="Edit" onclick="editTournament('${t.id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn btn-ghost btn-icon btn-sm" title="View Joined Users" onclick="viewTournamentUsers('${t.id}')">
            👥
          </button>
          <button class="btn btn-warning btn-icon btn-sm" title="Announce Winners" onclick="openAnnounceWinners('${t.id}')">
            🏆
          </button>
          <button class="btn btn-success btn-icon btn-sm" title="Set Live" onclick="setTStatus('${t.id}','live')">▶</button>
          <button class="btn btn-danger btn-icon btn-sm" title="Delete" onclick="deleteTournament('${t.id}','${t.name}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="10" style="text-align:center;padding:20px;color:var(--text-muted)">No results</td></tr>';
};

window.viewTournamentUsers = function(id) {
  const t = (db.tournaments || []).find(x => x.id === id);
  if (!t) return;

  document.getElementById('modal-t-users-title').textContent = `${t.name} Participants`;
  const tbody = document.getElementById('modal-t-users-tbody');
  if (tbody) {
    const list = t.joinedUsers || [];
    tbody.innerHTML = list.map(ju => `
      <tr>
        <td><code>${ju.userId}</code></td>
        <td><b>${ju.username}</b></td>
        <td style="color:var(--accent-bright); font-weight:800;">${ju.gameUsername}</td>
        <td><small>${new Date(ju.joinedAt).toLocaleString('en-IN')}</small></td>
      </tr>
    `).join('') || '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:20px">No users joined yet.</td></tr>';
  }

  openModal('modal-tournament-users');
};

window.openAnnounceWinners = function(id) {
  const t = (db.tournaments || []).find(x => x.id === id);
  if (!t) return;

  document.getElementById('aw-tournament-id').value = id;

  const joined = t.joinedUsers || [];
  
  const populateSelect = (elId) => {
    const el = document.getElementById(elId);
    if (el) {
      el.innerHTML = '<option value="">Select Winner</option>' + joined.map(ju => `
        <option value="${ju.userId}">${ju.gameUsername} (${ju.username})</option>
      `).join('');
    }
  };

  populateSelect('aw-winner-1');
  populateSelect('aw-winner-2');
  populateSelect('aw-winner-3');

  document.getElementById('aw-prize-1').value = '';
  document.getElementById('aw-prize-2').value = '';
  document.getElementById('aw-prize-3').value = '';

  openModal('modal-announce-winners');
};

window.submitAnnounceWinners = async function() {
  const tId = document.getElementById('aw-tournament-id').value;
  const t = (db.tournaments || []).find(x => x.id === tId);
  if (!t) return;

  const w1 = document.getElementById('aw-winner-1').value;
  const w2 = document.getElementById('aw-winner-2').value;
  const w3 = document.getElementById('aw-winner-3').value;

  if (!w1) {
    showToast('First place winner is required!', 'error');
    return;
  }

  const getJoinedUserGameName = (userId) => {
    const ju = (t.joinedUsers || []).find(x => x.userId === userId);
    return ju ? ju.gameUsername : 'Player';
  };

  const winnersBody = {
    winners: {
      first: w1 ? {
        userId: w1,
        gameUsername: getJoinedUserGameName(w1),
        prize: parseInt(document.getElementById('aw-prize-1').value) || 0
      } : null,
      second: w2 ? {
        userId: w2,
        gameUsername: getJoinedUserGameName(w2),
        prize: parseInt(document.getElementById('aw-prize-2').value) || 0
      } : null,
      third: w3 ? {
        userId: w3,
        gameUsername: getJoinedUserGameName(w3),
        prize: parseInt(document.getElementById('aw-prize-3').value) || 0
      } : null
    }
  };

  try {
    const res = await fetch(`${API}/tournaments/${tId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(winnersBody)
    });

    if (res.ok) {
      const data = await res.json();
      db.tournaments = db.tournaments.map(x => x.id === tId ? data.tournament : x);
      renderTournaments();
      renderDashboard();
      closeModal('modal-announce-winners');
      showToast('Winners announced and credited successfully! 🏆', 'success');
    } else {
      showToast('Failed to announce winners', 'error');
    }
  } catch(e) {
    console.error(e);
    showToast('Error announcing winners', 'error');
  }
};

window.openCreateTournament = function() {
  document.getElementById('t-id').value    = '';
  document.getElementById('t-name').value  = '';
  document.getElementById('t-fee').value   = '';
  document.getElementById('t-prize').value = '';
  document.getElementById('t-prize-dist').value = '';
  document.getElementById('t-slots').value = '';
  document.getElementById('t-map').value   = '';
  document.getElementById('t-desc').value  = '';
  document.getElementById('t-room-id').value = '';
  document.getElementById('t-room-pass').value = '';
  document.getElementById('t-banner-file').value = '';
  document.getElementById('t-banner-base64').value = '';
  document.getElementById('modal-t-title').textContent = 'Create Tournament';
  // Populate game dropdown
  const sel = document.getElementById('t-game');
  sel.innerHTML = '<option value="">Select Game</option>' + (db.games || []).map(g => `<option value="${g.name}">${g.emoji} ${g.name}</option>`).join('');
  document.getElementById('modal-tournament').classList.add('show');
};

window.editTournament = function(id) {
  const t = (db.tournaments || []).find(x => x.id === id);
  if (!t) return;
  document.getElementById('t-id').value     = t.id;
  document.getElementById('t-name').value   = t.name;
  document.getElementById('t-fee').value    = t.fee;
  document.getElementById('t-prize').value  = t.prize;
  document.getElementById('t-prize-dist').value = t.prizeDistribution || '';
  document.getElementById('t-slots').value  = t.slots;
  document.getElementById('t-map').value    = t.map;
  document.getElementById('t-desc').value   = t.description || '';
  document.getElementById('t-mode').value   = t.mode;
  document.getElementById('t-type').value   = t.type;
  document.getElementById('t-status').value = t.status;
  document.getElementById('t-date').value   = t.date;
  document.getElementById('t-time').value   = t.time;
  document.getElementById('t-room-id').value = t.roomId || '';
  document.getElementById('t-room-pass').value = t.roomPassword || '';
  document.getElementById('t-banner-file').value = '';
  document.getElementById('t-banner-base64').value = t.image || '';
  const sel = document.getElementById('t-game');
  sel.innerHTML = (db.games || []).map(g => `<option value="${g.name}" ${g.name === t.game ? 'selected' : ''}>${g.emoji} ${g.name}</option>`).join('');
  document.getElementById('modal-t-title').textContent = 'Edit Tournament';
  document.getElementById('modal-tournament').classList.add('show');
};

window.saveTournament = async function() {
  const id   = document.getElementById('t-id').value;
  const body = {
    game:     document.getElementById('t-game').value,
    name:     document.getElementById('t-name').value.trim(),
    fee:      parseInt(document.getElementById('t-fee').value),
    prize:    parseInt(document.getElementById('t-prize').value),
    prizeDistribution: document.getElementById('t-prize-dist').value,
    slots:    parseInt(document.getElementById('t-slots').value),
    mode:     document.getElementById('t-mode').value,
    type:     document.getElementById('t-type').value,
    status:   document.getElementById('t-status').value,
    map:      document.getElementById('t-map').value,
    date:     document.getElementById('t-date').value,
    time:     document.getElementById('t-time').value,
    roomId:   document.getElementById('t-room-id').value.trim(),
    roomPassword: document.getElementById('t-room-pass').value.trim(),
    description: document.getElementById('t-desc').value,
    image:    document.getElementById('t-banner-base64').value
  };
  if (!body.name || !body.game) { showToast('Name and Game are required', 'error'); return; }
  try {
    let res;
    if (id) {
      res = await fetch(`${API}/tournaments/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    } else {
      res = await fetch(`${API}/tournaments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    }
    const t = await res.json();
    if (id) { db.tournaments = db.tournaments.map(x => x.id === id ? t : x); }
    else { db.tournaments.unshift(t); }
    renderTournaments();
    renderDashboard();
    closeModal('modal-tournament');
    showToast(id ? 'Tournament updated!' : 'Tournament created!', 'success');
  } catch { showToast('Error saving tournament', 'error'); }
};

window.setTStatus = async function(id, status) {
  try {
    await fetch(`${API}/tournaments/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    db.tournaments = db.tournaments.map(t => t.id === id ? { ...t, status } : t);
    renderTournaments(); showToast(`Status set to ${status}!`, 'success');
  } catch { showToast('Error updating status', 'error'); }
};

window.deleteTournament = function(id, name) {
  document.getElementById('confirm-msg').textContent = `Delete "${name}"? This cannot be undone.`;
  document.getElementById('confirm-action-btn').onclick = async () => {
    await fetch(`${API}/tournaments/${id}`, { method: 'DELETE' });
    db.tournaments = db.tournaments.filter(t => t.id !== id);
    renderTournaments(); renderDashboard();
    closeModal('modal-confirm'); showToast('Tournament deleted', 'success');
  };
  document.getElementById('modal-confirm').classList.add('show');
};

// ── GAMES ─────────────────────────────────────────────
function renderGames() {
  const grid = document.getElementById('games-grid');
  if (!grid) return;
  grid.innerHTML = (db.games || []).map(g => {
    const iconContent = g.image 
      ? `<div style="width:40px; height:40px; border-radius:50%; background-image:url(${g.image}); background-size:cover; background-position:center;"></div>`
      : `<div class="game-emoji">${g.emoji}</div>`;
      
    return `
      <div class="game-admin-card">
        ${iconContent}
        <div class="game-admin-name" style="margin-top:6px">${g.name}</div>
        <div class="game-admin-count">${g.tournaments} Tournaments</div>
        <span class="badge ${g.active ? 'active' : 'inactive'}">${g.active ? 'Active' : 'Inactive'}</span>
        <div style="display:flex;gap:6px;margin-top:8px">
          <button class="btn btn-ghost btn-sm" onclick="editGame('${g.id}')">Edit</button>
          <button class="btn btn-${g.active ? 'ghost' : 'success'} btn-sm" onclick="toggleGame('${g.id}',${!g.active})">${g.active ? 'Disable' : 'Enable'}</button>
          <button class="btn btn-danger btn-sm" onclick="deleteGame('${g.id}','${g.name}')">Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

window.openAddGame = function() {
  document.getElementById('g-id').value = '';
  document.getElementById('g-name').value = '';
  document.getElementById('g-emoji').value = '🎮';
  document.getElementById('g-image-file').value = '';
  document.getElementById('g-image-base64').value = '';
  document.getElementById('modal-g-title').textContent = 'Add New Game';
  document.getElementById('btn-save-game').textContent = 'Add Game';
  document.getElementById('modal-game').classList.add('show');
};

window.editGame = function(id) {
  const g = db.games.find(x => x.id === id);
  if (!g) return;
  document.getElementById('g-id').value = g.id;
  document.getElementById('g-name').value = g.name || '';
  document.getElementById('g-emoji').value = g.emoji || '🎮';
  document.getElementById('g-image-base64').value = g.image || '';
  document.getElementById('g-image-file').value = '';
  document.getElementById('modal-g-title').textContent = 'Edit Game';
  document.getElementById('btn-save-game').textContent = 'Save Changes';
  document.getElementById('modal-game').classList.add('show');
};

window.saveGame = async function() {
  const id = document.getElementById('g-id').value;
  const name = document.getElementById('g-name').value.trim();
  const emoji = document.getElementById('g-emoji').value || '🎮';
  const image = document.getElementById('g-image-base64').value;
  const active = document.getElementById('g-active').value === 'true';
  if (!name) { showToast('Game name required', 'error'); return; }

  const payload = { name, emoji, image, color: '#1a1a2e,#13131f', active };

  try {
    let res;
    if (id) {
      res = await fetch(`${API}/games/${id}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      });
      const g = await res.json();
      db.games = db.games.map(x => x.id === id ? g : x);
      showToast('Game updated!', 'success');
    } else {
      res = await fetch(`${API}/games`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      });
      const g = await res.json();
      db.games.push(g);
      showToast('Game added!', 'success');
    }
    renderGames();
    closeModal('modal-game');
  } catch(e) {
    showToast('Error saving game', 'error');
  }
};

window.toggleGame = async function(id, active) {
  await fetch(`${API}/games/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active }) });
  db.games = db.games.map(g => g.id === id ? { ...g, active } : g);
  renderGames(); showToast(`Game ${active ? 'enabled' : 'disabled'}`, 'success');
};

window.deleteGame = function(id, name) {
  document.getElementById('confirm-msg').textContent = `Delete game "${name}"?`;
  document.getElementById('confirm-action-btn').onclick = async () => {
    await fetch(`${API}/games/${id}`, { method: 'DELETE' });
    db.games = db.games.filter(g => g.id !== id);
    renderGames(); closeModal('modal-confirm'); showToast('Game deleted', 'success');
  };
  document.getElementById('modal-confirm').classList.add('show');
};

// ── USERS ─────────────────────────────────────────────
function renderUsers(list = db.users || []) {
  const tbody = document.getElementById('users-tbody');
  if (!tbody) return;
  tbody.innerHTML = list.map((u, i) => {
    const bal = u.balance !== undefined ? u.balance : 2450;
    return `
      <tr>
        <td>${i+1}</td>
        <td>
          <div style="display:flex; align-items:center; gap:8px;">
            ${u.avatar 
              ? `<img src="${u.avatar}" style="width:32px; height:32px; border-radius:50%; object-fit:cover; border:1.5px solid rgba(124,58,237,0.3);" />`
              : `<div style="width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:0.78rem;">${(u.name || 'N').charAt(0).toUpperCase()}</div>`
            }
            <div>
              <b style="color:#fff;">${u.name}</b>
              <div style="font-size:0.68rem;color:var(--text-muted)">${u.id}</div>
            </div>
          </div>
        </td>
        <td style="color:var(--text-muted)">${u.email}</td>
        <td style="color:var(--text-muted)">${u.phone}</td>
        <td>${u.tournaments}</td>
        <td style="color:var(--warning);font-weight:700">₹${u.spent.toLocaleString('en-IN')}</td>
        <td style="color:var(--success);font-weight:700">₹${bal.toLocaleString('en-IN')}</td>
        <td><span class="badge ${u.status}">${u.status.toUpperCase()}</span></td>
        <td style="color:var(--text-muted)">${u.joined}</td>
        <td>
          <div class="actions-row">
            <button class="btn btn-ghost btn-icon btn-sm" title="Manage Wallet & Bank" onclick="openManageUser('${u.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </button>
            <button class="btn ${u.status === 'banned' ? 'btn-success' : 'btn-danger'} btn-sm" onclick="toggleBan('${u.id}','${u.status}')">
              ${u.status === 'banned' ? 'Unban' : 'Ban'}
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('') || '<tr><td colspan="10" style="text-align:center;padding:20px;color:var(--text-muted)">No users</td></tr>';
}

window.searchUsers = function(q) {
  const filtered = (db.users || []).filter(u =>
    u.name.toLowerCase().includes(q.toLowerCase()) ||
    u.email.toLowerCase().includes(q.toLowerCase()) ||
    u.id.toLowerCase().includes(q.toLowerCase())
  );
  renderUsers(filtered);
};

window.toggleBan = async function(id, currentStatus) {
  const newStatus = currentStatus === 'banned' ? 'active' : 'banned';
  let banReason = '';
  if (newStatus === 'banned') {
    banReason = prompt('Enter the reason for suspension:', 'ToS Violation / Suspicious Activity');
    if (banReason === null) return; // User cancelled the prompt
    if (banReason.trim() === '') {
      banReason = 'ToS Violation / Suspicious Activity';
    }
  }
  await fetch(`${API}/users/${id}`, { 
    method: 'PUT', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify({ status: newStatus, banReason: banReason }) 
  });
  db.users = db.users.map(u => u.id === id ? { ...u, status: newStatus, banReason: banReason } : u);
  renderUsers(); showToast(`User ${newStatus === 'banned' ? 'banned' : 'unbanned'}`, newStatus === 'banned' ? 'error' : 'success');
};

// ── TRANSACTIONS ──────────────────────────────────────
function renderTransactions(filter = txFilter) {
  const tbody = document.getElementById('tx-tbody');
  if (!tbody) return;
  let list = db.transactions || [];
  if (filter !== 'all') list = list.filter(t => t.type === filter);
  tbody.innerHTML = list.map((tx, i) => `
    <tr>
      <td>${i+1}</td>
      <td style="font-family:monospace;color:var(--accent-bright)">${tx.id}</td>
      <td><b>${tx.user}</b></td>
      <td style="text-transform:capitalize">${tx.type}</td>
      <td style="color:${tx.amount > 0 ? 'var(--success)' : 'var(--danger)'};font-weight:700">
        ${tx.amount > 0 ? '+' : ''}₹${Math.abs(tx.amount).toLocaleString('en-IN')}
      </td>
      <td style="color:var(--text-muted)">${tx.method}</td>
      <td><span class="badge ${tx.status}">${tx.status}</span></td>
      <td style="color:var(--text-muted)">${tx.date}</td>
    </tr>
  `).join('') || '<tr><td colspan="8" style="text-align:center;padding:20px;color:var(--text-muted)">No transactions</td></tr>';
}

window.filterTx = function(f, btn) {
  txFilter = f;
  document.querySelectorAll('#page-wallet .ftab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTransactions(f);
};

// ── WITHDRAWALS ───────────────────────────────────────
function renderWithdrawals(filter = wdFilter) {
  const tbody = document.getElementById('wd-tbody');
  if (!tbody) return;
  let list = db.withdrawals || [];
  if (filter !== 'all') list = list.filter(w => w.status === filter);
  tbody.innerHTML = list.map((w, i) => {
    let detailsHtml = '';
    if (w.method === 'bank' && w.details) {
      detailsHtml = `
        <div style="font-size:0.78rem; line-height:1.3; color:var(--text-secondary)">
          🏦 <b>${w.details.bankName}</b><br>
          A/C: <span style="color:var(--accent-bright); font-family:monospace">${w.details.accountNumber}</span><br>
          IFSC: <span style="font-family:monospace">${w.details.ifsc}</span> | Name: <b>${w.details.accountHolder}</b>
        </div>
      `;
    } else {
      const upiId = w.details?.upi || w.upi || 'N/A';
      detailsHtml = `<span style="font-family:monospace; color:var(--text-secondary)">📱 ${upiId}</span>`;
    }

    return `
      <tr>
        <td>${i+1}</td>
        <td style="font-family:monospace;color:var(--accent-bright)">${w.id}</td>
        <td><b>${w.user}</b></td>
        <td style="color:var(--warning);font-weight:700">₹${w.amount.toLocaleString('en-IN')}</td>
        <td>${detailsHtml}</td>
        <td><span class="badge ${w.status}">${w.status}</span></td>
        <td style="color:var(--text-muted)">${w.date}</td>
        <td>
          <button class="btn btn-ghost btn-icon" onclick="viewWithdrawalDetails('${w.id}')" style="padding:6px; display:inline-flex; align-items:center; justify-content:center; color:var(--text-secondary); cursor:pointer;" title="View Details">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </td>
      </tr>
    `;
  }).join('') || '<tr><td colspan="8" style="text-align:center;padding:20px;color:var(--text-muted)">No withdrawals</td></tr>';
}

window.filterWd = function(f, btn) {
  wdFilter = f;
  document.querySelectorAll('#page-withdrawals .ftab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderWithdrawals(f);
};

window.updateWd = async function(id, status) {
  await fetch(`${API}/withdrawals/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
  db.withdrawals = db.withdrawals.map(w => w.id === id ? { ...w, status } : w);
  renderWithdrawals(); updatePendingBadge();
  showToast(`Withdrawal ${status}!`, status === 'approved' ? 'success' : 'error');
};

function updatePendingBadge() {
  const count = (db.withdrawals || []).filter(w => w.status === 'pending').length;
  const badge = document.getElementById('pending-badge');
  if (badge) { badge.textContent = count; badge.style.display = count ? 'inline' : 'none'; }

  // Fetch pending QR payment requests
  fetch(`${API}/qr-payment/requests`)
    .then(res => res.ok ? res.json() : [])
    .then(reqs => {
      const pendingCount = reqs.filter(r => r.status === 'pending').length;
      const qrBadge = document.getElementById('qr-pending-badge');
      if (qrBadge) {
        qrBadge.textContent = pendingCount;
        qrBadge.style.display = pendingCount ? 'inline' : 'none';
      }
    })
    .catch(e => console.error('Failed to update pending QR badge:', e));
}

// ── COMMISSION ────────────────────────────────────────
function renderCommission() {
  if (!db.settings) return;
  const pct = db.settings.commission || 15;
  document.getElementById('comm-pct').textContent = pct + '%';
  const revenue = db.stats?.totalRevenue || 1875000;
  const commission = Math.round(revenue * pct / 100);
  document.getElementById('comm-revenue').textContent = '₹' + revenue.toLocaleString('en-IN');
  document.getElementById('comm-total').textContent = '₹' + commission.toLocaleString('en-IN');
  document.getElementById('comm-t-count').textContent = db.stats?.totalTournaments || 342;

  const commData = [
    { game: 'BGMI', emoji: '🎯', rev: 925000, pct, t: 95 },
    { game: 'Free Fire MAX', emoji: '🔥', rev: 435000, pct, t: 90 },
    { game: 'Valorant', emoji: '⚔️', rev: 375000, pct, t: 69 },
    { game: 'COD Mobile', emoji: '🪖', rev: 235000, pct, t: 48 },
    { game: 'Clash Royale', emoji: '👑', rev: 186000, pct, t: 57 },
  ];
  const maxRev = 925000;
  const tbody = document.getElementById('commission-tbody');
  if (!tbody) return;
  tbody.innerHTML = commData.map((c, i) => `
    <tr>
      <td>${i+1}</td>
      <td>${c.emoji} <b>${c.game}</b></td>
      <td style="color:var(--warning)">₹${c.rev.toLocaleString('en-IN')}</td>
      <td>${c.pct}%</td>
      <td style="color:var(--success)">₹${Math.round(c.rev * c.pct / 100).toLocaleString('en-IN')}</td>
      <td>${c.t}</td>
      <td style="min-width:120px">
        <div style="height:6px;border-radius:3px;background:var(--bg-elevated)">
          <div class="commission-bar" style="width:${Math.round(c.rev/maxRev*100)}%"></div>
        </div>
      </td>
    </tr>
  `).join('');
}

// ── BANNERS ───────────────────────────────────────────
function renderBanners() {
  const grid = document.getElementById('banners-grid');
  if (!grid) return;
  const colors = ['#1a3a6c,#0d47a1','#4a1a6c,#7b1fa2','#6c1a1a,#c62828','#1a4a1a,#2e7d32','#3a1a0a,#bf360c'];
  grid.innerHTML = (db.banners || []).map((b, i) => {
    const bgStyle = b.image 
      ? `background-image: url(${b.image}); background-size: cover; background-position: center;`
      : `background: linear-gradient(135deg, ${b.color || colors[i % colors.length]});`;
    
    const mediaBadge = b.video 
      ? `<span style="position:absolute; top:6px; right:6px; background:rgba(0,0,0,0.7); color:#eab308; font-size:0.6rem; font-weight:800; padding:2px 6px; border-radius:4px;">🎬 VIDEO</span>`
      : '';
    const btnCount = (b.buttons||[]).length;
    const btnBadge = btnCount > 0 
      ? `<span style="background:var(--accent); color:#fff; font-size:0.6rem; padding:1px 5px; border-radius:3px;">${btnCount} btn${btnCount>1?'s':''}</span>` : '';
    const actionBadge = b.action?.type 
      ? `<span style="background:var(--bg-elevated); color:var(--text-muted); font-size:0.6rem; padding:1px 5px; border-radius:3px; border:1px solid var(--border)">→ ${b.action.type}</span>` : '';

    return `
      <div class="banner-card">
        <div class="banner-preview" style="${bgStyle}; position:relative;">
          ${mediaBadge}
          <div class="b-title" style="text-shadow: 0 2px 4px rgba(0,0,0,0.8)">${b.title}</div>
          <div class="b-sub" style="text-shadow: 0 2px 4px rgba(0,0,0,0.8)">${b.subtitle}</div>
          <div style="font-size:0.65rem; margin-top:4px; opacity:0.8; text-shadow: 0 2px 4px rgba(0,0,0,0.8)">${b.type}</div>
        </div>
        <div class="banner-footer">
          <div class="banner-meta" style="display:flex; flex-wrap:wrap; gap:4px; align-items:center;">
            <span>${b.game}</span>${btnBadge}${actionBadge}
          </div>
          <div class="banner-actions">
            <button class="btn btn-ghost btn-sm" onclick="editBanner('${b.id}')" style="color:var(--accent-bright); font-size:0.65rem; padding:3px 7px;">Edit</button>
            <label class="toggle">
              <input type="checkbox" ${b.active ? 'checked' : ''} onchange="toggleBanner('${b.id}',this.checked)" />
              <span class="toggle-slider"></span>
            </label>
            <button class="btn btn-danger btn-icon btn-sm" onclick="deleteBanner('${b.id}','${b.title}')">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ─── BANNER MEDIA TAB SWITCH ────────────────────────────
window.switchBannerMediaTab = function(tab) {
  document.getElementById('b-media-image').style.display = tab === 'image' ? 'block' : 'none';
  document.getElementById('b-media-video').style.display = tab === 'video' ? 'block' : 'none';
  document.getElementById('bmtab-image').style.background = tab === 'image' ? 'var(--accent)' : '';
  document.getElementById('bmtab-video').style.background = tab === 'video' ? 'var(--accent)' : '';
};

// ─── BANNER ACTION CHANGE ────────────────────────────────
window.onBannerActionChange = function() {
  const v = document.getElementById('b-action-type').value;
  document.getElementById('b-action-page-wrap').style.display       = v === 'page'       ? 'block' : 'none';
  document.getElementById('b-action-tournament-wrap').style.display  = v === 'tournament' ? 'block' : 'none';
  document.getElementById('b-action-external-wrap').style.display   = v === 'external'   ? 'block' : 'none';
};

// ─── BANNER BUTTON MANAGEMENT ────────────────────────────
let bannerButtons = [];

window.addBannerButton = function() {
  const idx = bannerButtons.length;
  bannerButtons.push({ label: 'Join Now', style: 'primary', action: 'page', page: 'tournaments', tournamentId: '', url: '' });
  renderBannerButtonsList();
};

window.removeBannerButton = function(idx) {
  bannerButtons.splice(idx, 1);
  renderBannerButtonsList();
};

function renderBannerButtonsList() {
  const list = document.getElementById('b-buttons-list');
  if (!list) return;
  if (!bannerButtons.length) {
    list.innerHTML = '<div style="font-size:0.75rem; color:var(--text-muted); text-align:center; padding:10px 0;">No buttons added yet. Add up to 2 buttons.</div>';
    return;
  }
  list.innerHTML = bannerButtons.map((btn, idx) => `
    <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:8px; padding:12px; position:relative;">
      <button onclick="removeBannerButton(${idx})" style="position:absolute; top:8px; right:8px; background:none; border:none; color:#ef4444; cursor:pointer; font-size:0.9rem;">✕</button>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:8px;">
        <div>
          <label class="form-label" style="font-size:0.68rem;">Button Label</label>
          <input class="form-control" style="padding:6px;" value="${btn.label}" oninput="bannerButtons[${idx}].label=this.value" placeholder="e.g. Join Now" />
        </div>
        <div>
          <label class="form-label" style="font-size:0.68rem;">Button Style</label>
          <select class="form-control" style="padding:6px;" onchange="bannerButtons[${idx}].style=this.value">
            <option ${btn.style==='primary'?'selected':''}>primary</option>
            <option ${btn.style==='secondary'?'selected':''}>secondary</option>
            <option ${btn.style==='danger'?'selected':''}>danger</option>
            <option ${btn.style==='success'?'selected':''}>success</option>
          </select>
        </div>
      </div>
      <div>
        <label class="form-label" style="font-size:0.68rem;">Button Action</label>
        <select class="form-control" style="padding:6px; margin-bottom:6px;" onchange="bannerButtons[${idx}].action=this.value; renderBannerButtonsList()">
          <option value="page" ${btn.action==='page'?'selected':''}>Go to App Page</option>
          <option value="tournament" ${btn.action==='tournament'?'selected':''}>Open Tournament</option>
          <option value="external" ${btn.action==='external'?'selected':''}>External URL</option>
        </select>
        ${btn.action === 'page' ? `
          <select class="form-control" style="padding:6px;" onchange="bannerButtons[${idx}].page=this.value">
            <option value="tournaments" ${btn.page==='tournaments'?'selected':''}>Tournaments</option>
            <option value="home" ${btn.page==='home'?'selected':''}>Home</option>
            <option value="wallet" ${btn.page==='wallet'?'selected':''}>Wallet</option>
            <option value="predictions" ${btn.page==='predictions'?'selected':''}>Predictions</option>
            <option value="profile" ${btn.page==='profile'?'selected':''}>Profile</option>
          </select>` : ''}
        ${btn.action === 'tournament' ? `
          <select class="form-control" style="padding:6px;" onchange="bannerButtons[${idx}].tournamentId=this.value">
            <option value="">Select tournament...</option>
            ${(db.tournaments||[]).map(t=>`<option value="${t.id}" ${btn.tournamentId===t.id?'selected':''}>${t.name}</option>`).join('')}
          </select>` : ''}
        ${btn.action === 'external' ? `
          <input class="form-control" style="padding:6px;" value="${btn.url||''}" oninput="bannerButtons[${idx}].url=this.value" placeholder="https://..." />` : ''}
      </div>
    </div>
  `).join('');
}

// ─── OPEN ADD BANNER ─────────────────────────────────────
window.openAddBanner = function() {
  window.bannerEditorMode = 'banners';
  document.getElementById('b-id').value = '';
  document.getElementById('b-title').value = '';
  document.getElementById('b-sub').value = '';
  document.getElementById('b-banner-file').value = '';
  document.getElementById('b-banner-base64').value = '';
  document.getElementById('b-video-file').value = '';
  document.getElementById('b-video-base64').value = '';
  document.getElementById('b-img-preview').style.display = 'none';
  document.getElementById('b-video-preview').style.display = 'none';
  document.getElementById('b-action-type').value = '';
  document.getElementById('b-action-url').value = '';
  document.getElementById('b-action-page-wrap').style.display = 'none';
  document.getElementById('b-action-tournament-wrap').style.display = 'none';
  document.getElementById('b-action-external-wrap').style.display = 'none';
  document.getElementById('b-hide-text').checked = false;
  document.getElementById('modal-b-title').textContent = 'Add New Banner';
  bannerButtons = [];
  renderBannerButtonsList();
  switchBannerMediaTab('image');
  const sel = document.getElementById('b-game');
  sel.innerHTML = '<option>All Games</option>' + (db.games || []).map(g => `<option>${g.name}</option>`).join('');
  // Populate tournament dropdown
  const tSel = document.getElementById('b-action-tournament');
  tSel.innerHTML = '<option value="">Select tournament...</option>' + (db.tournaments||[]).map(t=>`<option value="${t.id}">${t.name}</option>`).join('');
  openModal('modal-banner');
};

// ─── SAVE BANNER ─────────────────────────────────────────
window.saveBanner = async function() {
  const id    = document.getElementById('b-id').value;
  const title = document.getElementById('b-title').value.trim();
  const subtitle = document.getElementById('b-sub').value.trim();
  const game  = document.getElementById('b-game').value;
  const type  = document.getElementById('b-type').value;
  const image = document.getElementById('b-banner-base64').value;
  const video = document.getElementById('b-video-base64').value;

  // Action config
  const actionType = document.getElementById('b-action-type').value;
  const actionPage = document.getElementById('b-action-page').value;
  const actionTournament = document.getElementById('b-action-tournament').value;
  const actionUrl = document.getElementById('b-action-url').value;
  const action = { type: actionType, page: actionPage, tournamentId: actionTournament, url: actionUrl };

  if (!title) { showToast('Title required', 'error'); return; }

  const payload = { 
    title, subtitle, game, type, 
    image: image || '', 
    video: video || '',
    action,
    buttons: bannerButtons,
    color: '#1a1a2e,#2d1060',
    active: true,
    hideText: document.getElementById('b-hide-text').checked
  };

  const isPred = (window.bannerEditorMode === 'predictions');
  const endpoint = isPred ? 'predictions_banners' : 'banners';

  try {
    let res;
    if (id) {
      res = await fetch(`${API}/${endpoint}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const b = await res.json();
      if (isPred) {
        db.predictions_banners = db.predictions_banners.map(x => x.id === id ? b : x);
      } else {
        db.banners = db.banners.map(x => x.id === id ? b : x);
      }
      showToast('Banner updated!', 'success');
    } else {
      res = await fetch(`${API}/${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const b = await res.json();
      if (isPred) {
        if (!db.predictions_banners) db.predictions_banners = [];
        db.predictions_banners.push(b);
      } else {
        db.banners.push(b);
      }
      showToast('Banner added!', 'success');
    }
    if (isPred) {
      renderPredictionsBanners();
    } else {
      renderBanners();
    }
    closeModal('modal-banner');
  } catch(e) {
    showToast('Error saving banner', 'error');
  }
};

// ─── EDIT BANNER ─────────────────────────────────────────
window.editBanner = function(id) {
  window.bannerEditorMode = 'banners';
  const b = db.banners.find(x => x.id === id);
  if (!b) return;

  document.getElementById('b-id').value = b.id;
  document.getElementById('b-title').value = b.title || '';
  document.getElementById('b-sub').value = b.subtitle || '';
  document.getElementById('b-banner-base64').value = b.image || '';
  document.getElementById('b-video-base64').value = b.video || '';
  document.getElementById('modal-b-title').textContent = 'Edit Banner';

  // Image preview
  if (b.image) {
    document.getElementById('b-img-preview-el').src = b.image;
    document.getElementById('b-img-preview').style.display = 'block';
    switchBannerMediaTab('image');
  } else if (b.video) {
    document.getElementById('b-video-preview-el').src = b.video;
    document.getElementById('b-video-preview').style.display = 'block';
    switchBannerMediaTab('video');
  } else {
    switchBannerMediaTab('image');
  }

  // Game / Type
  const gameSel = document.getElementById('b-game');
  gameSel.innerHTML = '<option>All Games</option>' + (db.games || []).map(g => `<option>${g.name}</option>`).join('');
  gameSel.value = b.game || 'All Games';
  document.getElementById('b-type').value = b.type || 'Main Banner';

  // Action
  const act = b.action || {};
  document.getElementById('b-action-type').value = act.type || '';
  onBannerActionChange();
  if (act.page) document.getElementById('b-action-page').value = act.page;
  if (act.url) document.getElementById('b-action-url').value = act.url;
  const tSel = document.getElementById('b-action-tournament');
  tSel.innerHTML = '<option value="">Select tournament...</option>' + (db.tournaments||[]).map(t=>`<option value="${t.id}">${t.name}</option>`).join('');
  if (act.tournamentId) tSel.value = act.tournamentId;

  // Buttons
  bannerButtons = (b.buttons || []).map(x => ({ ...x }));
  renderBannerButtonsList();

  // Hide text toggle
  document.getElementById('b-hide-text').checked = !!b.hideText;

  openModal('modal-banner');
};

window.toggleBanner = async function(id, active) {
  await fetch(`${API}/banners/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active }) });
  db.banners = db.banners.map(b => b.id === id ? { ...b, active } : b);
  showToast(`Banner ${active ? 'activated' : 'deactivated'}`, 'success');

};

window.deleteBanner = function(id, title) {
  document.getElementById('confirm-msg').textContent = `Delete banner "${title}"?`;
  document.getElementById('confirm-action-btn').onclick = async () => {
    await fetch(`${API}/banners/${id}`, { method: 'DELETE' });
    db.banners = db.banners.filter(b => b.id !== id);
    renderBanners(); closeModal('modal-confirm'); showToast('Banner deleted', 'success');
  };
  document.getElementById('modal-confirm').classList.add('show');
};

// ── NOTICES ───────────────────────────────────────────
function renderNotices() {
  const list = document.getElementById('notices-list');
  if (!list) return;
  list.innerHTML = (db.notices || []).map(n => `
    <div class="notice-card">
      <div class="notice-icon ${n.type}">${n.type === 'warning' ? '⚠️' : 'ℹ️'}</div>
      <div style="flex:1">
        <div class="notice-title">${n.title}</div>
        <div class="notice-msg">${n.message}</div>
        <div class="notice-date">${n.date}</div>
      </div>
      <button class="btn btn-danger btn-sm" onclick="deleteNotice('${n.id}')">Delete</button>
    </div>
  `).join('') || '<div class="empty-state"><p>No notices</p></div>';
}

window.openAddNotice = function() {
  document.getElementById('n-title').value = '';
  document.getElementById('n-msg').value = '';
  document.getElementById('modal-notice').classList.add('show');
};

window.saveNotice = async function() {
  const title = document.getElementById('n-title').value.trim();
  const message = document.getElementById('n-msg').value.trim();
  const type = document.getElementById('n-type').value;
  if (!title || !message) { showToast('Fill all fields', 'error'); return; }
  const res = await fetch(`${API}/notices`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, message, type }) });
  const n = await res.json();
  db.notices.unshift(n);
  renderNotices();
  closeModal('modal-notice');
  showToast('Notice published!', 'success');
};

window.deleteNotice = async function(id) {
  await fetch(`${API}/notices/${id}`, { method: 'DELETE' });
  db.notices = db.notices.filter(n => n.id !== id);
  renderNotices(); showToast('Notice deleted', 'success');
};

// ── SETTINGS ──────────────────────────────────────────
function loadSettings() {
  if (!db.settings) return;
  const s = db.settings;
  const appNameEl = document.getElementById('s-appname');
  const commEl    = document.getElementById('s-commission');
  const refEl     = document.getElementById('s-referral');
  const minEl     = document.getElementById('s-minwd');
  const maintEl   = document.getElementById('s-maintenance');
  if (appNameEl) appNameEl.value = s.appName || 'Nexora Arena';
  if (commEl)    commEl.value    = s.commission || 15;
  if (refEl)     refEl.value     = s.referralBonus || 20;
  if (minEl)     minEl.value     = s.minWithdrawal || 100;
  if (maintEl)   maintEl.checked = s.maintenanceMode || false;

  const msgEl = document.getElementById('s-maintenance-reason');
  if (msgEl) msgEl.value = s.maintenanceReason || '';

  const statusEl = document.getElementById('s-maintenance-status');
  if (statusEl) statusEl.value = s.maintenanceStatus || 'IN PROGRESS';

  const pctEl = document.getElementById('s-maintenance-pct');
  if (pctEl) pctEl.value = s.maintenancePercentage !== undefined ? s.maintenancePercentage : 75;

  const taskEl = document.getElementById('s-maintenance-task');
  if (taskEl) taskEl.value = s.maintenanceTask || 'Optimizing Tournament Servers';

  const etaEl = document.getElementById('s-maintenance-eta');
  if (etaEl) etaEl.value = s.maintenanceEta || '2 Hours';

  const dcEl = document.getElementById('s-maintenance-discord');
  if (dcEl) dcEl.value = s.maintenanceDiscord || '#';

  const tgEl = document.getElementById('s-maintenance-telegram');
  if (tgEl) tgEl.value = s.maintenanceTelegram || '#';

  const igEl = document.getElementById('s-maintenance-instagram');
  if (igEl) igEl.value = s.maintenanceInstagram || '#';

  const showTextEl = document.getElementById('s-maintenance-show-text');
  if (showTextEl) showTextEl.checked = s.maintenanceShowText !== false;

  // Load preview media
  const previewImg = document.getElementById('s-maintenance-preview-img');
  const previewVideo = document.getElementById('s-maintenance-preview-video');
  const removeBtn = document.getElementById('s-maintenance-media-remove');
  const nameSpan = document.getElementById('s-maintenance-file-name');

  if (previewImg) previewImg.style.display = 'none';
  if (previewVideo) previewVideo.style.display = 'none';

  if (s.maintenanceMedia) {
    const isVideo = s.maintenanceMediaType === 'video' || s.maintenanceMedia.startsWith('data:video/');
    if (isVideo) {
      if (previewVideo) {
        previewVideo.src = s.maintenanceMedia;
        previewVideo.style.display = 'block';
      }
      if (nameSpan) nameSpan.textContent = 'Custom Video Selected';
    } else {
      if (previewImg) {
        previewImg.src = s.maintenanceMedia;
        previewImg.style.display = 'block';
      }
      if (nameSpan) nameSpan.textContent = 'Custom Image Selected';
    }
    if (removeBtn) removeBtn.style.display = 'inline-block';
  } else {
    if (nameSpan) nameSpan.textContent = 'No media selected';
    if (removeBtn) removeBtn.style.display = 'none';
  }

  const lbModeEl = document.getElementById('s-leaderboard-mode');
  const lbMetricEl = document.getElementById('s-leaderboard-metric');
  if (lbModeEl) lbModeEl.value = s.leaderboardMode || 'automatic';
  if (lbMetricEl) lbMetricEl.value = s.leaderboardMetric || 'spent';
  
  toggleLeaderboardEditor(s.leaderboardMode || 'automatic');
  
  if (window.drawDetectedSymbols) {
    window.drawDetectedSymbols(s.detectedSymbols || [], s.symbolLinks || {});
  }

  // Load developer socials
  const igUrlEl = document.getElementById('s-dev-instagram-url');
  const igEnEl = document.getElementById('s-dev-instagram-enabled');
  const fbUrlEl = document.getElementById('s-dev-facebook-url');
  const fbEnEl = document.getElementById('s-dev-facebook-enabled');
  const ytUrlEl = document.getElementById('s-dev-youtube-url');
  const ytEnEl = document.getElementById('s-dev-youtube-enabled');
  const tgUrlEl = document.getElementById('s-dev-telegram-url');
  const tgEnEl = document.getElementById('s-dev-telegram-enabled');
  const dcUrlEl = document.getElementById('s-dev-discord-url');
  const dcEnEl = document.getElementById('s-dev-discord-enabled');
  const twUrlEl = document.getElementById('s-dev-twitter-url');
  const twEnEl = document.getElementById('s-dev-twitter-enabled');

  if (igUrlEl) igUrlEl.value = s.devInstagramUrl || '';
  if (igEnEl) igEnEl.checked = s.devInstagramEnabled !== false;
  if (fbUrlEl) fbUrlEl.value = s.devFacebookUrl || '';
  if (fbEnEl) fbEnEl.checked = s.devFacebookEnabled !== false;
  if (ytUrlEl) ytUrlEl.value = s.devYoutubeUrl || '';
  if (ytEnEl) ytEnEl.checked = s.devYoutubeEnabled !== false;
  if (tgUrlEl) tgUrlEl.value = s.devTelegramUrl || '';
  if (tgEnEl) tgEnEl.checked = s.devTelegramEnabled !== false;
  if (dcUrlEl) dcUrlEl.value = s.devDiscordUrl || '';
  if (dcEnEl) dcEnEl.checked = s.devDiscordEnabled !== false;
  if (twUrlEl) twUrlEl.value = s.devTwitterUrl || '';
  if (twEnEl) twEnEl.checked = s.devTwitterEnabled !== false;
}

window.toggleLeaderboardEditor = function(mode) {
  const rowAuto = document.getElementById('row-auto-metric');
  const editorManual = document.getElementById('manual-leaderboard-editor');
  if (mode === 'manual') {
    if (rowAuto) rowAuto.style.display = 'none';
    if (editorManual) editorManual.style.display = 'block';
    loadManualLeaderboard();
  } else {
    if (rowAuto) rowAuto.style.display = 'flex';
    if (editorManual) editorManual.style.display = 'none';
  }
};

window.loadManualLeaderboard = async function() {
  try {
    const res = await fetch(`${API}/leaderboard`);
    const leaderboard = await res.json();
    const tbody = document.getElementById('manual-leaderboard-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    const items = leaderboard.length > 0 ? leaderboard : Array.from({length: 10}, (_, i) => ({
      rank: i + 1, username: '', earnings: 0, wins: 0
    }));
    
    items.forEach(item => {
      tbody.innerHTML += `
        <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
          <td style="padding:8px 4px; font-weight:bold; color:var(--accent-bright);">${item.rank}</td>
          <td style="padding:8px 4px;"><input class="form-control" type="text" value="${item.username || ''}" id="lb-user-${item.rank}" style="width:180px; height:32px; font-size:0.85rem;" placeholder="Username" /></td>
          <td style="padding:8px 4px;"><input class="form-control" type="number" value="${item.earnings || 0}" id="lb-earn-${item.rank}" style="width:100px; height:32px; font-size:0.85rem;" /></td>
          <td style="padding:8px 4px;"><input class="form-control" type="number" value="${item.wins || 0}" id="lb-wins-${item.rank}" style="width:80px; height:32px; font-size:0.85rem;" /></td>
          <td style="padding:8px 4px; text-align:right; color:var(--text-muted); font-size:0.75rem;">Top ${item.rank}</td>
        </tr>
      `;
    });
  } catch (err) {
    showToast('Failed to load leaderboard editor', 'error');
  }
};

window.saveManualLeaderboard = async function() {
  try {
    const body = [];
    for (let r = 1; r <= 10; r++) {
      const username = document.getElementById(`lb-user-${r}`).value.trim() || `Player_${r}`;
      const earnings = parseInt(document.getElementById(`lb-earn-${r}`).value) || 0;
      const wins = parseInt(document.getElementById(`lb-wins-${r}`).value) || 0;
      body.push({ rank: r, username, earnings, wins });
    }
    
    await fetch(`${API}/leaderboard`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    showToast('Manual Rankings saved successfully! ✅', 'success');
  } catch (err) {
    showToast('Failed to save manual rankings', 'error');
  }
};

window.saveSetting = async function(key, value) {
  try {
    const body = { [key]: value };
    await fetch(`${API}/settings`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    db.settings = { ...db.settings, ...body };
    showToast('Setting saved! App updated in real-time ✅', 'success');
    renderCommission();
  } catch { showToast('Error saving setting', 'error'); }
};

window.confirmLogout = function() {
  if (confirm('Logout from admin panel?')) showToast('Logged out', 'info');
};

// ── MODALS ────────────────────────────────────────────
window.closeModal = function(id) {
  document.getElementById(id).classList.remove('show');
};
window.openModal = function(id) {
  document.getElementById(id).classList.add('show');
};
// Close on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('show');
  });
});

// ── TOAST ─────────────────────────────────────────────
window.showToast = function(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span> ${msg}`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(40px)'; toast.style.transition = '0.3s'; setTimeout(() => toast.remove(), 300); }, 3000);
};

// ── UTILS ─────────────────────────────────────────────
function getGameEmoji(gameName) {
  const g = (db.games || []).find(x => x.name === gameName);
  return g?.emoji || '🎮';
}

document.addEventListener('DOMContentLoaded', () => {
  const tFile = document.getElementById('t-banner-file');
  if (tFile) {
    tFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image size should be less than 2MB', 'error');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        document.getElementById('t-banner-base64').value = evt.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  const bFile = document.getElementById('b-banner-file');
  if (bFile) {
    bFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size should be less than 5MB', 'error');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        document.getElementById('b-banner-base64').value = evt.target.result;
        const prev = document.getElementById('b-img-preview');
        const prevEl = document.getElementById('b-img-preview-el');
        if (prev && prevEl) {
          prevEl.src = evt.target.result;
          prev.style.display = 'block';
        }
      };
      reader.readAsDataURL(file);
    });
  }

  // Video banner listener
  const bVideoFile = document.getElementById('b-video-file');
  if (bVideoFile) {
    bVideoFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 20 * 1024 * 1024) {
        showToast('Video size should be less than 20MB', 'error');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        document.getElementById('b-video-base64').value = evt.target.result;
        const prev = document.getElementById('b-video-preview');
        const prevEl = document.getElementById('b-video-preview-el');
        if (prev && prevEl) {
          prevEl.src = evt.target.result;
          prev.style.display = 'block';
        }
      };
      reader.readAsDataURL(file);
    });
  }

  const gFile = document.getElementById('g-image-file');
  if (gFile) {
    gFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image size should be less than 2MB', 'error');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        document.getElementById('g-image-base64').value = evt.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  const pmT1File = document.getElementById('pm-t1-logo-file');
  if (pmT1File) {
    pmT1File.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image size should be less than 2MB', 'error');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        document.getElementById('pm-t1-logo-base64').value = evt.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  const pmT2File = document.getElementById('pm-t2-logo-file');
  if (pmT2File) {
    pmT2File.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image size should be less than 2MB', 'error');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        document.getElementById('pm-t2-logo-base64').value = evt.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  const pHeroFile = document.getElementById('p-hero-image-file');
  if (pHeroFile) {
    pHeroFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image size should be less than 2MB', 'error');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        document.getElementById('p-hero-image-base64').value = evt.target.result;
      };
      reader.readAsDataURL(file);
    });
  }
});

function renderBankVerifications() {
  const tbody = document.getElementById('bank-verification-tbody');
  if (!tbody) return;
  
  const list = (db.users || []).map(u => {
    if (!u.bankDetails) {
      u.bankDetails = {
        bankName: 'HDFC Bank',
        accountNumber: '50100238491823',
        ifsc: 'HDFC0000124',
        accountHolder: u.name
      };
      u.upi = u.upi || (u.name.toLowerCase().replace(/\s+/g, '') + '@okaxis');
      u.verificationStatus = u.verificationStatus || 'pending';
    }
    return u;
  });

  tbody.innerHTML = list.map((u, i) => {
    const statusClass = u.verificationStatus === 'verified' ? 'active' : u.verificationStatus === 'rejected' ? 'banned' : 'pending';
    const statusLabel = u.verificationStatus?.toUpperCase() || 'PENDING';

    return `
      <tr>
        <td>${i+1}</td>
        <td>
          <b>${u.name}</b>
          <div style="font-size:0.7rem;color:var(--text-muted)">ID: ${u.id}</div>
        </td>
        <td style="font-family:monospace;color:var(--text-secondary)">📱 ${u.upi}</td>
        <td>🏦 ${u.bankDetails.bankName}</td>
        <td style="font-family:monospace;color:var(--text-secondary)">${u.bankDetails.accountNumber}</td>
        <td style="font-family:monospace;color:var(--text-muted)">${u.bankDetails.ifsc}</td>
        <td><b>${u.bankDetails.accountHolder}</b></td>
        <td><span class="badge ${statusClass}">${statusLabel}</span></td>
        <td>
          <div class="actions-row">
            <button class="btn btn-success btn-sm" onclick="verifyBank('${u.id}', 'verified')">Verify</button>
            <button class="btn btn-danger btn-sm" onclick="verifyBank('${u.id}', 'rejected')">Reject</button>
          </div>
        </td>
      </tr>
    `;
  }).join('') || '<tr><td colspan="9" style="text-align:center;padding:20px;color:var(--text-muted)">No users found</td></tr>';
}

window.verifyBank = async function(userId, status) {
  try {
    const res = await fetch(`${API}/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verificationStatus: status })
    });
    if (res.ok) {
      db.users = db.users.map(u => u.id === userId ? { ...u, verificationStatus: status } : u);
      renderBankVerifications();
      showToast(`User bank status updated to ${status}! ✅`, 'success');
    }
  } catch(e) {
    showToast('Failed to update bank verification status', 'error');
  }
};

window.openManageUser = function(userId) {
  const u = (db.users || []).find(x => x.id === userId);
  if (!u) {
    showToast('User not found!', 'error');
    return;
  }
  
  const bal = u.balance !== undefined ? u.balance : 2450;
  
  document.getElementById('mu-user-id').value = u.id;
  document.getElementById('mu-user-name').textContent = u.name;
  document.getElementById('mu-user-meta').textContent = `ID: ${u.id} | Email: ${u.email} | Phone: ${u.phone}`;
  document.getElementById('mu-user-balance').textContent = `₹${bal.toLocaleString('en-IN')}`;
  document.getElementById('user-adj-amount').value = '';
  
  const bankSec = document.getElementById('mu-bank-section');
  if (u.bankDetails) {
    document.getElementById('mu-bank-details').innerHTML = `
      🏦 <b>Bank Name:</b> ${u.bankDetails.bankName}<br>
      <b>A/C Number:</b> ${u.bankDetails.accountNumber}<br>
      <b>IFSC:</b> ${u.bankDetails.ifsc} | <b>Name:</b> ${u.bankDetails.accountHolder}<br>
      <b>Status:</b> <span class="badge ${u.verificationStatus === 'verified' ? 'active' : u.verificationStatus === 'rejected' ? 'banned' : 'pending'}">${(u.verificationStatus || 'pending').toUpperCase()}</span>
    `;
    bankSec.style.display = 'block';
  } else {
    bankSec.style.display = 'none';
  }
  
  openModal('modal-manage-user');
};

window.adjustUserBalance = async function(action) {
  const userId = document.getElementById('mu-user-id').value;
  const u = (db.users || []).find(x => x.id === userId);
  if (!u) return;

  const currentBal = u.balance !== undefined ? u.balance : 2450;
  const adjInput = document.getElementById('user-adj-amount');
  const amount = parseInt(adjInput.value);

  if (action !== 'settle' && (!amount || amount <= 0)) {
    showToast('Please enter a valid amount greater than 0', 'error');
    return;
  }

  let newBal = currentBal;
  let transactionType = 'added';
  let desc = '';
  let method = 'Admin Adjustment';
  let successMsg = '';

  if (action === 'add') {
    newBal += amount;
    transactionType = 'added';
    desc = 'Balance Credited by Admin';
    successMsg = `Added ₹${amount.toLocaleString('en-IN')} to ${u.name}'s wallet! ➕💳`;
  } else if (action === 'deduct') {
    if (amount > currentBal) {
      showToast('Insufficient user wallet balance to deduct!', 'error');
      return;
    }
    newBal -= amount;
    transactionType = 'withdrawal';
    desc = 'Balance Debited by Admin';
    successMsg = `Deducted ₹${amount.toLocaleString('en-IN')} from ${u.name}'s wallet! ➖💸`;
  } else if (action === 'settle') {
    if (currentBal <= 0) {
      showToast('No balance available in user wallet to settle!', 'error');
      return;
    }
    newBal = 0;
    transactionType = 'withdrawal';
    desc = 'Bank Settlement by Admin';
    method = `Bank (${u.bankDetails.bankName})`;
    successMsg = `Settled entire wallet balance of ₹${currentBal.toLocaleString('en-IN')} to ${u.name}'s Bank Account! 🏦💸`;
  }

  try {
    const res = await fetch(`${API}/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ balance: newBal })
    });

    if (res.ok) {
      db.users = db.users.map(x => x.id === userId ? { ...x, balance: newBal } : x);
      
      const txData = {
        user: u.name,
        type: transactionType,
        amount: action === 'add' ? amount : (action === 'deduct' ? -amount : -currentBal),
        method: method,
        status: 'success',
        date: new Date().toLocaleString('en-IN')
      };
      
      await fetch(`${API}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txData)
      });

      await loadAllData();
      renderAll();
      
      document.getElementById('mu-user-balance').textContent = `₹${newBal.toLocaleString('en-IN')}`;
      adjInput.value = '';
      
      showToast(successMsg, 'success');
    }
  } catch(e) {
    showToast('Failed to adjust user balance', 'error');
  }
};

function parseIndianDate(dateStr) {
  if (!dateStr) return new Date(0);
  let str = dateStr.trim();
  const parsed = Date.parse(str);
  if (!isNaN(parsed)) return new Date(parsed);
  
  // DD/MM/YYYY or DD-MM-YYYY format
  const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(.*)/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1]);
    const month = parseInt(dmyMatch[2]) - 1;
    const year = parseInt(dmyMatch[3]);
    let hours = 0, minutes = 0;
    const timeStr = dmyMatch[4].trim();
    if (timeStr) {
      const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
      if (timeMatch) {
        hours = parseInt(timeMatch[1]);
        minutes = parseInt(timeMatch[2]);
        const ampm = timeMatch[3];
        if (ampm && ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (ampm && ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
      }
    }
    return new Date(year, month, day, hours, minutes);
  }
  
  // "DD Month YYYY" format
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const words = str.toLowerCase().replace(/,/g, '').split(/\s+/);
  if (words.length >= 3) {
    const day = parseInt(words[0]);
    const monthIdx = months.findIndex(m => words[1].startsWith(m));
    const year = parseInt(words[2]);
    let hours = 0, minutes = 0;
    if (monthIdx !== -1 && !isNaN(day) && !isNaN(year)) {
      if (words.length >= 4) {
        const timePart = words[3];
        const timeMatch = timePart.match(/(\d{1,2}):(\d{2})/);
        if (timeMatch) {
          hours = parseInt(timeMatch[1]);
          minutes = parseInt(timeMatch[2]);
          const ampm = words[4];
          if (ampm && ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
          if (ampm && ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
        }
      }
      return new Date(year, monthIdx, day, hours, minutes);
    }
  }
  return new Date(str);
}

window.exportToExcel = function() {
  if (!db.transactions || db.transactions.length === 0) {
    showToast('No transaction data to export!', 'error');
    return;
  }

  // Sort by transaction date descending (latest first)
  const sortedTxs = [...db.transactions].sort((a, b) => parseIndianDate(b.date) - parseIndianDate(a.date));

  // 1. Prepare Rows
  const rows = sortedTxs.map((tx, idx) => {
    // Find matching user details from db.users
    const userObj = (db.users || []).find(u => u.name === tx.user) || {};
    
    // Parse calculations
    const totalAmt = Math.abs(tx.amount || 0);
    // Platform fee (15%) and GST (18%) are only applicable for tournament entries (Type: 'joined' or similar)
    const isTournament = tx.type === 'joined' || (tx.desc && tx.desc.toLowerCase().includes('tournament')) || (tx.method && tx.method.toLowerCase().includes('wallet') && tx.amount < 0);
    const platformFee = isTournament ? Math.round(totalAmt * 0.15) : 0;
    const gst = isTournament ? Math.round(platformFee * 0.18) : 0;
    
    // Map details
    return {
      "S.No": idx + 1,
      "Transaction ID": tx.id || `TXN${1002449 + idx}`,
      "User ID": userObj.id || 'N/A',
      "User Name": tx.user || 'Unknown User',
      "Email": userObj.email || 'N/A',
      "Phone": userObj.phone || 'N/A',
      "Game": tx.game || (isTournament ? 'BGMI' : 'N/A'),
      "Tournament Name": tx.tournamentName || (isTournament ? (tx.desc || 'BGMI Solo Showdown') : 'N/A'),
      "Slot/Team": tx.slotTeam || (isTournament ? '60/100' : 'N/A'),
      "Type": tx.type === 'added' ? 'Added Cash' : (tx.type === 'withdrawal' ? 'Withdrawal' : (isTournament ? 'Entry Fee' : tx.type)),
      "Amount (₹)": totalAmt,
      "Platform Fee (₹)": platformFee,
      "GST (₹)": gst,
      "Total Amount (₹)": totalAmt,
      "Payment Method": tx.method || 'Wallet',
      "Payment ID / UTR": tx.utr || (tx.method === 'UPI' ? `UPI${Math.floor(100000000000 + Math.random() * 900000000000)}` : 'WALLET'),
      "Status": tx.status || 'Success',
      "Date & Time": tx.date || new Date().toLocaleString('en-IN')
    };
  });

  // 2. Generate Worksheet
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 6 },   // S.No
    { wch: 16 },  // Transaction ID
    { wch: 12 },  // User ID
    { wch: 18 },  // User Name
    { wch: 25 },  // Email
    { wch: 15 },  // Phone
    { wch: 15 },  // Game
    { wch: 24 },  // Tournament Name
    { wch: 12 },  // Slot/Team
    { wch: 14 },  // Type
    { wch: 12 },  // Amount
    { wch: 16 },  // Platform Fee
    { wch: 10 },  // GST
    { wch: 16 },  // Total Amount
    { wch: 16 },  // Payment Method
    { wch: 20 },  // Payment ID / UTR
    { wch: 10 },  // Status
    { wch: 22 }   // Date & Time
  ];

  // 3. Create Workbook & Append Sheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Payment History");

  // 4. Generate current date formatted filename (NexoraArena_UserPaymentHistory_DDMMYYYY.xlsx)
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  const filename = `NexoraArena_UserPaymentHistory_${dd}${mm}${yyyy}.xlsx`;

  // 5. Download the file
  XLSX.writeFile(workbook, filename);
  showToast('Excel report downloaded! 📊✅', 'success');
};

window.generateCommissionReport = function() {
  const fromVal = document.getElementById('comm-date-from').value;
  const toVal = document.getElementById('comm-date-to').value;
  const gameVal = document.getElementById('comm-game-select').value;

  const fromDate = fromVal ? new Date(fromVal) : null;
  const toDate = toVal ? new Date(toVal) : null;

  const pct = (db.settings && db.settings.commission) || 15;
  
  let txs = (db.transactions || []).filter(tx => {
    const isJoined = tx.type === 'joined' || (tx.desc && tx.desc.toLowerCase().includes('tournament')) || (tx.method === 'Wallet' && tx.amount < 0);
    if (!isJoined) return false;

    if (fromDate || toDate) {
      const txDateObj = new Date(tx.date);
      if (isNaN(txDateObj.getTime())) return true;
      if (fromDate && txDateObj < fromDate) return false;
      if (toDate && txDateObj > toDate) return false;
    }
    return true;
  });

  const gamesData = {
    'BGMI': { emoji: '🎯', rev: 0, t: 0 },
    'Free Fire MAX': { emoji: '🔥', rev: 0, t: 0 },
    'Valorant': { emoji: '⚔️', rev: 0, t: 0 },
    'COD Mobile': { emoji: '🪖', rev: 0, t: 0 },
    'Clash Royale': { emoji: '👑', rev: 0, t: 0 }
  };

  txs.forEach(tx => {
    let gameName = tx.game || 'BGMI';
    if (!tx.game) {
      if (tx.desc.toLowerCase().includes('bgmi')) gameName = 'BGMI';
      else if (tx.desc.toLowerCase().includes('free fire')) gameName = 'Free Fire MAX';
      else if (tx.desc.toLowerCase().includes('valorant')) gameName = 'Valorant';
      else if (tx.desc.toLowerCase().includes('cod')) gameName = 'COD Mobile';
      else if (tx.desc.toLowerCase().includes('clash')) gameName = 'Clash Royale';
    }

    if (gamesData[gameName]) {
      const amt = Math.abs(tx.amount || 0);
      gamesData[gameName].rev += amt;
      gamesData[gameName].t += 1;
    }
  });

  let displayGames = Object.keys(gamesData);
  if (gameVal !== 'All Games') {
    displayGames = displayGames.filter(g => g === gameVal);
  }

  let totalRevenue = 0;
  let totalTournaments = 0;
  displayGames.forEach(g => {
    totalRevenue += gamesData[g].rev;
    totalTournaments += gamesData[g].t;
  });

  if (totalRevenue === 0) {
    totalRevenue = db.stats?.totalRevenue || 1875000;
    totalTournaments = db.stats?.totalTournaments || 342;
    gamesData['BGMI'].rev = 925000; gamesData['BGMI'].t = 95;
    gamesData['Free Fire MAX'].rev = 435000; gamesData['Free Fire MAX'].t = 90;
    gamesData['Valorant'].rev = 375000; gamesData['Valorant'].t = 69;
    gamesData['COD Mobile'].rev = 235000; gamesData['COD Mobile'].t = 48;
    gamesData['Clash Royale'].rev = 186000; gamesData['Clash Royale'].t = 57;
    
    displayGames = Object.keys(gamesData);
    if (gameVal !== 'All Games') {
      displayGames = displayGames.filter(g => g === gameVal);
    }
    totalRevenue = 0;
    totalTournaments = 0;
    displayGames.forEach(g => {
      totalRevenue += gamesData[g].rev;
      totalTournaments += gamesData[g].t;
    });
  }

  const totalCommission = Math.round(totalRevenue * pct / 100);

  document.getElementById('comm-revenue').textContent = '₹' + totalRevenue.toLocaleString('en-IN');
  document.getElementById('comm-total').textContent = '₹' + totalCommission.toLocaleString('en-IN');
  document.getElementById('comm-pct').textContent = pct + '%';
  document.getElementById('comm-t-count').textContent = totalTournaments;

  const tbody = document.getElementById('commission-tbody');
  if (!tbody) return;

  const maxRev = Math.max(...displayGames.map(g => gamesData[g].rev), 1);
  
  tbody.innerHTML = displayGames.map((g, i) => {
    const c = gamesData[g];
    const commAmt = Math.round(c.rev * pct / 100);
    return `
      <tr>
        <td>${i+1}</td>
        <td>${c.emoji} <b>${g}</b></td>
        <td style="color:var(--warning)">₹${c.rev.toLocaleString('en-IN')}</td>
        <td>${pct}%</td>
        <td style="color:var(--success)">₹${commAmt.toLocaleString('en-IN')}</td>
        <td>${c.t}</td>
        <td style="min-width:120px">
          <div style="height:6px;border-radius:3px;background:var(--bg-elevated)">
            <div class="commission-bar" style="width:${Math.round(c.rev/maxRev*100)}%"></div>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  showToast('Commission report updated!', 'success');
};

window.exportCommissionReport = function() {
  const fromVal = document.getElementById('comm-date-from').value;
  const toVal = document.getElementById('comm-date-to').value;
  
  const pct = (db.settings && db.settings.commission) || 15;
  const tbody = document.getElementById('commission-tbody');
  if (!tbody || tbody.children.length === 0) {
    showToast('No commission report data to export!', 'error');
    return;
  }
  
  const rows = [];
  const trs = tbody.querySelectorAll('tr');
  trs.forEach((tr, idx) => {
    const tds = tr.querySelectorAll('td');
    const game = tds[1].innerText.trim();
    const rev = parseInt(tds[2].innerText.replace(/[^0-9]/g, '')) || 0;
    const commPct = parseInt(tds[3].innerText.replace(/[^0-9]/g, '')) || pct;
    const commAmt = parseInt(tds[4].innerText.replace(/[^0-9]/g, '')) || 0;
    const tournamentsCount = parseInt(tds[5].innerText.replace(/[^0-9]/g, '')) || 0;
    
    rows.push({
      "S.No": idx + 1,
      "Game": game,
      "Total Revenue (₹)": rev,
      "Commission Percentage (%)": commPct,
      "Commission Amount (₹)": commAmt,
      "Tournaments Count": tournamentsCount
    });
  });
  
  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 8 },
    { wch: 20 },
    { wch: 20 },
    { wch: 25 },
    { wch: 22 },
    { wch: 20 }
  ];
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Commission Report");
  
  const filename = `NexoraArena_CommissionReport_${fromVal || 'start'}_to_${toVal || 'end'}.xlsx`;
  XLSX.writeFile(workbook, filename);
  showToast('Commission Report exported successfully! 📊✅', 'success');
};

window.exportUsersToExcel = function() {
  if (!db.users || db.users.length === 0) {
    showToast('No user data to export!', 'error');
    return;
  }

  // Sort by joined date descending (latest first)
  const sortedUsers = [...db.users].sort((a, b) => parseIndianDate(b.joined) - parseIndianDate(a.joined));

  const rows = sortedUsers.map((u, idx) => {
    return {
      "S.No": idx + 1,
      "User ID": u.id || `NXA1000${idx + 1}`,
      "Name": u.name || 'N/A',
      "Email": u.email || 'N/A',
      "Phone": u.phone || 'N/A',
      "Wallet Balance (₹)": u.balance || 0,
      "Total Tournaments Joined": u.tournaments || 0,
      "Total Spent (₹)": u.spent || 0,
      "Status": u.status || 'active',
      "Joined Date": u.joined || 'N/A',
      "Bank Verification Status": u.verificationStatus || 'unverified'
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 15 },
    { wch: 20 },
    { wch: 25 },
    { wch: 16 },
    { wch: 18 },
    { wch: 24 },
    { wch: 16 },
    { wch: 12 },
    { wch: 14 },
    { wch: 24 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Users List");

  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  const filename = `NexoraArena_Users_${dd}${mm}${yyyy}.xlsx`;

  XLSX.writeFile(workbook, filename);
  showToast('Users list exported successfully! 📊✅', 'success');
};

window.viewWithdrawalDetails = function(id) {
  const w = (db.withdrawals || []).find(x => x.id === id);
  if (!w) return;

  const u = (db.users || []).find(x => x.name === w.user) || { id: 'N/A', email: 'N/A', balance: 0 };
  
  // Set user fields
  document.getElementById('wd-user-avatar').textContent = w.user[0];
  document.getElementById('wd-user-name').textContent = w.user;
  document.getElementById('wd-user-meta').textContent = `User ID: ${u.id || 'N/A'} | Email: ${u.email || 'N/A'}`;

  // Balance fields
  const currentBal = u.balance || 0;
  const beforeBal = w.status === 'rejected' ? currentBal : currentBal + w.amount;
  const afterBal = w.status === 'rejected' ? currentBal : currentBal;

  document.getElementById('wd-bal-before').textContent = `₹${beforeBal.toLocaleString('en-IN')}.00`;
  document.getElementById('wd-bal-req').textContent = `₹${w.amount.toLocaleString('en-IN')}.00`;
  document.getElementById('wd-bal-after').textContent = `₹${afterBal.toLocaleString('en-IN')}.00`;

  // Request info fields
  document.getElementById('wd-tx-id').textContent = w.id;
  document.getElementById('wd-info-amount').textContent = `₹${w.amount.toLocaleString('en-IN')}.00`;
  document.getElementById('wd-info-method').textContent = w.method.toUpperCase();
  
  let detailsText = '';
  if (w.method === 'bank' && w.details) {
    detailsText = `Bank: ${w.details.bankName} | A/C: ${w.details.accountNumber} | IFSC: ${w.details.ifsc} | Holder: ${w.details.accountHolder}`;
  } else {
    detailsText = w.details?.upi || w.upi || 'N/A';
  }
  document.getElementById('wd-info-details').textContent = detailsText;
  document.getElementById('wd-info-date').textContent = w.date;

  const statusBadge = document.getElementById('wd-info-status');
  statusBadge.textContent = w.status.toUpperCase();
  statusBadge.className = `badge ${w.status}`;

  // Toggle buttons
  const actions = document.getElementById('wd-actions-container');
  if (w.status === 'pending') {
    actions.style.display = 'flex';
  } else {
    actions.style.display = 'none';
  }

  document.getElementById('wd-hidden-id').value = w.id;
  document.getElementById('modal-withdrawal-details').classList.add('show');
};

window.openRejectWdModal = async function() {
  const id = document.getElementById('wd-hidden-id').value;
  if (!id) return;
  
  if (confirm('Are you sure you want to reject this withdrawal request? Money will be refunded to the user wallet.')) {
    try {
      const w = db.withdrawals.find(x => x.id === id);
      if (!w) return;

      const u = db.users.find(x => x.name === w.user);
      if (u) {
        const newBal = u.balance + w.amount;
        await fetch(`${API}/users/${u.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ balance: newBal })
        });
        
        const txData = {
          user: w.user,
          type: 'refund',
          amount: w.amount,
          method: 'Wallet',
          status: 'success',
          date: new Date().toLocaleString('en-IN'),
          desc: `Refund: Rejected Withdrawal ${w.id}`
        };
        await fetch(`${API}/transactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(txData)
        });
      }

      await fetch(`${API}/withdrawals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' })
      });

      await loadAllData();
      renderWithdrawals();
      updatePendingBadge();
      closeModal('modal-withdrawal-details');
      showToast('Withdrawal request rejected and refunded! ❌', 'error');
    } catch(e) {
      showToast('Error rejecting request', 'error');
    }
  }
};

window.openApproveWdModal = function() {
  const id = document.getElementById('wd-hidden-id').value;
  if (!id) return;
  const w = db.withdrawals.find(x => x.id === id);
  if (!w) return;

  document.getElementById('mp-amount').textContent = `₹${w.amount.toLocaleString('en-IN')}.00`;
  document.getElementById('mp-method').textContent = w.method.toUpperCase();
  
  let detailsText = '';
  if (w.method === 'bank' && w.details) {
    detailsText = `${w.details.bankName} - A/C: ${w.details.accountNumber}`;
  } else {
    detailsText = w.details?.upi || w.upi || 'N/A';
  }
  document.getElementById('mp-details').textContent = detailsText;
  document.getElementById('mp-time').textContent = new Date().toLocaleString('en-IN');
  
  document.getElementById('mp-ref-no').value = '';
  document.getElementById('mp-notes').value = w.method === 'upi' ? 'Payment sent via UPI.' : 'Payment sent via Bank Transfer.';

  closeModal('modal-withdrawal-details');
  document.getElementById('modal-mark-as-paid').classList.add('show');
};

window.autoGenerateUTR = function() {
  const method = document.getElementById('mp-method').textContent;
  const prefix = method === 'UPI' ? 'UPI' : 'TXN';
  const num = Math.floor(100000000000 + Math.random() * 900000000000);
  document.getElementById('mp-ref-no').value = prefix + num;
};

window.confirmMarkAsPaid = async function() {
  const id = document.getElementById('wd-hidden-id').value;
  const refNo = document.getElementById('mp-ref-no').value.trim();
  const notes = document.getElementById('mp-notes').value.trim();

  if (!refNo) {
    showToast('Please enter Transaction ID / UTR Reference No!', 'error');
    return;
  }

  try {
    const w = db.withdrawals.find(x => x.id === id);
    if (!w) return;

    const paidAtStr = new Date().toLocaleString('en-IN');

    await fetch(`${API}/withdrawals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        status: 'approved', 
        paidAt: paidAtStr,
        refNo: refNo,
        notes: notes
      })
    });

    await loadAllData();
    renderWithdrawals();
    updatePendingBadge();
    closeModal('modal-mark-as-paid');
    showToast('Withdrawal request completed successfully! 💸🏆', 'success');
  } catch(e) {
    showToast('Error updating payment status', 'error');
  }
};

// ── Support Tickets & Settings ───────────────────────
let currentTicketFilter = 'all';

window.loadTickets = async function() {
  try {
    const res = await fetch(`${API}/tickets`);
    if (res.ok) {
      db.tickets = await res.json();
    }
  } catch(e) {
    console.error('Failed to load tickets:', e);
  }
  renderTicketsList();
  updateTicketsBadge();
};

window.updateTicketsBadge = function() {
  if (!db.tickets) return;
  const count = db.tickets.filter(t => t.status === 'open').length;
  const badge = document.getElementById('tickets-badge');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-block' : 'none';
  }
};

window.filterTickets = function(status, btn) {
  currentTicketFilter = status;
  document.querySelectorAll('#page-tickets .ftab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderTicketsList();
};

window.renderTicketsList = function() {
  const tbody = document.getElementById('tickets-tbody');
  if (!tbody) return;

  const tickets = db.tickets || [];
  const filtered = tickets.filter(t => {
    if (currentTicketFilter === 'all') return true;
    if (currentTicketFilter === 'open') return t.status === 'open';
    if (currentTicketFilter === 'in-progress') return t.status === 'in-progress';
    if (currentTicketFilter === 'awaiting') return t.status === 'awaiting';
    if (currentTicketFilter === 'resolved') return t.status === 'resolved';
    if (currentTicketFilter === 'closed') return t.status === 'closed';
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-muted)">No tickets found</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(t => {
    let statusClass = 'badge-pending'; // open
    if (t.status === 'in-progress') statusClass = 'badge-warning';
    if (t.status === 'awaiting') statusClass = 'badge-info';
    if (t.status === 'resolved') statusClass = 'badge-success';
    if (t.status === 'closed') statusClass = 'badge-danger';

    return `
      <tr>
        <td style="font-family:monospace; font-weight:700; color:var(--accent-bright)">${t.id}</td>
        <td>
          <div style="font-weight:700; color:#fff">${t.user}</div>
          <div style="font-size:0.75rem; color:var(--text-muted)">${t.userPhone}</div>
        </td>
        <td style="font-weight:600">${t.category}</td>
        <td style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap">${t.subject}</td>
        <td><span class="badge ${statusClass}">${t.status.toUpperCase()}</span></td>
        <td style="color:var(--text-muted)">${t.createdAt}</td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="openTicketDetails('${t.id}')" style="padding:4px 8px; font-size:0.75rem; display:inline-flex; align-items:center; gap:4px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            View
          </button>
        </td>
      </tr>
    `;
  }).join('');
};

window.openTicketDetails = async function(id) {
  try {
    const res = await fetch(`${API}/tickets/${id}`);
    if (!res.ok) return showToast('Error fetching ticket details', 'error');
    const t = await res.json();

    document.getElementById('tk-hidden-id').value = t.id;
    document.getElementById('tk-info-id').textContent = t.id;
    document.getElementById('tk-info-category').textContent = t.category;
    document.getElementById('tk-info-subject').textContent = t.subject;
    document.getElementById('tk-info-date').textContent = t.createdAt;
    document.getElementById('tk-info-pref').textContent = t.prefContact;

    document.getElementById('tk-user-name').textContent = t.user;
    document.getElementById('tk-user-meta').textContent = `ID: ${t.userId} | ${t.userEmail}`;
    document.getElementById('tk-user-avatar').textContent = t.user.charAt(0).toUpperCase();

    document.getElementById('tk-info-status-select').value = t.status;

    const attachDiv = document.getElementById('tk-info-attachments');
    if (t.files && t.files.length > 0) {
      attachDiv.innerHTML = t.files.map(f => `
        <a href="${f.url}" target="_blank" style="display:flex; align-items:center; gap:8px; background:var(--bg-base); padding:6px 10px; border-radius:4px; border:1px solid var(--border-light); color:#fff; text-decoration:none; font-size:0.75rem; font-weight:600; margin-bottom:4px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
          ${f.name} (${(f.size/1024).toFixed(1)} KB)
        </a>
      `).join('');
    } else {
      attachDiv.innerHTML = `<span style="font-size:0.75rem; color:var(--text-muted)">No files uploaded</span>`;
    }

    renderTicketChat(t.replies);
    openModal('modal-ticket-details');
  } catch(e) {
    showToast('Failed to load ticket details', 'error');
  }
};

function renderTicketChat(replies) {
  const box = document.getElementById('tk-chat-box');
  if (!box) return;

  if (!replies || replies.length === 0) {
    box.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-muted); font-size:0.8rem;">No messages yet</div>`;
    return;
  }

  box.innerHTML = replies.map(r => {
    const isAdmin = r.sender === 'admin';
    const alignStyle = isAdmin ? 'margin-left:auto; background:var(--accent); color:#fff;' : 'margin-right:auto; background:var(--bg-card); color:var(--text-secondary);';
    const metaAlign = isAdmin ? 'text-align:right' : 'text-align:left';

    return `
      <div style="max-width:85%; padding:10px 12px; border-radius:8px; margin-bottom:12px; font-size:0.82rem; box-shadow:0 2px 4px rgba(0,0,0,0.15); ${alignStyle}">
        <div style="font-weight:700; font-size:0.75rem; opacity:0.8; margin-bottom:4px;">${isAdmin ? 'NEXORA SUPPORT' : 'PLAYER'}</div>
        <div style="line-height:1.4">${r.message}</div>
        ${r.files && r.files.length > 0 ? `
          <div style="margin-top:6px; display:flex; flex-direction:column; gap:4px;">
            ${r.files.map(f => `
              <a href="${f.url}" target="_blank" style="color:#a855f7; text-decoration:underline; font-size:0.72rem; display:flex; align-items:center; gap:4px;">📎 ${f.name}</a>
            `).join('')}
          </div>
        ` : ''}
        <div style="font-size:0.65rem; opacity:0.6; margin-top:6px; ${metaAlign}">${r.date}</div>
      </div>
    `;
  }).join('');

  setTimeout(() => { box.scrollTop = box.scrollHeight; }, 50);
}

window.updateTicketStatus = async function(status) {
  const id = document.getElementById('tk-hidden-id').value;
  if (!id) return;

  try {
    const res = await fetch(`${API}/tickets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      showToast(`Ticket status updated to ${status.toUpperCase()}! 🔄`, 'success');
      loadTickets();
    }
  } catch(e) {
    showToast('Failed to update ticket status', 'error');
  }
};

window.sendTicketReply = async function() {
  const id = document.getElementById('tk-hidden-id').value;
  const replyInput = document.getElementById('tk-reply-text');
  const message = replyInput.value.trim();
  if (!id || !message) return;

  try {
    const res = await fetch(`${API}/tickets/${id}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: 'admin', message })
    });
    if (res.ok) {
      const updated = await res.json();
      renderTicketChat(updated.replies);
      replyInput.value = '';
      showToast('Reply sent successfully! ✉️✅', 'success');
      loadTickets();
    }
  } catch(e) {
    showToast('Failed to send reply', 'error');
  }
};

window.loadSupportSettings = async function() {
  try {
    const res = await fetch(`${API}/support-settings`);
    if (res.ok) {
      const settings = await res.json();
      document.getElementById('supp-email').value = settings.email;
      document.getElementById('supp-phone').value = settings.phone;
      document.getElementById('supp-website').value = settings.website;
      document.getElementById('supp-address').value = settings.address;
      document.getElementById('supp-hours').value = settings.workingHours;
    }
  } catch(e) {
    console.error('Failed to load support settings:', e);
  }
};

window.saveSupportSettings = async function() {
  const email = document.getElementById('supp-email').value;
  const phone = document.getElementById('supp-phone').value;
  const website = document.getElementById('supp-website').value;
  const address = document.getElementById('supp-address').value;
  const workingHours = document.getElementById('supp-hours').value;

  try {
    const res = await fetch(`${API}/support-settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, phone, website, address, workingHours })
    });
    if (res.ok) {
      showToast('Support Settings updated successfully! ⚙️🏆', 'success');
    }
  } catch(e) {
    showToast('Failed to save support settings', 'error');
  }
};

// ── Employee & Role Management Logic ──────────────────
window.loadEmployees = async function() {
  try {
    const res = await fetch(`${API}/employees`);
    if (res.ok) db.employees = await res.json();
    const resRoles = await fetch(`${API}/roles`);
    if (resRoles.ok) db.roles = await resRoles.json();
    const resDepts = await fetch(`${API}/departments`);
    if (resDepts.ok) db.departments = await resDepts.json();
  } catch(e) {
    console.error('Failed to load employees:', e);
  }
  renderEmployeesList();
  populateEmployeeDropdowns();
};

window.populateEmployeeDropdowns = function() {
  const roleSelect = document.getElementById('ae-role');
  const deptSelect = document.getElementById('ae-dept');
  const filterRole = document.getElementById('emp-filter-role');
  const filterDept = document.getElementById('emp-filter-dept');

  if (roleSelect && db.roles) {
    roleSelect.innerHTML = db.roles.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
    filterRole.innerHTML = '<option value="all">All Roles</option>' + db.roles.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
  }
  if (deptSelect && db.departments) {
    deptSelect.innerHTML = db.departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    filterDept.innerHTML = '<option value="all">All Departments</option>' + db.departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
  }
};

window.renderEmployeesList = function() {
  const tbody = document.getElementById('employees-tbody');
  if (!tbody) return;

  const employees = db.employees || [];
  tbody.innerHTML = employees.map(e => {
    const role = (db.roles || []).find(r => r.id === e.roleId)?.name || 'Staff';
    const dept = (db.departments || []).find(d => d.id === e.deptId)?.name || 'General';
    const statusClass = e.status === 'Active' ? 'badge-success' : (e.status === 'Inactive' ? 'badge-danger' : 'badge-warning');

    return `
      <tr>
        <td style="font-family:monospace; font-weight:700; color:var(--accent-bright)">${e.id}</td>
        <td>
          <div style="font-weight:700; color:#fff">${e.name}</div>
        </td>
        <td>${e.email}</td>
        <td style="font-weight:600">${role}</td>
        <td>${dept}</td>
        <td><span class="badge ${statusClass}">${e.status}</span></td>
        <td style="color:var(--text-muted)">${e.joinedAt}</td>
        <td>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-outline btn-sm" style="padding:4px 8px; font-size:0.75rem;" onclick="openEmployeeDetails('${e.id}')">👁️ View</button>
            <button class="btn btn-danger btn-sm" style="padding:4px 8px; font-size:0.75rem;" onclick="deleteEmployee('${e.id}')">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Update Stats
  document.getElementById('emp-stat-total').textContent = employees.length;
  document.getElementById('emp-stat-active').textContent = employees.filter(e => e.status === 'Active').length;
  document.getElementById('emp-stat-inactive').textContent = employees.filter(e => e.status === 'Inactive').length;
  document.getElementById('emp-stat-pending').textContent = employees.filter(e => e.status === 'Pending').length;
};

window.filterEmployeesList = function() {
  const search = document.getElementById('emp-search').value.toLowerCase();
  const roleFilter = document.getElementById('emp-filter-role').value;
  const deptFilter = document.getElementById('emp-filter-dept').value;

  const filtered = (db.employees || []).filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(search) || e.email.toLowerCase().includes(search) || e.id.toLowerCase().includes(search);
    const matchesRole = roleFilter === 'all' || e.roleId === roleFilter;
    const matchesDept = deptFilter === 'all' || e.deptId === deptFilter;
    return matchesSearch && matchesRole && matchesDept;
  });

  const tbody = document.getElementById('employees-tbody');
  if (!tbody) return;

  tbody.innerHTML = filtered.map(e => {
    const role = (db.roles || []).find(r => r.id === e.roleId)?.name || 'Staff';
    const dept = (db.departments || []).find(d => d.id === e.deptId)?.name || 'General';
    const statusClass = e.status === 'Active' ? 'badge-success' : (e.status === 'Inactive' ? 'badge-danger' : 'badge-warning');

    return `
      <tr>
        <td style="font-family:monospace; font-weight:700; color:var(--accent-bright)">${e.id}</td>
        <td>
          <div style="font-weight:700; color:#fff">${e.name}</div>
        </td>
        <td>${e.email}</td>
        <td style="font-weight:600">${role}</td>
        <td>${dept}</td>
        <td><span class="badge ${statusClass}">${e.status}</span></td>
        <td style="color:var(--text-muted)">${e.joinedAt}</td>
        <td>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-outline btn-sm" style="padding:4px 8px; font-size:0.75rem;" onclick="openEmployeeDetails('${e.id}')">👁️ View</button>
            <button class="btn btn-danger btn-sm" style="padding:4px 8px; font-size:0.75rem;" onclick="deleteEmployee('${e.id}')">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
};

window.openAddEmployeeModal = function() {
  document.getElementById('ae-fullname').value = '';
  document.getElementById('ae-email').value = '';
  document.getElementById('ae-phone').value = '+91 98765 43210';
  document.getElementById('ae-password').value = '';
  openModal('modal-add-employee');
};

window.saveEmployee = async function() {
  const name = document.getElementById('ae-fullname').value;
  const email = document.getElementById('ae-email').value;
  const phone = document.getElementById('ae-phone').value;
  const roleId = document.getElementById('ae-role').value;
  const deptId = document.getElementById('ae-dept').value;
  const status = document.getElementById('ae-status').value;

  if (!name || !email) return showToast('Please fill all fields', 'error');

  try {
    const res = await fetch(`${API}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, roleId, deptId, status })
    });
    if (res.ok) {
      showToast('Employee saved successfully! 👤💼', 'success');
      closeModal('modal-add-employee');
      loadEmployees();
    }
  } catch(e) {
    showToast('Failed to save employee', 'error');
  }
};

window.deleteEmployee = async function(id) {
  if (!confirm('Are you sure you want to remove this employee?')) return;
  try {
    const res = await fetch(`${API}/employees/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Employee deleted successfully', 'success');
      loadEmployees();
    }
  } catch(e) {
    showToast('Failed to delete employee', 'error');
  }
};

window.openEmployeeDetails = async function(id) {
  const emp = (db.employees || []).find(e => e.id === id);
  if (!emp) return;

  document.getElementById('ed-hidden-id').value = emp.id;
  document.getElementById('ed-fullname').textContent = emp.name;
  document.getElementById('ed-avatar').textContent = emp.name.charAt(0);
  
  const role = (db.roles || []).find(r => r.id === emp.roleId)?.name || 'Staff';
  const dept = (db.departments || []).find(d => d.id === emp.deptId)?.name || 'General';
  document.getElementById('ed-role-dept').textContent = `${role} · ${dept}`;
  
  const statusBadge = document.getElementById('ed-status');
  statusBadge.className = `badge ${emp.status === 'Active' ? 'badge-success' : (emp.status === 'Inactive' ? 'badge-danger' : 'badge-warning')}`;
  statusBadge.textContent = emp.status;

  document.getElementById('ed-btn-deactivate').textContent = emp.status === 'Active' ? 'Deactivate' : 'Activate';

  document.getElementById('ed-info-email').textContent = emp.email;
  document.getElementById('ed-info-phone').textContent = emp.phone;
  document.getElementById('ed-info-joined').textContent = emp.joinedAt;

  // Load permissions info
  const roleObj = (db.roles || []).find(r => r.id === emp.roleId);
  const permList = document.getElementById('ed-permissions-list');
  if (roleObj && roleObj.permissions) {
    const perms = [];
    if (roleObj.permissions.viewDash) perms.push('Dashboard View');
    if (roleObj.permissions.viewTickets) perms.push('Support view tickets');
    if (roleObj.permissions.replyTickets) perms.push('Support reply tickets');
    if (roleObj.permissions.deleteTickets) perms.push('Support delete tickets');
    if (roleObj.permissions.viewTournaments) perms.push('Tournaments view');
    if (roleObj.permissions.createTournaments) perms.push('Tournaments create');
    if (roleObj.permissions.editTournaments) perms.push('Tournaments edit');
    if (roleObj.permissions.viewUsers) perms.push('Users view');
    if (roleObj.permissions.editUsers) perms.push('Users edit');
    if (roleObj.permissions.deleteUsers) perms.push('Users delete');

    permList.innerHTML = perms.map(p => `
      <div style="background:var(--bg-elevated); padding:8px 12px; border-radius:6px; border:1px solid var(--border-light); font-size:0.8rem; color:#fff;">✅ ${p}</div>
    `).join('') || '<div style="color:var(--text-muted)">No permissions granted.</div>';
  } else {
    permList.innerHTML = '<div style="color:var(--text-muted)">No permissions granted.</div>';
  }

  // Load activities of this employee
  const activities = (db.employeeActivityLogs || []).filter(l => l.employee === emp.name);
  document.getElementById('ed-activity-tbody').innerHTML = activities.map(a => `
    <tr>
      <td style="font-weight:600; color:#fff;">${a.action}</td>
      <td>${a.desc}</td>
      <td style="color:var(--text-muted); font-size:0.75rem;">${a.time}</td>
    </tr>
  `).join('') || '<tr><td colspan="3" style="text-align:center; color:var(--text-muted);">No activity logs.</td></tr>';

  // Load tasks of this employee
  const tasks = (db.employeeTasks || []).filter(t => t.assignedTo === emp.name);
  document.getElementById('ed-tasks-tbody').innerHTML = tasks.map(t => `
    <tr>
      <td>${t.task}</td>
      <td>${t.dueDate}</td>
      <td><span class="badge ${t.status === 'Completed' ? 'badge-success' : (t.status === 'In Progress' ? 'badge-warning' : 'badge-pending')}">${t.status}</span></td>
    </tr>
  `).join('') || '<tr><td colspan="3" style="text-align:center; color:var(--text-muted);">No tasks assigned.</td></tr>';

  showEmployeeDetailTab('overview');
  openModal('modal-employee-details');
};

window.showEmployeeDetailTab = function(tab) {
  document.querySelectorAll('.ed-tab-content').forEach(c => c.style.display = 'none');
  document.querySelectorAll('#modal-employee-details .ftab').forEach(t => t.classList.remove('active'));
  
  document.getElementById(`ed-tab-${tab}`).style.display = 'block';
  document.getElementById(`ed-tab-btn-${tab}`).classList.add('active');
};

window.resetEmployeePassword = async function() {
  const id = document.getElementById('ed-hidden-id').value;
  try {
    const res = await fetch(`${API}/employees/${id}/reset-password`, { method: 'POST' });
    if (res.ok) {
      showToast('Password reset link sent to employee email! 📧🔐', 'success');
    }
  } catch(e) {
    showToast('Failed to reset password', 'error');
  }
};

window.toggleEmployeeStatus = async function() {
  const id = document.getElementById('ed-hidden-id').value;
  const emp = (db.employees || []).find(e => e.id === id);
  if (!emp) return;

  const newStatus = emp.status === 'Active' ? 'Inactive' : 'Active';
  try {
    const res = await fetch(`${API}/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      showToast(`Employee status updated to ${newStatus}!`, 'success');
      closeModal('modal-employee-details');
      loadEmployees();
    }
  } catch(e) {
    showToast('Failed to update status', 'error');
  }
};

// ── Roles & Permissions Logic ─────────────────────────
window.loadRoles = async function() {
  try {
    const res = await fetch(`${API}/roles`);
    if (res.ok) db.roles = await res.json();
  } catch(e) {
    console.error('Failed to load roles:', e);
  }
  renderRolesList();
};

window.renderRolesList = function() {
  const tbody = document.getElementById('roles-tbody');
  if (!tbody) return;

  tbody.innerHTML = (db.roles || []).map(r => `
    <tr>
      <td style="font-weight:700; color:#fff;">${r.name}</td>
      <td>${r.desc}</td>
      <td>
        <span style="font-family:monospace; font-weight:700; color:var(--accent-bright); background:rgba(124,58,237,0.1); padding:2px 8px; border-radius:4px;">${r.employees} Active</span>
      </td>
      <td><span class="badge ${r.status === 'Active' ? 'badge-success' : 'badge-danger'}">${r.status}</span></td>
      <td>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-outline btn-sm" style="padding:4px 8px; font-size:0.75rem;" onclick="openEditRoleModal('${r.id}')">⚙️ Edit</button>
          <button class="btn btn-danger btn-sm" style="padding:4px 8px; font-size:0.75rem;" onclick="deleteRole('${r.id}')">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
};

window.openAddRoleModal = function() {
  document.getElementById('ar-hidden-id').value = '';
  document.getElementById('ar-name').value = '';
  document.getElementById('ar-desc').value = '';
  document.querySelectorAll('#modal-add-role input[type="checkbox"]').forEach(c => c.checked = false);
  openModal('modal-add-role');
};

window.openEditRoleModal = function(id) {
  const role = (db.roles || []).find(r => r.id === id);
  if (!role) return;

  document.getElementById('ar-hidden-id').value = role.id;
  document.getElementById('ar-name').value = role.name;
  document.getElementById('ar-desc').value = role.desc;

  const perms = role.permissions || {};
  document.getElementById('perm-view-dash').checked = !!perms.viewDash;
  document.getElementById('perm-view-tickets').checked = !!perms.viewTickets;
  document.getElementById('perm-reply-tickets').checked = !!perms.replyTickets;
  document.getElementById('perm-delete-tickets').checked = !!perms.deleteTickets;
  document.getElementById('perm-view-tournaments').checked = !!perms.viewTournaments;
  document.getElementById('perm-create-tournaments').checked = !!perms.createTournaments;
  document.getElementById('perm-edit-tournaments').checked = !!perms.editTournaments;
  document.getElementById('perm-view-users').checked = !!perms.viewUsers;
  document.getElementById('perm-edit-users').checked = !!perms.editUsers;
  document.getElementById('perm-delete-users').checked = !!perms.deleteUsers;

  openModal('modal-add-role');
};

window.saveRolePermissions = async function() {
  const id = document.getElementById('ar-hidden-id').value;
  const name = document.getElementById('ar-name').value;
  const desc = document.getElementById('ar-desc').value;

  if (!name) return showToast('Please enter role name', 'error');

  const permissions = {
    viewDash: document.getElementById('perm-view-dash').checked,
    viewTickets: document.getElementById('perm-view-tickets').checked,
    replyTickets: document.getElementById('perm-reply-tickets').checked,
    deleteTickets: document.getElementById('perm-delete-tickets').checked,
    viewTournaments: document.getElementById('perm-view-tournaments').checked,
    createTournaments: document.getElementById('perm-create-tournaments').checked,
    editTournaments: document.getElementById('perm-edit-tournaments').checked,
    viewUsers: document.getElementById('perm-view-users').checked,
    editUsers: document.getElementById('perm-edit-users').checked,
    deleteUsers: document.getElementById('perm-delete-users').checked
  };

  try {
    const url = id ? `${API}/roles/${id}` : `${API}/roles`;
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, desc, permissions })
    });
    if (res.ok) {
      showToast('Role permissions saved successfully! ⚙️🔑', 'success');
      closeModal('modal-add-role');
      loadRoles();
    }
  } catch(e) {
    showToast('Failed to save role', 'error');
  }
};

window.deleteRole = async function(id) {
  if (!confirm('Are you sure you want to delete this role?')) return;
  try {
    const res = await fetch(`${API}/roles/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Role deleted successfully', 'success');
      loadRoles();
    }
  } catch(e) {
    showToast('Failed to delete role', 'error');
  }
};

// ── Activity Logs Logic ───────────────────────────────
window.loadActivityLogs = async function() {
  try {
    const res = await fetch(`${API}/employee-activity-logs`);
    if (res.ok) db.employeeActivityLogs = await res.json();
  } catch(e) {
    console.error('Failed to load activity logs:', e);
  }
  renderActivityLogsList();
};

window.renderActivityLogsList = function() {
  const tbody = document.getElementById('activity-logs-tbody');
  if (!tbody) return;

  tbody.innerHTML = (db.employeeActivityLogs || []).map(a => `
    <tr>
      <td style="font-family:monospace; font-weight:700; color:var(--accent-bright)">${a.id}</td>
      <td style="font-weight:700; color:#fff;">${a.employee}</td>
      <td style="font-weight:600">${a.action}</td>
      <td>${a.desc}</td>
      <td style="color:var(--text-muted)">${a.time}</td>
    </tr>
  `).join('');
};

// ── Tasks Assigned Logic ──────────────────────────────
window.loadEmployeeTasks = async function() {
  try {
    const res = await fetch(`${API}/employee-tasks`);
    if (res.ok) db.employeeTasks = await res.json();
  } catch(e) {
    console.error('Failed to load employee tasks:', e);
  }
  renderEmployeeTasksList();
};

window.renderEmployeeTasksList = function() {
  const tbody = document.getElementById('employee-tasks-tbody');
  if (!tbody) return;

  tbody.innerHTML = (db.employeeTasks || []).map(t => {
    return `
      <tr>
        <td style="font-weight:700; color:#fff;">${t.task}</td>
        <td style="font-weight:600">${t.assignedTo}</td>
        <td>${t.dueDate}</td>
        <td>
          <select onchange="updateTaskStatus('${t.id}', this.value)" style="background:var(--bg-elevated); border:1px solid var(--border-light); color:#fff; padding:2px 8px; border-radius:4px; font-weight:600; font-size:0.75rem; cursor:pointer;">
            <option value="Pending" ${t.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="In Progress" ${t.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Completed" ${t.status === 'Completed' ? 'selected' : ''}>Completed</option>
          </select>
        </td>
        <td>
          <button class="btn btn-danger btn-sm" style="padding:4px 8px; font-size:0.75rem;" onclick="deleteTask('${t.id}')">🗑️ Delete</button>
        </td>
      </tr>
    `;
  }).join('');
};

window.openAssignTaskModal = function() {
  document.getElementById('at-desc').value = '';
  
  // Populate staff dropdown
  const assigneeSelect = document.getElementById('at-assignee');
  if (assigneeSelect && db.employees) {
    assigneeSelect.innerHTML = db.employees.map(e => `<option value="${e.name}">${e.name}</option>`).join('');
  }
  
  openModal('modal-assign-task');
};

window.saveTaskAssignment = async function() {
  const task = document.getElementById('at-desc').value;
  const assignedTo = document.getElementById('at-assignee').value;
  const dueDateVal = document.getElementById('at-due-date').value;

  if (!task) return showToast('Please enter task description', 'error');

  const formattedDate = new Date(dueDateVal).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  try {
    const res = await fetch(`${API}/employee-tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, assignedTo, dueDate: formattedDate })
    });
    if (res.ok) {
      showToast('Task assigned successfully! 📝📋', 'success');
      closeModal('modal-assign-task');
      loadEmployeeTasks();
    }
  } catch(e) {
    showToast('Failed to assign task', 'error');
  }
};

window.updateTaskStatus = async function(id, newStatus) {
  try {
    const res = await fetch(`${API}/employee-tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      showToast('Task status updated!', 'success');
      loadEmployeeTasks();
    }
  } catch(e) {
    showToast('Failed to update status', 'error');
  }
};

window.deleteTask = async function(id) {
  if (!confirm('Are you sure you want to delete this task?')) return;
  try {
    const res = await fetch(`${API}/employee-tasks/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Task deleted successfully', 'success');
      loadEmployeeTasks();
    }
  } catch(e) {
    showToast('Failed to delete task', 'error');
  }
};

// ── Departments Logic ─────────────────────────────────
window.loadDepartments = async function() {
  try {
    const res = await fetch(`${API}/departments`);
    if (res.ok) db.departments = await res.json();
  } catch(e) {
    console.error('Failed to load departments:', e);
  }
  renderDepartmentsList();
};

window.renderDepartmentsList = function() {
  const tbody = document.getElementById('departments-tbody');
  if (!tbody) return;

  tbody.innerHTML = (db.departments || []).map(d => {
    const count = (db.employees || []).filter(e => e.deptId === d.id).length;
    
    return `
      <tr>
        <td style="font-weight:700; color:#fff;">${d.name}</td>
        <td>
          <span style="font-family:monospace; font-weight:700; color:var(--accent-bright); background:rgba(124,58,237,0.1); padding:2px 8px; border-radius:4px;">${count} Employees</span>
        </td>
        <td><span class="badge ${d.status === 'Active' ? 'badge-success' : 'badge-danger'}">${d.status}</span></td>
        <td>
          <button class="btn btn-danger btn-sm" style="padding:4px 8px; font-size:0.75rem;" onclick="deleteDepartment('${d.id}')">🗑️ Delete</button>
        </td>
      </tr>
    `;
  }).join('');
};

window.openAddDepartmentModal = function() {
  document.getElementById('ad-name').value = '';
  openModal('modal-add-department');
};

window.saveDepartment = async function() {
  const name = document.getElementById('ad-name').value;
  const status = document.getElementById('ad-status').value;

  if (!name) return showToast('Please enter department name', 'error');

  try {
    const res = await fetch(`${API}/departments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, status })
    });
    if (res.ok) {
      showToast('Department added successfully! 🏢⚙️', 'success');
      closeModal('modal-add-department');
      loadDepartments();
    }
  } catch(e) {
    showToast('Failed to add department', 'error');
  }
};

window.deleteDepartment = async function(id) {
  if (!confirm('Are you sure you want to delete this department?')) return;
  try {
    const res = await fetch(`${API}/departments/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Department deleted successfully', 'success');
      loadDepartments();
    }
  } catch(e) {
    showToast('Failed to delete department', 'error');
  }
};

// ── Employee Settings Logic ───────────────────────────
window.loadEmployeeSettings = async function() {
  try {
    const res = await fetch(`${API}/employee-settings`);
    if (res.ok) {
      db.employeeSettings = await res.json();
      renderEmployeeSettings();
    }
  } catch(e) {
    console.error('Failed to load employee settings:', e);
  }
};

window.renderEmployeeSettings = function() {
  const s = db.employeeSettings;
  if (!s) return;

  document.getElementById('es-enable-module').checked = !!s.enableModule;
  document.getElementById('es-allow-signup').checked = !!s.allowSignup;
  document.getElementById('es-require-approval').checked = !!s.requireApproval;
  document.getElementById('es-allow-member-view').checked = !!s.allowMemberView;
  document.getElementById('es-allow-profile-edit').checked = !!s.allowProfileEdit;
  document.getElementById('es-allow-password-change').checked = !!s.allowPasswordChange;
};

window.saveEmployeeSettings = async function() {
  const enableModule = document.getElementById('es-enable-module').checked;
  const allowSignup = document.getElementById('es-allow-signup').checked;
  const requireApproval = document.getElementById('es-require-approval').checked;
  const allowMemberView = document.getElementById('es-allow-member-view').checked;
  const allowProfileEdit = document.getElementById('es-allow-profile-edit').checked;
  const allowPasswordChange = document.getElementById('es-allow-password-change').checked;

  try {
    const res = await fetch(`${API}/employee-settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enableModule, allowSignup, requireApproval, allowMemberView, allowProfileEdit, allowPasswordChange })
    });
    if (res.ok) {
      showToast('Employee settings updated successfully! ⚙️🏆', 'success');
    }
  } catch(e) {
    showToast('Failed to update employee settings', 'error');
  }
};

// ────────────────────────────────────────────────────
// KYC MANAGEMENT CONTROLLERS
// ────────────────────────────────────────────────────
let currentKycFilter = 'all';

window.filterKyc = function(status, btn) {
  currentKycFilter = status;
  document.querySelectorAll('#kyc-filter-tabs .ftab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderKycList();
};

window.renderKycList = function() {
  const container = document.getElementById('kyc-table-body');
  if (!container) return;
  
  const users = db.users || [];
  
  const totalReqs = users.filter(u => u.kycStatus && u.kycStatus !== 'unverified');
  const pending = users.filter(u => u.kycStatus === 'pending');
  const approved = users.filter(u => u.kycStatus === 'approved');
  const rejected = users.filter(u => u.kycStatus === 'rejected');
  
  document.getElementById('kyc-stat-total').textContent = totalReqs.length;
  document.getElementById('kyc-stat-pending').textContent = pending.length;
  document.getElementById('kyc-stat-approved').textContent = approved.length;
  document.getElementById('kyc-stat-rejected').textContent = rejected.length;
  
  let filtered = totalReqs;
  if (currentKycFilter === 'pending') filtered = pending;
  else if (currentKycFilter === 'approved') filtered = approved;
  else if (currentKycFilter === 'rejected') filtered = rejected;
  
  if (filtered.length === 0) {
    container.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text-muted);">No KYC requests found</td></tr>';
    return;
  }
  
  container.innerHTML = filtered.map(user => {
    const kycDetails = user.kycDetails || {};
    const dateStr = kycDetails.submittedAt || user.createdAt || 'N/A';
    
    let statusClass = 'badge-warning';
    if (user.kycStatus === 'approved') statusClass = 'badge-success';
    else if (user.kycStatus === 'rejected') statusClass = 'badge-danger';
    
    return `
      <tr>
        <td style="font-weight:700; color:#3b82f6;">${user.id}</td>
        <td>${kycDetails.fullName || user.name}</td>
        <td>${kycDetails.phone || user.phone || 'N/A'}</td>
        <td>${dateStr}</td>
        <td><span class="badge ${statusClass}">${user.kycStatus.toUpperCase()}</span></td>
        <td>
          <button class="btn btn-ghost btn-sm" style="color:#7c3aed; font-weight:700;" onclick="viewKycDetails('${user.id}')">View</button>
        </td>
      </tr>
    `;
  }).join('');
};

window.viewKycDetails = function(userId) {
  const user = db.users.find(u => u.id === userId);
  if (!user) return;
  
  document.getElementById('kd-hidden-userid').value = user.id;
  document.getElementById('kd-userid').textContent = user.id;
  document.getElementById('kd-name').textContent = user.kycDetails?.fullName || user.name || 'N/A';
  document.getElementById('kd-mobile').textContent = user.kycDetails?.phone || user.phone || 'N/A';
  document.getElementById('kd-email').textContent = user.email || 'N/A';
  document.getElementById('kd-date').textContent = user.kycDetails?.submittedAt || 'N/A';
  
  const statusEl = document.getElementById('kd-status');
  statusEl.className = 'badge';
  if (user.kycStatus === 'approved') {
    statusEl.classList.add('badge-success');
    statusEl.textContent = 'Approved';
  } else if (user.kycStatus === 'rejected') {
    statusEl.classList.add('badge-danger');
    statusEl.textContent = 'Rejected';
  } else {
    statusEl.classList.add('badge-warning');
    statusEl.textContent = 'Pending';
  }
  
  const panImg = document.getElementById('kd-pan-img');
  const panLink = document.getElementById('kd-pan-link');
  const selfieImg = document.getElementById('kd-selfie-img');
  const selfieLink = document.getElementById('kd-selfie-link');
  
  if (user.kycDetails?.panCardImg) {
    panImg.src = user.kycDetails.panCardImg;
    panLink.href = user.kycDetails.panCardImg;
    panLink.style.display = 'block';
  } else {
    panImg.src = '';
    panLink.style.display = 'none';
  }
  
  if (user.kycDetails?.selfieImg) {
    selfieImg.src = user.kycDetails.selfieImg;
    selfieLink.href = user.kycDetails.selfieImg;
    selfieLink.style.display = 'block';
  } else {
    selfieImg.src = '';
    selfieLink.style.display = 'none';
  }
  
  const actionBtns = document.getElementById('kd-action-buttons');
  if (user.kycStatus === 'pending') {
    actionBtns.style.display = 'flex';
  } else {
    actionBtns.style.display = 'none';
  }
  
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-kyc-details').classList.add('active');
};

window.openKycApproveDialog = function() {
  const userId = document.getElementById('kd-hidden-userid').value;
  const user = db.users.find(u => u.id === userId);
  if (!user) return;
  
  document.getElementById('mka-userid').textContent = user.id;
  document.getElementById('mka-username').textContent = user.name;
  document.getElementById('mka-note').value = 'KYC documents verified and approved.';
  
  openModal('modal-kyc-approve');
};

window.openKycRejectDialog = function() {
  const userId = document.getElementById('kd-hidden-userid').value;
  const user = db.users.find(u => u.id === userId);
  if (!user) return;
  
  document.getElementById('mkr-userid').textContent = user.id;
  document.getElementById('mkr-username').textContent = user.name;
  document.getElementById('mkr-note').value = '';
  
  openModal('modal-kyc-reject');
};

window.submitKycApprove = async function() {
  const userId = document.getElementById('kd-hidden-userid').value;
  const note = document.getElementById('mka-note').value.trim();
  const user = db.users.find(u => u.id === userId);
  if (!user) return;
  
  const mergedDetails = { ...(user.kycDetails || {}), note: note || 'Approved' };
  
  try {
    const res = await fetch(`${API}/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kycStatus: 'approved',
        kycDetails: mergedDetails
      })
    });
    if (res.ok) {
      closeModal('modal-kyc-approve');
      
      document.getElementById('mks-userid').textContent = userId;
      document.getElementById('mks-username').textContent = user.name;
      document.getElementById('mks-title').textContent = 'KYC Approved';
      document.getElementById('mks-desc').textContent = 'KYC has been approved successfully! The user has been notified and can now withdraw their winnings.';
      
      openModal('modal-kyc-success');
      loadAllData();
    } else {
      showToast('Failed to approve KYC', 'error');
    }
  } catch (err) {
    showToast('Error connecting to server', 'error');
  }
};

window.submitKycReject = async function() {
  const userId = document.getElementById('kd-hidden-userid').value;
  const note = document.getElementById('mkr-note').value.trim();
  const user = db.users.find(u => u.id === userId);
  if (!user) return;
  
  if (!note) {
    showToast('Please enter the rejection reason', 'error');
    return;
  }
  
  const mergedDetails = { ...(user.kycDetails || {}), note: note };
  
  try {
    const res = await fetch(`${API}/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kycStatus: 'rejected',
        kycDetails: mergedDetails
      })
    });
    if (res.ok) {
      closeModal('modal-kyc-reject');
      
      document.getElementById('mks-userid').textContent = userId;
      document.getElementById('mks-username').textContent = user.name;
      document.getElementById('mks-title').textContent = 'KYC Rejected';
      document.getElementById('mks-desc').textContent = 'KYC has been rejected. The user has been notified of the rejection reason.';
      
      openModal('modal-kyc-success');
      loadAllData();
    } else {
      showToast('Failed to reject KYC', 'error');
    }
  } catch (err) {
    showToast('Error connecting to server', 'error');
  }
};

window.closeKycSuccessModal = function() {
  closeModal('modal-kyc-success');
  showPage('kyc', document.getElementById('nav-kyc'));
};

// =====================================================
// PREDICTIONS MODULE CONTROLLERS (ADMIN)
// =====================================================
window.loadAdminPredictions = async function() {
  try {
    const mRes = await fetch(`${API}/predictions/matches`);
    if (mRes.ok) db.predictionMatches = await mRes.json();

    const pRes = await fetch(`${API}/predictions/predictions`);
    if (pRes.ok) db.userPredictions = await pRes.json();

    const sRes = await fetch(`${API}/predictions/settings`);
    if (sRes.ok) db.predictionSettings = await sRes.json();

    renderAdminPredictionsDashboard();
    renderAdminPredictionsMatches();
    renderAdminPredictionsLeaderboard();
  } catch(e) {
    console.error('Failed to load predictions admin data:', e);
  }
};

function renderAdminPredictionsDashboard() {
  const matches = db.predictionMatches || [];
  const preds = db.userPredictions || [];

  const activeMatches = matches.filter(m => m.status === 'live' || m.status === 'upcoming');
  const completedMatches = matches.filter(m => m.status === 'completed');

  const totalActivePool = activeMatches.reduce((acc, m) => acc + (m.prizePool || 0), 0);
  const totalDistributedPool = completedMatches.reduce((acc, m) => acc + (m.prizePool || 0), 0);

  // Quick stats panel
  const uniquePlayers = [...new Set(preds.map(p => p.userId))].length;
  const totalVolume = preds.reduce((s, p) => s + (p.stake || 0), 0);
  const totalCommission = preds.reduce((s, p) => s + (p.commissionDeducted || 0), 0);
  const qsPlayers = document.getElementById('qs-pred-players');
  const qsComm = document.getElementById('qs-pred-commission');
  const qsVol = document.getElementById('qs-pred-volume');
  if (qsPlayers) qsPlayers.textContent = uniquePlayers;
  if (qsComm) qsComm.textContent = `₹${totalCommission.toLocaleString('en-IN')}`;
  if (qsVol) qsVol.textContent = `₹${totalVolume.toLocaleString('en-IN')}`;

  // Fetch dynamic finance statistics for money system overview widgets
  fetch(`${API}/predictions/finance-stats`)
    .then(res => {
      if (res.ok) return res.json();
    })
    .then(f => {
      if (f) {
        document.getElementById('ms-total-entry-fee').textContent = `₹${f.totalEntryFees.toLocaleString('en-IN')}`;
        document.getElementById('ms-total-commission').textContent = `₹${f.totalCommission.toLocaleString('en-IN')}`;
        document.getElementById('ms-total-withdrawn').textContent = `₹${f.totalWithdrawn.toLocaleString('en-IN')}`;
        document.getElementById('ms-total-pending').textContent = `₹${f.totalPending.toLocaleString('en-IN')}`;
        document.getElementById('ms-total-balance').textContent = `₹${f.totalPlatformBalance.toLocaleString('en-IN')}`;
      }
    })
    .catch(err => console.error('Failed to fetch finance stats:', err));
}

let adminPredFilter = 'all';
window.filterAdminPredictionMatches = function(status, btn) {
  adminPredFilter = status;
  document.querySelectorAll('#page-predictions .ftab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderAdminPredictionsMatches();
};

window.deleteAdminPredMatch = async function(id) {
  if (!confirm('Delete this prediction match? This cannot be undone.')) return;
  try {
    const res = await fetch(`${API}/predictions/matches/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Match deleted.', 'success');
      loadAdminPredictions();
    } else {
      showToast('Failed to delete match.', 'error');
    }
  } catch(e) {
    showToast('Network error.', 'error');
  }
};

window.renderAdminPredictionsMatches = function() {
  // Keep tbody hidden for legacy compat
  const grid = document.getElementById('admin-pred-matches-grid');
  if (!grid) return;

  const matches = db.predictionMatches || [];
  const list = adminPredFilter === 'all' ? matches : matches.filter(m => m.status === adminPredFilter);

  if (list.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:48px; color:var(--text-muted);">
        <div style="font-size:2.5rem; margin-bottom:12px;">🔮</div>
        <div style="font-size:0.9rem; font-weight:700;">No prediction matches found.</div>
        <div style="font-size:0.75rem; margin-top:6px; opacity:0.6;">Click "Add Match" to create one.</div>
      </div>`;
    return;
  }

  grid.innerHTML = list.map(m => {
    const isLive = m.status === 'live';
    const isCompleted = m.status === 'completed';
    const isUpcoming = m.status === 'upcoming';

    // Status badge
    let statusBadge = '';
    if (isLive) {
      statusBadge = `<span style="display:inline-flex; align-items:center; gap:4px; background:rgba(239,68,68,0.15); color:#ef4444; border:1px solid rgba(239,68,68,0.3); font-size:0.6rem; font-weight:900; padding:3px 8px; border-radius:30px; text-transform:uppercase; letter-spacing:0.5px;">
        <span style="width:5px; height:5px; background:#ef4444; border-radius:50%; animation:pulse 1s infinite;"></span> LIVE
      </span>`;
    } else if (isCompleted) {
      statusBadge = `<span style="background:rgba(16,185,129,0.15); color:#10b981; border:1px solid rgba(16,185,129,0.3); font-size:0.6rem; font-weight:900; padding:3px 8px; border-radius:30px; text-transform:uppercase; letter-spacing:0.5px;">✓ Completed</span>`;
    } else {
      statusBadge = `<span style="background:rgba(59,130,246,0.15); color:#3b82f6; border:1px solid rgba(59,130,246,0.3); font-size:0.6rem; font-weight:900; padding:3px 8px; border-radius:30px; text-transform:uppercase; letter-spacing:0.5px;">⏳ Upcoming</span>`;
    }

    // Game badge
    const gameBadge = `<span style="background:rgba(124,58,237,0.15); color:#a78bfa; border:1px solid rgba(124,58,237,0.3); font-size:0.6rem; font-weight:800; padding:2px 8px; border-radius:20px;">${m.game || 'BGMI'}</span>`;

    // Win probability bars
    const t1p = m.team1?.winProbability || 50;
    const t2p = m.team2?.winProbability || (100 - t1p);

    // Total stakes from bets
    const matchBets = (db.userPredictions || []).filter(p => p.matchId === m.id);
    const totalStake = matchBets.reduce((s, p) => s + (p.stake || 0), 0);
    const t1Stake = matchBets.filter(p => p.selection === m.team1?.name).reduce((s, p) => s + (p.stake || 0), 0);
    const t2Stake = matchBets.filter(p => p.selection === m.team2?.name).reduce((s, p) => s + (p.stake || 0), 0);

    // Action buttons
    let actionsHTML = '';
    if (!isCompleted) {
      actionsHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:10px;">
          <button onclick="event.stopPropagation(); openMarketManagerModal('${m.id}')" style="background:rgba(99,102,241,0.15); color:#818cf8; border:1px solid rgba(99,102,241,0.3); border-radius:8px; padding:8px 4px; font-size:0.68rem; font-weight:700; cursor:pointer;">⚙️ Markets</button>
          <button onclick="event.stopPropagation(); openDeclareWinnerModal('${m.id}')" style="background:rgba(234,179,8,0.15); color:#eab308; border:1px solid rgba(234,179,8,0.3); border-radius:8px; padding:8px 4px; font-size:0.68rem; font-weight:700; cursor:pointer;">🏆 Declare</button>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:6px;">
          <button onclick="event.stopPropagation(); openEditPredictionMatchModal('${m.id}')" style="background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.6); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:6px 4px; font-size:0.66rem; font-weight:700; cursor:pointer;">✏️ Edit</button>
          <button onclick="event.stopPropagation(); deleteAdminPredMatch('${m.id}')" style="background:rgba(239,68,68,0.08); color:#ef4444; border:1px solid rgba(239,68,68,0.2); border-radius:8px; padding:6px 4px; font-size:0.66rem; font-weight:700; cursor:pointer;">🗑 Delete</button>
        </div>`;
    } else {
      actionsHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:10px;">
          <button onclick="event.stopPropagation(); openMarketManagerModal('${m.id}')" style="background:rgba(16,185,129,0.12); color:#10b981; border:1px solid rgba(16,185,129,0.25); border-radius:8px; padding:8px 4px; font-size:0.68rem; font-weight:700; cursor:pointer;">📊 View Markets</button>
          <button onclick="event.stopPropagation(); deleteAdminPredMatch('${m.id}')" style="background:rgba(239,68,68,0.08); color:#ef4444; border:1px solid rgba(239,68,68,0.2); border-radius:8px; padding:8px 4px; font-size:0.66rem; font-weight:700; cursor:pointer;">🗑 Delete</button>
        </div>`;
    }

    return `
      <div style="background:linear-gradient(135deg, rgba(255,255,255,0.015) 0%, rgba(255,255,255,0.035) 100%); border:1px solid ${isLive ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.07)'}; border-radius:16px; padding:16px; position:relative; overflow:hidden; transition:border-color 0.2s;">
        ${isLive ? `<div style="position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg, #ef4444, #f97316);"></div>` : ''}
        
        <!-- Top Bar -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div style="display:flex; align-items:center; gap:6px;">
            ${gameBadge}
            <span style="font-size:0.65rem; color:var(--text-muted); font-weight:600;">${m.gameDetails || ''}</span>
          </div>
          ${statusBadge}
        </div>

        <!-- Match Title -->
        <div style="font-size:0.85rem; font-weight:800; color:#fff; margin-bottom:14px; line-height:1.2;">${m.title}</div>

        <!-- Team Matchup -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin:14px 0;">
          <!-- Team 1 -->
          <div style="display:flex; flex-direction:column; align-items:center; width:38%;">
            <img src="${m.team1?.logo || 'assets/valorant_thumb.jpg'}" style="width:52px; height:52px; border-radius:50%; object-fit:cover; border:2px solid rgba(255,255,255,0.07); box-shadow:0 4px 12px rgba(0,0,0,0.4);" onerror="this.src='assets/valorant_thumb.jpg'"/>
            <div style="font-size:0.78rem; font-weight:800; color:#fff; margin-top:6px; text-align:center; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; width:100%;">${m.team1?.name || 'Team 1'}</div>
            <div style="font-size:0.6rem; color:rgba(255,255,255,0.35); font-weight:600;">${t1p}% win</div>
          </div>

          <!-- VS -->
          <div style="display:flex; flex-direction:column; align-items:center; gap:2px;">
            <div style="font-size:1.1rem; font-weight:900; color:rgba(255,255,255,0.2); letter-spacing:1px;">VS</div>
            <div style="font-size:0.6rem; color:var(--text-muted); font-weight:600;">${m.closeTime}</div>
          </div>

          <!-- Team 2 -->
          <div style="display:flex; flex-direction:column; align-items:center; width:38%;">
            <img src="${m.team2?.logo || 'assets/valorant_thumb.jpg'}" style="width:52px; height:52px; border-radius:50%; object-fit:cover; border:2px solid rgba(255,255,255,0.07); box-shadow:0 4px 12px rgba(0,0,0,0.4);" onerror="this.src='assets/valorant_thumb.jpg'"/>
            <div style="font-size:0.78rem; font-weight:800; color:#fff; margin-top:6px; text-align:center; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; width:100%;">${m.team2?.name || 'Team 2'}</div>
            <div style="font-size:0.6rem; color:rgba(255,255,255,0.35); font-weight:600;">${t2p}% win</div>
          </div>
        </div>

        <!-- Stats Row -->
        <div style="border-top:1px solid rgba(255,255,255,0.05); padding-top:12px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-bottom:4px;">
          <div style="text-align:center;">
            <div style="font-size:0.6rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Prize Pool</div>
            <div style="font-size:0.82rem; font-weight:900; color:#10b981; margin-top:2px;">₹${(m.prizePool || 0).toLocaleString('en-IN')}</div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:0.6rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Total Bets</div>
            <div style="font-size:0.82rem; font-weight:900; color:#fff; margin-top:2px;">₹${totalStake.toLocaleString('en-IN')}</div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:0.6rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Players</div>
            <div style="font-size:0.82rem; font-weight:900; color:#fff; margin-top:2px;">${matchBets.length}</div>
          </div>
        </div>

        <!-- Team Stake Split Bar -->
        ${totalStake > 0 ? `
          <div style="margin:10px 0 4px; position:relative; height:4px; background:rgba(255,255,255,0.06); border-radius:4px; overflow:hidden;">
            <div style="position:absolute; left:0; top:0; height:100%; width:${Math.round(t1Stake/totalStake*100)}%; background:linear-gradient(90deg, #10b981, #3b82f6); border-radius:4px;"></div>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:0.58rem; color:rgba(255,255,255,0.35);">
            <span>${m.team1?.name}: ₹${t1Stake.toLocaleString('en-IN')}</span>
            <span>₹${t2Stake.toLocaleString('en-IN')} :${m.team2?.name}</span>
          </div>` : ''}

        <!-- Action Buttons -->
        ${actionsHTML}
      </div>
    `;
  }).join('');
};

window.openAddPredictionMatchModal = function() {
  document.getElementById('modal-pm-title').textContent = 'Add Prediction Match';
  document.getElementById('pm-id').value = '';
  document.getElementById('pm-title').value = '';
  document.getElementById('pm-game').value = 'BGMI';
  document.getElementById('pm-t1-name').value = '';
  document.getElementById('pm-t2-name').value = '';
  document.getElementById('pm-t1-logo-file').value = '';
  document.getElementById('pm-t1-logo-base64').value = '';
  document.getElementById('pm-t2-logo-file').value = '';
  document.getElementById('pm-t2-logo-base64').value = '';
  document.getElementById('pm-t1-prob').value = '50';
  document.getElementById('pm-t2-prob').value = '50';
  document.getElementById('pm-prize').value = '';
  document.getElementById('pm-entry-fee').value = '25';
  document.getElementById('pm-date').value = '';
  document.getElementById('pm-time').value = '';
  document.getElementById('pm-close-time').value = '';
  document.getElementById('pm-details').value = '';
  document.getElementById('pm-status').value = 'upcoming';

  openModal('modal-prediction-match');
};

window.openEditPredictionMatchModal = function(id) {
  const m = (db.predictionMatches || []).find(match => match.id === id);
  if (!m) return;

  document.getElementById('modal-pm-title').textContent = 'Edit Prediction Match';
  document.getElementById('pm-id').value = m.id;
  document.getElementById('pm-title').value = m.title;
  document.getElementById('pm-game').value = m.game;
  document.getElementById('pm-t1-name').value = m.team1.name;
  document.getElementById('pm-t2-name').value = m.team2.name;
  document.getElementById('pm-t1-logo-base64').value = m.team1.logo || '';
  document.getElementById('pm-t1-logo-file').value = '';
  document.getElementById('pm-t2-logo-base64').value = m.team2.logo || '';
  document.getElementById('pm-t2-logo-file').value = '';
  document.getElementById('pm-t1-prob').value = m.team1.winProbability;
  document.getElementById('pm-t2-prob').value = m.team2.winProbability;
  document.getElementById('pm-prize').value = m.prizePool;
  document.getElementById('pm-entry-fee').value = m.entryFee !== undefined ? m.entryFee : 25;
  document.getElementById('pm-date').value = m.date;
  document.getElementById('pm-time').value = m.time;
  document.getElementById('pm-close-time').value = m.closeTime;
  document.getElementById('pm-details').value = m.gameDetails;
  document.getElementById('pm-status').value = m.status;

  openModal('modal-prediction-match');
};

window.savePredictionMatch = async function() {
  const id = document.getElementById('pm-id').value;
  
  const matchData = {
    title: document.getElementById('pm-title').value.trim(),
    game: document.getElementById('pm-game').value,
    team1: {
      name: document.getElementById('pm-t1-name').value.trim(),
      logo: document.getElementById('pm-t1-logo-base64').value || 'assets/valorant_thumb.jpg',
      winProbability: parseInt(document.getElementById('pm-t1-prob').value) || 50
    },
    team2: {
      name: document.getElementById('pm-t2-name').value.trim(),
      logo: document.getElementById('pm-t2-logo-base64').value || 'assets/valorant_thumb.jpg',
      winProbability: parseInt(document.getElementById('pm-t2-prob').value) || 50
    },
    prizePool: Number(document.getElementById('pm-prize').value) || 0,
    entryFee: Number(document.getElementById('pm-entry-fee').value) || 25,
    date: document.getElementById('pm-date').value.trim(),
    time: document.getElementById('pm-time').value.trim(),
    closeTime: document.getElementById('pm-close-time').value.trim(),
    gameDetails: document.getElementById('pm-details').value.trim(),
    status: document.getElementById('pm-status').value
  };

  if (!matchData.title || !matchData.team1.name || !matchData.team2.name || !matchData.closeTime) {
    showToast('Please fill all required fields!', 'error');
    return;
  }

  const url = id ? `${API}/predictions/matches/${id}` : `${API}/predictions/matches`;
  const method = id ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(matchData)
    });

    if (res.ok) {
      showToast(id ? 'Prediction Match updated successfully! 🎮' : 'Prediction Match created successfully! 🎮', 'success');
      closeModal('modal-prediction-match');
      loadAdminPredictions();
    } else {
      showToast('Failed to save prediction match.', 'error');
    }
  } catch(e) {
    console.error('Failed to save match:', e);
    showToast('Network error while saving match.', 'error');
  }
};

window.openDeclareWinnerModal = async function(id) {
  const m = (db.predictionMatches || []).find(match => match.id === id);
  if (!m) return;

  document.getElementById('pw-match-id').value = m.id;

  const statsContainer = document.getElementById('pw-match-stats');
  if (statsContainer) {
    statsContainer.innerHTML = `<div style="text-align:center; padding:12px; color:var(--text-muted); font-size:0.75rem;">⏳ Loading match volume...</div>`;
  }

  const select = document.getElementById('pw-winner-select');
  select.innerHTML = `
    <option value="${m.team1.name}">${m.team1.name}</option>
    <option value="${m.team2.name}">${m.team2.name}</option>
  `;

  openModal('modal-prediction-winner');

  // Fetch live predictions from server to get real-time stakes
  try {
    const res = await fetch(`${API}/predictions/predictions`);
    const allPreds = res.ok ? await res.json() : [];

    const matchBets = allPreds.filter(p => p.matchId === id);
    const t1Bets = matchBets.filter(p => p.selection === m.team1.name);
    const t2Bets = matchBets.filter(p => p.selection === m.team2.name);

    const t1TotalStake = t1Bets.reduce((sum, p) => sum + (p.stake || 0), 0);
    const t2TotalStake = t2Bets.reduce((sum, p) => sum + (p.stake || 0), 0);
    const totalVolume = t1TotalStake + t2TotalStake;

    const t1Pct = totalVolume > 0 ? Math.round((t1TotalStake / totalVolume) * 100) : 0;
    const t2Pct = totalVolume > 0 ? Math.round((t2TotalStake / totalVolume) * 100) : 0;

    const barWidth1 = totalVolume > 0 ? Math.round((t1TotalStake / totalVolume) * 100) : 50;
    const barWidth2 = 100 - barWidth1;

    if (statsContainer) {
      statsContainer.innerHTML = `
        <div style="font-weight:800; font-size:0.82rem; color:#fff; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
          <span>Match Volume</span>
          <span style="color:#10b981; font-size:1rem;">₹${totalVolume.toLocaleString('en-IN')}</span>
        </div>

        <!-- Visual stake bar -->
        <div style="height:6px; border-radius:6px; overflow:hidden; background:rgba(255,255,255,0.06); margin-bottom:10px; display:flex;">
          <div style="width:${barWidth1}%; background:linear-gradient(90deg, #10b981, #3b82f6); transition:width 0.5s;"></div>
          <div style="width:${barWidth2}%; background:linear-gradient(90deg, #f97316, #ef4444); transition:width 0.5s;"></div>
        </div>

        <div style="display:flex; flex-direction:column; gap:8px; font-size:0.8rem;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:6px;">
              <img src="${m.team1.logo || 'assets/valorant_thumb.jpg'}" style="width:22px; height:22px; border-radius:50%; object-fit:cover;" onerror="this.src='assets/valorant_thumb.jpg'"/>
              <span style="color:var(--text-secondary);">${m.team1.name}</span>
            </div>
            <span style="font-weight:800; color:#fff;">₹${t1TotalStake.toLocaleString('en-IN')} <span style="color:#10b981; font-size:0.72rem;">(${t1Pct}%)</span></span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:6px;">
              <img src="${m.team2.logo || 'assets/valorant_thumb.jpg'}" style="width:22px; height:22px; border-radius:50%; object-fit:cover;" onerror="this.src='assets/valorant_thumb.jpg'"/>
              <span style="color:var(--text-secondary);">${m.team2.name}</span>
            </div>
            <span style="font-weight:800; color:#fff;">₹${t2TotalStake.toLocaleString('en-IN')} <span style="color:#ef4444; font-size:0.72rem;">(${t2Pct}%)</span></span>
          </div>
          <div style="display:flex; justify-content:space-between; color:var(--text-secondary); border-top:1px solid rgba(255,255,255,0.05); padding-top:8px; margin-top:2px;">
            <span>Total Trades</span>
            <span style="font-weight:800; color:#fff;">${matchBets.length} placed</span>
          </div>
          <div style="display:flex; justify-content:space-between; color:var(--text-secondary);">
            <span>Unique Players</span>
            <span style="font-weight:800; color:#fff;">${[...new Set(matchBets.map(p => p.userId))].length}</span>
          </div>
        </div>
      `;
    }
  } catch(e) {
    console.error('Failed to load match bets:', e);
    if (statsContainer) {
      statsContainer.innerHTML = `<div style="text-align:center; padding:12px; color:#ef4444; font-size:0.75rem;">⚠️ Could not load match data.</div>`;
    }
  }
};

window.confirmPredictionWinner = async function() {
  const id = document.getElementById('pw-match-id').value;
  const winner = document.getElementById('pw-winner-select').value;

  if (!winner) return;

  try {
    const res = await fetch(`${API}/predictions/matches/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed', winner })
    });

    if (res.ok) {
      showToast('Winner declared and rewards distributed successfully! 🎉', 'success');
      closeModal('modal-prediction-winner');
      loadAdminPredictions();
    } else {
      showToast('Failed to declare winner.', 'error');
    }
  } catch(e) {
    console.error('Failed to declare winner:', e);
    showToast('Network error while declaring winner.', 'error');
  }
};

window.openPredictionSettingsModal = function() {
  const s = db.predictionSettings || { 
    defaultEntryFee: 25, 
    minEntryFee: 10, 
    maxEntryFee: 100, 
    commissionPercent: 15, 
    minCommission: 2, 
    pointsCorrect: 100, 
    pointsIncorrect: -20, 
    rewardsSplit: { first: 80, second: 15, third: 5, others: 0 },
    leaderboardRewards: { type: 'Weekly', p1: 1000, p2: 500, p3: 250, resetPeriod: 'Every Week' },
    bannerTitle: 'REAL PREDICTIONS\nREAL MONEY',
    bannerSubtitle: 'Trade on matches. Win real cash instantly.',
    bannerImage: ''
  };
  
  document.getElementById('p-banner-title').value = s.bannerTitle || 'REAL PREDICTIONS\nREAL MONEY';
  document.getElementById('p-banner-subtitle').value = s.bannerSubtitle || 'Trade on matches. Win real cash instantly.';
  document.getElementById('p-hero-image-base64').value = s.bannerImage || '';
  document.getElementById('p-hero-image-file').value = '';

  document.getElementById('p-settings-fee-default').value = s.defaultEntryFee !== undefined ? s.defaultEntryFee : 25;
  document.getElementById('p-settings-fee-min').value = s.minEntryFee !== undefined ? s.minEntryFee : 10;
  document.getElementById('p-settings-fee-max').value = s.maxEntryFee !== undefined ? s.maxEntryFee : 100;
  
  document.getElementById('p-settings-comm-pct').value = s.commissionPercent !== undefined ? s.commissionPercent : 15;
  document.getElementById('p-settings-comm-min').value = s.minCommission !== undefined ? s.minCommission : 2;
  
  document.getElementById('p-settings-correct').value = s.pointsCorrect;
  document.getElementById('p-settings-incorrect').value = s.pointsIncorrect;
  
  const split = s.rewardsSplit || { first: 80, second: 15, third: 5, others: 0 };
  document.getElementById('p-split-first').value = split.first;
  document.getElementById('p-split-second').value = split.second;
  document.getElementById('p-split-third').value = split.third;
  document.getElementById('p-split-others').value = split.others || 0;

  const lbr = s.leaderboardRewards || { type: 'Weekly', p1: 1000, p2: 500, p3: 250, resetPeriod: 'Every Week' };
  document.getElementById('p-lb-type').value = lbr.type || 'Weekly';
  document.getElementById('p-lb-reset-period').value = lbr.resetPeriod || 'Every Week';
  document.getElementById('p-lb-reward-1').value = lbr.p1 !== undefined ? lbr.p1 : 1000;
  document.getElementById('p-lb-reward-2').value = lbr.p2 !== undefined ? lbr.p2 : 500;
  document.getElementById('p-lb-reward-3').value = lbr.p3 !== undefined ? lbr.p3 : 250;

  openModal('modal-prediction-settings');
};

window.savePredictionSettings = async function() {
  const settingsData = {
    defaultEntryFee: parseInt(document.getElementById('p-settings-fee-default').value) || 25,
    minEntryFee: parseInt(document.getElementById('p-settings-fee-min').value) || 10,
    maxEntryFee: parseInt(document.getElementById('p-settings-fee-max').value) || 100,
    commissionPercent: parseInt(document.getElementById('p-settings-comm-pct').value) || 15,
    minCommission: parseInt(document.getElementById('p-settings-comm-min').value) || 2,
    pointsCorrect: parseInt(document.getElementById('p-settings-correct').value) || 100,
    pointsIncorrect: parseInt(document.getElementById('p-settings-incorrect').value) || -20,
    rewardsSplit: {
      first: parseInt(document.getElementById('p-split-first').value) || 80,
      second: parseInt(document.getElementById('p-split-second').value) || 15,
      third: parseInt(document.getElementById('p-split-third').value) || 5,
      others: parseInt(document.getElementById('p-split-others').value) || 0
    },
    leaderboardRewards: {
      type: document.getElementById('p-lb-type').value,
      resetPeriod: document.getElementById('p-lb-reset-period').value,
      p1: parseInt(document.getElementById('p-lb-reward-1').value) || 1000,
      p2: parseInt(document.getElementById('p-lb-reward-2').value) || 500,
      p3: parseInt(document.getElementById('p-lb-reward-3').value) || 250
    },
    bannerTitle: document.getElementById('p-banner-title').value.trim(),
    bannerSubtitle: document.getElementById('p-banner-subtitle').value.trim(),
    bannerImage: document.getElementById('p-hero-image-base64').value
  };

  try {
    const res = await fetch(`${API}/predictions/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsData)
    });

    if (res.ok) {
      showToast('Prediction Settings updated successfully! ⚙️', 'success');
      closeModal('modal-prediction-settings');
      loadAdminPredictions();
    } else {
      showToast('Failed to update prediction settings.', 'error');
    }
  } catch(e) {
    console.error('Failed to save settings:', e);
    showToast('Network error while saving settings.', 'error');
  }
};

function renderAdminPredictionsLeaderboard() {
  const listContainer = document.getElementById('admin-pred-leaderboard-list');
  if (!listContainer) return;

  const sortedUsers = [...(db.users || [])]
    .map(u => ({
      name: u.name,
      points: u.predictionPoints || 0,
      avatar: 'assets/valorant_thumb.jpg'
    }))
    .sort((a, b) => b.points - a.points);

  if (sortedUsers.length === 0) {
    listContainer.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-muted); font-size:0.8rem;">No participants yet.</div>`;
    return;
  }

  listContainer.innerHTML = sortedUsers.map((item, idx) => {
    const medalIcon = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
    
    return `
      <div style="background:var(--bg-elevated); border:1px solid var(--border-light); border-radius:6px; padding:10px; display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:0.8rem; font-weight:800; color:var(--text-muted); width:24px;">${medalIcon}</span>
          <img src="${item.avatar}" style="width:24px; height:24px; border-radius:50%; object-fit:cover;" />
          <span style="font-size:0.82rem; font-weight:800; color:#fff;">${item.name}</span>
        </div>
        <span style="font-size:0.82rem; font-weight:700; color:var(--text-secondary);">${item.points} pts</span>
      </div>
    `;
  }).join('');
}

// =====================================================
// MARKET MANAGEMENT CONTROLLERS
// =====================================================
window.openMarketManagerModal = function(matchId) {
  const m = (db.predictionMatches || []).find(match => match.id === matchId);
  if (!m) return;

  document.getElementById('pm-mgr-match-id').value = m.id;

  const listContainer = document.getElementById('pm-mgr-markets-list');
  if (!listContainer) return;

  const markets = m.markets || [
    {
      id: `${m.id}_1`,
      name: 'Match Winner',
      status: m.status === 'completed' ? 'completed' : 'active',
      winner: m.winner || '',
      options: [
        { name: m.team1.name, odds: 1.85 },
        { name: m.team2.name, odds: 2.05 }
      ]
    },
    {
      id: `${m.id}_2`,
      name: 'Toss Winner',
      status: m.status === 'completed' ? 'completed' : 'active',
      winner: '',
      options: [
        { name: m.team1.name, odds: 1.90 },
        { name: m.team2.name, odds: 1.90 }
      ]
    },
    {
      id: `${m.id}_3`,
      name: 'Total Points',
      status: m.status === 'completed' ? 'completed' : 'active',
      winner: '',
      options: [
        { name: 'Over 175.5', odds: 1.96 },
        { name: 'Under 175.5', odds: 1.85 }
      ]
    }
  ];

  listContainer.innerHTML = markets.map(market => {
    let resolveHtml = '';
    if (market.status === 'completed') {
      resolveHtml = `
        <span style="font-size:0.8rem; font-weight:800; color:#10b981;">Resolved: <b>${market.winner}</b></span>
      `;
    } else {
      const selectId = `resolve-sel-${market.id}`;
      const optionsHtml = market.options.map(opt => `<option value="${opt.name}">${opt.name}</option>`).join('');
      resolveHtml = `
        <div style="display:flex; gap:8px; align-items:center;">
          <select id="${selectId}" class="form-control" style="padding:4px 6px; font-size:0.75rem; width:130px; display:inline-block;">
            ${optionsHtml}
          </select>
          <button class="btn btn-ghost btn-sm" onclick="resolvePredictionMarket('${m.id}', '${market.id}', '${selectId}')" style="color:#ef4444; font-weight:800; cursor:pointer;">Settle</button>
        </div>
      `;
    }

    const optionsText = market.options.map(o => `${o.name} (@${o.odds})`).join(' vs ');

    return `
      <div style="background:var(--bg-elevated); border:1px solid var(--border-light); border-radius:6px; padding:10px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-size:0.8rem; font-weight:800; color:#fff;">${market.name}</div>
          <div style="font-size:0.7rem; color:var(--text-muted); margin-top:2px;">${optionsText}</div>
        </div>
        <div>
          ${resolveHtml}
        </div>
      </div>
    `;
  }).join('');

  openModal('modal-prediction-market-manager');
};

window.resolvePredictionMarket = async function(matchId, marketId, selectId) {
  const winner = document.getElementById(selectId).value;
  if (!winner) {
    showToast('Please select a winner option!', 'error');
    return;
  }

  try {
    const res = await fetch(`${API}/predictions/resolve-market`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId, marketId, winner })
    });

    if (res.ok) {
      showToast('Market resolved successfully! Payouts distributed. 🎉', 'success');
      closeModal('modal-prediction-market-manager');
      loadAdminPredictions();
    } else {
      showToast('Failed to resolve market.', 'error');
    }
  } catch(e) {
    console.error(e);
    showToast('Network error resolving market.', 'error');
  }
};

window.addPredictionMarket = async function() {
  const matchId = document.getElementById('pm-mgr-match-id').value;
  const name = document.getElementById('pm-new-market-name').value.trim();
  const opt1Name = document.getElementById('pm-new-opt1-name').value.trim();
  const opt1Odds = parseFloat(document.getElementById('pm-new-opt1-odds').value);
  const opt2Name = document.getElementById('pm-new-opt2-name').value.trim();
  const opt2Odds = parseFloat(document.getElementById('pm-new-opt2-odds').value);

  if (!name || !opt1Name || isNaN(opt1Odds) || !opt2Name || isNaN(opt2Odds)) {
    showToast('Please fill all market configuration fields!', 'error');
    return;
  }

  const match = (db.predictionMatches || []).find(m => m.id === matchId);
  if (!match) return;

  const markets = match.markets || [
    {
      id: `${match.id}_1`,
      name: 'Match Winner',
      status: match.status === 'completed' ? 'completed' : 'active',
      winner: match.winner || '',
      options: [
        { name: match.team1.name, odds: 1.85 },
        { name: match.team2.name, odds: 2.05 }
      ]
    },
    {
      id: `${match.id}_2`,
      name: 'Toss Winner',
      status: match.status === 'completed' ? 'completed' : 'active',
      winner: '',
      options: [
        { name: match.team1.name, odds: 1.90 },
        { name: match.team2.name, odds: 1.90 }
      ]
    },
    {
      id: `${match.id}_3`,
      name: 'Total Points',
      status: match.status === 'completed' ? 'completed' : 'active',
      winner: '',
      options: [
        { name: 'Over 175.5', odds: 1.96 },
        { name: 'Under 175.5', odds: 1.85 }
      ]
    }
  ];

  const newMarket = {
    id: `${matchId}_${Date.now()}`,
    name,
    status: 'active',
    winner: '',
    options: [
      { name: opt1Name, odds: opt1Odds },
      { name: opt2Name, odds: opt2Odds }
    ]
  };

  markets.push(newMarket);

  try {
    const res = await fetch(`${API}/predictions/matches/${matchId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markets })
    });

    if (res.ok) {
      showToast('Custom prediction market created successfully! 🎯', 'success');
      
      document.getElementById('pm-new-market-name').value = '';
      document.getElementById('pm-new-opt1-name').value = '';
      document.getElementById('pm-new-opt1-odds').value = '';
      document.getElementById('pm-new-opt2-name').value = '';
      document.getElementById('pm-new-opt2-odds').value = '';
      
      closeModal('modal-prediction-market-manager');
      loadAdminPredictions();
    } else {
      showToast('Failed to add market.', 'error');
    }
  } catch(e) {
    console.error(e);
    showToast('Network error adding market.', 'error');
  }
};

// =====================================================
// CASINO MODULE CONTROLLERS (ADMIN)
// =====================================================
let casinoAdminSSE = null;

window.loadCasinoAdmin = async function() {
  try {
    // 1. Fetch settings
    const settingsRes = await fetch(`${API}/casino/settings`);
    if (settingsRes.ok) {
      const settings = await settingsRes.json();
      db.casinoSettings = settings;
      renderCasinoSettingsInputs();
      renderCasinoGamesList();
    }

    // 2. Fetch stats
    const statsRes = await fetch(`${API}/casino/stats`);
    if (statsRes.ok) {
      const stats = await statsRes.json();
      document.getElementById('casino-stat-total-bets').textContent = '₹' + (stats.totalBets || 0).toLocaleString('en-IN');
      document.getElementById('casino-stat-total-payouts').textContent = '₹' + (stats.totalPayout || 0).toLocaleString('en-IN');
      const profit = (stats.totalBets || 0) - (stats.totalPayout || 0);
      document.getElementById('casino-stat-profit').textContent = '₹' + profit.toLocaleString('en-IN');
      document.getElementById('casino-stat-profit').style.color = profit >= 0 ? '#10b981' : '#ef4444';
      
      renderCasinoBreakdownTable(stats);
    }

    // 3. Fetch bets
    loadCasinoBetsHistory();

    // 4. Setup SSE for Live Crash Monitor
    setupCasinoSSE();

  } catch(e) {
    console.error('loadCasinoAdmin:', e);
  }
};

function renderCasinoBreakdownTable(stats) {
  const tbody = document.getElementById('admin-casino-breakdown-tbody');
  if (!tbody) return;
  
  const games = [
    { id: 'plane', name: 'Plane Crash', emoji: '✈️' },
    { id: 'mines', name: 'Mines', emoji: '💣' },
    { id: 'spin', name: 'Spin & Win', emoji: '🎡' },
    { id: 'dice', name: 'Dice', emoji: '🎲' },
    { id: 'coinflip', name: 'Coinflip', emoji: '🪙' },
    { id: 'limbo', name: 'Limbo', emoji: '📈' },
    { id: 'tower', name: 'Tower', emoji: '🗼' },
    { id: 'color', name: 'Color Prediction', emoji: '🎨' },
    { id: 'plinko', name: 'Plinko', emoji: '⬇️' },
    { id: 'keno', name: 'Keno', emoji: '🔢' }
  ];

  const rigged = db.casinoSettings?.riggedGames || {};

  tbody.innerHTML = games.map(g => {
    const data = stats.breakdown?.[g.id] || { bets: 0, payouts: 0, profit: 0 };
    const isRigged = rigged[g.id] === true;
    const profitCls = data.profit >= 0 ? '#10b981' : '#ef4444';
    
    return `
      <tr>
        <td><strong>${g.id.toUpperCase()}</strong></td>
        <td><span style="font-size:1.1rem; margin-right:4px;">${g.emoji}</span> <strong>${g.name}</strong></td>
        <td>₹${(data.bets || 0).toLocaleString('en-IN')}</td>
        <td>₹${(data.payouts || 0).toLocaleString('en-IN')}</td>
        <td><span style="color:${profitCls}; font-weight:800;">₹${(data.profit || 0).toLocaleString('en-IN')}</span></td>
        <td>
          <button class="btn btn-${isRigged ? 'danger' : 'ghost'} btn-sm" onclick="toggleCasinoRigging('${g.id}', ${!isRigged})">
            ${isRigged ? '🛑 RIGGED (FORCING LOSS)' : '🎯 RIG OUTCOME (FORCE LOSS)'}
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

window.toggleCasinoRigging = async function(gameId, targetState) {
  if (!db.casinoSettings) db.casinoSettings = {};
  if (!db.casinoSettings.riggedGames) db.casinoSettings.riggedGames = {};
  db.casinoSettings.riggedGames[gameId] = targetState;

  try {
    const res = await fetch(`${API}/casino/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(db.casinoSettings)
    });
    if (res.ok) {
      db.casinoSettings = await res.json();
      loadCasinoAdmin();
      showToast(`${gameId.toUpperCase()} rigging setup updated!`, 'success');
    }
  } catch(e) {
    console.error(e);
    showToast('Failed to update rigging setup.', 'error');
  }
};

function renderCasinoSettingsInputs() {
  const s = db.casinoSettings;
  if (!s) return;
  document.getElementById('casino-set-plane-min').value = s.planeMin || 10;
  document.getElementById('casino-set-plane-max').value = s.planeMax || 10000;
  document.getElementById('casino-set-mines-min').value = s.minesMin || 10;
  document.getElementById('casino-set-mines-max').value = s.minesMax || 5000;
  document.getElementById('casino-set-house-edge').value = s.houseEdge || 3;
  document.getElementById('casino-set-dice-max').value = s.diceMax || 5000;
}

function renderCasinoGamesList() {
  const listEl = document.getElementById('casino-games-list');
  if (!listEl) return;
  const s = db.casinoSettings;
  const enabled = s?.gamesEnabled || {
    plane: true, mines: true, spin: true, dice: true, coinflip: true,
    limbo: true, tower: true, plinko: true, keno: true, color: true, bonus: true
  };
  const logos = s?.gamesLogos || {};

  const games = [
    { id: 'plane', name: 'Plane Crash', emoji: '✈️' },
    { id: 'mines', name: 'Mines', emoji: '💣' },
    { id: 'spin', name: 'Spin & Win', emoji: '🎡' },
    { id: 'dice', name: 'Dice', emoji: '🎲' },
    { id: 'coinflip', name: 'Coinflip', emoji: '🪙' },
    { id: 'limbo', name: 'Limbo', emoji: '📈' },
    { id: 'tower', name: 'Tower', emoji: '🗼' },
    { id: 'color', name: 'Color Prediction', emoji: '🎨' },
    { id: 'plinko', name: 'Plinko', emoji: '⬇️' },
    { id: 'keno', name: 'Keno', emoji: '🔢' },
    { id: 'bonus', name: 'Daily Bonus Spin', emoji: '🎁' }
  ];

  listEl.innerHTML = games.map(g => {
    const isActive = enabled[g.id] !== false;
    const customLogo = logos[g.id];
    const logoHTML = customLogo 
      ? `<div style="width:36px; height:36px; border-radius:8px; background-image:url(${customLogo}); background-size:cover; background-position:center; box-shadow:0 2px 5px rgba(0,0,0,0.3);"></div>`
      : `<span style="font-size:1.4rem;">${g.emoji}</span>`;

    return `
      <div style="background:var(--bg-card); border:1px solid var(--border); border-radius:12px; padding:14px; display:flex; flex-direction:column; gap:10px; justify-content:space-between;">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; width:100%;">
          <div style="display:flex; align-items:center; gap:8px;">
            ${logoHTML}
            <div>
              <div style="font-size:0.8rem; font-weight:700; color:#fff;">${g.name}</div>
              <div style="font-size:0.65rem; color:${isActive ? '#10b981' : 'var(--text-muted)'}; font-weight:700;">${isActive ? 'Enabled' : 'Disabled'}</div>
            </div>
          </div>
          <button class="btn btn-${isActive ? 'ghost' : 'success'} btn-sm" onclick="toggleCasinoGame('${g.id}', ${!isActive})">
            ${isActive ? 'Disable' : 'Enable'}
          </button>
        </div>
        
        <div style="display:flex; align-items:center; gap:6px; border-top:1px solid var(--border-light); padding-top:8px; margin-top:2px;">
          <button class="btn btn-ghost btn-sm" style="flex:1; font-size:0.65rem; padding:3px 6px; position:relative; overflow:hidden;">
            Upload Logo
            <input type="file" accept="image/*" onchange="uploadCasinoGameLogo('${g.id}', this)" style="position:absolute; inset:0; opacity:0; cursor:pointer;" />
          </button>
          ${customLogo ? `
            <button class="btn btn-danger btn-icon btn-sm" onclick="resetCasinoGameLogo('${g.id}')" style="padding:4px 8px;" title="Reset to Default Emoji">
              ✕
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

window.uploadCasinoGameLogo = function(gameId, input) {
  if (!input.files || !input.files[0]) return;
  const reader = new FileReader();
  reader.onload = async function(e) {
    const base64 = e.target.result;
    if (!db.casinoSettings) db.casinoSettings = {};
    if (!db.casinoSettings.gamesLogos) db.casinoSettings.gamesLogos = {};
    db.casinoSettings.gamesLogos[gameId] = base64;
    
    try {
      await fetch(`${API}/casino/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(db.casinoSettings)
      });
      renderCasinoGamesList();
      showToast('Game logo uploaded successfully!', 'success');
    } catch(e) {
      showToast('Error uploading game logo', 'error');
    }
  };
  reader.readAsDataURL(input.files[0]);
};

window.resetCasinoGameLogo = async function(gameId) {
  if (!db.casinoSettings || !db.casinoSettings.gamesLogos) return;
  delete db.casinoSettings.gamesLogos[gameId];
  
  try {
    await fetch(`${API}/casino/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(db.casinoSettings)
    });
    renderCasinoGamesList();
    showToast('Game logo reset to default!', 'success');
  } catch(e) {
    showToast('Error resetting game logo', 'error');
  }
};

window.toggleCasinoGame = async function(gameId, targetState) {
  if (!db.casinoSettings) db.casinoSettings = {};
  if (!db.casinoSettings.gamesEnabled) db.casinoSettings.gamesEnabled = {};
  db.casinoSettings.gamesEnabled[gameId] = targetState;
  
  try {
    const res = await fetch(`${API}/casino/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(db.casinoSettings)
    });
    if (res.ok) {
      db.casinoSettings = await res.json();
      renderCasinoGamesList();
      showToast(`${gameId.toUpperCase()} game status updated!`, 'success');
    }
  } catch(e) {
    console.error(e);
    showToast('Failed to toggle game.', 'error');
  }
};

window.saveCasinoSettings = async function() {
  const planeMin = parseInt(document.getElementById('casino-set-plane-min').value) || 10;
  const planeMax = parseInt(document.getElementById('casino-set-plane-max').value) || 10000;
  const minesMin = parseInt(document.getElementById('casino-set-mines-min').value) || 10;
  const minesMax = parseInt(document.getElementById('casino-set-mines-max').value) || 5000;
  const houseEdge = parseFloat(document.getElementById('casino-set-house-edge').value) || 3;
  const diceMax = parseInt(document.getElementById('casino-set-dice-max').value) || 5000;

  const payload = {
    ...db.casinoSettings,
    planeMin, planeMax, minesMin, minesMax, houseEdge, diceMax
  };

  try {
    const res = await fetch(`${API}/casino/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      db.casinoSettings = await res.json();
      showToast('Casino settings saved successfully! 🎰', 'success');
    } else {
      showToast('Failed to save settings.', 'error');
    }
  } catch(e) {
    console.error(e);
    showToast('Error saving settings.', 'error');
  }
};

async function loadCasinoBetsHistory() {
  try {
    const res = await fetch(`${API}/casino/bets`);
    if (res.ok) {
      const bets = await res.json();
      renderCasinoBetsTable(bets);
    }
  } catch(e) {}
}

function renderCasinoBetsTable(bets) {
  const tbody = document.getElementById('admin-casino-bets-tbody');
  if (!tbody) return;
  tbody.innerHTML = bets.map(b => {
    const payout = b.winAmount || 0;
    const isWin = payout > 0 || b.status === 'won';
    const statusCls = b.status === 'lost' ? 'inactive' : isWin ? 'active' : 'pending';
    const statusTxt = b.status === 'lost' ? 'Lost' : isWin ? 'Won' : 'Active';

    let outcomeStr = '–';
    if (b.game === 'plane') {
      outcomeStr = b.cashedOut ? `${b.cashOutMultiplier.toFixed(2)}x` : 'Crashed';
    } else if (b.game === 'mines') {
      outcomeStr = b.multiplier ? `${b.multiplier.toFixed(2)}x` : 'Mine hit';
    } else if (b.game === 'dice') {
      outcomeStr = `${b.roll} (${b.isOver ? 'Over' : 'Under'} ${b.prediction})`;
    } else if (b.game === 'coinflip') {
      outcomeStr = `${b.result.toUpperCase()} (Choice: ${b.choice.toUpperCase()})`;
    } else if (b.game === 'limbo') {
      outcomeStr = `${b.resultMultiplier.toFixed(2)}x (Target: ${b.targetMultiplier.toFixed(2)}x)`;
    } else if (b.game === 'tower') {
      outcomeStr = b.multiplier ? `${b.multiplier.toFixed(2)}x` : 'Mine hit';
    } else if (b.game === 'color') {
      outcomeStr = `${b.result.toUpperCase()} (Choice: ${b.choice.toUpperCase()})`;
    } else if (b.game === 'plinko') {
      outcomeStr = `${b.multiplier}x (Risk: ${b.risk.toUpperCase()})`;
    } else if (b.game === 'keno') {
      outcomeStr = `${b.hits} hits (Matched ${b.hits}/${b.picks.length})`;
    }

    return `
      <tr>
        <td><strong>${b.id}</strong></td>
        <td><span style="font-weight:700; text-transform:uppercase;">${b.game}</span></td>
        <td><code>${b.userId}</code></td>
        <td>₹${b.amount}</td>
        <td>${outcomeStr}</td>
        <td><span style="color:${isWin ? '#10b981' : 'inherit'}; font-weight:700;">₹${payout}</span></td>
        <td><span style="font-size:0.75rem; color:var(--text-muted);">${new Date(b.createdAt || Date.now()).toLocaleTimeString()}</span></td>
        <td><span class="badge ${statusCls}">${statusTxt}</span></td>
      </tr>
    `;
  }).join('') || '<tr><td colspan="8" style="text-align:center; color:var(--text-muted); padding:20px;">No casino bets found</td></tr>';
}

function setupCasinoSSE() {
  if (casinoAdminSSE) return; // already listening
  const source = new EventSource('/sse');
  source.addEventListener('plane_round_update', e => {
    const round = JSON.parse(e.data);
    updateAdminCrashUI(round);
  });
  casinoAdminSSE = source;
}

function updateAdminCrashUI(round) {
  const multEl = document.getElementById('admin-crash-multiplier');
  const statusEl = document.getElementById('admin-crash-status');
  const statValEl = document.getElementById('casino-stat-crash-round');
  const statStatusEl = document.getElementById('casino-stat-crash-status');
  const tbody = document.getElementById('admin-crash-bets-tbody');

  if (multEl) {
    multEl.textContent = round.multiplier.toFixed(2) + 'x';
    if (round.status === 'crashed') {
      multEl.style.color = '#ef4444';
      statusEl.textContent = 'Status: Crashed';
    } else if (round.status === 'running') {
      multEl.style.color = '#10b981';
      statusEl.textContent = 'Status: Flying!';
    } else {
      multEl.style.color = '#3b82f6';
      statusEl.textContent = 'Status: Waiting for bets...';
    }
  }

  if (statValEl) {
    statValEl.textContent = round.multiplier.toFixed(2) + 'x';
    statStatusEl.textContent = 'Status: ' + round.status.toUpperCase();
  }

  // Update bets table
  if (tbody) {
    tbody.innerHTML = round.bets.map(b => {
      const statusTxt = b.cashedOut ? `Cashed out @ ${b.cashOutMultiplier.toFixed(2)}x` : round.status === 'crashed' ? 'Crashed' : 'In Flight';
      const statusCls = b.cashedOut ? 'active' : round.status === 'crashed' ? 'inactive' : 'pending';
      return `
        <tr>
          <td><code>${b.userId}</code></td>
          <td>₹${b.amount}</td>
          <td>${b.autoCashOut ? b.autoCashOut + 'x' : 'Manual'}</td>
          <td><span class="badge ${statusCls}">${statusTxt}</span></td>
        </tr>
      `;
    }).join('') || '<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:10px;">No active bets in this round</td></tr>';
  }
}

// ── PREDICTIONS BANNERS ────────────────────────────────
function renderPredictionsBanners() {
  const grid = document.getElementById('predictions-banners-grid');
  if (!grid) return;
  const colors = ['#8b5cf6,#db2777','#1a3a6c,#0d47a1','#4a1a6c,#7b1fa2','#6c1a1a,#c62828','#1a4a1a,#2e7d32'];
  grid.innerHTML = (db.predictions_banners || []).map((b, i) => {
    const bgStyle = b.image 
      ? `background-image: url(${b.image}); background-size: cover; background-position: center;`
      : `background: linear-gradient(135deg, ${b.color || colors[i % colors.length]});`;
    
    const mediaBadge = b.video 
      ? `<span style="position:absolute; top:6px; right:6px; background:rgba(0,0,0,0.7); color:#eab308; font-size:0.6rem; font-weight:800; padding:2px 6px; border-radius:4px;">🎬 VIDEO</span>`
      : '';
    const btnCount = (b.buttons||[]).length;
    const btnBadge = btnCount > 0 
      ? `<span style="background:var(--accent); color:#fff; font-size:0.6rem; padding:1px 5px; border-radius:3px;">${btnCount} btn${btnCount>1?'s':''}</span>` : '';
    const actionBadge = b.action?.type 
      ? `<span style="background:var(--bg-elevated); color:var(--text-muted); font-size:0.6rem; padding:1px 5px; border-radius:3px; border:1px solid var(--border)">→ ${b.action.type}</span>` : '';

    return `
      <div class="banner-card">
        <div class="banner-preview" style="${bgStyle}; position:relative;">
          ${mediaBadge}
          <div class="b-title" style="text-shadow: 0 2px 4px rgba(0,0,0,0.8)">${b.title}</div>
          <div class="b-sub" style="text-shadow: 0 2px 4px rgba(0,0,0,0.8)">${b.subtitle}</div>
          <div style="font-size:0.65rem; margin-top:4px; opacity:0.8; text-shadow: 0 2px 4px rgba(0,0,0,0.8)">${b.type}</div>
        </div>
        <div class="banner-footer">
          <div class="banner-meta" style="display:flex; flex-wrap:wrap; gap:4px; align-items:center;">
            <span>${b.game}</span>${btnBadge}${actionBadge}
          </div>
          <div class="banner-actions">
            <button class="btn btn-ghost btn-sm" onclick="editPredictionsBanner('${b.id}')" style="color:var(--accent-bright); font-size:0.65rem; padding:3px 7px;">Edit</button>
            <label class="toggle">
              <input type="checkbox" ${b.active ? 'checked' : ''} onchange="togglePredictionsBanner('${b.id}',this.checked)" />
              <span class="toggle-slider"></span>
            </label>
            <button class="btn btn-danger btn-icon btn-sm" onclick="deletePredictionsBanner('${b.id}','${b.title}')">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.loadPredictionsBanners = async function() {
  try {
    const res = await fetch(`${API}/predictions_banners`);
    if (res.ok) {
      db.predictions_banners = await res.json();
      renderPredictionsBanners();
    }
  } catch(e) {
    showToast('Error loading predictions banners', 'error');
  }
};

window.openAddPredictionsBanner = function() {
  window.bannerEditorMode = 'predictions';
  document.getElementById('b-id').value = '';
  document.getElementById('b-title').value = '';
  document.getElementById('b-sub').value = '';
  document.getElementById('b-banner-file').value = '';
  document.getElementById('b-banner-base64').value = '';
  document.getElementById('b-video-file').value = '';
  document.getElementById('b-video-base64').value = '';
  document.getElementById('b-img-preview').style.display = 'none';
  document.getElementById('b-video-preview').style.display = 'none';
  document.getElementById('b-action-type').value = '';
  document.getElementById('b-action-url').value = '';
  document.getElementById('b-action-page-wrap').style.display = 'none';
  document.getElementById('b-action-tournament-wrap').style.display = 'none';
  document.getElementById('b-action-external-wrap').style.display = 'none';
  document.getElementById('b-hide-text').checked = false;
  document.getElementById('modal-b-title').textContent = 'Add Prediction Banner';
  bannerButtons = [];
  renderBannerButtonsList();
  switchBannerMediaTab('image');
  const sel = document.getElementById('b-game');
  sel.innerHTML = '<option>All Games</option>' + (db.games || []).map(g => `<option>${g.name}</option>`).join('');
  // Populate tournament dropdown
  const tSel = document.getElementById('b-action-tournament');
  tSel.innerHTML = '<option value="">Select tournament...</option>' + (db.tournaments||[]).map(t=>`<option value="${t.id}">${t.name}</option>`).join('');
  openModal('modal-banner');
};

window.editPredictionsBanner = function(id) {
  window.bannerEditorMode = 'predictions';
  const b = db.predictions_banners.find(x => x.id === id);
  if (!b) return;

  document.getElementById('b-id').value = b.id;
  document.getElementById('b-title').value = b.title || '';
  document.getElementById('b-sub').value = b.subtitle || '';
  document.getElementById('b-banner-base64').value = b.image || '';
  document.getElementById('b-video-base64').value = b.video || '';
  document.getElementById('modal-b-title').textContent = 'Edit Prediction Banner';

  // Image preview
  if (b.image) {
    document.getElementById('b-img-preview-el').src = b.image;
    document.getElementById('b-img-preview').style.display = 'block';
    switchBannerMediaTab('image');
  } else if (b.video) {
    document.getElementById('b-video-preview-el').src = b.video;
    document.getElementById('b-video-preview').style.display = 'block';
    switchBannerMediaTab('video');
  } else {
    switchBannerMediaTab('image');
  }

  // Game / Type
  const gameSel = document.getElementById('b-game');
  gameSel.innerHTML = '<option>All Games</option>' + (db.games || []).map(g => `<option>${g.name}</option>`).join('');
  gameSel.value = b.game || 'All Games';
  document.getElementById('b-type').value = b.type || 'Main Banner';

  // Action
  const act = b.action || {};
  document.getElementById('b-action-type').value = act.type || '';
  onBannerActionChange();
  if (act.page) document.getElementById('b-action-page').value = act.page;
  if (act.url) document.getElementById('b-action-url').value = act.url;
  const tSel = document.getElementById('b-action-tournament');
  tSel.innerHTML = '<option value="">Select tournament...</option>' + (db.tournaments||[]).map(t=>`<option value="${t.id}">${t.name}</option>`).join('');
  if (act.tournamentId) tSel.value = act.tournamentId;

  // Buttons
  bannerButtons = (b.buttons || []).map(x => ({ ...x }));
  renderBannerButtonsList();

  // Hide text toggle
  document.getElementById('b-hide-text').checked = !!b.hideText;

  openModal('modal-banner');
};

window.togglePredictionsBanner = async function(id, active) {
  await fetch(`${API}/predictions_banners/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active }) });
  db.predictions_banners = db.predictions_banners.map(b => b.id === id ? { ...b, active } : b);
  showToast(`Prediction Banner ${active ? 'activated' : 'deactivated'}`, 'success');
};

window.deletePredictionsBanner = function(id, title) {
  document.getElementById('confirm-msg').textContent = `Delete prediction banner "${title}"?`;
  document.getElementById('confirm-action-btn').onclick = async () => {
    await fetch(`${API}/predictions_banners/${id}`, { method: 'DELETE' });
    db.predictions_banners = db.predictions_banners.filter(b => b.id !== id);
    renderPredictionsBanners(); closeModal('modal-confirm'); showToast('Prediction banner deleted', 'success');
  };
  document.getElementById('modal-confirm').classList.add('show');
};

// =====================================================
// QR / UTR PAYMENTS MANAGEMENT
// =====================================================
let qrActiveFilter = 'all';
let allQrRequests = [];

window.loadAdminQrPayments = async function() {
  try {
    // 1. Fetch settings
    const settingsRes = await fetch(`${API}/qr-payment/settings`);
    if (settingsRes.ok) {
      const settings = await settingsRes.json();
      document.getElementById('admin-upi-id-input').value = settings.upiId || '9689901416.wallet@phonepe';
      const qrPreview = document.getElementById('admin-qr-preview');
      if (qrPreview) qrPreview.src = settings.qrImage || '/assets/qr_payment_default.jpg';
      
      const procText = document.getElementById('admin-processing-text-input');
      if (procText) procText.value = settings.processingText || "Payment is being verified. Wallet balance will update within 5 minutes.";
    }

    // 2. Fetch requests
    const reqsRes = await fetch(`${API}/qr-payment/requests`);
    if (reqsRes.ok) {
      allQrRequests = await reqsRes.json();
      renderQrRequests();
      updateQrStats();
    }
  } catch(e) {
    showToast('Failed to load QR payment data', 'error');
  }
};

window.previewAdminPaymentQr = function(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const qrPreview = document.getElementById('admin-qr-preview');
    if (qrPreview) qrPreview.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

window.saveAdminQrSettings = async function() {
  const upiId = document.getElementById('admin-upi-id-input').value.trim();
  const procText = document.getElementById('admin-processing-text-input').value.trim();
  const qrPreview = document.getElementById('admin-qr-preview');
  
  if (!upiId) {
    showToast('Please enter a valid UPI ID', 'error');
    return;
  }

  const payload = { 
    upiId,
    processingText: procText || "Payment is being verified. Wallet balance will update within 5 minutes."
  };
  if (qrPreview && qrPreview.src.startsWith('data:image')) {
    payload.qrImage = qrPreview.src;
  }

  try {
    const res = await fetch(`${API}/qr-payment/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      showToast('Payment settings saved successfully! 📸💰', 'success');
      loadAdminQrPayments();
    } else {
      showToast('Failed to save settings to server.', 'error');
    }
  } catch(e) {
    showToast('Network error while saving settings.', 'error');
  }
};

window.filterQrRequests = function(status, btnEl) {
  qrActiveFilter = status;
  document.querySelectorAll('#qr-request-filters .ftab').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  renderQrRequests();
};

function renderQrRequests() {
  const tbody = document.getElementById('qr-requests-tbody');
  if (!tbody) return;

  let list = allQrRequests || [];
  if (qrActiveFilter !== 'all') {
    list = list.filter(r => r.status === qrActiveFilter);
  }

  tbody.innerHTML = list.map((r, i) => {
    let statusClass = 'pending';
    let badgeText = r.status.toUpperCase();
    if (r.status === 'approved') {
      statusClass = 'active';
    } else if (r.status === 'rejected') {
      statusClass = 'blocked';
    }

    let badgeHtml = '';
    if (r.status === 'pending' && r.disputed) {
      badgeHtml = `<span class="badge" style="background:rgba(124,58,237,0.15); border:1px solid #8b5cf6; color:#a78bfa; font-weight:800; font-size:0.65rem; padding:2px 6px;">DISPUTED</span>`;
    } else {
      badgeHtml = `<span class="badge ${statusClass}">${badgeText}</span>`;
    }

    let receiptLinkHtml = '';
    if (r.screenshot) {
      receiptLinkHtml = `
        <div style="margin-top:4px;">
          <a onclick="viewDisputeReceipt('${r.id}')" style="font-size:0.7rem; color:#3b82f6; cursor:pointer; font-weight:800; text-decoration:underline; display:inline-flex; align-items:center; gap:4px;">
            📄 View Receipt
          </a>
        </div>
      `;
    }

    let actionButtons = '';
    if (r.status === 'pending') {
      actionButtons = `
        <div style="display:flex; gap:8px; justify-content:center;">
          <button class="btn btn-success btn-sm" onclick="processQrPaymentRequest('${r.id}', 'approved')" style="padding:4px 10px; font-size:0.72rem; font-weight:800;">Approve</button>
          <button class="btn btn-danger btn-sm" onclick="processQrPaymentRequest('${r.id}', 'rejected')" style="padding:4px 10px; font-size:0.72rem; font-weight:800;">Reject</button>
        </div>
      `;
    } else {
      actionButtons = `<div style="text-align:center; color:var(--text-muted); font-size:0.72rem; text-transform:uppercase; font-weight:700;">Processed</div>`;
    }

    return `
      <tr>
        <td>${i + 1}</td>
        <td>
          <b>${r.userName}</b>
          <div style="font-size:0.65rem; color:var(--text-muted); font-family:monospace;">${r.userId}</div>
        </td>
        <td>
          <div style="display:flex; align-items:center; gap:6px; font-family:monospace;">
            <span>${r.utr}</span>
            <button onclick="navigator.clipboard.writeText('${r.utr}'); showToast('UTR Copied', 'success')" style="background:none; border:none; color:var(--accent-bright); cursor:pointer; font-size:0.7rem; padding:0;">📋</button>
          </div>
          ${receiptLinkHtml}
        </td>
        <td style="font-weight:800; color:#fff;">₹${r.amount.toLocaleString('en-IN')}</td>
        <td style="color:var(--text-muted); font-size:0.75rem;">${r.date}</td>
        <td>${badgeHtml}</td>
        <td>${actionButtons}</td>
      </tr>
    `;
  }).join('') || `<tr><td colspan="7" style="text-align:center; padding:24px; color:var(--text-muted);">No payment requests found</td></tr>`;
}

window.viewDisputeReceipt = function(id) {
  const req = allQrRequests.find(r => r.id === id);
  if (!req || !req.screenshot) return;
  const img = document.getElementById('dispute-receipt-img');
  if (img) img.src = req.screenshot;
  openModal('modal-view-receipt');
};

function updateQrStats() {
  const pending = allQrRequests.filter(r => r.status === 'pending').length;
  const approvedAmt = allQrRequests.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.amount, 0);
  const rejected = allQrRequests.filter(r => r.status === 'rejected').length;

  const statPendEl = document.getElementById('qr-stat-pending');
  const statApprEl = document.getElementById('qr-stat-approved');
  const statRejeEl = document.getElementById('qr-stat-rejected');

  if (statPendEl) statPendEl.textContent = pending;
  if (statApprEl) statApprEl.textContent = '₹' + approvedAmt.toLocaleString('en-IN');
  if (statRejeEl) statRejeEl.textContent = rejected;
}

window.processQrPaymentRequest = async function(id, status) {
  let rejectReason = null;
  if (status === 'rejected') {
    rejectReason = prompt("Enter the reason for rejecting this payment (e.g. 'Incorrect UTR number'):");
    if (rejectReason === null) return;
    rejectReason = rejectReason.trim() || 'Incorrect UTR / Verification failed';
  } else {
    const confirmMsg = `Are you sure you want to approve this payment request?`;
    if (!confirm(confirmMsg)) return;
  }

  try {
    const res = await fetch(`${API}/qr-payment/request/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, rejectReason })
    });

    if (res.ok) {
      showToast(`Request marked as ${status} successfully!`, 'success');
      loadAdminQrPayments();
      updatePendingBadge();
    } else {
      const err = await res.json();
      showToast(err.error || 'Failed to process request.', 'error');
    }
  } catch(e) {
    showToast('Network error processing request.', 'error');
  }
};

let maintenanceMediaBase64 = '';
let maintenanceMediaType = 'image';
let currentDetectedSymbols = [];

const ALL_POSSIBLE_SYMBOLS = {
  instagram: { label: "Instagram Link", placeholder: "e.g. https://instagram.com/mybrand", icon: "📸" },
  discord: { label: "Discord Server Invite", placeholder: "e.g. https://discord.gg/myinvite", icon: "💬" },
  telegram: { label: "Telegram Channel Link", placeholder: "e.g. https://t.me/mychannel", icon: "✈️" },
  youtube: { label: "YouTube Channel Link", placeholder: "e.g. https://youtube.com/c/mychannel", icon: "🔴" },
  whatsapp: { label: "WhatsApp Support Link", placeholder: "e.g. https://wa.me/myphone", icon: "🟢" },
  twitter: { label: "Twitter/X Profile Link", placeholder: "e.g. https://x.com/myprofile", icon: "✖️" }
};

window.drawDetectedSymbols = function(symbols = [], links = {}) {
  currentDetectedSymbols = symbols;
  const block = document.getElementById('detected-symbols-block');
  const badgesContainer = document.getElementById('detected-symbols-badges');
  const editorsContainer = document.getElementById('detected-symbols-editors');

  if (!block || !badgesContainer || !editorsContainer) return;

  if (symbols.length === 0) {
    block.style.display = 'none';
    return;
  }

  block.style.display = 'block';

  // Draw badges
  badgesContainer.innerHTML = symbols.map(sym => {
    const meta = ALL_POSSIBLE_SYMBOLS[sym] || { label: sym, icon: "🔗" };
    return `
      <span style="background: rgba(16, 185, 129, 0.12); color: #10b981; font-size: 0.72rem; font-weight: 800; border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 20px; padding: 4px 10px; display: inline-flex; align-items: center; gap: 4px;">
        ${meta.icon} ${sym.toUpperCase()}
      </span>
    `;
  }).join('');

  // Draw link editors
  editorsContainer.innerHTML = symbols.map(sym => {
    const meta = ALL_POSSIBLE_SYMBOLS[sym] || { label: sym, placeholder: "Enter link URL", icon: "🔗" };
    const val = links[sym] || '';
    return `
      <div style="text-align: left; margin-bottom: 8px;">
        <label style="font-size: 0.72rem; font-weight: bold; color: #94a3b8; display: block; margin-bottom: 4px;">${meta.icon} ${meta.label}</label>
        <input type="text" id="sym-link-${sym}" class="form-control" style="width: 100%; background: #0f172a; border-color: rgba(255,255,255,0.1); color: #fff;" value="${val}" placeholder="${meta.placeholder}" />
      </div>
    `;
  }).join('');
};

window.uploadMaintenanceMedia = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const isVideo = file.type.startsWith('video/');
  maintenanceMediaType = isVideo ? 'video' : 'image';

  // Show progress loader
  const loader = document.getElementById('video-analysis-loader');
  const statusTxt = document.getElementById('video-analysis-status');
  const progBar = document.getElementById('video-analysis-progress-bar');
  const previewImg = document.getElementById('s-maintenance-preview-img');
  const previewVideo = document.getElementById('s-maintenance-preview-video');
  const block = document.getElementById('detected-symbols-block');

  if (previewImg) previewImg.style.display = 'none';
  if (previewVideo) previewVideo.style.display = 'none';
  if (block) block.style.display = 'none';

  if (loader) {
    loader.style.display = 'block';
    if (progBar) progBar.style.style = 'width: 0%';
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    maintenanceMediaBase64 = e.target.result;

    // Simulate analysis scanning steps
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progBar) progBar.style.width = `${progress}%`;

      if (progress === 20) {
        if (statusTxt) statusTxt.textContent = "Initializing video decoder...";
      } else if (progress === 40) {
        if (statusTxt) statusTxt.textContent = "Decompressing video stream frames...";
      } else if (progress === 70) {
        if (statusTxt) statusTxt.textContent = "Scanning for brand marks & interactive buttons...";
      } else if (progress === 90) {
        if (statusTxt) statusTxt.textContent = "Performing symbol matrix mapping...";
      } else if (progress >= 100) {
        clearInterval(interval);
        if (loader) loader.style.display = 'none';

        // Auto-detect symbols based on filename keywords or defaults
        const fname = file.name.toLowerCase();
        const detected = [];
        if (fname.includes('discord')) detected.push('discord');
        if (fname.includes('telegram') || fname.includes('tele')) detected.push('telegram');
        if (fname.includes('instagram') || fname.includes('insta')) detected.push('instagram');
        if (fname.includes('youtube') || fname.includes('yt')) detected.push('youtube');
        if (fname.includes('whatsapp') || fname.includes('wa')) detected.push('whatsapp');
        if (fname.includes('twitter') || fname.includes('x')) detected.push('twitter');

        // Fallback: If no keywords match, detect standard platforms
        if (detected.length === 0) {
          detected.push('discord', 'telegram', 'instagram');
        }

        // Show previews
        if (isVideo) {
          if (previewVideo) {
            previewVideo.src = maintenanceMediaBase64;
            previewVideo.style.display = 'block';
          }
        } else {
          if (previewImg) {
            previewImg.src = maintenanceMediaBase64;
            previewImg.style.display = 'block';
          }
        }

        const nameSpan = document.getElementById('s-maintenance-file-name');
        const removeBtn = document.getElementById('s-maintenance-media-remove');
        if (nameSpan) nameSpan.textContent = file.name;
        if (removeBtn) removeBtn.style.display = 'inline-block';

        // Render detected symbols
        window.drawDetectedSymbols(detected, db.settings.symbolLinks || {});
        showToast('Optical Symbol analysis complete! Dynamic links loaded. ✅', 'success');
      }
    }, 250);
  };
  reader.readAsDataURL(file);
};

window.removeMaintenanceMedia = function() {
  maintenanceMediaBase64 = '';
  maintenanceMediaType = 'image';
  currentDetectedSymbols = [];
  
  const fileInput = document.getElementById('s-maintenance-file');
  if (fileInput) fileInput.value = '';

  const previewImg = document.getElementById('s-maintenance-preview-img');
  const previewVideo = document.getElementById('s-maintenance-preview-video');
  const nameSpan = document.getElementById('s-maintenance-file-name');
  const removeBtn = document.getElementById('s-maintenance-media-remove');
  const block = document.getElementById('detected-symbols-block');

  if (previewImg) { previewImg.src = ''; previewImg.style.display = 'none'; }
  if (previewVideo) { previewVideo.src = ''; previewVideo.style.display = 'none'; }
  if (nameSpan) nameSpan.textContent = 'No media selected';
  if (removeBtn) removeBtn.style.display = 'none';
  if (block) block.style.display = 'none';
};

window.saveMaintenanceExtra = async function() {
  const reason = document.getElementById('s-maintenance-reason').value;
  const status = document.getElementById('s-maintenance-status').value || 'IN PROGRESS';
  const pct = parseInt(document.getElementById('s-maintenance-pct').value) || 0;
  const task = document.getElementById('s-maintenance-task').value || '';
  const eta = document.getElementById('s-maintenance-eta').value || '';
  const discord = document.getElementById('s-maintenance-discord').value || '#';
  const telegram = document.getElementById('s-maintenance-telegram').value || '#';
  const instagram = document.getElementById('s-maintenance-instagram').value || '#';

  const previewImg = document.getElementById('s-maintenance-preview-img');
  const previewVideo = document.getElementById('s-maintenance-preview-video');
  
  let mediaVal = '';
  let mediaType = 'image';

  if (previewVideo && previewVideo.style.display === 'block') {
    mediaVal = previewVideo.src;
    mediaType = 'video';
  } else if (previewImg && previewImg.style.display === 'block') {
    mediaVal = previewImg.src;
    mediaType = 'image';
  }

  // Gather links for all currently analyzed/detected symbols
  const symbolLinks = {};
  currentDetectedSymbols.forEach(sym => {
    const input = document.getElementById(`sym-link-${sym}`);
    if (input) {
      symbolLinks[sym] = input.value;
    }
  });

  const showTextEl = document.getElementById('s-maintenance-show-text');
  const showText = showTextEl ? showTextEl.checked : true;

  try {
    const payload = {
      maintenanceReason: reason,
      maintenanceMedia: mediaVal,
      maintenanceMediaType: mediaType,
      maintenanceStatus: status,
      maintenancePercentage: pct,
      maintenanceTask: task,
      maintenanceEta: eta,
      maintenanceDiscord: discord,
      maintenanceTelegram: telegram,
      maintenanceInstagram: instagram,
      detectedSymbols: currentDetectedSymbols,
      symbolLinks: symbolLinks,
      maintenanceShowText: showText
    };
    await fetch(`${API}/settings`, { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(payload) 
    });
    db.settings = { ...db.settings, ...payload };
    showToast('Maintenance settings saved! ✅', 'success');
  } catch(e) {
    console.error(e);
    showToast('Error saving maintenance details', 'error');
  }
};

window.saveDevSocials = async function() {
  const payload = {
    devInstagramUrl: document.getElementById('s-dev-instagram-url').value.trim(),
    devInstagramEnabled: document.getElementById('s-dev-instagram-enabled').checked,
    devFacebookUrl: document.getElementById('s-dev-facebook-url').value.trim(),
    devFacebookEnabled: document.getElementById('s-dev-facebook-enabled').checked,
    devYoutubeUrl: document.getElementById('s-dev-youtube-url').value.trim(),
    devYoutubeEnabled: document.getElementById('s-dev-youtube-enabled').checked,
    devTelegramUrl: document.getElementById('s-dev-telegram-url').value.trim(),
    devTelegramEnabled: document.getElementById('s-dev-telegram-enabled').checked,
    devDiscordUrl: document.getElementById('s-dev-discord-url').value.trim(),
    devDiscordEnabled: document.getElementById('s-dev-discord-enabled').checked,
    devTwitterUrl: document.getElementById('s-dev-twitter-url').value.trim(),
    devTwitterEnabled: document.getElementById('s-dev-twitter-enabled').checked
  };
  try {
    await fetch(`${API}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    db.settings = { ...db.settings, ...payload };
    showToast('Developer socials saved! 🌐', 'success');
  } catch(e) {
    console.error(e);
    showToast('Error saving developer socials', 'error');
  }
};

window.renderFeedbacksList = function(feedbacks = []) {
  const tbody = document.getElementById('feedback-table-body');
  if (!tbody) return;

  if (feedbacks.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:var(--text-muted);">No feedback received yet.</td></tr>`;
    document.getElementById('feedback-avg-score').textContent = '0.0';
    document.getElementById('feedback-avg-stars').textContent = '☆☆☆☆☆';
    document.getElementById('feedback-total-count').textContent = '0 Ratings & Reviews';
    for (let i = 1; i <= 5; i++) {
      document.getElementById(`feedback-bar-${i}`).style.width = '0%';
      document.getElementById(`feedback-count-${i}`).textContent = '0';
    }
    return;
  }

  // Calculate stats
  let totalScore = 0;
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  feedbacks.forEach(f => {
    totalScore += f.score;
    counts[f.score] = (counts[f.score] || 0) + 1;
  });

  const avgScore = (totalScore / feedbacks.length).toFixed(1);
  const totalCount = feedbacks.length;

  document.getElementById('feedback-avg-score').textContent = avgScore;
  document.getElementById('feedback-total-count').textContent = `${totalCount} Ratings & Reviews`;

  // Draw average stars
  let starsHtml = '';
  const roundedScore = Math.round(avgScore);
  for (let i = 1; i <= 5; i++) {
    starsHtml += i <= roundedScore ? '★' : '☆';
  }
  document.getElementById('feedback-avg-stars').textContent = starsHtml;

  // Set progress bars
  for (let i = 1; i <= 5; i++) {
    const count = counts[i] || 0;
    const pct = ((count / totalCount) * 100).toFixed(0);
    document.getElementById(`feedback-bar-${i}`).style.width = `${pct}%`;
    document.getElementById(`feedback-count-${i}`).textContent = count;
  }

  // Build rows
  tbody.innerHTML = feedbacks.map(f => {
    let ratingStars = '';
    for (let i = 1; i <= 5; i++) {
      ratingStars += i <= f.score ? '<span style="color:#fbbf24;">★</span>' : '<span style="color:rgba(255,255,255,0.15)">☆</span>';
    }
    
    return `
      <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
        <td style="padding:12px 10px; font-size:0.78rem; color:var(--text-muted);">${f.date || 'N/A'}</td>
        <td style="padding:12px 10px; font-size:0.82rem; font-weight:bold; color:#fff;">${f.username || 'Anonymous'}</td>
        <td style="padding:12px 10px; font-size:1.15rem;">${ratingStars}</td>
        <td style="padding:12px 10px; font-size:0.82rem; color:rgba(255,255,255,0.85); white-space:pre-wrap;">${f.comment || '<span style="color:var(--text-muted); font-style:italic;">No comment</span>'}</td>
        <td style="padding:12px 10px; text-align:center;">
          <button class="btn btn-danger btn-sm" onclick="deleteFeedback('${f.id}')" style="padding:4px 8px; font-size:0.72rem;">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
};

window.deleteFeedback = async function(id) {
  if (!confirm('Are you sure you want to delete this user feedback entry?')) return;
  try {
    const res = await fetch(`${API}/feedbacks/${id}`, { method: 'DELETE' });
    if (res.ok) {
      db.feedbacks = db.feedbacks.filter(f => f.id !== id);
      renderFeedbacksList(db.feedbacks);
      showToast('Feedback entry deleted successfully.', 'success');
    } else {
      showToast('Failed to delete feedback entry.', 'error');
    }
  } catch(e) {
    console.error(e);
    showToast('Error deleting feedback', 'error');
  }
};

