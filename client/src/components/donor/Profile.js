import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
  const [donorData, setDonorData] = useState({
    fullName: '',
    email: '',
    nicNumber: '',
    phoneNumber: '', // Added phone number
    address: '', // Added address
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [profileUpdateLoading, setProfileUpdateLoading] = useState(false);
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [error, setError] = useState(null);

  const donorId = localStorage.getItem('donorId');

  useEffect(() => {
    const fetchDonorProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`http://localhost:5000/api/donors/${donorId}`);
        setDonorData({
          fullName: response.data.fullName,
          email: response.data.email,
          nicNumber: response.data.nicNumber,
          phoneNumber: response.data.phoneNumber, // Fetch phone number
          address: response.data.address, // Fetch address
        });
      } catch (err) {
        console.error('Error fetching donor profile:', err);
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDonorProfile();
  }, [donorId]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setDonorData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setProfileUpdateLoading(true);
    try {
      const response = await axios.put(`http://localhost:5000/api/donors/profile/${donorId}`, donorData);
      setMessage(response.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update profile.');
      console.error('Profile update error:', err);
    } finally {
      setProfileUpdateLoading(false);
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setPasswordChangeLoading(true);

    if (newPassword !== confirmNewPassword) {
      setMessage('New passwords do not match.');
      setPasswordChangeLoading(false);
      return;
    }

    try {
      const response = await axios.put(`http://localhost:5000/api/donors/change-password/${donorId}`, {
        currentPassword,
        newPassword,
      });
      setMessage(response.data.message);
      // Clear password fields on success
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to change password.');
      console.error('Password change error:', err);
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Loading profile...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h2>

      {message && (
        <p className={`text-center text-sm mb-4 ${message.includes('success') ? 'text-green-500' : 'text-red-500'}`}>
          {message}
        </p>
      )}

      {/* Profile Details */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Donor Details</h3>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-gray-700 text-sm font-bold mb-2">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primaryGreen"
              value={donorData.fullName}
              onChange={handleProfileChange}
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primaryGreen"
              value={donorData.email}
              onChange={handleProfileChange}
              required
            />
          </div>
          <div>
            <label htmlFor="nicNumber" className="block text-gray-700 text-sm font-bold mb-2">NIC Number</label>
            <input
              type="text"
              id="nicNumber"
              name="nicNumber"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primaryGreen"
              value={donorData.nicNumber}
              onChange={handleProfileChange}
              required
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-gray-700 text-sm font-bold mb-2">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primaryGreen"
              value={donorData.address}
              onChange={handleProfileChange}
              required
            />
          </div>
          <div>
            <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-bold mb-2">Phone Number</label>
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primaryGreen"
              value={donorData.phoneNumber}
              onChange={handleProfileChange}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-primaryGreen hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline"
            disabled={profileUpdateLoading}
          >
            {profileUpdateLoading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Change Password</h3>
        <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-gray-700 text-sm font-bold mb-2">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primaryGreen"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-gray-700 text-sm font-bold mb-2">New Password</label>
            <input
              type="password"
              id="newPassword"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primaryGreen"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="confirmNewPassword" className="block text-gray-700 text-sm font-bold mb-2">Confirm New Password</label>
            <input
              type="password"
              id="confirmNewPassword"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primaryGreen"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-primaryGreen hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline"
            disabled={passwordChangeLoading}
          >
            {passwordChangeLoading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
