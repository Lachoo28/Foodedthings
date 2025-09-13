import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaUserCheck, FaHome, FaRobot, FaTruck, FaComments, FaSignOutAlt, FaBars, FaBell, FaNewspaper } from 'react-icons/fa';
import axios from 'axios'; // Import axios

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pendingDonorsCount, setPendingDonorsCount] = useState(0); // State for pending donors count
  const [pendingHomesCount, setPendingHomesCount] = useState(0); // State for pending homes count
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const donorsResponse = await axios.get('http://localhost:5000/api/donors/pending');
        setPendingDonorsCount(donorsResponse.data.length);

        const homesResponse = await axios.get('http://localhost:5000/api/homes/pending'); // Assuming this endpoint exists
        setPendingHomesCount(homesResponse.data.length);
      } catch (error) {
        console.error('Error fetching pending counts:', error);
      }
    };

    fetchCounts();
    // Optionally, refetch every X seconds to keep the count updated
    const intervalId = setInterval(fetchCounts, 60000); // Refetch every minute
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  const handleLogout = () => {
    // Clear authentication tokens/session data
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out`}>
        <div className="flex items-center justify-between px-4">
          <Link to="/admin/dashboard" className="text-2xl font-bold text-primaryGreen">FoodShare Admin</Link>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden text-white focus:outline-none">
            <FaBars className="h-6 w-6" />
          </button>
        </div>

        <nav>
          <Link to="/admin/overview" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-primaryGreen flex items-center">
            <FaTachometerAlt className="mr-3" /> Dashboard Overview
          </Link>
          <Link to="/admin/approve-donors" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-primaryGreen flex items-center justify-between">
            <div className="flex items-center">
              <FaUserCheck className="mr-3" /> Approve Donors
            </div>
            {pendingDonorsCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-green-500 text-white text-xs font-semibold rounded-full">
                {pendingDonorsCount}
              </span>
            )}
          </Link>
          <Link to="/admin/approve-homes" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-primaryGreen flex items-center justify-between">
            <div className="flex items-center">
              <FaHome className="mr-3" /> Approve Homes
            </div>
            {pendingHomesCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-green-500 text-white text-xs font-semibold rounded-full">
                {pendingHomesCount}
              </span>
            )}
          </Link>
          <Link to="/admin/ai-matching" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-primaryGreen flex items-center">
            <FaRobot className="mr-3" /> AI Matching Panel
          </Link>
          <Link to="/admin/delivery-tracker" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-primaryGreen flex items-center">
            <FaTruck className="mr-3" /> Delivery Tracker
          </Link>
          <Link to="/admin/feedback-reports" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-primaryGreen flex items-center">
            <FaComments className="mr-3" /> Feedback Reports
          </Link>
          <Link to="/admin/add-news" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-primaryGreen flex items-center">
            <FaNewspaper className="mr-3" /> Add News
          </Link>
          <button onClick={handleLogout} className="block w-full text-left py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-red-500 flex items-center mt-auto">
            <FaSignOutAlt className="mr-3" /> Logout
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header for main content */}
        <header className="flex items-center justify-between bg-white p-6 border-b border-gray-200">
          <h1 className="text-3xl font-semibold text-gray-800">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-primaryGreen focus:outline-none">
              <FaBell className="h-6 w-6" />
            </button>
            {/* Potentially add user profile/dropdown here */}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Outlet /> {/* Renders nested routes */}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
