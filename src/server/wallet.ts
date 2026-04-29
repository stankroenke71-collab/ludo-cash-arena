import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb, User, Transaction, Withdrawal } from './db.ts';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ludo-secret-key-123';

async function isAdmin(req: any, res: any, next: any) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    await getDb();
    const user = await User.findOne({ id: decoded.id });
    if (!user || user.is_admin !== 1) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function setupWalletRoutes() {
  const router = Router();

  router.post('/deposit', async (req, res) => {
    const { userId, amount, method, reference } = req.body;
    await getDb();

    try {
      const transactionId = uuidv4();
      
      await Transaction.create({
        id: transactionId,
        user_id: userId,
        type: 'deposit',
        amount: amount,
        status: 'completed',
        reference: `${method}: ${reference}`
      });

      await User.updateOne({ id: userId }, { $inc: { balance: amount } });
      
      const user = await User.findOne({ id: userId });
      res.json({ success: true, balance: user?.balance || 0 });
    } catch (error) {
      res.status(500).json({ error: 'Deposit failed' });
    }
  });

  router.post('/withdraw', async (req, res) => {
    const { userId, amount, method, details, phone_number, provider } = req.body;
    await getDb();

    if (!amount || amount < 1) {
      return res.status(400).json({ error: 'Invalid withdrawal amount' });
    }

    const user = await User.findOne({ id: userId });
    if (!user || user.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    try {
      const withdrawalId = uuidv4();
      
      await Withdrawal.create({
        id: withdrawalId,
        user_id: userId,
        amount: amount,
        method: method,
        account_details: details,
        phone_number: phone_number,
        provider: provider || method,
        status: 'pending'
      });

      await Transaction.create({
        id: uuidv4(),
        user_id: userId,
        type: 'withdrawal',
        amount: -amount,
        status: 'pending',
        reference: `Withdrawal ID: ${withdrawalId}`
      });

      await User.updateOne({ id: userId }, { $inc: { balance: -amount } });
      
      const updatedUser = await User.findOne({ id: userId });
      res.json({ success: true, balance: updatedUser?.balance || 0, message: 'Withdrawal request submitted' });
    } catch (error) {
      res.status(500).json({ error: 'Withdrawal failed' });
    }
  });

  router.get('/history/:userId', async (req, res) => {
    await getDb();
    const transactions = await Transaction.find({ user_id: req.params.userId }).sort({ created_at: -1 }).lean();
    res.json(transactions);
  });

  return router;
}
