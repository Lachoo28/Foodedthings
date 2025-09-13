import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const UpcomingDeliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeliveries = async () => {
      const homeId = localStorage.getItem('homeId');
      if (!homeId) {
        setError('Home ID not found. Please log in again.');
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`http://localhost:5000/api/home/upcoming-deliveries?homeId=${homeId}`);
        setDeliveries(response.data.map(delivery => ({
          ...delivery,
          start: new Date(delivery.preferredDeliveryDateTime),
          end: new Date(delivery.preferredDeliveryDateTime),
          title: `${delivery.donorId?.fullName || 'N/A'} - ${delivery.foodType}`,
        })));
      } catch (err) {
        setError('Failed to fetch upcoming deliveries.');
        console.error('Error fetching upcoming deliveries:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeliveries();
  }, []);

  if (loading) return <div className="text-center py-8">Loading upcoming deliveries...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Upcoming Deliveries</h2>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Calendar View</h3>
        <div style={{ height: 500 }}>
          <Calendar
            localizer={localizer}
            events={deliveries}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Delivery List</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Donor Name
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Food Type
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Delivery Date
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {deliveries.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                    No upcoming deliveries.
                  </td>
                </tr>
              ) : (
                deliveries.map((delivery) => (
                  <tr key={delivery._id}>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      {delivery.donorId?.fullName || 'N/A'}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      {delivery.donorId?.phoneNumber || 'N/A'}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      {delivery.foodType}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      {new Date(delivery.preferredDeliveryDateTime).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                        delivery.status === 'Delivered' ? 'text-green-900' :
                        'text-blue-900'
                      }`}>
                        <span aria-hidden="true" className={`absolute inset-0 opacity-50 rounded-full ${
                          delivery.status === 'Delivered' ? 'bg-green-200' :
                          'bg-blue-200'
                        }`}></span>
                        <span className="relative">{delivery.status}</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UpcomingDeliveries;
