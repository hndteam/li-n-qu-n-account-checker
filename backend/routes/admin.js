import express from 'express';
import { adminMiddleware } from '../middleware/auth.js';
import { User } from '../models/mongo/User.js';
import { CheckHistory } from '../models/mongo/CheckHistory.js';

export const adminRouter = express.Router();

// Use admin middleware for all routes
adminRouter.use(adminMiddleware);

adminRouter.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

adminRouter.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalChecks = await CheckHistory.countDocuments();
    const successChecks = await CheckHistory.countDocuments({ status: 'success' });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalChecks,
        successChecks,
        successRate: totalChecks > 0 ? ((successChecks / totalChecks) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

adminRouter.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
