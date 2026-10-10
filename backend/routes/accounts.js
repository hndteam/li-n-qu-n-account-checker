import express from 'express';
import { Account } from '../models/mongo/Account.js';
import { CheckHistory } from '../models/mongo/CheckHistory.js';
import { checkAccount, getSupportedProviders, checkProviderHealth } from '../services/accountProvider.js';

export const accountRouter = express.Router();

/**
 * GET /api/accounts/providers
 * Get list of available providers
 */
accountRouter.get('/providers', (req, res) => {
  try {
    const providers = getSupportedProviders();
    res.json({
      success: true,
      providers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/accounts/providers/health
 * Check health status of all providers
 */
accountRouter.get('/providers/health', async (req, res) => {
  try {
    const providers = Object.keys(getSupportedProviders());
    const health = await Promise.all(
      providers.map((provider) => checkProviderHealth(provider))
    );

    res.json({
      success: true,
      health
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/accounts/check
 * Check account with specified provider
 * Body: { nickname, accountId, server, provider }
 */
accountRouter.post('/check', async (req, res) => {
  try {
    const { nickname, accountId, server, provider = 'lienquan_data' } = req.body;
    const userId = req.user.id;

    if (!nickname && !accountId) {
      return res.status(400).json({
        success: false,
        message: 'Nickname or accountId required'
      });
    }

    // Create history record
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
      // Check account with selected provider
      result = await checkAccount(
        { nickname, accountId, server },
        provider
      );

      history.result = result;
      history.status = 'success';
    } catch (error) {
      history.status = 'error';
      history.errorMessage = error.message;
      await history.save();
      throw error;
    }

    // Save history
    await history.save();

    // Save to accounts collection
    const account = new Account({
      userId,
      accountId: result.accountId || accountId,
      nickname: result.nickname || nickname,
      server: result.server || server,
      level: result.level,
      rank: result.rank,
      winRate: result.winRate,
      matches: result.matches,
      status: result.status,
      avatar: result.avatar,
      provider,
      rawData: result
    });

    await account.save();

    res.json({
      success: true,
      provider,
      data: result,
      historyId: history._id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/accounts/saved
 * Get user's saved accounts
 */
accountRouter.get('/saved', async (req, res) => {
  try {
    const { limit = 50, skip = 0 } = req.query;
    const accounts = await Account.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Account.countDocuments({ userId: req.user.id });

    res.json({
      success: true,
      accounts,
      pagination: { total, limit: parseInt(limit), skip: parseInt(skip) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * DELETE /api/accounts/:id
 * Delete a saved account
 */
accountRouter.delete('/:id', async (req, res) => {
  try {
    const account = await Account.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    res.json({ success: true, message: 'Account deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
