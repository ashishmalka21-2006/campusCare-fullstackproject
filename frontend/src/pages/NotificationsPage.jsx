import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationApi } from '../api/notificationApi';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

const typeIcons = {
  COMPLAINT_SUBMITTED: { icon: 'bi-file-earmark-check-fill', color: 'text-primary' },
  COMPLAINT_ASSIGNED: { icon: 'bi-person-check-fill', color: 'text-indigo' },
  STATUS_CHANGED: { icon: 'bi-arrow-left-right', color: 'text-warning' },
  RESOLVED: { icon: 'bi-check-circle-fill', color: 'text-success' },
  COMPLAINT_REOPENED: { icon: 'bi-arrow-repeat', color: 'text-danger' },
};

const NotificationsPage = () => {
  const { user } = useAuth();
  const { refreshNotifications } = useNotification();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationApi.getNotifications();
      if (res.success && res.data) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationApi.markAsRead(id);
      refreshNotifications();
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      refreshNotifications();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleNotificationClick = (item) => {
    if (!item.read) {
      notificationApi.markAsRead(item.id).then(() => refreshNotifications());
    }

    if (item.complaintId) {
      if (user?.role === 'STUDENT') {
        navigate(`/student/complaints/${item.complaintId}`);
      } else if (user?.role === 'STAFF') {
        navigate(`/staff/complaints/${item.complaintId}`);
      } else {
        navigate(`/admin/complaints`);
      }
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div style={{ maxWidth: '800px' }}>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold brand-font text-dark mb-1">Notifications Center 🔔</h3>
          <p className="text-muted small mb-0">
            Real-time notifications regarding status updates, technician assignments, and resolutions.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            className="btn btn-outline-primary btn-sm rounded-pill px-3 py-2 fw-medium"
            onClick={handleMarkAllRead}
          >
            <i className="bi bi-check2-all me-1"></i> Mark All as Read
          </button>
        )}
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
        {loading ? (
          <LoadingSpinner message="Loading notifications..." />
        ) : notifications.length > 0 ? (
          <div className="list-group list-group-flush">
            {notifications.map((item) => {
              const iconMeta = typeIcons[item.type] || { icon: 'bi-bell-fill', color: 'text-primary' };
              return (
                <div
                  key={item.id}
                  className={`list-group-item list-group-item-action p-4 border-bottom d-flex align-items-start gap-3 cursor-pointer ${
                    !item.read ? 'bg-primary-subtle bg-opacity-25' : ''
                  }`}
                  onClick={() => handleNotificationClick(item)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={`p-2 rounded-circle bg-light ${iconMeta.color} fs-5`}>
                    <i className={`bi ${iconMeta.icon}`}></i>
                  </div>

                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center justify-content-between gap-2 mb-1">
                      <div className="fw-bold text-dark small">{item.title}</div>
                      <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                        {new Date(item.createdAt).toLocaleString()}
                      </small>
                    </div>

                    <p className="text-secondary small mb-1">{item.message}</p>

                    <div className="d-flex align-items-center gap-2 mt-2">
                      {item.complaintReference && (
                        <span className="badge bg-light text-primary border small">
                          #{item.complaintReference}
                        </span>
                      )}
                      {!item.read && (
                        <span className="badge bg-primary text-white small" style={{ fontSize: '0.65rem' }}>
                          Unread
                        </span>
                      )}
                    </div>
                  </div>

                  {!item.read && (
                    <button
                      className="btn btn-sm btn-link text-muted p-0"
                      onClick={(e) => handleMarkAsRead(item.id, e)}
                      title="Mark as read"
                    >
                      <i className="bi bi-check-lg fs-5"></i>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4">
            <EmptyState
              icon="bi-bell-slash"
              title="No notifications"
              description="You do not have any notifications yet. Status updates will show up here."
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
