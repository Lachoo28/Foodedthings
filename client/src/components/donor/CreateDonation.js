import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateDonation = () => {
  const [donationType, setDonationType] = useState(''); // New state for donation type
  const [foodType, setFoodType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('persons'); // Default unit
  const [foodImage, setFoodImage] = useState(null); // Changed to foodImage
  const [foodImagePreview, setFoodImagePreview] = useState(''); // Changed to foodImagePreview
  const [expiryDateTime, setExpiryDateTime] = useState(''); // New state for expiry date and time
  const [deliveryMethod, setDeliveryMethod] = useState('');
  const [preferredDeliveryDateTime, setPreferredDeliveryDateTime] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const donorId = localStorage.getItem('donorId');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFoodImage(file); // Changed to setFoodImage
      setFoodImagePreview(URL.createObjectURL(file)); // Changed to setFoodImagePreview
    } else {
      setFoodImage(null); // Changed to setFoodImage
      setFoodImagePreview(''); // Changed to setFoodImagePreview
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    const formData = new FormData();
    formData.append('donorId', donorId);
    formData.append('donationType', donationType); // Include donationType

    if (donationType === 'food') {
      formData.append('foodType', foodType);
      formData.append('quantity', quantity);
      formData.append('unit', unit);
      formData.append('expiryDateTime', expiryDateTime); // Include expiryDateTime
    }
    
    formData.append('deliveryMethod', deliveryMethod);
    formData.append('preferredDeliveryDateTime', preferredDeliveryDateTime);
    if (foodImage) { // Changed to foodImage
      formData.append('foodImage', foodImage); // Changed to foodImage
    }

    try {
      const response = await axios.post('http://localhost:5000/api/donations', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(response.data.message);
      if (response.data.success) {
        // Clear form fields after successful submission
        setDonationType(''); // Clear donation type
        setFoodType('');
        setQuantity('');
        setUnit('kg');
        setFoodImage(null); // Clear food image
        setFoodImagePreview(''); // Clear food image preview
        setDeliveryMethod('');
        setPreferredDeliveryDateTime('');
        // Optionally redirect or show a success state
        // navigate('/donor-dashboard/my-donations');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Donation submission failed.');
      console.error('Donation submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Create a New Donation</h2>

      <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Donation Type Selection */}
          <div>
            <label htmlFor="donationType" className="block text-gray-700 text-sm font-bold mb-2">Donation Type</label>
            <select
              id="donationType"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primaryGreen"
              value={donationType}
              onChange={(e) => {
                setDonationType(e.target.value);
                // Reset food-specific fields if donation type changes from food
                if (e.target.value !== 'food') {
                  setFoodType('');
                  setQuantity('');
                  setUnit('persons');
                  setExpiryDateTime(''); // Clear expiry date if donation type changes from food
                }
              }}
              required
            >
              <option value="">Select Donation Type</option>
              <option value="food">Food</option>
              <option value="clothes">Clothes</option>
              <option value="books">Books</option>
            </select>
          </div>

          {donationType === 'food' && (
            <>
              <div>
                <label htmlFor="foodType" className="block text-gray-700 text-sm font-bold mb-2">Food Type</label>
                <select
                  id="foodType"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primaryGreen"
                  value={foodType}
                  onChange={(e) => setFoodType(e.target.value)}
                  required={donationType === 'food'}
                >
                  <option value="">Select Food Type</option>
                  <option value="Rice">Rice</option>
                  <option value="Bread">Bread</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Cooked Meals">Cooked Meals</option>
                  <option value="Canned Goods">Canned Goods</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Meat">Meat</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="quantity" className="block text-gray-700 text-sm font-bold mb-2">Quantity</label>
                <div className="flex">
                  <input
                    type="number"
                    id="quantity"
                    className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primaryGreen"
                    placeholder="Quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="1"
                    required={donationType === 'food'}
                  />
                  <select
                    id="unit"
                    className="shadow appearance-none border border-l-0 rounded-r py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primaryGreen"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    required={donationType === 'food'}
                  >
                    <option value="persons">persons</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="expiryDateTime" className="block text-gray-700 text-sm font-bold mb-2">Expiry Date & Time</label>
                <input
                  type="datetime-local"
                  id="expiryDateTime"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primaryGreen"
                  value={expiryDateTime}
                  onChange={(e) => setExpiryDateTime(e.target.value)}
                  required={donationType === 'food'}
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="foodImage" className="block text-gray-700 text-sm font-bold mb-2">Upload Food Image (JPG, PNG)</label> {/* Changed label */}
            <input
              type="file"
              id="foodImage" // Changed id
              accept=".jpg,.png"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primaryGreen"
              onChange={handleFileChange}
            />
            {foodImagePreview && ( // Changed from foodImagePreview
              <div className="mt-4">
                <img src={foodImagePreview} alt="Food Preview" className="max-w-full h-auto rounded-md shadow-md" /> {/* Changed alt */}
              </div>
            )}
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Delivery Method</label>
            <div className="mt-2">
              <label className="inline-flex items-center mr-6">
                <input
                  type="radio"
                  className="form-radio text-primaryGreen"
                  name="deliveryMethod"
                  value="Donor Delivery"
                  checked={deliveryMethod === 'Donor Delivery'}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                  required
                />
                <span className="ml-2 text-gray-700">Donor Delivery</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-primaryGreen"
                  name="deliveryMethod"
                  value="Home Pickup"
                  checked={deliveryMethod === 'Home Pickup'}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                  required
                />
                <span className="ml-2 text-gray-700">Home Pickup</span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="preferredDeliveryDateTime" className="block text-gray-700 text-sm font-bold mb-2">Preferred Delivery Date & Time</label>
            <input
              type="datetime-local"
              id="preferredDeliveryDateTime"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primaryGreen"
              value={preferredDeliveryDateTime}
              onChange={(e) => setPreferredDeliveryDateTime(e.target.value)}
              required
            />
          </div>

          {message && (
            <p className={`text-center text-sm ${message.includes('success') ? 'text-green-500' : 'text-red-500'}`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            className="bg-primaryGreen hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? 'Submitting...' : (donationType === 'food' ? 'Submit for AI Matching' : 'Submit Donation')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateDonation;
