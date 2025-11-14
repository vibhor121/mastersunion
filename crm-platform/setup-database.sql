-- ============================================
-- CRM Platform Database Setup Script
-- Run this in pgAdmin 4 Query Tool
-- ============================================

-- Step 1: Create the database (run this first, then connect to crm_db)
-- Note: You may need to run this separately from a different database
-- CREATE DATABASE crm_db;

-- Step 2: Create user and grant privileges
-- Run these after connecting to crm_db database

-- Create user if not exists
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'crm_user') THEN
      CREATE USER crm_user WITH PASSWORD 'crm_password';
   END IF;
END
$do$;

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE crm_db TO crm_user;
GRANT ALL ON SCHEMA public TO crm_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO crm_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO crm_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO crm_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO crm_user;

-- Step 3: Create tables
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'SALES_EXECUTIVE' CHECK (role IN ('ADMIN', 'MANAGER', 'SALES_EXECUTIVE')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    company VARCHAR(200),
    position VARCHAR(100),
    status VARCHAR(20) DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST', 'INACTIVE')),
    source VARCHAR(100),
    value DECIMAL(15,2) DEFAULT 0,
    priority VARCHAR(20) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    notes TEXT,
    owner_id UUID NOT NULL,
    created_by_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_id) REFERENCES users(id)
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('NOTE', 'CALL', 'MEETING', 'EMAIL', 'TASK', 'STATUS_CHANGE')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    outcome TEXT,
    duration INTEGER,
    scheduled_at TIMESTAMP,
    completed_at TIMESTAMP,
    lead_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Lead History table
CREATE TABLE IF NOT EXISTS lead_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('LEAD_ASSIGNED', 'LEAD_STATUS_CHANGED', 'ACTIVITY_REMINDER', 'SYSTEM_ALERT', 'MENTION')),
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_leads_owner ON leads(owner_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_activities_lead ON activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_scheduled ON activities(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_history_lead ON lead_history(lead_id);
CREATE INDEX IF NOT EXISTS idx_history_created ON lead_history(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

-- Step 4: Insert demo data

-- Insert users (passwords are hashed with bcrypt for: admin123, manager123, sales123)
INSERT INTO users (id, email, password, first_name, last_name, role) VALUES
    ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'admin@crm.com', '$2b$10$YourHashedPasswordHere1', 'Admin', 'User', 'ADMIN'),
    ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'manager@crm.com', '$2b$10$YourHashedPasswordHere2', 'John', 'Manager', 'MANAGER'),
    ('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'sales1@crm.com', '$2b$10$YourHashedPasswordHere3', 'Alice', 'Smith', 'SALES_EXECUTIVE'),
    ('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'sales2@crm.com', '$2b$10$YourHashedPasswordHere4', 'Bob', 'Johnson', 'SALES_EXECUTIVE')
ON CONFLICT (email) DO NOTHING;

-- Insert sample leads
INSERT INTO leads (first_name, last_name, email, phone, company, position, status, source, value, priority, notes, owner_id, created_by_id) VALUES
    ('Sarah', 'Williams', 'sarah.williams@techcorp.com', '+1234567890', 'Tech Corp', 'CTO', 'NEW', 'Website', 50000, 'HIGH', 'Interested in enterprise plan', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e'),
    ('Michael', 'Brown', 'michael.brown@startupinc.com', '+1234567891', 'Startup Inc', 'CEO', 'QUALIFIED', 'Referral', 75000, 'URGENT', 'Ready to sign contract', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e'),
    ('Emily', 'Davis', 'emily.davis@enterprise.com', '+1234567892', 'Enterprise Solutions', 'VP Sales', 'CONTACTED', 'Cold Call', 100000, 'MEDIUM', 'Scheduled follow-up meeting', 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e'),
    ('David', 'Martinez', 'david.martinez@innovate.com', '+1234567893', 'Innovate LLC', 'Director', 'PROPOSAL', 'LinkedIn', 60000, 'HIGH', 'Reviewing proposal', 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e'),
    ('Jessica', 'Taylor', 'jessica.taylor@global.com', '+1234567894', 'Global Industries', 'Manager', 'WON', 'Conference', 85000, 'MEDIUM', 'Contract signed', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e')
ON CONFLICT (email) DO NOTHING;

-- Insert sample activities
INSERT INTO activities (type, title, description, lead_id, user_id)
SELECT 
    'NOTE',
    'Lead created',
    'Lead was added to the system',
    l.id,
    l.created_by_id
FROM leads l
WHERE NOT EXISTS (
    SELECT 1 FROM activities a WHERE a.lead_id = l.id
);

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, type, is_read)
SELECT 
    'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f',
    'Welcome to CRM',
    'Welcome! You have been added to the CRM system.',
    'SYSTEM_ALERT',
    FALSE
WHERE NOT EXISTS (SELECT 1 FROM notifications LIMIT 1);

-- Success message
SELECT 'Database setup completed successfully!' AS status,
       (SELECT COUNT(*) FROM users) AS total_users,
       (SELECT COUNT(*) FROM leads) AS total_leads,
       (SELECT COUNT(*) FROM activities) AS total_activities;


