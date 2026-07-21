/* =====================================================
   NEXORA ARENA — App Logic
   SPA Router + State + Page Logic
   ===================================================== */

'use strict';

// ────────────────────────────────────────────────────
// STATE
// ────────────────────────────────────────────────────
const LANG_DICT = {
  en: {
    home: "Home",
    tournaments: "Tournaments",
    wallet: "Wallet",
    profile: "Profile",
    settings: "Settings",
    logout: "Logout",
    welcomeBack: "Welcome Back!",
    loginSub: "Login to continue your gaming journey.",
    mobileNum: "Mobile Number",
    continue: "Continue",
    orContinue: "or continue with",
    signUp: "Sign Up",
    createAccount: "Create Account",
    fillRegister: "Fill your details to register",
    fullName: "Full Name",
    emailAddr: "Email Address",
    dob: "Date of Birth",
    gender: "Gender",
    referralCode: "Referral Code (Optional)",
    agreeTerms: "I agree to the Terms & Conditions and Privacy Policy",
    registerNow: "Register Now",
    verifyMobile: "Verify Mobile",
    enterOtp: "Enter the 6-digit code sent to",
    resendOtp: "Resend OTP in",
    verifyCont: "Verify & Continue",
    didNotReceive: "Didn't receive code?",
    loginSuccess: "Login Successful!",
    welcomeNexora: "Welcome to Nexora Arena. Your account is secure and ready to use.",
    goDashboard: "Go to Dashboard",
    appearance: "Appearance",
    darkMode: "Dark Mode",
    enableDark: "Enable dark theme for the app",
    preferences: "Preferences",
    appLang: "App Language",
    selectLang: "Select your preferred language",
    support: "Support",
    commissionInfo: "Commission Info",
    referEarn: "Refer & Earn",
    matchHistory: "Match History",
    myTournaments: "My Tournaments",
    popularGames: "Popular Games",
    viewAll: "View All",
    live: "LIVE",
    new: "NEW",
    registered: "registered",
    slots: "slots",
    entry: "Entry",
    prizePool: "Prize Pool",
    joined: "Joined",
    processing: "Processing",
    success: "Success",
    refund: "Refund",
    withdrawn: "Withdrawn",
    addedCash: "Added Cash"
  },
  hi: {
    home: "होम",
    tournaments: "टूर्नामेंट्स",
    wallet: "वॉलेट",
    profile: "प्रोफाइल",
    settings: "सेटिंग्स",
    logout: "लॉगआउट",
    welcomeBack: "आपका स्वागत है!",
    loginSub: "अपनी गेमिंग यात्रा जारी रखने के लिए लॉगिन करें।",
    mobileNum: "मोबाइल नंबर",
    continue: "आगे बढ़ें",
    orContinue: "या इसके साथ जारी रखें",
    signUp: "साइन अप करें",
    createAccount: "खाता बनाएं",
    fillRegister: "पंजीकरण करने के लिए अपना विवरण भरें",
    fullName: "पूरा नाम",
    emailAddr: "ईमेल पता",
    dob: "जन्म तिथि",
    gender: "लिंग",
    referralCode: "रेफरल कोड (वैकल्पिक)",
    agreeTerms: "मैं नियम व शर्तों और गोपनीयता नीति से सहमत हूँ",
    registerNow: "अभी पंजीकरण करें",
    verifyMobile: "मोबाइल सत्यापित करें",
    enterOtp: "दर्ज करें 6-अंकीय कोड जो भेजा गया है",
    resendOtp: "ओटीपी पुन: भेजें",
    verifyCont: "सत्यापित करें और आगे बढ़ें",
    didNotReceive: "कोड प्राप्त नहीं हुआ?",
    loginSuccess: "लॉगिन सफल!",
    welcomeNexora: "नेक्सोरा एरिना में आपका स्वागत है। आपका खाता सुरक्षित और उपयोग के लिए तैयार है।",
    goDashboard: "डैशबोर्ड पर जाएं",
    appearance: "दिखावट",
    darkMode: "डार्क मोड",
    enableDark: "ऐप के लिए डार्क थीम सक्षम करें",
    preferences: "प्राथमिकताएं",
    appLang: "ऐप की भाषा",
    selectLang: "अपनी पसंदीदा भाषा चुनें",
    support: "सहायता",
    commissionInfo: "कमीशन जानकारी",
    referEarn: "रेफर और कमाएं",
    matchHistory: "मैच इतिहास",
    myTournaments: "मेरे टूर्नामेंट",
    popularGames: "लोकप्रिय गेम्स",
    viewAll: "सभी देखें",
    live: "लाइव",
    new: "नया",
    registered: "पंजीकृत",
    slots: "स्लॉट",
    entry: "प्रवेश शुल्क",
    prizePool: "पुरस्कार पूल",
    joined: "शामिल हुए",
    processing: "प्रसंस्करण",
    success: "सफल",
    refund: "रिफंड",
    withdrawn: "निकासी",
    addedCash: "नकद जोड़ा गया"
  }
};

const state = {
  currentPage: 'splash',
  previousPages: [],
  loggedIn: false,
  language: 'en',
  darkMode: true,
  notifications: [],
  user: {
    name: 'NexoraPlayer',
    id:   'NKAJ890',
    walletBalance: 2450,
  },
  onboardingSlide: 0,
  bannerSlide: 0,
  countdownSeconds: 150, // 02:30
  countdownTimer: null,
  bannerTimer: null,
  activeTournamentFilter: 'all',
  activeGameFilter: 'all',
  activeWalletTab: 'add',
  selectedTournament: null,
};

// ────────────────────────────────────────────────────
// CONFIG & SETTINGS
// ────────────────────────────────────────────────────
let APP_SETTINGS = {
  appName: "Nexora Arena",
  commission: 15,
  maintenanceMode: false,
  referralBonus: 20,
  minWithdrawal: 100,
  currency: "INR"
};
let NOTICES = [];
let BANNERS = [
  { id: 'B001', title: 'NEXORA\nChampionship', subtitle: '₹5,00,000', game: 'BGMI', type: 'LIVE', active: true, color: '#1a3a6c,#0d47a1' },
  { id: 'B002', title: 'BGMI Solo\nShowdown', subtitle: '₹50,000', game: 'BGMI', type: 'NEW', active: true, color: '#7c3aed,#9333ea' }
];

// ────────────────────────────────────────────────────
// MOCK DATA
// ────────────────────────────────────────────────────
let GAMES = [
  { name: 'BGMI',         emoji: '🎯', color: '#1a3a6c,#0d47a1', count: 24 },
  { name: 'Free Fire MAX', emoji: '🔥', color: '#4a1a6c,#7b1fa2', count: 18 },
  { name: 'Valorant',      emoji: '⚔️', color: '#6c1a1a,#c62828', count: 12 },
  { name: 'COD Mobile',    emoji: '🪖', color: '#1a4a1a,#2e7d32', count: 9  },
  { name: 'Clash Royale',  emoji: '👑', color: '#1a3a5c,#0277bd', count: 15 },
  { name: 'Apex Legends',  emoji: '🦾', color: '#3a1a0a,#bf360c', count: 7  },
  { name: '8 Ball Pool',   emoji: '🎱', color: '#0a2a3a,#006064', count: 21 },
  { name: 'Minecraft',     emoji: '⛏️', color: '#1a3a1a,#388e3c', count: 5  },
  { name: 'FIFA Mobile',   emoji: '⚽', color: '#1a1a4a,#1565c0', count: 11 },
  { name: 'Among Us',      emoji: '🔴', color: '#3a0a0a,#b71c1c', count: 8  },
  { name: 'Fortnite',      emoji: '🏗️', color: '#1a2a3a,#01579b', count: 6  },
  { name: 'Stumble Guys',  emoji: '🎮', color: '#2a1a3a,#4a148c', count: 14 },
];

let TOURNAMENTS = [
  {
    id: 'T001',
    game: 'BGMI',
    name: 'BGMI Solo Showdown',
    prize: '₹50,000',
    prizeRaw: 50000,
    fee: '₹50',
    feeRaw: 50,
    status: 'live',
    slots: '60/100',
    mode: 'TPP · Solo',
    map: 'Erangel',
    date: '15 May · 6:00 PM',
    emoji: '🎯',
    color: '#1a3a6c,#0d47a1',
  },
  {
    id: 'T002',
    game: 'Free Fire MAX',
    name: 'Free Fire Max Duo',
    prize: '₹75,000',
    prizeRaw: 75000,
    fee: '₹30',
    feeRaw: 30,
    status: 'live',
    slots: '32/50',
    mode: 'TPP · Duo',
    map: 'Bermuda',
    date: '15 May · 7:30 PM',
    emoji: '🔥',
    color: '#4a1a6c,#7b1fa2',
  },
  {
    id: 'T003',
    game: 'Valorant',
    name: 'Valorant 5v5 Cup',
    prize: '₹20,000',
    prizeRaw: 20000,
    fee: '₹100',
    feeRaw: 100,
    status: 'upcoming',
    slots: '29/50',
    mode: 'FPP · Team',
    map: 'Haven',
    date: '16 May · 8:00 PM',
    emoji: '⚔️',
    color: '#6c1a1a,#c62828',
  },
  {
    id: 'T004',
    game: 'Clash Royale',
    name: 'Clash Royale Battle',
    prize: '₹10,000',
    prizeRaw: 10000,
    fee: '₹20',
    feeRaw: 20,
    status: 'upcoming',
    slots: '16/32',
    mode: '1v1',
    map: 'Arena',
    date: '17 May · 5:00 PM',
    emoji: '👑',
    color: '#1a3a5c,#0277bd',
  },
  {
    id: 'T005',
    game: 'COD Mobile',
    name: 'COD Battle Royale',
    prize: '₹40,000',
    prizeRaw: 40000,
    fee: '₹75',
    feeRaw: 75,
    status: 'live',
    slots: '48/100',
    mode: 'BR · Solo',
    map: 'Blackout',
    date: '15 May · 9:00 PM',
    emoji: '🪖',
    color: '#1a4a1a,#2e7d32',
  },
  {
    id: 'T006',
    game: 'BGMI',
    name: 'BGMI Squad Finals',
    prize: '₹1,00,000',
    prizeRaw: 100000,
    fee: '₹200',
    feeRaw: 200,
    status: 'completed',
    slots: '100/100',
    mode: 'TPP · Squad',
    map: 'Miramar',
    date: '14 May · 7:00 PM',
    emoji: '🎯',
    color: '#1a3a6c,#0d47a1',
  },
];

let TRANSACTIONS = [
  { id: 'TXN1002456', type: 'credit', desc: 'Added Cash', sub: 'UPI · 12 May 2024',          amount: '+₹500',  amountVal: 500,  method: 'UPI',        icon: '💳' },
  { id: 'TXN1002454', type: 'debit',  desc: 'Joined Tournament', sub: 'BGMI Solo Showdown · 12 May 2024', amount: '-₹50', amountVal: -50, method: 'Wallet', icon: '🎮' },
  { id: 'TXN1002453', type: 'credit', desc: 'Won Tournament', sub: 'Free Fire Max Duo · 11 May 2024',  amount: '+₹200', amountVal: 200, method: 'Wallet', icon: '🏆' },
  { id: 'TXN1002452', type: 'debit',  desc: 'Withdrawn', sub: 'UPI · 10 May 2024',           amount: '-₹300', amountVal: -300, method: 'UPI',        icon: '💸' },
  { id: 'TXN1002451', type: 'credit', desc: 'Referral Bonus', sub: 'Referral code · 9 May 2024',    amount: '+₹20',  amountVal: 20,   method: 'Referral',  icon: '👥' },
  { id: 'TXN1002450', type: 'debit',  desc: 'Joined Tournament', sub: 'Valorant 5v5 Cup · 8 May 2024',  amount: '-₹100', amountVal: -100, method: 'Wallet', icon: '🎮' },
  { id: 'TXN1002449', type: 'credit', desc: 'Added Cash', sub: 'Google Pay · 7 May 2024',        amount: '+₹1,000', amountVal: 1000, method: 'Google Pay', icon: '💳'},
];

const PLAYERS = [
  { name: 'NexoraYT',   id: '#3b4fg', status: 'leader' },
  { name: 'RusherOP',   id: '#71891', status: 'ready'  },
  { name: 'DarkSoul',   id: '#33498', status: 'ready'  },
  { name: 'ShadowOG',   id: '#80490', status: 'ready'  },
  { name: 'KingSlayer', id: '#12309', status: 'ready'  },
  { name: 'PhantomX',   id: '#55821', status: 'waiting' },
  { name: 'ViperGG',    id: '#93210', status: 'ready'  },
  { name: 'ZeroFlick',  id: '#67432', status: 'waiting' },
];

// ────────────────────────────────────────────────────
// ROUTER
// ────────────────────────────────────────────────────
const NAV_PAGES = ['home', 'tournaments', 'games', 'predictions', 'wallet', 'profile'];

// ── Open Casino Game (games.html) ────────────────────────
window.openCasinoApp = function(gameId) {
  // Pass user data through sessionStorage so games.html can pick it up
  const user = state.user || JSON.parse(localStorage.getItem('nexora_user') || 'null');
  if (user) sessionStorage.setItem('nexora_user', JSON.stringify(user));
  window.location.href = '/games.html?game=' + (gameId || 'hub');
};

function navigate(pageId, isBack = false) {
  const currentEl = document.getElementById(`page-${state.currentPage}`);
  const nextEl    = document.getElementById(`page-${pageId}`);
  if (!nextEl) return;

  if (currentEl) currentEl.classList.remove('active', 'back-anim');
  nextEl.classList.remove('back-anim');
  if (isBack) nextEl.classList.add('back-anim');
  nextEl.classList.add('active');

  if (!isBack && pageId !== state.currentPage) {
    state.previousPages.push(state.currentPage);
  }
  state.currentPage = pageId;

  // Manage bottom nav visibility
  const nav = document.getElementById('bottom-nav');
  const showNav = NAV_PAGES.includes(pageId);
  nav.style.display = showNav ? 'flex' : 'none';

  // Update active nav item
  NAV_PAGES.forEach(p => {
    const btn = document.getElementById(`nav-${p}`);
    if (btn) btn.classList.toggle('active', p === pageId);
  });

  // Page-specific init
  onPageEnter(pageId);

  // Scroll to top
  if (nextEl.querySelector('.scroll-body')) {
    nextEl.querySelector('.scroll-body').scrollTop = 0;
  }
  window.scrollTo(0, 0);
}

function goBack() {
  if (state.previousPages.length > 0) {
    const prev = state.previousPages.pop();
    navigate(prev, true);
  } else {
    navigate('home', true);
  }
}

function onPageEnter(pageId) {
  switch (pageId) {
    case 'home':
      renderHomeTournaments();
      updateWalletBadge();
      
      // Update home warnings on entry
      if (state.user) {
        const homeKycWarn = document.getElementById('home-kyc-warning');
        if (homeKycWarn) {
          homeKycWarn.style.display = state.user.kycStatus === 'approved' ? 'none' : 'flex';
        }
      }
      break;
    case 'games':
      renderGamesList();
      break;
    case 'tournaments':
      renderTournamentsList();
      break;
    case 'wallet':
      renderWallet();
      break;
    case 'leaderboard':
      renderLeaderboard();
      break;
    case 'predictions':
      loadPredictionsMatches();
      loadPredictionsStats();
      loadPredictionsLeaderboard();
      break;
    case 'kyc-landing':
      kycPayload = { fullName: '', dob: '', gender: '', phone: '', panCardImg: '', selfieImg: '', submittedAt: '' };
      break;
    case 'kyc-step1':
      if (document.getElementById('kyc-fullname')) document.getElementById('kyc-fullname').value = state.user?.name || '';
      if (document.getElementById('kyc-dob')) document.getElementById('kyc-dob').value = '';
      if (document.getElementById('kyc-phone')) document.getElementById('kyc-phone').value = state.user?.phone ? state.user.phone.replace('+91 ', '') : '';
      selectKycGender('');
      break;
    case 'kyc-step2':
      if (document.getElementById('pan-preview')) document.getElementById('pan-preview').style.display = 'none';
      if (document.getElementById('pan-placeholder')) document.getElementById('pan-placeholder').style.display = 'block';
      if (document.getElementById('kyc-pan-file')) document.getElementById('kyc-pan-file').value = '';
      break;
    case 'kyc-step3':
      if (document.getElementById('selfie-preview')) document.getElementById('selfie-preview').style.display = 'none';
      if (document.getElementById('selfie-placeholder')) document.getElementById('selfie-placeholder').style.display = 'block';
      if (document.getElementById('kyc-selfie-file')) document.getElementById('kyc-selfie-file').value = '';
      break;
    case 'match-room':
      renderMatchRoom();
      startCountdown();
      renderPlayers();
      break;
    case 'profile':
      renderProfile();
      break;
    case 'settings':
      const toggleEl = document.getElementById('sett-darkmode-toggle');
      if (toggleEl) toggleEl.checked = state.darkMode;
      const selectEl = document.getElementById('sett-lang-select');
      if (selectEl) selectEl.value = state.language;
      break;
    case 'notifications':
      (async () => {
        try {
          const res = await fetch(`${SERVER}/api/notifications`);
          if (res.ok) {
            state.notifications = await res.json();
          }
        } catch(e) {
          console.error(e);
        }
        renderNotifications();
        
        try {
          await fetch(`${SERVER}/api/notifications/read`, { method: 'PUT' });
          (state.notifications || []).forEach(n => n.read = true);
          const badge = document.getElementById('notif-badge');
          if (badge) badge.style.display = 'none';
        } catch(e) {
          console.error(e);
        }
      })();
      break;
    case 'contact-us':
      loadSupportInfo();
      loadUserTickets();
      break;
    case 'ticket-create':
      document.getElementById('tk-create-subject').value = '';
      document.getElementById('tk-create-description').value = '';
      selectedTicketFiles = [];
      renderSelectedFiles();
      break;
  }
}

// ────────────────────────────────────────────────────
// SERVER SYNC (SSE & REST API)
// ────────────────────────────────────────────────────
const SERVER = (window.location.port === '3000') ? window.location.origin : 'http://10.130.112.187:3000';
const API = SERVER + '/api';

function connectSSE() {
  const sse = new EventSource(`${SERVER}/sse`);

  sse.addEventListener('init', e => {
    const data = JSON.parse(e.data);
    if (data.tournaments) {
      TOURNAMENTS = data.tournaments.map(t => ({
        id: t.id,
        game: t.game,
        name: t.name,
        prize: '₹' + t.prize.toLocaleString('en-IN'),
        prizeRaw: t.prize,
        fee: '₹' + t.fee,
        feeRaw: t.fee,
        status: t.status,
        slots: `${t.registered || t.filled || 0}/${t.slots}`,
        slotsRaw: t.slots,
        registered: t.registered !== undefined ? t.registered : (t.filled || 0),
        filled: t.registered !== undefined ? t.registered : (t.filled || 0),
        mode: `${t.mode} · ${t.type}`,
        modeRaw: t.mode,
        typeRaw: t.type,
        map: t.map,
        date: `${t.date} · ${t.time}`,
        dateRaw: t.date,
        timeRaw: t.time,
        emoji: getGameEmoji(t.game),
        color: getGameColor(t.game),
        image: t.image,
        description: t.description,
        prizeDistribution: t.prizeDistribution,
        roomId: t.roomId,
        roomPassword: t.roomPassword,
        joinedUsers: t.joinedUsers,
        winners: t.winners
      }));
    }
    if (data.games) {
      GAMES = data.games.map(g => ({
        name: g.name,
        emoji: g.emoji,
        color: g.color || '#1a3a6c,#0d47a1',
        count: g.tournaments || 0,
        image: g.image
      }));
    }
    if (data.banners) {
      BANNERS = data.banners;
    }
    if (data.settings) {
      APP_SETTINGS = data.settings;
    }
    if (data.notices) {
      NOTICES = data.notices;
    }
    
    // Sync app details
    document.querySelectorAll('.brand-name').forEach(el => {
      el.innerHTML = APP_SETTINGS.appName.replace(/o/i, '<span>O</span>');
    });
    
    checkMaintenance();
    renderHomeGames();
    renderHomeTournaments();
    renderHomeBanners();
    renderNoticesBanner();
  });

  sse.addEventListener('tournaments_updated', e => {
    const rawTournaments = JSON.parse(e.data);
    TOURNAMENTS = rawTournaments.map(t => ({
      id: t.id,
      game: t.game,
      name: t.name,
      prize: '₹' + t.prize.toLocaleString('en-IN'),
      prizeRaw: t.prize,
      fee: '₹' + t.fee,
      feeRaw: t.fee,
      status: t.status,
      slots: `${t.registered || t.filled || 0}/${t.slots}`,
      slotsRaw: t.slots,
      registered: t.registered !== undefined ? t.registered : (t.filled || 0),
      filled: t.registered !== undefined ? t.registered : (t.filled || 0),
      mode: `${t.mode} · ${t.type}`,
      modeRaw: t.mode,
      typeRaw: t.type,
      map: t.map,
      date: `${t.date} · ${t.time}`,
      dateRaw: t.date,
      timeRaw: t.time,
      emoji: getGameEmoji(t.game),
      color: getGameColor(t.game),
      image: t.image,
      description: t.description,
      prizeDistribution: t.prizeDistribution,
      roomId: t.roomId,
      roomPassword: t.roomPassword,
      joinedUsers: t.joinedUsers,
      winners: t.winners
    }));
    
    if (state.currentPage === 'home') renderHomeTournaments();
    if (state.currentPage === 'tournaments') renderTournamentsList();
    showToast('🔄 Tournaments updated by Admin!', 'success');
  });

  sse.addEventListener('games_updated', e => {
    const rawGames = JSON.parse(e.data);
    GAMES = rawGames.map(g => ({
      name: g.name,
      emoji: g.emoji,
      color: g.color || '#1a3a6c,#0d47a1',
      count: g.tournaments || 0,
      image: g.image
    }));
    if (state.currentPage === 'games') renderGamesList();
    if (state.currentPage === 'home') renderHomeGames();
  });

  sse.addEventListener('banners_updated', e => {
    BANNERS = JSON.parse(e.data);
    renderHomeBanners();
  });

  sse.addEventListener('settings_updated', e => {
    APP_SETTINGS = JSON.parse(e.data);
    document.querySelectorAll('.brand-name').forEach(el => {
      el.innerHTML = APP_SETTINGS.appName.replace(/o/i, '<span>O</span>');
    });
    checkMaintenance();
  });

  sse.addEventListener('notices_updated', e => {
    NOTICES = JSON.parse(e.data);
    renderNoticesBanner();
  });

  sse.addEventListener('transactions_updated', e => {
    const rawTx = JSON.parse(e.data);
    TRANSACTIONS = rawTx.map(t => ({
      id: t.id,
      type: t.type === 'added' || t.type === 'credit' || t.type === 'refund' ? 'credit' : 'debit',
      desc: t.type === 'joined' ? 'Joined Tournament' : t.type === 'added' ? 'Added Cash' : t.type === 'withdrawal' ? 'Withdrawn' : t.type,
      sub: `${t.method} · ${t.date}`,
      amount: `${t.amount > 0 ? '+' : ''}₹${t.amount.toLocaleString('en-IN')}`,
      amountVal: t.amount,
      method: t.method,
      icon: t.type === 'added' ? '💳' : t.type === 'withdrawal' ? '💸' : '🎮'
    }));
    if (state.currentPage === 'wallet') renderWallet();
  });

  sse.addEventListener('withdrawals_updated', e => {
    const rawWds = JSON.parse(e.data);
    const myWd = rawWds.find(w => (w.userId === state.user.id) || (w.user === state.user.name));
    if (myWd) {
      if (myWd.status === 'approved' && state.currentPage === 'withdraw-processing') {
        document.getElementById('ws-amount-text').textContent = `₹${myWd.amount.toLocaleString('en-IN')}.00`;
        document.getElementById('ws-amount-badge').textContent = `₹${myWd.amount.toLocaleString('en-IN')}.00`;
        document.getElementById('ws-method-badge').textContent = myWd.method.toUpperCase();
        document.getElementById('ws-time-badge').textContent = myWd.paidAt || myWd.date;
        
        navigate('withdraw-success');
        loadUserData();
      } else if (myWd.status === 'rejected' && state.currentPage === 'withdraw-processing') {
        showToast(`Withdrawal request of ₹${myWd.amount.toLocaleString('en-IN')} was rejected. Balance refunded. ❌`, 'error');
        navigate('wallet');
        loadUserData();
      }
    }
  });

  sse.addEventListener('notifications_updated', e => {
    state.notifications = JSON.parse(e.data);
    const unread = state.notifications.filter(n => !n.read);
    if (unread.length > 0) {
      const latest = unread[0];
      const ageMs = Date.now() - new Date(latest.date).getTime();
      if (isNaN(ageMs) || ageMs < 15000) {
        showToast(`🔔 New notification: ${latest.title}`, 'info');
      }
    }
    renderNotifications();
  });

  sse.addEventListener('support_settings_updated', e => {
    const settings = JSON.parse(e.data);
    updateSupportInfoDOM(settings);
  });

  sse.addEventListener('users_updated', e => {
    if (!state.user || !state.user.id) return;
    const rawUsers = JSON.parse(e.data);
    const myProfile = rawUsers.find(u => u.id === state.user.id);
    if (myProfile) {
      state.user = { 
        ...state.user, 
        ...myProfile,
        walletBalance: myProfile.balance !== undefined ? myProfile.balance : state.user.walletBalance
      };
      localStorage.setItem('nexora_user', JSON.stringify(state.user));
      
      const homeKycWarn = document.getElementById('home-kyc-warning');
      if (homeKycWarn) {
        homeKycWarn.style.display = state.user.kycStatus === 'approved' ? 'none' : 'flex';
      }
      if (state.currentPage === 'wallet') {
        renderWallet();
      }
      // Update badge text directly to prevent recursive infinite loop syncing
      const el = document.getElementById('home-wallet-bal');
      if (el) el.textContent = formatCurrency(state.user.walletBalance);
    }
  });

  sse.addEventListener('predictions_updated', e => {
    state.predictionMatches = JSON.parse(e.data);
    if (state.currentPage === 'predictions') {
      renderPredictionsMatches();
    } else if (state.currentPage === 'prediction-match-details' && state.selectedPredictionMatch) {
      const updated = state.predictionMatches.find(m => m.id === state.selectedPredictionMatch.id);
      if (updated) {
        state.selectedPredictionMatch = updated;
        renderPredictionMatchDetails(updated);
      }
    }
  });

  sse.addEventListener('tickets_updated', e => {
    const rawTickets = JSON.parse(e.data);
    const userTickets = rawTickets.filter(t => t.userId === state.user.id);
    renderUserTicketsList(userTickets);

    if (state.currentPage === 'ticket-details') {
      const activeId = document.getElementById('tk-dt-hidden-id').value;
      const activeTicket = rawTickets.find(t => t.id === activeId);
      if (activeTicket) {
        renderUserTicketChat(activeTicket.replies);
        document.getElementById('tk-dt-status-badge').textContent = activeTicket.status.toUpperCase();
        
        const badge = document.getElementById('tk-dt-status-badge');
        badge.className = 'badge';
        if (activeTicket.status === 'open') badge.classList.add('badge-pending');
        if (activeTicket.status === 'in-progress') badge.classList.add('badge-warning');
        if (activeTicket.status === 'awaiting') badge.classList.add('badge-info');
        if (activeTicket.status === 'resolved') badge.classList.add('badge-success');
        if (activeTicket.status === 'closed') badge.classList.add('badge-danger');
      }
    }
  });

  sse.onerror = () => {
    console.error('SSE connection lost.');
  };
}

function getGameEmoji(gameName) {
  const g = GAMES.find(x => x.name === gameName);
  return g?.emoji || '🎮';
}

function getGameColor(gameName) {
  const g = GAMES.find(x => x.name === gameName);
  return g?.color || '#1a3a6c,#0d47a1';
}

function renderHomeBanners() {
  const container = document.getElementById('home-banner');
  if (!container) return;
  const activeBanners = BANNERS.filter(b => b.active);
  if (!activeBanners.length) {
    container.innerHTML = '<div style="padding:40px; text-align:center; color:var(--text-muted)">Welcome to Nexora Arena</div>';
    return;
  }
  container.innerHTML = activeBanners.map((b, idx) => {
    // ─── Media background ───────────────────────────────────
    let backgroundHTML = '';
    if (b.video) {
      backgroundHTML = `<video src="${b.video}" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; z-index:0;" muted autoplay loop playsinline></video>`;
    } else if (b.image) {
      backgroundHTML = `<img src="${b.image}" alt="Banner" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; z-index:0;" />`;
    } else {
      const gradient = `linear-gradient(135deg, ${b.color || '#1a3a6c,#0d47a1'})`;
      backgroundHTML = `<div style="position:absolute; inset:0; background:${gradient}; display:flex; align-items:center; justify-content:center; font-size:3.5rem; z-index:0;">${getGameEmoji(b.game)}</div>`;
    }

    const safeTitle    = (b.title || 'Nexora Cup').replace(/\n/g, '<br>');
    const safeType     = (b.type || 'LIVE').toUpperCase();
    const safeSubtitle = b.subtitle || '';

    // ─── Default banner click action ────────────────────────
    const bannerClickFn = _buildBannerActionFn(b.action);

    // ─── Custom buttons ─────────────────────────────────────
    const btnColors = { primary: 'linear-gradient(135deg, #7c3aed, #db2777)', secondary: 'linear-gradient(135deg, #1e3a6e, #2563eb)', danger: 'linear-gradient(135deg, #b91c1c, #dc2626)', success: 'linear-gradient(135deg, #065f46, #10b981)' };
    let buttonsHTML = '';
    if (b.buttons && b.buttons.length > 0) {
      buttonsHTML = `<div style="display:flex; gap:8px; margin-top:10px; flex-wrap:wrap;">` +
        b.buttons.map(btn => {
          const fn = _buildBannerActionFn(btn);
          const bg = btnColors[btn.style] || btnColors.primary;
          return `<button onclick="${fn}" style="background:${bg}; border:none; color:#fff; padding:7px 16px; border-radius:8px; font-size:0.72rem; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; cursor:pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">${btn.label || 'Join Now'}</button>`;
        }).join('') + `</div>`;
    } else {
      // Default explore button
      buttonsHTML = `<button onclick="${bannerClickFn}" style="background:linear-gradient(135deg, #7c3aed, #db2777); border:none; color:#fff; padding:7px 16px; border-radius:8px; font-size:0.72rem; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; cursor:pointer; margin-top:10px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">Explore</button>`;
    }

    return `
      <div class="home-banner-slide ${idx === 0 ? 'active' : ''}" onclick="${bannerClickFn}" style="position:relative; width:100%; height:100%; cursor:pointer; overflow:hidden;">
        ${backgroundHTML}
        <div style="position:absolute; inset:0; background:linear-gradient(to right, rgba(10,10,20,0.92) 45%, rgba(10,10,20,0.2) 100%); padding:18px 16px; display:flex; flex-direction:column; justify-content:center; align-items:flex-start; z-index:1;">
          <div style="background:${safeType.includes('OFFER') ? '#10b981' : safeType.includes('NEW') ? '#3b82f6' : '#ef4444'}; color:#fff; font-size:0.6rem; font-weight:900; text-transform:uppercase; letter-spacing:1px; padding:3px 8px; border-radius:4px; margin-bottom:8px;">
            ${safeType}
          </div>
          <div style="font-size:1.12rem; font-weight:900; color:#fff; line-height:1.2; text-transform:uppercase; text-shadow: 0 2px 8px rgba(0,0,0,0.6);">
            ${safeTitle}
          </div>
          <div style="font-size:1.25rem; font-weight:900; color:#eab308; margin-top:4px; text-shadow: 0 2px 8px rgba(0,0,0,0.5);">
            ${safeSubtitle}
          </div>
          ${buttonsHTML}
        </div>
      </div>
    `;
  }).join('') + `
    <div class="banner-dots" style="position:absolute; bottom:8px; left:50%; transform:translateX(-50%); display:flex; gap:6px; z-index:10;">
      ${activeBanners.map((_, idx) => `<div class="banner-dot ${idx === 0 ? 'active' : ''}" id="bd-${idx}" style="width:${idx === 0 ? '12px' : '4px'}; height:4px; border-radius:2px; background:#fff; opacity:${idx === 0 ? '0.8' : '0.4'}; transition:all 0.3s ease;"></div>`).join('')}
    </div>
  `;
  state.bannerSlide = 0;
  startBannerCarousel();
}

// Build onclick function string for a banner action object
function _buildBannerActionFn(action) {
  if (!action || !action.type) return `navigate('tournaments')`;
  if (action.type === 'page') return `navigate('${action.page || 'tournaments'}')`;
  if (action.type === 'external') return `window.open('${action.url || ''}', '_blank')`;
  if (action.type === 'tournament') {
    if (action.tournamentId) return `openTournamentDetail('${action.tournamentId}')`;
    return `navigate('tournaments')`;
  }
  return `navigate('tournaments')`;
}

function renderNoticesBanner() {
  const container = document.getElementById('notices-container');
  if (!container) return;
  const activeNotices = NOTICES.filter(n => n.active);
  if (!activeNotices.length) {
    container.innerHTML = '';
    return;
  }
  container.innerHTML = activeNotices.map(n => `
    <div style="background:${n.type === 'warning' ? 'rgba(245,158,11,0.12)' : 'rgba(59,130,246,0.12)'};
                border:1px solid ${n.type === 'warning' ? 'var(--warning)' : 'var(--info)'};
                border-radius:var(--radius-md); padding:10px 14px; margin:16px 16px 4px;
                display:flex; gap:10px; font-size:0.8rem; line-height:1.4">
      <span style="font-size:1.1rem">${n.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
      <div style="flex:1">
        <strong style="color:#fff; display:block; margin-bottom:2px">${n.title}</strong>
        <span style="color:var(--text-secondary)">${n.message}</span>
      </div>
    </div>
  `).join('');
}

function checkMaintenance() {
  let overlay = document.getElementById('maintenance-overlay');
  if (APP_SETTINGS.maintenanceMode) {
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'maintenance-overlay';
      overlay.style.cssText = `
        position:fixed; inset:0; background:var(--bg-base); z-index:10000;
        display:flex; flex-direction:column; align-items:center; justify-content:center;
        text-align:center; padding:24px; font-family:var(--font-base);
      `;
      overlay.innerHTML = `
        <div style="font-size:3rem; margin-bottom:16px">🛠️</div>
        <h2 style="font-size:1.8rem; font-weight:800; margin-bottom:12px;
                   background:linear-gradient(135deg, #fff, var(--accent-bright));
                   -webkit-background-clip:text; -webkit-text-fill-color:transparent;">Under Maintenance</h2>
        <p style="color:var(--text-muted); font-size:0.92rem; max-width:280px; line-height:1.5">
          We are upgrading our servers to give you the best gaming experience. We will be back online shortly!
        </p>
      `;
      document.body.appendChild(overlay);
    }
  } else {
    if (overlay) overlay.remove();
  }
}

// ────────────────────────────────────────────────────
// SPLASH → AUTO TRANSITION
// ────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  connectSSE();
  renderAllStatic();

  const cachedTheme = localStorage.getItem('nexora_theme') || 'dark';
  const cachedLang = localStorage.getItem('nexora_lang') || 'en';
  toggleDarkMode(cachedTheme === 'dark');
  applyLanguage(cachedLang);

  const savedUser = localStorage.getItem('nexora_user');
  if (savedUser) {
    state.loggedIn = true;
    state.user = JSON.parse(savedUser);
    if (state.user.theme) {
      toggleDarkMode(state.user.theme === 'dark');
    }
    if (state.user.language) {
      applyLanguage(state.user.language);
    }
  }

  setTimeout(() => {
    if (state.loggedIn) {
      navigate('home');
    } else {
      navigate('onboarding');
    }
  }, 2800);
  startBannerCarousel();
});

// ────────────────────────────────────────────────────
// ONBOARDING
// ────────────────────────────────────────────────────
window.nextOnboardingSlide = function() {
  const slides = document.querySelectorAll('.onboarding-slide');
  const dots   = document.querySelectorAll('.onboarding-dot');

  slides[state.onboardingSlide].classList.remove('active');
  dots[state.onboardingSlide].classList.remove('active');

  state.onboardingSlide++;

  if (state.onboardingSlide >= slides.length) {
    navigate('auth');
    state.onboardingSlide = 0;
    return;
  }

  slides[state.onboardingSlide].classList.add('active');
  dots[state.onboardingSlide].classList.add('active');

  const btn = document.getElementById('ob-next-btn');
  if (state.onboardingSlide === slides.length - 1) {
    btn.textContent = "Get Started";
  }
};

// ────────────────────────────────────────────────────
// AUTH
// ────────────────────────────────────────────────────
window.switchAuthView = function(view) {
  const views = ['login', 'signup', 'otp', 'success'];
  views.forEach(v => {
    const el = document.getElementById(`auth-view-${v}`);
    if (el) el.style.display = (v === view) ? 'block' : 'none';
  });
};

window.selectGameForTournaments = function(gameName) {
  state.activeGameFilter = gameName;
  state.activeTournamentFilter = 'all';
  
  document.querySelectorAll('#page-tournaments .filter-tab').forEach(b => {
    b.classList.toggle('active', b.getAttribute('onclick')?.includes("'all'"));
  });

  navigate('tournaments');
};

let otpCountdown = 25;
let otpTimerInterval = null;
let authMode = 'login';
let pendingUserPayload = null;

function startOtpTimer() {
  if (otpTimerInterval) clearInterval(otpTimerInterval);
  otpCountdown = 25;
  const secondsEl = document.getElementById('otp-seconds');
  const timerTextEl = document.getElementById('otp-timer-text');
  
  if (timerTextEl) {
    timerTextEl.innerHTML = `Resend OTP in <b style="color:var(--accent-bright)" id="otp-seconds">00:25</b>`;
  }
  
  otpTimerInterval = setInterval(() => {
    otpCountdown--;
    const secEl = document.getElementById('otp-seconds');
    if (secEl) secEl.textContent = `00:${String(otpCountdown).padStart(2, '0')}`;
    
    if (otpCountdown <= 0) {
      clearInterval(otpTimerInterval);
      if (timerTextEl) {
        timerTextEl.innerHTML = `Didn't receive code? <span onclick="resendOtpCode()" style="color:var(--accent-bright); font-weight:700; cursor:pointer;">Resend OTP</span>`;
      }
    }
  }, 1000);
}

window.socialLogin = function(provider) {
  showToast(`Connecting to ${provider}... 🔐`, 'success');
  
  const loader = document.createElement('div');
  loader.id = 'social-login-loader';
  loader.style = `
    position: fixed;
    inset: 0;
    z-index: 10000;
    background: rgba(11, 11, 22, 0.95);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    animation: fadeIn 0.3s ease;
  `;
  loader.innerHTML = `
    <style>
    @keyframes socialSpin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    </style>
    <div class="spinner" style="width:50px; height:50px; border:4px solid rgba(255,255,255,0.1); border-top-color:var(--accent-bright); border-radius:50%; animation: socialSpin 1s linear infinite;"></div>
    <div style="font-size:0.9rem; font-weight:700; color:#fff;">Authenticating with ${provider}...</div>
  `;
  document.body.appendChild(loader);

  setTimeout(async () => {
    const el = document.getElementById('social-login-loader');
    if (el) el.remove();

    const email = provider === 'Google' ? 'vijay.nagare@gmail.com' : 'vijay.fb@gmail.com';
    const name = provider === 'Google' ? 'Vijay Nagare' : 'Vijay Nagare (FB)';
    const phone = '+91 9576543210';

    pendingUserPayload = {
      name: name,
      email: email,
      phone: phone,
      balance: 2450,
      tournaments: 0,
      spent: 0,
      status: 'Active',
      verificationStatus: 'Verified',
      joined: new Date().toLocaleDateString('en-IN')
    };

    try {
      const res = await fetch(`${SERVER}/api/users`);
      if (res.ok) {
        const users = await res.json();
        const matched = users.find(u => u.email === email);
        if (matched) {
          pendingUserPayload = matched;
        } else {
          const createRes = await fetch(`${SERVER}/api/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pendingUserPayload)
          });
          if (createRes.ok) {
            pendingUserPayload = await createRes.json();
          }
        }
      }
    } catch(e) {
      console.error('Failed to sync social user:', e);
    }

    state.user.name = pendingUserPayload.name;
    state.user.id = pendingUserPayload.id || 'GA10003';
    state.user.walletBalance = pendingUserPayload.balance !== undefined ? pendingUserPayload.balance : 2450;
    state.user.kycStatus = pendingUserPayload.kycStatus || 'unverified';
    state.user.kycDetails = pendingUserPayload.kycDetails || {};

    state.loggedIn = true;
    localStorage.setItem('nexora_user', JSON.stringify(state.user));
    
    updateWalletBadge();
    renderWallet();

    showToast(`Welcome, ${state.user.name}! 🎉`, 'success');
    navigate('home');
  }, 2000);
};

window.submitLoginPhone = async function() {
  const phone = document.getElementById('login-phone').value.trim();
  if (!phone || phone.length < 10) {
    showToast('Please enter a valid 10-digit mobile number', 'error');
    return;
  }
  
  authMode = 'login';
  
  pendingUserPayload = {
    name: 'NexoraPlayer',
    phone: '+91 ' + phone,
    email: 'player_' + phone + '@gmail.com'
  };

  try {
    const res = await fetch(`${SERVER}/api/users`);
    if (res.ok) {
      const users = await res.json();
      const matched = users.find(u => u.phone?.replace(/[^0-9]/g, '').endsWith(phone));
      if (matched) {
        pendingUserPayload = matched;
      }
    }
  } catch (e) {
    console.error(e);
  }

  const sub = document.getElementById('otp-subtitle-phone');
  if (sub) sub.textContent = `Enter the 6-digit code sent to +91 ${phone}`;
  switchAuthView('otp');
  startOtpTimer();
  showToast('OTP sent successfully! 💬', 'success');
};

window.moveToNextOtp = function(index) {
  const current = document.getElementById(`otp-${index}`);
  if (current && current.value.length === 1 && index < 6) {
    const next = document.getElementById(`otp-${index + 1}`);
    if (next) next.focus();
  }
};

window.handleOtpBackspace = function(event, index) {
  if (event.key === 'Backspace') {
    const current = document.getElementById(`otp-${index}`);
    if (current && current.value.length === 0 && index > 1) {
      const prev = document.getElementById(`otp-${index - 1}`);
      if (prev) {
        prev.focus();
        prev.value = '';
      }
    }
  }
};

window.submitSignup = function() {
  const name = document.getElementById('signup-fullname').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const phone = document.getElementById('signup-phone').value.trim();
  const dob = document.getElementById('signup-dob').value;
  const gender = document.getElementById('signup-gender').value;
  const refCode = document.getElementById('signup-referral').value.trim();
  const agree = document.getElementById('signup-agree').checked;

  if (!name || !email || !phone || !dob) {
    showToast('All registration fields are required!', 'error');
    return;
  }
  if (phone.length < 10) {
    showToast('Please enter a valid 10-digit phone number!', 'error');
    return;
  }
  if (!agree) {
    showToast('You must agree to the Terms & Conditions!', 'error');
    return;
  }

  authMode = 'signup';
  
  // Format joined date: "12 Jun 2024, 09:30 AM"
  const now = new Date();
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const day = now.getDate();
  const month = months[now.getMonth()];
  const year = now.getFullYear();
  let hr = now.getHours();
  const min = String(now.getMinutes()).padStart(2, '0');
  const ampm = hr >= 12 ? 'PM' : 'AM';
  hr = hr % 12;
  hr = hr ? hr : 12; // hour '0' should be '12'
  const formattedJoined = `${day} ${month} ${year}, ${String(hr).padStart(2, '0')}:${min} ${ampm}`;

  // Format Date of Birth for display: "02 Feb 2004"
  const dobParts = dob.split('-');
  let dobFormatted = dob;
  if (dobParts.length === 3) {
    const dYear = dobParts[0];
    const dMonthIdx = parseInt(dobParts[1]) - 1;
    const dDay = dobParts[2];
    dobFormatted = `${dDay} ${months[dMonthIdx]} ${dYear}`;
  }

  pendingUserPayload = {
    name: name,
    email: email,
    phone: '+91 ' + phone,
    dateOfBirth: dobFormatted,
    gender: gender,
    referralCode: refCode,
    balance: 2450,
    tournaments: 0,
    spent: 0,
    status: 'Active',
    joined: formattedJoined,
    verificationStatus: 'Verified',
    bankDetails: {
      bankName: 'HDFC Bank',
      accountNumber: '50100' + Math.floor(100000000 + Math.random() * 900000000),
      ifsc: 'HDFC0000124',
      accountHolder: name
    }
  };

  const sub = document.getElementById('otp-subtitle-phone');
  if (sub) sub.textContent = `Enter the 6-digit code sent to +91 ${phone}`;
  switchAuthView('otp');
  startOtpTimer();
  showToast('OTP sent successfully! 💬', 'success');
};

window.verifyOtpCode = function() {
  let code = '';
  for (let i = 1; i <= 6; i++) {
    const val = document.getElementById(`otp-${i}`).value;
    code += val;
  }

  if (code.length < 6) {
    showToast('Please enter complete 6-digit OTP code!', 'error');
    return;
  }

  clearInterval(otpTimerInterval);
  switchAuthView('success');
  showToast('OTP verified successfully! 🛡️', 'success');
};

window.resendOtpCode = function() {
  startOtpTimer();
  showToast('OTP resent successfully!', 'success');
};

window.proceedToDashboard = async function() {
  if (pendingUserPayload && !pendingUserPayload.id) {
    try {
      const res = await fetch(`${SERVER}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pendingUserPayload)
      });
      if (res.ok) {
        const created = await res.json();
        state.user.name = created.name;
        state.user.id = created.id;
        state.user.walletBalance = created.balance;
      }
    } catch(e) {
      console.error(e);
      state.user.name = pendingUserPayload.name;
      state.user.id = 'NKAJ890';
      state.user.walletBalance = 2450;
    }
  } else if (pendingUserPayload) {
    state.user.name = pendingUserPayload.name;
    state.user.id = pendingUserPayload.id;
    state.user.walletBalance = pendingUserPayload.balance !== undefined ? pendingUserPayload.balance : 2450;
    
    // Sync settings
    if (pendingUserPayload.theme) {
      toggleDarkMode(pendingUserPayload.theme === 'dark');
    }
    if (pendingUserPayload.language) {
      applyLanguage(pendingUserPayload.language);
    }
  }

  state.loggedIn = true;
  localStorage.setItem('nexora_user', JSON.stringify(state.user));
  updateWalletBadge();
  renderWallet();
  
  document.getElementById('login-phone').value = '';
  document.getElementById('signup-fullname').value = '';
  document.getElementById('signup-email').value = '';
  document.getElementById('signup-phone').value = '';
  
  for (let i = 1; i <= 6; i++) {
    document.getElementById(`otp-${i}`).value = '';
  }

  showToast(`Welcome back, ${state.user.name}! 🎮`, 'success');
  navigate('home');
};

window.doLogout = function() {
  state.loggedIn = false;
  state.previousPages = [];
  localStorage.removeItem('nexora_user');
  showToast('Logged out successfully', 'success');
  switchAuthView('login');
  navigate('auth');
};

// ────────────────────────────────────────────────────
// HOME
// ────────────────────────────────────────────────────
function renderHomeTournaments() {
  const container = document.getElementById('home-tournaments');
  if (!container) return;
  const liveTournaments = TOURNAMENTS.filter(t => t.status === 'live').slice(0, 3);
  container.innerHTML = liveTournaments.map(t => tournamentCardHTML(t)).join('');
}

async function syncUserBalanceToServer() {
  if (!state.user.id) return;
  try {
    await fetch(`${SERVER}/api/users/${state.user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ balance: state.user.walletBalance })
    });
  } catch(e) {
    console.error('Failed to sync walletBalance to server:', e);
  }
}

function updateWalletBadge() {
  const el = document.getElementById('home-wallet-bal');
  if (el) el.textContent = formatCurrency(state.user.walletBalance);
  syncUserBalanceToServer();
}

function startBannerCarousel() {
  if (state.bannerTimer) clearInterval(state.bannerTimer);
  state.bannerTimer = setInterval(() => {
    const slides = document.querySelectorAll('.home-banner-slide');
    const dots   = document.querySelectorAll('.banner-dot');
    if (!slides.length) return;
    slides[state.bannerSlide].classList.remove('active');
    dots[state.bannerSlide]?.classList.remove('active');
    state.bannerSlide = (state.bannerSlide + 1) % slides.length;
    slides[state.bannerSlide].classList.add('active');
    dots[state.bannerSlide]?.classList.add('active');
  }, 3500);
}

// ────────────────────────────────────────────────────
// GAMES LIST
// ────────────────────────────────────────────────────
function renderGamesList() {
  const grid = document.getElementById('games-list-grid');
  if (!grid) return;
  grid.innerHTML = GAMES.map(g => {
    const bgStyle = g.image 
      ? `background-image:url(${g.image}); background-size:cover; background-position:center;`
      : `background:linear-gradient(135deg,${g.color});`;
    const innerContent = g.image ? '' : g.emoji;
    
    return `
      <div class="game-card" onclick="selectGameForTournaments('${g.name}')">
        <div class="game-card-img">
          <div style="width:100%;height:100%;${bgStyle}display:flex;align-items:center;justify-content:center;font-size:1.8rem">${innerContent}</div>
        </div>
        <div class="game-card-name">${g.name}</div>
        <div class="game-card-count">${g.count} Tournaments</div>
      </div>
    `;
  }).join('');
}

function renderHomeGames() {
  const container = document.getElementById('home-games-scroll');
  if (!container) return;
  const activeGames = GAMES.slice(0, 8);
  container.innerHTML = activeGames.map(g => {
    const bgStyle = g.image 
      ? `background-image:url(${g.image}); background-size:cover; background-position:center;`
      : `background:linear-gradient(135deg,${g.color});`;
    const innerContent = g.image ? '' : g.emoji;
    
    return `
      <div class="game-thumb" onclick="selectGameForTournaments('${g.name}')">
        <div class="game-thumb-img" style="${bgStyle}">
          <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:1.4rem">${innerContent}</div>
        </div>
        <div class="game-thumb-name">${g.name}</div>
      </div>
    `;
  }).join('');
}

// ────────────────────────────────────────────────────
// TOURNAMENTS LIST
// ────────────────────────────────────────────────────
function renderTournamentsList(filter = state.activeTournamentFilter) {
  const container = document.getElementById('tournaments-list');
  if (!container) return;

  const headerTitle = document.querySelector('#page-tournaments .sub-header-title');
  if (headerTitle) {
    if (state.activeGameFilter && state.activeGameFilter !== 'all') {
      headerTitle.textContent = `${state.activeGameFilter} Tournaments`;
    } else {
      headerTitle.textContent = 'All Tournaments';
    }
  }

  let list = TOURNAMENTS;
  if (state.activeGameFilter && state.activeGameFilter !== 'all') {
    list = TOURNAMENTS.filter(t => t.game.toLowerCase() === state.activeGameFilter.toLowerCase());
  }

  const filtered = filter === 'all'
    ? list
    : list.filter(t => t.status === filter);

  if (!filtered.length) {
    container.innerHTML = `<div class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
      <p>No tournaments found</p>
    </div>`;
    return;
  }
  container.innerHTML = filtered.map(t => tournamentCardHTML(t)).join('');
}

window.filterTournaments = function(filter, btn) {
  state.activeTournamentFilter = filter;
  document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTournamentsList(filter);
};

function tournamentCardHTML(t) {
  const statusClass = t.status === 'live' ? 'live' : t.status === 'upcoming' ? 'upcoming' : 'completed';
  const statusLabel = t.status === 'live' ? '🔴 LIVE' : t.status === 'upcoming' ? 'UPCOMING' : 'COMPLETED';
  
  // Extract raw registered & slots
  const rawReg = t.registered !== undefined ? t.registered : (t.filled || 32);
  const rawSlots = t.slotsRaw || parseInt(t.slots) || 49;
  const pct = Math.min(100, Math.round((rawReg / rawSlots) * 100));
  
  const bgImg = t.image || 'assets/tournament_hero.jpg';
  
  // Custom progress bar color gradient
  const progressGradient = t.status === 'live' ? 'linear-gradient(90deg, #8b5cf6, #d946ef)' : 'linear-gradient(90deg, #3b82f6, #06b6d4)';
  
  // Countdown/Time info text
  let timeText = 'Ends in 01:25:30';
  if (t.status === 'upcoming') timeText = 'Starts in 04:15:00';
  if (t.status === 'completed') timeText = 'Ended';

  return `
    <div class="live-tournament-card" onclick="openTournamentDetail('${t.id}')">
      <div class="live-tournament-card-header" style="background-image:url('${bgImg}')">
        <div class="live-tournament-card-badges">
          <span class="lt-badge-live" style="background:${t.status === 'live' ? '#ef4444' : t.status === 'upcoming' ? '#3b82f6' : '#6b7280'}">
            ${t.status === 'live' ? '🔴 LIVE' : t.status === 'upcoming' ? 'UPCOMING' : 'COMPLETED'}
          </span>
          <span class="lt-badge-slots">👥 ${rawReg}/${rawSlots}</span>
        </div>
      </div>
      <div class="live-tournament-card-body">
        <div class="lt-card-title">${t.game}</div>
        <div class="lt-card-subtitle">${t.name}</div>
        
        <div class="lt-card-metrics">
          <div>
            <div class="lt-metric-label">Entry Fee</div>
            <div class="lt-metric-val">${t.fee || 'Free'}</div>
          </div>
          <div style="text-align:right;">
            <div class="lt-metric-label">Prize Pool</div>
            <div class="lt-metric-val" style="color:#a855f7">${t.prize}</div>
          </div>
        </div>
        
        <div class="lt-progress-bar-container">
          <div class="lt-progress-bar-fill" style="width:${pct}%; background:${progressGradient}"></div>
        </div>
        
        <div class="lt-card-timer">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
          <span>${timeText}</span>
        </div>
        
        <button class="lt-card-btn" style="background:${t.status === 'completed' ? 'var(--bg-elevated); color:var(--text-muted);' : ''}">${t.status === 'completed' ? 'Details' : 'Join Now'}</button>
      </div>
    </div>
  `;
}

window.openTournamentDetail = function(id) {
  const t = TOURNAMENTS.find(x => x.id === id);
  if (!t) return;
  state.selectedTournament = t;

  // Extract raw registered & slots
  const rawReg = t.registered !== undefined ? t.registered : 0;
  const rawSlots = t.slotsRaw || 100;

  // Populate detail screen
  document.getElementById('td-game').textContent  = t.game;
  document.getElementById('td-name').textContent  = t.name;
  document.getElementById('td-slots').textContent = `${rawReg} / ${rawSlots} Slots Joined`;
  
  // Clean currency symbols
  const totalPrize = t.prizeRaw || 0;
  document.getElementById('td-prize').textContent = `₹${totalPrize.toLocaleString('en-IN')}`;
  document.getElementById('td-fee').textContent   = t.feeRaw ? `₹${t.feeRaw}` : 'Free';
  
  document.getElementById('td-mode').textContent  = t.mode;
  document.getElementById('td-map').textContent   = t.map;
  document.getElementById('td-date').textContent  = t.date;

  // Rules and Description rendering
  const rulesDescContainer = document.getElementById('td-rules-desc');
  if (rulesDescContainer) {
    if (t.description) {
      const lines = t.description.split(/\n/);
      rulesDescContainer.innerHTML = lines.map(line => {
        if (!line.trim()) return '';
        return `<div class="td-rule">${line.trim()}</div>`;
      }).join('');
    } else {
      rulesDescContainer.innerHTML = `
        <div class="td-rule">No Hacker</div>
        <div class="td-rule">No Teaming</div>
        <div class="td-rule">Fair Play Only</div>
        <div class="td-rule">Must be in Room 5 minutes before start</div>
      `;
    }
  }

  // Prize Distribution rendering
  const prizeDistContainer = document.getElementById('td-prize-dist');
  if (prizeDistContainer) {
    if (t.prizeDistribution) {
      const lines = t.prizeDistribution.split(/\n|,/);
      prizeDistContainer.innerHTML = lines.map(line => {
        if (!line.trim()) return '';
        return `<div class="td-rule">${line.trim()}</div>`;
      }).join('');
    } else {
      prizeDistContainer.innerHTML = `
        <div class="td-rule">🥇 1st Place — ₹${Math.floor(totalPrize * 0.5).toLocaleString('en-IN')} (50%)</div>
        <div class="td-rule">🥈 2nd Place — ₹${Math.floor(totalPrize * 0.3).toLocaleString('en-IN')} (30%)</div>
        <div class="td-rule">🥉 3rd Place — ₹${Math.floor(totalPrize * 0.2).toLocaleString('en-IN')} (20%)</div>
      `;
    }
  }

  // Update hero image or background
  const heroImg = document.getElementById('td-hero-img');
  if (heroImg) {
    if (t.image) {
      heroImg.src = t.image;
      heroImg.style.opacity = '1';
    } else {
      heroImg.src = 'assets/bgmi_banner.jpg';
      heroImg.style.opacity = '0.6';
    }
  }

  // Status badge
  const badge = document.getElementById('td-status-badge');
  if (badge) {
    if (t.status === 'live') {
      badge.textContent = '🔴 LIVE';
      badge.style.background = 'var(--live)';
    } else if (t.status === 'upcoming') {
      badge.textContent = '⏰ UPCOMING';
      badge.style.background = 'var(--success)';
    } else {
      badge.textContent = '✅ COMPLETED';
      badge.style.background = 'var(--text-muted)';
    }
  }

  // Join button
  const joinBtn = document.getElementById('join-btn');
  if (joinBtn) {
    const isJoined = (t.joinedUsers || []).some(ju => ju.userId === state.user.id);
    if (isJoined) {
      joinBtn.textContent = 'Go to Match Room 🎮';
      joinBtn.disabled = false;
    } else if (t.status === 'completed') {
      joinBtn.textContent = 'Tournament Ended';
      joinBtn.disabled = true;
    } else if (rawReg >= rawSlots) {
      joinBtn.textContent = 'Tournament Full';
      joinBtn.disabled = true;
    } else {
      joinBtn.textContent = `Join Now ₹${t.feeRaw}`;
      joinBtn.disabled = false;
    }
  }

  // Winner Podium handling in Tournament Detail
  const tdWinContainer = document.getElementById('td-winners-podium-container');
  if (tdWinContainer) {
    if (t.winners && t.winners.first) {
      tdWinContainer.innerHTML = renderWinnersPodiumHTML(t.winners, t.game);
      tdWinContainer.style.display = 'block';
    } else {
      tdWinContainer.innerHTML = '';
      tdWinContainer.style.display = 'none';
    }
  }

  navigate('tournament-detail');
};

window.joinTournament = async function() {
  const t = state.selectedTournament;
  if (!t) return;

  const isJoined = (t.joinedUsers || []).some(ju => ju.userId === state.user.id);
  if (isJoined) {
    navigate('match-room');
    return;
  }

  const rawReg = t.registered !== undefined ? t.registered : (t.filled || 60);
  const rawSlots = t.slotsRaw || parseInt(t.slots) || 100;

  if (rawReg >= rawSlots) {
    showToast('Tournament is already full!', 'error');
    return;
  }

  if (state.user.walletBalance < t.feeRaw) {
    showToast('Insufficient balance! Add cash first.', 'error');
    setTimeout(() => navigate('wallet'), 1200);
    return;
  }

  document.getElementById('join-game-username').value = '';
  document.getElementById('modal-join-username').style.display = 'flex';
};

window.closeJoinUsernameModal = function() {
  document.getElementById('modal-join-username').style.display = 'none';
};

window.submitJoinTournament = async function() {
  const gameUsername = document.getElementById('join-game-username').value.trim();
  if (!gameUsername) {
    showToast('In-game Username is required!', 'error');
    return;
  }

  const t = state.selectedTournament;
  if (!t) return;

  closeJoinUsernameModal();

  try {
    const res = await fetch(`${SERVER}/api/tournaments/${t.id}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: state.user.id, gameUsername })
    });
    
    if (res.ok) {
      const data = await res.json();
      state.user = {
        ...state.user,
        walletBalance: data.user.balance !== undefined ? data.user.balance : state.user.walletBalance
      };
      localStorage.setItem('nexora_user', JSON.stringify(state.user));
      
      // Update locally
      t.registered = data.tournament.registered;
      t.filled = data.tournament.filled;
      t.joinedUsers = data.tournament.joinedUsers;
      state.selectedTournament = t;

      showToast(`Joined ${t.name}! 🎮`, 'success');
      openTournamentDetail(t.id);
      navigate('match-room');
    } else {
      const err = await res.json();
      showToast(err.error || 'Failed to join tournament.', 'error');
    }
  } catch(e) {
    showToast('Network error while joining.', 'error');
  }
};

// ────────────────────────────────────────────────────
// MATCH ROOM
// ────────────────────────────────────────────────────
function renderMatchRoom() {
  const t = state.selectedTournament;
  if (!t) return;

  const nameEl = document.getElementById('mr-t-name');
  if (nameEl) nameEl.textContent = t.name;

  const typeEl = document.getElementById('mr-t-type');
  if (typeEl) typeEl.textContent = t.mode;

  const rawReg = t.registered !== undefined ? t.registered : (t.filled || 60);
  const rawSlots = t.slotsRaw || parseInt(t.slots) || 100;

  const slotsEl = document.getElementById('mr-joined-players');
  if (slotsEl) slotsEl.textContent = `${rawReg} / ${rawSlots}`;

  const matchIdEl = document.getElementById('mr-t-match-id');
  if (matchIdEl) matchIdEl.textContent = `#NXA${t.id.slice(-6)}`;

  const winContainer = document.getElementById('mr-winners-podium-container');
  if (winContainer) {
    if (t.winners && t.winners.first) {
      winContainer.innerHTML = renderWinnersPodiumHTML(t.winners, t.game);
      winContainer.style.display = 'block';
      if (document.getElementById('mr-countdown-container')) document.getElementById('mr-countdown-container').style.display = 'none';
      if (document.getElementById('mr-room-details-box')) document.getElementById('mr-room-details-box').style.display = 'none';
      if (document.getElementById('mr-room-pending-box')) document.getElementById('mr-room-pending-box').style.display = 'none';
    } else {
      winContainer.innerHTML = '';
      winContainer.style.display = 'none';
    }
  }
}

function startCountdown() {
  if (state.countdownTimer) clearInterval(state.countdownTimer);
  
  const t = state.selectedTournament;
  if (!t || !t.dateRaw || !t.timeRaw) {
    state.countdownSeconds = 0;
    updateCountdownDisplay();
    return;
  }

  // dateRaw: e.g. "2026-07-16"
  // timeRaw: e.g. "14:30"
  let scheduledDate = new Date(`${t.dateRaw} ${t.timeRaw}`);
  if (isNaN(scheduledDate.getTime())) {
    scheduledDate = new Date(t.dateRaw.replace(/\//g, '-') + 'T' + t.timeRaw);
  }

  function tick() {
    const now = new Date();
    const diffMs = scheduledDate.getTime() - now.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    state.countdownSeconds = diffSec;
    updateCountdownDisplay();

    if (diffSec <= 0) {
      clearInterval(state.countdownTimer);
    }
  }

  tick();
  state.countdownTimer = setInterval(tick, 1000);
}

function updateCountdownDisplay() {
  const el = document.getElementById('countdown-display');
  if (!el) return;

  const t = state.selectedTournament;
  const pendingBox = document.getElementById('mr-room-pending-box');
  const detailsBox = document.getElementById('mr-room-details-box');
  const countdownContainer = document.getElementById('mr-countdown-container');

  if (state.countdownSeconds > 600) {
    if (pendingBox) pendingBox.style.display = 'block';
    if (detailsBox) detailsBox.style.display = 'none';
    if (countdownContainer) countdownContainer.style.display = 'none';
  } else {
    if (pendingBox) pendingBox.style.display = 'none';
    if (detailsBox) {
      detailsBox.style.display = 'block';
      const idEl = document.getElementById('mr-room-id-display');
      const passEl = document.getElementById('mr-room-pass-display');
      if (idEl) idEl.textContent = (t && t.roomId) ? t.roomId : 'PENDING';
      if (passEl) passEl.textContent = (t && t.roomPassword) ? t.roomPassword : 'PENDING';
    }
    if (countdownContainer) countdownContainer.style.display = 'block';
  }

  if (state.countdownSeconds <= 0) {
    el.textContent = "MATCH STARTED";
    el.style.fontSize = "1.5rem";
    el.style.color = "var(--success)";
    const labelEl = el.previousElementSibling;
    if (labelEl && labelEl.classList.contains('countdown-label')) {
      labelEl.textContent = "Status";
    }
  } else {
    el.style.fontSize = "";
    el.style.color = "";
    const labelEl = el.previousElementSibling;
    if (labelEl && labelEl.classList.contains('countdown-label')) {
      labelEl.textContent = "Room Starting In";
    }
    const m = String(Math.floor(state.countdownSeconds / 60)).padStart(2, '0');
    const s = String(state.countdownSeconds % 60).padStart(2, '0');
    el.textContent = `${m}:${s}`;
  }
}

function renderPlayers() {
  const list = document.getElementById('players-list');
  if (!list) return;

  const t = state.selectedTournament;
  const joined = (t && t.joinedUsers) ? t.joinedUsers : [];

  let html = joined.map(p => `
    <div class="player-row">
      <div class="player-avatar" style="background:var(--accent-bright); color:#fff; font-weight:800;">${(p.gameUsername || p.username || 'U')[0].toUpperCase()}</div>
      <div class="player-info">
        <div class="player-name">${p.gameUsername || p.username}</div>
        <div class="player-id">ID: #${p.userId.slice(-5)}</div>
      </div>
      <span class="player-status ready">Ready</span>
    </div>
  `).join('');

  if (joined.length < 5) {
    const fillers = PLAYERS.slice(0, 5 - joined.length);
    html += fillers.map(p => `
      <div class="player-row">
        <div class="player-avatar">${p.name[0]}</div>
        <div class="player-info">
          <div class="player-name">${p.name}</div>
          <div class="player-id">ID: ${p.id}</div>
        </div>
        <span class="player-status ${p.status}">${capitalize(p.status)}</span>
      </div>
    `).join('');
  }

  list.innerHTML = html;

  const countEl = document.getElementById('players-count');
  if (countEl) {
    const rawReg = t ? (t.registered !== undefined ? t.registered : (t.filled || 60)) : PLAYERS.length;
    const rawSlots = t ? (t.slotsRaw || parseInt(t.slots) || 100) : 100;
    countEl.textContent = `${rawReg}/${rawSlots}`;
  }
}

// ────────────────────────────────────────────────────
// WALLET
// ────────────────────────────────────────────────────
function renderWallet() {
  // Balance
  const balEl = document.getElementById('wallet-balance');
  if (balEl) balEl.textContent = formatCurrency(state.user.walletBalance);
  const availEl = document.getElementById('avail-balance');
  if (availEl) availEl.textContent = formatCurrency(state.user.walletBalance);

  // KYC Withdraw Lock logic
  const kycLock = document.getElementById('kyc-lock-container');
  const withdrawBody = document.getElementById('withdraw-panel-body');
  const kycStatus = state.user.kycStatus || 'unverified';
  
  if (kycLock && withdrawBody) {
    if (kycStatus === 'approved') {
      kycLock.style.display = 'none';
      withdrawBody.style.display = 'block';
    } else {
      kycLock.style.display = 'block';
      withdrawBody.style.display = 'none';
      
      const lockTitle = kycLock.querySelector('h3');
      const lockDesc = kycLock.querySelector('p');
      const lockBtn = kycLock.querySelector('button');
      
      if (kycStatus === 'pending') {
        if (lockTitle) lockTitle.textContent = 'KYC Verification Pending';
        if (lockDesc) lockDesc.textContent = 'Your KYC verification request is under review. Withdrawals will be enabled once approved.';
        if (lockBtn) {
          lockBtn.textContent = 'Under Review';
          lockBtn.disabled = true;
          lockBtn.style.opacity = '0.5';
          lockBtn.style.cursor = 'not-allowed';
        }
      } else if (kycStatus === 'rejected') {
        if (lockTitle) lockTitle.textContent = 'KYC Verification Rejected';
        const reason = state.user.kycDetails?.note || 'Please re-verify your documents.';
        if (lockDesc) lockDesc.textContent = `Reason: ${reason}. Complete verification to enable withdrawals.`;
        if (lockBtn) {
          lockBtn.textContent = 'Re-Submit KYC';
          lockBtn.disabled = false;
          lockBtn.style.opacity = '1';
          lockBtn.style.cursor = 'pointer';
          lockBtn.onclick = () => navigate('kyc-landing');
        }
      } else {
        if (lockTitle) lockTitle.textContent = 'KYC Verification Required';
        if (lockDesc) lockDesc.textContent = 'You need to complete KYC verification to withdraw your winnings.';
        if (lockBtn) {
          lockBtn.textContent = 'Complete KYC';
          lockBtn.disabled = false;
          lockBtn.style.opacity = '1';
          lockBtn.style.cursor = 'pointer';
          lockBtn.onclick = () => navigate('kyc-landing');
        }
      }
    }
  }

  // Update min withdrawal hint dynamically
  const minWdHint = document.querySelector('#wpanel-withdraw div[style*="margin-bottom:20px"]');
  if (minWdHint) {
    minWdHint.textContent = `Minimum withdraw amount is ₹${APP_SETTINGS.minWithdrawal}`;
  }

  // Transactions
  renderTransactions();
}

function renderTransactions() {
  const list = document.getElementById('tx-list');
  if (!list) return;
  list.innerHTML = `
    <div class="tx-header">
      Recent Transactions
      <span style="color:var(--accent-bright);font-size:0.8rem;cursor:pointer">View All</span>
    </div>
    ${TRANSACTIONS.map(tx => `
      <div class="tx-row" style="display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid var(--border-light)">
        <div style="display:flex; gap:12px; align-items:center">
          <div class="tx-icon ${tx.type}">${tx.icon}</div>
          <div class="tx-info">
            <div class="tx-desc">${tx.desc}</div>
            <div style="font-size:0.7rem; color:var(--text-muted); margin-top:2px">${tx.id || 'TXN1002450'}</div>
            <div class="tx-sub">${tx.sub}</div>
          </div>
        </div>
        <div style="text-align:right; display:flex; flex-direction:column; align-items:flex-end; gap:6px">
          <div class="tx-amount ${tx.type}">${tx.amount}</div>
          <button onclick="downloadInvoicePDF('${tx.id || 'TXN1002450'}')" style="background:none; border:none; color:var(--text-muted); cursor:pointer; padding:4px; display:flex; align-items:center; justify-content:center" title="Download Invoice">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
        </div>
      </div>
    `).join('')}
  `;
}

window.switchWalletTab = function(tab) {
  state.activeWalletTab = tab;
  ['add', 'withdraw', 'tx'].forEach(t => {
    document.getElementById(`wtab-${t}`)?.classList.toggle('active', t === tab);
    document.getElementById(`wpanel-${t}`)?.classList.toggle('active', t === tab);
  });
};

window.setQuickAmt = function(amount, el) {
  document.querySelectorAll('.quick-amt').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
  const input = document.getElementById('add-cash-amount');
  if (input) input.value = amount;
};

window.selectPM = function(el) {
  document.querySelectorAll('.pm-option').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
};

async function saveTransaction(type, desc, amountStr, amountVal, method) {
  const txData = {
    user: state.user.name,
    type: type,
    amount: amountVal,
    method: method,
    status: 'success'
  };
  try {
    const res = await fetch(`${API}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(txData)
    });
    if (res.ok) return;
  } catch(e) {
    console.error('Failed to sync transaction with server:', e);
  }
  
  // Local fallback
  TRANSACTIONS.unshift({
    type: type === 'added' || type === 'credit' || type === 'refund' ? 'credit' : 'debit',
    desc: desc,
    sub: `${method} · Just now`,
    amount: amountStr,
    icon: type === 'added' ? '💳' : type === 'withdrawal' ? '💸' : '🎮'
  });
}

let withdrawMethod = 'upi';

window.switchWithdrawMethod = function(method) {
  withdrawMethod = method;
  const upiBtn = document.getElementById('withdraw-method-upi');
  const bankBtn = document.getElementById('withdraw-method-bank');
  const upiGroup = document.getElementById('group-withdraw-upi');
  const bankGroup = document.getElementById('group-withdraw-bank');
  
  if (method === 'upi') {
    upiBtn.style.background = 'var(--accent)';
    upiBtn.style.color = '#fff';
    bankBtn.style.background = 'var(--bg-card)';
    bankBtn.style.color = 'var(--text-secondary)';
    upiGroup.style.display = 'block';
    bankGroup.style.display = 'none';
  } else {
    bankBtn.style.background = 'var(--accent)';
    bankBtn.style.color = '#fff';
    upiBtn.style.background = 'var(--bg-card)';
    upiBtn.style.color = 'var(--text-secondary)';
    upiGroup.style.display = 'none';
    bankGroup.style.display = 'block';
  }
};

window.addCash = async function() {
  const input = document.getElementById('add-cash-amount');
  const amount = parseInt(input?.value);
  if (!amount || amount < 10) {
    showToast('Please enter a valid amount (min ₹10)', 'error');
    return;
  }

  // Razorpay Integration
  if (typeof Razorpay === 'undefined') {
    showToast('Razorpay offline. Simulating payment...', 'info');
    setTimeout(async () => {
      state.user.walletBalance += amount;
      const selectedPM = document.querySelector('.pm-option.selected .pm-name')?.textContent || 'Razorpay';
      await saveTransaction('added', 'Added Cash (Simulated)', `+₹${formatCurrency(amount)}`, amount, `${selectedPM} (Mock)`);
      updateWalletBadge();
      renderWallet();
      input.value = '';
      showToast(`₹${formatCurrency(amount)} added successfully! 💰`, 'success');
    }, 1200);
    return;
  }

  const options = {
    "key": "rzp_test_TBI7ce1eo4eSm0",
    "amount": amount * 100, // paisa
    "currency": "INR",
    "name": "NEXORA ARENA",
    "description": "Add Cash to Wallet",
    "image": "assets/nexora_logo.jpg",
    "handler": async function (response) {
      state.user.walletBalance += amount;
      const selectedPM = document.querySelector('.pm-option.selected .pm-name')?.textContent || 'Razorpay';
      await saveTransaction('added', 'Added Cash', `+₹${formatCurrency(amount)}`, amount, `Razorpay (${response.razorpay_payment_id})`);
      updateWalletBadge();
      renderWallet();
      input.value = '';
      document.querySelectorAll('.quick-amt').forEach(b => b.classList.remove('selected'));
      showToast(`₹${formatCurrency(amount)} added successfully! 💳💰`, 'success');
    },
    "prefill": {
      "name": state.user.name,
      "email": state.user.name.toLowerCase().replace(/\s+/g, '') + "@gmail.com",
      "contact": "9999999999"
    },
    "theme": {
      "color": "#7c3aed"
    }
  };

  try {
    const rzp = new Razorpay(options);
    rzp.open();
  } catch(e) {
    showToast('Razorpay Checkout failed to open.', 'error');
  }
};

window.withdrawCash = async function() {
  const amtInput = document.getElementById('withdraw-amount');
  const amount = parseInt(amtInput?.value);

  if (!amount || amount < APP_SETTINGS.minWithdrawal) {
    showToast(`Minimum withdrawal is ₹${APP_SETTINGS.minWithdrawal}`, 'error');
    return;
  }
  if (amount > state.user.walletBalance) {
    showToast('Insufficient balance!', 'error');
    return;
  }

  let methodLabel = '';
  let transferDetails = {};

  if (withdrawMethod === 'upi') {
    const upiInput = document.getElementById('withdraw-upi');
    const upi = upiInput?.value?.trim();
    if (!upi) {
      showToast('Please enter your UPI ID', 'error');
      return;
    }
    methodLabel = `UPI (${upi})`;
    transferDetails = { type: 'upi', upi: upi };
  } else {
    const bank = document.getElementById('withdraw-bank-name')?.value?.trim();
    const acc = document.getElementById('withdraw-bank-acc')?.value?.trim();
    const ifsc = document.getElementById('withdraw-bank-ifsc')?.value?.trim();
    const holder = document.getElementById('withdraw-bank-holder')?.value?.trim();

    if (!bank || !acc || !ifsc || !holder) {
      showToast('Please fill all Bank Account details', 'error');
      return;
    }
    methodLabel = `Bank (${bank} - ${acc.slice(-4)})`;
    transferDetails = { 
      type: 'bank', 
      bankName: bank, 
      accountNumber: acc, 
      ifsc: ifsc, 
      accountHolder: holder 
    };
  }

  const withdrawalRequest = {
    userId: state.user.id,
    user: state.user.name,
    amount: amount,
    status: 'pending',
    date: new Date().toLocaleDateString('en-IN'),
    method: withdrawMethod,
    details: transferDetails
  };

  try {
    const res = await fetch(`${SERVER}/api/withdrawals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(withdrawalRequest)
    });
    if (res.ok) {
      state.user.walletBalance -= amount;
      await saveTransaction('withdrawal', 'Withdraw Request', `-₹${formatCurrency(amount)}`, -amount, methodLabel);
      
      document.getElementById('wp-amount-text').textContent = `₹${amount.toLocaleString('en-IN')}.00`;
      document.getElementById('wp-amount-badge').textContent = `₹${amount.toLocaleString('en-IN')}.00`;
      
      navigate('withdraw-processing');
      updateWalletBadge();
      renderWallet();
    } else {
      const err = await res.json();
      showToast(err.error || 'Failed to submit withdrawal request', 'error');
    }
  } catch(e) {
    console.error('Failed to submit withdrawal to server:', e);
    showToast('Network error, please try again.', 'error');
  }

  amtInput.value = '';
  if (document.getElementById('withdraw-upi')) document.getElementById('withdraw-upi').value = '';
  if (document.getElementById('withdraw-bank-name')) document.getElementById('withdraw-bank-name').value = '';
  if (document.getElementById('withdraw-bank-acc')) document.getElementById('withdraw-bank-acc').value = '';
  if (document.getElementById('withdraw-bank-ifsc')) document.getElementById('withdraw-bank-ifsc').value = '';
  if (document.getElementById('withdraw-bank-holder')) document.getElementById('withdraw-bank-holder').value = '';
};

// ────────────────────────────────────────────────────
// PROFILE
// ────────────────────────────────────────────────────
function renderProfile() {
  const nameEl = document.getElementById('profile-name');
  if (nameEl) nameEl.textContent = state.user.name;
}

// ────────────────────────────────────────────────────
// REFERRAL
// ────────────────────────────────────────────────────
window.copyReferralCode = function() {
  navigator.clipboard?.writeText('NEXORA123').catch(() => {});
  showToast('Referral code copied! 📋', 'success');
};

window.shareReferral = function() {
  if (navigator.share) {
    navigator.share({
      title: 'NEXORA ARENA',
      text: 'Join me on NEXORA ARENA! Use my referral code NEXORA123 and get ₹20 bonus cash!',
      url: window.location.href,
    });
  } else {
    copyReferralCode();
  }
};

// ────────────────────────────────────────────────────
// SUPPORT
// ────────────────────────────────────────────────────
const HELP_ITEMS = [
  'How to Join Tournament',
  'How to Add Cash',
  'How to Withdraw',
  'Rules & Guidelines',
  'Report an Issue',
  'Fair Play Policy',
  'Prize Distribution',
];

window.searchHelp = function(query) {
  const list = document.getElementById('quick-help-list');
  if (!list) return;
  const filtered = query
    ? HELP_ITEMS.filter(h => h.toLowerCase().includes(query.toLowerCase()))
    : HELP_ITEMS;

  list.innerHTML = filtered.length
    ? filtered.map(h => `
        <div class="qh-item">
          ${h}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9,18 15,12 9,6"/></svg>
        </div>
      `).join('')
    : `<div class="empty-state" style="padding:20px"><p>No results found for "${query}"</p></div>`;
};

// ────────────────────────────────────────────────────
// TOAST NOTIFICATIONS
// ────────────────────────────────────────────────────
let toastTimer = null;
window.showToast = function(message, type = '') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = 'toast';
  if (type) toast.classList.add(type);
  void toast.offsetWidth; // force reflow
  toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
};

// ────────────────────────────────────────────────────
// STATIC RENDERING (runs once)
// ────────────────────────────────────────────────────
function renderAllStatic() {
  // Pre-populate games grid on page load
  // (actual rendering is lazy / on page enter)
}

// ────────────────────────────────────────────────────
// UTILITIES
// ────────────────────────────────────────────────────
function formatCurrency(n) {
  if (n >= 100000) return (n / 100000).toFixed(0) + ',00,000';
  return n.toLocaleString('en-IN');
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ────────────────────────────────────────────────────
// KEYBOARD SHORTCUTS (dev convenience)
// ────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') goBack();
});

window.downloadInvoicePDF = function(txId) {
  const tx = TRANSACTIONS.find(x => x.id === txId) || {
    id: txId,
    desc: 'Transaction Details',
    sub: 'Wallet · Just now',
    amount: '₹0',
    amountVal: 0,
    method: 'Wallet',
    type: 'credit'
  };

  const rawAmt = Math.abs(tx.amountVal || parseInt(tx.amount.replace(/[^0-9-]/g, '')) || 0);

  const invNo = `INV/NXA/2024/${tx.id?.slice(-6) || '000245'}`;
  const invDate = tx.sub.split('·')[1]?.trim() || new Date().toLocaleDateString('en-IN');
  const payDate = tx.sub.split('·')[1]?.trim() || new Date().toLocaleString('en-IN');
  const payMethod = tx.sub.split('·')[0]?.trim() || tx.method || 'Wallet';

  const userAddr = state.user.address || 'Sangamner, Ahmednagar, Maharashtra - 422605';
  
  const totalAmt = rawAmt;
  const platformFee = tx.desc.includes('Tournament') ? Math.round(totalAmt * 0.15) : 0;
  const gst = tx.desc.includes('Tournament') ? Math.round(platformFee * 0.18) : 0;

  const amtInWords = numberToEnglish(totalAmt) + " Rupees Only";

  const invoiceHtml = `
    <div style="font-family:'Inter', sans-serif; padding:40px; color:#111827; background:#ffffff; max-width:800px; margin:0 auto; border:1px solid #e5e7eb; border-radius:12px; position:relative; box-sizing:border-box;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:40px;">
        <div>
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:48px; height:48px; background:#7c3aed; border-radius:12px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:1.8rem; font-weight:800; box-shadow:0 4px 12px rgba(124,58,237,0.3);">N</div>
            <div>
              <span style="font-size:1.6rem; font-weight:900; letter-spacing:1px; color:#111827;">NEXORA</span>
              <span style="font-size:1rem; font-weight:700; color:#7c3aed; display:block; margin-top:-2px; letter-spacing:3px;">ARENA</span>
            </div>
          </div>
          <div style="font-size:0.75rem; font-weight:700; color:#7c3aed; text-transform:uppercase; letter-spacing:1.5px; margin-top:8px;">Play. Compete. Conquer.</div>
        </div>
        <div style="text-align:right;">
          <h1 style="font-size:2rem; font-weight:900; color:#111827; margin:0; text-transform:uppercase; letter-spacing:1px;">Tax Invoice</h1>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-bottom:30px; border-bottom:2px solid #f3f4f6; padding-bottom:30px;">
        <div>
          <div style="font-size:0.8rem; color:#6b7280; font-weight:600; text-transform:uppercase; margin-bottom:4px;">Invoice No.</div>
          <div style="font-size:0.95rem; font-weight:700; color:#111827;">${invNo}</div>
          
          <div style="font-size:0.8rem; color:#6b7280; font-weight:600; text-transform:uppercase; margin-top:16px; margin-bottom:4px;">Order ID</div>
          <div style="font-size:0.95rem; font-weight:700; color:#111827; font-family:monospace;">${tx.id || 'TXN1002450'}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:0.8rem; color:#6b7280; font-weight:600; text-transform:uppercase; margin-bottom:4px;">Invoice Date</div>
          <div style="font-size:0.95rem; font-weight:700; color:#111827;">${invDate}</div>
          
          <div style="font-size:0.8rem; color:#6b7280; font-weight:600; text-transform:uppercase; margin-top:16px; margin-bottom:4px;">Payment Date</div>
          <div style="font-size:0.95rem; font-weight:700; color:#111827;">${payDate}</div>
        </div>
      </div>

      <div style="background:#f9fafb; border:1px solid #f3f4f6; border-radius:8px; padding:20px; margin-bottom:30px;">
        <div style="font-size:0.85rem; font-weight:800; color:#fff; background:#7c3aed; display:inline-block; padding:4px 12px; border-radius:4px; text-transform:uppercase; letter-spacing:1px; margin-bottom:12px;">Bill To</div>
        <div style="display:grid; grid-template-columns:100px 1fr; gap:8px; font-size:0.9rem;">
          <span style="color:#6b7280; font-weight:600;">Name:</span>
          <span style="color:#111827; font-weight:700;">${state.user.name}</span>
          
          <span style="color:#6b7280; font-weight:600;">Email:</span>
          <span style="color:#111827;">${state.user.name.toLowerCase().replace(/\s+/g, '') + "@gmail.com"}</span>
          
          <span style="color:#6b7280; font-weight:600;">Phone:</span>
          <span style="color:#111827;">+91 98765 43210</span>
          
          <span style="color:#6b7280; font-weight:600;">Address:</span>
          <span style="color:#111827; line-height:1.4;">${userAddr}</span>
        </div>
      </div>

      <div style="margin-bottom:35px;">
        <div style="font-size:0.85rem; font-weight:800; color:#fff; background:#111827; display:inline-block; padding:4px 12px; border-radius:4px; text-transform:uppercase; letter-spacing:1px; margin-bottom:12px;">Invoice Details</div>
        <table style="width:100%; border-collapse:collapse; text-align:left; font-size:0.9rem;">
          <thead>
            <tr style="border-bottom:2px solid #e5e7eb; color:#374151;">
              <th style="padding:10px 0; font-weight:700; width:60%;">Description</th>
              <th style="padding:10px 0; font-weight:700; width:20%;">Method</th>
              <th style="padding:10px 0; font-weight:700; text-align:right; width:20%;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom:1px solid #f3f4f6;">
              <td style="padding:14px 0;">
                <div style="font-weight:700; color:#111827;">${tx.desc}</div>
                <div style="font-size:0.75rem; color:#6b7280; margin-top:2px;">Transaction ID: ${tx.id || 'TXN1002450'}</div>
              </td>
              <td style="padding:14px 0; color:#374151;">${payMethod}</td>
              <td style="padding:14px 0; text-align:right; font-weight:700; color:#111827;">₹${totalAmt.toLocaleString('en-IN')}.00</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:40px; margin-bottom:40px;">
        <div>
          <div style="background:#f9fafb; border:1px solid #f3f4f6; border-radius:8px; padding:16px;">
            <div style="font-size:0.78rem; font-weight:700; color:#7c3aed; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Amount In Words</div>
            <div style="font-size:0.9rem; font-weight:700; color:#111827; line-height:1.3;">${amtInWords}</div>
          </div>
        </div>
        <div>
          <table style="width:100%; font-size:0.9rem; border-collapse:collapse;">
            <tr>
              <td style="padding:6px 0; color:#4b5563;">Subtotal</td>
              <td style="padding:6px 0; text-align:right; font-weight:600; color:#111827;">₹${totalAmt.toLocaleString('en-IN')}.00</td>
            </tr>
            <tr>
              <td style="padding:6px 0; color:#4b5563;">Platform Fee (15%)</td>
              <td style="padding:6px 0; text-align:right; font-weight:600; color:#111827;">₹0.00</td>
            </tr>
            <tr>
              <td style="padding:6px 0; color:#4b5563;">GST (18%)</td>
              <td style="padding:6px 0; text-align:right; font-weight:600; color:#111827;">₹0.00</td>
            </tr>
            <tr style="border-top:2px solid #e5e7eb;">
              <td style="padding:12px 0; font-weight:800; color:#111827; font-size:1.05rem;">Total Amount</td>
              <td style="padding:12px 0; text-align:right; font-weight:900; color:#7c3aed; font-size:1.15rem;">₹${totalAmt.toLocaleString('en-IN')}.00</td>
            </tr>
          </table>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:40px; border-top:2px solid #f3f4f6; padding-top:30px;">
        <div style="font-size:0.75rem; color:#6b7280; line-height:1.5;">
          <b style="color:#374151; display:block; margin-bottom:4px; font-size:0.8rem;">COMPANY DETAILS:</b>
          NEXORA ARENA Esports Pvt. Ltd.<br>
          GSTIN: 27AABCN1234C1Z5<br>
          Sangamner, Ahmednagar, Maharashtra - 422605<br>
          Support Email: support@nexoraarena.com | Phone: +91 12345 67890
        </div>
        <div style="text-align:right; display:flex; flex-direction:column; align-items:flex-end;">
          <div style="font-size:0.75rem; font-weight:700; color:#374151; text-transform:uppercase; margin-bottom:8px;">Authorized Signature</div>
          <div style="width:130px; height:60px; border-bottom:1px solid #d1d5db; position:relative; display:flex; align-items:center; justify-content:center;">
            <span style="font-style:italic; font-family:cursive; font-size:1.3rem; color:#7c3aed;">Nexora Esports</span>
            <div style="position:absolute; right:-20px; top:-5px; border:2px dashed rgba(124,58,237,0.4); border-radius:50%; width:50px; height:50px; display:flex; align-items:center; justify-content:center; color:rgba(124,58,237,0.4); font-size:0.5rem; font-weight:900; transform:rotate(-15deg); pointer-events:none;">
              NEXORA
            </div>
          </div>
        </div>
      </div>

      <div style="background:#7c3aed; color:#fff; text-align:center; padding:12px; border-radius:0 0 12px 12px; margin-top:40px; margin-left:-40px; margin-right:-40px; margin-bottom:-40px; font-size:0.8rem; font-weight:700; letter-spacing:0.5px;">
        Thank you for being a part of Nexora Arena! Support: support@nexoraarena.com
      </div>
    </div>
  `;

  const tempContainer = document.createElement('div');
  tempContainer.innerHTML = invoiceHtml;
  document.body.appendChild(tempContainer);

  const opt = {
    margin:       10,
    filename:     `Invoice_${txId}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  const isCapacitor = window.Capacitor && window.Capacitor.Plugins;
  
  if (isCapacitor) {
    showToast('Generating invoice PDF...', 'info');
    html2pdf().from(tempContainer).set(opt).output('datauristring').then(async (dataUri) => {
      document.body.removeChild(tempContainer);
      const { Filesystem, Share } = window.Capacitor.Plugins;
      if (Filesystem && Share) {
        try {
          const base64Data = dataUri.split(',')[1];
          const fileName = `Invoice_${txId}.pdf`;
          const writeResult = await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: 'CACHE'
          });
          await Share.share({
            title: 'Nexora Invoice',
            text: `Invoice for Transaction ${txId}`,
            url: writeResult.uri,
            dialogTitle: 'Save / Share Invoice'
          });
          showToast('Invoice generated successfully! 📄✅', 'success');
        } catch (err) {
          console.error('Capacitor PDF Error:', err);
          showToast('Failed to save invoice', 'error');
        }
      } else {
        showToast('Capacitor plugins not available', 'error');
      }
    }).catch(err => {
      console.error(err);
      document.body.removeChild(tempContainer);
      showToast('Error generating PDF', 'error');
    });
  } else {
    showToast('Generating invoice PDF...', 'info');
    html2pdf().from(tempContainer).set(opt).save().then(() => {
      document.body.removeChild(tempContainer);
      showToast('Invoice PDF downloaded! 📄✅', 'success');
    }).catch(err => {
      console.error('PDF generation error:', err);
      document.body.removeChild(tempContainer);
      showToast('Failed to download invoice PDF.', 'error');
    });
  }
};

function numberToEnglish(n) {
  const string = n.toString();
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const scales = ['', 'Thousand', 'Million', 'Billion'];

  let num = parseInt(string);
  if (num === 0) return 'Zero';

  function chunks(num) {
    const list = [];
    while (num > 0) {
      list.push(num % 1000);
      num = Math.floor(num / 1000);
    }
    return list;
  }

  function formatThree(val) {
    let s = '';
    const h = Math.floor(val / 100);
    const rem = val % 100;
    if (h > 0) {
      s += units[h] + ' Hundred ';
    }
    if (rem > 0) {
      if (rem < 20) {
        s += units[rem];
      } else {
        const t = Math.floor(rem / 10);
        const u = rem % 10;
        s += tens[t] + (u > 0 ? '-' + units[u] : '');
      }
    }
    return s.trim();
  }

  const chunkList = chunks(num);
  let words = '';
  for (let i = 0; i < chunkList.length; i++) {
    const val = chunkList[i];
    if (val > 0) {
      words = formatThree(val) + (scales[i] ? ' ' + scales[i] : '') + ' ' + words;
    }
  }
  return words.trim();
}

// ── Theme, Language & Notifications Handlers ──

window.applyLanguage = function(lang) {
  state.language = lang || 'en';
  const d = LANG_DICT[state.language];
  if (!d) return;
  
  // 1. Bottom Nav
  const navHome = document.getElementById('nav-home');
  if (navHome) {
    const span = navHome.querySelector('span');
    if (span) span.textContent = d.home;
  }
  const navTournaments = document.getElementById('nav-tournaments');
  if (navTournaments) {
    const span = navTournaments.querySelector('span');
    if (span) span.textContent = d.tournaments;
  }
  const navProfile = document.getElementById('nav-profile');
  if (navProfile) {
    const span = navProfile.querySelector('span');
    if (span) span.textContent = d.profile;
  }
  const navWallet = document.getElementById('nav-wallet');
  if (navWallet) {
    const span = navWallet.querySelector('span');
    if (span) span.textContent = d.wallet;
  }

  // 2. Settings screen translation
  const settTitle = document.getElementById('sett-title');
  if (settTitle) settTitle.textContent = d.settings;
  const appearance = document.getElementById('sett-sec-appearance');
  if (appearance) appearance.textContent = d.appearance;
  const dmLabel = document.getElementById('sett-darkmode-label');
  if (dmLabel) dmLabel.textContent = d.darkMode;
  const dmSub = document.getElementById('sett-darkmode-sub');
  if (dmSub) dmSub.textContent = d.enableDark;
  const pref = document.getElementById('sett-sec-preferences');
  if (pref) pref.textContent = d.preferences;
  const langLabel = document.getElementById('sett-lang-label');
  if (langLabel) langLabel.textContent = d.appLang;
  const langSub = document.getElementById('sett-lang-sub');
  if (langSub) langSub.textContent = d.selectLang;

  // 3. Profile Screen Options
  document.querySelectorAll('.profile-menu .menu-item').forEach(el => {
    const labelEl = el.querySelector('.menu-label');
    if (labelEl) {
      const text = labelEl.textContent.trim();
      if (text === 'My Tournaments' || text === 'मेरे टूर्नामेंट') {
        labelEl.textContent = d.myTournaments;
      } else if (text === 'Match History' || text === 'मैच इतिहास') {
        labelEl.textContent = d.matchHistory;
      } else if (text === 'Wallet' || text === 'वॉलेट') {
        labelEl.textContent = d.wallet;
      } else if (text === 'Refer & Earn' || text === 'रेफर और कमाएं') {
        labelEl.textContent = d.referEarn;
      } else if (text === 'Support' || text === 'सहायता') {
        labelEl.textContent = d.support;
      } else if (text === 'Commission Info' || text === 'कमीशन जानकारी') {
        labelEl.textContent = d.commissionInfo;
      } else if (text === 'Settings' || text === 'सेटिंग्स') {
        labelEl.textContent = d.settings;
      } else if (text === 'Logout' || text === 'लॉगआउट') {
        labelEl.textContent = d.logout;
      }
    }
  });

  // Home Page Headers
  const popularGamesTitle = document.querySelector('#page-home .section-title');
  if (popularGamesTitle) popularGamesTitle.textContent = d.popularGames;
  const viewAllLink = document.querySelector('#page-home .section-link');
  if (viewAllLink) viewAllLink.textContent = d.viewAll;

  // Update selectors values
  const selectEl = document.getElementById('sett-lang-select');
  if (selectEl) selectEl.value = state.language;
};

window.changeLanguage = async function(lang) {
  applyLanguage(lang);
  localStorage.setItem('nexora_lang', lang);
  
  if (state.loggedIn && state.user.id) {
    try {
      await fetch(`${SERVER}/api/users/${state.user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang })
      });
    } catch(e) {
      console.error('Failed to sync language to DB:', e);
    }
  }
};

window.toggleDarkMode = async function(isDark) {
  if (isDark) {
    document.body.classList.remove('light-mode');
  } else {
    document.body.classList.add('light-mode');
  }
  
  state.darkMode = isDark;
  localStorage.setItem('nexora_theme', isDark ? 'dark' : 'light');
  
  const toggleEl = document.getElementById('sett-darkmode-toggle');
  if (toggleEl) toggleEl.checked = isDark;
  
  if (state.loggedIn && state.user.id) {
    try {
      await fetch(`${SERVER}/api/users/${state.user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: isDark ? 'dark' : 'light' })
      });
    } catch(e) {
      console.error('Failed to sync theme to DB:', e);
    }
  }
};

window.renderNotifications = function() {
  const container = document.getElementById('user-notifications-list');
  if (!container) return;

  const notifs = state.notifications || [];
  
  const unreadCount = notifs.filter(n => !n.read).length;
  const badge = document.getElementById('notif-badge');
  if (badge) {
    badge.style.display = unreadCount > 0 ? 'block' : 'none';
  }

  if (notifs.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <p>No notifications yet</p>
      </div>
    `;
    return;
  }

  container.innerHTML = notifs.map(n => `
    <div style="background:${n.read ? 'var(--bg-card)' : 'rgba(124,58,237,0.06)'}; border:1px solid ${n.read ? 'var(--border-light)' : 'var(--accent)'}; border-radius:var(--radius-md); padding:16px; margin-bottom:12px; position:relative; cursor:pointer;" onclick="openNotification('${n.id}', '${n.screen || 'home'}')">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
        <span style="font-weight:700; color:${n.read ? '#fff' : 'var(--accent-bright)'}; font-size:0.95rem;">${n.title}</span>
        <button onclick="event.stopPropagation(); deleteNotification('${n.id}')" style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:0.95rem;">✕</button>
      </div>
      <div style="font-size:0.85rem; color:var(--text-secondary); line-height:1.4; margin-bottom:8px;">${n.body}</div>
      <div style="font-size:0.7rem; color:var(--text-muted);">${n.date}</div>
    </div>
  `).join('');
};

window.openNotification = async function(id, screen) {
  const notif = state.notifications.find(n => n.id === id);
  if (notif && !notif.read) {
    notif.read = true;
    try {
      await fetch(`${SERVER}/api/notifications/read`, { method: 'PUT' });
    } catch(e) {
      console.error(e);
    }
    renderNotifications();
  }
  navigate(screen || 'home');
};

window.deleteNotification = async function(id) {
  state.notifications = state.notifications.filter(n => n.id !== id);
  try {
    await fetch(`${SERVER}/api/notifications/${id}`, { method: 'DELETE' });
  } catch(e) {
    console.error(e);
  }
  renderNotifications();
};

window.deleteAllNotifications = async function() {
  state.notifications = [];
  try {
    await fetch(`${SERVER}/api/notifications`, { method: 'DELETE' });
  } catch(e) {
    console.error(e);
  }
  renderNotifications();
};

// ── Support Settings & Tickets system ─────────────────
let selectedTicketFiles = [];
let selectedChatReplyFiles = [];

window.loadSupportInfo = async function() {
  try {
    const res = await fetch(`${SERVER}/api/support-settings`);
    if (res.ok) {
      const settings = await res.json();
      updateSupportInfoDOM(settings);
    }
  } catch(e) {
    console.error(e);
  }
};

window.updateSupportInfoDOM = function(settings) {
  const emailEl = document.getElementById('u-supp-email');
  if (emailEl) emailEl.textContent = settings.email;
  const phoneEl = document.getElementById('u-supp-phone');
  if (phoneEl) phoneEl.textContent = settings.phone;
  const webEl = document.getElementById('u-supp-website');
  if (webEl) webEl.textContent = settings.website;
  const hoursEl = document.getElementById('u-supp-hours');
  if (hoursEl) hoursEl.textContent = settings.workingHours;
};

window.loadUserTickets = async function() {
  try {
    const res = await fetch(`${SERVER}/api/tickets`);
    if (res.ok) {
      const tickets = await res.json();
      const userTickets = tickets.filter(t => t.userId === state.user.id);
      renderUserTicketsList(userTickets);
    }
  } catch(e) {
    console.error(e);
  }
};

window.renderUserTicketsList = function(tickets) {
  const container = document.getElementById('user-tickets-list');
  if (!container) return;

  const countEl = document.getElementById('u-tickets-count');
  if (countEl) countEl.textContent = `${tickets.length} tickets`;

  if (tickets.length === 0) {
    container.innerHTML = `
      <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:var(--radius-lg); padding:24px 16px; text-align:center;">
        <span style="font-size:1.6rem; display:block; margin-bottom:8px;">🎫</span>
        <span style="font-size:0.8rem; color:var(--text-muted);">No support tickets raised yet.</span>
      </div>
    `;
    return;
  }

  container.innerHTML = tickets.map(t => {
    let statusColor = 'var(--text-muted)';
    if (t.status === 'open') statusColor = 'var(--success)';
    if (t.status === 'in-progress') statusColor = 'var(--warning)';
    if (t.status === 'awaiting') statusColor = '#a855f7';
    if (t.status === 'resolved') statusColor = 'var(--accent-bright)';

    return `
      <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:var(--radius-lg); padding:16px; cursor:pointer;" onclick="openUserTicket('${t.id}')">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-family:monospace; font-weight:700; color:var(--accent-bright); font-size:0.9rem;">${t.id}</span>
          <span style="font-size:0.72rem; font-weight:800; color:${statusColor}; text-transform:uppercase;">● ${t.status}</span>
        </div>
        <div style="font-size:0.88rem; font-weight:700; color:#fff; margin-bottom:4px;">${t.subject}</div>
        <div style="font-size:0.75rem; color:var(--text-muted); display:flex; justify-content:space-between; align-items:center;">
          <span>Category: ${t.category}</span>
          <span>${t.createdAt.split(',')[0]}</span>
        </div>
      </div>
    `;
  }).join('');
};

window.handleUserFilesSelect = function(event) {
  const files = Array.from(event.target.files);
  files.forEach(f => {
    if (selectedTicketFiles.find(x => x.name === f.name && x.size === f.size)) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
      selectedTicketFiles.push({
        name: f.name,
        size: f.size,
        type: f.type,
        url: e.target.result
      });
      renderSelectedFiles();
    };
    reader.readAsDataURL(f);
  });
};

function renderSelectedFiles() {
  const list = document.getElementById('tk-selected-files-list');
  if (!list) return;

  if (selectedTicketFiles.length === 0) {
    list.innerHTML = '';
    return;
  }

  list.innerHTML = selectedTicketFiles.map((f, idx) => `
    <div style="display:flex; align-items:center; justify-content:space-between; background:var(--bg-card); padding:8px 12px; border-radius:6px; border:1px solid var(--border-light);">
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:1.1rem;">📄</span>
        <div>
          <div style="font-size:0.82rem; font-weight:700; color:#fff; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${f.name}</div>
          <div style="font-size:0.7rem; color:var(--text-muted);">${(f.size/1024).toFixed(1)} KB</div>
        </div>
      </div>
      <button onclick="removeSelectedFile(${idx})" style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:1.1rem; padding:4px;">✕</button>
    </div>
  `).join('');
}

window.removeSelectedFile = function(idx) {
  selectedTicketFiles.splice(idx, 1);
  renderSelectedFiles();
};

window.submitSupportTicket = async function() {
  const category = document.getElementById('tk-create-category').value;
  const subject = document.getElementById('tk-create-subject').value.trim();
  const description = document.getElementById('tk-create-description').value.trim();
  const prefContact = document.querySelector('input[name="tk-create-pref"]:checked')?.value || 'Email';

  if (!subject || !description) {
    return showToast('Please enter subject and description!', 'error');
  }

  const payload = {
    user: state.user.name,
    userId: state.user.id,
    userEmail: state.user.name.toLowerCase().replace(/\s+/g, '') + '@gmail.com',
    userPhone: '+91 98765 43210',
    category,
    subject,
    description,
    prefContact,
    files: selectedTicketFiles
  };

  try {
    showToast('Submitting ticket...', 'info');
    const res = await fetch(`${SERVER}/api/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const created = await res.json();
      document.getElementById('tk-success-id').textContent = created.id;
      
      const btnView = document.getElementById('tk-btn-view');
      if (btnView) {
        btnView.onclick = () => openUserTicket(created.id);
      }
      
      navigate('ticket-success');
    } else {
      showToast('Failed to create ticket', 'error');
    }
  } catch(e) {
    console.error(e);
    showToast('Error connecting to server', 'error');
  }
};

window.openUserTicket = async function(id) {
  try {
    const res = await fetch(`${SERVER}/api/tickets/${id}`);
    if (!res.ok) return showToast('Error fetching ticket details', 'error');
    const t = await res.json();

    document.getElementById('tk-dt-hidden-id').value = t.id;
    document.getElementById('tk-dt-id-title').textContent = `Ticket ${t.id}`;
    document.getElementById('tk-dt-category').textContent = t.category;
    document.getElementById('tk-dt-subject').textContent = t.subject;
    document.getElementById('tk-dt-status-badge').textContent = t.status.toUpperCase();

    const badge = document.getElementById('tk-dt-status-badge');
    badge.className = 'badge';
    if (t.status === 'open') badge.classList.add('badge-pending');
    if (t.status === 'in-progress') badge.classList.add('badge-warning');
    if (t.status === 'awaiting') badge.classList.add('badge-info');
    if (t.status === 'resolved') badge.classList.add('badge-success');
    if (t.status === 'closed') badge.classList.add('badge-danger');

    renderUserTicketChat(t.replies);
    navigate('ticket-details');
  } catch(e) {
    showToast('Failed to load ticket details', 'error');
  }
};

window.renderUserTicketChat = function(replies) {
  const box = document.getElementById('tk-dt-chat-box');
  if (!box) return;

  if (!replies || replies.length === 0) {
    box.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-muted); font-size:0.8rem;">No messages yet</div>`;
    return;
  }

  box.innerHTML = replies.map(r => {
    const isMe = r.sender === 'user';
    const alignStyle = isMe ? 'margin-left:auto; background:var(--accent); color:#fff; border-bottom-right-radius:2px;' : 'margin-right:auto; background:var(--bg-card); color:var(--text-primary); border-bottom-left-radius:2px;';
    const metaAlign = isMe ? 'text-align:right' : 'text-align:left';

    return `
      <div style="max-width:85%; padding:10px 12px; border-radius:12px; margin-bottom:12px; font-size:0.82rem; line-height:1.4; box-shadow:0 2px 4px rgba(0,0,0,0.1); ${alignStyle}">
        <div style="font-weight:700; font-size:0.75rem; opacity:0.8; margin-bottom:4px;">${isMe ? 'YOU' : 'SUPPORT'}</div>
        <div>${r.message}</div>
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
};

window.handleChatReplyFilesSelect = function(event) {
  const files = Array.from(event.target.files);
  files.forEach(f => {
    if (selectedChatReplyFiles.find(x => x.name === f.name)) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
      selectedChatReplyFiles.push({
        name: f.name,
        size: f.size,
        url: e.target.result
      });
      renderChatReplyAttachments();
    };
    reader.readAsDataURL(f);
  });
};

function renderChatReplyAttachments() {
  const container = document.getElementById('tk-dt-reply-attachments-preview');
  if (!container) return;

  if (selectedChatReplyFiles.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = selectedChatReplyFiles.map((f, idx) => `
    <div style="display:flex; align-items:center; gap:6px; background:var(--bg-card); padding:4px 8px; border-radius:4px; border:1px solid var(--border-light); font-size:0.75rem; color:#fff;">
      <span style="max-width:100px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">📎 ${f.name}</span>
      <button onclick="removeChatReplyAttachment(${idx})" style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:0.75rem; padding:0 2px;">✕</button>
    </div>
  `).join('');
}

window.removeChatReplyAttachment = function(idx) {
  selectedChatReplyFiles.splice(idx, 1);
  renderChatReplyAttachments();
};

window.submitUserTicketReply = async function() {
  const id = document.getElementById('tk-dt-hidden-id').value;
  const input = document.getElementById('tk-dt-reply-input');
  const message = input.value.trim();

  if (!id) return;
  if (!message && selectedChatReplyFiles.length === 0) return;

  const payload = {
    sender: 'user',
    message,
    files: selectedChatReplyFiles
  };

  try {
    const res = await fetch(`${SERVER}/api/tickets/${id}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const updated = await res.json();
      renderUserTicketChat(updated.replies);
      
      input.value = '';
      selectedChatReplyFiles = [];
      renderChatReplyAttachments();
    }
  } catch(e) {
    showToast('Failed to send reply', 'error');
  }
};

// Intercept Android Hardware Back Button inside Capacitor
if (window.Capacitor && window.Capacitor.Plugins) {
  const { App } = window.Capacitor.Plugins;
  if (App) {
    App.addListener('backButton', () => {
      const rootPages = ['home', 'tournaments', 'wallet', 'profile', 'auth', 'onboarding', 'splash'];
      if (rootPages.includes(state.currentPage) && state.previousPages.length === 0) {
        App.exitApp();
      } else {
        goBack();
      }
    });
  }
}

window.renderLeaderboard = function() {
  const container = document.getElementById('leaderboard-list-container');
  if (!container) return;
  
  container.innerHTML = '<div style="padding:40px; text-align:center; color:var(--text-muted)">Loading rankings...</div>';
  
  fetch(`${API}/leaderboard`)
    .then(res => res.json())
    .then(data => {
      // 1. Populate top 3 podium
      const p1 = data.find(x => x.rank === 1) || { username: 'Player 1', wins: 0 };
      const p2 = data.find(x => x.rank === 2) || { username: 'Player 2', wins: 0 };
      const p3 = data.find(x => x.rank === 3) || { username: 'Player 3', wins: 0 };
      
      const pod1 = document.getElementById('podium-1');
      const pod2 = document.getElementById('podium-2');
      const pod3 = document.getElementById('podium-3');
      
      if (pod1) {
        pod1.querySelector('.podium-name').textContent = p1.username;
        pod1.querySelector('.podium-wins').textContent = `${p1.wins} Wins`;
      }
      if (pod2) {
        pod2.querySelector('.podium-name').textContent = p2.username;
        pod2.querySelector('.podium-wins').textContent = `${p2.wins} Wins`;
      }
      if (pod3) {
        pod3.querySelector('.podium-name').textContent = p3.username;
        pod3.querySelector('.podium-wins').textContent = `${p3.wins} Wins`;
      }
      
      // 2. Populate rankings list for 4th place onwards
      if (data.length <= 3) {
        container.innerHTML = '<div style="padding:20px; text-align:center; color:var(--text-muted)">No other rankings yet</div>';
        return;
      }
      
      container.innerHTML = data.slice(3).map(player => `
        <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:10px; padding:12px 16px; display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:12px;">
            <span style="font-size:0.95rem; font-weight:800; color:#3b82f6; width:20px;">#${player.rank}</span>
            <div style="width:34px; height:34px; border-radius:50%; background:#1e1e30; border:1px solid rgba(255,255,255,0.05); overflow:hidden; display:flex; align-items:center; justify-content:center;">
              <img src="assets/valorant_thumb.jpg" style="width:100%; height:100%; object-fit:cover;" />
            </div>
            <div>
              <div style="font-size:0.85rem; font-weight:800; color:#fff;">${player.username}</div>
              <div style="font-size:0.68rem; color:var(--text-muted); margin-top:1px;">${player.wins} Tournaments won</div>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:0.85rem; font-weight:800; color:#eab308;">₹${player.earnings.toLocaleString()}</div>
            <div style="font-size:0.55rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Earnings</div>
          </div>
        </div>
      `).join('');
    })
    .catch(err => {
      container.innerHTML = '<div style="padding:20px; text-align:center; color:var(--text-muted)">Failed to load rankings</div>';
    });
};

// ────────────────────────────────────────────────────
// KYC CONTROLLER FUNCTIONS
// ────────────────────────────────────────────────────
window.loadUserData = async function() {
  if (!state.user || !state.user.id) return;
  try {
    const res = await fetch(`${SERVER}/api/users/${state.user.id}`);
    if (res.ok) {
      const user = await res.json();
      state.user = { ...state.user, ...user };
      localStorage.setItem('nexora_user', JSON.stringify(state.user));
      
      const homeKycWarn = document.getElementById('home-kyc-warning');
      if (homeKycWarn) {
        homeKycWarn.style.display = state.user.kycStatus === 'approved' ? 'none' : 'flex';
      }
      
      if (state.currentPage === 'wallet') {
        renderWallet();
      }
      updateWalletBadge();
    }
  } catch (e) {
    console.error('Failed to load user data:', e);
  }
};

// Hook into connectSSE / user update notifications to reload user data dynamically
// Let's ensure this function exists globally
window.kycPayload = {
  fullName: '',
  dob: '',
  gender: '',
  phone: '',
  panCardImg: '',
  selfieImg: '',
  submittedAt: ''
};

window.selectKycGender = function(gender) {
  window.kycPayload.gender = gender;
  ['male', 'female', 'other'].forEach(g => {
    const btn = document.getElementById(`kyc-gender-${g}`);
    if (btn) {
      if (g === gender.toLowerCase()) {
        btn.style.background = 'var(--accent)';
        btn.style.color = '#fff';
        btn.style.borderColor = 'var(--accent)';
      } else {
        btn.style.background = 'var(--bg-card)';
        btn.style.color = 'var(--text-secondary)';
        btn.style.borderColor = 'var(--border-light)';
      }
    }
  });
};

window.validateKycStep1 = function() {
  const name = document.getElementById('kyc-fullname').value.trim();
  const dob = document.getElementById('kyc-dob').value;
  const phone = document.getElementById('kyc-phone').value.trim();
  
  if (!name) {
    showToast('Please enter your full name', 'error');
    return;
  }
  if (!dob) {
    showToast('Please select your date of birth', 'error');
    return;
  }
  if (!window.kycPayload.gender) {
    showToast('Please select your gender', 'error');
    return;
  }
  if (!phone || phone.length < 10) {
    showToast('Please enter a valid 10-digit mobile number', 'error');
    return;
  }
  
  window.kycPayload.fullName = name;
  window.kycPayload.dob = dob.split('-').reverse().join('/');
  window.kycPayload.phone = '+91 ' + phone;
  
  navigate('kyc-step2');
};

window.triggerPanUpload = function() {
  document.getElementById('kyc-pan-file').click();
};

window.handlePanUploaded = function(input) {
  const file = input.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    window.kycPayload.panCardImg = e.target.result;
    const preview = document.getElementById('pan-preview');
    const placeholder = document.getElementById('pan-placeholder');
    if (preview && placeholder) {
      preview.src = e.target.result;
      preview.style.display = 'block';
      placeholder.style.display = 'none';
    }
  };
  reader.readAsDataURL(file);
};

window.validateKycStep2 = function() {
  if (!window.kycPayload.panCardImg) {
    showToast('Please upload an image of your PAN Card', 'error');
    return;
  }
  navigate('kyc-step3');
};

window.triggerSelfieUpload = function() {
  document.getElementById('kyc-selfie-file').click();
};

window.handleSelfieUploaded = function(input) {
  const file = input.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    window.kycPayload.selfieImg = e.target.result;
    const preview = document.getElementById('selfie-preview');
    const placeholder = document.getElementById('selfie-placeholder');
    if (preview && placeholder) {
      preview.src = e.target.result;
      preview.style.display = 'block';
      placeholder.style.display = 'none';
    }
  };
  reader.readAsDataURL(file);
};

window.submitKycVerification = async function() {
  if (!window.kycPayload.selfieImg) {
    showToast('Please upload your selfie', 'error');
    return;
  }
  
  window.kycPayload.submittedAt = new Date().toLocaleString('en-IN');
  
  try {
    const res = await fetch(`${SERVER}/api/users/${state.user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kycStatus: 'pending',
        kycDetails: window.kycPayload
      })
    });
    if (res.ok) {
      state.user.kycStatus = 'pending';
      state.user.kycDetails = window.kycPayload;
      localStorage.setItem('nexora_user', JSON.stringify(state.user));
      
      const homeKycWarn = document.getElementById('home-kyc-warning');
      if (homeKycWarn) homeKycWarn.style.display = 'flex';
      
      navigate('kyc-submitted');
    } else {
      showToast('Failed to submit verification request', 'error');
    }
  } catch (err) {
    showToast('Error connecting to server', 'error');
  }
};


// =====================================================
// PREDICTIONS MODULE CONTROLLERS
// =====================================================
window.switchPredictionsSubTab = function(tabName, btn) {
  document.querySelectorAll('#pred-sub-tabs .ftab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  document.querySelectorAll('#page-predictions .pred-subview').forEach(view => {
    view.style.display = 'none';
  });
  const activeView = document.getElementById(`pred-subview-${tabName}`);
  if (activeView) activeView.style.display = 'block';

  if (tabName === 'points') {
    loadPredictionsStats();
  } else if (tabName === 'leaderboard') {
    loadPredictionsLeaderboard();
  }
};

window.loadPredictionsMatches = async function() {
  try {
    const sRes = await fetch(`${SERVER}/api/predictions/settings`);
    if (sRes.ok) {
      state.predictionSettings = await sRes.json();
    }
    const res = await fetch(`${SERVER}/api/predictions/matches`);
    if (res.ok) {
      state.predictionMatches = await res.json();
      renderPredictionsMatches();
    }
  } catch(e) {
    console.error('Failed to load prediction matches:', e);
  }
};

let predMatchesFilter = 'live';
window.filterPredictionMatches = function(status, btn) {
  predMatchesFilter = status;
  document.querySelectorAll('#page-predictions .segment-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderPredictionsMatches();
};

window.renderPredictionsMatches = function() {
  const listContainer = document.getElementById('prediction-matches-list');
  if (!listContainer) return;

  const list = (state.predictionMatches || []).filter(m => m.status === predMatchesFilter);
  
  const upcomingMatches = (state.predictionMatches || []).filter(m => m.status === 'upcoming');
  const megaBanner = document.getElementById('pred-mega-match-banner');
  if (megaBanner) {
    if (upcomingMatches.length > 0 && predMatchesFilter === 'upcoming') {
      const megaMatch = upcomingMatches[0];
      document.getElementById('mega-match-title').textContent = megaMatch.title;
      document.getElementById('mega-match-prize').textContent = `₹${megaMatch.prizePool.toLocaleString('en-IN')}`;
      
      document.getElementById('mega-match-predict-btn').onclick = () => openPredictionMatchDetails(megaMatch.id);
      updateCountdownTimer('mega-match-timer', megaMatch.closeTime);
      megaBanner.style.display = 'block';
    } else {
      megaBanner.style.display = 'none';
    }
  }

  if (list.length === 0) {
    listContainer.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-muted); font-size:0.8rem;">No ${predMatchesFilter} matches at the moment.</div>`;
    return;
  }

  listContainer.innerHTML = list.map(m => {
    const closesInText = m.status === 'live' ? 'LIVE' : m.status === 'completed' ? 'Completed' : 'Upcoming';
    const indicatorColor = m.status === 'live' ? '#ef4444' : m.status === 'completed' ? 'var(--text-muted)' : '#3b82f6';
    
    return `
      <div onclick="openPredictionMatchDetails('${m.id}')" style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:10px; padding:12px; cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
        <div style="flex:1;">
          <div style="display:flex; align-items:center; gap:6px; margin-bottom:6px;">
            <span style="width:6px; height:6px; border-radius:50%; background:${indicatorColor};"></span>
            <span style="font-size:0.65rem; font-weight:800; color:var(--text-muted); text-transform:uppercase;">${m.game} · ${closesInText}</span>
          </div>
          <div style="font-size:0.85rem; font-weight:800; color:#fff; margin-bottom:4px;">${m.title}</div>
          <div style="font-size:0.75rem; color:#10b981; font-weight:700;">Pool: ₹${m.prizePool.toLocaleString('en-IN')}</div>
        </div>
        <div style="text-align:right;">
          <span style="font-size:0.8rem; font-weight:900; color:var(--accent-bright);">→</span>
        </div>
      </div>
    `;
  }).join('');
};

function updateCountdownTimer(elementId, closeTimeStr) {
  if (!window.predTimers) window.predTimers = {};
  if (window.predTimers[elementId]) clearInterval(window.predTimers[elementId]);
  
  const update = () => {
    const el = document.getElementById(elementId);
    if (!el) {
      clearInterval(window.predTimers[elementId]);
      return;
    }
    
    const diff = new Date(closeTimeStr).getTime() - Date.now();
    if (diff <= 0) {
      el.textContent = "Closed";
      el.style.color = "#ef4444";
      clearInterval(window.predTimers[elementId]);
      return;
    }
    
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    
    el.textContent = `${h.toString().padStart(2, '0')}h : ${m.toString().padStart(2, '0')}m : ${s.toString().padStart(2, '0')}s`;
  };
  
  update();
  window.predTimers[elementId] = setInterval(update, 1000);
}

window.openPredictionMatchDetails = async function(matchId) {
  try {
    const res = await fetch(`${SERVER}/api/predictions/matches/${matchId}`);
    if (res.ok) {
      const match = await res.json();
      state.selectedPredictionMatch = match;
      renderPredictionMatchDetails(match);
      navigate('prediction-match-details');
    }
  } catch(e) {
    console.error('Failed to get match details:', e);
  }
};

function renderPredictionMatchDetails(m) {
  state.selectedPredictionMatch = m;

  document.getElementById('pmd-t1-name').textContent = m.team1.name;
  document.getElementById('pmd-t2-name').textContent = m.team2.name;
  
  document.getElementById('pmd-t1-prob').textContent = `${m.team1.winProbability}%`;
  document.getElementById('pmd-t2-prob').textContent = `${m.team2.winProbability}%`;
  document.getElementById('pmd-t1-bar').style.width = `${m.team1.winProbability}%`;
  document.getElementById('pmd-t2-bar').style.width = `${m.team2.winProbability}%`;

  document.getElementById('pmd-t1-logo').src = m.team1.logo || 'assets/valorant_thumb.jpg';
  document.getElementById('pmd-t2-logo').src = m.team2.logo || 'assets/valorant_thumb.jpg';

  document.getElementById('pmd-prize').textContent = `₹${m.prizePool.toLocaleString('en-IN')}`;
  
  // Render Markets list
  const marketsContainer = document.getElementById('pmd-markets-list');
  if (marketsContainer) {
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

    marketsContainer.innerHTML = markets.map(market => {
      const optionsHtml = market.options.map(opt => {
        const isSelected = window.betslipSelections?.some(s => s.matchId === m.id && s.marketId === market.id && s.selection === opt.name);
        const activeClass = isSelected ? 'background:rgba(234,179,8,0.15); border:1px solid var(--accent-bright); color:var(--accent-bright);' : 'background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06);';
        
        let clickAttr = `onclick="window.toggleBetslipSelection('${m.id}', '${m.title.replace(/'/g, "\\'")}', '${market.id}', '${market.name}', '${opt.name}', ${opt.odds})"`;
        if (market.status === 'completed' || m.status === 'completed') {
          clickAttr = 'style="opacity:0.6; cursor:not-allowed;"';
        }

        return `
          <button class="quick-amt" style="padding:10px; border-radius:6px; font-size:0.8rem; display:flex; justify-content:space-between; align-items:center; cursor:pointer; color:#fff; transition:all 0.2s ease; ${activeClass}" ${clickAttr}>
            <span style="font-weight:700;">${opt.name}</span>
            <span style="font-weight:900; color:#eab308;">${opt.odds}</span>
          </button>
        `;
      }).join('');

      const winnerBadge = market.status === 'completed' ? `<span style="font-size:0.65rem; background:rgba(16,185,129,0.15); color:#10b981; padding:2px 6px; border-radius:4px; font-weight:800;">Won: ${market.winner}</span>` : '';

      return `
        <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:8px; padding:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">${market.name}</div>
            ${winnerBadge}
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
            ${optionsHtml}
          </div>
        </div>
      `;
    }).join('');
  }

  const actionContainer = document.getElementById('pmd-action-container');
  if (actionContainer) {
    if (m.status === 'completed') {
      actionContainer.style.display = 'none';
    } else {
      actionContainer.style.display = 'block';
      actionContainer.innerHTML = `<div style="text-align:center; font-size:0.75rem; color:var(--text-muted); font-weight:700; padding:4px 0;">Tap on any odds card above to place predictions via Bet Slip.</div>`;
    }
  }

  if (m.status === 'upcoming') {
    document.getElementById('pmd-timer-label').textContent = 'Closes In';
    updateCountdownTimer('pmd-timer', m.closeTime);
    stopLivePitchAnimation();
  } else if (m.status === 'live') {
    document.getElementById('pmd-timer-label').textContent = 'Status';
    document.getElementById('pmd-timer').textContent = 'Match Live';
    document.getElementById('pmd-timer').style.color = '#ef4444';
    startLivePitchAnimation();
  } else {
    document.getElementById('pmd-timer-label').textContent = 'Winner';
    document.getElementById('pmd-timer').textContent = m.winner || 'Completed';
    document.getElementById('pmd-timer').style.color = '#10b981';
    stopLivePitchAnimation();
  }

  const commContainer = document.getElementById('pmd-commentary-list');
  if (commContainer) {
    const logs = m.commentary || [];
    if (logs.length === 0) {
      commContainer.innerHTML = `<div style="font-size:0.75rem; color:var(--text-muted); text-align:center; padding:10px;">No logs available yet.</div>`;
    } else {
      commContainer.innerHTML = logs.map(c => `
        <div style="font-size:0.75rem; color:var(--text-secondary); line-height:1.4; border-bottom:1px solid var(--border-light); padding-bottom:6px; margin-bottom:6px;">
          <span style="color:#ef4444; font-weight:700; margin-right:6px;">${c.time}</span> ${c.event}
        </div>
      `).join('');
    }
  }
  
  switchMatchDetailTab('overview');
}

window.switchMatchDetailTab = function(tabName) {
  document.querySelectorAll('#page-prediction-match-details .ftab').forEach(b => {
    b.classList.remove('active');
  });
  const tabBtn = document.getElementById(`pmd-tab-${tabName}`);
  if (tabBtn) tabBtn.classList.add('active');

  document.querySelectorAll('.pmd-tab-content').forEach(view => {
    view.style.display = 'none';
  });
  const tabContent = document.getElementById(`pmd-content-${tabName}`);
  if (tabContent) tabContent.style.display = 'block';
};

window.openMakePredictionPage = function() {
  const m = state.selectedPredictionMatch;
  if (!m) return;

  document.getElementById('mp-t1-name').textContent = m.team1.name;
  document.getElementById('mp-t2-name').textContent = m.team2.name;
  document.getElementById('mp-t1-percent').textContent = `${m.team1.winProbability}% Win`;
  document.getElementById('mp-t2-percent').textContent = `${m.team2.winProbability}% Win`;
  
  document.getElementById('mp-t1-logo').src = m.team1.logo || 'assets/valorant_thumb.jpg';
  document.getElementById('mp-t2-logo').src = m.team2.logo || 'assets/valorant_thumb.jpg';

  const entryFee = m.entryFee !== undefined ? m.entryFee : (state.predictionSettings?.defaultEntryFee || 25);
  const potentialWin = Math.round(m.prizePool * ((state.predictionSettings?.rewardsSplit?.first || 80) / 100));

  const feeEl = document.getElementById('mp-entry-fee-val');
  if (feeEl) feeEl.textContent = `₹${entryFee}`;
  const potEl = document.getElementById('mp-pot-win-val');
  if (potEl) potEl.textContent = `₹${potentialWin.toLocaleString('en-IN')}`;

  window.selectedPredTeam = null;
  document.getElementById('mp-t1-card').style.border = '1px solid var(--border-light)';
  document.getElementById('mp-t2-card').style.border = '1px solid var(--border-light)';

  navigate('make-prediction');
};

window.selectPredictionTeam = function(teamKey) {
  window.selectedPredTeam = teamKey;
  const m = state.selectedPredictionMatch;
  if (!m) return;

  document.getElementById('mp-t1-card').style.border = teamKey === 'team1' ? '1px solid #10b981' : '1px solid var(--border-light)';
  document.getElementById('mp-t2-card').style.border = teamKey === 'team2' ? '1px solid #ef4444' : '1px solid var(--border-light)';
};

window.submitPrediction = async function() {
  if (!window.selectedPredTeam) {
    showToast('Please select a team!', 'error');
    return;
  }

  const m = state.selectedPredictionMatch;
  if (!m) return;

  const entryFee = m.entryFee !== undefined ? m.entryFee : (state.predictionSettings?.defaultEntryFee || 25);
  const potentialWin = Math.round(m.prizePool * ((state.predictionSettings?.rewardsSplit?.first || 80) / 100));

  if (state.user.walletBalance < entryFee) {
    showToast(`Insufficient balance! Need ₹${entryFee} to enter. Add cash first.`, 'error');
    setTimeout(() => navigate('wallet'), 1200);
    return;
  }

  const teamName = window.selectedPredTeam === 'team1' ? m.team1.name : m.team2.name;

  const payload = {
    userId: state.user.id,
    matchId: m.id,
    predictedTeam: teamName
  };

  try {
    const res = await fetch(`${SERVER}/api/predictions/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const predictionResult = await res.json();
      
      document.getElementById('ps-pick-team').textContent = predictionResult.predictedTeam;
      
      const mpsTeamVal = document.getElementById('mps-team-val');
      if (mpsTeamVal) mpsTeamVal.textContent = predictionResult.predictedTeam;
      const mpsEntryVal = document.getElementById('mps-entry-val');
      if (mpsEntryVal) mpsEntryVal.textContent = `-₹${entryFee}`;
      const mpsPotWinVal = document.getElementById('mps-pot-win-val');
      if (mpsPotWinVal) mpsPotWinVal.textContent = `₹${potentialWin.toLocaleString('en-IN')}`;

      // Deduct locally and sync UI displays
      state.user.walletBalance -= entryFee;
      updateWalletBadge();
      renderWallet();

      navigate('prediction-success');
      showToast('Prediction placed successfully! 🔮', 'success');
    } else {
      const err = await res.json();
      showToast(err.error || 'Failed to place prediction', 'error');
    }
  } catch(e) {
    console.error('Failed to submit prediction:', e);
    showToast('Network error, please try again.', 'error');
  }
};

window.loadPredictionsStats = async function() {
  try {
    const userRes = await fetch(`${SERVER}/api/users/${state.user.id}`);
    if (userRes.ok) {
      const u = await userRes.json();
      document.getElementById('user-pred-points-total').textContent = u.predictionPoints || 0;
    }

    const predsRes = await fetch(`${SERVER}/api/predictions/predictions`);
    const matchesRes = await fetch(`${SERVER}/api/predictions/matches`);
    
    if (predsRes.ok && matchesRes.ok) {
      const preds = await predsRes.json();
      const matches = await matchesRes.json();
      
      const myPreds = preds.filter(p => p.userId === state.user.id);
      
      const correctCount = myPreds.filter(p => p.status === 'correct').length;
      const totalCount = myPreds.length;
      const rate = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
      
      document.getElementById('user-pred-correct-rate').textContent = `${rate}%`;
      document.getElementById('user-pred-total-count').textContent = totalCount;

      const leaderboardRes = await fetch(`${SERVER}/api/predictions/leaderboard`);
      if (leaderboardRes.ok) {
        const lb = await leaderboardRes.json();
        const myRankIdx = lb.allTime.findIndex(u => u.id === state.user.id);
        document.getElementById('user-pred-rank').textContent = myRankIdx !== -1 ? `#${myRankIdx + 1}` : '#N/A';
      }

      const historyContainer = document.getElementById('user-prediction-history-list');
      if (historyContainer) {
        if (myPreds.length === 0) {
          historyContainer.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-muted); font-size:0.75rem;">You haven't made any predictions yet.</div>`;
          return;
        }

        historyContainer.innerHTML = myPreds.map(p => {
          const m = matches.find(match => match.id === p.matchId) || {};
          const statusColor = p.status === 'correct' ? '#10b981' : p.status === 'incorrect' ? '#ef4444' : '#eab308';
          const pointsText = p.status === 'correct' ? `+${p.pointsWon} pts` : p.status === 'incorrect' ? `${p.pointsWon} pts` : 'Pending';
          const rewardText = p.prizeShare > 0 ? ` (+₹${p.prizeShare})` : '';

          return `
            <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:8px; padding:12px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-size:0.8rem; font-weight:800; color:#fff;">${m.title || 'Unknown Match'}</div>
                <div style="font-size:0.7rem; color:var(--text-muted); margin-top:2px;">Predicted: <b>${p.predictedTeam}</b> · ${p.submittedAt}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:0.8rem; font-weight:800; color:${statusColor};">${pointsText}${rewardText}</div>
                <div style="font-size:0.65rem; color:var(--text-muted); text-transform:uppercase; margin-top:2px;">${p.status}</div>
              </div>
            </div>
          `;
        }).join('');
      }
    }
  } catch(e) {
    console.error('Failed to load predictions stats:', e);
  }
};

let predLbTimeframe = 'weekly';
window.switchLeaderboardTime = function(timeframe, btn) {
  predLbTimeframe = timeframe;
  document.querySelectorAll('#pred-subview-leaderboard .tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderPredictionsLeaderboard();
};

window.loadPredictionsLeaderboard = async function() {
  try {
    const res = await fetch(`${SERVER}/api/predictions/leaderboard`);
    if (res.ok) {
      state.predictionsLeaderboard = await res.json();
      renderPredictionsLeaderboard();
    }
  } catch(e) {
    console.error('Failed to load predictions leaderboard:', e);
  }
};

window.renderPredictionsLeaderboard = function() {
  const podiumContainer = document.getElementById('pred-leaderboard-podium');
  const listContainer = document.getElementById('pred-leaderboard-list');
  if (!podiumContainer || !listContainer) return;

  const lbData = state.predictionsLeaderboard || { weekly: [], monthly: [], allTime: [] };
  const rankings = lbData[predLbTimeframe] || [];

  const p1 = rankings[0] || { name: 'Empty', points: 0, avatar: 'assets/valorant_thumb.jpg' };
  const p2 = rankings[1] || { name: 'Empty', points: 0, avatar: 'assets/valorant_thumb.jpg' };
  const p3 = rankings[2] || { name: 'Empty', points: 0, avatar: 'assets/valorant_thumb.jpg' };

  podiumContainer.innerHTML = `
    <div style="display:flex; flex-direction:column; align-items:center; width:30%;">
      <div style="width:54px; height:54px; border-radius:50%; border:2px solid #3b82f6; overflow:hidden; background:#1e1e30; display:flex; align-items:center; justify-content:center; position:relative; margin-bottom:8px;">
        <img src="${p2.avatar}" style="width:100%; height:100%; object-fit:cover;" />
        <div style="position:absolute; bottom:-4px; background:#3b82f6; color:#fff; border-radius:50%; width:18px; height:18px; display:flex; align-items:center; justify-content:center; font-size:0.7rem; font-weight:900;">2</div>
      </div>
      <span style="font-size:0.75rem; font-weight:800; color:#fff; text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%;">${p2.name}</span>
      <span style="font-size:0.65rem; color:#3b82f6; font-weight:700;">${p2.points} pts</span>
    </div>

    <div style="display:flex; flex-direction:column; align-items:center; width:36%;">
      <div style="width:68px; height:68px; border-radius:50%; border:3px solid #eab308; overflow:hidden; background:#1e1e30; display:flex; align-items:center; justify-content:center; position:relative; margin-bottom:8px;">
        <img src="${p1.avatar}" style="width:100%; height:100%; object-fit:cover;" />
        <div style="position:absolute; bottom:-4px; background:#eab308; color:#000; border-radius:50%; width:20px; height:20px; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:900;">1</div>
      </div>
      <span style="font-size:0.85rem; font-weight:900; color:#fff; text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%;">${p1.name}</span>
      <span style="font-size:0.7rem; color:#eab308; font-weight:800;">${p1.points} pts</span>
    </div>

    <div style="display:flex; flex-direction:column; align-items:center; width:30%;">
      <div style="width:48px; height:48px; border-radius:50%; border:2px solid #b45309; overflow:hidden; background:#1e1e30; display:flex; align-items:center; justify-content:center; position:relative; margin-bottom:8px;">
        <img src="${p3.avatar}" style="width:100%; height:100%; object-fit:cover;" />
        <div style="position:absolute; bottom:-4px; background:#b45309; color:#fff; border-radius:50%; width:16px; height:16px; display:flex; align-items:center; justify-content:center; font-size:0.65rem; font-weight:900;">3</div>
      </div>
      <span style="font-size:0.75rem; font-weight:800; color:#fff; text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%;">${p3.name}</span>
      <span style="font-size:0.65rem; color:#b45309; font-weight:700;">${p3.points} pts</span>
    </div>
  `;

  const others = rankings.slice(3);
  if (others.length === 0) {
    listContainer.innerHTML = '';
    return;
  }

  listContainer.innerHTML = others.map((item, idx) => `
    <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:8px; padding:10px 12px; display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
      <div style="display:flex; align-items:center; gap:12px;">
        <span style="font-size:0.8rem; font-weight:800; color:var(--text-muted); width:20px;">#${idx + 4}</span>
        <img src="${item.avatar}" style="width:28px; height:28px; border-radius:50%; object-fit:cover;" />
        <span style="font-size:0.8rem; font-weight:800; color:#fff;">${item.name}</span>
      </div>
      <span style="font-size:0.8rem; font-weight:800; color:var(--text-secondary); text-align:right;">${item.points} pts</span>
    </div>
  `).join('');
};

// =====================================================
// BET SLIP SYSTEM (MODERN MONETIZATION)
// =====================================================
window.betslipSelections = [];

window.toggleBetslipSelection = function(matchId, matchTitle, marketId, marketName, selection, odds) {
  const match = (state.predictionMatches || []).find(m => m.id === matchId);
  if (match && match.status === 'completed') {
    showToast('Match is completed! Cannot place predictions.', 'error');
    return;
  }

  const idx = window.betslipSelections.findIndex(s => s.matchId === matchId && s.marketId === marketId);
  if (idx !== -1) {
    if (window.betslipSelections[idx].selection === selection) {
      window.betslipSelections.splice(idx, 1);
      showToast('Removed prediction from Bet Slip', 'info');
    } else {
      window.betslipSelections[idx].selection = selection;
      window.betslipSelections[idx].odds = odds;
      showToast('Updated choice in Bet Slip', 'success');
    }
  } else {
    window.betslipSelections.push({
      matchId,
      matchTitle,
      marketId,
      marketName,
      selection,
      odds,
      stake: 100
    });
    showToast('Added prediction to Bet Slip! 🎫', 'success');
  }

  window.updateBetslipBadges();
  window.renderBetSlip();
  
  if (state.selectedPredictionMatch && state.selectedPredictionMatch.id === matchId) {
    renderPredictionMatchDetails(state.selectedPredictionMatch);
  }
};

window.updateBetslipBadges = function() {
  const count = window.betslipSelections.length;
  
  const badge = document.getElementById('betslip-badge-count');
  if (badge) badge.textContent = count;

  const triggerBadge = document.getElementById('betslip-trigger-badge');
  if (triggerBadge) triggerBadge.textContent = count;

  const triggerBtn = document.getElementById('betslip-trigger-btn');
  if (triggerBtn) {
    triggerBtn.style.display = count > 0 ? 'flex' : 'none';
  }
};

window.toggleBetSlip = function(show) {
  const drawer = document.getElementById('predictions-betslip-drawer');
  if (drawer) {
    drawer.style.bottom = show ? '0' : '-100%';
  }
};

window.clearBetSlip = function() {
  window.betslipSelections = [];
  window.updateBetslipBadges();
  window.toggleBetSlip(false);
  showToast('Bet Slip cleared.', 'info');
  
  if (state.selectedPredictionMatch) {
    renderPredictionMatchDetails(state.selectedPredictionMatch);
  }
};

window.renderBetSlip = function() {
  const container = document.getElementById('betslip-items-container');
  if (!container) return;

  if (window.betslipSelections.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-muted); font-size:0.8rem;">Your Bet Slip is empty. Tap on odds cards to place predictions.</div>`;
    document.getElementById('betslip-total-stake').textContent = '₹0';
    document.getElementById('betslip-total-potwin').textContent = '₹0';
    return;
  }

  container.innerHTML = window.betslipSelections.map((s, idx) => {
    const potWin = Math.round(s.stake * s.odds);
    return `
      <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:10px; padding:12px; position:relative; box-sizing:border-box;">
        <button onclick="window.removeBetslipItem(${idx})" style="position:absolute; top:8px; right:8px; background:none; border:none; color:var(--text-muted); font-size:1.1rem; cursor:pointer;">×</button>
        
        <div style="font-size:0.75rem; color:var(--accent-bright); font-weight:800;">${s.matchTitle}</div>
        <div style="font-size:0.7rem; color:var(--text-muted); margin-top:2px;">${s.marketName}</div>
        
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
          <div style="font-size:0.85rem; font-weight:800; color:#fff;">${s.selection} <span style="color:#eab308; font-size:0.75rem; font-weight:900; margin-left:6px;">@ ${s.odds}</span></div>
          
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="font-size:0.7rem; color:var(--text-muted);">Stake:</span>
            <input type="number" value="${s.stake}" oninput="window.updateStakeAmount(${idx}, this.value)" style="width:70px; background:var(--bg-elevated); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:4px 6px; color:#fff; font-size:0.8rem; text-align:center; outline:none;" />
          </div>
        </div>
        
        <div style="display:flex; justify-content:space-between; border-top:1px dashed rgba(255,255,255,0.05); margin-top:10px; padding-top:8px; font-size:0.7rem; color:var(--text-muted);">
          <span>Potential Win:</span>
          <span style="font-weight:800; color:#10b981;">₹${potWin.toLocaleString('en-IN')}</span>
        </div>
      </div>
    `;
  }).join('');

  const totalStake = window.betslipSelections.reduce((acc, s) => acc + s.stake, 0);
  const totalPotWin = window.betslipSelections.reduce((acc, s) => acc + Math.round(s.stake * s.odds), 0);

  document.getElementById('betslip-total-stake').textContent = `₹${totalStake.toLocaleString('en-IN')}`;
  document.getElementById('betslip-total-potwin').textContent = `₹${totalPotWin.toLocaleString('en-IN')}`;
};

window.removeBetslipItem = function(idx) {
  window.betslipSelections.splice(idx, 1);
  window.updateBetslipBadges();
  window.renderBetSlip();
  if (state.selectedPredictionMatch) {
    renderPredictionMatchDetails(state.selectedPredictionMatch);
  }
};

window.updateStakeAmount = function(idx, val) {
  const num = parseInt(val) || 0;
  window.betslipSelections[idx].stake = num;
  
  const totalStake = window.betslipSelections.reduce((acc, s) => acc + s.stake, 0);
  const totalPotWin = window.betslipSelections.reduce((acc, s) => acc + Math.round(s.stake * s.odds), 0);

  document.getElementById('betslip-total-stake').textContent = `₹${totalStake.toLocaleString('en-IN')}`;
  document.getElementById('betslip-total-potwin').textContent = `₹${totalPotWin.toLocaleString('en-IN')}`;

  const cards = document.getElementById('betslip-items-container').children;
  if (cards && cards[idx]) {
    const potWinSpan = cards[idx].querySelector('span[style*="#10b981"]');
    if (potWinSpan) {
      potWinSpan.textContent = `₹${Math.round(num * window.betslipSelections[idx].odds).toLocaleString('en-IN')}`;
    }
  }
};

window.confirmBetslipPlacement = async function() {
  const acceptRules = document.getElementById('betslip-accept-rules').checked;
  if (!acceptRules) {
    showToast('Please accept the rules to proceed!', 'error');
    return;
  }

  const totalStake = window.betslipSelections.reduce((acc, s) => acc + s.stake, 0);
  if (totalStake <= 0) {
    showToast('Please specify a valid stake amount!', 'error');
    return;
  }

  if (state.user.walletBalance < totalStake) {
    showToast('Insufficient balance! Add cash first.', 'error');
    return;
  }

  document.getElementById('betslip-place-btn').disabled = true;
  document.getElementById('betslip-place-btn').textContent = 'PLACING BETS...';

  try {
    const res = await fetch(`${SERVER}/api/predictions/submit-bet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: state.user.id,
        bets: window.betslipSelections
      })
    });

    if (res.ok) {
      state.user.walletBalance -= totalStake;
      localStorage.setItem('nexora_user', JSON.stringify(state.user));
      updateWalletBadge();
      renderWallet();

      showToast('Predictions placed successfully! 🎉', 'success');
      
      const firstBet = window.betslipSelections[0] || {};
      const winVal = window.betslipSelections.reduce((acc, s) => acc + Math.round(s.stake * s.odds), 0);
      document.getElementById('mps-team-val').textContent = firstBet.selection + (window.betslipSelections.length > 1 ? ` (+${window.betslipSelections.length - 1} more)` : '');
      document.getElementById('mps-entry-val').textContent = `-₹${totalStake}`;
      document.getElementById('mps-pot-win-val').textContent = `₹${winVal.toLocaleString('en-IN')}`;
      
      document.getElementById('ps-pick-team').textContent = firstBet.selection;

      window.betslipSelections = [];
      window.updateBetslipBadges();
      window.toggleBetSlip(false);

      navigate('prediction-success');
    } else {
      const err = await res.json();
      showToast(err.error || 'Failed to place bets.', 'error');
    }
  } catch(e) {
    console.error(e);
    showToast('Network error placing bets.', 'error');
  } finally {
    document.getElementById('betslip-place-btn').disabled = false;
    document.getElementById('betslip-place-btn').textContent = 'PLACE BET';
  }
};

// =====================================================
// LIVE ANIMATED TRACKER CANVAS
// =====================================================
let liveAnimationInterval = null;

function startLivePitchAnimation() {
  stopLivePitchAnimation();
  const animContainer = document.getElementById('pmd-live-match-animation');
  if (!animContainer) return;
  animContainer.style.display = 'block';

  const ball = document.getElementById('pmd-animated-ball');
  const eventText = document.getElementById('pmd-anim-event-text');
  const runrateEl = document.getElementById('pmd-anim-runrate');
  const partnershipEl = document.getElementById('pmd-anim-partnership');

  const events = ['SINGLE 🏃', 'FOUR! 🏏', 'DOT BALL ❌', '2 RUNS 🏃‍♂️🏃‍♂️', 'SIX!! 🚀', 'WICKET! 🔴', 'WIDE BALL ⚠️'];

  liveAnimationInterval = setInterval(() => {
    if (!ball || !eventText) return;

    ball.style.display = 'block';
    ball.style.left = '20px';
    ball.style.top = '65px';
    ball.style.transform = 'scale(1)';

    setTimeout(() => {
      ball.style.left = '50%';
      ball.style.top = '72px';
      ball.style.transform = 'scale(0.8)';
    }, 100);

    setTimeout(() => {
      ball.style.left = 'calc(100% - 30px)';
      ball.style.top = '65px';
      ball.style.transform = 'scale(1.1)';
    }, 600);

    setTimeout(() => {
      ball.style.display = 'none';
      const ev = events[Math.floor(Math.random() * events.length)];
      eventText.textContent = ev;
      eventText.style.display = 'block';

      if (runrateEl && partnershipEl) {
        let rr = parseFloat(runrateEl.textContent) || 8.18;
        rr = (rr + (Math.random() * 0.1 - 0.05)).toFixed(2);
        runrateEl.textContent = rr;

        let parts = partnershipEl.textContent.split(' ');
        let runs = parseInt(parts[0]) || 45;
        let balls = parseInt(parts[1]?.replace(/[()]/g, '')) || 28;
        if (ev.includes('WICKET')) {
          runs = 0;
          balls = 0;
        } else if (ev.includes('FOUR')) {
          runs += 4;
          balls += 1;
        } else if (ev.includes('SIX')) {
          runs += 6;
          balls += 1;
        } else if (ev.includes('SINGLE')) {
          runs += 1;
          balls += 1;
        } else if (ev.includes('2 RUNS')) {
          runs += 2;
          balls += 1;
        } else if (ev.includes('DOT')) {
          balls += 1;
        }
        partnershipEl.textContent = `${runs} (${balls})`;
      }
    }, 1200);

    setTimeout(() => {
      eventText.style.display = 'none';
    }, 3500);

  }, 6000);
}

function stopLivePitchAnimation() {
  if (liveAnimationInterval) {
    clearInterval(liveAnimationInterval);
    liveAnimationInterval = null;
  }
  const animContainer = document.getElementById('pmd-live-match-animation');
  if (animContainer) animContainer.style.display = 'none';
}

function renderWinnersPodiumHTML(winners, gameName) {
  if (!winners) return '';
  const first = winners.first;
  const second = winners.second;
  const third = winners.third;

  if (!first) return '';

  const getInitials = (name) => {
    return (name || 'U')[0].toUpperCase();
  };

  return `
    <div style="background:linear-gradient(135deg, var(--bg-card), var(--bg-surface)); border:1px solid var(--border-light); border-radius:18px; padding:20px; margin:20px 0; box-shadow:0 8px 32px rgba(0,0,0,0.4);">
      <div style="text-align:center; font-size:0.8rem; font-weight:800; color:var(--warning); text-transform:uppercase; letter-spacing:1.5px; margin-bottom:20px;">🏆 TOURNAMENT CHAMPIONS 🏆</div>
      
      <div style="display:flex; justify-content:center; align-items:flex-end; gap:12px; margin-bottom:15px; padding-top:20px;">
        
        ${second ? `
        <div style="flex:1; text-align:center; display:flex; flex-direction:column; align-items:center;">
          <div style="position:relative; margin-bottom:8px;">
            <div style="width:48px; height:48px; border-radius:50%; background:#94a3b8; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1.1rem; border:2px solid #cbd5e1;">
              ${getInitials(second.gameUsername)}
            </div>
            <span style="position:absolute; bottom:-4px; right:-4px; background:#94a3b8; width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.7rem; color:#fff; border:1px solid #fff;">🥈</span>
          </div>
          <div style="font-size:0.75rem; font-weight:800; color:#fff; max-width:85px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${second.gameUsername}</div>
          <div style="font-size:0.65rem; color:var(--text-muted); margin-bottom:6px;">ID: #${second.userId.slice(-5)}</div>
          <div style="background:#475569; color:#fff; font-size:0.7rem; font-weight:800; padding:4px 8px; border-radius:6px; width:100%; box-sizing:border-box;">₹${second.prize.toLocaleString('en-IN')}</div>
        </div>
        ` : ''}

        <div style="flex:1.2; text-align:center; display:flex; flex-direction:column; align-items:center; transform:translateY(-15px);">
          <div style="position:relative; margin-bottom:8px;">
            <div style="width:60px; height:60px; border-radius:50%; background:linear-gradient(135deg, #f59e0b, #d97706); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:1.3rem; border:3px solid #fef08a; box-shadow:0 0 15px rgba(245,158,11,0.5);">
              ${getInitials(first.gameUsername)}
            </div>
            <span style="position:absolute; bottom:-4px; right:-2px; background:#f59e0b; width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.85rem; color:#fff; border:1.5px solid #fff;">🥇</span>
          </div>
          <div style="font-size:0.85rem; font-weight:900; color:var(--warning); max-width:100px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${first.gameUsername}</div>
          <div style="font-size:0.65rem; color:var(--text-muted); margin-bottom:6px;">ID: #${first.userId.slice(-5)}</div>
          <div style="background:var(--warning); color:#000; font-size:0.75rem; font-weight:900; padding:6px 10px; border-radius:6px; width:100%; box-sizing:border-box;">₹${first.prize.toLocaleString('en-IN')}</div>
        </div>

        ${third ? `
        <div style="flex:1; text-align:center; display:flex; flex-direction:column; align-items:center;">
          <div style="position:relative; margin-bottom:8px;">
            <div style="width:48px; height:48px; border-radius:50%; background:#b45309; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1.1rem; border:2px solid #d97706;">
              ${getInitials(third.gameUsername)}
            </div>
            <span style="position:absolute; bottom:-4px; right:-4px; background:#b45309; width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.7rem; color:#fff; border:1px solid #fff;">🥉</span>
          </div>
          <div style="font-size:0.75rem; font-weight:800; color:#fff; max-width:85px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${third.gameUsername}</div>
          <div style="font-size:0.65rem; color:var(--text-muted); margin-bottom:6px;">ID: #${third.userId.slice(-5)}</div>
          <div style="background:#78350f; color:#fff; font-size:0.7rem; font-weight:800; padding:4px 8px; border-radius:6px; width:100%; box-sizing:border-box;">₹${third.prize.toLocaleString('en-IN')}</div>
        </div>
        ` : ''}

      </div>
      <div style="font-size:0.7rem; text-align:center; color:var(--text-muted); border-top:1px solid var(--border-light); padding-top:12px; margin-top:12px;">Game: <b>${gameName}</b> · Prize pool has been credited to wallet balances.</div>
    </div>
  `;
}

