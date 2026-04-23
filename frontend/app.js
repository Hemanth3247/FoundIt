const state = {
  currentUser: null,
  postType: 'lost',
  activeChat: null,
  uploadedImageData: null,
  pendingSignup: null,
  nextId: 20,
  theme: 'dark',
  notifications: [],
  notifOpen: false,
  items: [
    { id:1, name:'Black Leather Wallet', desc:'Contains student ID, two bank cards, and some cash. Black bifold leather with a small embossed logo on the front.', category:'Accessories', imageData:null, type:'lost', location:'Library, 2nd Floor', lostdate:'2024-01-15', userid:2, username:'Priya Sharma', usermail:'priya@college.edu', userphone:'9876543210', status:'active' },
    { id:2, name:'AirPods Pro (White)', desc:'White AirPods Pro with charging case. Small scratch on lid. Initials "RM" in marker inside the case.', category:'Electronics', imageData:null, type:'found', location:'Cafeteria, window seats', lostdate:'2024-01-16', userid:3, username:'Rahul Mehta', usermail:'rahul@college.edu', userphone:'9812345678', status:'active' },
    { id:3, name:'Student ID Card', desc:'Student ID card with name and photo. Found near the staircase in Block B.', category:'Documents', imageData:null, type:'lost', location:'Block B Corridor', lostdate:'2024-01-14', userid:4, username:'Sneha Kapoor', usermail:'sneha@college.edu', userphone:'9823456789', status:'active' },
    { id:4, name:'Blue Umbrella', desc:'Large blue umbrella with a wooden curved handle. Initials "MK" in black marker on the handle.', category:'Other', imageData:null, type:'found', location:'Main Gate, Security Desk', lostdate:'2024-01-17', userid:5, username:'Mohan Kumar', usermail:'mohan@college.edu', userphone:'9834567890', status:'active' },
    { id:5, name:'Casio FX-991EX', desc:'Casio scientific calculator. Owner\'s name on the back in pen. Slightly faded display protector.', category:'Stationery', imageData:null, type:'lost', location:'Block C, Lab 304', lostdate:'2024-01-13', userid:6, username:'Aisha Patel', usermail:'aisha@college.edu', userphone:'9845678901', status:'active' },
    { id:6, name:'Bunch of Keys', desc:'4-5 keys on a red keychain with a small cat charm. One key is gold, rest silver.', category:'Keys', imageData:null, type:'found', location:'Girls Hostel Entrance', lostdate:'2024-01-16', userid:7, username:'Deepak Singh', usermail:'deepak@college.edu', userphone:'9856789012', status:'resolved' },
  ],
  chats: {
    2: { name:'Priya Sharma', item:'Black Leather Wallet', messages:[
      { from:'them', text:'Hi, I think I spotted something like that near the library. Can you describe it more?', time:'10:32 AM' },
      { from:'me',   text:'Black bifold leather, small embossed logo on the front cover.', time:'10:34 AM' },
      { from:'them', text:'Yes that sounds right! Come to the library whenever you\'re free.', time:'10:36 AM' }
    ]},
    3: { name:'Rahul Mehta', item:'AirPods Pro', messages:[
      { from:'me',   text:'Hi, are those AirPods still with you?', time:'2:10 PM' },
      { from:'them', text:'Yes! I\'m in the cafeteria till 4pm.', time:'2:15 PM' }
    ]},
  }
};

const catIcons = { Electronics:'⚡', Accessories:'👝', Documents:'📄', Clothing:'👕', Stationery:'✏️', Keys:'🔑', Other:'📦' };

/* ────────── Page routing ────────── */
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

function switchTab(tab, el) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.sb-link').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  el.classList.add('active');
  if (tab === 'feed')     renderFeed('all');
  if (tab === 'messages') renderConvList();
  if (tab === 'account')  renderAccount();
}

/* ────────── Theme ────────── */
function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.body.classList.toggle('light', state.theme === 'light');
  const lbl = document.getElementById('theme-label');
  if (lbl) lbl.textContent = state.theme === 'dark' ? 'Light mode' : 'Dark mode';
}

/* ────────── Notifications ────────── */
function toggleNotifPanel() {
  state.notifOpen = !state.notifOpen;
  document.getElementById('notif-panel').classList.toggle('open', state.notifOpen);
}

document.addEventListener('click', function(e) {
  if (!e.target.closest('.notif-wrap')) {
    state.notifOpen = false;
    const p = document.getElementById('notif-panel');
    if (p) p.classList.remove('open');
  }
});

function addNotification(n) {
  state.notifications.unshift(n);
  updateBadge();
  renderNotifPanel();
}

function clearNotifs() {
  state.notifications = [];
  updateBadge();
  renderNotifPanel();
}

function updateBadge() {
  const badge = document.getElementById('notif-badge');
  if (!badge) return;
  const c = state.notifications.length;
  badge.style.display = c ? 'flex' : 'none';
  badge.textContent = c > 9 ? '9+' : c;
}

function renderNotifPanel() {
  const body = document.getElementById('notif-panel-body');
  if (!body) return;
  if (!state.notifications.length) {
    body.innerHTML = `<div class="notif-empty">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
      <span>No alerts yet</span>
      <span class="notif-empty-hint">AI match alerts appear here</span>
    </div>`;
    return;
  }
  body.innerHTML = state.notifications.map(n => `
    <div class="notif-item" onclick="closeNotifAndOpen(${n.lostId})">
      <div class="notif-item-head">
        <div class="notif-item-icon">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <span class="notif-item-label">AI MATCH</span>
        <span class="notif-item-time">${n.time}</span>
      </div>
      <div class="notif-item-title">${n.title}</div>
      <div class="notif-item-body">${n.body}</div>
    </div>
  `).join('');
}

function closeNotifAndOpen(id) {
  state.notifOpen = false;
  document.getElementById('notif-panel').classList.remove('open');
  openItem(id);
}

/* ────────── AI matching ────────── */
function scoreMatch(a, b) {
  const keys = (a.name + ' ' + a.category).toLowerCase().split(/\s+/);
  const hay  = (b.name + ' ' + b.desc + ' ' + b.category).toLowerCase();
  return keys.reduce((s, k) => s + (k.length > 2 && hay.includes(k) ? 1 : 0), 0);
}

function runAIMatch(newItem) {
  const opposite = newItem.type === 'lost' ? 'found' : 'lost';
  const candidates = state.items.filter(i => i.type === opposite && i.id !== newItem.id && i.status === 'active');
  if (!candidates.length) return;
  const scored = candidates.map(c => ({ item: c, score: scoreMatch(newItem, c) })).filter(m => m.score > 0).sort((a, b) => b.score - a.score);
  if (!scored.length) return;
  const best = scored[0].item;
  const conf = Math.min(95, 60 + scored[0].score * 12);
  const now  = new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
  const lostItem  = newItem.type === 'lost' ? newItem : best;
  const foundItem = newItem.type === 'found' ? newItem : best;
  addNotification({
    lostId: lostItem.id,
    title:  `Possible match: "${lostItem.name}"`,
    body:   `AI found a <strong>${conf}% match</strong> — <strong>"${foundItem.name}"</strong> posted by ${foundItem.username} at ${foundItem.location}.`,
    time: now
  });
  showToast(`AI found a match for "${lostItem.name}"`);
  renderFeed('all');
}

function checkExistingMatches() {
  const lost  = state.items.filter(i => i.type === 'lost'  && i.status === 'active');
  const found = state.items.filter(i => i.type === 'found' && i.status === 'active');
  lost.forEach(l => {
    found.forEach(f => {
      const score = scoreMatch(l, f);
      if (score > 0) {
        const conf = Math.min(95, 60 + score * 12);
        const now  = new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
        state.notifications.push({
          lostId: l.id,
          title:  `Possible match: "${l.name}"`,
          body:   `AI found a <strong>${conf}% match</strong> — <strong>"${f.name}"</strong> posted by ${f.username} at ${f.location}.`,
          time: now
        });
      }
    });
  });
  updateBadge();
  renderNotifPanel();
}

/* ────────── Auth ────────── */
function handleSignup() {
  const collegeid = document.getElementById('signup-collegeid').value.trim();
  const email     = document.getElementById('signup-email').value.trim();
  const pass      = document.getElementById('signup-password').value;
  const conf      = document.getElementById('signup-confirm').value;
  if (!collegeid || !email || !pass) { showToast('Please fill all fields'); return; }
  if (pass !== conf)   { showToast("Passwords don't match"); return; }
  if (pass.length < 8) { showToast('Password must be at least 8 characters'); return; }
  state.pendingSignup = { collegeid, email };
  showPage('page-otp');
  showToast('Code sent to ' + email);
}

function otpMove(el, idx) {
  el.value = el.value.replace(/\D/g, '');
  if (el.value && idx < 6) document.querySelectorAll('.otp-cell')[idx].focus();
}

function verifyOtp() {
  const val = Array.from(document.querySelectorAll('.otp-cell')).map(i => i.value).join('');
  if (val.length < 6) { showToast('Enter the full 6-digit code'); return; }
  const { email, collegeid } = state.pendingSignup;
  const raw = email.split('@')[0].replace(/[^a-zA-Z]/g, '');
  state.currentUser = { name: raw.charAt(0).toUpperCase() + raw.slice(1), email, collegeid, phone: '' };
  showToast('Account created');
  showPage('page-home');
  renderFeed('all');
  setTimeout(checkExistingMatches, 1200);
}

function resendOtp() { showToast('Code resent'); }

function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-password').value;
  if (!email || !pass) { showToast('Please fill all fields'); return; }
  const raw = email.split('@')[0].replace(/[^a-zA-Z]/g, '');
  state.currentUser = { name: raw.charAt(0).toUpperCase() + raw.slice(1), email, collegeid: '22BCE0000', phone: '' };
  showToast('Signed in');
  showPage('page-home');
  renderFeed('all');
  setTimeout(checkExistingMatches, 1200);
}

function handleForgot() {
  const email = document.getElementById('forgot-email').value.trim();
  if (!email) { showToast('Enter your email'); return; }
  showToast('Reset link sent');
  setTimeout(() => showPage('page-login'), 1500);
}

/* ────────── Feed ────────── */
function renderFeed(filter) {
  const grid = document.getElementById('feed-grid');
  let items = state.items.slice();
  if (filter === 'lost')  items = items.filter(i => i.type === 'lost');
  if (filter === 'found') items = items.filter(i => i.type === 'found');
  document.getElementById('feed-count').textContent = items.length + ' items';
  if (!items.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;padding:48px;text-align:center;color:var(--text-3);font-size:13px">No items to show</div>';
    return;
  }
  grid.innerHTML = items.map(item => {
    const hasMatch = state.notifications.some(n => n.lostId === item.id);
    return `
    <div class="item-card${hasMatch ? ' has-match' : ''}" onclick="openItem(${item.id})">
      ${hasMatch ? '<div class="match-chip">AI match found</div>' : ''}
      <div class="item-card-img">
        ${item.imageData
          ? `<img src="${item.imageData}" alt="${item.name}" onerror="this.parentElement.innerHTML='<div class=item-card-img-icon>${catIcons[item.category]||'📦'}</div>'">`
          : `<div class="item-card-img-icon">${catIcons[item.category]||'📦'}</div>`}
      </div>
      <div class="item-card-body">
        <span class="tag ${item.type}-tag">${item.type}</span>
        <div class="item-card-name">${item.name}</div>
        <div class="item-card-cat">${item.category}</div>
        <div class="item-card-loc">${item.location}</div>
        <div class="item-card-date">${fmtDate(item.lostdate)}</div>
      </div>
      <div class="item-card-foot">
        <span class="item-card-user">${item.username}</span>
        <button class="item-card-msg-btn" onclick="event.stopPropagation();goChat(${item.userid},'${esc(item.name)}','${esc(item.username)}')">Message</button>
      </div>
    </div>`;
  }).join('');
}

function filterFeed(f, el) {
  document.querySelectorAll('.fchip').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  renderFeed(f);
}

/* ────────── Item modal ────────── */
function openItem(id) {
  const item = state.items.find(i => i.id === id);
  if (!item) return;
  state.modalItem = item;
  const typeEl = document.getElementById('m-type');
  typeEl.textContent = item.type;
  typeEl.className = 'tag ' + item.type + '-tag';
  document.getElementById('m-status').textContent = item.status;
  document.getElementById('m-name').textContent   = item.name;
  document.getElementById('m-desc').textContent   = item.desc;
  document.getElementById('m-cat').textContent    = item.category;
  document.getElementById('m-loc').textContent    = item.location;
  document.getElementById('m-date').textContent   = fmtDate(item.lostdate);
  document.getElementById('m-user').textContent   = item.username;
  document.getElementById('m-email').textContent  = item.usermail;
  document.getElementById('m-phone').textContent  = item.userphone;
  const img = document.getElementById('m-img');
  const ph  = document.getElementById('m-ph');
  if (item.imageData) { img.src = item.imageData; img.style.display = 'block'; ph.style.display = 'none'; }
  else { img.style.display = 'none'; ph.style.display = 'block'; ph.textContent = catIcons[item.category] || '?'; }
  document.getElementById('modal-overlay').classList.add('open');
}

function closeBgModal(e) { if (e.target.id === 'modal-overlay') closeModal(); }
function closeModal() { document.getElementById('modal-overlay').classList.remove('open'); }

function openChatFromModal() {
  const item = state.modalItem;
  if (!item) return;
  closeModal();
  goChat(item.userid, item.name, item.username);
}

/* ────────── Chat ────────── */
function goChat(userId, itemName, userName) {
  if (!state.chats[userId]) state.chats[userId] = { name: userName, item: itemName, messages: [] };
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.sb-link').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-messages').classList.add('active');
  document.querySelector('[data-tab="messages"]').classList.add('active');
  renderConvList();
  selectConv(userId);
}

function renderConvList() {
  const list = document.getElementById('conv-items');
  const entries = Object.entries(state.chats);
  if (!entries.length) {
    list.innerHTML = '<div style="padding:14px 16px;font-size:12px;color:var(--text-3)">No conversations yet</div>';
    return;
  }
  list.innerHTML = entries.map(([uid, c]) => `
    <div class="conv-row ${state.activeChat == uid ? 'active' : ''}" onclick="selectConv(${uid})">
      <div class="conv-row-name">${c.name}</div>
      <div class="conv-row-preview">${c.messages.length ? c.messages[c.messages.length-1].text : 're: ' + c.item}</div>
    </div>
  `).join('');
}

function selectConv(userId) {
  state.activeChat = userId;
  const c = state.chats[userId];
  document.getElementById('chat-topbar').innerHTML = `
    <div>
      <div class="chat-topbar-name">${c.name}</div>
      <div class="chat-topbar-item">re: ${c.item}</div>
    </div>`;
  const feed = document.getElementById('chat-feed');
  if (!c.messages.length) {
    feed.innerHTML = '<div class="chat-empty"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span>Start the conversation</span></div>';
  } else {
    feed.innerHTML = c.messages.map(m => `
      <div class="bubble-row ${m.from}">
        <div class="bubble ${m.from}">${m.text}<div class="bubble-ts">${m.time}</div></div>
      </div>`).join('');
    feed.scrollTop = feed.scrollHeight;
  }
  document.getElementById('chat-input-bar').style.display = 'flex';
  renderConvList();
}

function sendMsg() {
  const input = document.getElementById('chat-input');
  const text  = input.value.trim();
  if (!text || !state.activeChat) return;
  const time = new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
  state.chats[state.activeChat].messages.push({ from:'me', text, time });
  input.value = '';
  selectConv(state.activeChat);
  setTimeout(() => {
    const replies = ['Got it, thanks!', 'Sure, when can we meet?', 'Sounds good.', 'Let me check and get back to you.', 'Yes, still with me!'];
    const t = new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
    state.chats[state.activeChat].messages.push({ from:'them', text: replies[Math.floor(Math.random() * replies.length)], time: t });
    selectConv(state.activeChat);
  }, 700 + Math.random() * 800);
}

/* ────────── Post form ────────── */
function setPostType(type, el) {
  state.postType = type;
  document.querySelectorAll('.ttoggle').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}

function handleFileSelect(input) { if (input.files[0]) processImageFile(input.files[0]); }

function dragOver(e)  { e.preventDefault(); document.getElementById('upload-zone').classList.add('drag-over'); }
function dragLeave()  { document.getElementById('upload-zone').classList.remove('drag-over'); }
function dropFile(e)  {
  e.preventDefault();
  document.getElementById('upload-zone').classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) processImageFile(file);
  else showToast('Please drop an image file');
}

function processImageFile(file) {
  if (file.size > 10 * 1024 * 1024) { showToast('Image must be under 10MB'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    state.uploadedImageData = e.target.result;
    document.getElementById('upload-preview').src = e.target.result;
    document.getElementById('upload-preview').style.display = 'block';
    document.getElementById('upload-prompt').style.display = 'none';
  };
  reader.readAsDataURL(file);
}

function submitPost() {
  const name     = document.getElementById('p-name').value.trim();
  const desc     = document.getElementById('p-desc').value.trim();
  const category = document.getElementById('p-category').value;
  const location = document.getElementById('p-location').value.trim();
  const date     = document.getElementById('p-date').value;
  const username = document.getElementById('p-username').value.trim();
  const phone    = document.getElementById('p-phone').value.trim();
  if (!name || !desc || !category || !location || !date || !username) { showToast('Please fill all required fields'); return; }
  const user = state.currentUser || { email: 'user@college.edu' };
  const newItem = { id: state.nextId++, name, desc, category, imageData: state.uploadedImageData, type: state.postType, location, lostdate: date, userid: 1, username, usermail: user.email, userphone: phone, status: 'active' };
  state.items.unshift(newItem);
  state.uploadedImageData = null;
  document.getElementById('upload-preview').style.display = 'none';
  document.getElementById('upload-prompt').style.display  = 'flex';
  ['p-name','p-desc','p-location','p-date','p-username','p-phone'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('p-category').value = '';
  document.getElementById('file-input').value = '';
  showToast('Post published');
  setTimeout(() => runAIMatch(newItem), 1500);
}

/* ────────── Account ────────── */
function renderAccount() {
  const user = state.currentUser || { name:'John Doe', email:'john@college.edu', collegeid:'22BCE1234', phone:'' };
  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
  document.getElementById('acc-avatar').textContent = initials;
  document.getElementById('acc-name').textContent   = user.name;
  document.getElementById('acc-email').textContent  = user.email;
  document.getElementById('acc-id').textContent     = user.collegeid;
  document.getElementById('edit-name').value  = user.name;
  document.getElementById('edit-phone').value = user.phone || '';
  const mine = state.items.filter(i => i.userid === 1);
  document.getElementById('my-posts-list').innerHTML = mine.length
    ? mine.map(i => `<div class="mypost-row"><span class="mypost-name">${i.name}</span><span class="tag ${i.type}-tag" style="font-size:10px">${i.type}</span></div>`).join('')
    : '<div style="font-size:12px;color:var(--text-3);padding:4px 0">No posts yet</div>';
}

function saveProfile() {
  const name  = document.getElementById('edit-name').value.trim();
  const phone = document.getElementById('edit-phone').value.trim();
  if (!name) { showToast("Name can't be empty"); return; }
  if (state.currentUser) { state.currentUser.name = name; state.currentUser.phone = phone; }
  renderAccount();
  showToast('Saved');
}

/* ────────── Helpers ────────── */
function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
}
function esc(s) { return (s||'').replace(/'/g, "\\'"); }

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2400);
}

document.addEventListener('DOMContentLoaded', () => {
  const d = document.getElementById('p-date');
  if (d) d.valueAsDate = new Date();
});
