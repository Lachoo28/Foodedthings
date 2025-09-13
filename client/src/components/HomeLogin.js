import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const HomeLogin = () => {
  const [homeName, setHomeName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages

    try {
      const response = await axios.post('http://localhost:5000/api/home-login', {
        homeName,
        password,
      });
      setMessage(response.data.message);
      if (response.data.success) {
        // Store homeId and homeName in localStorage
        localStorage.setItem('homeId', response.data.home.id);
        localStorage.setItem('homeName', response.data.home.homeName);
        // Redirect to Home Dashboard or appropriate page upon successful login
        navigate('/home-dashboard'); // Assuming a home dashboard route
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-lightBackground">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md mt-16">
        <h2 className="text-3xl font-bold text-primaryGreen text-center mb-6">Home Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="home-name">
              Home Name
            </label>
            <input
              type="text"
              id="home-name"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primaryOrange"
              placeholder="Home Name"
              value={homeName}
              onChange={(e) => setHomeName(e.target.value)}
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
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primaryOrange"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-primaryOrange hover:text-orange-500">
                Forgot your password?
              </Link>
            </div>
          </div>
          {message && <p className="text-center text-red-500 text-sm">{message}</p>}
          <button
            type="submit"
            className="bg-primaryGreen hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline"
          >
            Login
          </button>
        </form>
        <p className="text-center text-gray-600 text-sm mt-4">
          Don’t have an account? <Link to="/home-signup" className="text-primaryGreen hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default HomeLogin;
