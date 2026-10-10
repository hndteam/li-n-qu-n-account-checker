import express from 'express';
import { CheckHistory } from '../models/mongo/CheckHistory.js';

export const historyRouter = express.Router();

historyRouter.get('/', async (req, res) => {
  try {
    const { limit = 50, skip = 0, status } = req.query;
    const filter = { userId: req.user.id };

    if (status) filter.status = status;

    const history = await CheckHistory.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await CheckHistory.countDocuments(filter);

    res.json({
      success: true,
      history,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

historyRouter.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;
    const total = await CheckHistory.countDocuments({ userId });
    const success = await CheckHistory.countDocuments({ userId, status: 'success' });
    const error = await CheckHistory.countDocuments({ userId, status: 'error' });

    res.json({
      success: true,
      stats: {
        total,
        success,
        error,
        successRate: total > 0 ? ((success / total) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

historyRouter.delete('/:id', async (req, res) => {
  try {
    const record = await CheckHistory.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    res.json({ success: true, message: 'Record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
