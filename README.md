# Apartment/Society Management System

A role-based web platform for housing societies in India that digitizes resident directory, visitor management, maintenance complaints, expense billing, community notices/polling, and real-time gate security approval.

---

## Tech Stack
- **Frontend:** React.js (Vite), React Router, Tailwind CSS, Axios, React Query
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose ODM
- **Real-time:** Socket.io
- **Auth:** JWT (Access + Refresh tokens), bcrypt

---

## Project Structure
```text
society-management/
├── server/
│   ├── config/          # DB connection
│   ├── controllers/     # API logic
│   ├── middleware/      # Auth & Error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # REST API endpoints
│   ├── utils/           # Helper utilities
│   ├── .env.example     # Environment template
│   └── server.js        # Main entry point
└── README.md
```

---

## Phase 1 API Documentation (Auth Prefix: `/api/v1/auth`)

| Endpoint | Method | Description | Body Parameters | Access |
| :--- | :--- | :--- | :--- | :--- |
| `/register` | POST | Register new user | `name`, `email`, `password`, `phone`, `role`, `flatId` (opt), `societyId` (opt) | Public |
| `/login` | POST | Login and receive tokens | `email`, `password` | Public (Approved) |
| `/refresh` | POST | Refresh expired access token | `refreshToken` | Public |
| `/logout` | POST | Revoke active refresh token | `refreshToken` | Public |
| `/forgot-password` | POST | Send recovery email | `email` | Public |
| `/reset-password/:token`| POST | Update password using token | `password` | Public |

---

## Getting Started (Backend Setup)

1. Clone or navigate to the project directory:
   ```bash
   cd C:\Users\Bulwark\.gemini\antigravity\scratch\society-management\server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   Create a `.env` file using the template in `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Modify the variables (such as `MONGO_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`) as needed.
4. Run the database syntax check:
   ```bash
   node verify_syntax.js
   ```
5. Start in development mode:
   ```bash
   npm run dev
   ```
