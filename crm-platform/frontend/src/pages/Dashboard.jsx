import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDashboardStats,
  fetchLeadsByStatus,
  fetchLeadsByPriority,
  fetchLeadsTimeline,
  fetchTopPerformers,
  fetchActivityStats,
} from '../store/slices/dashboardSlice';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const {
    stats,
    leadsByStatus,
    leadsByPriority,
    leadsTimeline,
    topPerformers,
    activityStats,
    loading,
  } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchLeadsByStatus());
    dispatch(fetchLeadsByPriority());
    dispatch(fetchLeadsTimeline(30));
    dispatch(fetchActivityStats());
    
    if (user?.role === 'ADMIN' || user?.role === 'MANAGER') {
      dispatch(fetchTopPerformers());
    }
  }, [dispatch, user]);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.firstName}!</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#dbeafe' }}>📊</div>
          <div className="stat-content">
            <p className="stat-label">Total Leads</p>
            <h3 className="stat-value">{stats?.totalLeads || 0}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#dcfce7' }}>✅</div>
          <div className="stat-content">
            <p className="stat-label">Won Leads</p>
            <h3 className="stat-value">{stats?.wonLeads || 0}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fef3c7' }}>🎯</div>
          <div className="stat-content">
            <p className="stat-label">Conversion Rate</p>
            <h3 className="stat-value">{stats?.conversionRate || 0}%</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#d1fae5' }}>💰</div>
          <div className="stat-content">
            <p className="stat-label">Total Revenue</p>
            <h3 className="stat-value">${(stats?.wonValue || 0).toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="charts-grid">
        <div className="card chart-card">
          <h3>Leads by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={leadsByStatus}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {leadsByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <h3>Leads by Priority</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={leadsByPriority}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="priority" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="card chart-card-full">
        <h3>Leads Timeline (Last 30 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={leadsTimeline}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#4f46e5" name="Total Leads" />
            <Line type="monotone" dataKey="won" stroke="#10b981" name="Won" />
            <Line type="monotone" dataKey="lost" stroke="#ef4444" name="Lost" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Activity Stats */}
      {activityStats && (
        <div className="card">
          <h3>Activity Statistics</h3>
          <div className="activity-stats-grid">
            <div className="activity-stat">
              <span className="activity-stat-label">Total Activities</span>
              <span className="activity-stat-value">{activityStats.totalActivities}</span>
            </div>
            <div className="activity-stat">
              <span className="activity-stat-label">Completed</span>
              <span className="activity-stat-value">{activityStats.completedActivities}</span>
            </div>
            <div className="activity-stat">
              <span className="activity-stat-label">Upcoming</span>
              <span className="activity-stat-value">{activityStats.upcomingActivities}</span>
            </div>
          </div>
          
          {activityStats.activitiesByType?.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Activities by Type</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={activityStats.activitiesByType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Top Performers (Admin/Manager only) */}
      {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && topPerformers?.length > 0 && (
        <div className="card">
          <h3>Top Performers</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Total Leads</th>
                  <th>Won Leads</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topPerformers.map((performer) => (
                  <tr key={performer.id}>
                    <td>{performer.name}</td>
                    <td>{performer.totalLeads}</td>
                    <td>{performer.wonLeads}</td>
                    <td>${performer.wonValue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

