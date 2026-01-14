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
- Node.js (v22+ recommended)
- Docker Desktop
- PostgreSQL (for manual setup)

---

### Option 1: Manual Development Setup

This approach runs the services on your host machine.

#### 1. Start RabbitMQ
Use the following commands to start a RabbitMQ container:
```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:management
docker start rabbitmq
```

#### 2. Redis Configuration
Running manually requires an external Redis server (e.g., provided on a platform like **Render**). Ensure your `.env` file reflects this connection.

#### 3. Backend Setup
1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Configure environment:
   - Copy `.env.example` to `.env.development.local` and set your variables.
3. Start:
   ```bash
   npm run dev
   ```

#### 4. Frontend Setup
1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Start:
   ```bash
   npm run dev
   ```

---

### Option 2: Dockerized Development Setup (Recommended)

This approach runs all services (API, Postgres, Redis, RabbitMQ) in an isolated container environment.

1. **Navigate to Backend**:
   ```bash
   cd backend
   ```
2. **Start Environment**:
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

> [!IMPORTANT]
> **Connectivity Note**: When the app is running in Docker, you **must use `http://127.0.0.1:3000`** instead of `localhost:3000` to access the backend from your host machine. This avoids potential IPv6 resolution conflicts on Windows.

---

## Production Deployment

*(Reserved for production deployment instructions)*

---

## Usage

- Access the frontend at `http://localhost:5173` (Vite default)
- Backend API runs at `http://127.0.0.1:3000/api`
- Admin dashboard: `/admin`

---

## API Endpoints (Backend)

- `/api/assets` - Asset CRUD
- `/api/auth` - Authentication
- `/api/category` - Asset categories
- `/api/downloads` - Asset downloads
- `/api/licenses` - License management
- `/api/messages` - Messaging
- `/api/tags` - Asset tags
- `/api/ticket` - Support tickets
- `/api/transactions` - Payments
- `/api/users` - User management

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