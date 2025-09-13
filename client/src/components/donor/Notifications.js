import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const donorId = localStorage.getItem('donorId');

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:5000/api/notifications/donor/${donorId}`);
      setNotifications(response.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to fetch notifications.');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [donorId]);

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`);
      // Update the notification in the local state
      setNotifications(notifications.map(notif =>
        notif._id === id ? { ...notif, isRead: true } : notif
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      alert('Failed to mark notification as read.');
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Loading notifications...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Notifications</h2>

      <div className="bg-white p-6 rounded-lg shadow-md">
        {notifications.length === 0 ? (
          <p className="text-gray-600 text-center">No new notifications.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <li key={notification._id} className={`py-4 flex justify-between items-center ${!notification.isRead ? 'font-bold' : 'text-gray-600'}`}>
                <div>
                  <p>{notification.message}</p>
                  {notification.type === 'donation_matched' && notification.details && (
                    <div className="text-sm text-gray-500 mt-1">
                      <p><strong>Matched Home:</strong> {notification.details.homeName}</p>
                      <p><strong>Address:</strong> {notification.details.homeAddress}</p>
                      <p><strong>Phone:</strong> {notification.details.homePhoneNumber}</p>
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notification.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notification._id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600"
                  >
                    Mark as Read
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notifications;
