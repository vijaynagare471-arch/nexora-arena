// =====================================================
// NEXORA ARENA — Backend Server (Firebase Cloud Functions Edition)
// =====================================================

const express = require('express');
const cors    = require('cors');
const admin   = require('firebase-admin');
const functions = require('firebase-functions');
const { AsyncLocalStorage } = require('async_hooks');

// Initialize Firebase Admin
admin.initializeApp();
const firestoreDb = admin.firestore();
const bucket = admin.storage().bucket();

const asyncLocalStorage = new AsyncLocalStorage();
const app  = express();

// ── Middleware ──────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

let currentDb = {};

// Load database from Firestore before handling request
app.use(async (req, res, next) => {
  try {
    const doc = await firestoreDb.collection('database').doc('main').get();
    if (doc.exists) {
      currentDb = doc.data();
    } else {
      console.log("Firestore main document not found. Attempting to seed from local db.json...");
      const fs = require('fs');
      const path = require('path');
      const localDbPath = path.join(__dirname, 'db.json');
      if (fs.existsSync(localDbPath)) {
        const localDb = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
        
        // Scan and upload all base64 media to Firebase Storage
        const uploadPromises = [];
        processBase64(localDb, uploadPromises);
        await Promise.all(uploadPromises);
        
        // Save the cleaned database to Firestore
        await firestoreDb.collection('database').doc('main').set(localDb);
        currentDb = localDb;
        console.log("Database seeded successfully from local db.json.");
      } else {
        currentDb = {};
      }
    }
  } catch (e) {
    console.error("Failed to load Firestore DB:", e);
    currentDb = {};
  }
  
  // Initialize default arrays if missing
  let changed = false;
  if (!currentDb.predictions_banners) {
    currentDb.predictions_banners = [
      {
        id: "PB_001",
        title: "IND VS PAK T20 MATCH",
        subtitle: "Predict winner & win ₹50,000 points!",
        game: "All Games",
        type: "Predict & Win",
        active: true,
        color: "#8b5cf6,#db2777",
        action: { type: "page", page: "predictions" },
        buttons: [
          { label: "Predict Now", style: "primary", action: "page", page: "predictions" }
        ],
        hideText: false
      }
    ];
    changed = true;
  }
  if (!currentDb.qrPaymentSettings) {
    currentDb.qrPaymentSettings = {
      upiId: "9689901416.wallet@phonepe",
      qrImage: "assets/qr_payment_default.jpg"
    };
    changed = true;
  }
  if (!currentDb.qrPaymentRequests) {
    currentDb.qrPaymentRequests = [];
    changed = true;
  }
  if (changed) {
    try {
      await firestoreDb.collection('database').doc('main').set(currentDb);
    } catch(err) {
      console.error("Failed to save default DB template:", err);
    }
  }

  // Set up request context and pending writes tracker
  req.pendingWrites = [];
  
  // Override res.send to wait for all background Firestore writes
  const originalSend = res.send;
  res.send = async function (body) {
    if (req.pendingWrites.length > 0) {
      try {
        await Promise.all(req.pendingWrites);
      } catch (e) {
        console.error("Failed to flush pending writes:", e);
      }
    }
    return originalSend.call(this, body);
  };

  // Run downstream handlers inside AsyncLocalStorage context
  asyncLocalStorage.run({ req, res }, () => {
    next();
  });
});

// ── Check Ban Middleware ────────────────────────────
function checkBan(req, res, next) {
  const db = readDB();
  const userId = req.body.userId || req.query.userId || req.params.userId || req.params.id;
  if (userId && db.users) {
    const user = db.users.find(u => u.id === userId);
    if (user && user.status === 'banned') {
      return res.status(403).json({ error: 'Your account is suspended. Action denied.' });
    }
  }
  next();
}

// Enforce bans on user action paths
app.post(/^\/api\/casino\/.+/, checkBan);
app.post(/^\/api\/predictions\/submit.*/, checkBan);
app.post(/^\/api\/tournaments\/.+\/join/, checkBan);
app.post('/api/withdrawals', checkBan);
app.post('/api/tickets', checkBan);
app.post(/^\/api\/tickets\/.+\/replies/, checkBan);
app.post('/api/qr-payment/request', checkBan);

// ── DB Helpers ──────────────────────────────────────
function readDB() {
  return currentDb;
}

function writeDB(data) {
  currentDb = data;
  
  // Deep clone to prevent mutating internal cache
  const cleanData = JSON.parse(JSON.stringify(data));
  
  // Scan and upload base64 strings to Storage
  const uploadPromises = [];
  processBase64(cleanData, uploadPromises);
  
  const writePromise = Promise.all(uploadPromises).then(async () => {
    await firestoreDb.collection('database').doc('main').set(cleanData);
    console.log("Successfully wrote updated DB state to Firestore.");
  }).catch(err => {
    console.error("Firestore sync write failed:", err);
  });
  
  // Attach promise to current express request context
  const context = asyncLocalStorage.getStore();
  if (context && context.req) {
    context.req.pendingWrites.push(writePromise);
  }
}

function processBase64(obj, promises) {
  if (Array.isArray(obj)) {
    obj.forEach((item, idx) => {
      if (typeof item === 'string' && (item.startsWith('data:image/') || item.startsWith('data:video/'))) {
        promises.push(uploadBase64Field(obj, idx, item));
      } else {
        processBase64(item, promises);
      }
    });
  } else if (typeof obj === 'object' && obj !== null) {
    for (let key in obj) {
      if (typeof obj[key] === 'string' && (obj[key].startsWith('data:image/') || obj[key].startsWith('data:video/'))) {
        promises.push(uploadBase64Field(obj, key, obj[key]));
      } else {
        processBase64(obj[key], promises);
      }
    }
  }
}

async function uploadBase64Field(parentObj, key, base64Str) {
  try {
    const matches = base64Str.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return;
    
    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Determine extension
    let extension = 'png';
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) extension = 'jpg';
    else if (mimeType.includes('gif')) extension = 'gif';
    else if (mimeType.includes('mp4')) extension = 'mp4';
    else if (mimeType.includes('webm')) extension = 'webm';
    
    const filename = `uploads/media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${extension}`;
    const file = bucket.file(filename);
    
    await file.save(buffer, {
      metadata: { contentType: mimeType }
    });
    await file.makePublic();
    
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
    parentObj[key] = publicUrl;
    console.log(`Successfully uploaded base64 to Storage: ${publicUrl}`);
  } catch (err) {
    console.error("Failed to upload base64 image:", err);
  }
}

function generateId(prefix) {
  return prefix + Date.now().toString(36).toUpperCase();
}

// ── SSE Broadcast (NO-OP for Cloud Functions) ────────
function broadcast(event, data) {
  console.log(`[SSE Broadcast Simulated] event: ${event}`);
}

// ════════════════════════════════════════════════════
// API ROUTES
// ════════════════════════════════════════════════════

// ── Full Data ───────────────────────────────────────
app.get('/api/data', (req, res) => {
  res.json(readDB());
});

// ── Stats ───────────────────────────────────────────
app.get('/api/stats', (req, res) => {
  const db = readDB();
  res.json(db.stats);
});

app.put('/api/stats', (req, res) => {
  const db = readDB();
  db.stats = { ...db.stats, ...req.body };
  writeDB(db);
  broadcast('stats_updated', db.stats);
  res.json(db.stats);
});

// ── Settings ────────────────────────────────────────
app.get('/api/settings', (req, res) => {
  res.json(readDB().settings);
});

app.put('/api/settings', (req, res) => {
  const db = readDB();
  db.settings = { ...db.settings, ...req.body };
  writeDB(db);
  broadcast('settings_updated', db.settings);
  res.json(db.settings);
});

// ── Leaderboard ──────────────────────────────────────
app.get('/api/leaderboard', (req, res) => {
  const db = readDB();
  const s = db.settings || {};
  const mode = s.leaderboardMode || 'automatic';
  
  if (mode === 'manual') {
    if (!db.leaderboard || db.leaderboard.length === 0) {
      db.leaderboard = [
        { "rank": 1, "username": "Vijay_Arena", "earnings": 25000, "wins": 82 },
        { "rank": 2, "username": "Arjun_Verma", "earnings": 22000, "wins": 75 },
        { "rank": 3, "username": "Rohit_Pro", "earnings": 19500, "wins": 68 },
        { "rank": 4, "username": "Priya_King", "earnings": 17000, "wins": 59 },
        { "rank": 5, "username": "Karan_Mehta", "earnings": 15500, "wins": 52 },
        { "rank": 6, "username": "Sneha_Op", "earnings": 14000, "wins": 48 },
        { "rank": 7, "username": "Aditya_Elite", "earnings": 12500, "wins": 41 },
        { "rank": 8, "username": "Vikram_Bot", "earnings": 11000, "wins": 36 },
        { "rank": 9, "username": "Pooja_Verma", "earnings": 9800, "wins": 30 },
        { "rank": 10, "username": "Neha_Queen", "earnings": 8500, "wins": 25 }
      ];
      writeDB(db);
    }
    return res.json(db.leaderboard);
  } else {
    const metric = s.leaderboardMetric || 'spent';
    const users = db.users || [];
    
    const sortedUsers = [...users].sort((a, b) => {
      const valA = a[metric] || 0;
      const valB = b[metric] || 0;
      return valB - valA;
    });
    
    const formatted = sortedUsers.slice(0, 10).map((u, idx) => {
      const wins = u.tournaments || 0;
      const earnings = u.spent ? Math.round(u.spent * 0.45) : 0;
      return {
        rank: idx + 1,
        username: u.name || 'Player',
        earnings: earnings,
        wins: wins
      };
    });
    
    return res.json(formatted);
  }
});

app.put('/api/leaderboard', (req, res) => {
  const db = readDB();
  db.leaderboard = req.body;
  writeDB(db);
  broadcast('leaderboard_updated', db.leaderboard);
  res.json(db.leaderboard);
});

// ── Feedbacks & Ratings ───────────────────────────────
app.get('/api/feedbacks', (req, res) => {
  const db = readDB();
  res.json(db.feedbacks || []);
});

app.post('/api/feedbacks', (req, res) => {
  const db = readDB();
  if (!db.feedbacks) db.feedbacks = [];
  
  const newFeedback = {
    id: Date.now().toString(),
    userId: req.body.userId || 'guest',
    username: req.body.username || 'Anonymous',
    score: Number(req.body.score) || 5,
    comment: req.body.comment || '',
    date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  };
  
  db.feedbacks.unshift(newFeedback);
  writeDB(db);
  broadcast('feedbacks_updated', db.feedbacks);
  res.json(newFeedback);
});

app.delete('/api/feedbacks/:id', (req, res) => {
  const db = readDB();
  if (!db.feedbacks) db.feedbacks = [];
  db.feedbacks = db.feedbacks.filter(f => f.id !== req.params.id);
  writeDB(db);
  broadcast('feedbacks_updated', db.feedbacks);
  res.json({ success: true });
});

// ── Tournaments ─────────────────────────────────────
app.get('/api/tournaments', (req, res) => {
  res.json(readDB().tournaments);
});

app.post('/api/tournaments', (req, res) => {
  const db = readDB();
  const t = { id: generateId('T'), ...req.body, registered: 0, filled: 0 };
  db.tournaments.unshift(t);
  writeDB(db);
  broadcast('tournaments_updated', db.tournaments);
  res.status(201).json(t);
});

app.put('/api/tournaments/:id', (req, res) => {
  const db = readDB();
  const idx = db.tournaments.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.tournaments[idx] = { ...db.tournaments[idx], ...req.body };
  writeDB(db);
  broadcast('tournaments_updated', db.tournaments);
  res.json(db.tournaments[idx]);
});

app.delete('/api/tournaments/:id', (req, res) => {
  const db = readDB();
  db.tournaments = db.tournaments.filter(t => t.id !== req.params.id);
  writeDB(db);
  broadcast('tournaments_updated', db.tournaments);
  res.json({ success: true });
});

app.post('/api/tournaments/:id/join', (req, res) => {
  const { userId, gameUsername } = req.body;
  if (!userId || !gameUsername) {
    return res.status(400).json({ error: 'userId and gameUsername are required' });
  }

  const db = readDB();
  const tIdx = db.tournaments.findIndex(t => t.id === req.params.id);
  if (tIdx === -1) return res.status(404).json({ error: 'Tournament not found' });
  
  const t = db.tournaments[tIdx];
  const uIdx = db.users.findIndex(u => u.id === userId);
  if (uIdx === -1) return res.status(404).json({ error: 'User not found' });
  
  const user = db.users[uIdx];
  const fee = parseInt(t.fee) || 0;
  
  if ((user.balance || 0) < fee) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }

  if (!t.joinedUsers) t.joinedUsers = [];
  
  if (t.joinedUsers.some(ju => ju.userId === userId)) {
    return res.status(400).json({ error: 'Already joined this tournament' });
  }

  user.balance = (user.balance || 0) - fee;
  
  const txn = {
    id: 'TXN' + Date.now().toString().slice(-6),
    userId,
    type: 'joined',
    desc: 'Joined Tournament',
    sub: `${t.name} — ${new Date().toLocaleDateString('en-IN')}`,
    amount: -fee,
    method: 'Wallet',
    date: new Date().toLocaleDateString('en-IN')
  };
  db.transactions = db.transactions || [];
  db.transactions.unshift(txn);

  t.joinedUsers.push({
    userId,
    username: user.name || user.username || 'User',
    gameUsername,
    joinedAt: new Date().toISOString()
  });
  
  t.registered = (t.registered || 0) + 1;
  t.filled = t.registered;

  writeDB(db);
  
  broadcast('tournaments_updated', db.tournaments);
  broadcast('users_updated', db.users);
  broadcast('transactions_updated', db.transactions);
  
  res.json({ success: true, tournament: t, user });
});

app.post('/api/tournaments/:id/complete', (req, res) => {
  const { winners } = req.body;
  const db = readDB();
  const tIdx = db.tournaments.findIndex(t => t.id === req.params.id);
  if (tIdx === -1) return res.status(404).json({ error: 'Tournament not found' });

  const t = db.tournaments[tIdx];
  t.status = 'completed';
  
  t.winners = {
    first: winners.first ? {
      userId: winners.first.userId,
      gameUsername: winners.first.gameUsername || 'Player',
      prize: winners.first.prize || 0
    } : null,
    second: winners.second ? {
      userId: winners.second.userId,
      gameUsername: winners.second.gameUsername || 'Player',
      prize: winners.second.prize || 0
    } : null,
    third: winners.third ? {
      userId: winners.third.userId,
      gameUsername: winners.third.gameUsername || 'Player',
      prize: winners.third.prize || 0
    } : null
  };

  const places = ['first', 'second', 'third'];
  places.forEach(place => {
    const win = t.winners[place];
    if (win && win.userId && win.prize > 0) {
      const uIdx = db.users.findIndex(u => u.id === win.userId);
      if (uIdx !== -1) {
        db.users[uIdx].balance = (db.users[uIdx].balance || 0) + win.prize;
        
        const txn = {
          id: 'TXN' + Date.now().toString().slice(-6) + place[0].toUpperCase(),
          userId: win.userId,
          type: 'credit',
          desc: 'Won Tournament',
          sub: `${t.name} — ${place.toUpperCase()} Place`,
          amount: win.prize,
          method: 'Wallet',
          date: new Date().toLocaleDateString('en-IN')
        };
        db.transactions = db.transactions || [];
        db.transactions.unshift(txn);
      }
    }
  });

  writeDB(db);
  broadcast('tournaments_updated', db.tournaments);
  broadcast('users_updated', db.users);
  broadcast('transactions_updated', db.transactions);

  res.json({ success: true, tournament: t });
});

// ── Games ────────────────────────────────────────────
app.get('/api/games', (req, res) => {
  res.json(readDB().games);
});

app.post('/api/games', (req, res) => {
  const db = readDB();
  const g = { id: generateId('G'), tournaments: 0, active: true, ...req.body };
  db.games.push(g);
  writeDB(db);
  broadcast('games_updated', db.games);
  res.status(201).json(g);
});

app.put('/api/games/:id', (req, res) => {
  const db = readDB();
  const idx = db.games.findIndex(g => g.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.games[idx] = { ...db.games[idx], ...req.body };
  writeDB(db);
  broadcast('games_updated', db.games);
  res.json(db.games[idx]);
});

app.delete('/api/games/:id', (req, res) => {
  const db = readDB();
  db.games = db.games.filter(g => g.id !== req.params.id);
  writeDB(db);
  broadcast('games_updated', db.games);
  res.json({ success: true });
});

// ── Users ────────────────────────────────────────────
app.get('/api/users', (req, res) => {
  res.json(readDB().users);
});

app.get('/api/users/:id', (req, res) => {
  const db = readDB();
  const u = db.users.find(x => x.id === req.params.id);
  if (!u) return res.status(404).json({ error: 'Not found' });
  res.json(u);
});

app.post('/api/users', (req, res) => {
  const db = readDB();
  const u = { id: generateId('GA'), ...req.body };
  db.users.push(u);
  writeDB(db);
  broadcast('users_updated', db.users);
  res.status(201).json(u);
});

app.put('/api/users/:id', (req, res) => {
  const db = readDB();
  let idx = db.users.findIndex(u => u.id === req.params.id);
  if (idx === -1) {
    const newUser = {
      id: req.params.id,
      name: 'NexoraPlayer',
      phone: '',
      email: '',
      balance: 0,
      tournaments: 0,
      spent: 0,
      status: 'Active',
      joined: new Date().toLocaleDateString('en-IN'),
      verificationStatus: 'Verified',
      ...req.body
    };
    db.users.push(newUser);
    writeDB(db);
    broadcast('users_updated', db.users);
    return res.json(newUser);
  }
  db.users[idx] = { ...db.users[idx], ...req.body };
  writeDB(db);
  broadcast('users_updated', db.users);
  res.json(db.users[idx]);
});

// ── Transactions ─────────────────────────────────────
app.get('/api/transactions', (req, res) => {
  res.json(readDB().transactions);
});

app.post('/api/transactions', (req, res) => {
  const db = readDB();
  const tx = { id: generateId('TXN'), date: new Date().toLocaleString('en-IN'), ...req.body };
  db.transactions.unshift(tx);
  writeDB(db);
  broadcast('transactions_updated', db.transactions);
  res.status(201).json(tx);
});

// ── Withdrawals ──────────────────────────────────────
app.get('/api/withdrawals', (req, res) => {
  res.json(readDB().withdrawals);
});

app.post('/api/withdrawals', (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.body.userId || u.name === req.body.user);
  if (user && user.kycStatus !== 'approved') {
    return res.status(400).json({ error: 'Complete KYC to enable withdrawals.' });
  }
  const w = { id: generateId('WD'), ...req.body };
  db.withdrawals.unshift(w);
  writeDB(db);
  broadcast('withdrawals_updated', db.withdrawals);
  res.status(201).json(w);
});

app.put('/api/withdrawals/:id', (req, res) => {
  const db = readDB();
  const idx = db.withdrawals.findIndex(w => w.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  
  const oldWd = db.withdrawals[idx];
  const newWd = { ...oldWd, ...req.body };

  // Refund logic if withdrawal is transitioning to rejected
  if (oldWd.status !== 'rejected' && newWd.status === 'rejected') {
    const user = db.users.find(u => u.id === oldWd.userId || u.name === oldWd.user);
    if (user) {
      user.balance = (user.balance || 0) + oldWd.amount;
      
      const txn = {
        id: 'TXN' + Date.now().toString().slice(-6) + 'R',
        userId: user.id,
        user: user.name,
        type: 'refund',
        desc: 'Withdraw Rejected Refund',
        sub: `Refund for Withdraw Request #${oldWd.id}`,
        amount: oldWd.amount,
        method: 'Wallet',
        date: new Date().toLocaleDateString('en-IN')
      };
      db.transactions = db.transactions || [];
      db.transactions.unshift(txn);
    }
  }

  db.withdrawals[idx] = newWd;
  writeDB(db);
  
  broadcast('withdrawals_updated', db.withdrawals);
  broadcast('users_updated', db.users);
  broadcast('transactions_updated', db.transactions);
  
  res.json(db.withdrawals[idx]);
});

// ── Banners ──────────────────────────────────────────
app.get('/api/banners', (req, res) => {
  res.json(readDB().banners);
});

app.post('/api/banners', (req, res) => {
  const db = readDB();
  const b = { id: generateId('B'), active: true, ...req.body };
  db.banners.push(b);
  writeDB(db);
  broadcast('banners_updated', db.banners);
  res.status(201).json(b);
});

app.put('/api/banners/:id', (req, res) => {
  const db = readDB();
  const idx = db.banners.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.banners[idx] = { ...db.banners[idx], ...req.body };
  writeDB(db);
  broadcast('banners_updated', db.banners);
  res.json(db.banners[idx]);
});

app.delete('/api/banners/:id', (req, res) => {
  const db = readDB();
  db.banners = db.banners.filter(b => b.id !== req.params.id);
  writeDB(db);
  broadcast('banners_updated', db.banners);
  res.json({ success: true });
});

// ── Predictions Banners ─────────────────────────────
app.get('/api/predictions_banners', (req, res) => {
  const db = readDB();
  res.json(db.predictions_banners || []);
});

app.post('/api/predictions_banners', (req, res) => {
  const db = readDB();
  if (!db.predictions_banners) db.predictions_banners = [];
  const b = { id: generateId('PB'), active: true, ...req.body };
  db.predictions_banners.push(b);
  writeDB(db);
  broadcast('predictions_banners_updated', db.predictions_banners);
  res.status(201).json(b);
});

app.put('/api/predictions_banners/:id', (req, res) => {
  const db = readDB();
  if (!db.predictions_banners) db.predictions_banners = [];
  const idx = db.predictions_banners.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.predictions_banners[idx] = { ...db.predictions_banners[idx], ...req.body };
  writeDB(db);
  broadcast('predictions_banners_updated', db.predictions_banners);
  res.json(db.predictions_banners[idx]);
});

app.delete('/api/predictions_banners/:id', (req, res) => {
  const db = readDB();
  if (!db.predictions_banners) db.predictions_banners = [];
  db.predictions_banners = db.predictions_banners.filter(b => b.id !== req.params.id);
  writeDB(db);
  broadcast('predictions_banners_updated', db.predictions_banners);
  res.json({ success: true });
});

// ── Notices ──────────────────────────────────────────
app.get('/api/notices', (req, res) => {
  res.json(readDB().notices);
});

app.post('/api/notices', (req, res) => {
  const db = readDB();
  const n = { id: generateId('N'), date: new Date().toLocaleDateString('en-IN'), active: true, ...req.body };
  db.notices.unshift(n);
  
  // Also create a notification entry
  if (!db.notifications) db.notifications = [];
  db.notifications.unshift({
    id: generateId('NT'),
    title: n.title,
    body: n.content || n.title,
    date: new Date().toLocaleString('en-IN'),
    read: false,
    screen: 'home'
  });
  
  writeDB(db);
  broadcast('notices_updated', db.notices);
  broadcast('notifications_updated', db.notifications);
  res.status(201).json(n);
});

app.delete('/api/notices/:id', (req, res) => {
  const db = readDB();
  db.notices = db.notices.filter(n => n.id !== req.params.id);
  writeDB(db);
  broadcast('notices_updated', db.notices);
  res.json({ success: true });
});

// ── Notifications ────────────────────────────────────
app.get('/api/notifications', (req, res) => {
  res.json(readDB().notifications || []);
});

app.post('/api/notifications', (req, res) => {
  const db = readDB();
  if (!db.notifications) db.notifications = [];
  const notif = {
    id: generateId('NT'),
    title: req.body.title || 'Announcement',
    body: req.body.body || '',
    date: new Date().toLocaleString('en-IN'),
    read: false,
    screen: req.body.screen || 'home'
  };
  db.notifications.unshift(notif);
  writeDB(db);
  broadcast('notifications_updated', db.notifications);
  res.status(201).json(notif);
});

app.put('/api/notifications/read', (req, res) => {
  const db = readDB();
  if (db.notifications) {
    db.notifications.forEach(n => n.read = true);
    writeDB(db);
    broadcast('notifications_updated', db.notifications);
  }
  res.json({ success: true });
});

app.delete('/api/notifications/:id', (req, res) => {
  const db = readDB();
  if (db.notifications) {
    db.notifications = db.notifications.filter(n => n.id !== req.params.id);
    writeDB(db);
    broadcast('notifications_updated', db.notifications);
  }
  res.json({ success: true });
});

app.delete('/api/notifications', (req, res) => {
  const db = readDB();
  db.notifications = [];
  writeDB(db);
  broadcast('notifications_updated', db.notifications);
  res.json({ success: true });
});

// ── Support Settings ─────────────────────────────────
app.get('/api/support-settings', (req, res) => {
  const db = readDB();
  if (!db.supportSettings) {
    db.supportSettings = {
      email: 'support@nexoraarena.com',
      phone: '+91 98765 43210',
      website: 'https://nexoraarena.com',
      address: 'Nexora Arena, 2nd Floor, Pune, Maharashtra - 411001',
      workingHours: 'Mon - Sat (10:00 AM - 8:00 PM)'
    };
    writeDB(db);
  }
  res.json(db.supportSettings);
});

app.post('/api/support-settings', (req, res) => {
  const db = readDB();
  db.supportSettings = { ...db.supportSettings, ...req.body };
  writeDB(db);
  broadcast('support_settings_updated', db.supportSettings);
  res.json(db.supportSettings);
});

// ── Employee & Role Management System ─────────────────
function initEmployeeData(db) {
  let changed = false;
  if (!db.departments) {
    db.departments = [
      { id: "dept_1", name: "Management", status: "Active" },
      { id: "dept_2", name: "Support", status: "Active" },
      { id: "dept_3", name: "Finance", status: "Active" },
      { id: "dept_4", name: "Content", status: "Inactive" },
      { id: "dept_5", name: "Tournament", status: "Active" }
    ];
    changed = true;
  }
  if (!db.roles) {
    db.roles = [
      {
        id: "role_1",
        name: "Super Admin",
        desc: "Full access to all modules",
        employees: 2,
        status: "Active",
        permissions: {
          viewDash: true,
          viewTickets: true, replyTickets: true, deleteTickets: true,
          viewTournaments: true, createTournaments: true, editTournaments: true,
          viewUsers: true, editUsers: true, deleteUsers: true
        }
      },
      {
        id: "role_2",
        name: "Admin",
        desc: "All modules access",
        employees: 5,
        status: "Active",
        permissions: {
          viewDash: true,
          viewTickets: true, replyTickets: true, deleteTickets: false,
          viewTournaments: true, createTournaments: true, editTournaments: true,
          viewUsers: true, editUsers: true, deleteUsers: false
        }
      },
      {
        id: "role_3",
        name: "Support Manager",
        desc: "Manage support tickets and replies",
        employees: 3,
        status: "Active",
        permissions: {
          viewDash: true,
          viewTickets: true, replyTickets: true, deleteTickets: false,
          viewTournaments: false, createTournaments: false, editTournaments: false,
          viewUsers: false, editUsers: false, deleteUsers: false
        }
      },
      {
        id: "role_4",
        name: "Finance Executive",
        desc: "Manage finance & transactions",
        employees: 2,
        status: "Active",
        permissions: {
          viewDash: true,
          viewTickets: false, replyTickets: false, deleteTickets: false,
          viewTournaments: false, createTournaments: false, editTournaments: false,
          viewUsers: true, editUsers: false, deleteUsers: false
        }
      },
      {
        id: "role_5",
        name: "Content Writer",
        desc: "Manage content & pages",
        employees: 2,
        status: "Inactive",
        permissions: {
          viewDash: false,
          viewTickets: false, replyTickets: false, deleteTickets: false,
          viewTournaments: true, createTournaments: false, editTournaments: false,
          viewUsers: false, editUsers: false, deleteUsers: false
        }
      }
    ];
    changed = true;
  }
  if (!db.employees) {
    db.employees = [
      { id: "EMP001", name: "Vijay Nagare", email: "vijay@gmail.com", phone: "+91 98765 43210", roleId: "role_1", deptId: "dept_1", status: "Active", joinedAt: "12 Jun 2024" },
      { id: "EMP002", name: "Rohit Sharma", email: "rohit@gmail.com", phone: "+91 98765 12345", roleId: "role_3", deptId: "dept_2", status: "Active", joinedAt: "10 Jun 2024" },
      { id: "EMP003", name: "Pooja Verma", email: "pooja@gmail.com", phone: "+91 98765 54321", roleId: "role_4", deptId: "dept_3", status: "Active", joinedAt: "08 Jun 2024" },
      { id: "EMP004", name: "Karan Mehta", email: "karan@gmail.com", phone: "+91 98765 67890", roleId: "role_2", deptId: "dept_5", status: "Inactive", joinedAt: "05 Jun 2024" },
      { id: "EMP005", name: "Neha Singh", email: "neha@gmail.com", phone: "+91 98765 98765", roleId: "role_5", deptId: "dept_4", status: "Active", joinedAt: "03 Jun 2024" }
    ];
    changed = true;
  }
  if (!db.employeeActivityLogs) {
    db.employeeActivityLogs = [
      { id: "LOG001", employee: "Rohit Sharma", action: "Replied Ticket", desc: "Replied to TK-2026-0001", time: "12 Jun 2024, 11:45 AM" },
      { id: "LOG002", employee: "Pooja Verma", action: "Closed Ticket", desc: "Closed TK-2026-0003", time: "12 Jun 2024, 11:38 AM" },
      { id: "LOG003", employee: "Karan Mehta", action: "Updated User", desc: "Updated user details", time: "12 Jun 2024, 11:10 AM" },
      { id: "LOG004", employee: "Neha Singh", action: "Created Tournament", desc: "Created tournament BGMI Cup", time: "12 Jun 2024, 10:50 AM" },
      { id: "LOG005", employee: "Rohit Sharma", action: "Assigned Ticket", desc: "Assigned ticket to Pooja Verma", time: "12 Jun 2024, 10:20 AM" },
      { id: "LOG006", employee: "Vijay Nagare", action: "Added Employee", desc: "Added new employee Rohit Sharma", time: "12 Jun 2024, 09:45 AM" }
    ];
    changed = true;
  }
  if (!db.employeeTasks) {
    db.employeeTasks = [
      { id: "TSK001", task: "Reply pending tickets", assignedTo: "Rohit Sharma", dueDate: "2026-06-15", status: "In Progress" },
      { id: "TSK002", task: "Check payment issues", assignedTo: "Pooja Verma", dueDate: "2026-06-18", status: "Pending" },
      { id: "TSK003", task: "Update tournament rules", assignedTo: "Karan Mehta", dueDate: "2026-06-16", status: "Completed" },
      { id: "TSK004", task: "Add new banner", assignedTo: "Neha Singh", dueDate: "2026-06-19", status: "Pending" },
      { id: "TSK005", task: "Monthly report", assignedTo: "Rohit Sharma", dueDate: "2026-06-20", status: "Pending" }
    ];
    changed = true;
  }
  if (!db.employeeSettings) {
    db.employeeSettings = {
      enableModule: true,
      allowSignup: false,
      requireApproval: true,
      allowMemberView: true,
      allowProfileEdit: true,
      allowPasswordChange: true
    };
    changed = true;
  }
  if (changed) {
    writeDB(db);
  }
}

app.get('/api/employees', (req, res) => {
  const db = readDB();
  initEmployeeData(db);
  res.json(db.employees || []);
});

app.post('/api/employees', (req, res) => {
  const db = readDB();
  initEmployeeData(db);
  const nextNum = (db.employees || []).length + 1;
  const id = `EMP${String(nextNum).padStart(3, '0')}`;
  const emp = {
    id,
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone || '+91 98765 43210',
    roleId: req.body.roleId,
    deptId: req.body.deptId,
    status: req.body.status || 'Active',
    joinedAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  };
  db.employees.push(emp);
  writeDB(db);
  broadcast('employees_updated', db.employees);
  res.json(emp);
});

app.put('/api/employees/:id', (req, res) => {
  const db = readDB();
  const empIndex = (db.employees || []).findIndex(e => e.id === req.params.id);
  if (empIndex === -1) return res.status(404).json({ error: 'Employee not found' });
  db.employees[empIndex] = { ...db.employees[empIndex], ...req.body };
  writeDB(db);
  broadcast('employees_updated', db.employees);
  res.json(db.employees[empIndex]);
});

app.post('/api/employees/:id/reset-password', (req, res) => {
  res.json({ success: true, message: 'Password reset successful' });
});

app.delete('/api/employees/:id', (req, res) => {
  const db = readDB();
  db.employees = (db.employees || []).filter(e => e.id !== req.params.id);
  writeDB(db);
  broadcast('employees_updated', db.employees);
  res.json({ success: true });
});

app.get('/api/roles', (req, res) => {
  const db = readDB();
  initEmployeeData(db);
  res.json(db.roles || []);
});

app.post('/api/roles', (req, res) => {
  const db = readDB();
  initEmployeeData(db);
  const id = `role_${Date.now()}`;
  const role = {
    id,
    name: req.body.name,
    desc: req.body.desc,
    employees: 0,
    status: 'Active',
    permissions: req.body.permissions || {}
  };
  db.roles.push(role);
  writeDB(db);
  broadcast('roles_updated', db.roles);
  res.json(role);
});

app.put('/api/roles/:id', (req, res) => {
  const db = readDB();
  const index = (db.roles || []).findIndex(r => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Role not found' });
  db.roles[index] = { ...db.roles[index], ...req.body };
  writeDB(db);
  broadcast('roles_updated', db.roles);
  res.json(db.roles[index]);
});

app.delete('/api/roles/:id', (req, res) => {
  const db = readDB();
  db.roles = (db.roles || []).filter(r => r.id !== req.params.id);
  writeDB(db);
  broadcast('roles_updated', db.roles);
  res.json({ success: true });
});

app.get('/api/employee-activity-logs', (req, res) => {
  const db = readDB();
  initEmployeeData(db);
  res.json(db.employeeActivityLogs || []);
});

app.get('/api/employee-tasks', (req, res) => {
  const db = readDB();
  initEmployeeData(db);
  res.json(db.employeeTasks || []);
});

app.post('/api/employee-tasks', (req, res) => {
  const db = readDB();
  initEmployeeData(db);
  const nextNum = (db.employeeTasks || []).length + 1;
  const id = `TSK${String(nextNum).padStart(3, '0')}`;
  const task = {
    id,
    task: req.body.task,
    assignedTo: req.body.assignedTo,
    dueDate: req.body.dueDate,
    status: 'Pending'
  };
  db.employeeTasks.push(task);
  writeDB(db);
  broadcast('tasks_updated', db.employeeTasks);
  res.json(task);
});

app.put('/api/employee-tasks/:id', (req, res) => {
  const db = readDB();
  const index = (db.employeeTasks || []).findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Task not found' });
  db.employeeTasks[index] = { ...db.employeeTasks[index], ...req.body };
  writeDB(db);
  broadcast('tasks_updated', db.employeeTasks);
  res.json(db.employeeTasks[index]);
});

app.delete('/api/employee-tasks/:id', (req, res) => {
  const db = readDB();
  db.employeeTasks = (db.employeeTasks || []).filter(t => t.id !== req.params.id);
  writeDB(db);
  broadcast('tasks_updated', db.employeeTasks);
  res.json({ success: true });
});

app.get('/api/departments', (req, res) => {
  const db = readDB();
  initEmployeeData(db);
  res.json(db.departments || []);
});

app.post('/api/departments', (req, res) => {
  const db = readDB();
  initEmployeeData(db);
  const id = `dept_${Date.now()}`;
  const dept = {
    id,
    name: req.body.name,
    status: req.body.status || 'Active'
  };
  db.departments.push(dept);
  writeDB(db);
  broadcast('departments_updated', db.departments);
  res.json(dept);
});

app.put('/api/departments/:id', (req, res) => {
  const db = readDB();
  const index = (db.departments || []).findIndex(d => d.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Department not found' });
  db.departments[index] = { ...db.departments[index], ...req.body };
  writeDB(db);
  broadcast('departments_updated', db.departments);
  res.json(db.departments[index]);
});

app.delete('/api/departments/:id', (req, res) => {
  const db = readDB();
  db.departments = (db.departments || []).filter(d => d.id !== req.params.id);
  writeDB(db);
  broadcast('departments_updated', db.departments);
  res.json({ success: true });
});

app.get('/api/employee-settings', (req, res) => {
  const db = readDB();
  initEmployeeData(db);
  res.json(db.employeeSettings);
});

app.post('/api/employee-settings', (req, res) => {
  const db = readDB();
  initEmployeeData(db);
  db.employeeSettings = { ...db.employeeSettings, ...req.body };
  writeDB(db);
  broadcast('employee_settings_updated', db.employeeSettings);
  res.json(db.employeeSettings);
});

// ── Support Tickets ──────────────────────────────────
app.get('/api/tickets', (req, res) => {
  const db = readDB();
  res.json(db.tickets || []);
});

app.get('/api/tickets/:id', (req, res) => {
  const db = readDB();
  const ticket = (db.tickets || []).find(t => t.id === req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  res.json(ticket);
});

app.post('/api/tickets', (req, res) => {
  const db = readDB();
  if (!db.tickets) db.tickets = [];
  
  const year = new Date().getFullYear();
  const lastTicket = db.tickets[0];
  let seq = 1;
  if (lastTicket && lastTicket.id.startsWith(`NX-${year}-`)) {
    const lastSeq = parseInt(lastTicket.id.split('-')[2]);
    if (!isNaN(lastSeq)) seq = lastSeq + 1;
  }
  const ticketId = `NX-${year}-${String(seq).padStart(4, '0')}`;

  const ticket = {
    id: ticketId,
    user: req.body.user || 'NexoraPlayer',
    userId: req.body.userId || 'NKAJ890',
    userEmail: req.body.userEmail || 'player@example.com',
    userPhone: req.body.userPhone || '+91 98765 43210',
    category: req.body.category || 'General',
    subject: req.body.subject || 'Support Request',
    description: req.body.description || '',
    status: 'open',
    prefContact: req.body.prefContact || 'Email',
    files: req.body.files || [],
    createdAt: new Date().toLocaleString('en-IN'),
    replies: [
      {
        sender: 'user',
        message: req.body.description || '',
        files: req.body.files || [],
        date: new Date().toLocaleString('en-IN')
      }
    ]
  };

  db.tickets.unshift(ticket);
  
  if (!db.notifications) db.notifications = [];
  db.notifications.unshift({
    id: 'NT_' + Math.random().toString(36).substr(2, 9),
    title: 'New Ticket Created!',
    body: `Ticket ${ticketId} has been created for ${ticket.category}.`,
    date: new Date().toLocaleString('en-IN'),
    read: false,
    screen: 'support'
  });

  writeDB(db);
  broadcast('tickets_updated', db.tickets);
  broadcast('notifications_updated', db.notifications);
  res.status(201).json(ticket);
});

app.put('/api/tickets/:id', (req, res) => {
  const db = readDB();
  const index = (db.tickets || []).findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Ticket not found' });
  
  db.tickets[index] = { ...db.tickets[index], ...req.body };
  writeDB(db);
  broadcast('tickets_updated', db.tickets);
  res.json(db.tickets[index]);
});

app.post('/api/tickets/:id/replies', (req, res) => {
  const db = readDB();
  const index = (db.tickets || []).findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Ticket not found' });
  
  const reply = {
    sender: req.body.sender || 'admin',
    message: req.body.message || '',
    files: req.body.files || [],
    date: new Date().toLocaleString('en-IN')
  };

  db.tickets[index].replies.push(reply);
  
  if (reply.sender === 'admin') {
    db.tickets[index].status = 'awaiting';
  } else {
    db.tickets[index].status = 'open';
  }

  writeDB(db);
  broadcast('tickets_updated', db.tickets);
  res.status(201).json(db.tickets[index]);
});

// ── Predictions APIs ──────────────────────────────────
app.get('/api/predictions/matches', (req, res) => {
  res.json(readDB().predictionMatches || []);
});

app.get('/api/predictions/predictions', (req, res) => {
  const db = readDB();
  let preds = db.userPredictions || [];
  if (req.query.matchId) preds = preds.filter(p => p.matchId === req.query.matchId);
  if (req.query.userId) preds = preds.filter(p => p.userId === req.query.userId);
  res.json(preds);
});

app.get('/api/predictions/matches/:id', (req, res) => {
  const db = readDB();
  const match = (db.predictionMatches || []).find(m => m.id === req.params.id);
  if (!match) return res.status(404).json({ error: 'Match not found' });
  res.json(match);
});

app.post('/api/predictions/matches', (req, res) => {
  const db = readDB();
  if (!db.predictionMatches) db.predictionMatches = [];
  const match = {
    id: generateId('PM'),
    title: req.body.title || '',
    game: req.body.game || '',
    team1: req.body.team1 || { name: '', logo: '', winProbability: 50 },
    team2: req.body.team2 || { name: '', logo: '', winProbability: 50 },
    prizePool: Number(req.body.prizePool) || 0,
    totalWinners: 0,
    date: req.body.date || '',
    time: req.body.time || '',
    closeTime: req.body.closeTime || '',
    status: 'upcoming',
    winner: '',
    gameDetails: req.body.gameDetails || '',
    commentary: []
  };
  db.predictionMatches.push(match);
  writeDB(db);
  broadcast('predictions_updated', db.predictionMatches);
  res.status(201).json(match);
});

app.delete('/api/predictions/matches/:id', (req, res) => {
  const db = readDB();
  const index = (db.predictionMatches || []).findIndex(m => m.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Match not found' });
  
  db.predictionMatches.splice(index, 1);
  db.userPredictions = (db.userPredictions || []).filter(p => p.matchId !== req.params.id);
  
  writeDB(db);
  broadcast('predictions_updated', db.predictionMatches);
  res.json({ success: true });
});

app.put('/api/predictions/matches/:id', (req, res) => {
  const db = readDB();
  const index = (db.predictionMatches || []).findIndex(m => m.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Match not found' });

  const match = db.predictionMatches[index];
  const wasCompleted = match.status === 'completed';

  db.predictionMatches[index] = { ...match, ...req.body };
  const updatedMatch = db.predictionMatches[index];

  if (updatedMatch.status === 'completed' && updatedMatch.winner && !wasCompleted) {
    const settings = db.predictionSettings || { pointsCorrect: 100, pointsIncorrect: -20, commissionPercent: 15 };
    const predictions = (db.userPredictions || []).filter(p => p.matchId === req.params.id);

    predictions.forEach(p => {
      const userIndex = db.users.findIndex(u => u.id === p.userId);
      if (userIndex !== -1) {
        if (!db.users[userIndex].predictionPoints) {
          db.users[userIndex].predictionPoints = 0;
        }

        if (p.selection === updatedMatch.winner) {
          p.status = 'correct';
          p.pointsWon = settings.pointsCorrect || 100;
          db.users[userIndex].predictionPoints += (settings.pointsCorrect || 100);

          // Commission = fixed % of stake (same for win and loss)
          const commissionPercent = settings.commissionPercent !== undefined ? settings.commissionPercent : 15;
          const stake = p.stake || 0;
          const commission = Math.round(stake * commissionPercent / 100);
          const netPayout = (p.potentialWin || 0) - commission;

          p.prizeShare = netPayout;
          p.commissionDeducted = commission;

          // Update user wallet balance
          db.users[userIndex].balance = (db.users[userIndex].balance || 0) + netPayout;

          // Add to transactions log
          if (!db.transactions) db.transactions = [];
          db.transactions.unshift({
            id: generateId('TX'),
            user: db.users[userIndex].name,
            type: 'credit',
            amount: netPayout,
            method: `Prediction Win (${updatedMatch.title})`,
            status: 'success',
            date: new Date().toLocaleDateString('en-IN')
          });

          // Push real-time notification
          if (!db.notifications) db.notifications = [];
          db.notifications.unshift({
            id: generateId('NT'),
            userId: p.userId,
            title: '🎉 You Won! Prediction Match Resolved',
            body: `Congratulations! You won the prediction on ${updatedMatch.title}. Gross Win: ₹${p.potentialWin}, Commission: ₹${commission} (${commissionPercent}% of entry), Net Payout: ₹${netPayout} has been added to your wallet.`,
            read: false,
            date: new Date().toISOString()
          });
        } else {
          p.status = 'incorrect';
          p.pointsWon = settings.pointsIncorrect || -20;
          db.users[userIndex].predictionPoints = Math.max(0, db.users[userIndex].predictionPoints + (settings.pointsIncorrect || -20));

          // For loss: commission is the platform's cut from their lost stake
          const commissionPercent = settings.commissionPercent !== undefined ? settings.commissionPercent : 15;
          const stake = p.stake || 0;
          const commission = Math.round(stake * commissionPercent / 100);

          p.prizeShare = 0;
          p.commissionDeducted = commission; // Shown transparently in UI

          // Push real-time notification
          if (!db.notifications) db.notifications = [];
          db.notifications.unshift({
            id: generateId('NT'),
            userId: p.userId,
            title: '😔 Prediction Match Result Announced',
            body: `The result for ${updatedMatch.title} was announced. You predicted ${p.selection}, but ${updatedMatch.winner} won. Better luck next time!`,
            read: false,
            date: new Date().toISOString()
          });
        }
      }
    });

    updatedMatch.totalWinners = predictions.filter(p => p.selection === updatedMatch.winner).length;
    // Broadcast notifications explicitly
    broadcast('notifications_updated', db.notifications);
  }

  writeDB(db);
  broadcast('predictions_updated', db.predictionMatches);
  broadcast('users_updated', db.users);
  if (db.transactions) broadcast('transactions_updated', db.transactions);
  res.json(updatedMatch);
});

app.post('/api/predictions/submit', (req, res) => {
  const db = readDB();
  const { userId, matchId, predictedTeam } = req.body;

  if (!userId || !matchId || !predictedTeam) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const user = db.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const match = (db.predictionMatches || []).find(m => m.id === matchId);
  if (!match) return res.status(404).json({ error: 'Match not found' });

  const closeDate = new Date(match.closeTime);
  if (new Date() > closeDate) {
    return res.status(400).json({ error: 'Predictions are closed for this match!' });
  }

  if (!db.userPredictions) db.userPredictions = [];
  const existing = db.userPredictions.find(p => p.userId === userId && p.matchId === matchId);
  if (existing) {
    return res.status(400).json({ error: 'You have already predicted on this match!' });
  }

  const entryFee = match.entryFee !== undefined ? match.entryFee : (db.predictionSettings?.defaultEntryFee || 25);
  
  if (user.balance < entryFee) {
    return res.status(400).json({ error: 'Insufficient balance! Add cash first.' });
  }

  // Deduct balance on server
  const userIdx = db.users.findIndex(u => u.id === userId);
  db.users[userIdx].balance = (db.users[userIdx].balance || 0) - entryFee;

  // Log transaction
  if (!db.transactions) db.transactions = [];
  db.transactions.unshift({
    id: generateId('TX'),
    user: user.name,
    type: 'debit',
    amount: -entryFee,
    method: 'Prediction Entry Fee',
    status: 'success',
    date: new Date().toLocaleDateString('en-IN')
  });

  const prediction = {
    id: generateId('PRD'),
    userId,
    userName: user.name,
    matchId,
    predictedTeam,
    status: 'pending',
    pointsWon: 0,
    prizeShare: 0,
    submittedAt: new Date().toLocaleString('en-IN')
  };

  db.userPredictions.push(prediction);
  writeDB(db);
  broadcast('predictions_updated', db.predictionMatches);
  broadcast('users_updated', db.users);
  broadcast('transactions_updated', db.transactions);
  res.status(201).json(prediction);
});

// ── QR/UTR Payments API ────────────────────────────────
app.get('/api/qr-payment/settings', (req, res) => {
  res.json(readDB().qrPaymentSettings);
});

app.post('/api/qr-payment/settings', (req, res) => {
  const db = readDB();
  db.qrPaymentSettings = { ...(db.qrPaymentSettings || {}), ...req.body };
  writeDB(db);
  broadcast('qr_payment_settings_updated', db.qrPaymentSettings);
  res.json(db.qrPaymentSettings);
});

app.get('/api/qr-payment/requests', (req, res) => {
  res.json(readDB().qrPaymentRequests || []);
});

app.post('/api/qr-payment/request', (req, res) => {
  const db = readDB();
  const { userId, userName, amount, utr } = req.body;
  if (!userId || !amount || !utr) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const existing = (db.qrPaymentRequests || []).find(r => r.utr === utr);
  if (existing) {
    return res.status(400).json({ error: 'This UTR has already been submitted!' });
  }

  const newReq = {
    id: generateId('QRP'),
    userId,
    userName: userName || 'NexoraPlayer',
    amount: Number(amount),
    utr,
    status: 'pending',
    date: new Date().toLocaleString('en-IN'),
    timestamp: Date.now()
  };

  if (!db.qrPaymentRequests) db.qrPaymentRequests = [];
  db.qrPaymentRequests.unshift(newReq);
  writeDB(db);
  broadcast('qr_payment_requests_updated', db.qrPaymentRequests);
  res.status(201).json(newReq);
});

app.put('/api/qr-payment/request/:id', (req, res) => {
  const db = readDB();
  const index = (db.qrPaymentRequests || []).findIndex(r => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Request not found' });

  const pReq = db.qrPaymentRequests[index];
  const oldStatus = pReq.status;
  const newStatus = req.body.status;

  if (oldStatus !== 'pending') {
    return res.status(400).json({ error: 'Request is already processed' });
  }

  db.qrPaymentRequests[index].status = newStatus;

  if (newStatus === 'approved') {
    db.qrPaymentRequests[index].rejectReason = null;
    db.qrPaymentRequests[index].disputed = false;
    
    const uIdx = db.users.findIndex(u => u.id === pReq.userId);
    if (uIdx !== -1) {
      db.users[uIdx].balance = (db.users[uIdx].balance || 0) + pReq.amount;
      
      if (!db.transactions) db.transactions = [];
      db.transactions.unshift({
        id: generateId('TX'),
        user: db.users[uIdx].name,
        type: 'added',
        amount: pReq.amount,
        method: 'QR Code (Manual Verify)',
        status: 'success',
        date: new Date().toLocaleDateString('en-IN'),
        utr: pReq.utr
      });

      if (!db.notifications) db.notifications = [];
      db.notifications.unshift({
        id: generateId('NT'),
        userId: pReq.userId,
        title: '💰 Cash Deposit Approved!',
        body: `Your manual deposit request of ₹${pReq.amount.toLocaleString('en-IN')} (UTR: ${pReq.utr}) has been approved and credited to your wallet.`,
        read: false,
        date: new Date().toISOString()
      });
    }
  } else if (newStatus === 'rejected') {
    db.qrPaymentRequests[index].rejectReason = req.body.rejectReason || 'Incorrect UTR / Verification failed';
    db.qrPaymentRequests[index].disputed = false;

    if (!db.notifications) db.notifications = [];
    db.notifications.unshift({
      id: generateId('NT'),
      userId: pReq.userId,
      title: '❌ Cash Deposit Rejected',
      body: `Your manual deposit request of ₹${pReq.amount.toLocaleString('en-IN')} (UTR: ${pReq.utr}) was rejected. Reason: ${db.qrPaymentRequests[index].rejectReason}`,
      read: false,
      date: new Date().toISOString()
    });
  }

  writeDB(db);
  broadcast('qr_payment_requests_updated', db.qrPaymentRequests);
  broadcast('users_updated', db.users);
  broadcast('transactions_updated', db.transactions);
  broadcast('notifications_updated', db.notifications);
  res.json(db.qrPaymentRequests[index]);
});

app.put('/api/qr-payment/dispute/:id', (req, res) => {
  const db = readDB();
  const index = (db.qrPaymentRequests || []).findIndex(r => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Request not found' });

  db.qrPaymentRequests[index].status = 'pending';
  db.qrPaymentRequests[index].disputed = true;
  db.qrPaymentRequests[index].screenshot = req.body.screenshot;
  db.qrPaymentRequests[index].rejectReason = null;
  db.qrPaymentRequests[index].timestamp = Date.now(); // Reset countdown timer for dispute review

  writeDB(db);
  broadcast('qr_payment_requests_updated', db.qrPaymentRequests);
  res.json(db.qrPaymentRequests[index]);
});

app.post('/api/predictions/submit-bet', (req, res) => {
  const db = readDB();
  const { userId, bets } = req.body;

  if (!userId || !bets || !Array.isArray(bets) || bets.length === 0) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const user = db.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const totalStakes = bets.reduce((acc, b) => acc + (Number(b.stake) || 0), 0);
  if (user.balance < totalStakes) {
    return res.status(400).json({ error: 'Insufficient balance! Add cash first.' });
  }

  // Deduct balance on server
  const userIdx = db.users.findIndex(u => u.id === userId);
  db.users[userIdx].balance = (db.users[userIdx].balance || 0) - totalStakes;

  // Log transaction
  if (!db.transactions) db.transactions = [];
  db.transactions.unshift({
    id: generateId('TX'),
    user: user.name,
    type: 'debit',
    amount: -totalStakes,
    method: 'Predictions Bet Placement',
    status: 'success',
    date: new Date().toLocaleDateString('en-IN')
  });

  if (!db.userPredictions) db.userPredictions = [];

  const createdBets = [];
  for (const b of bets) {
    const match = (db.predictionMatches || []).find(m => m.id === b.matchId);
    if (!match) continue;

    const markets = match.markets && match.markets.length > 0 ? match.markets : [
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

    const market = markets.find(mkt => mkt.id === b.marketId);
    if (!market) continue;

    const potentialWin = Math.round((Number(b.stake) || 0) * (Number(b.odds) || 1));

    const betEntry = {
      id: generateId('PRD'),
      userId,
      userName: user.name,
      matchId: b.matchId,
      matchTitle: match.title,
      marketId: b.marketId,
      marketName: market.name,
      selection: b.selection,
      odds: Number(b.odds) || 1,
      stake: Number(b.stake) || 0,
      potentialWin,
      status: 'pending',
      pointsWon: 0,
      submittedAt: new Date().toLocaleString('en-IN')
    };

    db.userPredictions.push(betEntry);
    createdBets.push(betEntry);
  }

  writeDB(db);
  broadcast('predictions_updated', db.predictionMatches);
  broadcast('users_updated', db.users);
  broadcast('transactions_updated', db.transactions);

  res.status(201).json(createdBets);
});

app.post('/api/predictions/resolve-market', (req, res) => {
  const db = readDB();
  const { matchId, marketId, winner } = req.body;

  if (!matchId || !marketId || !winner) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const matchIdx = (db.predictionMatches || []).findIndex(m => m.id === matchId);
  if (matchIdx === -1) return res.status(404).json({ error: 'Match not found' });

  const marketIdx = (db.predictionMatches[matchIdx].markets || []).findIndex(mkt => mkt.id === marketId);
  if (marketIdx === -1) return res.status(404).json({ error: 'Market not found' });

  const market = db.predictionMatches[matchIdx].markets[marketIdx];
  market.status = 'completed';
  market.winner = winner;

  const settings = db.predictionSettings || { pointsCorrect: 100, pointsIncorrect: -20 };
  const bets = (db.userPredictions || []).filter(p => p.matchId === matchId && p.marketId === marketId);

  bets.forEach(b => {
    const userIdx = db.users.findIndex(u => u.id === b.userId);
    if (userIdx !== -1) {
      if (!db.users[userIdx].predictionPoints) {
        db.users[userIdx].predictionPoints = 0;
      }

      const commissionPercent = db.predictionSettings?.commissionPercent !== undefined ? db.predictionSettings.commissionPercent : 15;

      if (b.selection === winner) {
        b.status = 'correct';
        b.pointsWon = settings.pointsCorrect || 100;
        db.users[userIdx].predictionPoints += (settings.pointsCorrect || 100);
        
        // Commission = fixed % of stake (same for win and loss)
        const stake = b.stake || 0;
        const commission = Math.round(stake * commissionPercent / 100);
        const netPayout = (b.potentialWin || 0) - commission;

        b.prizeShare = netPayout;
        b.commissionDeducted = commission;

        db.users[userIdx].balance = (db.users[userIdx].balance || 0) + netPayout;

        if (!db.transactions) db.transactions = [];
        db.transactions.unshift({
          id: generateId('TX'),
          user: db.users[userIdx].name,
          type: 'credit',
          amount: netPayout,
          method: `Prediction Win (${market.name})`,
          status: 'success',
          date: new Date().toLocaleDateString('en-IN')
        });

        // Push real-time notification
        if (!db.notifications) db.notifications = [];
        db.notifications.unshift({
          id: generateId('NT'),
          userId: b.userId,
          title: '🎉 You Won! Prediction Match Resolved',
          body: `Congratulations! You won the prediction on ${market.name}. Gross Win: ₹${b.potentialWin}, Commission: ₹${commission} (${commissionPercent}% of entry), Net Payout: ₹${netPayout} credited to wallet.`,
          read: false,
          date: new Date().toISOString()
        });
      } else {
        b.status = 'incorrect';
        b.pointsWon = settings.pointsIncorrect || -20;
        db.users[userIdx].predictionPoints = Math.max(0, db.users[userIdx].predictionPoints + (settings.pointsIncorrect || -20));

        // For loss: commission is the platform's cut from their lost stake (same formula as win)
        const stake = b.stake || 0;
        const commission = Math.round(stake * commissionPercent / 100);

        b.prizeShare = 0;
        b.commissionDeducted = commission; // Shown transparently in UI

        // Push real-time notification
        if (!db.notifications) db.notifications = [];
        db.notifications.unshift({
          id: generateId('NT'),
          userId: b.userId,
          title: '😔 Prediction Match Result Announced',
          body: `The result for ${market.name} was announced. You predicted ${b.selection}, but ${winner} won. Entry ₹${stake} lost. Better luck next time!`,
          read: false,
          date: new Date().toISOString()
        });
      }
    }
  });

  const allCompleted = db.predictionMatches[matchIdx].markets.every(m => m.status === 'completed');
  if (allCompleted) {
    db.predictionMatches[matchIdx].status = 'completed';
    db.predictionMatches[matchIdx].winner = db.predictionMatches[matchIdx].markets.find(m => m.name === 'Match Winner')?.winner || 'Completed';
  }

  writeDB(db);
  broadcast('predictions_updated', db.predictionMatches);
  broadcast('users_updated', db.users);
  broadcast('transactions_updated', db.transactions);
  broadcast('notifications_updated', db.notifications);

  res.json({ message: 'Market resolved successfully', market });
});

app.get('/api/predictions/settings', (req, res) => {
  res.json(readDB().predictionSettings || {});
});

app.get('/api/predictions/finance-stats', (req, res) => {
  const db = readDB();
  const totalEntryFees = (db.userPredictions || []).reduce((acc, p) => acc + (p.stake || 0), 0);

  const totalCommission = Math.round(totalEntryFees * (db.predictionSettings?.commissionPercent || 15) / 100);
  const totalWithdrawn = (db.withdrawals || []).filter(w => w.status === 'approved').reduce((acc, w) => acc + (w.amount || 0), 0);
  const totalPending = (db.withdrawals || []).filter(w => w.status === 'pending').reduce((acc, w) => acc + (w.amount || 0), 0);
  const totalPlatformBalance = (db.users || []).reduce((acc, u) => acc + (u.balance || 0), 0);

  res.json({
    totalEntryFees,
    totalCommission,
    totalWithdrawn,
    totalPending,
    totalPlatformBalance
  });
});

app.put('/api/predictions/settings', (req, res) => {
  const db = readDB();
  db.predictionSettings = { ...db.predictionSettings, ...req.body };
  writeDB(db);
  broadcast('prediction_settings_updated', db.predictionSettings);
  res.json(db.predictionSettings);
});

app.get('/api/predictions/leaderboard', (req, res) => {
  const db = readDB();
  const users = db.users || [];
  
  const rankings = users
    .map(u => ({
      id: u.id,
      name: u.name,
      points: u.predictionPoints || 0,
      avatar: 'assets/valorant_thumb.jpg'
    }))
    .sort((a, b) => b.points - a.points);

  res.json({
    weekly: rankings.slice(0, 10),
    monthly: rankings.slice(0, 15),
    allTime: rankings
  });
});


// ══════════════════════════════════════════════════
// 🎮 CASINO GAMES API
// ══════════════════════════════════════════════════

// ── Provably Fair RNG ────────────────────────────
const crypto = require('crypto');

function crashPoint(serverSeed, clientSeed, nonce) {
  const hash = crypto.createHash('sha256')
    .update(`${serverSeed}:${clientSeed}:${nonce}`)
    .digest('hex');
  const h = parseInt(hash.slice(0, 8), 16);
  const e = Math.pow(2, 32);
  const houseEdge = 0.03; // 3%
  if (h % 33 === 0) return 1.00; // instant crash ~3%
  const result = Math.floor((100 * e - h * houseEdge) / (e - h)) / 100;
  return Math.max(1.00, result);
}

function minesSafeProb(mineCount, revealed) {
  // probability of next cell being safe
  const totalCells = 25;
  const safeCells = totalCells - mineCount - revealed;
  const remainingCells = totalCells - revealed;
  return safeCells / remainingCells;
}

function minesMultiplier(mineCount, revealed) {
  if (revealed === 0) return 1.00;
  let mult = 1.00;
  for (let i = 0; i < revealed; i++) {
    const safe = 25 - mineCount - i;
    const remaining = 25 - i;
    mult = mult * (remaining / safe) * 0.97; // 3% house edge
  }
  return Math.round(mult * 100) / 100;
}

// In-memory active game sessions (reset on restart)
let activeSessions = {}; // sessionId -> session data
let planeRound = {
  id: generateId('RND'),
  status: 'waiting', // waiting | running | crashed
  multiplier: 1.00,
  crashAt: 0,
  bets: [], // [{ userId, amount, cashedOut, cashOutMultiplier }]
  startTime: null,
  serverSeed: crypto.randomBytes(16).toString('hex'),
  clientSeed: 'nexora',
  nonce: Date.now()
};

let planeInterval = null;
let planeWaitTimeout = null;

function startPlaneRound() {
  planeRound.id = generateId('RND');
  planeRound.status = 'waiting';
  planeRound.multiplier = 1.00;
  planeRound.bets = [];
  planeRound.serverSeed = crypto.randomBytes(16).toString('hex');
  planeRound.nonce = Date.now();
  
  const db = readDB();
  const isRigged = db.casinoSettings?.riggedGames?.plane;
  if (isRigged) {
    planeRound.crashAt = 1.00;
  } else {
    planeRound.crashAt = crashPoint(planeRound.serverSeed, planeRound.clientSeed, planeRound.nonce);
  }
  
  broadcast('plane_round_update', planeRound);
  console.log(`[PLANE] New round ${planeRound.id}, crashAt: ${planeRound.crashAt}x`);

  // Wait 8s for bets
  planeWaitTimeout = setTimeout(() => {
    planeRound.status = 'running';
    planeRound.startTime = Date.now();
    planeRound.multiplier = 1.00;
    broadcast('plane_round_update', planeRound);

    // Tick every 100ms
    planeInterval = setInterval(() => {
      const elapsed = (Date.now() - planeRound.startTime) / 1000;
      planeRound.multiplier = Math.round(Math.pow(Math.E, 0.06 * elapsed) * 100) / 100;

      if (planeRound.multiplier >= planeRound.crashAt) {
        clearInterval(planeInterval);
        planeRound.multiplier = planeRound.crashAt;
        planeRound.status = 'crashed';
        broadcast('plane_round_update', planeRound);

        // Save crashed round to db
        const db = readDB();
        if (!db.planeRounds) db.planeRounds = [];
        db.planeRounds.unshift({ ...planeRound, endTime: Date.now() });
        if (db.planeRounds.length > 50) db.planeRounds = db.planeRounds.slice(0, 50);
        writeDB(db);

        // Start next round after 4s
        setTimeout(startPlaneRound, 4000);
      } else {
        broadcast('plane_round_update', planeRound);
      }
    }, 100);
  }, 8000);
}

// Start plane crash auto-loop
startPlaneRound();

// ── GET Game Settings ────────────────────────────
app.get('/api/casino/settings', (req, res) => {
  const db = readDB();
  res.json(db.casinoSettings || {
    planeMin: 10, planeMax: 10000, houseEdge: 3,
    minesMin: 10, minesMax: 5000,
    spinMin: 10, spinMax: 2000,
    diceMin: 10, diceMax: 5000,
    coinflipMin: 10, coinflipMax: 5000,
    limboMin: 10, limboMax: 5000,
    towerMin: 10, towerMax: 5000,
    gamesEnabled: { plane: true, mines: true, spin: true, dice: true, coinflip: true, limbo: true, tower: true, plinko: true, keno: true, color: true }
  });
});

app.put('/api/casino/settings', (req, res) => {
  const db = readDB();
  db.casinoSettings = { ...(db.casinoSettings || {}), ...req.body };
  writeDB(db);
  broadcast('casino_settings_updated', db.casinoSettings);
  res.json(db.casinoSettings);
});

// ── GET Current Plane Round ──────────────────────
app.get('/api/casino/plane/round', (req, res) => {
  res.json(planeRound);
});

// ── POST Place Bet on Plane Crash ────────────────
app.post('/api/casino/plane/bet', (req, res) => {
  const { userId, amount, autoCashOut } = req.body;
  if (planeRound.status !== 'waiting') {
    return res.status(400).json({ error: 'Round already started. Wait for next round.' });
  }
  const db = readDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if ((user.balance || 0) < amount) return res.status(400).json({ error: 'Insufficient balance' });

  user.balance = (user.balance || 0) - amount;
  db.casinoBets = db.casinoBets || [];
  const betId = generateId('BET');
  const bet = { id: betId, game: 'plane', userId, amount, autoCashOut: autoCashOut || 0, cashedOut: false, cashOutMultiplier: 0, roundId: planeRound.id, createdAt: new Date().toISOString() };
  db.casinoBets.push(bet);
  writeDB(db);

  planeRound.bets.push({ betId, userId, amount, autoCashOut: autoCashOut || 0, cashedOut: false, cashOutMultiplier: 0 });
  broadcast('plane_round_update', planeRound);
  res.json({ success: true, bet, newBalance: user.balance });
});

// ── POST Cash Out Plane Crash ────────────────────
app.post('/api/casino/plane/cashout', (req, res) => {
  const { userId, betId } = req.body;
  if (planeRound.status !== 'running') return res.status(400).json({ error: 'Round not running' });

  const roundBet = planeRound.bets.find(b => b.betId === betId && b.userId === userId);
  if (!roundBet || roundBet.cashedOut) return res.status(400).json({ error: 'Bet not found or already cashed out' });

  const multiplier = planeRound.multiplier;
  const winAmount = Math.floor(roundBet.amount * multiplier);
  roundBet.cashedOut = true;
  roundBet.cashOutMultiplier = multiplier;

  const db = readDB();
  const user = db.users.find(u => u.id === userId);
  user.balance = (user.balance || 0) + winAmount;
  const casinoBet = db.casinoBets.find(b => b.id === betId);
  if (casinoBet) { casinoBet.cashedOut = true; casinoBet.cashOutMultiplier = multiplier; casinoBet.winAmount = winAmount; }
  db.casinoStats = db.casinoStats || { totalBets: 0, totalPayout: 0 };
  db.casinoStats.totalBets += roundBet.amount;
  db.casinoStats.totalPayout += winAmount;
  writeDB(db);
  broadcast('plane_round_update', planeRound);
  res.json({ success: true, winAmount, newBalance: user.balance, multiplier });
});

// ── POST Mines — Start Game ───────────────────────
app.post('/api/casino/mines/start', (req, res) => {
  const { userId, amount, mineCount } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if ((user.balance || 0) < amount) return res.status(400).json({ error: 'Insufficient balance' });

  // Place mines randomly in 25 cells
  const cells = Array.from({ length: 25 }, (_, i) => i);
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  const minePositions = cells.slice(0, mineCount);
  const sessionId = generateId('MSS');

  user.balance = (user.balance || 0) - amount;
  db.casinoBets = db.casinoBets || [];
  const betId = generateId('BET');
  db.casinoBets.push({ id: betId, game: 'mines', userId, amount, mineCount, status: 'active', createdAt: new Date().toISOString() });
  writeDB(db);

  activeSessions[sessionId] = { type: 'mines', userId, amount, mineCount, minePositions, revealed: [], betId, active: true };
  res.json({ success: true, sessionId, newBalance: user.balance, betId });
});

// ── POST Mines — Reveal Cell ─────────────────────
app.post('/api/casino/mines/reveal', (req, res) => {
  const { sessionId, cellIndex } = req.body;
  const session = activeSessions[sessionId];
  if (!session || !session.active) return res.status(400).json({ error: 'No active session' });
  if (session.revealed.includes(cellIndex)) return res.status(400).json({ error: 'Cell already revealed' });

  const db = readDB();
  const isRigged = db.casinoSettings?.riggedGames?.mines;
  const isMine = isRigged ? true : session.minePositions.includes(cellIndex);
  session.revealed.push(cellIndex);

  if (isMine) {
    session.active = false;
    const db = readDB();
    const bet = db.casinoBets.find(b => b.id === session.betId);
    if (bet) { bet.status = 'lost'; bet.winAmount = 0; }
    db.casinoStats = db.casinoStats || { totalBets: 0, totalPayout: 0 };
    db.casinoStats.totalBets += session.amount;
    writeDB(db);
    return res.json({ isMine: true, minePositions: session.minePositions, gameOver: true });
  }

  const multiplier = minesMultiplier(session.mineCount, session.revealed.length);
  res.json({ isMine: false, multiplier, revealed: session.revealed.length, nextMultiplier: minesMultiplier(session.mineCount, session.revealed.length + 1) });
});

// ── POST Mines — Cash Out ────────────────────────
app.post('/api/casino/mines/cashout', (req, res) => {
  const { sessionId } = req.body;
  const session = activeSessions[sessionId];
  if (!session || !session.active) return res.status(400).json({ error: 'No active session' });

  const multiplier = minesMultiplier(session.mineCount, session.revealed.length);
  const winAmount = Math.floor(session.amount * multiplier);
  session.active = false;

  const db = readDB();
  const user = db.users.find(u => u.id === session.userId);
  user.balance = (user.balance || 0) + winAmount;
  const bet = db.casinoBets.find(b => b.id === session.betId);
  if (bet) { bet.status = 'won'; bet.winAmount = winAmount; bet.multiplier = multiplier; }
  db.casinoStats = db.casinoStats || { totalBets: 0, totalPayout: 0 };
  db.casinoStats.totalBets += session.amount;
  db.casinoStats.totalPayout += winAmount;
  writeDB(db);
  res.json({ success: true, winAmount, multiplier, newBalance: user.balance, minePositions: session.minePositions });
});

// ── POST Spin & Win ──────────────────────────────
app.post('/api/casino/spin', (req, res) => {
  const { userId, amount } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if ((user.balance || 0) < amount) return res.status(400).json({ error: 'Insufficient balance' });

  // Segments: [multiplier, weight]
  const segments = [
    { label: '2x', multiplier: 2, weight: 20 },
    { label: '0', multiplier: 0, weight: 30 },
    { label: '1.5x', multiplier: 1.5, weight: 20 },
    { label: '0', multiplier: 0, weight: 20 },
    { label: '3x', multiplier: 3, weight: 5 },
    { label: '0', multiplier: 0, weight: 15 },
    { label: '5x', multiplier: 5, weight: 3 },
    { label: '0', multiplier: 0, weight: 20 },
    { label: '10x', multiplier: 10, weight: 1 },
    { label: '1x', multiplier: 1, weight: 25 },
    { label: '0', multiplier: 0, weight: 25 },
    { label: '1.5x', multiplier: 1.5, weight: 20 },
  ];
  const isRigged = db.casinoSettings?.riggedGames?.spin;
  let result = segments[0];
  if (isRigged) {
    result = segments.find(s => s.multiplier === 0) || segments[1];
  } else {
    const totalWeight = segments.reduce((s, x) => s + x.weight, 0);
    let r = Math.random() * totalWeight;
    for (const seg of segments) { r -= seg.weight; if (r <= 0) { result = seg; break; } }
  }

  const winAmount = Math.floor(amount * result.multiplier);
  user.balance = (user.balance || 0) - amount + winAmount;
  db.casinoBets = db.casinoBets || [];
  db.casinoBets.push({ id: generateId('BET'), game: 'spin', userId, amount, result: result.label, multiplier: result.multiplier, winAmount, createdAt: new Date().toISOString() });
  db.casinoStats = db.casinoStats || { totalBets: 0, totalPayout: 0 };
  db.casinoStats.totalBets += amount;
  db.casinoStats.totalPayout += winAmount;
  writeDB(db);

  const segmentIndex = segments.indexOf(result);
  res.json({ success: true, result: result.label, multiplier: result.multiplier, winAmount, newBalance: user.balance, segmentIndex });
});

// ── POST Dice ────────────────────────────────────
app.post('/api/casino/dice', (req, res) => {
  const { userId, amount, prediction, isOver } = req.body; // prediction: 1-98, isOver: true/false
  const db = readDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if ((user.balance || 0) < amount) return res.status(400).json({ error: 'Insufficient balance' });

  const isRigged = db.casinoSettings?.riggedGames?.dice;
  let roll = Math.floor(Math.random() * 100) + 1; // 1-100
  if (isRigged) {
    if (isOver) {
      roll = Math.floor(Math.random() * prediction) + 1;
    } else {
      roll = prediction + Math.floor(Math.random() * (101 - prediction));
    }
  }
  const won = isOver ? roll > prediction : roll < prediction;
  const winChance = isOver ? (100 - prediction) : prediction;
  const multiplier = won ? Math.round((97 / winChance) * 100) / 100 : 0;
  const winAmount = won ? Math.floor(amount * multiplier) : 0;

  user.balance = (user.balance || 0) - amount + winAmount;
  db.casinoBets = db.casinoBets || [];
  db.casinoBets.push({ id: generateId('BET'), game: 'dice', userId, amount, prediction, isOver, roll, won, multiplier, winAmount, createdAt: new Date().toISOString() });
  db.casinoStats = db.casinoStats || { totalBets: 0, totalPayout: 0 };
  db.casinoStats.totalBets += amount;
  db.casinoStats.totalPayout += winAmount;
  writeDB(db);
  res.json({ success: true, roll, won, multiplier, winAmount, newBalance: user.balance });
});

// ── POST Coinflip ────────────────────────────────
app.post('/api/casino/coinflip', (req, res) => {
  const { userId, amount, choice } = req.body; // choice: 'heads' | 'tails'
  const db = readDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if ((user.balance || 0) < amount) return res.status(400).json({ error: 'Insufficient balance' });

  const isRigged = db.casinoSettings?.riggedGames?.coinflip;
  let result = Math.random() < 0.5 ? 'heads' : 'tails';
  if (isRigged) {
    result = choice === 'heads' ? 'tails' : 'heads';
  }
  const won = result === choice;
  const winAmount = won ? Math.floor(amount * 1.94) : 0; // 1.94x (3% house edge)
  user.balance = (user.balance || 0) - amount + winAmount;
  db.casinoBets = db.casinoBets || [];
  db.casinoBets.push({ id: generateId('BET'), game: 'coinflip', userId, amount, choice, result, won, winAmount, createdAt: new Date().toISOString() });
  db.casinoStats = db.casinoStats || { totalBets: 0, totalPayout: 0 };
  db.casinoStats.totalBets += amount;
  db.casinoStats.totalPayout += winAmount;
  writeDB(db);
  res.json({ success: true, result, won, winAmount, newBalance: user.balance });
});

// ── POST Limbo ───────────────────────────────────
app.post('/api/casino/limbo', (req, res) => {
  const { userId, amount, targetMultiplier } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if ((user.balance || 0) < amount) return res.status(400).json({ error: 'Insufficient balance' });

  const isRigged = db.casinoSettings?.riggedGames?.limbo;
  let resultMultiplier;
  if (isRigged) {
    resultMultiplier = 1.00;
  } else {
    const r = Math.random();
    resultMultiplier = Math.round(Math.max(1.00, 0.97 / r) * 100) / 100;
  }
  const won = resultMultiplier >= targetMultiplier;
  const winAmount = won ? Math.floor(amount * targetMultiplier) : 0;
  user.balance = (user.balance || 0) - amount + winAmount;
  db.casinoBets = db.casinoBets || [];
  db.casinoBets.push({ id: generateId('BET'), game: 'limbo', userId, amount, targetMultiplier, resultMultiplier, won, winAmount, createdAt: new Date().toISOString() });
  db.casinoStats = db.casinoStats || { totalBets: 0, totalPayout: 0 };
  db.casinoStats.totalBets += amount;
  db.casinoStats.totalPayout += winAmount;
  writeDB(db);
  res.json({ success: true, resultMultiplier, won, winAmount, newBalance: user.balance });
});

// ── POST Tower ───────────────────────────────────
app.post('/api/casino/tower/start', (req, res) => {
  const { userId, amount, difficulty } = req.body; // difficulty: 'easy'(3 safe/1 mine)|'medium'(2/2)|'hard'(1/3)
  const db = readDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if ((user.balance || 0) < amount) return res.status(400).json({ error: 'Insufficient balance' });

  const cols = 4;
  const rows = 9;
  const minesPerRow = { easy: 1, medium: 2, hard: 3 }[difficulty] || 1;
  const grid = Array.from({ length: rows }, () => {
    const row = Array(cols).fill('safe');
    let placed = 0;
    while (placed < minesPerRow) {
      const idx = Math.floor(Math.random() * cols);
      if (row[idx] === 'safe') { row[idx] = 'mine'; placed++; }
    }
    return row;
  });

  user.balance = (user.balance || 0) - amount;
  const sessionId = generateId('TWR');
  const betId = generateId('BET');
  db.casinoBets = db.casinoBets || [];
  db.casinoBets.push({ id: betId, game: 'tower', userId, amount, difficulty, status: 'active', createdAt: new Date().toISOString() });
  writeDB(db);
  activeSessions[sessionId] = { type: 'tower', userId, amount, difficulty, grid, currentRow: 0, betId, active: true };
  res.json({ success: true, sessionId, newBalance: user.balance, cols, rows });
});

app.post('/api/casino/tower/step', (req, res) => {
  const { sessionId, colIndex } = req.body;
  const session = activeSessions[sessionId];
  if (!session || !session.active) return res.status(400).json({ error: 'No active session' });
  const db = readDB();
  const isRigged = db.casinoSettings?.riggedGames?.tower;
  const isMine = isRigged ? true : row[colIndex] === 'mine';
  if (isMine) {
    session.active = false;
    const db = readDB();
    const bet = db.casinoBets.find(b => b.id === session.betId);
    if (bet) { bet.status = 'lost'; bet.winAmount = 0; }
    db.casinoStats = db.casinoStats || { totalBets: 0, totalPayout: 0 };
    db.casinoStats.totalBets += session.amount;
    writeDB(db);
    return res.json({ isMine: true, gameOver: true, row: session.currentRow, revealedRow: row });
  }
  session.currentRow++;
  const minesPerRow = { easy: 1, medium: 2, hard: 3 }[session.difficulty] || 1;
  const safeCols = 4 - minesPerRow;
  const rowMultiplier = Math.round(Math.pow(4 / safeCols, session.currentRow) * 0.97 * 100) / 100;
  const isTop = session.currentRow >= session.grid.length;
  return res.json({ isMine: false, currentRow: session.currentRow, multiplier: rowMultiplier, isTop, revealedRow: row });
});

app.post('/api/casino/tower/cashout', (req, res) => {
  const { sessionId } = req.body;
  const session = activeSessions[sessionId];
  if (!session || !session.active) return res.status(400).json({ error: 'No active session' });
  if (session.currentRow === 0) return res.status(400).json({ error: 'Climb at least one row first' });
  const minesPerRow = { easy: 1, medium: 2, hard: 3 }[session.difficulty] || 1;
  const safeCols = 4 - minesPerRow;
  const multiplier = Math.round(Math.pow(4 / safeCols, session.currentRow) * 0.97 * 100) / 100;
  const winAmount = Math.floor(session.amount * multiplier);
  session.active = false;
  const db = readDB();
  const user = db.users.find(u => u.id === session.userId);
  user.balance = (user.balance || 0) + winAmount;
  const bet = db.casinoBets.find(b => b.id === session.betId);
  if (bet) { bet.status = 'won'; bet.winAmount = winAmount; bet.multiplier = multiplier; }
  db.casinoStats = db.casinoStats || { totalBets: 0, totalPayout: 0 };
  db.casinoStats.totalBets += session.amount;
  db.casinoStats.totalPayout += winAmount;
  writeDB(db);
  res.json({ success: true, winAmount, multiplier, newBalance: user.balance });
});

// ── POST Color Prediction ────────────────────────
app.post('/api/casino/color', (req, res) => {
  const { userId, amount, choice } = req.body; // choice: 'red'|'green'|'violet'
  const db = readDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if ((user.balance || 0) < amount) return res.status(400).json({ error: 'Insufficient balance' });

  const isRigged = db.casinoSettings?.riggedGames?.color;
  let result;
  if (isRigged) {
    const list = ['red', 'green', 'violet'];
    const losing = list.filter(o => o !== choice);
    result = losing[Math.floor(Math.random() * losing.length)];
  } else {
    const outcomes = ['red','green','violet','red','green','red','green','violet','red','green'];
    result = outcomes[Math.floor(Math.random() * outcomes.length)];
  }
  const multipliers = { red: 2, green: 2, violet: 4.5 };
  const won = result === choice;
  const multiplier = won ? multipliers[choice] : 0;
  const winAmount = won ? Math.floor(amount * multiplier * 0.97) : 0;
  user.balance = (user.balance || 0) - amount + winAmount;
  db.casinoBets = db.casinoBets || [];
  db.casinoBets.push({ id: generateId('BET'), game: 'color', userId, amount, choice, result, won, winAmount, multiplier: multiplier * 0.97, createdAt: new Date().toISOString() });
  db.casinoStats = db.casinoStats || { totalBets: 0, totalPayout: 0 };
  db.casinoStats.totalBets += amount;
  db.casinoStats.totalPayout += winAmount;
  writeDB(db);
  res.json({ success: true, result, won, winAmount, newBalance: user.balance });
});

// ── POST Plinko ──────────────────────────────────
app.post('/api/casino/plinko', (req, res) => {
  const { userId, amount, risk } = req.body; // risk: low|medium|high
  const db = readDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if ((user.balance || 0) < amount) return res.status(400).json({ error: 'Insufficient balance' });

  const multiplierTable = {
    low:    [5.6, 2.1, 1.1, 1.0, 0.5, 1.0, 1.1, 2.1, 5.6],
    medium: [13,  3,   1.3, 0.7, 0.4, 0.7, 1.3, 3,   13],
    high:   [29,  4,   1.5, 0.3, 0.2, 0.3, 1.5, 4,   29]
  };
  const table = multiplierTable[risk] || multiplierTable.medium;
  const isRigged = db.casinoSettings?.riggedGames?.plinko;
  let pos = 0;
  const path = [];
  if (isRigged) {
    for (let i = 0; i < 8; i++) { path.push(1); path.push(0); }
    for (let i = path.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [path[i], path[j]] = [path[j], path[i]];
    }
    pos = 8;
  } else {
    for (let i = 0; i < 16; i++) {
      const dir = Math.random() < 0.5 ? 0 : 1;
      pos += dir;
      path.push(dir);
    }
  }
  const slot = Math.min(pos, table.length - 1);
  const multiplier = table[slot];
  const winAmount = Math.floor(amount * multiplier * 0.97);
  user.balance = (user.balance || 0) - amount + winAmount;
  db.casinoBets = db.casinoBets || [];
  db.casinoBets.push({ id: generateId('BET'), game: 'plinko', userId, amount, risk, slot, multiplier, winAmount, createdAt: new Date().toISOString() });
  db.casinoStats = db.casinoStats || { totalBets: 0, totalPayout: 0 };
  db.casinoStats.totalBets += amount;
  db.casinoStats.totalPayout += winAmount;
  writeDB(db);
  res.json({ success: true, path, slot, multiplier, winAmount, newBalance: user.balance });
});

// ── POST Keno ────────────────────────────────────
app.post('/api/casino/keno', (req, res) => {
  const { userId, amount, picks } = req.body; // picks: array of 1-10 numbers (1-40)
  const db = readDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if ((user.balance || 0) < amount) return res.status(400).json({ error: 'Insufficient balance' });

  const isRigged = db.casinoSettings?.riggedGames?.keno;
  let drawn;
  if (isRigged) {
    const remainingPool = Array.from({ length: 40 }, (_, i) => i + 1).filter(n => !picks.includes(n));
    for (let i = remainingPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remainingPool[i], remainingPool[j]] = [remainingPool[j], remainingPool[i]];
    }
    drawn = remainingPool.slice(0, 20);
  } else {
    const pool = Array.from({ length: 40 }, (_, i) => i + 1);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    drawn = pool.slice(0, 20);
  }
  const hits = picks.filter(p => drawn.includes(p)).length;

  // Payout table (picks count → hits → multiplier)
  const payoutTable = {
    1: [0, 3.8],
    2: [0, 0, 3.2],
    3: [0, 0, 1.5, 4.2],
    5: [0, 0, 0, 1.5, 4, 10],
    10: [0, 0, 0, 0, 1, 2, 5, 10, 25, 100, 500]
  };
  const closestKey = Object.keys(payoutTable).reduce((a, b) => 
    Math.abs(b - picks.length) < Math.abs(a - picks.length) ? b : a);
  const payouts = payoutTable[closestKey] || [0];
  const multiplier = payouts[Math.min(hits, payouts.length - 1)] || 0;
  const winAmount = Math.floor(amount * multiplier * 0.97);
  user.balance = (user.balance || 0) - amount + winAmount;
  db.casinoBets = db.casinoBets || [];
  db.casinoBets.push({ id: generateId('BET'), game: 'keno', userId, amount, picks, drawn, hits, multiplier, winAmount, createdAt: new Date().toISOString() });
  db.casinoStats = db.casinoStats || { totalBets: 0, totalPayout: 0 };
  db.casinoStats.totalBets += amount;
  db.casinoStats.totalPayout += winAmount;
  writeDB(db);
  res.json({ success: true, drawn, hits, multiplier, winAmount, newBalance: user.balance });
});

// ── GET Casino Bets (Admin) ──────────────────────
app.get('/api/casino/bets', (req, res) => {
  const db = readDB();
  const bets = (db.casinoBets || []).slice(-200).reverse();
  res.json(bets);
});

// ── GET Casino Stats ─────────────────────────────
app.get('/api/casino/stats', (req, res) => {
  const db = readDB();
  const bets = db.casinoBets || [];
  
  let totalBets = 0;
  let totalPayout = 0;
  
  const gamesList = ['plane', 'mines', 'spin', 'dice', 'coinflip', 'limbo', 'tower', 'color', 'plinko', 'keno', 'bonus'];
  const breakdown = {};
  gamesList.forEach(g => {
    breakdown[g] = { bets: 0, payouts: 0, profit: 0 };
  });
  
  bets.forEach(b => {
    const amt = b.amount || 0;
    const win = b.winAmount || 0;
    totalBets += amt;
    totalPayout += win;
    
    if (breakdown[b.game]) {
      breakdown[b.game].bets += amt;
      breakdown[b.game].payouts += win;
    }
  });
  
  gamesList.forEach(g => {
    breakdown[g].profit = breakdown[g].bets - breakdown[g].payouts;
  });
  
  res.json({
    totalBets,
    totalPayout,
    profit: totalBets - totalPayout,
    breakdown
  });
});

// ── GET Plane Round History ──────────────────────
app.get('/api/casino/plane/history', (req, res) => {
  const db = readDB();
  res.json((db.planeRounds || []).slice(0, 20));
});

// ── GET Daily Bonus Spin ─────────────────────────
app.get('/api/casino/bonus-spin/:userId', (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const today = new Date().toDateString();
  const canSpin = user.lastBonusSpin !== today;
  res.json({ canSpin, lastSpin: user.lastBonusSpin });
});

app.post('/api/casino/bonus-spin/:userId', (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const today = new Date().toDateString();
  if (user.lastBonusSpin === today) return res.status(400).json({ error: 'Already spun today' });

  const prizes = [
    { label: '₹10 Bonus', amount: 10, weight: 30 },
    { label: '₹25 Bonus', amount: 25, weight: 20 },
    { label: '₹50 Bonus', amount: 50, weight: 15 },
    { label: '₹100 Bonus', amount: 100, weight: 10 },
    { label: '₹5 Bonus', amount: 5, weight: 40 },
    { label: 'Try Again', amount: 0, weight: 50 },
    { label: '₹200 Bonus', amount: 200, weight: 3 },
    { label: '₹500 Bonus', amount: 500, weight: 1 },
  ];
  const total = prizes.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * total;
  let prize = prizes[0];
  for (const p of prizes) { r -= p.weight; if (r <= 0) { prize = p; break; } }

  user.lastBonusSpin = today;
  if (prize.amount > 0) user.balance = (user.balance || 0) + prize.amount;
  writeDB(db);
  res.json({ success: true, prize: prize.label, amount: prize.amount, newBalance: user.balance, prizeIndex: prizes.indexOf(prize) });
});

// ── Export Express App as Cloud Function ──────────
exports.api = functions.https.onRequest(app);
