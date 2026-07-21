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
    walletBalance: 0,
  },
  onboardingSlide: 0,
  bannerSlide: 0,
  predictionsBannerSlide: 0,
  countdownSeconds: 150, // 02:30
  countdownTimer: null,
  bannerTimer: null,
  predictionsBannerTimer: null,
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
let PREDICTIONS_BANNERS = [];
let PRED_SETTINGS = {};
let CASINO_SETTINGS = {};
const CASINO_GAMES = [
  { id: 'plane', name: 'Plane Crash', emoji: '✈️', subtitle: 'Up to 1000x', bg: 'linear-gradient(135deg,#0d1a3a,#1e3a6e)', live: true },
  { id: 'mines', name: 'Mines', emoji: '💣', subtitle: 'Up to 100x', bg: 'linear-gradient(135deg,#1a0a2e,#3b1f6e)' },
  { id: 'spin', name: 'Spin & Win', emoji: '🎡', subtitle: 'Up to 10x', bg: 'linear-gradient(135deg,#1a0a1a,#4a1a4a)' },
  { id: 'dice', name: 'Dice', emoji: '🎲', subtitle: 'Up to 49x', bg: 'linear-gradient(135deg,#0a1a2e,#0d3a6e)' },
  { id: 'coinflip', name: 'Coinflip', emoji: '🪙', subtitle: '1.94x win', bg: 'linear-gradient(135deg,#1a1a0a,#3a3a0a)' },
  { id: 'tower', name: 'Tower', emoji: '🗼', subtitle: 'Climb & win', bg: 'linear-gradient(135deg,#1a0a0a,#4a1a1a)' },
  { id: 'limbo', name: 'Limbo', emoji: '📈', subtitle: 'Target multiplier', bg: 'linear-gradient(135deg,#0a1a0a,#0a3a1a)' },
  { id: 'color', name: 'Color Predict', emoji: '🎨', subtitle: 'Red/Green/Violet', bg: 'linear-gradient(135deg,#1a0a1a,#3a0a3a)' },
  { id: 'plinko', name: 'Plinko', emoji: '⬇️', subtitle: 'Up to 29x', bg: 'linear-gradient(135deg,#0a1a1a,#0a3a3a)' },
  { id: 'keno', name: 'Keno', emoji: '🔢', subtitle: 'Up to 10000x', bg: 'linear-gradient(135deg,#1e0a2e,#3b0f5e)' }
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
  const user = state.user || JSON.parse(localStorage.getItem('nexora_user') || 'null');
  if (user && user.status === 'banned') {
    showToast('Your account is suspended. Access denied.', 'error');
    return;
  }
  if (user) sessionStorage.setItem('nexora_user', JSON.stringify(user));
  window.location.href = '/games.html?game=' + (gameId || 'hub');
};

window.openBoardGamesApp = function(gameId) {
  const user = state.user || JSON.parse(localStorage.getItem('nexora_user') || 'null');
  if (user && user.status === 'banned') {
    showToast('Your account is suspended. Access denied.', 'error');
    return;
  }
  if (user) sessionStorage.setItem('nexora_user', JSON.stringify(user));
  window.location.href = '/board_games.html?game=' + (gameId || 'hub');
};

function navigate(pageId, isBack = false) {
  if (state.user && state.user.status === 'banned') {
    pageId = 'banned';
    const bIdEl = document.getElementById('banned-user-id');
    if (bIdEl) bIdEl.textContent = state.user.id;
    const bReasonEl = document.getElementById('banned-reason-val');
    if (bReasonEl) bReasonEl.textContent = state.user.banReason || 'ToS Violation / Suspicious Activity';
  }

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
      checkPendingQrPayment();
      break;
    case 'my-matches':
      renderMyMatches();
      break;
    case 'leaderboard':
      renderLeaderboard();
      break;
    case 'predictions':
      loadPredictionsMatches();
      loadPredictionsStats();
      loadPredictionsLeaderboard();
      updateWalletBadge();
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
      renderSupportManualPayment();
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
const SERVER = (window.Capacitor || (!window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')))
  ? 'https://nexora-arena-backend.onrender.com'
  : window.location.origin;
const API = SERVER + '/api';

function connectSSE() {
  console.log('SSE replaced with periodic database polling.');
  
  async function pollData() {
    try {
      const res = await fetch(`${API}/data`);
      if (!res.ok) return;
      const data = await res.json();
      
      // Update tournaments
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
      
      // Update games
      if (data.games) {
        GAMES = data.games.map(g => ({
          name: g.name,
          emoji: g.emoji,
          color: g.color || '#1a3a6c,#0d47a1',
          count: g.tournaments || 0,
          image: g.image
        }));
      }
      
      // Banners
      if (data.banners) BANNERS = data.banners;
      if (data.predictions_banners) PREDICTIONS_BANNERS = data.predictions_banners;
      if (data.casinoSettings) CASINO_SETTINGS = data.casinoSettings;
      if (data.predictionSettings) {
        state.predictionSettings = data.predictionSettings;
        PRED_SETTINGS = state.predictionSettings || {};
      }
      if (data.settings) APP_SETTINGS = data.settings;
      
      // Update predictions
      if (data.predictionMatches) {
        state.predictionMatches = data.predictionMatches;
        if (state.currentPage === 'predictions') {
          renderPredictionsMatches();
        } else if (state.currentPage === 'prediction-match-details' && state.selectedPredictionMatch) {
          const updated = state.predictionMatches.find(m => m.id === state.selectedPredictionMatch.id);
          if (updated) {
            state.selectedPredictionMatch = updated;
            renderPredictionMatchDetails(updated);
          }
        }
      }
      
      // Update support tickets
      if (data.tickets && state.user) {
        const userTickets = data.tickets.filter(t => t.userId === state.user.id);
        renderUserTicketsList(userTickets);
        if (state.currentPage === 'ticket-details') {
          const activeId = document.getElementById('tk-dt-hidden-id')?.value;
          const activeTicket = data.tickets.find(t => t.id === activeId);
          if (activeTicket) {
            renderUserTicketChat(activeTicket.replies);
            const statusBadge = document.getElementById('tk-dt-status-badge');
            if (statusBadge) {
              statusBadge.textContent = activeTicket.status.toUpperCase();
              statusBadge.className = 'badge';
              if (activeTicket.status === 'open') statusBadge.classList.add('badge-pending');
              if (activeTicket.status === 'in-progress') statusBadge.classList.add('badge-warning');
              if (activeTicket.status === 'awaiting') statusBadge.classList.add('badge-info');
              if (activeTicket.status === 'resolved') statusBadge.classList.add('badge-success');
              if (activeTicket.status === 'closed') statusBadge.classList.add('badge-danger');
            }
          }
        }
      }
      
      // Update user details
      if (data.users && state.user && state.user.id) {
        const myProfile = data.users.find(u => u.id === state.user.id);
        if (myProfile) {
          state.user = { 
            ...state.user, 
            ...myProfile,
            walletBalance: myProfile.balance !== undefined ? myProfile.balance : state.user.walletBalance
          };
          localStorage.setItem('nexora_user', JSON.stringify(state.user));
          
          if (state.currentPage === 'wallet') {
            renderWallet();
          }
          const el = document.getElementById('home-wallet-bal');
          if (el) el.textContent = formatCurrency(state.user.walletBalance);
          
          if (state.user.status === 'banned') {
            const bReasonEl = document.getElementById('banned-reason-val');
            if (bReasonEl) bReasonEl.textContent = state.user.banReason || 'ToS Violation / Suspicious Activity';
            navigate('banned');
          }
          
          const homeKycWarn = document.getElementById('home-kyc-warning');
          if (homeKycWarn) {
            homeKycWarn.style.display = state.user.kycStatus === 'approved' ? 'none' : 'flex';
          }
        }
      }
      
      // Update transactions
      if (data.transactions) {
        if (state.loggedIn && state.user) {
          const myRawTx = data.transactions.filter(t => (t.userId === state.user.id) || (t.user === state.user.name));
          TRANSACTIONS = myRawTx.map(t => ({
            id: t.id,
            type: t.type === 'added' || t.type === 'credit' || t.type === 'refund' ? 'credit' : 'debit',
            desc: t.type === 'joined' ? 'Joined Tournament' : t.type === 'added' ? 'Added Cash' : t.type === 'withdrawal' ? 'Withdrawn' : t.type,
            sub: `${t.method} · ${t.date}`,
            amount: `${t.amount > 0 ? '+' : ''}₹${t.amount.toLocaleString('en-IN')}`,
            amountVal: t.amount,
            method: t.method,
            icon: t.type === 'added' ? '💳' : t.type === 'withdrawal' ? '💸' : '🎮'
          }));
        } else {
          TRANSACTIONS = [];
        }
      }
      
      // Trigger updates of elements
      document.querySelectorAll('.brand-name').forEach(el => {
        el.innerHTML = APP_SETTINGS.appName.replace(/o/i, '<span>O</span>');
      });
      
      checkMaintenance();
      renderDrawerSocials();
      renderHomeGames();
      renderHomeTournaments();
      renderHomeBanners();
      renderNoticesBanner();
      renderPredictionsBanners();
      renderHomeCasinoGames();
      checkPendingQrPayment();
      
    } catch (err) {
      console.error("Failed to poll live data:", err);
    }
  }
  
  // Trigger initial poll immediately
  pollData();
  
  // Set up periodic interval
  setInterval(pollData, 12000);
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
      backgroundHTML = `<img src="${b.image}" alt="Banner" style="position:relative; width:100%; height:auto; display:block; z-index:0;" />`;
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
      <div class="home-banner-slide ${idx === 0 ? 'active' : ''}" onclick="${bannerClickFn}" style="position:relative; width:100%; height:auto; cursor:pointer; overflow:hidden;">
        ${backgroundHTML}
        ${b.hideText ? '' : `<div style="position:absolute; inset:0; background:linear-gradient(to right, rgba(10,10,20,0.92) 45%, rgba(10,10,20,0.2) 100%); padding:18px 16px; display:flex; flex-direction:column; justify-content:center; align-items:flex-start; z-index:1;">
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
        </div>`}
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

function renderPredictionsBanners() {
  const container = document.getElementById('predictions-banners-container');
  if (!container) return;
  const activeBanners = PREDICTIONS_BANNERS.filter(b => b.active);
  if (!activeBanners.length) {
    container.innerHTML = '<div style="padding:40px; text-align:center; color:var(--text-muted); font-size:0.8rem; font-weight:700;">No active predictions at the moment</div>';
    return;
  }
  container.innerHTML = activeBanners.map((b, idx) => {
    // ─── Media background ───────────────────────────────────
    let backgroundHTML = '';
    if (b.video) {
      backgroundHTML = `<video src="${b.video}" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; z-index:0;" muted autoplay loop playsinline></video>`;
    } else if (b.image) {
      backgroundHTML = `<img src="${b.image}" alt="Banner" style="position:relative; width:100%; height:auto; display:block; z-index:0;" />`;
    } else {
      const gradient = `linear-gradient(135deg, ${b.color || '#1a3a6c,#0d47a1'})`;
      backgroundHTML = `<div style="position:absolute; inset:0; background:${gradient}; display:flex; align-items:center; justify-content:center; font-size:3.5rem; z-index:0;">🔮</div>`;
    }

    const safeTitle    = (b.title || 'Prediction Match').replace(/\n/g, '<br>');
    const safeType     = (b.type || 'PREDICT & WIN').toUpperCase();
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
          return `<button onclick="${fn}" style="background:${bg}; border:none; color:#fff; padding:7px 16px; border-radius:8px; font-size:0.72rem; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; cursor:pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">${btn.label || 'Predict Now'}</button>`;
        }).join('') + `</div>`;
    } else {
      // Default explore button
      buttonsHTML = `<button onclick="${bannerClickFn}" style="background:linear-gradient(135deg, #7c3aed, #db2777); border:none; color:#fff; padding:7px 16px; border-radius:8px; font-size:0.72rem; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; cursor:pointer; margin-top:10px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">Predict Now</button>`;
    }

    return `
      <div class="predictions-banner-slide ${idx === 0 ? 'active' : ''}" onclick="${bannerClickFn}" style="position:relative; width:100%; height:auto; cursor:pointer; overflow:hidden;">
        ${backgroundHTML}
        ${b.hideText ? '' : `<div style="position:absolute; inset:0; background:linear-gradient(to right, rgba(10,10,20,0.92) 45%, rgba(10,10,20,0.2) 100%); padding:18px 16px; display:flex; flex-direction:column; justify-content:center; align-items:flex-start; z-index:1;">
          <div style="background:#8b5cf6; color:#fff; font-size:0.6rem; font-weight:900; text-transform:uppercase; letter-spacing:1px; padding:3px 8px; border-radius:4px; margin-bottom:8px;">
            ${safeType}
          </div>
          <div style="font-size:1.12rem; font-weight:900; color:#fff; line-height:1.2; text-transform:uppercase; text-shadow: 0 2px 8px rgba(0,0,0,0.6);">
            ${safeTitle}
          </div>
          <div style="font-size:1.25rem; font-weight:900; color:#eab308; margin-top:4px; text-shadow: 0 2px 8px rgba(0,0,0,0.5);">
            ${safeSubtitle}
          </div>
          ${buttonsHTML}
        </div>`}
      </div>
    `;
  }).join('') + `
    <div class="banner-dots" style="position:absolute; bottom:8px; left:50%; transform:translateX(-50%); display:flex; gap:6px; z-index:10;">
      ${activeBanners.map((_, idx) => `<div class="predictions-banner-dot ${idx === 0 ? 'active' : ''}" id="pbd-${idx}" style="width:${idx === 0 ? '12px' : '4px'}; height:4px; border-radius:2px; background:#fff; opacity:${idx === 0 ? '0.8' : '0.4'}; transition:all 0.3s ease;"></div>`).join('')}
    </div>
  `;
  state.predictionsBannerSlide = 0;
  startPredictionsBannerCarousel();
}

function startPredictionsBannerCarousel() {
  if (state.predictionsBannerTimer) clearInterval(state.predictionsBannerTimer);
  state.predictionsBannerTimer = setInterval(() => {
    const slides = document.querySelectorAll('.predictions-banner-slide');
    const dots   = document.querySelectorAll('.predictions-banner-dot');
    if (!slides.length) return;
    slides[state.predictionsBannerSlide].classList.remove('active');
    dots[state.predictionsBannerSlide]?.classList.remove('active');
    state.predictionsBannerSlide = (state.predictionsBannerSlide + 1) % slides.length;
    slides[state.predictionsBannerSlide].classList.add('active');
    dots[state.predictionsBannerSlide]?.classList.add('active');
  }, 4000);
}

function renderHomeCasinoGames() {
  const container = document.getElementById('casino-games-cards-grid');
  if (!container) return;
  const enabled = CASINO_SETTINGS?.gamesEnabled || {
    plane: true, mines: true, spin: true, dice: true, coinflip: true,
    limbo: true, tower: true, plinko: true, keno: true, color: true
  };
  const logos = CASINO_SETTINGS?.gamesLogos || {};

  const activeGames = CASINO_GAMES.filter(g => enabled[g.id] !== false);

  container.innerHTML = activeGames.map(g => {
    const liveBadge = g.live ? `<div style="position:absolute;top:6px;right:8px;background:#ef4444;color:#fff;font-size:0.55rem;font-weight:900;padding:2px 6px;border-radius:4px;">LIVE</div>` : '';
    
    // Check if custom logo upload exists
    let logoHTML = `<div style="font-size:2rem; margin-bottom:6px;">${g.emoji}</div>`;
    if (logos[g.id]) {
      logoHTML = `<div style="width:40px; height:40px; border-radius:10px; background-image:url(${logos[g.id]}); background-size:cover; background-position:center; margin-bottom:6px; box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`;
    }

    return `
      <div onclick="openCasinoApp('${g.id}')" style="background:${g.bg}; border-radius:14px; padding:14px; cursor:pointer; position:relative; overflow:hidden; border:1px solid rgba(255,255,255,0.02); box-shadow:0 4px 12px rgba(0,0,0,0.25);">
        ${logoHTML}
        <div style="font-size:0.85rem;font-weight:800;color:#fff;">${g.name}</div>
        <div style="font-size:0.65rem;color:rgba(255,255,255,0.6);margin-top:2px;">${g.subtitle}</div>
        ${liveBadge}
      </div>
    `;
  }).join('');
}

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
      const container = document.getElementById('app') || document.body;
      container.appendChild(overlay);
    }

    const descMsg = APP_SETTINGS.maintenanceReason || "We're upgrading Nexora Arena to deliver a faster, smoother and more secure gaming experience.";
    const status = APP_SETTINGS.maintenanceStatus || "IN PROGRESS";
    const percentage = APP_SETTINGS.maintenancePercentage !== undefined ? APP_SETTINGS.maintenancePercentage : 75;
    const task = APP_SETTINGS.maintenanceTask || "Optimizing Tournament Servers";
    const eta = APP_SETTINGS.maintenanceEta || "2 Hours (Estimated)";

    // Social icons renderer using detected symbols list and mapped URLs
    const symbols = APP_SETTINGS.detectedSymbols || ['discord', 'telegram', 'instagram'];
    const links = APP_SETTINGS.symbolLinks || {
      discord: APP_SETTINGS.maintenanceDiscord || '#',
      telegram: APP_SETTINGS.maintenanceTelegram || '#',
      instagram: APP_SETTINGS.maintenanceInstagram || '#'
    };
    
    const socialHTML = symbols.map(sym => {
      const url = links[sym] || '#';
      let svg = '';
      let bgColor = '';
      let glowColor = '';
      
      if (sym === 'instagram') {
        svg = `<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>`;
        bgColor = 'rgba(219, 39, 119, 0.1)';
        glowColor = '#db2777';
      } else if (sym === 'discord') {
        svg = `<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z"/></svg>`;
        bgColor = 'rgba(59, 130, 246, 0.1)';
        glowColor = '#3b82f6';
      } else if (sym === 'telegram') {
        svg = `<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.37.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>`;
        bgColor = 'rgba(6, 182, 212, 0.1)';
        glowColor = '#06b6d4';
      } else if (sym === 'youtube') {
        svg = `<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.519 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11C4.481 20.455 12 20.455 12 20.455s7.519 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`;
        bgColor = 'rgba(239, 68, 68, 0.1)';
        glowColor = '#ef4444';
      } else if (sym === 'whatsapp') {
        svg = `<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>`;
        bgColor = 'rgba(34, 197, 94, 0.1)';
        glowColor = '#22c55e';
      } else if (sym === 'twitter') {
        svg = `<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;
        bgColor = 'rgba(255, 255, 255, 0.05)';
        glowColor = '#ffffff';
      }
      
      return `
        <a href="${url}" target="_blank" style="width:38px; height:38px; border-radius:50%; background:${bgColor}; border:1px solid rgba(255,255,255,0.06); display:flex; align-items:center; justify-content:center; color:#fff; text-decoration:none; transition:all 0.3s ease; box-shadow:0 0 10px ${glowColor}25;">
          ${svg}
        </a>
      `;
    }).join('');

    // Toggle logic: If custom video/image banner is present, render fullscreen layout
    if (APP_SETTINGS.maintenanceMedia) {
      overlay.style.cssText = `
        position:absolute; inset:0; background:#000; z-index:10000;
        display:flex; flex-direction:column; align-items:center; justify-content:flex-end;
        padding:32px 24px; font-family:var(--font-base); overflow:hidden; color:#fff;
      `;

      const isVideo = APP_SETTINGS.maintenanceMediaType === 'video' || APP_SETTINGS.maintenanceMedia.startsWith('data:video/');
      let fullMediaHTML = '';
      if (isVideo) {
        fullMediaHTML = `<video src="${APP_SETTINGS.maintenanceMedia}" autoplay loop muted playsinline style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; z-index:1;"></video>`;
      } else {
        fullMediaHTML = `<img src="${APP_SETTINGS.maintenanceMedia}" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; z-index:1;" />`;
      }

      overlay.innerHTML = `
        ${fullMediaHTML}
        <!-- Gradient Shade Layer -->
        <div style="position:absolute; inset:0; background:linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.0) 70%, rgba(0,0,0,0.6) 100%); z-index:2;"></div>

        ${APP_SETTINGS.maintenanceShowText !== false ? `
        <!-- Floating Footer over Video -->
        <div style="position:relative; z-index:3; display:flex; flex-direction:column; align-items:center; gap:12px; width:100%; max-width:360px; margin-bottom: 8px;">
          <!-- Pulse Badge -->
          <div style="font-size: 0.65rem; font-weight:900; background:rgba(59,130,246,0.2); border:1.2px solid rgba(59,130,246,0.55); border-radius:12px; padding:4px 12px; color:#fff; text-transform:uppercase; letter-spacing:1px; text-shadow:0 0 8px #3b82f6; display:flex; align-items:center; gap:6px;">
            <span style="width:6px; height:6px; border-radius:50%; background:#10b981; display:inline-block;"></span>
            SYSTEM UPDATE: ${status} (${percentage}%)
          </div>

          <!-- Thank You Badge -->
          <div style="display:flex; align-items:center; gap:8px; background:rgba(236,72,153,0.15); border:1.2px solid rgba(236,72,153,0.35); border-radius:20px; padding:6px 16px; font-size:0.75rem; font-weight:800; color:#ff7ebb; text-shadow:0 0 10px rgba(236,72,153,0.4);">
            ❤️ Thank you for your patience
          </div>
          
          <!-- Social Badges Row -->
          <div style="display:flex; flex-direction:column; align-items:center; gap:6px; margin-top:8px;">
            <span style="font-size:0.6rem; font-weight:800; color:rgba(255,255,255,0.5); text-transform:uppercase; letter-spacing:0.8px;">Stay Connected</span>
            <div style="display:flex; gap:16px;">
              ${socialHTML}
            </div>
          </div>
        </div>
        ` : ''}
      `;
    } else {
      // DEFAULT HUD SCREEN: show gears, progress card, ETA boxes, whats getting better cards
      overlay.style.cssText = `
        position:absolute; inset:0; background:#080810; z-index:10000;
        display:flex; flex-direction:column; align-items:center; justify-content:flex-start;
        text-align:center; padding:32px 24px; font-family:var(--font-base); overflow-y:auto;
        color: #fff;
      `;

      overlay.innerHTML = `
        <style>
          @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes rotate-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
          @keyframes pulse-dot { 0%, 100% { opacity: 1; transform:scale(1); } 50% { opacity: 0.4; transform:scale(1.2); } }
          @keyframes stripes {
            from { background-position: 0 0; }
            to { background-position: 40px 0; }
          }
          .m-stripes-bar {
            background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
            background-size: 40px 40px;
            animation: stripes 1.5s linear infinite;
          }
          .better-badge {
            background: rgba(255,255,255,0.02);
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: 12px;
            padding: 12px 6px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 6px;
            transition: all 0.3s ease;
          }
          .better-badge:hover {
            border-color: #a855f7;
            background: rgba(168,85,247,0.05);
            box-shadow: 0 4px 12px rgba(168,85,247,0.15);
          }
        </style>

        <!-- App Header Logo -->
        <div style="display:flex; flex-direction:column; align-items:center; margin-bottom:16px;">
          <div style="font-size:1.15rem; font-weight:900; letter-spacing:1px; background:linear-gradient(135deg, #fff, #3b82f6); -webkit-background-clip:text; -webkit-text-fill-color:transparent; font-family:var(--font-heading);">
            NEXORA <span style="color:#a855f7;">ARENA</span>
          </div>
          <div style="font-size: 0.6rem; font-weight:800; background:rgba(59,130,246,0.12); border:1px solid rgba(59,130,246,0.25); border-radius:12px; padding:3px 10px; color:#3b82f6; text-transform:uppercase; letter-spacing:1px; margin-top:8px; display:inline-block;">
            ⚙️ System Update
          </div>
        </div>

        <!-- Main Title -->
        <h1 style="font-size:1.95rem; font-weight:900; line-height:1.2; text-transform:uppercase; letter-spacing:0.5px; background:linear-gradient(135deg, #fff 30%, #3b82f6 70%, #d946ef 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin:0 0 8px 0; font-family:var(--font-heading);">
          Under<br/>Maintenance
        </h1>

        <p style="color:var(--text-muted); font-size:0.82rem; max-width:320px; line-height:1.5; margin:0 auto 20px auto; padding:0 8px;">
          ${descMsg}
        </p>

        <!-- Gears Placeholder -->
        <div style="width:100%; max-width:360px; margin:0 auto;">
          <div class="m-gears-container" style="margin-bottom:24px; position:relative; width:100%; height:180px; display:flex; justify-content:center; align-items:center;">
            <div class="gear-bg-circle" style="position:absolute; width:150px; height:150px; border-radius:50%; border:1px dashed rgba(124,58,237,0.15); animation: rotate-reverse 12s linear infinite;"></div>
            <div style="font-size:4.5rem; animation: rotate 8s linear infinite; filter: drop-shadow(0 0 15px rgba(124,58,237,0.4)); z-index:2; position:relative;">⚙️</div>
            <div style="font-size:2.8rem; animation: rotate-reverse 6s linear infinite; filter: drop-shadow(0 0 10px rgba(0,242,254,0.4)); position:absolute; left:calc(50% + 35px); top:calc(50% - 25px); z-index:1;">⚙️</div>
          </div>
        </div>

        <!-- Live Status Card -->
        <div style="width:100%; max-width:360px; margin:0 auto 24px auto; background:linear-gradient(135deg, rgba(20,20,35,0.9), rgba(10,10,20,0.95)); border:1.5px solid rgba(255,255,255,0.06); border-radius:16px; padding:16px; box-sizing:border-box; box-shadow:0 8px 24px rgba(0,0,0,0.5);">
          <!-- Status Header -->
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <span style="font-size:0.75rem; font-weight:800; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:0.5px;">Maintenance Status</span>
            <span style="font-size:0.75rem; font-weight:800; color:#3b82f6; display:flex; align-items:center; gap:6px;">
              <span style="width:6px; height:6px; border-radius:50%; background:#3b82f6; display:inline-block; animation:pulse-dot 1.2s infinite;"></span>
              ${status}
            </span>
          </div>

          <!-- Progress Bar -->
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
            <div style="flex:1; height:18px; background:rgba(255,255,255,0.05); border-radius:9px; border:1px solid rgba(255,255,255,0.08); overflow:hidden; position:relative;">
              <div class="m-stripes-bar" style="width:${percentage}%; height:100%; background-color:#3b82f6; background-image:linear-gradient(90deg, #3b82f6, #8b5cf6, #d946ef); border-radius:9px; transition:width 0.8s ease;"></div>
            </div>
            <span style="font-size:0.9rem; font-weight:900; color:#fff; width:36px; text-align:right;">${percentage}%</span>
          </div>

          <!-- Meta Grid Info -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; border-top:1px solid rgba(255,255,255,0.06); padding-top:12px; text-align:left;">
            <!-- Current Task -->
            <div style="display:flex; gap:10px; align-items:center;">
              <div style="width:32px; height:32px; border-radius:8px; background:rgba(139,92,246,0.1); border:1px solid rgba(139,92,246,0.2); display:flex; align-items:center; justify-content:center; color:#8b5cf6; flex-shrink:0;">
                ⚙️
              </div>
              <div>
                <div style="font-size:0.6rem; color:rgba(255,255,255,0.4); text-transform:uppercase; font-weight:700;">Current Task</div>
                <div style="font-size:0.75rem; font-weight:800; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:110px;" title="${task}">${task}</div>
              </div>
            </div>
            <!-- ETA -->
            <div style="display:flex; gap:10px; align-items:center;">
              <div style="width:32px; height:32px; border-radius:8px; background:rgba(6,182,212,0.1); border:1px solid rgba(6,182,212,0.2); display:flex; align-items:center; justify-content:center; color:#06b6d4; flex-shrink:0;">
                🕒
              </div>
              <div>
                <div style="font-size:0.6rem; color:rgba(255,255,255,0.4); text-transform:uppercase; font-weight:700;">Estimated Time</div>
                <div style="font-size:0.75rem; font-weight:800; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:110px;" title="${eta}">${eta}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- What's Getting Better Section -->
        <div style="width:100%; max-width:360px; margin:0 auto 24px auto;">
          <div style="font-size:0.7rem; font-weight:800; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:1px; margin-bottom:12px;">What's Getting Better?</div>
          
          <div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:8px;">
            <div class="better-badge">
              <span style="font-size:1.3rem;">🚀</span>
              <span style="font-size:0.5rem; font-weight:700; color:rgba(255,255,255,0.5); line-height:1.1;">Matchmake</span>
            </div>
            <div class="better-badge" style="border-color: rgba(139,92,246,0.15); background:rgba(139,92,246,0.02);">
              <span style="font-size:1.3rem; filter:drop-shadow(0 0 6px #8b5cf6);">🏆</span>
              <span style="font-size:0.5rem; font-weight:700; color:rgba(255,255,255,0.5); line-height:1.1;">Tournaments</span>
            </div>
            <div class="better-badge">
              <span style="font-size:1.3rem;">💳</span>
              <span style="font-size:0.5rem; font-weight:700; color:rgba(255,255,255,0.5); line-height:1.1;">Wallet Opt</span>
            </div>
            <div class="better-badge" style="border-color: rgba(16,185,129,0.15); background:rgba(16,185,129,0.02);">
              <span style="font-size:1.3rem; filter:drop-shadow(0 0 6px #10b981);">🔒</span>
              <span style="font-size:0.5rem; font-weight:700; color:rgba(255,255,255,0.5); line-height:1.1;">Security</span>
            </div>
            <div class="better-badge">
              <span style="font-size:1.3rem;">⚡</span>
              <span style="font-size:0.5rem; font-weight:700; color:rgba(255,255,255,0.5); line-height:1.1;">Speed</span>
            </div>
          </div>
        </div>

        <!-- Footer Block -->
        <div style="margin-top:auto; padding-top:20px; display:flex; flex-direction:column; align-items:center; gap:16px;">
          <div style="display:flex; align-items:center; gap:8px; background:rgba(236,72,153,0.08); border:1px solid rgba(236,72,153,0.15); border-radius:20px; padding:6px 16px; font-size:0.75rem; font-weight:700; color:#ec4899;">
            ❤️ Thank you for your patience
          </div>
          
          <!-- Social Medias -->
          <div style="display:flex; flex-direction:column; align-items:center; gap:6px;">
            <span style="font-size:0.6rem; font-weight:800; color:rgba(255,255,255,0.3); text-transform:uppercase; letter-spacing:0.8px;">Stay Connected</span>
            <div style="display:flex; gap:16px;">
              ${socialHTML}
            </div>
          </div>
        </div>
      `;
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
    syncAvatarDOM();
    checkPendingQrPayment();
  }

  setTimeout(() => {
    if (state.loggedIn) {
      if (state.user && state.user.status === 'banned') {
        navigate('banned');
      } else {
        navigate('home');
      }
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
      tournaments: 0,
      spent: 0,
      status: 'Active',
      verificationStatus: 'Verified',
      joined: new Date().toLocaleDateString('en-IN'),
      balance: 0
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

    state.user = {
      ...pendingUserPayload,
      id: pendingUserPayload.id || 'GA10003',
      walletBalance: pendingUserPayload.balance !== undefined ? pendingUserPayload.balance : 0,
      kycStatus: pendingUserPayload.kycStatus || 'unverified',
      kycDetails: pendingUserPayload.kycDetails || {}
    };

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
    balance: 0,
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
        state.user = {
          ...created,
          walletBalance: created.balance !== undefined ? created.balance : 0
        };
      }
    } catch(e) {
      console.error(e);
      state.user = {
        name: pendingUserPayload.name,
        id: 'NKAJ890',
        walletBalance: 0,
        kycStatus: 'unverified',
        kycDetails: {}
      };
    }
  } else if (pendingUserPayload) {
    state.user = {
      ...pendingUserPayload,
      walletBalance: pendingUserPayload.balance !== undefined ? pendingUserPayload.balance : 0
    };
    
    // Sync settings
    if (pendingUserPayload.theme) {
      toggleDarkMode(pendingUserPayload.theme === 'dark');
    }
    if (pendingUserPayload.language) {
      applyLanguage(pendingUserPayload.language);
    }
  }

  if (state.user && state.user.status === 'banned') {
    showToast('Your account has been suspended. Please contact support.', 'error');
    state.loggedIn = true;
    localStorage.setItem('nexora_user', JSON.stringify(state.user));
    navigate('banned');
    return;
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
  localStorage.removeItem('nexora_user');
  window.location.reload();
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
  // Update all wallet values
  document.querySelectorAll('.wallet-val').forEach(valEl => {
    valEl.textContent = `₹${(state.user.walletBalance || 0).toLocaleString('en-IN')}`;
  });
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
  if (tab === 'add') {
    checkPendingQrPayment();
  }
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

  const selectedPM = document.querySelector('.pm-option.selected .pm-name')?.textContent || '';
  if (selectedPM.includes('QR Code')) {
    document.getElementById('qr-pay-amount').value = amount;
    document.getElementById('qr-pay-utr').value = '';
    
    try {
      const res = await fetch(`${SERVER}/api/qr-payment/settings`);
      if (res.ok) {
        const settings = await res.json();
        const qrImg = document.getElementById('qr-pay-image');
        const qrUpi = document.getElementById('qr-pay-upi-id');
        if (qrImg) qrImg.src = settings.qrImage || 'assets/qr_payment_default.jpg';
        if (qrUpi) qrUpi.textContent = settings.upiId || '9689901416.wallet@phonepe';
      }
    } catch(e) {
      console.error('Failed to load QR settings:', e);
    }
    
    document.getElementById('modal-manual-qr-payment').style.display = 'flex';
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
window.renderProfile = async function() {
  const u = state.user;
  if (!u) return;

  // Name, ID, Email, Phone, Joined
  const nameEl = document.getElementById('profile-name');
  if (nameEl) nameEl.textContent = u.name || 'NexoraPlayer';
  
  const idEl = document.getElementById('profile-user-id');
  if (idEl) idEl.textContent = `ID: ${u.id}`;
  
  const emailEl = document.getElementById('profile-email-val');
  if (emailEl) emailEl.textContent = u.email || 'N/A';
  
  const phoneEl = document.getElementById('profile-phone-val');
  if (phoneEl) phoneEl.textContent = u.phone || 'N/A';
  
  const joinedEl = document.getElementById('profile-joined-val');
  if (joinedEl) joinedEl.textContent = u.joined || 'N/A';

  // KYC Badge
  const kycEl = document.getElementById('profile-kyc-status-badge');
  if (kycEl) {
    const kStatus = (u.kycStatus || 'unverified').toLowerCase();
    kycEl.textContent = kStatus;
    if (kStatus === 'approved' || kStatus === 'verified') {
      kycEl.style.background = 'rgba(16,185,129,0.12)';
      kycEl.style.color = '#10b981';
      kycEl.style.border = '1px solid rgba(16,185,129,0.3)';
    } else if (kStatus === 'pending') {
      kycEl.style.background = 'rgba(234,179,8,0.12)';
      kycEl.style.color = '#eab308';
      kycEl.style.border = '1px solid rgba(234,179,8,0.3)';
    } else {
      kycEl.style.background = 'rgba(239,68,68,0.12)';
      kycEl.style.color = '#ef4444';
      kycEl.style.border = '1px solid rgba(239,68,68,0.3)';
    }
  }

  // Avatar Photo display
  syncAvatarDOM();

  // Calculate live stats dynamically
  try {
    const [tournamentsRes, predsRes] = await Promise.all([
      fetch(`${SERVER}/api/tournaments`),
      fetch(`${SERVER}/api/predictions/predictions`)
    ]);

    let tJoinedCount = 0;
    if (tournamentsRes.ok) {
      const allTournaments = await tournamentsRes.json();
      tJoinedCount = allTournaments.filter(t => t.joinedUsers && t.joinedUsers.some(ju => ju.userId === u.id)).length;
    }

    let winsCount = 0;
    let totalPreds = 0;
    let winRate = '0%';
    if (predsRes.ok) {
      const allPreds = await predsRes.json();
      const myPreds = allPreds.filter(p => p.userId === u.id);
      totalPreds = myPreds.length;
      winsCount = myPreds.filter(p => p.status === 'correct').length;
      winRate = totalPreds > 0 ? `${Math.round((winsCount / totalPreds) * 100)}%` : '0%';
    }

    const statTournaments = document.getElementById('profile-stat-tournaments');
    const statWins = document.getElementById('profile-stat-wins');
    const statWinRate = document.getElementById('profile-stat-winrate');
    
    if (statTournaments) statTournaments.textContent = tJoinedCount || u.tournaments || 0;
    if (statWins) statWins.textContent = winsCount;
    if (statWinRate) statWinRate.textContent = winRate;

  } catch (e) {
    console.error('Failed to load profile stats:', e);
  }

  // Fetch Live Prediction Ranking
  try {
    const leaderboardRes = await fetch(`${SERVER}/api/predictions/leaderboard`);
    if (leaderboardRes.ok) {
      const lb = await leaderboardRes.json();
      const myRankIdx = lb.allTime.findIndex(user => user.id === u.id);
      const rankValEl = document.getElementById('profile-live-rank');
      if (rankValEl) {
        rankValEl.textContent = myRankIdx !== -1 ? `#${myRankIdx + 1}` : '#--';
      }
    }
  } catch (e) {
    console.error('Failed to load live ranking:', e);
  }
};

window.syncAvatarDOM = function() {
  const u = state.user;
  if (!u) return;

  // Home Header Avatar
  const homeImg = document.getElementById('home-avatar-img');
  const homeFallback = document.getElementById('home-avatar-fallback');
  if (homeImg && homeFallback) {
    if (u.avatar) {
      homeImg.src = u.avatar;
      homeImg.style.display = 'block';
      homeFallback.style.display = 'none';
    } else {
      homeImg.src = '';
      homeImg.style.display = 'none';
      homeFallback.textContent = (u.name || 'N').charAt(0).toUpperCase();
      homeFallback.style.display = 'block';
    }
  }

  // Profile Page Avatar
  const profileImg = document.getElementById('profile-avatar-img');
  const profileFallback = document.getElementById('profile-avatar-fallback');
  if (profileImg && profileFallback) {
    if (u.avatar) {
      profileImg.src = u.avatar;
      profileImg.style.display = 'block';
      profileFallback.style.display = 'none';
    } else {
      profileImg.src = '';
      profileImg.style.display = 'none';
      profileFallback.textContent = (u.name || 'N').charAt(0).toUpperCase();
      profileFallback.style.display = 'block';
    }
  }
};

window.handleProfileAvatarChange = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function(e) {
    const base64Data = e.target.result;
    
    // Update local state first for instant visual feedback
    state.user.avatar = base64Data;
    localStorage.setItem('nexora_user', JSON.stringify(state.user));
    
    // Update DOM instantly
    syncAvatarDOM();

    // Save to server
    try {
      const res = await fetch(`${SERVER}/api/users/${state.user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: base64Data })
      });
      if (res.ok) {
        showToast('Profile photo updated successfully! 📸✨', 'success');
      } else {
        showToast('Failed to save profile photo to server.', 'error');
      }
    } catch(err) {
      console.error(err);
      showToast('Network error while saving photo.', 'error');
    }
  };
  reader.readAsDataURL(file);
};

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
      PRED_SETTINGS = state.predictionSettings || {};
      renderPredictionsHeroBanner();
    }
    const res = await fetch(`${SERVER}/api/predictions/matches`);
    if (res.ok) {
      state.predictionMatches = await res.json();
    }

    if (state.user && state.user.id) {
      const predsRes = await fetch(`${SERVER}/api/predictions/predictions?userId=${state.user.id}`);
      if (predsRes.ok) {
        state.userPredictions = await predsRes.json();
      }
    } else {
      state.userPredictions = [];
    }

    renderPredictionsHeroBanner();
    renderPredictionsMatches();
  } catch(e) {
    console.error('Failed to load prediction matches:', e);
  }
};

window.renderPredictionsHeroBanner = function() {
  const container = document.getElementById('predictions-hero-banner-container');
  if (!container) return;
  const title = PRED_SETTINGS.bannerTitle || 'REAL PREDICTIONS\nREAL MONEY';
  const subtitle = PRED_SETTINGS.bannerSubtitle || 'Trade on matches. Win real cash instantly.';
  const bgImg = PRED_SETTINGS.bannerImage 
    ? `linear-gradient(to bottom, rgba(11,11,22,0.1), #0b0b16), url(${PRED_SETTINGS.bannerImage})`
    : `linear-gradient(to bottom, rgba(11,11,22,0.4), #0b0b16), radial-gradient(circle at 80% 20%, #1e1b4b, #0b0b16)`;

  const formattedTitle = title.replace(/\n/g, '<br>');

  container.innerHTML = `
    <div style="padding:24px 16px 20px; background:${bgImg} no-repeat center/cover; position:relative; min-height:220px; display:flex; flex-direction:column; justify-content:flex-end; border-bottom:1px solid rgba(255,255,255,0.03);">
      <div style="z-index:2; position:relative;">
        <h1 style="font-family:var(--font-heading); font-size:1.8rem; font-weight:900; line-height:1.2; text-transform:uppercase; margin:0 0 4px; color:#fff;">
          ${formattedTitle}
        </h1>
        <p style="font-size:0.85rem; color:rgba(255,255,255,0.85); margin:0 0 16px; font-weight:600;">
          ${subtitle}
        </p>
        
        <!-- Trust Badges Row -->
        <div style="display:flex; justify-content:space-between; gap:8px;">
          <div style="flex:1; display:flex; flex-direction:column; align-items:center; text-align:center; background:rgba(0,0,0,0.55); backdrop-filter:blur(4px); border:1px solid rgba(255,255,255,0.05); border-radius:10px; padding:8px 4px;">
            <span style="font-size:1.1rem; margin-bottom:4px;">📈</span>
            <span style="font-size:0.65rem; font-weight:800; color:#fff;">Real Cash Trading</span>
            <span style="font-size:0.55rem; color:rgba(255,255,255,0.5); margin-top:2px;">Trade with real money</span>
          </div>
          <div style="flex:1; display:flex; flex-direction:column; align-items:center; text-align:center; background:rgba(0,0,0,0.55); backdrop-filter:blur(4px); border:1px solid rgba(255,255,255,0.05); border-radius:10px; padding:8px 4px;">
            <span style="font-size:1.1rem; margin-bottom:4px;">🛡️</span>
            <span style="font-size:0.65rem; font-weight:800; color:#fff;">Instant Payout</span>
            <span style="font-size:0.55rem; color:rgba(255,255,255,0.5); margin-top:2px;">Withdraw your winnings</span>
          </div>
          <div style="flex:1; display:flex; flex-direction:column; align-items:center; text-align:center; background:rgba(0,0,0,0.55); backdrop-filter:blur(4px); border:1px solid rgba(255,255,255,0.05); border-radius:10px; padding:8px 4px;">
            <span style="font-size:1.1rem; margin-bottom:4px;">🔒</span>
            <span style="font-size:0.65rem; font-weight:800; color:#fff;">Secure &amp; Fair</span>
            <span style="font-size:0.55rem; color:rgba(255,255,255,0.5); margin-top:2px;">100% Secure Platform</span>
          </div>
        </div>
      </div>
      <div style="position:absolute; inset:0; background:linear-gradient(to bottom, transparent 30%, #0b0b16 100%); z-index:1;"></div>
    </div>
  `;
};

let predCategoryFilter = 'all';
window.filterPredictionCategory = function(category, btn) {
  predCategoryFilter = category;
  document.querySelectorAll('#page-predictions .cat-pill').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderPredictionsMatches();
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

  // Dynamically update the count badge on the live pill
  const liveCount = (state.predictionMatches || []).filter(m => m.status === 'live').length;
  const livePill = document.getElementById('pill-pred-live');
  if (livePill) {
    livePill.innerHTML = `<span class="live-dot-pulse"></span><span>Live (${liveCount})</span>`;
  }

  let list = state.predictionMatches || [];
  
  // Apply Category/Status filter
  if (predCategoryFilter === 'live') {
    list = list.filter(m => m.status === 'live');
  } else if (predCategoryFilter === 'upcoming') {
    list = list.filter(m => m.status === 'upcoming');
  } else if (predCategoryFilter === 'Cricket') {
    list = list.filter(m => m.game === 'Cricket');
  } else if (predCategoryFilter === 'Football') {
    list = list.filter(m => m.game === 'Football');
  } else if (predCategoryFilter === 'Esports') {
    list = list.filter(m => m.game !== 'Cricket' && m.game !== 'Football');
  } else {
    // 'all' shows both live and upcoming, excludes completed by default on home
    list = list.filter(m => m.status !== 'completed');
  }

  if (list.length === 0) {
    listContainer.innerHTML = `<div style="text-align:center;padding:48px 20px;color:rgba(255,255,255,0.3);">
      <div style="font-size:2.5rem;margin-bottom:12px;">📡</div>
      <div style="font-size:0.85rem;font-weight:700;color:rgba(255,255,255,0.4);">No matches found</div>
      <div style="font-size:0.72rem;color:rgba(255,255,255,0.2);margin-top:4px;">Check back soon!</div>
    </div>`;
    return;
  }

  listContainer.innerHTML = list.map((m, idx) => {
    const isLive = m.status === 'live';
    const isCompleted = m.status === 'completed';
    const t1p = m.team1?.winProbability || 50;
    const t2p = m.team2?.winProbability || 50;

    const volumeStr = '₹' + ((m.prizePool * 8.5) / 100000).toFixed(2) + 'L';

    // Timer or Date display
    let timerHTML = '';
    if (isLive) {
      timerHTML = `<span style="color:#ef4444; font-weight:800; display:flex; align-items:center; gap:4px;"><span class="live-dot-pulse" style="width:6px; height:6px; background:#ef4444; border-radius:50%; display:inline-block; animation:pulse-live 1.5s infinite;"></span> Live</span>`;
    } else {
      timerHTML = `<span style="color:#10b981; font-weight:700;">${m.time || 'Upcoming'}</span>`;
    }

    // Check if the user has already predicted on this match
    const myPreds = (state.userPredictions || []).filter(p => p.matchId === m.id);
    const myPredT1 = myPreds.find(p => p.selection === m.team1.name);
    const myPredT2 = myPreds.find(p => p.selection === m.team2.name);

    let t1BtnHTML = '';
    let t2BtnHTML = '';

    if (myPreds.length > 0) {
      if (myPredT1) {
        t1BtnHTML = `
          <button disabled style="background:#15803d; border:1px solid #10b981; border-radius:8px; padding:10px; color:#fff; cursor:not-allowed; font-weight:800; font-size:0.72rem; display:flex; flex-direction:column; align-items:center; gap:2px; opacity:1; width:100%;">
            <span style="font-size:0.58rem; opacity:0.9;">✓ ${m.team1.name}</span>
            <span style="font-size:0.78rem; font-weight:900;">₹ 1.85 (PLACED)</span>
          </button>
        `;
        t2BtnHTML = `
          <button disabled style="background:#374151; border:none; border-radius:8px; padding:10px; color:rgba(255,255,255,0.3); cursor:not-allowed; font-weight:800; font-size:0.72rem; display:flex; flex-direction:column; align-items:center; gap:2px; opacity:0.3; width:100%;">
            <span style="font-size:0.58rem;">${m.team2.name}</span>
            <span style="font-size:0.78rem; font-weight:900;">₹ 2.05</span>
          </button>
        `;
      } else if (myPredT2) {
        t1BtnHTML = `
          <button disabled style="background:#374151; border:none; border-radius:8px; padding:10px; color:rgba(255,255,255,0.3); cursor:not-allowed; font-weight:800; font-size:0.72rem; display:flex; flex-direction:column; align-items:center; gap:2px; opacity:0.3; width:100%;">
            <span style="font-size:0.58rem;">${m.team1.name}</span>
            <span style="font-size:0.78rem; font-weight:900;">₹ 1.85</span>
          </button>
        `;
        t2BtnHTML = `
          <button disabled style="background:#991b1b; border:1px solid #f87171; border-radius:8px; padding:10px; color:#fff; cursor:not-allowed; font-weight:800; font-size:0.72rem; display:flex; flex-direction:column; align-items:center; gap:2px; opacity:1; width:100%;">
            <span style="font-size:0.58rem; opacity:0.9;">✓ ${m.team2.name}</span>
            <span style="font-size:0.78rem; font-weight:900;">₹ 2.05 (PLACED)</span>
          </button>
        `;
      } else {
        t1BtnHTML = `
          <button disabled style="background:#374151; border:none; border-radius:8px; padding:10px; color:rgba(255,255,255,0.4); cursor:not-allowed; font-weight:800; font-size:0.72rem; display:flex; flex-direction:column; align-items:center; gap:2px; opacity:0.5; width:100%;">
            <span style="font-size:0.58rem;">${m.team1.name}</span>
            <span style="font-size:0.78rem; font-weight:900;">₹ 1.85</span>
          </button>
        `;
        t2BtnHTML = `
          <button disabled style="background:#374151; border:none; border-radius:8px; padding:10px; color:rgba(255,255,255,0.4); cursor:not-allowed; font-weight:800; font-size:0.72rem; display:flex; flex-direction:column; align-items:center; gap:2px; opacity:0.5; width:100%;">
            <span style="font-size:0.58rem;">${m.team2.name}</span>
            <span style="font-size:0.78rem; font-weight:900;">₹ 2.05</span>
          </button>
        `;
      }
    } else {
      t1BtnHTML = `
        <button onclick="event.stopPropagation(); window.openPredictionsTradePage('${m.id}', 't1')" style="background:#15803d; border:none; border-radius:8px; padding:10px; color:#fff; cursor:pointer; font-weight:800; font-size:0.8rem; display:flex; flex-direction:column; align-items:center; gap:2px; box-shadow:0 4px 12px rgba(22,163,74,0.15); width:100%;">
          <span style="font-size:0.65rem; opacity:0.85;">${m.team1.name}</span>
          <span style="font-size:0.85rem; font-weight:900;">₹ 1.85</span>
        </button>
      `;
      t2BtnHTML = `
        <button onclick="event.stopPropagation(); window.openPredictionsTradePage('${m.id}', 't2')" style="background:#991b1b; border:none; border-radius:8px; padding:10px; color:#fff; cursor:pointer; font-weight:800; font-size:0.8rem; display:flex; flex-direction:column; align-items:center; gap:2px; box-shadow:0 4px 12px rgba(220,38,38,0.15); width:100%;">
          <span style="font-size:0.65rem; opacity:0.85;">${m.team2.name}</span>
          <span style="font-size:0.85rem; font-weight:900;">₹ 2.05</span>
        </button>
      `;
    }

    return `
      <div onclick="openPredictionMatchDetails('${m.id}')" class="pred-match-card" style="background:linear-gradient(135deg, rgba(255,255,255,0.01) 0%, rgba(255,255,255,0.03) 100%); border:1px solid rgba(255,255,255,0.06); border-radius:16px; padding:16px; margin-bottom:12px; cursor:pointer;">
        <!-- Card Top Bar -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="background:${isLive ? 'rgba(239,68,68,0.12)' : 'rgba(59,130,246,0.12)'}; color:${isLive ? '#ef4444' : '#3b82f6'}; border:1px solid ${isLive ? 'rgba(239,68,68,0.3)' : 'rgba(59,130,246,0.3)'}; font-size:0.6rem; font-weight:900; padding:2px 8px; border-radius:30px; text-transform:uppercase; letter-spacing:0.5px;">
              ${m.game || 'Cricket'}
            </span>
            <span style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">${m.gameDetails || 'IPL 2024'}</span>
          </div>
          <div style="display:flex; align-items:center; gap:6px;">
            ${timerHTML}
          </div>
        </div>

        <!-- Team Matchup Row -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin:16px 0;">
          <!-- Team 1 -->
          <div style="display:flex; flex-direction:column; align-items:center; width:35%;">
            <img src="${m.team1?.logo || 'assets/valorant_thumb.jpg'}" style="width:48px; height:48px; border-radius:50%; object-fit:cover; border:2px solid rgba(255,255,255,0.05); box-shadow:0 4px 10px rgba(0,0,0,0.3);" onerror="this.src='assets/valorant_thumb.jpg'"/>
            <div style="font-size:0.78rem; font-weight:800; color:#fff; margin-top:6px; text-align:center; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; width:100%;">${m.team1?.name || 'Team 1'}</div>
          </div>
          
          <!-- VS Center -->
          <div style="display:flex; flex-direction:column; align-items:center; gap:4px; width:30%;">
            <div style="font-size:1rem; font-weight:900; color:rgba(255,255,255,0.25); letter-spacing:1px;">VS</div>
            <div style="font-size:0.65rem; color:rgba(255,255,255,0.4); text-align:center; font-weight:600;">Who will win?</div>
          </div>
          
          <!-- Team 2 -->
          <div style="display:flex; flex-direction:column; align-items:center; width:35%;">
            <img src="${m.team2?.logo || 'assets/valorant_thumb.jpg'}" style="width:48px; height:48px; border-radius:50%; object-fit:cover; border:2px solid rgba(255,255,255,0.05); box-shadow:0 4px 10px rgba(0,0,0,0.3);" onerror="this.src='assets/valorant_thumb.jpg'"/>
            <div style="font-size:0.78rem; font-weight:800; color:#fff; margin-top:6px; text-align:center; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; width:100%;">${m.team2?.name || 'Team 2'}</div>
          </div>
        </div>

        <!-- Action / Odds Row -->
        <div style="display:grid; grid-template-columns: 1.2fr 1fr 1.2fr; gap:8px; align-items:center; border-top:1px solid rgba(255,255,255,0.04); padding-top:12px; margin-top:12px;">
          <!-- Left Team Odds Button -->
          <div style="width:100%;">${t1BtnHTML}</div>

          <!-- Win Chance Column -->
          <div style="display:flex; flex-direction:column; align-items:center; text-align:center;">
            <span style="font-size:0.55rem; color:rgba(255,255,255,0.4); text-transform:uppercase; font-weight:700;">Win Chance</span>
            <span style="font-size:0.62rem; font-weight:800; color:#fff; margin-top:2px;">
              <span style="color:#10b981;">${t1p}%</span> <span style="color:rgba(255,255,255,0.25);">|</span> <span style="color:#ef4444;">${t2p}%</span>
            </span>
          </div>

          <!-- Right Team Odds Button -->
          <div style="width:100%;">${t2BtnHTML}</div>
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
      
      if (state.user && state.user.id) {
        const predsRes = await fetch(`${SERVER}/api/predictions/predictions?userId=${state.user.id}`);
        if (predsRes.ok) {
          state.userPredictions = await predsRes.json();
        }
      }

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

  const gameBadge = document.getElementById('pmd-game-badge');
  if (gameBadge) gameBadge.textContent = m.game || '';
  
  const myPreds = (state.userPredictions || []).filter(p => p.matchId === m.id);
  const myPredT1 = myPreds.find(p => p.selection === m.team1.name);
  const myPredT2 = myPreds.find(p => p.selection === m.team2.name);

  // Render Markets list (Redesigned as Market Odds + Match Info + Past Encounters)
  const marketsContainer = document.getElementById('pmd-markets-list');
  if (marketsContainer) {
    const isLive = m.status === 'live';
    const isCompleted = m.status === 'completed';
    const t1p = m.team1?.winProbability || 50;
    const t2p = m.team2?.winProbability || 50;

    let t1RowHTML = '';
    let t2RowHTML = '';

    if (myPreds.length > 0) {
      if (myPredT1) {
        t1RowHTML = `
          <div style="background:rgba(22,163,74,0.08); border:1px solid #16a34a; border-radius:8px; padding:12px; display:flex; align-items:center; justify-content:space-between; cursor:not-allowed;">
            <div style="display:flex; align-items:center; gap:8px;">
              <img src="${m.team1.logo || 'assets/valorant_thumb.jpg'}" style="width:24px; height:24px; border-radius:50%; object-fit:cover;" onerror="this.src='assets/valorant_thumb.jpg'"/>
              <span style="font-size:0.8rem; font-weight:800; color:#fff;">✓ ${m.team1.name} <span style="font-size:0.7rem; color:#10b981; font-weight:600;">(Selected)</span></span>
            </div>
            <span style="background:rgba(16,185,129,0.15); color:#10b981; border:1px solid rgba(16,185,129,0.3); border-radius:6px; padding:4px 10px; font-size:0.78rem; font-weight:900;">
              ₹ 1.85 (PLACED)
            </span>
          </div>
        `;
        t2RowHTML = `
          <div style="background:rgba(255,255,255,0.01); border:1px solid rgba(255,255,255,0.03); border-radius:8px; padding:12px; display:flex; align-items:center; justify-content:space-between; cursor:not-allowed; opacity:0.3;">
            <div style="display:flex; align-items:center; gap:8px;">
              <img src="${m.team2.logo || 'assets/valorant_thumb.jpg'}" style="width:24px; height:24px; border-radius:50%; object-fit:cover;" onerror="this.src='assets/valorant_thumb.jpg'"/>
              <span style="font-size:0.8rem; font-weight:800; color:#fff;">${m.team2.name}</span>
            </div>
            <span style="background:rgba(239,68,68,0.15); color:#ef4444; border:1px solid rgba(239,68,68,0.3); border-radius:6px; padding:4px 10px; font-size:0.78rem; font-weight:900;">
              ₹ 2.05
            </span>
          </div>
        `;
      } else if (myPredT2) {
        t1RowHTML = `
          <div style="background:rgba(255,255,255,0.01); border:1px solid rgba(255,255,255,0.03); border-radius:8px; padding:12px; display:flex; align-items:center; justify-content:space-between; cursor:not-allowed; opacity:0.3;">
            <div style="display:flex; align-items:center; gap:8px;">
              <img src="${m.team1.logo || 'assets/valorant_thumb.jpg'}" style="width:24px; height:24px; border-radius:50%; object-fit:cover;" onerror="this.src='assets/valorant_thumb.jpg'"/>
              <span style="font-size:0.8rem; font-weight:800; color:#fff;">${m.team1.name}</span>
            </div>
            <span style="background:rgba(16,185,129,0.15); color:#10b981; border:1px solid rgba(16,185,129,0.3); border-radius:6px; padding:4px 10px; font-size:0.78rem; font-weight:900;">
              ₹ 1.85
            </span>
          </div>
        `;
        t2RowHTML = `
          <div style="background:rgba(220,38,38,0.08); border:1px solid #dc2626; border-radius:8px; padding:12px; display:flex; align-items:center; justify-content:space-between; cursor:not-allowed;">
            <div style="display:flex; align-items:center; gap:8px;">
              <img src="${m.team2.logo || 'assets/valorant_thumb.jpg'}" style="width:24px; height:24px; border-radius:50%; object-fit:cover;" onerror="this.src='assets/valorant_thumb.jpg'"/>
              <span style="font-size:0.8rem; font-weight:800; color:#fff;">✓ ${m.team2.name} <span style="font-size:0.7rem; color:#ef4444; font-weight:600;">(Selected)</span></span>
            </div>
            <span style="background:rgba(239,68,68,0.15); color:#ef4444; border:1px solid rgba(239,68,68,0.3); border-radius:6px; padding:4px 10px; font-size:0.78rem; font-weight:900;">
              ₹ 2.05 (PLACED)
            </span>
          </div>
        `;
      } else {
        t1RowHTML = `
          <div style="background:rgba(255,255,255,0.01); border:1px solid rgba(255,255,255,0.03); border-radius:8px; padding:12px; display:flex; align-items:center; justify-content:space-between; cursor:not-allowed; opacity:0.5;">
            <div style="display:flex; align-items:center; gap:8px;">
              <img src="${m.team1.logo || 'assets/valorant_thumb.jpg'}" style="width:24px; height:24px; border-radius:50%; object-fit:cover;" onerror="this.src='assets/valorant_thumb.jpg'"/>
              <span style="font-size:0.8rem; font-weight:800; color:#fff;">${m.team1.name}</span>
            </div>
            <span style="font-size:0.78rem; font-weight:900; color:var(--text-muted);">₹ 1.85</span>
          </div>
        `;
        t2RowHTML = `
          <div style="background:rgba(255,255,255,0.01); border:1px solid rgba(255,255,255,0.03); border-radius:8px; padding:12px; display:flex; align-items:center; justify-content:space-between; cursor:not-allowed; opacity:0.5;">
            <div style="display:flex; align-items:center; gap:8px;">
              <img src="${m.team2.logo || 'assets/valorant_thumb.jpg'}" style="width:24px; height:24px; border-radius:50%; object-fit:cover;" onerror="this.src='assets/valorant_thumb.jpg'"/>
              <span style="font-size:0.8rem; font-weight:800; color:#fff;">${m.team2.name}</span>
            </div>
            <span style="font-size:0.78rem; font-weight:900; color:var(--text-muted);">₹ 2.05</span>
          </div>
        `;
      }
    } else {
      t1RowHTML = `
        <div onclick="window.openPredictionsTradePage('${m.id}', 't1')" style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:8px; padding:12px; display:flex; align-items:center; justify-content:space-between; cursor:pointer;">
          <div style="display:flex; align-items:center; gap:8px;">
            <img src="${m.team1.logo || 'assets/valorant_thumb.jpg'}" style="width:24px; height:24px; border-radius:50%; object-fit:cover;" onerror="this.src='assets/valorant_thumb.jpg'"/>
            <span style="font-size:0.8rem; font-weight:800; color:#fff;">${m.team1.name} <span style="font-size:0.7rem; color:var(--text-muted); font-weight:600;">(Chennai Super Kings)</span></span>
          </div>
          <span style="background:rgba(16,185,129,0.15); color:#10b981; border:1px solid rgba(16,185,129,0.3); border-radius:6px; padding:4px 10px; font-size:0.78rem; font-weight:900; display:flex; align-items:center; gap:4px;">
            ₹ 1.85 <span style="font-size:0.6rem;">▲</span>
          </span>
        </div>
      `;
      t2RowHTML = `
        <div onclick="window.openPredictionsTradePage('${m.id}', 't2')" style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:8px; padding:12px; display:flex; align-items:center; justify-content:space-between; cursor:pointer;">
          <div style="display:flex; align-items:center; gap:8px;">
            <img src="${m.team2.logo || 'assets/valorant_thumb.jpg'}" style="width:24px; height:24px; border-radius:50%; object-fit:cover;" onerror="this.src='assets/valorant_thumb.jpg'"/>
            <span style="font-size:0.8rem; font-weight:800; color:#fff;">${m.team2.name} <span style="font-size:0.7rem; color:var(--text-muted); font-weight:600;">(Mumbai Indians)</span></span>
          </div>
          <span style="background:rgba(239,68,68,0.15); color:#ef4444; border:1px solid rgba(239,68,68,0.3); border-radius:6px; padding:4px 10px; font-size:0.78rem; font-weight:900; display:flex; align-items:center; gap:4px;">
            ₹ 2.05 <span style="font-size:0.6rem;">▼</span>
          </span>
        </div>
      `;
    }

    marketsContainer.innerHTML = `
      <!-- MARKET ODDS -->
      <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:12px; padding:16px; margin-bottom:16px;">
        <div style="font-size:0.75rem; font-weight:800; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:12px;">Market Odds</div>
        
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${t1RowHTML}
          ${t2RowHTML}
        </div>
        <div style="font-size:0.6rem; color:rgba(255,255,255,0.35); margin-top:10px; font-weight:600; display:flex; align-items:center; gap:4px;">
          <span>ℹ️</span> Odds are subject to change
        </div>
      </div>

      <!-- MATCH INFO -->
      <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:12px; padding:16px; margin-bottom:16px;">
        <div style="font-size:0.75rem; font-weight:800; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:12px;">Match Info</div>
        
        <div style="display:flex; flex-direction:column; gap:10px; font-size:0.78rem;">
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.02); padding-bottom:8px;">
            <span style="color:var(--text-muted); font-weight:600;">📅 Date</span>
            <span style="color:#fff; font-weight:700;">${m.date || '16 May 2024'}</span>
          </div>
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.02); padding-bottom:8px;">
            <span style="color:var(--text-muted); font-weight:600;">⏰ Time</span>
            <span style="color:#fff; font-weight:700;">${m.time || '7:30 PM IST'}</span>
          </div>
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.02); padding-bottom:8px;">
            <span style="color:var(--text-muted); font-weight:600;">📍 Venue</span>
            <span style="color:#fff; font-weight:700;">${m.gameDetails || 'MA Chidambaram Stadium, Chennai'}</span>
          </div>
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.02); padding-bottom:8px;">
            <span style="color:var(--text-muted); font-weight:600;">🏆 Tournament</span>
            <span style="color:#fff; font-weight:700;">${m.game || 'Cricket'} Match</span>
          </div>
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.02); padding-bottom:8px;">
            <span style="color:var(--text-muted); font-weight:600;">🧩 Format</span>
            <span style="color:#fff; font-weight:700;">T20</span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="color:var(--text-muted); font-weight:600;">📺 TV Channel</span>
            <span style="color:#fff; font-weight:700;">Star Sports 1, JioCinema</span>
          </div>
        </div>
      </div>

      <!-- PAST ENCOUNTERS -->
      <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:12px; padding:16px; margin-bottom:16px;">
        <div style="font-size:0.75rem; font-weight:800; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:12px;">Past Encounters</div>
        
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <div style="text-align:center;">
            <div style="font-size:0.65rem; color:#10b981; font-weight:800;">${m.team1.name} Won</div>
            <div style="font-size:1.4rem; font-weight:900; color:#fff; margin-top:2px;">20</div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:0.65rem; color:var(--text-muted); font-weight:600;">Total Matches</div>
            <div style="font-size:1.1rem; font-weight:800; color:#fff; margin-top:2px;">36</div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:0.65rem; color:#ef4444; font-weight:800;">${m.team2.name} Won</div>
            <div style="font-size:1.4rem; font-weight:900; color:#fff; margin-top:2px;">16</div>
          </div>
        </div>
        
        <!-- Encounters bar visualizer -->
        <div style="height:6px; border-radius:3px; background:rgba(255,255,255,0.05); overflow:hidden; display:flex;">
          <div style="background:#10b981; width:55%;"></div>
          <div style="background:rgba(255,255,255,0.15); width:10%;"></div>
          <div style="background:#ef4444; width:35%;"></div>
        </div>
      </div>
    `;
  }

  const actionContainer = document.getElementById('pmd-action-container');
  if (actionContainer) {
    if (m.status === 'completed') {
      actionContainer.style.display = 'none';
    } else if (myPreds.length > 0) {
      actionContainer.style.display = 'block';
      const totalStake = myPreds.reduce((sum, p) => sum + (p.stake || 0), 0);
      actionContainer.innerHTML = `<button class="btn-primary" style="width:100%; font-weight:900; background:#4b5563; border-color:#4b5563; cursor:not-allowed;" disabled>🔒 TRADE PLACED (₹${totalStake})</button>`;
    } else {
      actionContainer.style.display = 'block';
      actionContainer.innerHTML = `<button class="btn-primary" style="width:100%; font-weight:900;" onclick="window.openPredictionsTradePage('${m.id}', 't1')">TRADE NOW</button>`;
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

  // --- USER PREDICTION STATUS CARD ---
  const userPredCard = document.getElementById('pmd-user-prediction-card');
  if (userPredCard && state.user) {
    const userId = state.user.id;
    // Fetch user's predictions for this match
    fetch(`${SERVER}/api/predictions/predictions?matchId=${m.id}&userId=${userId}`)
      .then(r => r.ok ? r.json() : [])
      .then(userPreds => {
        if (!userPreds || userPreds.length === 0) {
          // Show winner announcement if match is completed, even if user didn't predict
          if (m.status === 'completed' && m.winner) {
            userPredCard.innerHTML = `
              <div style="border-radius:12px; overflow:hidden; margin-bottom:4px;">
                <div style="background:linear-gradient(135deg,#1a3d1a 0%,#0d210d 100%); border:1px solid rgba(16,185,129,0.3); padding:14px 16px;">
                  <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                    <span style="font-size:1.2rem;">🏆</span>
                    <span style="font-size:0.7rem; font-weight:800; text-transform:uppercase; letter-spacing:1px; color:#10b981;">Match Result</span>
                  </div>
                  <div style="font-size:0.95rem; font-weight:900; color:#fff;">${m.winner} <span style="color:#10b981;">Won</span></div>
                  <div style="font-size:0.72rem; color:var(--text-muted); margin-top:4px;">You didn't predict this match.</div>
                </div>
              </div>`;
          } else {
            userPredCard.innerHTML = '';
          }
          return;
        }

        // Build per-prediction status rows
        if (m.status === 'completed') {
          const won = userPreds.filter(p => p.status === 'correct');
          const lost = userPreds.filter(p => p.status === 'incorrect');
          const totalWin = won.reduce((s, p) => s + (p.prizeShare || 0), 0);
          const isWinner = won.length > 0;

          userPredCard.innerHTML = `
            <div style="border-radius:12px; overflow:hidden; margin-bottom:4px;">
              <div style="background:${isWinner ? 'linear-gradient(135deg,#1a3d1a 0%,#0d210d 100%)' : 'linear-gradient(135deg,#3d1a1a 0%,#210d0d 100%)'}; border:1px solid ${isWinner ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)'}; padding:14px 16px;">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
                  <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:1.3rem;">${isWinner ? '🏆' : '😔'}</span>
                    <span style="font-size:0.75rem; font-weight:800; text-transform:uppercase; letter-spacing:1px; color:${isWinner ? '#10b981' : '#ef4444'};">${isWinner ? 'You Won!' : 'Better luck next time'}</span>
                  </div>
                  ${isWinner ? `<div style="background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.3); border-radius:20px; padding:4px 10px; font-size:0.75rem; font-weight:800; color:#10b981;">+₹${totalWin.toLocaleString('en-IN')}</div>` : ''}
                </div>
                <div style="font-size:0.8rem; font-weight:900; color:#fff; margin-bottom:6px;">Winner: <span style="color:#10b981;">${m.winner}</span></div>
                <div style="display:flex; flex-direction:column; gap:4px; border-top:1px solid rgba(255,255,255,0.06); padding-top:8px; margin-top:4px;">
                  ${userPreds.map(p => `
                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.72rem;">
                      <span style="color:var(--text-muted);">Your pick: <b style="color:#fff;">${p.predictedTeam || p.selection}</b></span>
                      <span style="font-weight:800; color:${p.status === 'correct' ? '#10b981' : '#ef4444'};">${p.status === 'correct' ? `Won ₹${(p.prizeShare||0).toLocaleString('en-IN')}` : 'Lost'}</span>
                    </div>`).join('')}
                </div>
              </div>
            </div>`;
        } else {
          // Match still live/upcoming — show user's locked predictions
          userPredCard.innerHTML = `
            <div style="background:rgba(59,130,246,0.06); border:1px solid rgba(59,130,246,0.2); border-radius:10px; padding:12px 14px; margin-bottom:4px;">
              <div style="font-size:0.7rem; font-weight:800; text-transform:uppercase; letter-spacing:1px; color:#3b82f6; margin-bottom:6px;">🔒 Your Predictions (Locked In)</div>
              ${userPreds.map(p => `
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.76rem; padding:3px 0;">
                  <span style="color:var(--text-muted);">${p.marketName || 'Match Winner'}</span>
                  <span style="font-weight:800; color:#fff;">${p.predictedTeam || p.selection} <span style="color:#eab308;">×${p.odds || 1}</span></span>
                </div>`).join('')}
            </div>`;
        }
      })
      .catch(() => { userPredCard.innerHTML = ''; });
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

window.triggerWinningConfetti = function() {
  const canvas = document.createElement('canvas');
  canvas.id = 'winning-confetti-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const colors = ['#f43f5e', '#3b82f6', '#10b981', '#eab308', '#a855f7', '#ec4899', '#f97316'];
  const particles = [];

  for (let i = 0; i < 150; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height - height,
      r: Math.random() * 6 + 4,
      d: Math.random() * width,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngleIncremental: Math.random() * 0.07 + 0.02,
      tiltAngle: 0
    });
  }

  let angle = 0;
  function draw() {
    ctx.clearRect(0, 0, width, height);

    let active = false;
    particles.forEach((p, idx) => {
      angle += 0.01;
      p.tiltAngle += p.tiltAngleIncremental;
      p.y += (Math.cos(angle + p.d) + 3 + p.r / 2) / 2;
      p.x += Math.sin(angle);
      p.tilt = Math.sin(p.tiltAngle - idx / 3) * 15;

      if (p.y <= height) {
        active = true;
      }
      ctx.beginPath();
      ctx.lineWidth = p.r;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
      ctx.stroke();
    });

    if (active) {
      requestAnimationFrame(draw);
    } else {
      canvas.remove();
    }
  }

  draw();
  window.showWinnerCelebrationBanner();
};

window.showWinnerCelebrationBanner = function() {
  const div = document.createElement('div');
  div.style.position = 'fixed';
  div.style.top = '50%';
  div.style.left = '50%';
  div.style.transform = 'translate(-50%, -50%) scale(0.5)';
  div.style.background = 'linear-gradient(135deg, #1e1b4b 0%, #311042 100%)';
  div.style.border = '2px solid #eab308';
  div.style.boxShadow = '0 10px 30px rgba(0,0,0,0.8), 0 0 40px rgba(234, 179, 8, 0.4)';
  div.style.borderRadius = '24px';
  div.style.padding = '32px 24px';
  div.style.textAlign = 'center';
  div.style.zIndex = '100000';
  div.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
  div.style.opacity = '0';
  div.style.width = '85%';
  div.style.maxWidth = '340px';

  div.innerHTML = `
    <div style="font-size:3.5rem; margin-bottom:12px;">🏆</div>
    <div style="font-size:1.5rem; font-weight:900; color:#fff; text-shadow:0 2px 10px rgba(234,179,8,0.5);">BIG WIN!</div>
    <div style="font-size:0.82rem; color:rgba(255,255,255,0.8); margin:12px 0 20px; line-height:1.4;">
      Your prediction was correct! Winning amount after commission deduction has been credited to your wallet.
    </div>
    <button style="background:#eab308; color:#000; border:none; border-radius:12px; padding:12px 32px; font-weight:900; font-size:0.9rem; box-shadow:0 4px 15px rgba(234,179,8,0.4); cursor:pointer;" onclick="this.parentElement.remove()">AWESOME!</button>
  `;

  document.body.appendChild(div);

  setTimeout(() => {
    div.style.opacity = '1';
    div.style.transform = 'translate(-50%, -50%) scale(1)';
  }, 100);
};

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
  
  const c1 = document.getElementById('mp-t1-card');
  const c2 = document.getElementById('mp-t2-card');
  c1.className = 'quick-amt';
  c2.className = 'quick-amt';
  c1.style.border = '2px solid rgba(255,255,255,0.08)';
  c2.style.border = '2px solid rgba(255,255,255,0.08)';
  
  const chk1 = document.querySelector('#mp-t1-check div');
  const chk2 = document.querySelector('#mp-t2-check div');
  if (chk1) chk1.style.background = 'transparent';
  if (chk2) chk2.style.background = 'transparent';

  navigate('make-prediction');
};

window.selectPredictionTeam = function(teamKey) {
  window.selectedPredTeam = teamKey;
  const m = state.selectedPredictionMatch;
  if (!m) return;

  const c1 = document.getElementById('mp-t1-card');
  const c2 = document.getElementById('mp-t2-card');
  
  const chk1 = document.querySelector('#mp-t1-check div');
  const chk2 = document.querySelector('#mp-t2-check div');

  if (teamKey === 'team1') {
    c1.className = 'quick-amt mp-team-selected';
    c2.className = 'quick-amt';
    if (chk1) chk1.style.background = '#10b981';
    if (chk2) chk2.style.background = 'transparent';
  } else {
    c1.className = 'quick-amt';
    c2.className = 'quick-amt mp-team-selected';
    if (chk1) chk1.style.background = 'transparent';
    if (chk2) chk2.style.background = '#ef4444';
  }
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
      
      let ptsWon = 0;
      let ptsLost = 0;
      myPreds.forEach(p => {
        if (p.status === 'correct') {
          ptsWon += (p.pointsWon || 100);
        } else if (p.status === 'incorrect') {
          ptsLost += Math.abs(p.pointsWon || -20);
        }
      });

      const pWonEl = document.getElementById('user-pred-pts-won');
      if (pWonEl) pWonEl.textContent = ptsWon;
      const pLostEl = document.getElementById('user-pred-pts-lost');
      if (pLostEl) pLostEl.textContent = ptsLost;
      
      const correctCount = myPreds.filter(p => p.status === 'correct').length;
      const totalCount = myPreds.length;
      const rate = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
      
      document.getElementById('user-pred-correct-rate').textContent = `${rate}%`;
      document.getElementById('user-pred-total-count').textContent = totalCount;

      const leaderboardRes = await fetch(`${SERVER}/api/predictions/leaderboard`);
      if (leaderboardRes.ok) {
        const lb = await leaderboardRes.json();
        const myRankIdx = lb.allTime.findIndex(u => u.id === state.user.id);
        document.getElementById('user-pred-rank').textContent = myRankIdx !== -1 ? `#${myRankIdx + 1}` : '#--';
      }

      const historyContainer = document.getElementById('user-prediction-history-list');
      if (historyContainer) {
        if (myPreds.length === 0) {
          historyContainer.innerHTML = `<div style="text-align:center; padding:32px 16px; color:rgba(255,255,255,0.25); font-size:0.75rem;">
            <div style="font-size:2rem;margin-bottom:8px;">🔮</div>
            You haven't made any predictions yet.
          </div>`;
          return;
        }

        // Confetti trigger for celebrating correct predictions (only shown once per win)
        const celebratedBets = JSON.parse(localStorage.getItem('celebrated_bets') || '[]');
        const newWins = myPreds.filter(p => p.status === 'correct' && !celebratedBets.includes(p.id));
        if (newWins.length > 0) {
          window.triggerWinningConfetti();
          newWins.forEach(p => celebratedBets.push(p.id));
          localStorage.setItem('celebrated_bets', JSON.stringify(celebratedBets));
        }

        historyContainer.innerHTML = myPreds.map(p => {
          const m = matches.find(match => match.id === p.matchId) || {};

          const stake = p.stake || 0;
          const potWin = p.potentialWin || 0;
          const comm = p.commissionDeducted || 0;

          let statusColor = '#eab308';
          let financeDetailsHTML = '';
          let financialBadgeHTML = '';

          if (p.status === 'correct') {
            statusColor = '#10b981';
            const netPayout = p.prizeShare || (potWin - comm);
            financeDetailsHTML = `
              <div style="margin-top:8px; border-top:1px solid rgba(255,255,255,0.04); padding-top:8px; display:flex; flex-direction:column; gap:4px; font-size:0.67rem; color:rgba(255,255,255,0.4);">
                <div style="display:flex; justify-content:space-between;">
                  <span>Entry Stake</span>
                  <span style="color:rgba(255,255,255,0.7);">₹${stake.toLocaleString('en-IN')}</span>
                </div>
                <div style="display:flex; justify-content:space-between;">
                  <span>Gross Win (at odds)</span>
                  <span style="color:rgba(255,255,255,0.7);">₹${potWin.toLocaleString('en-IN')}</span>
                </div>
                <div style="display:flex; justify-content:space-between;">
                  <span>Platform Commission (${comm > 0 && stake > 0 ? Math.round(comm/stake*100) : 0}% of entry)</span>
                  <span style="color:#ef4444; font-weight:700;">-₹${comm.toLocaleString('en-IN')}</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-weight:800; border-top:1px solid rgba(255,255,255,0.04); padding-top:4px; margin-top:2px;">
                  <span style="color:#10b981;">Net Credited to Wallet</span>
                  <span style="color:#10b981;">+₹${netPayout.toLocaleString('en-IN')}</span>
                </div>
              </div>`;
            financialBadgeHTML = `<span style="font-size:0.95rem; font-weight:900; color:#10b981;">+₹${netPayout.toLocaleString('en-IN')}</span>`;

          } else if (p.status === 'incorrect') {
            statusColor = '#ef4444';
            // Commission is the platform's cut from the lost stake (same % as win)
            const platformCut = comm > 0 ? comm : 0;
            financeDetailsHTML = `
              <div style="margin-top:8px; border-top:1px solid rgba(255,255,255,0.04); padding-top:8px; display:flex; flex-direction:column; gap:4px; font-size:0.67rem; color:rgba(255,255,255,0.4);">
                <div style="display:flex; justify-content:space-between;">
                  <span>Entry Stake</span>
                  <span style="color:rgba(255,255,255,0.7);">₹${stake.toLocaleString('en-IN')}</span>
                </div>
                <div style="display:flex; justify-content:space-between;">
                  <span>Platform Commission (${platformCut > 0 && stake > 0 ? Math.round(platformCut/stake*100) : 0}% of entry)</span>
                  <span style="color:#ef4444; font-weight:700;">₹${platformCut.toLocaleString('en-IN')}</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-weight:800; border-top:1px solid rgba(255,255,255,0.04); padding-top:4px; margin-top:2px;">
                  <span style="color:#ef4444;">Total Loss</span>
                  <span style="color:#ef4444;">-₹${stake.toLocaleString('en-IN')}</span>
                </div>
              </div>`;
            financialBadgeHTML = `<span style="font-size:0.95rem; font-weight:900; color:#ef4444;">-₹${stake.toLocaleString('en-IN')}</span>`;

          } else {
            // Pending
            financialBadgeHTML = `<span style="font-size:0.78rem; font-weight:700; color:#eab308;">Est: ₹${potWin.toLocaleString('en-IN')}</span>`;
          }

          const statusLabels = { correct: '🏆 Won', incorrect: '❌ Lost', pending: '⏳ Pending' };
          const statusLabel = statusLabels[p.status] || 'Pending';
          const statusBadge = `<span style="background:${statusColor}1A; color:${statusColor}; border:1px solid ${statusColor}40; padding:2px 8px; border-radius:10px; font-size:0.58rem; font-weight:800; text-transform:uppercase; letter-spacing:0.5px;">${statusLabel}</span>`;
          const pointsText = p.status === 'correct' ? `+${p.pointsWon || 100} pts` : p.status === 'incorrect' ? `${p.pointsWon || -20} pts` : 'Pending';

          return `
            <div style="background:linear-gradient(135deg, rgba(255,255,255,0.015) 0%, rgba(255,255,255,0.03) 100%); border:1px solid rgba(255,255,255,0.06); border-radius:14px; padding:14px; margin-bottom:10px;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div style="flex:1; min-width:0; padding-right:10px;">
                  <div style="font-size:0.82rem; font-weight:800; color:#fff; line-height:1.2;">${m.title || 'Match Prediction'}</div>
                  <div style="font-size:0.68rem; color:rgba(255,255,255,0.4); margin-top:4px;">Pick: <b style="color:#fff;">${p.predictedTeam || p.selection}</b></div>
                  <div style="font-size:0.58rem; color:rgba(255,255,255,0.25); margin-top:2px;">${p.submittedAt}</div>
                </div>
                <div style="text-align:right; display:flex; flex-direction:column; align-items:flex-end; gap:4px;">
                  ${financialBadgeHTML}
                  <div style="display:flex; align-items:center; gap:6px; margin-top:2px;">
                    <span style="font-size:0.6rem; color:rgba(255,255,255,0.35); font-weight:700;">${pointsText}</span>
                    ${statusBadge}
                  </div>
                </div>
              </div>
              ${financeDetailsHTML}
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
    <!-- 2nd Place -->
    <div style="display:flex; flex-direction:column; align-items:center; width:30%; animation:slideUp 0.4s ease forwards;">
      <div style="width:52px; height:52px; border-radius:50%; border:2px solid #3b82f6; overflow:hidden; background:#1e1e30; display:flex; align-items:center; justify-content:center; position:relative; box-shadow:0 0 15px rgba(59,130,246,0.3); margin-bottom:6px;">
        <img src="${p2.avatar}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='assets/valorant_thumb.jpg'"/>
        <div style="position:absolute; bottom:-2px; background:#3b82f6; color:#fff; border-radius:50%; width:16px; height:16px; display:flex; align-items:center; justify-content:center; font-size:0.65rem; font-weight:900;">2</div>
      </div>
      <span style="font-size:0.72rem; font-weight:800; color:#fff; text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%;">${p2.name}</span>
      <span style="font-size:0.65rem; color:#3b82f6; font-weight:800; margin-top:2px;">${p2.points} pts</span>
      
      <!-- Glass Pedestal -->
      <div style="width:100%; height:35px; margin-top:8px; border-radius:8px 8px 0 0; background:linear-gradient(180deg,rgba(59,130,246,0.15),transparent); border:1px solid rgba(59,130,246,0.25); border-bottom:none; display:flex; align-items:center; justify-content:center;">
        <span style="font-size:0.8rem; font-weight:900; color:rgba(59,130,246,0.4);">🥈</span>
      </div>
    </div>

    <!-- 1st Place -->
    <div style="display:flex; flex-direction:column; align-items:center; width:36%; animation:slideUp 0.3s ease forwards; transform:translateY(-8px);">
      <div style="width:64px; height:64px; border-radius:50%; border:3px solid #eab308; overflow:hidden; background:#1e1e30; display:flex; align-items:center; justify-content:center; position:relative; box-shadow:0 0 25px rgba(234,179,8,0.4); margin-bottom:6px; animation:bounce 2s infinite ease-in-out;">
        <img src="${p1.avatar}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='assets/valorant_thumb.jpg'"/>
        <div style="position:absolute; bottom:-2px; background:#eab308; color:#000; border-radius:50%; width:18px; height:18px; display:flex; align-items:center; justify-content:center; font-size:0.7rem; font-weight:900;">1</div>
      </div>
      <span style="font-size:0.78rem; font-weight:900; color:#fff; text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%;">${p1.name}</span>
      <span style="font-size:0.68rem; color:#eab308; font-weight:800; margin-top:2px;">${p1.points} pts</span>
      
      <!-- Glass Pedestal -->
      <div style="width:100%; height:50px; margin-top:8px; border-radius:8px 8px 0 0; background:linear-gradient(180deg,rgba(234,179,8,0.2),transparent); border:1px solid rgba(234,179,8,0.3); border-bottom:none; display:flex; align-items:center; justify-content:center;">
        <span style="font-size:1.1rem; font-weight:900; color:rgba(234,179,8,0.5);">👑</span>
      </div>
    </div>

    <!-- 3rd Place -->
    <div style="display:flex; flex-direction:column; align-items:center; width:30%; animation:slideUp 0.5s ease forwards;">
      <div style="width:48px; height:48px; border-radius:50%; border:2px solid #b45309; overflow:hidden; background:#1e1e30; display:flex; align-items:center; justify-content:center; position:relative; box-shadow:0 0 12px rgba(180,83,9,0.3); margin-bottom:6px;">
        <img src="${p3.avatar}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='assets/valorant_thumb.jpg'"/>
        <div style="position:absolute; bottom:-2px; background:#b45309; color:#fff; border-radius:50%; width:14px; height:14px; display:flex; align-items:center; justify-content:center; font-size:0.58rem; font-weight:900;">3</div>
      </div>
      <span style="font-size:0.72rem; font-weight:800; color:#fff; text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%;">${p3.name}</span>
      <span style="font-size:0.65rem; color:#b45309; font-weight:800; margin-top:2px;">${p3.points} pts</span>
      
      <!-- Glass Pedestal -->
      <div style="width:100%; height:25px; margin-top:8px; border-radius:8px 8px 0 0; background:linear-gradient(180deg,rgba(180,83,9,0.15),transparent); border:1px solid rgba(180,83,9,0.25); border-bottom:none; display:flex; align-items:center; justify-content:center;">
        <span style="font-size:0.8rem; font-weight:900; color:rgba(180,83,9,0.4);">🥉</span>
      </div>
    </div>
  `;

  const others = rankings.slice(3);
  if (others.length === 0) {
    listContainer.innerHTML = '';
    return;
  }

  listContainer.innerHTML = others.map((item, idx) => `
    <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:10px 14px; display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; animation:slideUp 0.3s ease forwards;">
      <div style="display:flex; align-items:center; gap:10px;">
        <span style="font-size:0.75rem; font-weight:800; color:rgba(255,255,255,0.3); width:20px; text-align:center;">#${idx + 4}</span>
        <img src="${item.avatar}" style="width:28px; height:28px; border-radius:50%; object-fit:cover; border:1px solid rgba(255,255,255,0.15);" onerror="this.src='assets/valorant_thumb.jpg'"/>
        <span style="font-size:0.78rem; font-weight:800; color:#fff;">${item.name}</span>
      </div>
      <span style="font-size:0.78rem; font-weight:800; color:var(--text-secondary); text-align:right;">${item.points} pts</span>
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

let currentTradeMatch = null;
let currentTradeSelection = 't1';

window.openPredictionsTradePage = function(matchId, selectionKey) {
  const match = (state.predictionMatches || []).find(m => m.id === matchId);
  if (!match) return;
  if (match.status === 'completed') {
    showToast('Match is completed! Cannot place predictions.', 'error');
    return;
  }

  currentTradeMatch = match;
  currentTradeSelection = selectionKey || 't1';

  // Populate match info
  document.getElementById('pt-header-match-subtitle').textContent = `${match.game} - ${match.gameDetails || 'IPL 2024'}`;
  document.getElementById('pt-match-league').textContent = match.gameDetails || 'IPL 2024';
  document.getElementById('pt-match-status').textContent = match.status.toUpperCase();
  document.getElementById('pt-match-status').style.background = match.status === 'live' ? '#ef4444' : '#3b82f6';
  document.getElementById('pt-match-venue').textContent = match.gameDetails || 'Stadium Arena';

  // Set countdown/timer
  if (match.status === 'live') {
    document.getElementById('pt-match-timer').textContent = 'Live';
    document.getElementById('pt-match-timer').style.color = '#ef4444';
  } else {
    document.getElementById('pt-match-timer').textContent = match.time || 'Upcoming';
    document.getElementById('pt-match-timer').style.color = '#10b981';
  }

  // Set team logos/names
  document.getElementById('pt-t1-logo').src = match.team1.logo || 'assets/valorant_thumb.jpg';
  document.getElementById('pt-t2-logo').src = match.team2.logo || 'assets/valorant_thumb.jpg';
  document.getElementById('pt-t1-name').textContent = match.team1.name;
  document.getElementById('pt-t2-name').textContent = match.team2.name;

  // Set card contents
  document.getElementById('pt-badge-t1').textContent = `${match.team1.winProbability || 50}% Win`;
  document.getElementById('pt-badge-t2').textContent = `${match.team2.winProbability || 50}% Win`;
  document.getElementById('pt-logo-t1').src = match.team1.logo || 'assets/valorant_thumb.jpg';
  document.getElementById('pt-logo-t2').src = match.team2.logo || 'assets/valorant_thumb.jpg';
  document.getElementById('pt-lbl-t1').textContent = match.team1.name;
  document.getElementById('pt-lbl-t2').textContent = match.team2.name;

  // Set Payout labels (Hardcoded default odds of 1.85 / 2.05 as in mock or custom odds if available)
  document.getElementById('pt-odds-t1').textContent = `₹ 1.85 Payout`;
  document.getElementById('pt-odds-t2').textContent = `₹ 2.05 Payout`;

  // Reset stake input
  document.getElementById('pt-stake-input').value = '500';

  // Select team
  window.selectPredictionsTradeTeam(currentTradeSelection);

  // Go to trade page
  navigate('predictions-trade');
};

window.selectPredictionsTradeTeam = function(teamKey) {
  currentTradeSelection = teamKey;
  
  const card1 = document.getElementById('pt-card-t1');
  const card2 = document.getElementById('pt-card-t2');
  const check1 = document.getElementById('pt-check-t1');
  const check2 = document.getElementById('pt-check-t2');

  if (teamKey === 't1') {
    card1.style.borderColor = '#16a34a';
    card1.style.background = 'rgba(22,163,74,0.06)';
    check1.style.display = 'flex';

    card2.style.borderColor = 'rgba(255,255,255,0.05)';
    card2.style.background = 'rgba(255,255,255,0.02)';
    check2.style.display = 'none';
  } else {
    card2.style.borderColor = '#dc2626';
    card2.style.background = 'rgba(220,38,38,0.06)';
    check2.style.display = 'flex';

    card1.style.borderColor = 'rgba(255,255,255,0.05)';
    card1.style.background = 'rgba(255,255,255,0.02)';
    check1.style.display = 'none';
  }

  window.updatePredictionsTradeCalculations();
};

window.addPredictionsTradeAmount = function(amt) {
  const input = document.getElementById('pt-stake-input');
  let currentVal = parseInt(input.value) || 0;
  input.value = currentVal + amt;
  window.updatePredictionsTradeCalculations();
};

window.updatePredictionsTradeCalculations = function() {
  if (!currentTradeMatch) return;
  const stake = parseInt(document.getElementById('pt-stake-input').value) || 0;
  
  const selectedTeamName = currentTradeSelection === 't1' ? currentTradeMatch.team1.name : currentTradeMatch.team2.name;
  const odds = currentTradeSelection === 't1' ? 1.85 : 2.05;

  const potWin = Math.round(stake * odds) - stake;
  const payout = Math.round(stake * odds);

  document.getElementById('pt-summary-predict').textContent = `${selectedTeamName} Win`;
  document.getElementById('pt-summary-odds').textContent = odds.toFixed(2);
  document.getElementById('pt-summary-win').textContent = `₹${potWin.toLocaleString('en-IN')}`;
  document.getElementById('pt-summary-payout').textContent = `₹${payout.toLocaleString('en-IN')}`;
};

window.confirmPredictionsTrade = async function() {
  if (!currentTradeMatch) return;
  
  const stake = parseInt(document.getElementById('pt-stake-input').value) || 0;
  if (stake <= 0) {
    showToast('Please enter a valid stake amount!', 'error');
    return;
  }

  const user = state.user || JSON.parse(localStorage.getItem('nexora_user') || 'null');
  if (!user || user.balance < stake) {
    showToast('Insufficient balance! Add cash first.', 'error');
    return;
  }

  const selectedTeamName = currentTradeSelection === 't1' ? currentTradeMatch.team1.name : currentTradeMatch.team2.name;
  const odds = currentTradeSelection === 't1' ? 1.85 : 2.05;

  const bets = [{
    matchId: currentTradeMatch.id,
    matchTitle: currentTradeMatch.title,
    marketId: `${currentTradeMatch.id}_1`,
    marketName: 'Match Winner',
    selection: selectedTeamName,
    odds: odds,
    stake: stake
  }];

  try {
    const res = await fetch(`${SERVER}/api/predictions/submit-bet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        bets: bets
      })
    });

    if (res.ok) {
      // Update local wallet balance
      user.balance -= stake;
      state.user = user;
      localStorage.setItem('nexora_user', JSON.stringify(user));
      updateWalletBadge();
      renderWallet();

      showToast('Trade placed successfully! 🎉', 'success');

      // Populate success page elements
      document.getElementById('mps-team-val').textContent = selectedTeamName;
      document.getElementById('mps-entry-val').textContent = `-₹${stake}`;
      document.getElementById('mps-pot-win-val').textContent = `₹${(Math.round(stake * odds)).toLocaleString('en-IN')}`;
      document.getElementById('ps-pick-team').textContent = selectedTeamName;

      // Refresh matches and user predictions in state
      await window.loadPredictionsMatches();

      navigate('prediction-success');
    } else {
      const err = await res.json();
      showToast(err.error || 'Failed to place trade.', 'error');
    }
  } catch(e) {
    console.error('Failed to place trade:', e);
    showToast('Network error placing trade.', 'error');
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

      <div style="font-size:0.7rem; text-align:center; color:var(--text-muted); border-top:1px solid var(--border-light); padding-top:12px; margin-top:12px;">Game: <b>${gameName}</b> · Prize pool has been credited to wallet balances.</div>
    </div>
  `;
}

window.closeManualQrModal = function() {
  document.getElementById('modal-manual-qr-payment').style.display = 'none';
};

window.copyPaymentUpiId = function() {
  const upiId = document.getElementById('qr-pay-upi-id')?.textContent;
  if (upiId) {
    navigator.clipboard?.writeText(upiId).catch(() => {});
    showToast('UPI ID copied to clipboard! 📋', 'success');
  }
};

window.submitQrPaymentRequest = async function() {
  const amount = Number(document.getElementById('qr-pay-amount').value);
  const utr = document.getElementById('qr-pay-utr').value.trim();

  if (!utr || utr.length !== 12 || isNaN(utr)) {
    showToast('Please enter a valid 12-digit UTR/Transaction ID number', 'error');
    return;
  }

  try {
    const res = await fetch(`${SERVER}/api/qr-payment/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: state.user.id,
        userName: state.user.name,
        amount,
        utr
      })
    });

    if (res.ok) {
      showToast('Payment request submitted successfully! Pending approval. 🎉', 'success');
      closeManualQrModal();
      document.getElementById('add-cash-amount').value = '';
      document.querySelectorAll('.quick-amt').forEach(b => b.classList.remove('selected'));
      checkPendingQrPayment();
    } else {
      const err = await res.json();
      showToast(err.error || 'Failed to submit payment request.', 'error');
    }
  } catch(e) {
    console.error(e);
    showToast('Network error. Failed to submit payment request.', 'error');
  }
};

let qrTimerInterval = null;

window.checkPendingQrPayment = async function() {
  if (!state.loggedIn || !state.user) return;
  
  try {
    const [reqsRes, settingsRes] = await Promise.all([
      fetch(`${SERVER}/api/qr-payment/requests`),
      fetch(`${SERVER}/api/qr-payment/settings`)
    ]);

    if (!reqsRes.ok || !settingsRes.ok) return;

    const reqs = await reqsRes.json();
    const settings = await settingsRes.json();

    const activeReq = reqs.find(r => r.userId === state.user.id && (r.status === 'pending' || r.status === 'rejected'));

    const formWrap = document.getElementById('add-cash-form-wrapper');
    const pendingWrap = document.getElementById('add-cash-pending-wrapper');

    if (activeReq) {
      if (formWrap) formWrap.style.display = 'none';
      if (pendingWrap) pendingWrap.style.display = 'block';

      state.activeQrRequestId = activeReq.id;

      const pendingAmt = document.getElementById('add-cash-pending-amount');
      if (pendingAmt) pendingAmt.textContent = `₹${activeReq.amount.toLocaleString('en-IN')}`;

      const pendingUtr = document.getElementById('add-cash-pending-utr');
      if (pendingUtr) pendingUtr.textContent = activeReq.utr;

      const statusBadge = document.getElementById('add-cash-pending-status-badge');
      if (statusBadge) {
        statusBadge.textContent = activeReq.status.toUpperCase();
        statusBadge.className = `badge ${activeReq.status === 'pending' ? 'pending' : 'blocked'}`;
      }

      const headerIcon = document.getElementById('add-cash-pending-header-icon');
      const headerTitle = document.getElementById('add-cash-pending-header-title');
      const pendingText = document.getElementById('add-cash-pending-text');
      const timerContainer = document.getElementById('add-cash-pending-timer-container');
      const rejectionBox = document.getElementById('add-cash-rejection-reason-box');
      const rejectionText = document.getElementById('add-cash-rejection-reason-text');
      const disputeSection = document.getElementById('add-cash-dispute-section');

      if (activeReq.status === 'pending') {
        // Verification Screen
        if (headerIcon) {
          headerIcon.textContent = "⏳";
          headerIcon.style.background = "rgba(234,179,8,0.1)";
          headerIcon.style.borderColor = "#eab308";
        }
        if (headerTitle) headerTitle.textContent = "Verification in Progress";
        if (pendingText) pendingText.textContent = settings.processingText || "Payment is being verified. Wallet balance will update within 5 minutes.";
        if (timerContainer) timerContainer.style.display = 'block';
        if (rejectionBox) rejectionBox.style.display = 'none';
        if (disputeSection) disputeSection.style.display = 'none';

        // Countdown Timer
        if (qrTimerInterval) clearInterval(qrTimerInterval);
        const updateTimer = () => {
          const reqTimestamp = activeReq.timestamp || (Date.now() - 30000);
          const elapsedSeconds = Math.floor((Date.now() - reqTimestamp) / 1000);
          const remaining = Math.max(0, 300 - elapsedSeconds);

          const timerEl = document.getElementById('add-cash-pending-timer');
          if (remaining <= 0) {
            if (timerEl) timerEl.textContent = "Verifying shortly...";
            clearInterval(qrTimerInterval);
          } else {
            const mins = Math.floor(remaining / 60).toString().padStart(2, '0');
            const secs = (remaining % 60).toString().padStart(2, '0');
            if (timerEl) timerEl.textContent = `${mins}:${secs}`;
          }
        };
        updateTimer();
        qrTimerInterval = setInterval(updateTimer, 1000);

      } else {
        // Rejection Screen
        if (qrTimerInterval) {
          clearInterval(qrTimerInterval);
          qrTimerInterval = null;
        }
        if (headerIcon) {
          headerIcon.textContent = "❌";
          headerIcon.style.background = "rgba(239,68,68,0.1)";
          headerIcon.style.borderColor = "#ef4444";
        }
        if (headerTitle) headerTitle.textContent = "Deposit Request Rejected";
        if (pendingText) pendingText.textContent = "Your payment verification failed. Please check the reason below.";
        if (timerContainer) timerContainer.style.display = 'none';
        if (rejectionBox) rejectionBox.style.display = 'block';
        if (rejectionText) rejectionText.textContent = activeReq.rejectReason || "Incorrect UTR / Verification failed";
        if (disputeSection) disputeSection.style.display = 'block';
      }

    } else {
      if (qrTimerInterval) {
        clearInterval(qrTimerInterval);
        qrTimerInterval = null;
      }
      if (formWrap) formWrap.style.display = 'block';
      if (pendingWrap) pendingWrap.style.display = 'none';
      state.activeQrRequestId = null;
    }

  } catch(e) {
    console.error('Failed to check pending QR payment status:', e);
  }
};

window.previewDisputeScreenshot = function(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const previewContainer = document.getElementById('dispute-preview-container');
    const previewImg = document.getElementById('dispute-preview-img');
    if (previewImg) previewImg.src = e.target.result;
    if (previewContainer) previewContainer.style.display = 'block';
  };
  reader.readAsDataURL(file);
};

window.submitQrPaymentDispute = async function() {
  const reqId = state.activeQrRequestId;
  if (!reqId) {
    showToast('No active request found to dispute.', 'error');
    return;
  }
  const previewImg = document.getElementById('dispute-preview-img');
  if (!previewImg || !previewImg.src.startsWith('data:image')) {
    showToast('Please upload a valid payment screenshot receipt.', 'error');
    return;
  }

  try {
    const res = await fetch(`${SERVER}/api/qr-payment/dispute/${reqId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ screenshot: previewImg.src })
    });
    if (res.ok) {
      showToast('Dispute screenshot submitted successfully! Re-verifying. 🔄', 'success');
      const previewContainer = document.getElementById('dispute-preview-container');
      if (previewContainer) previewContainer.style.display = 'none';
      const disputeInput = document.getElementById('dispute-screenshot-input');
      if (disputeInput) disputeInput.value = '';
      checkPendingQrPayment();
    } else {
      const err = await res.json();
      showToast(err.error || 'Failed to submit dispute screenshot.', 'error');
    }
  } catch(e) {
    console.error(e);
    showToast('Network error while submitting dispute.', 'error');
  }
};

let supportQrTimerInterval = null;

window.renderSupportManualPayment = async function() {
  const container = document.getElementById('support-manual-payment-container');
  if (!container || !state.loggedIn || !state.user) return;

  try {
    const [reqsRes, settingsRes] = await Promise.all([
      fetch(`${SERVER}/api/qr-payment/requests`),
      fetch(`${SERVER}/api/qr-payment/settings`)
    ]);

    if (!reqsRes.ok || !settingsRes.ok) return;

    const reqs = await reqsRes.json();
    const settings = await settingsRes.json();

    const activeReq = reqs.find(r => r.userId === state.user.id && (r.status === 'pending' || r.status === 'rejected'));

    if (activeReq) {
      state.supportActiveQrRequestId = activeReq.id;

      if (activeReq.status === 'pending') {
        container.innerHTML = `
          <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:16px; padding:18px; box-sizing:border-box; margin-bottom:16px;">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
              <span style="font-size:1.4rem;">⏳</span>
              <span style="font-size:0.95rem; font-weight:800; color:#fff;">Deposit Verification in Progress</span>
            </div>
            <p style="font-size:0.78rem; color:var(--text-secondary); line-height:1.45; margin-bottom:14px;">
              ${settings.processingText || "Payment is being verified. Wallet balance will update within 5 minutes."}
            </p>
            <div style="background:var(--bg-elevated); border:1px solid var(--border-light); border-radius:10px; padding:10px; text-align:center; margin-bottom:12px;">
              <div style="font-size:0.6rem; color:var(--text-muted); text-transform:uppercase; font-weight:800; letter-spacing:0.5px;">Estimated Wait Time</div>
              <div id="support-pending-timer" style="font-size:1.6rem; font-weight:900; color:var(--warning); font-family:monospace; margin-top:2px;">05:00</div>
            </div>
            <div style="font-size:0.75rem; color:var(--text-muted); display:flex; flex-direction:column; gap:4px; border-top:1px solid var(--border-light); padding-top:10px;">
              <div style="display:flex; justify-content:space-between;"><span>Amount:</span><b style="color:#fff;">₹${activeReq.amount.toLocaleString('en-IN')}</b></div>
              <div style="display:flex; justify-content:space-between;"><span>UTR / Txn ID:</span><b style="color:#fff; font-family:monospace;">${activeReq.utr}</b></div>
            </div>
          </div>
        `;

        if (supportQrTimerInterval) clearInterval(supportQrTimerInterval);
        const updateSupportTimer = () => {
          const reqTimestamp = activeReq.timestamp || (Date.now() - 30000);
          const elapsedSeconds = Math.floor((Date.now() - reqTimestamp) / 1000);
          const remaining = Math.max(0, 300 - elapsedSeconds);

          const timerEl = document.getElementById('support-pending-timer');
          if (remaining <= 0) {
            if (timerEl) timerEl.textContent = "Verifying shortly...";
            clearInterval(supportQrTimerInterval);
          } else {
            const mins = Math.floor(remaining / 60).toString().padStart(2, '0');
            const secs = (remaining % 60).toString().padStart(2, '0');
            if (timerEl) timerEl.textContent = `${mins}:${secs}`;
          }
        };
        updateSupportTimer();
        supportQrTimerInterval = setInterval(updateSupportTimer, 1000);

      } else {
        if (supportQrTimerInterval) {
          clearInterval(supportQrTimerInterval);
          supportQrTimerInterval = null;
        }

        container.innerHTML = `
          <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:16px; padding:18px; box-sizing:border-box; margin-bottom:16px;">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
              <span style="font-size:1.4rem;">❌</span>
              <span style="font-size:0.95rem; font-weight:800; color:#ef4444;">Deposit Request Rejected</span>
            </div>
            
            <div style="background:rgba(239,68,68,0.06); border:1px solid rgba(239,68,68,0.15); border-radius:8px; padding:10px; margin-bottom:14px;">
              <div style="font-size:0.6rem; color:#ef4444; font-weight:800; text-transform:uppercase; letter-spacing:0.5px;">Rejection Reason</div>
              <div style="font-size:0.8rem; color:#fff; font-weight:600; margin-top:2px;">${activeReq.rejectReason || "Incorrect UTR / Verification failed"}</div>
            </div>

            <div style="font-size:0.75rem; color:var(--text-muted); display:flex; flex-direction:column; gap:4px; margin-bottom:14px;">
              <div style="display:flex; justify-content:space-between;"><span>Amount:</span><b style="color:#fff;">₹${activeReq.amount.toLocaleString('en-IN')}</b></div>
              <div style="display:flex; justify-content:space-between;"><span>UTR / Txn ID:</span><b style="color:#fff; font-family:monospace;">${activeReq.utr}</b></div>
            </div>

            <!-- Dispute upload receipt form inside support -->
            <div style="background:var(--bg-elevated); border:1px solid var(--border-light); border-radius:10px; padding:12px; box-sizing:border-box;">
              <div style="font-size:0.8rem; font-weight:800; color:#fff; margin-bottom:4px;">Upload Payment Screenshot</div>
              <p style="font-size:0.68rem; color:var(--text-secondary); line-height:1.4; margin-bottom:10px;">Please upload the transaction receipt screenshot to resolve the dispute.</p>
              
              <div style="margin-bottom:10px;">
                <input type="file" id="support-dispute-screenshot-input" accept="image/*" style="display:none;" onchange="previewSupportDisputeScreenshot(event)" />
                <button onclick="document.getElementById('support-dispute-screenshot-input').click()" style="width:100%; border:1px dashed var(--border-light); padding:10px; border-radius:6px; background:none; color:var(--text-muted); font-size:0.7rem; font-weight:600; cursor:pointer;">
                  📷 Choose Screenshot File
                </button>
                <div id="support-dispute-preview-container" style="display:none; text-align:center; margin-top:8px;">
                  <img id="support-dispute-preview-img" src="" style="max-width:100%; max-height:140px; object-fit:contain; border-radius:4px; border:1px solid var(--border-light);" />
                </div>
              </div>
              
              <button onclick="submitSupportQrPaymentDispute()" class="btn-primary" style="width:100%; padding:8px; font-size:0.75rem;">Submit Receipt Screenshot</button>
            </div>
          </div>
        `;
      }
    } else {
      if (supportQrTimerInterval) {
        clearInterval(supportQrTimerInterval);
        supportQrTimerInterval = null;
      }

      container.innerHTML = `
        <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:16px; padding:18px; box-sizing:border-box; margin-bottom:16px;">
          <div style="font-size:0.95rem; font-weight:800; color:#fff; border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:8px; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
            <span>📷 Pay via UPI QR / Verify Deposit</span>
          </div>

          <div style="font-size:0.72rem; color:var(--text-muted); line-height:1.4; margin-bottom:12px;">
            Scan the QR below, complete the payment, choose your payment method, enter details and submit.
          </div>

          <!-- QR Box inside support -->
          <div style="text-align:center; margin-bottom:12px;">
            <div style="background:#fff; padding:6px; border-radius:6px; display:inline-block;">
              <img src="${settings.qrImage || '/assets/qr_payment_default.jpg'}" style="width:120px; height:120px; object-fit:contain; display:block;" onerror="this.src='/assets/qr_payment_default.jpg'" />
            </div>
          </div>

          <!-- UPI ID display copy inside support -->
          <div style="background:var(--bg-elevated); border:1px solid var(--border-light); border-radius:6px; padding:6px 10px; display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <span id="support-qr-pay-upi" style="font-size:0.72rem; font-family:monospace; color:#fff; word-break:break-all; flex:1; text-align:left; margin-right:6px;">${settings.upiId || '9689901416.wallet@phonepe'}</span>
            <button onclick="navigator.clipboard.writeText(document.getElementById('support-qr-pay-upi').textContent); showToast('UPI ID Copied', 'success')" style="background:var(--accent); border:none; border-radius:4px; padding:4px 8px; color:#fff; font-size:0.6rem; font-weight:800; cursor:pointer;">Copy</button>
          </div>

          <div style="display:flex; flex-direction:column; gap:10px; text-align:left;">
            <div>
              <label style="font-size:0.65rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Select Payment Method</label>
              <select id="support-qr-pay-method" class="form-control" style="background:var(--bg-elevated); color:#fff; border:1px solid var(--border-light); border-radius:6px; padding:10px; width:100%; box-sizing:border-box; outline:none; font-size:0.8rem; margin-top:3px;">
                <option value="UPI QR Code (Manual Verify)">UPI QR Code</option>
                <option value="Google Pay">Google Pay</option>
                <option value="PhonePe">PhonePe</option>
                <option value="Paytm">Paytm</option>
              </select>
            </div>
            <div>
              <label style="font-size:0.65rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Deposit Amount (₹)</label>
              <input type="number" id="support-qr-pay-amount" placeholder="e.g. 500" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-light); background:var(--bg-elevated); color:#fff; font-size:0.8rem; outline:none; margin-top:3px; box-sizing:border-box;" />
            </div>
            <div>
              <label style="font-size:0.65rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Enter 12-Digit UTR / Transaction ID</label>
              <input type="text" id="support-qr-pay-utr" placeholder="e.g. 345689012345" maxlength="12" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-light); background:var(--bg-elevated); color:#fff; font-size:0.8rem; outline:none; margin-top:3px; font-family:monospace; box-sizing:border-box; letter-spacing:0.5px;" />
            </div>
          </div>

          <button onclick="submitSupportQrPaymentRequest()" class="btn-primary" style="width:100%; margin-top:16px; padding:10px; font-size:0.8rem;">Submit Payment Request</button>
        </div>
      `;
    }

  } catch(e) {
    console.error('Failed to load support manual payment section:', e);
  }
};

window.previewSupportDisputeScreenshot = function(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const previewContainer = document.getElementById('support-dispute-preview-container');
    const previewImg = document.getElementById('support-dispute-preview-img');
    if (previewImg) previewImg.src = e.target.result;
    if (previewContainer) previewContainer.style.display = 'block';
  };
  reader.readAsDataURL(file);
};

window.submitSupportQrPaymentDispute = async function() {
  const reqId = state.supportActiveQrRequestId;
  if (!reqId) {
    showToast('No active request found to dispute.', 'error');
    return;
  }
  const previewImg = document.getElementById('support-dispute-preview-img');
  if (!previewImg || !previewImg.src.startsWith('data:image')) {
    showToast('Please upload a valid payment screenshot receipt.', 'error');
    return;
  }

  try {
    const res = await fetch(`${SERVER}/api/qr-payment/dispute/${reqId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ screenshot: previewImg.src })
    });
    if (res.ok) {
      showToast('Dispute screenshot submitted successfully! Re-verifying. 🔄', 'success');
      renderSupportManualPayment();
      checkPendingQrPayment();
    } else {
      const err = await res.json();
      showToast(err.error || 'Failed to submit dispute screenshot.', 'error');
    }
  } catch(e) {
    console.error(e);
    showToast('Network error while submitting dispute.', 'error');
  }
};

window.submitSupportQrPaymentRequest = async function() {
  const amtInput = document.getElementById('support-qr-pay-amount');
  const utrInput = document.getElementById('support-qr-pay-utr');
  const amount = Number(amtInput?.value);
  const utr = utrInput?.value.trim();

  if (!amount || amount < 10) {
    showToast('Please enter a valid amount (min ₹10)', 'error');
    return;
  }
  if (!utr || utr.length !== 12 || isNaN(utr)) {
    showToast('Please enter a valid 12-digit UTR number', 'error');
    return;
  }

  try {
    const res = await fetch(`${SERVER}/api/qr-payment/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: state.user.id,
        userName: state.user.name,
        amount,
        utr
      })
    });

    if (res.ok) {
      showToast('Payment request submitted successfully! Pending approval. 🎉', 'success');
      renderSupportManualPayment();
      checkPendingQrPayment();
    } else {
      const err = await res.json();
      showToast(err.error || 'Failed to submit payment request.', 'error');
    }
  } catch(e) {
    console.error(e);
    showToast('Network error. Failed to submit payment request.', 'error');
  }
};

// ────────────────────────────────────────────────────
// MY MATCHES SCREEN CONTROLLERS
// ────────────────────────────────────────────────────
window.switchMatchesTab = function(tab) {
  document.querySelectorAll('#page-my-matches .wallet-tab').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('#page-my-matches .wallet-panel').forEach(el => el.classList.remove('active'));

  if (tab === 'joined') {
    const btn = document.getElementById('btn-matches-joined');
    const panel = document.getElementById('matches-joined-panel');
    if (btn) btn.classList.add('active');
    if (panel) panel.classList.add('active');
  } else {
    const btn = document.getElementById('btn-matches-history');
    const panel = document.getElementById('matches-history-panel');
    if (btn) btn.classList.add('active');
    if (panel) panel.classList.add('active');
  }
};

window.renderMyMatches = function() {
  const joinedContainer = document.getElementById('joined-tournaments-list');
  const historyContainer = document.getElementById('past-matches-list');
  if (!joinedContainer || !historyContainer) return;

  if (!state.loggedIn || !state.user) {
    joinedContainer.innerHTML = `<div class="empty-state"><p>Please login to view matches</p></div>`;
    historyContainer.innerHTML = `<div class="empty-state"><p>Please login to view matches</p></div>`;
    return;
  }

  // Filter tournaments where state.user.id is in t.joinedUsers
  const myJoined = TOURNAMENTS.filter(t => 
    t.status !== 'completed' && 
    t.joinedUsers && 
    t.joinedUsers.some(u => u.userId === state.user.id)
  );

  const myHistory = TOURNAMENTS.filter(t => 
    t.status === 'completed' && 
    t.joinedUsers && 
    t.joinedUsers.some(u => u.userId === state.user.id)
  );

  // Render Joined Panel
  if (myJoined.length === 0) {
    joinedContainer.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
        </svg>
        <p style="margin-top: 10px; color: var(--text-muted);">You haven't joined any active tournaments.</p>
        <button class="btn-primary" onclick="navigate('tournaments')" style="width: auto; padding: 8px 18px; font-size: 0.8rem; margin-top: 12px; border-radius: 20px;">Browse Tournaments</button>
      </div>`;
  } else {
    joinedContainer.innerHTML = myJoined.map(t => tournamentCardHTML(t)).join('');
  }

  // Render History Panel
  if (myHistory.length === 0) {
    historyContainer.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <p style="margin-top: 10px; color: var(--text-muted);">No completed matches history found.</p>
      </div>`;
  } else {
    historyContainer.innerHTML = myHistory.map(t => tournamentCardHTML(t)).join('');
  }
};

// =====================================================
// SIDEBAR DRAWER & USER RATING/FEEDBACK CONTROLLERS
// =====================================================
window.openSidebarDrawer = function() {
  const drawer = document.getElementById('sidebar-drawer');
  const overlay = document.getElementById('sidebar-drawer-overlay');
  if (!drawer || !overlay) {
    alert("Error: sidebar-drawer or sidebar-drawer-overlay not found in DOM! drawer = " + drawer + ", overlay = " + overlay);
    return;
  }

  drawer.classList.add('active');
  overlay.classList.add('active');

  const usernameEl = document.getElementById('drawer-username');
  const balanceEl = document.getElementById('drawer-balance');
  const avatarImg = document.getElementById('drawer-avatar-img');
  const avatarFallback = document.getElementById('drawer-avatar-fallback');

  if (state.loggedIn && state.user) {
    if (usernameEl) usernameEl.textContent = state.user.name || 'Nexora Player';
    if (balanceEl) balanceEl.textContent = `Balance: ₹${(state.user.balance || 0).toLocaleString('en-IN')}`;
    
    if (state.user.avatar && avatarImg) {
      avatarImg.src = state.user.avatar;
      avatarImg.style.display = 'block';
      if (avatarFallback) avatarFallback.style.display = 'none';
    } else {
      if (avatarImg) avatarImg.style.display = 'none';
      if (avatarFallback) {
        avatarFallback.style.display = 'flex';
        avatarFallback.textContent = (state.user.name || 'N').charAt(0).toUpperCase();
      }
    }
  } else {
    if (usernameEl) usernameEl.textContent = 'Guest User';
    if (balanceEl) balanceEl.textContent = 'Sign in to play & win';
    if (avatarImg) avatarImg.style.display = 'none';
    if (avatarFallback) {
      avatarFallback.style.display = 'flex';
      avatarFallback.textContent = 'G';
    }
  }

  const isDark = localStorage.getItem('nexora_theme') === 'dark';
  const themeCheck = document.getElementById('drawer-dark-mode');
  if (themeCheck) themeCheck.checked = isDark;

  renderDrawerSocials();
};

window.closeSidebarDrawer = function() {
  const drawer = document.getElementById('sidebar-drawer');
  const overlay = document.getElementById('sidebar-drawer-overlay');
  if (drawer) drawer.classList.remove('active');
  if (overlay) overlay.classList.remove('active');
};

window.handleDrawerNav = function(page) {
  closeSidebarDrawer();
  navigate(page);
};

window.toggleDarkMode = function(enabled) {
  if (enabled) {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('nexora_theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('nexora_theme', 'light');
  }
};

state.tempRatingScore = 0;

window.openRatingModal = function() {
  closeSidebarDrawer();
  const modal = document.getElementById('rating-feedback-modal');
  if (modal) modal.style.display = 'flex';
  setRatingScore(0);
  const commentInput = document.getElementById('rating-feedback-comment');
  if (commentInput) commentInput.value = '';
};

window.closeRatingModal = function() {
  const modal = document.getElementById('rating-feedback-modal');
  if (modal) modal.style.display = 'none';
};

window.setRatingScore = function(score) {
  state.tempRatingScore = score;
  const stars = document.querySelectorAll('#rating-stars-row .star');
  stars.forEach((star, idx) => {
    if (idx < score) {
      star.classList.add('active');
      star.textContent = '★';
    } else {
      star.classList.remove('active');
      star.textContent = '☆';
    }
  });
};

window.submitRatingFeedback = async function() {
  if (state.tempRatingScore === 0) {
    showToast('Please select a star rating first! ⭐', 'error');
    return;
  }

  const commentInput = document.getElementById('rating-feedback-comment');
  const comment = commentInput ? commentInput.value.trim() : '';
  const userId = (state.loggedIn && state.user) ? state.user.id : 'guest';
  const username = (state.loggedIn && state.user) ? state.user.name : 'Guest User';

  const payload = {
    userId,
    username,
    score: state.tempRatingScore,
    comment
  };

  try {
    const res = await fetch(`${API}/feedbacks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      showToast('Thank you for rating Nexora! ❤️', 'success');
      closeRatingModal();
    } else {
      showToast('Error submitting feedback', 'error');
    }
  } catch(e) {
    console.error(e);
    showToast('Error connecting to server', 'error');
  }
};

window.renderDrawerSocials = function() {
  const row = document.getElementById('drawer-social-icons-row');
  if (!row) return;

  const s = APP_SETTINGS || {};
  const socials = [
    { key: 'Instagram', name: 'Instagram', icon: '📸', url: s.devInstagramUrl, enabled: s.devInstagramEnabled, color: '#e1306c' },
    { key: 'Facebook', name: 'Facebook', icon: '🔵', url: s.devFacebookUrl, enabled: s.devFacebookEnabled, color: '#1877f2' },
    { key: 'YouTube', name: 'YouTube', icon: '🔴', url: s.devYoutubeUrl, enabled: s.devYoutubeEnabled, color: '#ff0000' },
    { key: 'Telegram', name: 'Telegram', icon: '✈️', url: s.devTelegramUrl, enabled: s.devTelegramEnabled, color: '#0088cc' },
    { key: 'Discord', name: 'Discord', icon: '💬', url: s.devDiscordUrl, enabled: s.devDiscordEnabled, color: '#5865f2' },
    { key: 'Twitter', name: 'Twitter/X', icon: '✖️', url: s.devTwitterUrl, enabled: s.devTwitterEnabled, color: '#111111' }
  ];

  let html = '';
  socials.forEach(soc => {
    const isEnabled = soc.enabled !== false && soc.url;
    if (isEnabled) {
      html += `
        <a href="${soc.url}" target="_blank" style="text-decoration:none; display:flex; align-items:center; justify-content:center; width:34px; height:34px; border-radius:50%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); font-size:1.1rem; transition:all 0.2s ease; cursor:pointer;" onmouseover="this.style.background='${soc.color}'; this.style.borderColor='transparent'; this.style.transform='scale(1.1)';" onmouseout="this.style.background='rgba(255,255,255,0.05)'; this.style.borderColor='rgba(255,255,255,0.08)'; this.style.transform='none';">
          ${soc.icon}
        </a>
      `;
    }
  });

  row.innerHTML = html || `<span style="font-size:0.75rem; color:var(--text-muted);">No links configured.</span>`;
};

