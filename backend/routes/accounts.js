import express from 'express';
import { Account } from '../models/mongo/Account.js';
import { CheckHistory } from '../models/mongo/CheckHistory.js';

export const accountRouter = express.Router();

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

async function getMockProfile(input) {
  const query = (input.nickname || input.accountId || '').trim().toLowerCase();
  const match = mockProfiles[query] || Object.values(mockProfiles).find(
    (p) => p.nickname.toLowerCase() === query || p.accountId.toLowerCase() === query
  );

  if (!match) {
    throw new Error('Account not found in mock data');
  }

  return { found: true, source: 'mock', ...match };
}

accountRouter.post('/check', async (req, res) => {
  try {
    const { nickname, accountId, server, provider = 'mock' } = req.body;
    const userId = req.user.id;

    if (!nickname && !accountId) {
      return res.status(400).json({ success: false, message: 'Nickname or accountId required' });
    }

    const history = new CheckHistory({
      userId,
      nickname,
      accountId,
      server,
      provider,
      status: 'pending',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    let result;

    try {
      if (provider === 'mock') {
        result = await getMockProfile({ nickname, accountId, server });
      } else {
        throw new Error('Only mock provider available. Configure API_URL for other providers.');
      }

      history.result = result;
      history.status = 'success';
    } catch (error) {
      history.status = 'error';
      history.errorMessage = error.message;
      throw error;
    } finally {
      await history.save();
    }

    const account = new Account({
      userId,
      ...result,
      provider,
      lastUpdated: new Date()
    });

    await account.save();

    res.json({
      success: true,
      provider,
      data: result,
      historyId: history._id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

accountRouter.get('/saved', async (req, res) => {
  try {
    const accounts = await Account.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, accounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

accountRouter.delete('/:id', async (req, res) => {
  try {
    const account = await Account.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }
    res.json({ success: true, message: 'Account deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
