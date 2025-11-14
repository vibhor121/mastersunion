#!/bin/bash

echo "🚀 CRM Platform Setup Script"
echo "=============================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL 15 or higher."
    exit 1
fi

echo "✅ PostgreSQL is installed"
echo ""

# Backend setup
echo "📦 Setting up Backend..."
cd backend

if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp env-example.txt .env
    echo "⚠️  Please update the .env file with your database credentials and other settings."
    echo "   Press Enter to continue after updating .env..."
    read
fi

echo "📥 Installing backend dependencies..."
npm install

echo "🗄️  Generating Prisma Client..."
npx prisma generate

echo "🔄 Running database migrations..."
npx prisma migrate dev --name init

echo "🌱 Seeding database with sample data..."
npm run seed

echo "✅ Backend setup complete!"
echo ""

# Frontend setup
echo "📦 Setting up Frontend..."
cd ../frontend

echo "📥 Installing frontend dependencies..."
npm install

echo "✅ Frontend setup complete!"
echo ""

# Back to root
cd ..

echo "🎉 Setup Complete!"
echo ""
echo "To start the application:"
echo "  Backend:  cd backend && npm run dev"
echo "  Frontend: cd frontend && npm run dev"
echo ""
echo "Or use Docker:"
echo "  docker-compose up -d"
echo ""
echo "Demo Credentials:"
echo "  Admin:   admin@crm.com / admin123"
echo "  Manager: manager@crm.com / manager123"
echo "  Sales:   sales1@crm.com / sales123"
echo ""
echo "Happy coding! 🚀"

