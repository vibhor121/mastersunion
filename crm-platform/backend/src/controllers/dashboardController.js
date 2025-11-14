import prisma from '../config/database.js';
import logger from '../config/logger.js';

/**
 * Get dashboard statistics
 * @route GET /api/v1/dashboard/stats
 * @access Private
 */
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Base filter: Sales Executives only see their leads
    const ownerFilter = userRole === 'SALES_EXECUTIVE' ? `AND owner_id = '${userId}'` : '';

    // Get overall stats using raw SQL to avoid type casting issues
    const stats = await prisma.$queryRawUnsafe(`
      SELECT 
        COUNT(*)::int as "totalLeads",
        COUNT(*) FILTER (WHERE status = 'NEW')::int as "newLeads",
        COUNT(*) FILTER (WHERE status = 'QUALIFIED')::int as "qualifiedLeads",
        COUNT(*) FILTER (WHERE status = 'WON')::int as "wonLeads",
        COUNT(*) FILTER (WHERE status = 'LOST')::int as "lostLeads",
        COALESCE(SUM(value), 0) as "totalValue",
        COALESCE(SUM(value) FILTER (WHERE status = 'WON'), 0) as "wonValue"
      FROM leads
      WHERE 1=1 ${ownerFilter}
    `);

    const {
      totalLeads,
      newLeads,
      qualifiedLeads,
      wonLeads,
      lostLeads,
      totalValue,
      wonValue,
    } = stats[0];

    // Calculate conversion rate
    const conversionRate =
      totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalLeads,
        newLeads,
        qualifiedLeads,
        wonLeads,
        lostLeads,
        totalValue: totalValue._sum.value || 0,
        wonValue: wonValue._sum.value || 0,
        conversionRate: parseFloat(conversionRate),
      },
    });
  } catch (error) {
    logger.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard statistics',
      error: error.message,
    });
  }
};

/**
 * Get leads by status for pie chart
 * @route GET /api/v1/dashboard/leads-by-status
 * @access Private
 */
export const getLeadsByStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    const ownerFilter = userRole === 'SALES_EXECUTIVE' ? `AND owner_id = '${userId}'` : '';

    const leadsByStatus = await prisma.$queryRawUnsafe(`
      SELECT status, COUNT(*)::int as count
      FROM leads
      WHERE 1=1 ${ownerFilter}
      GROUP BY status
      ORDER BY count DESC
    `);

    const formattedData = leadsByStatus.map((item) => ({
      status: item.status,
      count: Number(item.count),
    }));

    res.status(200).json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    logger.error('Get leads by status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve leads by status',
      error: error.message,
    });
  }
};

/**
 * Get leads by priority
 * @route GET /api/v1/dashboard/leads-by-priority
 * @access Private
 */
export const getLeadsByPriority = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    const ownerFilter = userRole === 'SALES_EXECUTIVE' ? `AND owner_id = '${userId}'` : '';

    const leadsByPriority = await prisma.$queryRawUnsafe(`
      SELECT priority, COUNT(*)::int as count
      FROM leads
      WHERE 1=1 ${ownerFilter}
      GROUP BY priority
      ORDER BY count DESC
    `);

    const formattedData = leadsByPriority.map((item) => ({
      priority: item.priority,
      count: Number(item.count),
    }));

    res.status(200).json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    logger.error('Get leads by priority error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve leads by priority',
      error: error.message,
    });
  }
};

/**
 * Get leads created over time (last 30 days)
 * @route GET /api/v1/dashboard/leads-timeline
 * @access Private
 */
export const getLeadsTimeline = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { days = 30 } = req.query;

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    const ownerFilter = userRole === 'SALES_EXECUTIVE' ? `AND owner_id = '${userId}'` : '';

    const leads = await prisma.$queryRawUnsafe(`
      SELECT created_at as "createdAt", status
      FROM leads
      WHERE created_at >= $1 ${ownerFilter}
      ORDER BY created_at
    `, daysAgo);

    // Group by date
    const timeline = {};
    leads.forEach((lead) => {
      const date = lead.createdAt.toISOString().split('T')[0];
      if (!timeline[date]) {
        timeline[date] = { date, count: 0, won: 0, lost: 0 };
      }
      timeline[date].count++;
      if (lead.status === 'WON') timeline[date].won++;
      if (lead.status === 'LOST') timeline[date].lost++;
    });

    const formattedData = Object.values(timeline).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    res.status(200).json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    logger.error('Get leads timeline error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve leads timeline',
      error: error.message,
    });
  }
};

/**
 * Get top performers (only for Admin/Manager)
 * @route GET /api/v1/dashboard/top-performers
 * @access Private (Admin/Manager)
 */
export const getTopPerformers = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const performers = await prisma.user.findMany({
      where: {
        role: { in: ['SALES_EXECUTIVE', 'MANAGER'] },
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        _count: {
          select: {
            leads: true,
          },
        },
      },
      take: parseInt(limit),
    });

    // Get won leads count for each user
    const performersWithStats = await Promise.all(
      performers.map(async (user) => {
        const wonLeads = await prisma.lead.count({
          where: {
            ownerId: user.id,
            status: 'WON',
          },
        });

        const totalValue = await prisma.lead.aggregate({
          where: {
            ownerId: user.id,
            status: 'WON',
          },
          _sum: { value: true },
        });

        return {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          totalLeads: user._count.leads,
          wonLeads,
          wonValue: totalValue._sum.value || 0,
        };
      })
    );

    // Sort by won value
    performersWithStats.sort((a, b) => b.wonValue - a.wonValue);

    res.status(200).json({
      success: true,
      data: performersWithStats,
    });
  } catch (error) {
    logger.error('Get top performers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve top performers',
      error: error.message,
    });
  }
};

/**
 * Get activity statistics
 * @route GET /api/v1/dashboard/activity-stats
 * @access Private
 */
export const getActivityStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get user's leads
    const ownerFilter = userRole === 'SALES_EXECUTIVE' ? `AND l.owner_id = '${userId}'` : '';

    // Get activity stats using raw SQL
    const stats = await prisma.$queryRawUnsafe(`
      SELECT 
        COUNT(*)::int as "totalActivities",
        COUNT(*) FILTER (WHERE completed_at IS NOT NULL)::int as "completedActivities",
        COUNT(*) FILTER (WHERE scheduled_at >= NOW() AND completed_at IS NULL)::int as "upcomingActivities"
      FROM activities a
      JOIN leads l ON a.lead_id = l.id
      WHERE 1=1 ${ownerFilter}
    `);

    const { totalActivities, completedActivities, upcomingActivities } = stats[0];

    // Get activities by type
    const activitiesByType = await prisma.$queryRawUnsafe(`
      SELECT type, COUNT(*)::int as count
      FROM activities a
      JOIN leads l ON a.lead_id = l.id
      WHERE 1=1 ${ownerFilter}
      GROUP BY type
      ORDER BY count DESC
    `);

    res.status(200).json({
      success: true,
      data: {
        totalActivities: Number(totalActivities),
        completedActivities: Number(completedActivities),
        upcomingActivities: Number(upcomingActivities),
        activitiesByType: activitiesByType.map((item) => ({
          type: item.type,
          count: Number(item.count),
        })),
      },
    });
  } catch (error) {
    logger.error('Get activity stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve activity statistics',
      error: error.message,
    });
  }
};

