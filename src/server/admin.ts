import { Router } from 'express';
import { getDb, User, Withdrawal, Transaction, AdminStat, AdminLog, Room, Tournament, Match } from './db.ts';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ludo-secret-key-123';

export function setupAdminRoutes() {
  const router = Router();

  const isAdmin = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Missing authorization header' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Missing token' });

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      await getDb();
      const user = await User.findOne({ id: decoded.id });

      if (!user || user.is_admin !== 1) {
        return res.status(403).json({ error: 'Admin access denied' });
      }

      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };

  router.get('/withdrawals', isAdmin, async (req, res) => {
    await getDb();
    const withdrawals = await Withdrawal.find({ status: 'pending' }).sort({ requested_at: 1 }).lean() as any[];
    
    for (const w of withdrawals) {
      const u = await User.findOne({ id: w.user_id }).lean() as any;
      w.username = u?.username;
      w.email = u?.email;
    }
    
    res.json(withdrawals);
  });

  router.post('/withdrawals/:id/action', isAdmin, async (req, res) => {
    await getDb();
    const { id } = req.params;
    const { action, note } = req.body; 

    try {
      const withdrawal = await Withdrawal.findOne({ id });
      if (!withdrawal) return res.status(404).json({ error: 'Withdrawal not found' });
      if (withdrawal.status !== 'pending') return res.status(400).json({ error: 'Already processed' });

      if (action === 'approve') {
        await Withdrawal.updateOne({ id }, { status: 'approved', admin_note: note, approved_at: new Date() });
        const regex = new RegExp(id, 'i');
        await Transaction.updateMany(
          { user_id: withdrawal.user_id, type: 'withdrawal', status: 'pending', reference: regex },
          { status: 'completed' }
        );
        await AdminStat.updateOne({ id: 1 }, { $inc: { total_withdrawn: withdrawal.amount } });
        
        await AdminLog.create({
          id: uuidv4(),
          admin_id: (req as any).user.id,
          action: 'approve_withdrawal',
          description: `Approved withdrawal ${id} for $${withdrawal.amount}`
        });
      } else {
        await Withdrawal.updateOne({ id }, { status: 'rejected', admin_note: note, approved_at: new Date() });
        const regex = new RegExp(id, 'i');
        await Transaction.updateMany(
          { user_id: withdrawal.user_id, type: 'withdrawal', status: 'pending', reference: regex },
          { status: 'failed' }
        );
        
        await User.updateOne({ id: withdrawal.user_id }, { $inc: { balance: withdrawal.amount } });
        
        await AdminLog.create({
          id: uuidv4(),
          admin_id: (req as any).user.id,
          action: 'reject_withdrawal',
          description: `Rejected withdrawal ${id} for $${withdrawal.amount}`
        });
      }

      res.json({ success: true, message: `Withdrawal ${action}ed successfully` });
    } catch (error) {
      res.status(500).json({ error: 'Operation failed' });
    }
  });

  router.post('/withdrawals/:id/approve', isAdmin, async (req, res) => {
    await getDb();
    const { id } = req.params;
    const { note } = req.body;

    try {
      const withdrawal = await Withdrawal.findOne({ id });
      if (!withdrawal) return res.status(404).json({ error: 'Withdrawal not found' });
      if (withdrawal.status !== 'pending') return res.status(400).json({ error: 'Already processed' });

      await Withdrawal.updateOne({ id }, { status: 'approved', admin_note: note, approved_at: new Date() });
      const regex = new RegExp(id, 'i');
      await Transaction.updateMany(
        { user_id: withdrawal.user_id, type: 'withdrawal', status: 'pending', reference: regex },
        { status: 'completed' }
      );

      await AdminStat.updateOne({ id: 1 }, { $inc: { total_withdrawn: withdrawal.amount } });

      await AdminLog.create({
        id: uuidv4(),
        admin_id: (req as any).user.id,
        action: 'approve_withdrawal',
        description: `Approved withdrawal ${id} for $${withdrawal.amount}`
      });

      res.json({ success: true, message: 'Withdrawal approved' });
    } catch (error) {
      res.status(500).json({ error: 'Processing failed' });
    }
  });

  router.get('/users', isAdmin, async (req, res) => {
    await getDb();
    const { search, limit = 50, offset = 0 } = req.query;
    
    let query: any = {};
    if (search) {
      const regex = new RegExp(String(search), 'i');
      query = { $or: [{ username: regex }, { email: regex }] };
    }

    const users = await User.find(query)
      .sort({ created_at: -1 })
      .skip(Number(offset))
      .limit(Number(limit))
      .lean();
      
    // Map fields for client
    const mappedUsers = users.map((u: any) => ({
      ...u,
      wallet_balance: u.balance
    }));

    const count = await User.countDocuments(query);
    res.json({ users: mappedUsers, total: count });
  });

  router.post('/users/:id/status', isAdmin, async (req, res) => {
    await getDb();
    const { id } = req.params;
    const { status } = req.body; 
    await User.updateOne({ id }, { status });
    res.json({ success: true });
  });

  router.get('/transactions', isAdmin, async (req, res) => {
    await getDb();
    const { type, limit = 100, offset = 0 } = req.query;
    
    let query: any = {};
    if (type) query.type = type;

    const transactions = await Transaction.find(query)
      .sort({ created_at: -1 })
      .skip(Number(offset))
      .limit(Number(limit))
      .lean() as any[];

    for (const t of transactions) {
      const u = await User.findOne({ id: t.user_id }).lean() as any;
      t.username = u?.username;
      t.email = u?.email;
    }

    res.json(transactions);
  });

  router.get('/tournaments', isAdmin, async (req, res) => {
    await getDb();
    const tournaments = await Tournament.find().sort({ created_at: -1 }).lean();
    res.json(tournaments);
  });

  router.get('/analytics/trends', isAdmin, async (req, res) => {
    const trends = [
      { date: '04/23', revenue: 450, volume: 4500 },
      { date: '04/24', revenue: 520, volume: 5200 },
      { date: '04/25', revenue: 480, volume: 4800 },
      { date: '04/26', revenue: 610, volume: 6100 },
      { date: '04/27', revenue: 750, volume: 7500 },
      { date: '04/28', revenue: 890, volume: 8900 },
      { date: '04/29', revenue: 1050, volume: 10500 },
    ];
    res.json(trends);
  });

  router.get('/fraud/alerts', isAdmin, async (req, res) => {
    const alerts = [
      { username: 'shadow_ninja', id: 'susp-1', reason: 'Abnormal win rate (94%)', severity: 'high' },
      { username: 'combatant_01', id: 'susp-2', reason: 'Multiple account link detected', severity: 'medium' },
      { username: 'ludo_king_99', id: 'susp-3', reason: 'Large withdrawal pattern anomaly', severity: 'low' }
    ];
    res.json(alerts);
  });

  router.get('/matches/live', isAdmin, async (req, res) => {
    await getDb();
    const rooms = await Room.find({ status: { $in: ['playing', 'waiting'] } }).lean() as any[];
    
    for (const r of rooms) {
      const c = await User.findOne({ id: r.creator_id }).lean() as any;
      r.creator_name = c?.username;
      
      const memberNames = [];
      for (const mId of r.members || []) {
        const p = await User.findOne({ id: mId }).lean() as any;
        if (p) memberNames.push(p.username);
      }
      r.players = memberNames.join(', ');
    }
    
    res.json(rooms);
  });

  router.get('/stats', isAdmin, async (req, res) => {
    await getDb();
    
    const matchesMatch = await Match.aggregate([{ $group: { _id: null, total: { $sum: '$commission_taken' } } }]);
    const matchesRoom = await Room.aggregate([
      { $match: { status: { $ne: 'finished' } } },
      { $group: { _id: null, sum: { $sum: { $multiply: ['$entry_fee', '$current_players'] } } } }
    ]);
    const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });
    const totalPlayers = await User.countDocuments();
    const withdrawalSum = await Withdrawal.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      revenue: matchesMatch[0]?.total || 0,
      escrow: matchesRoom[0]?.sum || 0,
      pendingWithdrawals: pendingWithdrawals || 0,
      totalPlayers: totalPlayers || 0,
      totalWithdrawn: withdrawalSum[0]?.total || 0
    });
  });

  router.get('/matches/history', isAdmin, async (req, res) => {
    await getDb();
    const { limit = 50, offset = 0 } = req.query;
    const matches = await Match.find()
      .sort({ created_at: -1 })
      .skip(Number(offset))
      .limit(Number(limit))
      .lean() as any[];

    for (const m of matches) {
      const r = await Room.findOne({ id: m.room_id }).lean() as any;
      m.room_code = r?.room_code;
    }

    res.json(matches);
  });

  router.get('/logs', isAdmin, async (req, res) => {
    await getDb();
    const { limit = 50, offset = 0 } = req.query;
    const logs = await AdminLog.find()
      .sort({ created_at: -1 })
      .skip(Number(offset))
      .limit(Number(limit))
      .lean() as any[];

    for (const l of logs) {
      const u = await User.findOne({ id: l.admin_id }).lean() as any;
      l.username = u?.username;
      l.email = u?.email;
    }

    res.json(logs);
  });

  return router;
}
