import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaHandsHelping, FaCheckCircle, FaTruck, FaClipboardList } from 'react-icons/fa';

const DashboardOverview = () => {
  const [summaryData, setSummaryData] = useState({
    totalDonations: 0,
    activeDonations: 0,
    upcomingDeliveries: 0,
    completedDeliveries: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const homeName = localStorage.getItem('homeName') || "Child Care Home";
  const homeId = localStorage.getItem('homeId');

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!homeId) {
        setError('Home ID not found. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        // Fetch summary data
        const summaryResponse = await axios.get(`http://localhost:5000/api/home/donations/summary?homeId=${homeId}`);
        setSummaryData(summaryResponse.data);

        // Fetch recent activity (e.g., last 4 donations)
        const activityResponse = await axios.get(`http://localhost:5000/api/home/donations?homeId=${homeId}`);
        setRecentActivity(activityResponse.data.slice(0, 4)); // Take first 4 for recent activity
      } catch (err) {
        setError('Failed to fetch dashboard data.');
        console.error('Error fetching home dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [homeId]);

  if (loading) return <div className="text-center py-8">Loading dashboard...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Welcome back, {homeName}!</h2>
        <Link to="/home-dashboard/donations" className="bg-primaryGreen text-white px-6 py-3 rounded-lg shadow hover:bg-green-600 transition duration-300">
          View Donations
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-600">Total Donations</h3>
            <p className="text-4xl font-bold text-primaryGreen">{summaryData.totalDonations}</p>
          </div>
          <FaHandsHelping className="text-5xl text-gray-300" />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-600">Active Donations</h3>
            <p className="text-4xl font-bold text-blue-500">{summaryData.activeDonations}</p>
          </div>
          <FaCheckCircle className="text-5xl text-gray-300" />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-600">Upcoming Deliveries</h3>
            <p className="text-4xl font-bold text-yellow-500">{summaryData.upcomingDeliveries}</p>
          </div>
          <FaTruck className="text-5xl text-gray-300" />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-600">Completed Deliveries</h3>
            <p className="text-4xl font-bold text-purple-500">{summaryData.completedDeliveries}</p>
          </div>
          <FaClipboardList className="text-5xl text-gray-300" />
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Donor Name
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Food Type
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                    No recent activity.
                  </td>
                </tr>
              ) : (
                recentActivity.map((activity) => (
                  <tr key={activity._id}>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      {activity.donorId?.fullName || 'N/A'}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      {activity.foodType}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      {activity.quantity} {activity.unit}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                        activity.status === 'completed' ? 'text-green-900' :
                        activity.status === 'pending' || activity.status === 'wait for home approval' ? 'text-orange-900' :
                        'text-blue-900'
                      }`}>
                        <span aria-hidden="true" className={`absolute inset-0 opacity-50 rounded-full ${
                          activity.status === 'completed' ? 'bg-green-200' :
                          activity.status === 'pending' || activity.status === 'wait for home approval' ? 'bg-orange-200' :
                          'bg-blue-200'
                        }`}></span>
                        <span className="relative">{activity.status}</span>
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

export default DashboardOverview;
