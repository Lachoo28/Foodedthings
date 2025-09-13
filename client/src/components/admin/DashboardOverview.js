import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // Importing icons

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalDonors: 0,
    totalHomes: 0,
    approvedDonations: 0,
    pendingApprovals: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Number of items per page

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/stats');
        setStats({
          totalDonors: response.data.totalDonors,
          totalHomes: response.data.totalHomes,
          approvedDonations: response.data.approvedDonations,
          pendingApprovals: response.data.pendingApprovals,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    const fetchRecentActivity = async () => {
      try {
        // Fetching real data for recent activity
        const response = await axios.get('http://localhost:5000/api/admin/recent-activity'); // Assuming this endpoint exists
        setRecentActivity(response.data);
      } catch (error) {
        console.error('Error fetching recent activity:', error);
        // Fallback to mock data if API call fails
        setRecentActivity([
          { date: '2025-08-12', donorName: 'John Doe', donationType: 'Food', status: 'Approved' },
          { date: '2025-08-11', donorName: 'Jane Smith', donationType: 'Non-Food', status: 'Pending' },
          { date: '2025-08-11', donorName: 'Peter Jones', donationType: 'Food', status: 'Matched' },
          { date: '2025-08-10', donorName: 'Alice Brown', donationType: 'Non-Food', status: 'Completed' },
          { date: '2025-08-09', donorName: 'Bob White', donationType: 'Food', status: 'Approved' },
          { date: '2025-08-08', donorName: 'Charlie Green', donationType: 'Non-Food', status: 'Rejected' },
          { date: '2025-08-07', donorName: 'Diana Blue', donationType: 'Food', status: 'Pending' },
          { date: '2025-08-06', donorName: 'Eve Black', donationType: 'Non-Food', status: 'Matched' },
          { date: '2025-08-05', donorName: 'Frank Red', donationType: 'Food', status: 'Completed' },
          { date: '2025-08-04', donorName: 'Grace Yellow', donationType: 'Non-Food', status: 'Approved' },
        ]);
      }
    };

    fetchStats();
    fetchRecentActivity();
  }, []);

  // Calculate total pages
  const totalPages = Math.ceil(recentActivity.length / itemsPerPage);

  // Get current items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentActivity = recentActivity.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600">Total Donors</h3>
          <p className="text-4xl font-bold text-primaryGreen mt-2">{stats.totalDonors}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600">Total Homes</h3>
          <p className="text-4xl font-bold text-primaryGreen mt-2">{stats.totalHomes}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600">Approved Donations</h3>
          <p className="text-4xl font-bold text-primaryGreen mt-2">{stats.approvedDonations}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600">Pending Approvals</h3>
          <p className="text-4xl font-bold text-orange-500 mt-2">{stats.pendingApprovals}</p>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-left text-gray-600">Date</th>
                <th className="py-2 px-4 border-b text-left text-gray-600">Donor Name</th>
                <th className="py-2 px-4 border-b text-left text-gray-600">Donation Type</th>
                <th className="py-2 px-4 border-b text-left text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentActivity.map((activity, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b text-gray-700">{activity.date}</td>
                  <td className="py-2 px-4 border-b text-gray-700">{activity.donorName}</td>
                  <td className="py-2 px-4 border-b text-gray-700">{activity.donationType}</td>
                  <td className="py-2 px-4 border-b text-gray-700">{activity.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {recentActivity.length > itemsPerPage && (
          <div className="flex justify-end mt-4">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 mx-1 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50 flex items-center"
            >
              <FaChevronLeft className="mr-1" /> Prev
            </button>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 mx-1 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50 flex items-center"
            >
              Next <FaChevronRight className="ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardOverview;
