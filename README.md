# Digital Asset Platform

## Overview

Digital Asset Platform is a full-stack web application for managing, distributing, and customizing digital assets. It provides a robust backend API and a modern frontend interface for users, admins, and service providers. The platform supports asset uploads, licensing, transactions, ticketing, messaging, and service requests (branding, photography, social media, etc.).

---

## Features

- **Asset Management**: Upload, categorize, and manage digital assets.
- **Custom Requests**: Users can request customizations for assets and services (branding, webdev, etc.).
- **Licensing System**: Issue, update, and manage licenses for assets.
- **Transactions**: Secure payment and transaction processing (Paystack integration).
- **User Authentication**: JWT-based login, registration, and role-based access (admin, user).
- **Messaging & Ticketing**: Real-time messaging and support ticket system.
- **Admin Dashboard**: Manage users, assets, tickets, transactions, and customization requests.
- **Socket & Queue**: Real-time updates via Socket.io and RabbitMQ for async processing.
- **Frontend**: Responsive React + Vite SPA with service request forms, dashboards, and asset browsing.

---

## Technologies

- **Frontend**: React, Vite, Tailwind CSS, Axios, React Router, JWT-decode
- **Backend**: Node.js, Express, TypeScript, TypeORM, Socket.io, RabbitMQ, Redis, Winston
- **Database**: PostgreSQL (via TypeORM)
- **Dev Tools**: ESLint, Prettier, Nodemon
- **Deployment**: Vercel

---

## Architecture

- **Monorepo Structure**:
  - `frontend/`: React SPA
  - `backend/`: Express API, business logic, database, sockets, queue
  - `uploads/`: Asset storage
  - `api/`: (API documentation or gateway)

- **Backend Modules**:
  - `controllers/`, `services/`, `entities/`, `routes/`, `middlewares/`, `database/`, `queue/`, `socket/`
- **Frontend Modules**:
  - `components/`, `pages/`, `context/`, `utils/`, `styles/`

---

## Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL
- Redis
- RabbitMQ

### Backend
1. Install dependencies:
   ```powershell
   cd backend
   npm install
   ```
2. Configure environment variables:
   - Copy `.env.example` to `.env.development.local` and set values for DB, JWT, Paystack, Redis, etc.
3. Run migrations:
   ```powershell
   npm run migrate
   ```
4. Start development server:
   ```powershell
   npm run dev
   ```

### Frontend
1. Install dependencies:
   ```powershell
   cd frontend
   npm install
   ```
2. Configure environment variables:
   - Set `VITE_API_URL` and other variables in `.env`
3. Start development server:
   ```powershell
   npm run dev
   ```

---

## Usage

- Access the frontend at `http://localhost:3000` (default)
- Backend API runs at `http://localhost:3000/api` (default)
- Admin dashboard: `/admin`


---

## API Endpoints (Backend)

- `/api/assets` - Asset CRUD
- `/api/auth` - Authentication
- `/api/branding` - Branding requests
- `/api/category` - Asset categories
- `/api/custom` - Custom asset requests
- `/api/downloads` - Asset downloads
- `/api/licenses` - License management
- `/api/messages` - Messaging
- `/api/tags` - Asset tags
- `/api/ticket` - Support tickets
- `/api/transactions` - Payments
- `/api/users` - User management
- `/api/website` - Website development requests

---

## Environment Variables

Backend (`backend/src/config/env.ts`):
- `DB_URI`, `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`, `DB_TYPE`
- `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_EXPIRES_IN`
- `PORT`, `FRONTEND_URL`, `PAYSTACK_SECRET_KEY`, `REDIS_URL`, etc.

Frontend (`frontend/src/utils/constants.js`):
- `VITE_API_URL`, `VITE_USER`, `VITE_IMAGE_URL`

---

## Contribution

1. Fork the repo and create a feature branch.
2. Make changes and commit with clear messages.
3. Open a pull request.
4. Ensure code passes lint and build checks.

---

## License

MIT License. See `frontend/LICENSE` for details.

---

## Contact

- Email: ajayitimmy45@gmail.com
- Phone: +234 8125754326
---

## Acknowledgements

- Built with React, Vite, Node.js, Express, TypeORM, Socket.io, RabbitMQ, Redis, Tailwind CSS, and more.
- Inspired by modern digital asset management and customization needs.

docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:management
docker start rabbitmq
npm run dev