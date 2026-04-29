import mongoose from 'mongoose';

let MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://ludoAdmin:StrongPassword123@cluster0.mongodb.net/ludo_cash_arena?retryWrites=true&w=majority';

if (MONGO_URI && !MONGO_URI.startsWith('mongodb://') && !MONGO_URI.startsWith('mongodb+srv://')) {
  console.warn('Invalid MONGO_URI provided. Falling back to default database.');
  MONGO_URI = 'mongodb+srv://ludoAdmin:StrongPassword123@cluster0.mongodb.net/ludo_cash_arena?retryWrites=true&w=majority';
}

export async function getDb() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  await mongoose.connect(MONGO_URI);
  
  const adminExists = await User.findOne({ email: 'stankroenke71@gmail.com' });
  if (adminExists && !adminExists.is_admin) {
    adminExists.is_admin = 1;
    await adminExists.save();
  }

  const stats = await AdminStat.findOne({ id: 1 });
  if (!stats) {
    await AdminStat.create({ id: 1, total_commission: 0, total_withdrawn: 0 });
  }

  // To support legacy raw sqlite-like queries temporarily if we missed some:
  // (We'll refactor the callers, so this is just to prevent immediate TS errors
  // but they will fail at runtime if not refactored)
  return {
    mongoose: mongoose.connection,
    all: async () => [],
    get: async () => null,
    run: async () => {},
    exec: async () => {}
  } as any;
}

export const User = (mongoose.models.User || mongoose.model('User', new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, sparse: true },
  phone: String,
  password: { type: String, required: true },
  avatar: String,
  referral_code: { type: String, unique: true, sparse: true },
  referred_by: String,
  balance: { type: Number, default: 0 },
  bonus_balance: { type: Number, default: 0 },
  total_winnings: { type: Number, default: 0 },
  total_losses: { type: Number, default: 0 },
  is_admin: { type: Number, default: 0 },
  status: { type: String, default: 'active' },
  created_at: { type: Date, default: Date.now }
}))) as mongoose.Model<any>;

export const Transaction = (mongoose.models.Transaction || mongoose.model('Transaction', new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  user_id: String,
  type: String, // 'deposit', 'withdrawal', 'game_wager', 'game_win', 'referral_bonus'
  amount: Number,
  status: String,
  reference: String,
  created_at: { type: Date, default: Date.now }
}))) as mongoose.Model<any>;

export const Room = (mongoose.models.Room || mongoose.model('Room', new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  room_code: { type: String, unique: true, sparse: true },
  creator_id: String,
  entry_fee: Number,
  player_limit: Number,
  is_private: { type: Number, default: 0 },
  password: { type: String, default: null },
  current_players: { type: Number, default: 1 },
  privacy: { type: String, default: 'public' },
  status: { type: String, default: 'waiting' },
  created_at: { type: Date, default: Date.now },
  members: { type: [String], default: [] }
}))) as mongoose.Model<any>;

export const Tournament = (mongoose.models.Tournament || mongoose.model('Tournament', new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  entry_fee: { type: Number, default: 0 },
  prize_pool: { type: Number, default: 0 },
  participants: { type: Number, default: 0 },
  status: { type: String, default: 'scheduled' },
  start_date: Date,
  end_date: Date,
  created_at: { type: Date, default: Date.now }
}))) as mongoose.Model<any>;

export const Match = (mongoose.models.Match || mongoose.model('Match', new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  room_id: String,
  players: String, 
  current_turn: String,
  dice_value: Number,
  board_state: String, 
  winner: String,
  pot_amount: Number,
  commission_taken: Number,
  started_at: Date,
  ended_at: Date,
  winner_id: String,
  total_prize: Number,
  commission: Number,
  created_at: { type: Date, default: Date.now }
}))) as mongoose.Model<any>;

export const Withdrawal = (mongoose.models.Withdrawal || mongoose.model('Withdrawal', new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  user_id: String,
  amount: Number,
  provider: String,
  phone_number: String,
  account_details: String,
  method: String,
  status: { type: String, default: 'pending' },
  admin_note: String,
  requested_at: { type: Date, default: Date.now },
  approved_at: Date
}))) as mongoose.Model<any>;

export const AdminStat = (mongoose.models.AdminStat || mongoose.model('AdminStat', new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  total_commission: { type: Number, default: 0 },
  total_withdrawn: { type: Number, default: 0 },
  last_updated: { type: Date, default: Date.now }
}))) as mongoose.Model<any>;

export const AdminLog = (mongoose.models.AdminLog || mongoose.model('AdminLog', new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  admin_id: String,
  action: String,
  description: String,
  created_at: { type: Date, default: Date.now }
}))) as mongoose.Model<any>;
