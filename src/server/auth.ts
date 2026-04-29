import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getDb, User } from './db.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'ludo-secret-key-123';

export function setupAuthRoutes() {
  const router = Router();

  router.post('/register', async (req, res) => {
    const { username, email, password, referralCode } = req.body;
    await getDb();

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = uuidv4();
      const userReferralCode = username.slice(0, 4).toUpperCase() + Math.floor(1000 + Math.random() * 9000);

      let referredBy = null;
      if (referralCode) {
        const referrer = await User.findOne({ referral_code: referralCode });
        if (referrer) referredBy = referrer.id;
      }

      await User.create({
        id: userId,
        username,
        email,
        password: hashedPassword,
        referral_code: userReferralCode,
        referred_by: referredBy
      });

      if (referredBy) {
        await User.updateOne({ id: userId }, { $inc: { bonus_balance: 10 } });
        await User.updateOne({ id: referredBy }, { $inc: { bonus_balance: 5 } });
      }

      const token = jwt.sign({ id: userId, username }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: userId, username, email, referralCode: userReferralCode } });
    } catch (error: any) {
      res.status(400).json({ error: 'Username or email already exists' });
    }
  });

  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    await getDb();

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar, balance: user.balance, bonus_balance: user.bonus_balance, referralCode: user.referral_code, is_admin: user.is_admin } });
  });

  router.get('/me', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      await getDb();
      const user = await User.findOne({ id: decoded.id }).select('id username email avatar balance bonus_balance referral_code is_admin').lean();
      if (!user) return res.status(404).json({ error: 'User not found' });
      
      const { referral_code: referralCode, ...rest } = user as any;
      res.json({ ...rest, referralCode });
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  return router;
}
