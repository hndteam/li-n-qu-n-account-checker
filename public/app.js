const form = document.getElementById('checkForm');
const statusBox = document.getElementById('status');
const resultBox = document.getElementById('result');

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

form.addEventListener('submit', async (event) => {
  event.preventDefault();

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
    const response = await fetch('/api/check-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const result = await response.json();

    if (!response.ok || result?.success === false) {
      throw new Error(result?.message || 'Không thể kiểm tra tài khoản.');
    }

    setStatus(`Đã kiểm tra bằng provider: ${result.provider}`, 'success');
    renderResult(result);
  } catch (error) {
    setStatus(error.message, 'error');
    resultBox.classList.add('hidden');
  }
});
