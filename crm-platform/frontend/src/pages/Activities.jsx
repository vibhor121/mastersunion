import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUpcomingActivities } from '../store/slices/activitySlice';
import { format } from 'date-fns';
import './Activities.css';

const Activities = () => {
  const dispatch = useDispatch();
  const { upcomingActivities, loading } = useSelector((state) => state.activities);

  useEffect(() => {
    dispatch(fetchUpcomingActivities());
  }, [dispatch]);

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="activities-page">
      <h1>Upcoming Activities</h1>
      
      <div className="card">
        {upcomingActivities.length === 0 ? (
          <div className="empty-state">
            <p>No upcoming activities</p>
          </div>
        ) : (
          <div className="activities-list">
            {upcomingActivities.map((activity) => (
              <div key={activity.id} className="activity-card">
                <div className="activity-header">
                  <span className={`badge badge-${activity.type.toLowerCase()}`}>
                    {activity.type}
                  </span>
                  <span className="activity-date">
                    {activity.scheduledAt && format(new Date(activity.scheduledAt), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
                <h3>{activity.title}</h3>
                {activity.description && <p>{activity.description}</p>}
                <div className="activity-footer">
                  <span>Lead: {activity.lead?.firstName} {activity.lead?.lastName}</span>
                  <span>By: {activity.user?.firstName} {activity.user?.lastName}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Activities;

