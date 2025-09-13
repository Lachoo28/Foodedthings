import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTachometerAlt, FaHandsHelping, FaCalendarAlt, FaBell, FaUser, FaSignOutAlt, FaBars, FaCommentAlt } from 'react-icons/fa';

const HomeDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Set to true to make sidebar visible by default
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const homeId = localStorage.getItem('homeId');

  useEffect(() => {
    const fetchHomeData = async () => {
      if (!homeId) {
        setError('Home ID not found in local storage.');
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`http://localhost:5000/api/homes/${homeId}`);
        setHomeData(response.data);
        localStorage.setItem('homeName', response.data.homeName); // Update homeName in localStorage
      } catch (err) {
        console.error('Error fetching home data:', err);
        setError('Failed to fetch home data.');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, [homeId]);

  const handleLogout = () => {
    // Clear authentication tokens/session data for home
    localStorage.removeItem('homeId');
    localStorage.removeItem('homeName');
    navigate('/home-login');
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-gray-600">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;
  }

  const homeName = homeData?.homeName || "Child Care Home";
  const homeProfilePhotoPath = homeData?.homeProfilePhotoPath;
  const avatarSrc = homeProfilePhotoPath ? `http://localhost:5000/${homeProfilePhotoPath.replace(/\\/g, '/')}` : "https://via.placeholder.com/30";

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out`}>
        <div className="flex items-center justify-between px-4">
          <Link to="/home-dashboard/overview" className="text-2xl font-bold text-primaryGreen">FoodShare Home</Link>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden text-white focus:outline-none">
            <FaBars className="h-6 w-6" />
          </button>
        </div>

        <nav>
          <Link to="/home-dashboard/overview" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-primaryGreen flex items-center">
            <FaTachometerAlt className="mr-3" /> Dashboard Overview
          </Link>
          <Link to="/home-dashboard/donations" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-primaryGreen flex items-center">
            <FaHandsHelping className="mr-3" /> Donations
          </Link>
          <Link to="/home-dashboard/upcoming-deliveries" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-primaryGreen flex items-center">
            <FaCalendarAlt className="mr-3" /> Upcoming Deliveries
          </Link>
          <Link to="/home-dashboard/notifications" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-primaryGreen flex items-center">
            <FaBell className="mr-3" /> Notifications
          </Link>
          <Link to="/home-dashboard/feedback" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-primaryGreen flex items-center">
            <FaCommentAlt className="mr-3" /> Feedback
          </Link>
          <Link to="/home-dashboard/profile" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-primaryGreen flex items-center">
            <FaUser className="mr-3" /> Profile
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
          <h1 className="text-3xl font-semibold text-gray-800">Child Care Home Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button className="flex items-center space-x-2 text-gray-600 hover:text-primaryGreen focus:outline-none">
                <img src={avatarSrc} alt="User Avatar" className="rounded-full h-8 w-8 object-cover" />
                <span>{homeName}</span>
              </button>
              {/* Dropdown menu for logout/settings - to be implemented */}
            </div>
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

export default HomeDashboard;
