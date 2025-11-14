# 🚀 Modern CRM Platform

A full-stack Customer Relationship Management (CRM) platform built with the MERN stack, PostgreSQL, and real-time features using Socket.io. Designed for fast-scaling startups with role-based access control, automated workflows, and comprehensive analytics.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Installation](#installation)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Docker Deployment](#docker-deployment)
- [Project Structure](#project-structure)

## ✨ Features

### Core Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin, Manager, Sales Executive)
  - Secure password hashing with bcrypt

- **Lead Management**
  - Full CRUD operations for leads
  - Lead ownership tracking
  - Status progression (New → Contacted → Qualified → Proposal → Negotiation → Won/Lost)
  - Priority levels (Low, Medium, High, Urgent)
  - Search and filter capabilities
  - Complete audit trail and history

- **Activity Timeline**
  - Track notes, calls, meetings, emails, and tasks
  - Associate activities with leads
  - Schedule future activities
  - Activity completion tracking

- **Real-time Notifications**
  - WebSocket-based notifications using Socket.io
  - Lead assignment notifications
  - Status change alerts
  - Activity reminders

- **Email Notifications**
  - Automated email triggers for key events
  - Lead assignment emails
  - Status change notifications
  - Activity reminders

- **Dashboard & Analytics**
  - Performance metrics visualization
  - Lead conversion tracking
  - Revenue analytics
  - Lead status distribution (Pie charts)
  - Lead priority analysis (Bar charts)
  - Timeline trends (Line charts)
  - Top performers leaderboard
  - Activity statistics

- **User Management** (Admin only)
  - Create and manage users
  - Assign roles
  - Deactivate/reactivate users

## 🛠 Tech Stack

### Backend
- **Runtime:** Node.js v18+
- **Framework:** Express.js
- **Database:** PostgreSQL 15
- **ORM:** Prisma
- **Authentication:** JWT + Bcrypt
- **Real-time:** Socket.io
- **Email:** Nodemailer
- **Logging:** Winston
- **Validation:** Express-validator
- **Testing:** Jest + Supertest

### Frontend
- **Framework:** React 18
- **State Management:** Redux Toolkit
- **Routing:** React Router v6
- **Build Tool:** Vite
- **Charts:** Recharts
- **HTTP Client:** Axios
- **Real-time:** Socket.io-client
- **Notifications:** React-Toastify
- **Date Handling:** date-fns

### DevOps
- **Containerization:** Docker & Docker Compose
- **Web Server:** Nginx (for production)
- **Version Control:** Git

## 🏗 Architecture

### System Architecture

```
┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │
│  React Frontend │ ◄─────► │  Express API    │
│  (Port 3000)    │   HTTP  │  (Port 5000)    │
│                 │         │                 │
└────────┬────────┘         └────────┬────────┘
         │                           │
         │ WebSocket                 │
         │                           │
         └───────────┬───────────────┘
                     │
              ┌──────▼──────┐
              │             │
              │ PostgreSQL  │
              │  Database   │
              │             │
              └─────────────┘
```

### Backend Architecture

- **Modular Structure:** Clean separation of concerns
- **MVC Pattern:** Controllers, Services (implicit), Models (Prisma)
- **Middleware:** Authentication, Authorization, Validation, Error Handling
- **RESTful API:** Versioned endpoints (`/api/v1/`)
- **WebSocket Integration:** Real-time bi-directional communication

### Frontend Architecture

- **Component-Based:** Reusable UI components
- **Redux Store:** Centralized state management with slices
- **Protected Routes:** Route guards for authenticated users
- **API Layer:** Axios interceptors for auth and error handling
- **Socket Manager:** Centralized WebSocket connection handling

## 📊 Database Schema

### ER Diagram

```
┌─────────────────┐         ┌─────────────────┐
│     User        │         │      Lead       │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │◄────────┤ ownerId (FK)    │
│ email           │         │ createdById (FK)│
│ password        │         │ id (PK)         │
│ firstName       │         │ firstName       │
│ lastName        │         │ lastName        │
│ role            │         │ email           │
│ isActive        │         │ phone           │
│ createdAt       │         │ company         │
│ updatedAt       │         │ position        │
└─────────────────┘         │ status          │
                            │ source          │
                            │ value           │
                            │ priority        │
                            │ notes           │
                            │ createdAt       │
                            │ updatedAt       │
                            └────────┬────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
            ┌───────▼──────┐  ┌──────▼─────┐  ┌──────▼──────┐
            │   Activity   │  │LeadHistory │  │Notification │
            ├──────────────┤  ├────────────┤  ├─────────────┤
            │ id (PK)      │  │ id (PK)    │  │ id (PK)     │
            │ leadId (FK)  │  │ leadId(FK) │  │ userId (FK) │
            │ userId (FK)  │  │ fieldName  │  │ title       │
            │ type         │  │ oldValue   │  │ message     │
            │ title        │  │ newValue   │  │ type        │
            │ description  │  │ changedBy  │  │ isRead      │
            │ outcome      │  │ createdAt  │  │ metadata    │
            │ duration     │  └────────────┘  │ createdAt   │
            │ scheduledAt  │                  └─────────────┘
            │ completedAt  │
            │ createdAt    │
            │ updatedAt    │
            └──────────────┘
```

### Key Relationships

- **User → Lead:** One-to-Many (owner relationship)
- **User → Lead:** One-to-Many (creator relationship)
- **Lead → Activity:** One-to-Many
- **Lead → LeadHistory:** One-to-Many
- **User → Activity:** One-to-Many
- **User → Notification:** One-to-Many

### Indexes

- Lead: `ownerId`, `status`, `createdAt`
- Activity: `leadId`, `userId`, `type`, `scheduledAt`
- LeadHistory: `leadId`, `createdAt`
- Notification: `userId + isRead`, `createdAt`

## 🚀 Installation

### Prerequisites

- Node.js v18 or higher
- PostgreSQL 15 or higher
- npm or yarn
- Git

### Local Development Setup

1. **Clone the repository**

```bash
git clone <repository-url>
cd crm-platform
```

2. **Backend Setup**

```bash
cd backend
npm install

# Create .env file
cp env-example.txt .env

# Update .env with your database credentials
# DATABASE_URL="postgresql://username:password@localhost:5432/crm_db?schema=public"
# JWT_SECRET=your_super_secret_key
# EMAIL_HOST=smtp.gmail.com
# EMAIL_USER=your_email@gmail.com
# EMAIL_PASSWORD=your_app_password

# Run Prisma migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# Seed the database (optional)
npm run seed

# Start development server
npm run dev
```

The backend will be running on `http://localhost:5000`

3. **Frontend Setup**

```bash
cd ../frontend
npm install

# Create .env file (optional)
# VITE_API_URL=http://localhost:5000/api/v1
# VITE_SOCKET_URL=http://localhost:5000

# Start development server
npm run dev
```

The frontend will be running on `http://localhost:3000`

### Demo Credentials

After running the seed script, you can login with:

- **Admin:** admin@crm.com / admin123
- **Manager:** manager@crm.com / manager123
- **Sales Executive 1:** sales1@crm.com / sales123
- **Sales Executive 2:** sales2@crm.com / sales123

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api/v1
```

### Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### Endpoints

#### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| GET | `/auth/me` | Get current user | Yes |
| PUT | `/auth/profile` | Update profile | Yes |
| PUT | `/auth/change-password` | Change password | Yes |

#### Leads

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/leads` | Get all leads | Yes | All |
| GET | `/leads/:id` | Get lead by ID | Yes | All |
| POST | `/leads` | Create new lead | Yes | All |
| PUT | `/leads/:id` | Update lead | Yes | All |
| DELETE | `/leads/:id` | Delete lead | Yes | Admin, Manager |
| GET | `/leads/:id/history` | Get lead history | Yes | All |

**Query Parameters for GET /leads:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status
- `priority`: Filter by priority
- `ownerId`: Filter by owner
- `search`: Search in name, email, company
- `sortBy`: Field to sort by (default: createdAt)
- `sortOrder`: asc or desc (default: desc)

#### Activities

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/leads/:leadId/activities` | Get activities for lead | Yes |
| POST | `/leads/:leadId/activities` | Create activity | Yes |
| GET | `/activities/:id` | Get activity by ID | Yes |
| PUT | `/activities/:id` | Update activity | Yes |
| DELETE | `/activities/:id` | Delete activity | Yes |
| GET | `/activities/upcoming` | Get upcoming activities | Yes |

#### Dashboard

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/dashboard/stats` | Get dashboard stats | Yes | All |
| GET | `/dashboard/leads-by-status` | Get leads by status | Yes | All |
| GET | `/dashboard/leads-by-priority` | Get leads by priority | Yes | All |
| GET | `/dashboard/leads-timeline` | Get leads timeline | Yes | All |
| GET | `/dashboard/top-performers` | Get top performers | Yes | Admin, Manager |
| GET | `/dashboard/activity-stats` | Get activity stats | Yes | All |

#### Notifications

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/notifications` | Get all notifications | Yes |
| GET | `/notifications/unread-count` | Get unread count | Yes |
| PUT | `/notifications/:id/read` | Mark as read | Yes |
| PUT | `/notifications/read-all` | Mark all as read | Yes |
| DELETE | `/notifications/:id` | Delete notification | Yes |

#### Users

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/users` | Get all users | Yes | Admin, Manager |
| GET | `/users/:id` | Get user by ID | Yes | Admin, Manager, Self |
| POST | `/users` | Create user | Yes | Admin |
| PUT | `/users/:id` | Update user | Yes | Admin, Manager, Self |
| DELETE | `/users/:id` | Deactivate user | Yes | Admin |
| GET | `/users/sales-executives` | Get sales executives | Yes | Admin, Manager |

### WebSocket Events

#### Client → Server

- `join:lead` - Join a lead-specific room
- `leave:lead` - Leave a lead room
- `activity:created` - Broadcast activity creation
- `lead:updated` - Broadcast lead update

#### Server → Client

- `connected` - Connection confirmation
- `notification:new` - New notification received
- `activity:new` - New activity in lead room
- `lead:changed` - Lead updated in room

## 🧪 Testing

### Run Tests

```bash
cd backend
npm test

# Watch mode
npm run test:watch
```

### Test Coverage

The project includes comprehensive tests for:
- Authentication (login, register, token validation)
- API endpoint validation
- Error handling

## 🐳 Docker Deployment

### Using Docker Compose

1. **Build and start all services:**

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Backend API on port 5000
- Frontend application on port 3000

2. **Run migrations:**

```bash
docker-compose exec backend npx prisma migrate deploy
```

3. **Seed the database:**

```bash
docker-compose exec backend node src/utils/seed.js
```

4. **View logs:**

```bash
docker-compose logs -f
```

5. **Stop services:**

```bash
docker-compose down
```

6. **Remove volumes (clean slate):**

```bash
docker-compose down -v
```

### Environment Variables for Production

Update the `docker-compose.yml` file with production-ready values:

- `JWT_SECRET`: Use a strong, random secret
- `EMAIL_*`: Configure with your email service
- Database credentials
- CORS origins

## 📁 Project Structure

```
crm-platform/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js        # Prisma client
│   │   │   ├── logger.js          # Winston logger
│   │   │   └── email.js           # Email configuration
│   │   ├── controllers/           # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── leadController.js
│   │   │   ├── activityController.js
│   │   │   ├── dashboardController.js
│   │   │   ├── notificationController.js
│   │   │   └── userController.js
│   │   ├── middleware/            # Express middleware
│   │   │   ├── auth.js
│   │   │   ├── validation.js
│   │   │   └── errorHandler.js
│   │   ├── routes/                # API routes
│   │   │   ├── authRoutes.js
│   │   │   ├── leadRoutes.js
│   │   │   ├── activityRoutes.js
│   │   │   ├── dashboardRoutes.js
│   │   │   ├── notificationRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   └── index.js
│   │   ├── utils/
│   │   │   ├── socketManager.js   # Socket.io setup
│   │   │   └── seed.js            # Database seeding
│   │   ├── __tests__/             # Test files
│   │   │   └── auth.test.js
│   │   └── server.js              # Entry point
│   ├── logs/                      # Application logs
│   ├── package.json
│   ├── jest.config.js
│   ├── Dockerfile
│   └── env-example.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/            # React components
│   │   │   ├── Layout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── PrivateRoute.jsx
│   │   ├── pages/                 # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Leads.jsx
│   │   │   ├── LeadDetail.jsx
│   │   │   ├── Activities.jsx
│   │   │   └── Notifications.jsx
│   │   ├── store/                 # Redux store
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.js
│   │   │   │   ├── leadSlice.js
│   │   │   │   ├── activitySlice.js
│   │   │   │   ├── notificationSlice.js
│   │   │   │   └── dashboardSlice.js
│   │   │   └── index.js
│   │   ├── config/
│   │   │   ├── api.js             # Axios configuration
│   │   │   └── socket.js          # Socket.io client
│   │   ├── App.jsx                # Main app component
│   │   ├── main.jsx               # Entry point
│   │   └── index.css              # Global styles
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile
│   └── nginx.conf
│
├── docker-compose.yml
└── README.md
```

## 🎯 Key Features Demonstration

### Role-Based Access Control

- **Admin**: Full access to all features, user management
- **Manager**: Access to all leads, can delete leads, view team performance
- **Sales Executive**: Access only to assigned leads, cannot delete leads

### Real-time Features

- Instant notifications when leads are assigned
- Live updates when lead status changes
- Activity updates in real-time

### Scalable Architecture

- Modular backend with clean separation of concerns
- Normalized database schema with efficient indexing
- Optimized queries with Prisma ORM
- RESTful API design with proper HTTP methods and status codes
- Stateless authentication with JWT

### Production-Ready

- Comprehensive error handling
- Request validation
- Security best practices (password hashing, JWT, CORS)
- Logging with Winston
- Docker containerization
- Environment-based configuration

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt (10 rounds)
- CORS configuration
- Input validation and sanitization
- SQL injection protection (Prisma ORM)
- XSS protection
- Rate limiting ready (can be added)

## 🚀 Performance Optimizations

- Database indexing on frequently queried fields
- Pagination for large datasets
- Lazy loading of components
- Optimized SQL queries with Prisma
- Connection pooling
- Caching strategies ready

## 📈 Future Enhancements

- CI/CD pipeline with GitHub Actions
- API rate limiting
- Advanced reporting and exports (PDF, Excel)
- Third-party integrations (HubSpot, Slack, Zoom)
- Mobile responsive optimization
- Dark mode theme
- Advanced search with Elasticsearch
- File attachments for leads
- Calendar integration
- Email templates customization
- Workflow automation
- Custom fields for leads

## 📄 License

MIT License

## 👥 Support

For issues and questions, please open an issue in the repository.

---

Built with ❤️ for Masters Union Assessment

