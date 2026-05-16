<div align="center">
<img width="1200" height="475" alt="Ludo Game Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Ludo Multiplayer Game

A full-stack multiplayer Ludo game built with React, TypeScript, Express, Socket.IO, and MongoDB. Features include real-time gameplay, user authentication, wallet integration, tournaments, and referral system.

## Features

- 🎮 **Real-time Multiplayer Gameplay**: Play Ludo with friends or random opponents using Socket.IO for real-time communication
- 🔐 **User Authentication**: Secure JWT-based authentication with login/register functionality
- 💰 **Wallet System**: Integrated payment system with Flutterwave for deposits and withdrawals
- 🏆 **Tournaments**: Participate in competitive tournaments with prizes
- 👥 **Referral Program**: Earn rewards by referring friends to the platform
- 📊 **Admin Dashboard**: Manage users, games, and platform settings
- 🔔 **Notifications**: Real-time notifications for game events and updates
- 📱 **Responsive Design**: Modern UI built with Tailwind CSS and Framer Motion

## Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Zustand** - State management
- **React Router** - Navigation
- **Lucide React** - Icons
- **Recharts** - Data visualization

### Backend
- **Express** - Web framework
- **Socket.IO** - Real-time communication
- **MongoDB/Mongoose** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **SQLite** - Alternative database option

### Payment Integration
- **Flutterwave** - Payment processing

## Prerequisites

- Node.js (v18 or higher recommended)
- MongoDB instance (local or cloud like MongoDB Atlas)
- Gemini API key (for AI features)
- Flutterwave account (for payment integration)

## Installation

1. **Clone the repository** (if applicable):
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   
   Copy `.env.example` to `.env.local` and fill in your credentials:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your values:
   ```env
   # Gemini API Key for AI features
   GEMINI_API_KEY="your-gemini-api-key"
   
   # App URL (used for OAuth callbacks, etc.)
   APP_URL="http://localhost:3000"
   
   # JWT Secret for token signing (use a strong random string)
   JWT_SECRET="your-super-secret-jwt-key"
   
   # MongoDB Connection String
   MONGO_URI="mongodb://localhost:27017/ludo-game"
   
   # Platform commission rate (0.1 = 10%)
   PLATFORM_COMMISSION=0.1
   
   # Flutterwave Public Key
   VITE_FLUTTERWAVE_PUBLIC_KEY="your-flutterwave-public-key"
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

   The application will start at `http://localhost:3000`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run preview` | Preview production build |
| `npm run clean` | Remove build artifacts |
| `npm run lint` | Run TypeScript type checking |

## Project Structure

```
├── src/
│   ├── components/        # Reusable UI components
│   │   └── LudoBoard.tsx  # Main game board component
│   │   └── Navbar.tsx     # Navigation component
│   ├── pages/             # Application pages/routes
│   │   ├── Landing.tsx    # Home page
│   │   ├── Login.tsx      # Login page
│   │   ├── Register.tsx   # Registration page
│   │   ├── Lobby.tsx      # Game lobby
│   │   ├── GameRoom.tsx   # Active game room
│   │   ├── Dashboard.tsx  # User dashboard
│   │   ├── Wallet.tsx     # Wallet management
│   │   ├── Tournaments.tsx # Tournament page
│   │   ├── Referral.tsx   # Referral program
│   │   ├── Profile.tsx    # User profile
│   │   ├── Admin.tsx      # Admin dashboard
│   │   └── Notifications.tsx # Notifications center
│   ├── server/            # Backend server modules
│   │   ├── auth.ts        # Authentication routes
│   │   ├── game.ts        # Game engine & Socket.IO handlers
│   │   ├── wallet.ts      # Wallet/payment routes
│   │   ├── admin.ts       # Admin routes
│   │   └── db.ts          # Database connection
│   ├── services/          # Client-side services
│   │   └── paymentService.ts
│   ├── store/             # Zustand state stores
│   │   └── useAuthStore.ts
│   ├── lib/               # Utility libraries
│   │   └── socket.ts      # Socket.IO client setup
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global styles
├── server.ts              # Express server entry point
├── index.html             # HTML template
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
└── .env.example           # Environment variables template
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile

### Wallet
- `GET /api/wallet/balance` - Get wallet balance
- `POST /api/wallet/deposit` - Initiate deposit
- `POST /api/wallet/withdraw` - Request withdrawal
- `GET /api/wallet/transactions` - Get transaction history

### Admin
- `GET /api/admin/users` - List all users
- `GET /api/admin/games` - List all games
- `POST /api/admin/settings` - Update platform settings

## Socket.IO Events

The game uses Socket.IO for real-time communication:

### Client → Server
- `join_lobby` - Join game lobby
- `create_room` - Create new game room
- `join_room` - Join existing room
- `roll_dice` - Roll the dice
- `move_piece` - Move a game piece
- `leave_room` - Leave game room

### Server → Client
- `lobby_update` - Lobby state changed
- `game_state` - Current game state
- `player_joined` - New player joined
- `player_left` - Player left the game
- `dice_result` - Dice roll result
- `move_result` - Move validation result
- `game_over` - Game ended

## Deployment

### Production Build

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm run start
   ```

### Environment Variables for Production

Ensure all required environment variables are set in your production environment:
- `GEMINI_API_KEY`
- `APP_URL` (your production URL)
- `JWT_SECRET` (use a secure random string)
- `MONGO_URI` (production database)
- `PLATFORM_COMMISSION`
- `VITE_FLUTTERWAVE_PUBLIC_KEY`

## Security Considerations

- Always use HTTPS in production
- Keep your `JWT_SECRET` secure and never commit it to version control
- Validate all user inputs on both client and server
- Implement rate limiting for API endpoints in production
- Use environment variables for sensitive data

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check the issue tracker
- Contact the development team

---

Built with ❤️ using React, Express, and Socket.IO
