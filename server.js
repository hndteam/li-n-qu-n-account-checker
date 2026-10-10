import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = Number(process.env.PORT || 3000);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supportedProviders = ['mock', 'public-api', 'scraper'];

const mockProfiles = {
  'hero-001': {
    accountId: 'hero-001',
    nickname: 'SkyBlade',
    server: 'Hạ Long',
    level: 65,
    rank: 'Vô địch',
    winRate: 58.2,
    matches: 1280,
    status: 'Hoạt động',
    lastUpdated: '2026-10-10T12:00:00Z',
    avatar: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80'
  },
  'hero-002': {
    accountId: 'hero-002',
    nickname: 'DragonFang',
    server: 'Hà Nội',
    level: 52,
    rank: 'Bạch Kim',
    winRate: 49.6,
    matches: 820,
    status: 'Bị khóa tạm thời',
    lastUpdated: '2026-10-10T09:15:00Z',
    avatar: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80'
  }
};

function getMockProfile(input) {
  const query = (input.nickname || input.accountId || '').trim().toLowerCase();

  if (!query) {
    return {
      error: 'Bạn cần nhập nickname hoặc accountId để kiểm tra.'
    };
  }

  const match = mockProfiles[query] || Object.values(mockProfiles).find((profile) =>
    profile.nickname.toLowerCase() === query || profile.accountId.toLowerCase() === query
  );

  if (!match) {
    return {
      found: false,
      message: 'Không tìm thấy account mẫu phù hợp với dữ liệu demo.'
    };
  }

  return {
    found: true,
    source: 'mock',
    ...match
  };
}

async function getPublicApiProfile(input) {
  const baseUrl = process.env.LIENQUAN_API_URL;
  const token = process.env.LIENQUAN_API_TOKEN;

  if (!baseUrl) {
    return {
      configured: false,
      provider: 'public-api',
      message: 'Chưa cấu hình LIENQUAN_API_URL. Hãy thêm env trong file .env.'
    };
  }

  const params = new URLSearchParams({
    nickname: input.nickname || '',
    accountId: input.accountId || '',
    server: input.server || ''
  });

  const response = await fetch(`${baseUrl}?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  if (!response.ok) {
    const text = await response.text();
    return {
      configured: true,
      provider: 'public-api',
      success: false,
      code: response.status,
      message: 'Lỗi từ provider public-api',
      details: text
    };
  }

  const payload = await response.json();
  return {
    configured: true,
    provider: 'public-api',
    success: true,
    data: payload
  };
}

async function getScraperProfile(input) {
  const baseUrl = process.env.LIENQUAN_SCRAPER_URL;

  if (!baseUrl) {
    return {
      configured: false,
      provider: 'scraper',
      message: 'Chưa cấu hình LIENQUAN_SCRAPER_URL. Dùng dữ liệu mock hoặc API công khai.'
    };
  }

  const response = await fetch(`${baseUrl}/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nickname: input.nickname,
      accountId: input.accountId,
      server: input.server
    })
  });

  if (!response.ok) {
    const text = await response.text();
    return {
      configured: true,
      provider: 'scraper',
      success: false,
      code: response.status,
      message: 'Lỗi từ provider scraper',
      details: text
    };
  }

  const payload = await response.json();
  return {
    configured: true,
    provider: 'scraper',
    success: true,
    data: payload
  };
}

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    app: 'Liên Quân Account Checker',
    timestamp: new Date().toISOString(),
    providers: supportedProviders
  });
});

app.get('/api/providers', (req, res) => {
  res.json({
    providers: supportedProviders.map((provider) => ({
      name: provider,
      enabled: provider === 'mock' || !!process.env[`LIENQUAN_${provider.toUpperCase().replace(/-/g, '_')}_URL`]
    }))
  });
});

app.post('/api/check-account', async (req, res) => {
  try {
    const { nickname, accountId, server, provider = 'mock' } = req.body || {};

    if (!nickname && !accountId) {
      return res.status(400).json({
        success: false,
        message: 'Bạn cần nhập nickname hoặc accountId.'
      });
    }

    const selectedProvider = supportedProviders.includes(provider) ? provider : 'mock';

    let result;

    switch (selectedProvider) {
      case 'mock':
        result = getMockProfile({ nickname, accountId, server });
        break;
      case 'public-api':
        result = await getPublicApiProfile({ nickname, accountId, server });
        break;
      case 'scraper':
        result = await getScraperProfile({ nickname, accountId, server });
        break;
      default:
        result = getMockProfile({ nickname, accountId, server });
    }

    return res.json({
      success: true,
      provider: selectedProvider,
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi kiểm tra tài khoản.',
      error: error.message
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Liên Quân Account Checker running on http://localhost:${port}`);
});
