import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaPlusCircle, FaListAlt, FaBell, FaUser, FaSignOutAlt, FaBars } from 'react-icons/fa';

const DonorDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Set to true to make sidebar visible by default
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear authentication tokens/session data
    localStorage.removeItem('donorId');
    localStorage.removeItem('donorName');
    navigate('/donor-login');
  };

  // Get donor name from localStorage
  const donorName = localStorage.getItem('donorName') || "Donor";

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out`}>
        <div className="flex items-center justify-between px-4">
          <Link to="/donor-dashboard/overview" className="text-2xl font-bold text-primaryGreen">FoodShare Donor</Link>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden text-white focus:outline-none">
            <FaBars className="h-6 w-6" />
          </button>
        </div>

        <nav>
          <Link to="/donor-dashboard/overview" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-primaryGreen flex items-center">
            <FaTachometerAlt className="mr-3" /> Dashboard Overview
          </Link>
          <Link to="/donor-dashboard/create-donation" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-primaryGreen flex items-center">
            <FaPlusCircle className="mr-3" /> Create Donation
          </Link>
          <Link to="/donor-dashboard/my-donations" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-primaryGreen flex items-center">
            <FaListAlt className="mr-3" /> My Donations
          </Link>
          <Link to="/donor-dashboard/notifications" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-primaryGreen flex items-center">
            <FaBell className="mr-3" /> Notifications
          </Link>
          <Link to="/donor-dashboard/profile" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-primaryGreen flex items-center">
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
          <h1 className="text-3xl font-semibold text-gray-800">Donor Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button className="flex items-center space-x-2 text-gray-600 hover:text-primaryGreen focus:outline-none">
                <img src="https://via.placeholder.com/30" alt="User Avatar" className="rounded-full" />
                <span>{donorName}</span>
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

export default DonorDashboard;
