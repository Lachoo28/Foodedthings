import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      const homeId = localStorage.getItem('homeId');
      if (!homeId) {
        setError('Home ID not found. Please log in again.');
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`http://localhost:5000/api/home/notifications?homeId=${homeId}`);
        const fetchedNotifications = response.data;

        // For 'new_donation_request' notifications, fetch additional donation details
        const notificationsWithDetails = await Promise.all(
          fetchedNotifications.map(async (notification) => {
            if (notification.type === 'new_donation_request' && notification.details && notification.details.donationId) {
              try {
                const donationResponse = await axios.get(`http://localhost:5000/api/donations/${notification.details.donationId}`);
                const donationDetails = donationResponse.data;
                return {
                  ...notification,
                  donorName: notification.details.donorName,
                  donorAddress: notification.details.donorAddress,
                  donorPhoneNumber: notification.details.donorPhoneNumber,
                  foodDetails: `${donationDetails.quantity} ${donationDetails.unit} of ${donationDetails.foodType}`,
                  deliveryDate: donationDetails.preferredDeliveryDateTime,
                };
              } catch (donationErr) {
                console.error('Error fetching donation details for notification:', donationErr);
                return {
                  ...notification,
                  donorName: notification.details.donorName || 'N/A',
                  donorAddress: notification.details.donorAddress || 'N/A',
                  donorPhoneNumber: notification.details.donorPhoneNumber || 'N/A',
                  foodDetails: 'Details unavailable',
                  deliveryDate: 'Invalid Date',
                };
              }
            } else if (notification.type === 'new_non_food_donation_match' && notification.details) {
              return {
                ...notification,
                donorName: notification.details.donorName || 'N/A',
                donorAddress: notification.details.donorAddress || 'N/A',
                donorPhoneNumber: notification.details.donorPhoneNumber || 'N/A',
                donationDescription: notification.details.donationDescription || 'N/A',
                deliveryDateTime: notification.details.deliveryDateTime,
              };
            }
            return notification;
          })
        );
        setNotifications(notificationsWithDetails);
      } catch (err) {
        setError('Failed to fetch notifications.');
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await axios.post(`http://localhost:5000/api/home/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      setError('Failed to mark notification as read.');
      console.error('Error marking notification as read:', err);
    }
  };

  const markAsUnread = async (id) => {
    try {
      await axios.post(`http://localhost:5000/api/home/notifications/${id}/unread`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: false } : n));
    } catch (err) {
      setError('Failed to mark notification as unread.');
      console.error('Error marking notification as unread:', err);
    }
  };

  if (loading) return <div className="text-center py-8">Loading notifications...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Notifications</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notifications.length === 0 ? (
          <p className="col-span-full text-center py-8">No new notifications.</p>
        ) : (
          notifications.map((notification) => (
            <div key={notification._id} className={`bg-white p-6 rounded-lg shadow-md ${notification.isRead ? 'opacity-70' : 'border-l-4 border-primaryGreen'}`}>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {notification.type === 'new_donation_request' || notification.type === 'new_non_food_donation_match'
                  ? `New Donation Request from ${notification.donorName}`
                  : notification.message}
              </h3>
              {(notification.type === 'new_donation_request' || notification.type === 'new_non_food_donation_match') && (
                <>
                  <p className="text-gray-600 mb-1"><strong>Donor Name:</strong> {notification.donorName}</p>
                  <p className="text-gray-600 mb-1"><strong>Donor Address:</strong> {notification.donorAddress}</p>
                  <p className="text-gray-600 mb-1"><strong>Donor Phone:</strong> {notification.donorPhoneNumber}</p>
                  <p className="text-gray-600 mb-1">
                    <strong>Donation Details:</strong> {notification.type === 'new_donation_request' ? notification.foodDetails : notification.donationDescription}
                  </p>
                  <p className="text-gray-600 mb-3">
                    <strong>Delivery Date & Time:</strong>{' '}
                    {notification.type === 'new_donation_request'
                      ? (notification.deliveryDate !== 'Invalid Date' ? new Date(notification.deliveryDate).toLocaleString() : 'Invalid Date')
                      : (notification.deliveryDateTime ? new Date(notification.deliveryDateTime).toLocaleString() : 'Invalid Date')}
                  </p>
                </>
              )}
              <p className="text-gray-700 mb-4">{notification.message}</p>
              <div className="flex justify-between items-center">
                <Link to="/home-dashboard/donations" className="text-blue-500 hover:underline text-sm">
                  View in Donations Page
                </Link>
                <div>
                  {notification.isRead ? (
                    <button
                      onClick={() => markAsUnread(notification._id)}
                      className="bg-gray-300 text-gray-800 px-3 py-1 rounded-md text-xs hover:bg-gray-400"
                    >
                      Mark as Unread
                    </button>
                  ) : (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="bg-primaryGreen text-white px-3 py-1 rounded-md text-xs hover:bg-green-600"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
