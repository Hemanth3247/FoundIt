function showLoader() {
  const el = document.getElementById('loader-overlay');
  el.style.display = 'flex';
  requestAnimationFrame(() => el.classList.add('active'));
}
function hideLoader() {
  const el = document.getElementById('loader-overlay');
  el.classList.remove('active');
  setTimeout(() => { el.style.display = 'none'; }, 220);
}

function api(path,data) {
  const baseUrl = window.API_BASE_URL || 'http://localhost:8000';
  return fetch(baseUrl + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
}

const state = {
  currentUser: null,
  postType: 'lost',
  activeChat: null,
  uploadedImageData: null,
  pendingSignup: null,
  theme: 'dark',
  notifications: [],
  notifOpen: false,
  items: [],
  chats: {}
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
  if (tab === 'feed')     loadFeed();
  if (tab === 'messages') loadConversations();
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
  openItem(String(id));
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
async function sha256(text) {
  const bytes = new TextEncoder().encode(text);

  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    bytes
  );

  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

function handleSignup() {
  const collegeid = document.getElementById('signup-collegeid').value.trim();
  const email     = document.getElementById('signup-email').value.trim();
  const pass      = document.getElementById('signup-password').value;
  const conf      = document.getElementById('signup-confirm').value;
  if (!collegeid || !email || !pass) { showToast('Please fill all fields'); return; }
  if (pass !== conf)   { showToast("Passwords don't match"); return; }
  if (pass.length < 8) { showToast('Password must be at least 8 characters'); return; }
  sha256(pass).then(passhash => {
    state.pendingSignup = { collegeid, email, passhash };
    showLoader();
    api("/signup/start", { "collegeid": collegeid, "email": email, "password_hash": passhash }).then(res => res.json()).then(data => {
      hideLoader();
      showPage('page-otp');
      showToast('Code sent to ' + email);
    }).catch(err => {
      hideLoader();
      showToast('Error sending OTP');
      console.error(err);
    });
  });
}

function otpMove(el, idx) {
  el.value = el.value.replace(/\D/g, '');
  if (el.value && idx < 6) document.querySelectorAll('.otp-cell')[idx].focus();
}

function verifyOtp() {
  const val = Array.from(document.querySelectorAll('.otp-cell')).map(i => i.value).join('');
  if (val.length < 6) { showToast('Enter the full 6-digit code'); return; }
  const { email, collegeid, passhash } = state.pendingSignup;
  const raw = email.split('@')[0].replace(/[^a-zA-Z]/g, '');
  state.currentUser = { name: raw.charAt(0).toUpperCase() + raw.slice(1), email, collegeid, phone: '' };
  showLoader();
  api("/signup/verify", { "email": email, "otp": val, "collegeid": collegeid, "password_hash": passhash }).then(res => res.json()).then(data => {
    hideLoader();
    if (data.is_verified) {
      showToast('Account created');
      showPage('page-home');
      loadFeed();
      setTimeout(checkExistingMatches, 1200);
    }
    else {
      showToast('Incorrect code, please try again');
    }
  }).catch(err => {
    hideLoader();
    showToast('Error verifying OTP');
    console.error(err);
  });
}

function resendOtp() { 
  const { collegeid, email, passhash } = state.pendingSignup;
  showLoader();
  api("/signup/resend", { "collegeid": collegeid, "email": email, "password_hash": passhash }).then(res => res.json()).then(data => {
    hideLoader();
    showToast('Code sent to ' + email);
  }).catch(err => {
    hideLoader();
    showToast('Error resending OTP');
    console.error(err);
  });
}

function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-password').value;
  if (!email || !pass) { showToast('Please fill all fields'); return; }
  sha256(pass).then(passhash => {
    showLoader();
    api('/login', { email, password_hash: passhash })
      .then(r => r.json())
      .then(data => {
        hideLoader();
        if (data.success && data.user) {
          const u = data.user;
          const raw = email.split('@')[0].replace(/[^a-zA-Z]/g, '');
          state.currentUser = {
            name: raw.charAt(0).toUpperCase() + raw.slice(1),
            email: u.email,
            collegeid: u.collegeid,
            phone: ''
          };
          showToast('Signed in');
          showPage('page-home');
          loadFeed();
          setTimeout(checkExistingMatches, 1200);
        } else {
          showToast(data.message || 'Incorrect credentials');
        }
      })
      .catch(() => { hideLoader(); showToast('Login failed'); });
  });
}

function handleForgot() {
  const email = document.getElementById('forgot-email').value.trim();
  if (!email) { showToast('Enter your email'); return; }
  showToast('Reset link sent');
  setTimeout(() => showPage('page-login'), 1500);
}

/* ────────── AI match polling ────────── */
function pollMatches(userid) {
  const baseUrl = window.API_BASE_URL || 'http://localhost:8000';
  fetch(`${baseUrl}/matches/${userid}`)
    .then(res => res.json())
    .then(data => {
      if (data.matches && data.matches.length) {
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        data.matches.forEach(m => {
          const conf = Math.round(m.score * 100);
          addNotification({
            lostId: m.matched_item_id,
            title: `AI match for "${m.new_item_name}"`,
            body: `<strong>${conf}% visual match</strong> with <strong>"${m.matched_item_name}"</strong> at ${m.matched_item_location}.`,
            time: now
          });
        });
        showToast(`AI found ${data.matches.length} match${data.matches.length > 1 ? 'es' : ''}!`);
      }
    })
    .catch(() => {});
}

/* ────────── Feed ────────── */
function loadFeed() {
  const baseUrl = window.API_BASE_URL || 'http://localhost:8000';
  fetch(baseUrl + '/items')
    .then(res => res.json())
    .then(data => {
      if (data.success && data.items.length) {
        state.items = data.items.map(item => ({
          id: item._id,
          name: item.item_name,
          desc: item.item_description,
          category: item.item_category,
          imageData: item.image_url || null,
          type: item.type,
          location: item.location,
          lostdate: item.date,
          userid: item.userid,
          username: item.usercollegeid,
          usermail: item.usermail,
          userphone: item.userphone || '',
          status: item.status
        }));
      }
      renderFeed('all');
    })
    .catch(() => renderFeed('all'));
}

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
    <div class="item-card${hasMatch ? ' has-match' : ''}" onclick="openItem('${item.id}')">
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
        <button class="item-card-msg-btn" onclick="event.stopPropagation();goChat('${item.userid}','${item.id}','${esc(item.name)}','${esc(item.username)}')">Message</button>
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
  const item = state.items.find(i => String(i.id) === String(id));
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
  goChat(item.userid, item.id, item.name, item.username);
}

/* ────────── Chat ────────── */
let _msgPollTimer = null;

function goChat(receiverId, itemId, itemName, userName) {
  const key = `${receiverId}_${itemId}`;
  if (!state.chats[key]) state.chats[key] = { receiverId, itemId, name: userName, item: itemName, messages: [] };
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.sb-link').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-messages').classList.add('active');
  document.querySelector('[data-tab="messages"]').classList.add('active');
  loadConversations();
  selectConv(key);
}

function loadConversations() {
  if (!state.currentUser) return;
  const baseUrl = window.API_BASE_URL || 'http://localhost:8000';
  fetch(`${baseUrl}/conversations/${state.currentUser.collegeid}`)
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        data.conversations.forEach(c => {
          const key = `${c.other_user_id}_${c.item_id}`;
          if (!state.chats[key]) {
            state.chats[key] = { receiverId: c.other_user_id, itemId: c.item_id, name: c.other_user_id, item: c.item_id, messages: [] };
          }
          state.chats[key].lastMsg = c.last_message;
        });
        renderConvList();
      }
    }).catch(() => {});
}

function renderConvList() {
  const list = document.getElementById('conv-items');
  const entries = Object.entries(state.chats);
  if (!entries.length) {
    list.innerHTML = '<div style="padding:14px 16px;font-size:12px;color:var(--text-3)">No conversations yet</div>';
    return;
  }
  list.innerHTML = entries.map(([key, c]) => `
    <div class="conv-row ${state.activeChat === key ? 'active' : ''}" onclick="selectConv('${key}')">
      <div class="conv-row-name">${c.name}</div>
      <div class="conv-row-preview">${c.lastMsg || 're: ' + c.item}</div>
    </div>
  `).join('');
}

function selectConv(key) {
  const c = state.chats[key];
  if (!c) return;
  state.activeChat = key;
  document.getElementById('chat-topbar').innerHTML = `
    <div>
      <div class="chat-topbar-name">${c.name}</div>
      <div class="chat-topbar-item">re: ${c.item}</div>
    </div>`;
  renderConvList();
  fetchMessages(key);
  clearInterval(_msgPollTimer);
  _msgPollTimer = setInterval(() => fetchMessages(key), 4000);
}

function fetchMessages(key) {
  if (!state.currentUser) return;
  const c = state.chats[key];
  const baseUrl = window.API_BASE_URL || 'http://localhost:8000';
  const myId = state.currentUser.collegeid;
  fetch(`${baseUrl}/messages/${myId}/${c.receiverId}/${c.itemId}`)
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        state.chats[key].messages = data.messages.map(m => ({
          from: m.sender_id === myId ? 'me' : 'them',
          text: m.text,
          time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        renderChatFeed(key);
      }
    }).catch(() => {});
}

function renderChatFeed(key) {
  const c = state.chats[key];
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
}

function sendMsg() {
  const input = document.getElementById('chat-input');
  const text  = input.value.trim();
  if (!text) return;
  if (!state.currentUser) { showToast('Please sign in to send messages'); return; }
  if (!state.activeChat) return;
  const c = state.chats[state.activeChat];
  const baseUrl = window.API_BASE_URL || 'http://localhost:8000';
  const formData = new FormData();
  formData.append('sender_id', state.currentUser.collegeid);
  formData.append('receiver_id', c.receiverId);
  formData.append('item_id', c.itemId);
  formData.append('text', text);
  input.value = '';
  fetch(`${baseUrl}/messages/send`, { method: 'POST', body: formData })
    .then(r => r.json())
    .then(data => {
      if (data.success) fetchMessages(state.activeChat);
      else showToast('Send failed: ' + (data.message || 'unknown error'));
    }).catch(err => { showToast('Message error: ' + err.message); });
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
  const fileInput = document.getElementById('file-input');
  if (!name || !desc || !category || !location || !date || !username) { showToast('Please fill all required fields'); return; }
  if (!fileInput.files[0]) { showToast('Please upload a photo'); return; }

  const user = state.currentUser || { email: 'user@college.edu', collegeid: 'unknown' };
  const formData = new FormData();
  formData.append('name', name);
  formData.append('description', desc);
  formData.append('category', category);
  formData.append('image', fileInput.files[0]);
  formData.append('type', state.postType);
  formData.append('location', location);
  formData.append('date', date);
  formData.append('userid', user.collegeid || 'unknown');
  formData.append('usercollegeid', user.collegeid || 'unknown');
  formData.append('usermail', user.email);
  formData.append('userphone', phone);
  formData.append('status', 'active');

  const baseUrl = window.API_BASE_URL || 'http://localhost:8000';
  showLoader();
  fetch(baseUrl + '/additem', { method: 'POST', body: formData })
    .then(res => res.json())
    .then(data => {
      hideLoader();
      if (data.success) {
        state.uploadedImageData = null;
        document.getElementById('upload-preview').style.display = 'none';
        document.getElementById('upload-prompt').style.display  = 'flex';
        ['p-name','p-desc','p-location','p-date','p-username','p-phone'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('p-category').value = '';
        fileInput.value = '';
        showToast('Post published — AI matching running...');
        loadFeed();
        const postedBy = (state.currentUser && state.currentUser.collegeid) || 'unknown';
        setTimeout(() => pollMatches(postedBy), 4000);
      } else {
        showToast(data.message || 'Failed to post item');
      }
    })
    .catch(err => { hideLoader(); showToast('Error posting item'); console.error(err); });
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
  const mine = state.items.filter(i => i.userid === user.collegeid);
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
