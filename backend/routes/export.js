import express from 'express';
import ExcelJS from 'exceljs';
import { CheckHistory } from '../models/mongo/CheckHistory.js';
import { Account } from '../models/mongo/Account.js';

export const exportRouter = express.Router();

exportRouter.get('/history/csv', async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await CheckHistory.find({ userId }).sort({ createdAt: -1 });

    let csv = 'Nickname,Account ID,Server,Provider,Status,Created At\n';
    history.forEach((item) => {
      csv += `"${item.nickname}","${item.accountId}","${item.server}","${item.provider}","${item.status}","${item.createdAt}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=check-history.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

exportRouter.get('/history/excel', async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await CheckHistory.find({ userId }).sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Check History');

    worksheet.columns = [
      { header: 'Nickname', key: 'nickname', width: 20 },
      { header: 'Account ID', key: 'accountId', width: 20 },
      { header: 'Server', key: 'server', width: 15 },
      { header: 'Provider', key: 'provider', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Created At', key: 'createdAt', width: 20 }
    ];

    history.forEach((item) => {
      worksheet.addRow({
        nickname: item.nickname,
        accountId: item.accountId,
        server: item.server,
        provider: item.provider,
        status: item.status,
        createdAt: item.createdAt.toISOString()
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=check-history.xlsx');

    await workbook.xlsx.write(res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

exportRouter.get('/accounts/excel', async (req, res) => {
  try {
    const userId = req.user.id;
    const accounts = await Account.find({ userId }).sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Saved Accounts');

    worksheet.columns = [
      { header: 'Nickname', key: 'nickname', width: 20 },
      { header: 'Account ID', key: 'accountId', width: 20 },
      { header: 'Server', key: 'server', width: 15 },
      { header: 'Level', key: 'level', width: 10 },
      { header: 'Rank', key: 'rank', width: 15 },
      { header: 'Win Rate', key: 'winRate', width: 12 },
      { header: 'Matches', key: 'matches', width: 12 },
      { header: 'Status', key: 'status', width: 15 }
    ];

    accounts.forEach((account) => {
      worksheet.addRow({
        nickname: account.nickname,
        accountId: account.accountId,
        server: account.server,
        level: account.level,
        rank: account.rank,
        winRate: account.winRate,
        matches: account.matches,
        status: account.status
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=accounts.xlsx');

    await workbook.xlsx.write(res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
