import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft } from 'react-icons/fa';

const DonorSignup = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nicNumber, setNicNumber] = useState('');
  const [nicPhoto, setNicPhoto] = useState(null);
  const [nicPhotoPreview, setNicPhotoPreview] = useState('');
  const [address, setAddress] = useState(''); // Added address state
  const [phoneNumber, setPhoneNumber] = useState(''); // Added phone number state
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Go back to the previous page
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNicPhoto(file);
      setNicPhotoPreview(URL.createObjectURL(file));
    } else {
      setNicPhoto(null);
      setNicPhotoPreview('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('nicNumber', nicNumber);
    formData.append('address', address); // Appended address to form data
    formData.append('phoneNumber', phoneNumber); // Appended phone number to form data
    if (nicPhoto) {
      formData.append('nicPhoto', nicPhoto);
    }

    try {
      const response = await axios.post('http://localhost:5000/api/donor-signup', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(response.data.message);
      if (response.data.success) {
        // Simulate email sending
        console.log(`Sending approval email to ${email}`);
        setMessage('Thank you for signing up! Your account will be reviewed by our admin team. You will receive an email once approved.');
        // Optionally redirect after a delay or show a success message
        // navigate('/donor-login');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-lightBackground">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md mt-16">
        <Link to="/" className="absolute top-4 left-4 text-primaryGreen hover:text-green-700">
          <FaArrowLeft className="h-6 w-6" />
        </Link>
        <h2 className="text-3xl font-bold text-primaryGreen text-center mb-6">Donor Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="full-name">
              Full Name
            </label>
            <input
              type="text"
              id="full-name"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primaryGreen"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primaryGreen"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primaryGreen"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primaryGreen"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nicNumber">
              NIC Number
            </label>
            <input
              type="text"
              id="nicNumber"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primaryGreen"
              placeholder="NIC Number"
              value={nicNumber}
              onChange={(e) => setNicNumber(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
              Address
            </label>
            <input
              type="text"
              id="address"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primaryGreen"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phoneNumber">
              Phone Number
            </label>
            <input
              type="text"
              id="phoneNumber"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primaryGreen"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nicPhoto">
              NIC Photo Upload (JPG, PNG)
            </label>
            <input
              type="file"
              id="nicPhoto"
              accept=".jpg,.png"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primaryGreen"
              onChange={handleFileChange}
              required
            />
            {nicPhotoPreview && (
              <div className="mt-4">
                <img src={nicPhotoPreview} alt="NIC Preview" className="max-w-full h-auto rounded-md shadow-md" />
              </div>
            )}
          </div>
          {message && <p className="text-center text-red-500 text-sm">{message}</p>}
          <button
            type="submit"
            className="bg-primaryGreen hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline"
          >
            Apply for Account
          </button>
        </form>
        <p className="text-center text-gray-600 text-sm mt-4">
          Already have an account? <Link to="/donor-login" className="text-primaryGreen hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default DonorSignup;
