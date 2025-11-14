import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markAsRead, markAllAsRead, deleteNotification } from '../store/slices/notificationSlice';
import { format } from 'date-fns';
import './Notifications.css';

const Notifications = () => {
  const dispatch = useDispatch();
  const { notifications, loading, unreadCount } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleMarkAsRead = (id) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleDelete = (id) => {
    dispatch(deleteNotification(id));
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="notifications-page">
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount} unread</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-outline" onClick={handleMarkAllAsRead}>
            Mark All as Read
          </button>
        )}
      </div>

      <div className="card">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <p>No notifications</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
              >
                <div className="notification-content" onClick={() => handleMarkAsRead(notification.id)}>
                  <div className="notification-header">
                    <strong>{notification.title}</strong>
                    <span className="notification-date">
                      {format(new Date(notification.createdAt), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                  <p>{notification.message}</p>
                  <span className={`badge badge-${notification.type.toLowerCase()}`}>
                    {notification.type}
                  </span>
                </div>
                <button
                  className="btn-icon btn-icon-danger"
                  onClick={() => handleDelete(notification.id)}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;

