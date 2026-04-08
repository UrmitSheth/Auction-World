# Auction World – Quick Start

## Project structure

```
Auction World 1/
├── frontend/          # React + Vite (port 5173)
├── backend/           # Express API (port 3000)
├── package.json       # Root scripts
└── STARTUP.md
```

## How to run

### Option 1: Run both servers at once (recommended)

From the project root:

```bash
npm install
npm run dev
```

This starts:
- Backend API on `http://localhost:3000`
- Frontend on `http://localhost:5173`

### Option 2: Run separately

**Terminal 1 – backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 – frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Console issues and fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `ERR_CONNECTION_REFUSED` on `:3000/user` | Backend not running | Start backend (see above) |
| `Invalid value for prop className on <span>` | Bug in Navbar.jsx | Fixed: use NavLink render prop correctly |
| `[vite] server connection lost` | Vite HMR disconnected | Refresh page or restart frontend |

## Environment

- **Frontend** `.env`: `VITE_API=http://localhost:3000`
- **Backend** `.env`: `PORT=3000` (cors origin `http://localhost:5173`)
