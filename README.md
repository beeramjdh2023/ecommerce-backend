# Ecommerce Backend API

A production-grade REST API for an e-commerce platform built with Node.js, Express, MySQL, and Redis.

## Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL (raw queries)
- **Cache:** Redis
- **Auth:** JWT + bcrypt
- **Containerization:** Docker

## Features (In Progress)
- [ ] Authentication (Register, Login, Logout)
- [ ] OTP Email Verification via Redis
- [ ] Product Management
- [ ] Cart & Orders
- [ ] Payment Integration (Razorpay)
- [ ] Seller Dashboard
- [ ] Admin Panel

## Getting Started

### Prerequisites
- Node.js
- MySQL
- Docker

### Installation
```bash
git clone https://github.com/beeramjdh2023/ecommerce-backend.git
cd ecommerce-backend
npm install
```

### Setup Environment
Create a `.env` file in root:
```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=ecommerce_db
JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Run
```bash
# start docker (Redis)
docker-compose up -d

# start server
npm run dev
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/register | Register new user |
| POST | /api/v1/auth/verify-otp | Verify email OTP |