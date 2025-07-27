# Multi-Tenant Logistics System (TDMS)

## 🚚 Overview
A comprehensive multi-tenant SaaS platform for logistics and truck fleet management with role-based access control.

## 🏗️ Architecture
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB
- **Authentication**: JWT with role-based access
- **Multi-tenancy**: Company-level data isolation

## 👥 User Roles
1. **Super Admin** - Platform management, all companies access
2. **Company Admin** - Full company management
3. **Dispatcher** - Trip management and coordination
4. **Driver** - Trip viewing and status updates

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB
- pnpm package manager

### Installation
```bash
# Install dependencies
pnpm install
cd backend && pnpm install

# Set up environment
cp backend/.env.example backend/.env
# Edit backend/.env with your MongoDB URI and JWT secret
```

### Development
```bash
# Start full stack (both frontend and backend)
# Use VS Code Command Palette: Tasks: Run Task -> "Start Full Stack"

# Or run separately:
# Backend (runs on port 5000)
cd backend && pnpm run dev

# Frontend (runs on port 3000)
pnpm run dev
```

## 📁 Project Structure
```
project/
├── src/                    # React frontend
│   ├── components/         # Reusable components
│   ├── contexts/          # React contexts (Auth, Theme)
│   └── pages/             # Page components
├── backend/               # Express backend
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Auth, error handling
│   ├── models/           # MongoDB models
│   └── routes/           # API routes
└── .vscode/              # VS Code configuration
```

## 🔐 Security Features
- JWT authentication with automatic token refresh
- Role-based access control (RBAC)
- Multi-tenant data isolation
- Rate limiting on auth endpoints
- Input validation and sanitization
- Helmet.js security headers

## 🌟 Key Features
- Company management with subscription plans
- User management with role assignment
- Fleet/truck management
- Customer relationship management
- Trip planning and tracking
- File upload system
- Analytics dashboard
- Responsive design

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Companies (Super Admin)
- `GET /api/companies` - List all companies
- `POST /api/companies` - Create company
- `PUT /api/companies/:id` - Update company
- `DELETE /api/companies/:id` - Delete company

### Users
- `GET /api/users` - List company users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Trucks
- `GET /api/trucks` - List company trucks
- `POST /api/trucks` - Add truck
- `PUT /api/trucks/:id` - Update truck
- `DELETE /api/trucks/:id` - Delete truck

### Customers
- `GET /api/customers` - List company customers
- `POST /api/customers` - Add customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Trips
- `GET /api/trips` - List trips (filtered by role)
- `POST /api/trips` - Create trip
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip

## 🎯 Next Steps
1. Set up MongoDB and update connection string
2. Create initial super admin user
3. Add unit and integration tests
4. Implement API documentation (Swagger)
5. Add email notifications
6. Implement real-time updates (Socket.io)
7. Add data export features
8. Implement audit logging

## 📝 License
Private project for logistics management.
