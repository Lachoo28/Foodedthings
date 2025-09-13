import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
  const [homeData, setHomeData] = useState({
    homeName: '',
    capacity: '',
    address: '',
    contactPerson: '',
    phoneNumber: '',
    profilePhoto: '', // Add profilePhoto field
    specialNeeds: '', // Add specialNeeds field
  });
  const [selectedFile, setSelectedFile] = useState(null); // State for the selected file
  const [loading, setLoading] = useState(true);
  const [profileUpdateLoading, setProfileUpdateLoading] = useState(false);
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [passwordChange, setPasswordChange] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [message, setMessage] = useState(''); // For general messages (success/error)

  const homeId = localStorage.getItem('homeId');

  useEffect(() => {
    const fetchHomeProfile = async () => {
      setLoading(true);
      setError(null);
      if (!homeId) {
        setError('Home ID not found. Please log in again.');
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`http://localhost:5000/api/home/profile/${homeId}`);
        setHomeData(response.data);
      } catch (err) {
        setError('Failed to fetch home profile.');
        console.error('Error fetching home profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeProfile();
  }, [homeId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setHomeData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordChange(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage('');
    setProfileUpdateLoading(true);
    console.log('Attempting to update profile for homeId:', homeId);
    
    const formData = new FormData();
    for (const key in homeData) {
      if (homeData[key] !== '' && homeData[key] !== null && homeData[key] !== undefined && key !== 'profilePhoto' && key !== 'uniqueId') { // Exclude uniqueId from formData
        formData.append(key, homeData[key]);
      }
    }
    if (selectedFile) {
      formData.append('profilePhoto', selectedFile);
    }

    console.log('Sending formData:', formData);

    try {
      if (!homeId) {
        setMessage('Home ID not found. Please log in again.');
        setProfileUpdateLoading(false);
        return;
      }
      const response = await axios.put(`http://localhost:5000/api/home/profile/${homeId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setIsEditing(false);
      setMessage(response.data.message);
      // Update homeData with the new profile photo URL if available in the response
      if (response.data.profilePhoto) {
        setHomeData(prevData => ({ ...prevData, profilePhoto: response.data.profilePhoto }));
      }
      setSelectedFile(null); // Clear selected file after successful upload
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update profile.');
      console.error('Error updating profile:', err);
    } finally {
      setProfileUpdateLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setPasswordChangeLoading(true);
    if (passwordChange.newPassword !== passwordChange.confirmNewPassword) {
      setMessage('New password and confirm new password do not match.');
      setPasswordChangeLoading(false);
      return;
    }

    try {
      if (!homeId) {
        setMessage('Home ID not found. Please log in again.');
        setPasswordChangeLoading(false);
        return;
      }
      const response = await axios.post(`http://localhost:5000/api/home/profile/${homeId}/change-password`, {
        currentPassword: passwordChange.currentPassword,
        newPassword: passwordChange.newPassword,
      });
      setMessage(response.data.message);
      setPasswordChange({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to change password.');
      console.error('Error changing password:', err);
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading profile...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h2>

      {message && (
        <p className={`text-center text-sm mb-4 ${message.includes('success') ? 'text-green-500' : 'text-red-500'}`}>
          {message}
        </p>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Home Information</h3>
        <form onSubmit={handleUpdateProfile}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Profile Photo Display */}
            <div className="md:col-span-2 flex flex-col items-center mb-4">
              {homeData.profilePhoto && (
                <img
                  src={`http://localhost:5000/${homeData.profilePhoto}`} // Assuming backend serves static files from /uploads
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover mb-4 border-2 border-gray-300"
                />
              )}
              <label htmlFor="profilePhoto" className="block text-gray-700 text-sm font-bold mb-2">Profile Photo:</label>
              <input
                type="file"
                id="profilePhoto"
                name="profilePhoto"
                onChange={handleFileChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div>
              <label htmlFor="homeName" className="block text-gray-700 text-sm font-bold mb-2">Home Name:</label>
              <input
                type="text"
                id="homeName"
                name="homeName"
                value={homeData.homeName}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div>
              <label htmlFor="capacity" className="block text-gray-700 text-sm font-bold mb-2">Capacity:</label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                value={homeData.capacity}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-gray-700 text-sm font-bold mb-2">Address:</label>
              <input
                type="text"
                id="address"
                name="address"
                value={homeData.address}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div>
              <label htmlFor="contactPerson" className="block text-gray-700 text-sm font-bold mb-2">Contact Person:</label>
              <input
                type="text"
                id="contactPerson"
                name="contactPerson"
                value={homeData.contactPerson}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-bold mb-2">Phone Number:</label>
              <input
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                value={homeData.phoneNumber}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div>
              <label htmlFor="uniqueId" className="block text-gray-700 text-sm font-bold mb-2">Unique ID:</label>
              <input
                type="text"
                id="uniqueId"
                name="uniqueId"
                value={homeId} // Display the homeId from localStorage as the unique ID
                disabled={true} 
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight bg-gray-200 cursor-not-allowed"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="specialNeeds" className="block text-gray-700 text-sm font-bold mb-2">Specific Needs:</label>
              <textarea
                id="specialNeeds"
                name="specialNeeds"
                value={homeData.specialNeeds}
                onChange={handleChange}
                rows="4"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="e.g., Dietary restrictions, medical conditions, educational support needed..."
              ></textarea>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-primaryGreen hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={profileUpdateLoading}
            >
              {profileUpdateLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Change Password</h3>
        <form onSubmit={handleChangePassword}>
          <div className="mb-4">
            <label htmlFor="currentPassword" className="block text-gray-700 text-sm font-bold mb-2">Current Password:</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={passwordChange.currentPassword}
              onChange={handlePasswordChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="newPassword" className="block text-gray-700 text-sm font-bold mb-2">New Password:</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={passwordChange.newPassword}
              onChange={handlePasswordChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="confirmNewPassword" className="block text-gray-700 text-sm font-bold mb-2">Confirm New Password:</label>
            <input
              type="password"
              id="confirmNewPassword"
              name="confirmNewPassword"
              value={passwordChange.confirmNewPassword}
              onChange={handlePasswordChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-primaryGreen hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={passwordChangeLoading}
            >
              {passwordChangeLoading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
