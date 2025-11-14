import bcrypt from 'bcrypt';
import prisma from '../config/database.js';
import logger from '../config/logger.js';

/**
 * Seed database with initial data
 */
async function seed() {
  try {
    logger.info('Starting database seeding...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@crm.com' },
      update: {},
      create: {
        email: 'admin@crm.com',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
      },
    });
    logger.info(`✓ Admin user created: ${admin.email}`);

    // Create manager user
    const managerPassword = await bcrypt.hash('manager123', 10);
    const manager = await prisma.user.upsert({
      where: { email: 'manager@crm.com' },
      update: {},
      create: {
        email: 'manager@crm.com',
        password: managerPassword,
        firstName: 'John',
        lastName: 'Manager',
        role: 'MANAGER',
      },
    });
    logger.info(`✓ Manager user created: ${manager.email}`);

    // Create sales executive users
    const salesPassword = await bcrypt.hash('sales123', 10);
    const sales1 = await prisma.user.upsert({
      where: { email: 'sales1@crm.com' },
      update: {},
      create: {
        email: 'sales1@crm.com',
        password: salesPassword,
        firstName: 'Alice',
        lastName: 'Smith',
        role: 'SALES_EXECUTIVE',
      },
    });
    logger.info(`✓ Sales Executive 1 created: ${sales1.email}`);

    const sales2 = await prisma.user.upsert({
      where: { email: 'sales2@crm.com' },
      update: {},
      create: {
        email: 'sales2@crm.com',
        password: salesPassword,
        firstName: 'Bob',
        lastName: 'Johnson',
        role: 'SALES_EXECUTIVE',
      },
    });
    logger.info(`✓ Sales Executive 2 created: ${sales2.email}`);

    // Create sample leads with diverse data
    const sampleLeads = [
      // NEW Leads
      {
        firstName: 'Sarah',
        lastName: 'Williams',
        email: 'sarah.williams@techcorp.com',
        phone: '+1234567890',
        company: 'Tech Corp',
        position: 'CTO',
        status: 'NEW',
        source: 'Website',
        value: 50000,
        priority: 'HIGH',
        notes: 'Interested in enterprise plan. Requested demo for next week.',
        ownerId: sales1.id,
        createdById: manager.id,
      },
      {
        firstName: 'James',
        lastName: 'Anderson',
        email: 'james.anderson@cloudify.com',
        phone: '+1234567895',
        company: 'Cloudify Solutions',
        position: 'VP Technology',
        status: 'NEW',
        source: 'LinkedIn',
        value: 120000,
        priority: 'URGENT',
        notes: 'Large enterprise client. Budget approved for Q1.',
        ownerId: sales2.id,
        createdById: manager.id,
      },
      {
        firstName: 'Rachel',
        lastName: 'Green',
        email: 'rachel.green@designco.com',
        phone: '+1234567896',
        company: 'Design Co',
        position: 'Creative Director',
        status: 'NEW',
        source: 'Referral',
        value: 35000,
        priority: 'MEDIUM',
        notes: 'Referred by existing client. Looking for creative solutions.',
        ownerId: sales1.id,
        createdById: admin.id,
      },
      // CONTACTED Leads
      {
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@startupinc.com',
        phone: '+1234567891',
        company: 'Startup Inc',
        position: 'CEO',
        status: 'CONTACTED',
        source: 'Referral',
        value: 75000,
        priority: 'URGENT',
        notes: 'Had initial call. Very interested. Follow up scheduled for Friday.',
        ownerId: sales1.id,
        createdById: manager.id,
      },
      {
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@enterprise.com',
        phone: '+1234567892',
        company: 'Enterprise Solutions',
        position: 'VP Sales',
        status: 'CONTACTED',
        source: 'Cold Call',
        value: 100000,
        priority: 'MEDIUM',
        notes: 'Initial meeting went well. Requested product documentation.',
        ownerId: sales2.id,
        createdById: manager.id,
      },
      {
        firstName: 'Tom',
        lastName: 'Wilson',
        email: 'tom.wilson@marketpro.com',
        phone: '+1234567897',
        company: 'MarketPro Agency',
        position: 'Marketing Director',
        status: 'CONTACTED',
        source: 'Website',
        value: 45000,
        priority: 'LOW',
        notes: 'Contacted via email. Awaiting response on demo availability.',
        ownerId: sales1.id,
        createdById: sales1.id,
      },
      // QUALIFIED Leads
      {
        firstName: 'David',
        lastName: 'Martinez',
        email: 'david.martinez@innovate.com',
        phone: '+1234567893',
        company: 'Innovate LLC',
        position: 'Director',
        status: 'QUALIFIED',
        source: 'LinkedIn',
        value: 60000,
        priority: 'HIGH',
        notes: 'Qualified lead. Budget confirmed. Decision makers identified.',
        ownerId: sales2.id,
        createdById: manager.id,
      },
      {
        firstName: 'Lisa',
        lastName: 'Chen',
        email: 'lisa.chen@techhub.com',
        phone: '+1234567898',
        company: 'TechHub Innovations',
        position: 'COO',
        status: 'QUALIFIED',
        source: 'Conference',
        value: 95000,
        priority: 'URGENT',
        notes: 'Met at TechCon 2025. Very interested. Timeline: 2 months.',
        ownerId: sales1.id,
        createdById: admin.id,
      },
      {
        firstName: 'Robert',
        lastName: 'Johnson',
        email: 'robert.johnson@financeplus.com',
        phone: '+1234567899',
        company: 'Finance Plus',
        position: 'CFO',
        status: 'QUALIFIED',
        source: 'Referral',
        value: 150000,
        priority: 'HIGH',
        notes: 'Enterprise client. Requires compliance documentation.',
        ownerId: sales2.id,
        createdById: manager.id,
      },
      // PROPOSAL Leads
      {
        firstName: 'Jessica',
        lastName: 'Taylor',
        email: 'jessica.taylor@global.com',
        phone: '+1234567894',
        company: 'Global Industries',
        position: 'Manager',
        status: 'PROPOSAL',
        source: 'Conference',
        value: 85000,
        priority: 'MEDIUM',
        notes: 'Proposal submitted. Awaiting feedback from stakeholders.',
        ownerId: sales1.id,
        createdById: manager.id,
      },
      {
        firstName: 'Kevin',
        lastName: 'Lee',
        email: 'kevin.lee@datacore.com',
        phone: '+1234567900',
        company: 'DataCore Systems',
        position: 'VP Engineering',
        status: 'PROPOSAL',
        source: 'Website',
        value: 110000,
        priority: 'HIGH',
        notes: 'Custom proposal sent. Presentation scheduled for next week.',
        ownerId: sales2.id,
        createdById: sales2.id,
      },
      // NEGOTIATION Leads
      {
        firstName: 'Amanda',
        lastName: 'White',
        email: 'amanda.white@retailchain.com',
        phone: '+1234567901',
        company: 'Retail Chain Co',
        position: 'Director of Operations',
        status: 'NEGOTIATION',
        source: 'Cold Call',
        value: 130000,
        priority: 'URGENT',
        notes: 'In final negotiations. Discussing pricing and terms.',
        ownerId: sales1.id,
        createdById: manager.id,
      },
      {
        firstName: 'Chris',
        lastName: 'Moore',
        email: 'chris.moore@healthtech.com',
        phone: '+1234567902',
        company: 'HealthTech Solutions',
        position: 'CEO',
        status: 'NEGOTIATION',
        source: 'Referral',
        value: 200000,
        priority: 'URGENT',
        notes: 'Major deal. Legal review in progress. Close expected this month.',
        ownerId: sales2.id,
        createdById: admin.id,
      },
      // WON Leads
      {
        firstName: 'Michelle',
        lastName: 'Garcia',
        email: 'michelle.garcia@edutech.com',
        phone: '+1234567903',
        company: 'EduTech Platform',
        position: 'Founder',
        status: 'WON',
        source: 'LinkedIn',
        value: 80000,
        priority: 'MEDIUM',
        notes: 'Deal closed! Contract signed. Onboarding scheduled.',
        ownerId: sales1.id,
        createdById: sales1.id,
      },
      {
        firstName: 'Daniel',
        lastName: 'Kim',
        email: 'daniel.kim@automate.io',
        phone: '+1234567904',
        company: 'Automate.io',
        position: 'CTO',
        status: 'WON',
        source: 'Conference',
        value: 125000,
        priority: 'HIGH',
        notes: 'Successfully closed. Payment received. Implementation starting.',
        ownerId: sales2.id,
        createdById: manager.id,
      },
      // LOST Leads
      {
        firstName: 'Patricia',
        lastName: 'Brown',
        email: 'patricia.brown@oldschool.com',
        phone: '+1234567905',
        company: 'OldSchool Corp',
        position: 'Manager',
        status: 'LOST',
        source: 'Cold Call',
        value: 40000,
        priority: 'LOW',
        notes: 'Lost to competitor. Pricing was main concern.',
        ownerId: sales1.id,
        createdById: sales1.id,
      },
      {
        firstName: 'Brian',
        lastName: 'Davis',
        email: 'brian.davis@budget.com',
        phone: '+1234567906',
        company: 'Budget Solutions',
        position: 'Director',
        status: 'LOST',
        source: 'Website',
        value: 30000,
        priority: 'LOW',
        notes: 'Budget constraints. Will revisit next quarter.',
        ownerId: sales2.id,
        createdById: manager.id,
      },
      // INACTIVE Leads
      {
        firstName: 'Susan',
        lastName: 'Miller',
        email: 'susan.miller@dormant.com',
        phone: '+1234567907',
        company: 'Dormant Industries',
        position: 'VP',
        status: 'INACTIVE',
        source: 'Website',
        value: 25000,
        priority: 'LOW',
        notes: 'No response to follow-ups. Marking as inactive.',
        ownerId: sales1.id,
        createdById: sales1.id,
      },
    ];

    const createdLeads = [];
    for (const leadData of sampleLeads) {
      const lead = await prisma.lead.create({
        data: leadData,
      });
      createdLeads.push(lead);

      // Create initial activity
      await prisma.activity.create({
        data: {
          type: 'NOTE',
          title: 'Lead created',
          description: `Lead ${lead.firstName} ${lead.lastName} was added to the system`,
          leadId: lead.id,
          userId: leadData.createdById,
        },
      });

      logger.info(`✓ Lead created: ${lead.firstName} ${lead.lastName}`);
    }

    // Create additional activities for various leads
    logger.info('\n📝 Creating additional activities...');
    
    const activityTypes = ['NOTE', 'CALL', 'MEETING', 'EMAIL', 'TASK'];
    const activityTemplates = [
      {
        type: 'CALL',
        title: 'Initial discovery call',
        description: 'Discussed client requirements and pain points. Client expressed interest in our enterprise solution.',
        duration: 30,
      },
      {
        type: 'EMAIL',
        title: 'Sent product brochure',
        description: 'Emailed detailed product information and pricing tiers.',
        duration: null,
      },
      {
        type: 'MEETING',
        title: 'Product demo',
        description: 'Conducted live demo of the platform. Client impressed with features.',
        duration: 60,
      },
      {
        type: 'CALL',
        title: 'Follow-up call',
        description: 'Addressed questions from demo. Discussed implementation timeline.',
        duration: 20,
      },
      {
        type: 'NOTE',
        title: 'Internal meeting notes',
        description: 'Team discussed strategy for closing this deal. Need to provide custom proposal.',
        duration: null,
      },
      {
        type: 'TASK',
        title: 'Prepare proposal',
        description: 'Create customized proposal with pricing and timeline.',
        duration: null,
      },
      {
        type: 'EMAIL',
        title: 'Sent proposal',
        description: 'Sent detailed proposal including pricing, terms, and implementation plan.',
        duration: null,
      },
      {
        type: 'MEETING',
        title: 'Negotiation meeting',
        description: 'Met with decision makers. Discussed contract terms and pricing adjustments.',
        duration: 90,
      },
    ];

    // Add activities to first 10 leads
    for (let i = 0; i < Math.min(10, createdLeads.length); i++) {
      const lead = createdLeads[i];
      const numActivities = Math.floor(Math.random() * 5) + 2; // 2-6 activities per lead
      
      for (let j = 0; j < numActivities; j++) {
        const template = activityTemplates[j % activityTemplates.length];
        const daysAgo = Math.floor(Math.random() * 30);
        
        await prisma.activity.create({
          data: {
            type: template.type,
            title: template.title,
            description: template.description,
            duration: template.duration,
            leadId: lead.id,
            userId: lead.ownerId,
            createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
          },
        });
      }
    }
    logger.info('✓ Additional activities created');

    // Create lead history entries
    logger.info('\n📜 Creating lead history...');
    for (let i = 0; i < Math.min(8, createdLeads.length); i++) {
      const lead = createdLeads[i];
      
      // Status change history
      await prisma.leadHistory.create({
        data: {
          leadId: lead.id,
          fieldName: 'status',
          oldValue: 'NEW',
          newValue: lead.status,
          changedBy: `${manager.firstName} ${manager.lastName}`,
        },
      });

      // Priority change history
      if (Math.random() > 0.5) {
        await prisma.leadHistory.create({
          data: {
            leadId: lead.id,
            fieldName: 'priority',
            oldValue: 'MEDIUM',
            newValue: lead.priority,
            changedBy: `${sales1.firstName} ${sales1.lastName}`,
          },
        });
      }

      // Value update history
      if (lead.value > 50000) {
        await prisma.leadHistory.create({
          data: {
            leadId: lead.id,
            fieldName: 'value',
            oldValue: String(lead.value * 0.8),
            newValue: String(lead.value),
            changedBy: `${manager.firstName} ${manager.lastName}`,
          },
        });
      }
    }
    logger.info('✓ Lead history created');

    // Create notifications for all users
    logger.info('\n🔔 Creating notifications...');
    
    const notificationTemplates = [
      {
        title: 'New Lead Assigned',
        message: 'A new high-priority lead has been assigned to you',
        type: 'LEAD_ASSIGNED',
      },
      {
        title: 'Lead Status Changed',
        message: 'Lead status updated to QUALIFIED. Great progress!',
        type: 'LEAD_STATUS_CHANGED',
      },
      {
        title: 'Activity Reminder',
        message: 'You have a scheduled meeting with client tomorrow at 10 AM',
        type: 'ACTIVITY_REMINDER',
      },
      {
        title: 'Deal Won!',
        message: 'Congratulations! You closed a $125,000 deal',
        type: 'SYSTEM_ALERT',
      },
      {
        title: 'Follow-up Required',
        message: 'Lead has not been contacted in 5 days. Schedule a follow-up.',
        type: 'ACTIVITY_REMINDER',
      },
      {
        title: 'New Comment',
        message: 'Manager added a comment on your lead',
        type: 'MENTION',
      },
    ];

    // Create notifications for sales executives
    const users = [sales1, sales2];
    for (const user of users) {
      for (let i = 0; i < 4; i++) {
        const template = notificationTemplates[i % notificationTemplates.length];
        const isRead = Math.random() > 0.5; // 50% chance of being read
        
        await prisma.notification.create({
          data: {
            userId: user.id,
            title: template.title,
            message: template.message,
            type: template.type,
            isRead: isRead,
            metadata: { leadId: createdLeads[i % createdLeads.length].id },
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000),
          },
        });
      }
    }

    // Create notifications for manager
    await prisma.notification.create({
      data: {
        userId: manager.id,
        title: 'Monthly Report Ready',
        message: 'Your monthly sales report is ready for review',
        type: 'SYSTEM_ALERT',
        isRead: false,
      },
    });

    await prisma.notification.create({
      data: {
        userId: manager.id,
        title: 'Team Performance',
        message: 'Your team achieved 120% of target this month!',
        type: 'SYSTEM_ALERT',
        isRead: true,
      },
    });

    logger.info('✓ Notifications created');

    logger.info('✅ Database seeding completed successfully!');
    logger.info('\n📝 Test Credentials:');
    logger.info('Admin: admin@crm.com / admin123');
    logger.info('Manager: manager@crm.com / manager123');
    logger.info('Sales: sales1@crm.com / sales123');
    logger.info('Sales: sales2@crm.com / sales123\n');
  } catch (error) {
    logger.error('Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seed function
seed()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Seeding failed:', error);
    process.exit(1);
  });

