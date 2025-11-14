#!/bin/bash

# Create .env file for backend
cat > backend/.env << 'EOF'
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
DATABASE_URL="postgresql://crm_user:crm_password@localhost:5432/crm_db?schema=public"

# JWT Configuration
JWT_SECRET=crm_super_secret_jwt_key_for_masters_union_2024
JWT_EXPIRES_IN=7d

# Email Configuration (Optional for development)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Frontend URL
FRONTEND_URL=http://localhost:3000

# CORS Origins (comma separated)
CORS_ORIGINS=http://localhost:3000,http://localhost:5000
EOF

echo "✅ Created backend/.env file"
echo ""
echo "Database Configuration:"
echo "  Database: crm_db"
echo "  User: crm_user"
echo "  Password: crm_password"
echo "  Host: localhost"
echo "  Port: 5432"

