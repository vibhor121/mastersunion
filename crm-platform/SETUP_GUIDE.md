# CRM Platform - Setup Guide

## Quick Start (5 minutes)

### Option 1: Automated Setup (Recommended)

1. **Clone the repository**
```bash
git clone <repository-url>
cd crm-platform
```

2. **Run the setup script**
```bash
chmod +x setup.sh
./setup.sh
```

3. **Start the application**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/v1

### Option 2: Docker (Easiest)

1. **Start with Docker Compose**
```bash
docker-compose up -d
```

2. **Run migrations and seed**
```bash
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend node src/utils/seed.js
```

3. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/v1
- PostgreSQL: localhost:5432

## Manual Setup

### Prerequisites

- Node.js v18 or higher
- PostgreSQL 15 or higher
- npm or yarn
- Git

### Step 1: Database Setup

1. **Install PostgreSQL**
   - macOS: `brew install postgresql@15`
   - Ubuntu: `sudo apt install postgresql-15`
   - Windows: Download from postgresql.org

2. **Create Database**
```bash
psql -U postgres
CREATE DATABASE crm_db;
CREATE USER crm_user WITH PASSWORD 'crm_password';
GRANT ALL PRIVILEGES ON DATABASE crm_db TO crm_user;
\q
```

### Step 2: Backend Setup

1. **Navigate to backend**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp env-example.txt .env
```

4. **Edit .env file**
```env
NODE_ENV=development
PORT=5000

# Update with your database credentials
DATABASE_URL="postgresql://crm_user:crm_password@localhost:5432/crm_db?schema=public"

# Generate a strong secret (you can use: openssl rand -base64 32)
JWT_SECRET=your_super_secret_jwt_key

# Email configuration (optional for development)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password

FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000
```

5. **Run migrations**
```bash
npx prisma migrate dev --name init
```

6. **Generate Prisma Client**
```bash
npx prisma generate
```

7. **Seed the database**
```bash
npm run seed
```

8. **Start the server**
```bash
npm run dev
```

Backend should be running on http://localhost:5000

### Step 3: Frontend Setup

1. **Open new terminal and navigate to frontend**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment (optional)**
```bash
# Create .env file
echo 'VITE_API_URL=http://localhost:5000/api/v1' > .env
echo 'VITE_SOCKET_URL=http://localhost:5000' >> .env
```

4. **Start the development server**
```bash
npm run dev
```

Frontend should be running on http://localhost:3000

## Testing the Setup

### 1. Access the Application

Open your browser and go to: http://localhost:3000

### 2. Login with Demo Credentials

- **Admin Account**
  - Email: admin@crm.com
  - Password: admin123

- **Manager Account**
  - Email: manager@crm.com
  - Password: manager123

- **Sales Executive Account**
  - Email: sales1@crm.com
  - Password: sales123

### 3. Verify Features

✅ Login successfully  
✅ View dashboard with charts  
✅ Create a new lead  
✅ View lead details  
✅ Add activity to a lead  
✅ Receive real-time notifications  
✅ View upcoming activities  

## Email Configuration (Optional)

### Using Gmail

1. **Enable 2-Factor Authentication** on your Gmail account

2. **Generate App Password**
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"

3. **Update .env**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=your_16_digit_app_password
```

### Using SendGrid

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key
```

## Database Management

### View Database with Prisma Studio

```bash
cd backend
npx prisma studio
```

Access at: http://localhost:5555

### Reset Database

```bash
cd backend
npx prisma migrate reset
npm run seed
```

### Create New Migration

```bash
cd backend
npx prisma migrate dev --name your_migration_name
```

## Running Tests

```bash
cd backend
npm test

# Watch mode
npm run test:watch

# With coverage
npm test -- --coverage
```

## Production Build

### Backend

```bash
cd backend
npm ci --only=production
npx prisma generate
npx prisma migrate deploy
NODE_ENV=production node src/server.js
```

### Frontend

```bash
cd frontend
npm run build

# Preview production build
npm run preview
```

## Troubleshooting

### Port Already in Use

**Backend (Port 5000)**
```bash
# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Frontend (Port 3000)**
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Database Connection Issues

1. **Check PostgreSQL is running**
```bash
# macOS
brew services list

# Ubuntu
sudo systemctl status postgresql

# Windows
services.msc (look for PostgreSQL)
```

2. **Verify credentials**
```bash
psql -U crm_user -d crm_db -h localhost
```

3. **Check .env DATABASE_URL format**
```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?schema=public
```

### Prisma Issues

**Clear Prisma cache**
```bash
rm -rf node_modules/.prisma
npx prisma generate
```

**Reset Prisma completely**
```bash
npx prisma migrate reset
npx prisma generate
```

### Node Modules Issues

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Docker Issues

**Rebuild containers**
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

**View logs**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

**Access database in Docker**
```bash
docker-compose exec postgres psql -U crm_user -d crm_db
```

## Environment Variables Reference

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| NODE_ENV | Environment | development/production |
| PORT | Server port | 5000 |
| DATABASE_URL | PostgreSQL connection | postgresql://user:pass@host:port/db |
| JWT_SECRET | JWT signing secret | your_secret_key |
| JWT_EXPIRES_IN | Token expiration | 7d |
| EMAIL_HOST | SMTP host | smtp.gmail.com |
| EMAIL_PORT | SMTP port | 587 |
| EMAIL_USER | Email username | your@email.com |
| EMAIL_PASSWORD | Email password | app_password |
| FRONTEND_URL | Frontend URL | http://localhost:3000 |
| CORS_ORIGINS | Allowed origins | http://localhost:3000 |

### Frontend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:5000/api/v1 |
| VITE_SOCKET_URL | WebSocket URL | http://localhost:5000 |

## Performance Tips

1. **Use production build for deployment**
   - Frontend: `npm run build`
   - Backend: Set `NODE_ENV=production`

2. **Enable database connection pooling**
   - Already configured in Prisma

3. **Use nginx for production**
   - Serve static files
   - Reverse proxy for API
   - SSL termination

4. **Monitor logs**
   - Backend logs: `backend/logs/`
   - Use log aggregation tools in production

## Next Steps

1. **Customize branding**
   - Update logo and colors in frontend
   - Modify email templates

2. **Add integrations**
   - Connect to third-party services
   - Setup webhooks

3. **Deploy to cloud**
   - AWS, Google Cloud, or Heroku
   - Setup CI/CD pipeline

4. **Configure monitoring**
   - Application performance monitoring
   - Error tracking (Sentry)
   - Analytics

## Support

If you encounter issues:

1. Check this guide first
2. Review error logs
3. Search existing issues
4. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Environment details

---

Happy coding! 🚀

