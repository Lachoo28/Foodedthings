import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DonorDashboardOverview = () => {
  const [summary, setSummary] = useState({
    totalDonationsMade: 0,
    activeDonations: 0,
    pendingMatches: 0,
    successfulMatches: 0,
  });
  const [recentDonations, setRecentDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const donorId = localStorage.getItem('donorId');
  const donorName = localStorage.getItem('donorName') || "Donor";

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!donorId) {
        setError('Donor ID not found. Please log in.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Fetch summary data
        const summaryResponse = await axios.get(`http://localhost:5000/api/donations/summary/${donorId}`);
        setSummary(summaryResponse.data);

        // Fetch recent donations
        const donationsResponse = await axios.get(`http://localhost:5000/api/donations/donor/${donorId}`);
        setRecentDonations(donationsResponse.data.slice(0, 5)); // Get top 5 recent donations
      } catch (err) {
        console.error('Error fetching donor dashboard data:', err);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [donorId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-200 text-yellow-800';
      case 'approved':
        return 'bg-blue-200 text-blue-800';
      case 'matched':
        return 'bg-purple-200 text-purple-800';
      case 'wait for home approval':
        return 'bg-orange-200 text-orange-800';
      case 'completed':
        return 'bg-green-200 text-green-800';
      case 'rejected':
        return 'bg-red-200 text-red-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Hero Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Welcome back, {donorName}!</h2>
        <p className="text-gray-600 mt-2">Here's a quick overview of your donation activity.</p>
      </div>

      {/* Donation Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center">
          <p className="text-4xl font-bold text-primaryGreen">{summary.totalDonationsMade}</p>
          <p className="text-gray-600 mt-2">Total Donations Made</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center">
          <p className="text-4xl font-bold text-blue-600">{summary.activeDonations}</p>
          <p className="text-gray-600 mt-2">Active Donations</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center">
          <p className="text-4xl font-bold text-yellow-600">{summary.pendingMatches}</p>
          <p className="text-gray-600 mt-2">Pending Matches</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center">
          <p className="text-4xl font-bold text-green-600">{summary.successfulMatches}</p>
          <p className="text-gray-600 mt-2">Successful Matches</p>
        </div>
      </div>

      {/* Recent Donations Table */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Recent Donations</h3>
        {recentDonations.length === 0 ? (
          <p className="text-gray-600 text-center">No recent donations to display.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-left text-gray-600">Date</th>
                  <th className="py-2 px-4 border-b text-left text-gray-600">Food Type</th>
                  <th className="py-2 px-4 border-b text-left text-gray-600">Quantity</th>
                  <th className="py-2 px-4 border-b text-left text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentDonations.map((donation) => (
                  <tr key={donation._id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b text-gray-700">{new Date(donation.createdAt).toLocaleDateString()}</td>
                    <td className="py-2 px-4 border-b text-gray-700">{donation.foodType}</td>
                    <td className="py-2 px-4 border-b text-gray-700">{`${donation.quantity} ${donation.unit}`}</td>
                    <td className="py-2 px-4 border-b text-gray-700">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(donation.status)}`}>
                        {donation.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorDashboardOverview;
