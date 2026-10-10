const state = {
  token: localStorage.getItem('lq_token') || '',
  mode: 'login',
  user: JSON.parse(localStorage.getItem('lq_user') || 'null')
};

const form = document.getElementById('checkForm');
const statusBox = document.getElementById('status');
const resultBox = document.getElementById('result');
const historyList = document.getElementById('historyList');
const savedAccountsList = document.getElementById('savedAccountsList');
const adminStats = document.getElementById('adminStats');
const userTable = document.getElementById('userTable');
const authModal = document.getElementById('authModal');

const fields = {
  nickname: document.getElementById('nickname'),
  accountId: document.getElementById('accountId'),
  server: document.getElementById('server'),
  provider: document.getElementById('provider')
};

const display = {
  nickname: document.getElementById('nicknameDisplay'),
  server: document.getElementById('serverDisplay'),
  rank: document.getElementById('rankDisplay'),
  level: document.getElementById('levelDisplay'),
  winRate: document.getElementById('winRateDisplay'),
  matches: document.getElementById('matchesDisplay'),
  status: document.getElementById('statusDisplay'),
  avatar: document.getElementById('avatar'),
  raw: document.getElementById('rawOutput')
};

function setStatus(message, type = 'success') {
  statusBox.textContent = message;
  statusBox.className = `status ${type}`;
  statusBox.classList.remove('hidden');
}

function renderResult(result) {
  const payload = result?.data ?? result;
  const account = payload?.found ? payload : payload?.data || payload;

  if (!account || (!account.nickname && !account.accountId)) {
    setStatus('Không có dữ liệu tài khoản hợp lệ.', 'error');
    resultBox.classList.add('hidden');
    return;
  }

  display.nickname.textContent = account.nickname || 'Không rõ';
  display.server.textContent = `Server: ${account.server || 'Không rõ'}`;
  display.rank.textContent = `Rank: ${account.rank || 'Không rõ'}`;
  display.level.textContent = account.level ?? '-';
  display.winRate.textContent = `${account.winRate ?? '-'}%`;
  display.matches.textContent = account.matches ?? '-';
  display.status.textContent = account.status || 'Không rõ';
  display.avatar.src = account.avatar || 'https://via.placeholder.com/120';
  display.raw.textContent = JSON.stringify(account, null, 2);

  resultBox.classList.remove('hidden');
}

async function apiFetch(url, options = {}, requireAuth = true) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };

  if (requireAuth && state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(url, { ...options, headers });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Request failed');
  }

  return result;
}

async function loadHistory() {
  try {
    const result = await apiFetch('/api/history');
    const items = result.history || [];

    historyList.innerHTML = items.length ? items.map(item => `
      <div class="list-row">
        <strong>${item.nickname || 'N/A'}</strong>
        <span>${item.accountId || 'N/A'}</span>
        <span>${item.provider || 'mock'}</span>
        <span class="badge ${item.status === 'success' ? 'success' : 'error'}">${item.status}</span>
        <span>${new Date(item.createdAt).toLocaleDateString()}</span>
      </div>
    `).join('') : '<div class="list-row"><span>Chưa có lịch sử kiểm tra.</span></div>';

    const stats = await apiFetch('/api/history/stats');
    document.getElementById('totalChecks').textContent = stats.stats.total;
    document.getElementById('successChecks').textContent = stats.stats.success;
    document.getElementById('errorChecks').textContent = stats.stats.error;
    document.getElementById('successRate').textContent = `${stats.stats.successRate}%`;
  } catch (error) {
    historyList.innerHTML = '<div class="list-row"><span>Không thể tải lịch sử.</span></div>';
  }
}

async function loadSavedAccounts() {
  try {
    const result = await apiFetch('/api/accounts/saved');
    const items = result.accounts || [];

    savedAccountsList.innerHTML = items.length ? items.map(item => `
      <div class="list-row">
        <strong>${item.nickname || 'N/A'}</strong>
        <span>${item.accountId || 'N/A'}</span>
        <span>${item.server || 'N/A'}</span>
        <span>${item.rank || 'N/A'}</span>
        <span>${item.level || '-'}</span>
      </div>
    `).join('') : '<div class="list-row"><span>Chưa có tài khoản nào được lưu.</span></div>';
  } catch (error) {
    savedAccountsList.innerHTML = '<div class="list-row"><span>Không thể tải tài khoản đã lưu.</span></div>';
  }
}

async function loadAdminStats() {
  try {
    const result = await apiFetch('/api/admin/stats');
    const stats = result.stats;
    adminStats.innerHTML = `
      <div class="stat-card accent-blue"><label>Total users</label><strong>${stats.totalUsers}</strong></div>
      <div class="stat-card accent-green"><label>Total checks</label><strong>${stats.totalChecks}</strong></div>
      <div class="stat-card accent-purple"><label>Success rate</label><strong>${stats.successRate}%</strong></div>
    `;

    const users = await apiFetch('/api/admin/users');
    userTable.innerHTML = users.users.map(user => `
      <div class="list-row">
        <strong>${user.profile?.name || user.email}</strong>
        <span>${user.email}</span>
        <span>${user.role}</span>
        <span>${user.isActive ? 'Active' : 'Inactive'}</span>
      </div>
    `).join('');
  } catch (error) {
    adminStats.innerHTML = '<div class="stat-card"><label>Admin</label><strong>Access denied</strong></div>';
    userTable.innerHTML = '<div class="list-row"><span>Không có quyền admin.</span></div>';
  }
}

function showAuthModal() {
  authModal.classList.remove('hidden');
}

function hideAuthModal() {
  authModal.classList.add('hidden');
}

function updateUserUI() {
  const userName = document.getElementById('userName');
  const userEmail = document.getElementById('userEmail');

  if (state.user) {
    userName.textContent = state.user.name || state.user.email?.split('@')[0] || 'User';
    userEmail.textContent = state.user.email || 'No email';
  } else {
    userName.textContent = 'Guest';
    userEmail.textContent = 'Please login';
  }
}

function ensureAuth() {
  const isAuthed = !!state.token;
  if (!isAuthed) {
    showAuthModal();
  } else {
    hideAuthModal();
    updateUserUI();
    loadHistory();
    loadSavedAccounts();
    loadAdminStats();
  }
}

async function handleLoginSubmit(event) {
  event.preventDefault();

  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;
  const name = document.getElementById('authName').value.trim();

  const endpoint = state.mode === 'register' ? '/api/auth/register' : '/api/auth/login';

  try {
    const result = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });

    const payload = await result.json();
    if (!result.ok) {
      throw new Error(payload.message || 'Authentication failed');
    }

    state.token = payload.token;
    state.user = payload.user;
    localStorage.setItem('lq_token', state.token);
    localStorage.setItem('lq_user', JSON.stringify(state.user));
    hideAuthModal();
    updateUserUI();
    loadHistory();
    loadSavedAccounts();
    loadAdminStats();
  } catch (error) {
    alert(error.message);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!state.token) {
    showAuthModal();
    return;
  }

  const body = {
    nickname: fields.nickname.value.trim(),
    accountId: fields.accountId.value.trim(),
    server: fields.server.value.trim(),
    provider: fields.provider.value
  };

  if (!body.nickname && !body.accountId) {
    setStatus('Vui lòng nhập nickname hoặc accountId.', 'error');
    resultBox.classList.add('hidden');
    return;
  }

  try {
    setStatus('Đang kiểm tra...', 'success');
    const result = await apiFetch('/api/accounts/check', {
      method: 'POST',
      body: JSON.stringify(body)
    }, true);

    setStatus(`Đã kiểm tra bằng provider: ${result.provider}`, 'success');
    renderResult(result);
    loadHistory();
    loadSavedAccounts();
  } catch (error) {
    setStatus(error.message, 'error');
    resultBox.classList.add('hidden');
  }
});

const navItems = document.querySelectorAll('.nav-item');
navItems.forEach(item => {
  item.addEventListener('click', () => {
    navItems.forEach(x => x.classList.remove('active'));
    item.classList.add('active');
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === item.dataset.tab);
    });
  });
});

const authTabs = document.querySelectorAll('.auth-tab');
authTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    state.mode = tab.dataset.mode;
    authTabs.forEach(btn => btn.classList.toggle('active', btn === tab));
    const nameField = document.getElementById('nameField');
    document.getElementById('authSubmit').textContent = state.mode === 'register' ? 'Register' : 'Login';
    nameField.classList.toggle('hidden', state.mode !== 'register');
  });
});

document.getElementById('authForm').addEventListener('submit', handleLoginSubmit);
document.getElementById('logoutBtn').addEventListener('click', () => {
  state.token = '';
  state.user = null;
  localStorage.removeItem('lq_token');
  localStorage.removeItem('lq_user');
  updateUserUI();
  showAuthModal();
});

document.getElementById('exportCsvBtn').addEventListener('click', async () => {
  if (!state.token) return showAuthModal();
  window.location.href = '/api/export/history/csv';
});

document.getElementById('exportExcelBtn').addEventListener('click', async () => {
  if (!state.token) return showAuthModal();
  window.location.href = '/api/export/history/excel';
});

updateUserUI();
ensureAuth();
