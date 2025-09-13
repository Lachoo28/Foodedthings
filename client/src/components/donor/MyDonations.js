import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye, FaPencilAlt } from 'react-icons/fa'; // Importing icons

const MyDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('food'); // 'food' or 'non-food'

  const donorId = localStorage.getItem('donorId');

  const fetchDonations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:5000/api/donations/donor/${donorId}`);
      setDonations(response.data);
    } catch (err) {
      console.error('Error fetching donations:', err);
      setError('Failed to fetch donations.');
      setDonations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [donorId]);

  const foodDonations = donations.filter(d => d.donationType === 'food');
  const nonFoodDonations = donations.filter(d => d.donationType !== 'food');

  const displayedDonations = activeTab === 'food' ? foodDonations : nonFoodDonations;

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

  const handleViewDetails = (donation) => {
    setSelectedDonation(donation);
    setIsModalOpen(true);
  };

  const handleEdit = (donation) => {
    // Implement edit logic, e.g., navigate to a pre-filled edit form
    alert(`Edit functionality for donation ID: ${donation._id}`);
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Loading donations...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">My Donations</h2>

      <div className="mb-4 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" id="myTab" data-tabs-toggle="#myTabContent" role="tablist">
          <li className="mr-2" role="presentation">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'food' ? 'text-primaryGreen border-primaryGreen' : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}
              onClick={() => setActiveTab('food')}
              type="button"
              role="tab"
              aria-controls="food-donations"
              aria-selected={activeTab === 'food'}
            >
              Food Donations
            </button>
          </li>
          <li className="mr-2" role="presentation">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'non-food' ? 'text-primaryGreen border-primaryGreen' : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}
              onClick={() => setActiveTab('non-food')}
              type="button"
              role="tab"
              aria-controls="non-food-donations"
              aria-selected={activeTab === 'non-food'}
            >
              Non-Food Donations
            </button>
          </li>
        </ul>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        {displayedDonations.length === 0 ? (
          <p className="text-gray-600 text-center">No {activeTab === 'food' ? 'food' : 'non-food'} donations to display.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  {activeTab === 'food' ? (
                    <>
                      <th className="py-2 px-4 border-b text-left text-gray-600">Food Type</th>
                      <th className="py-2 px-4 border-b text-left text-gray-600">Quantity</th>
                    </>
                  ) : (
                    <th className="py-2 px-4 border-b text-left text-gray-600">Donation Type</th>
                  )}
                  <th className="py-2 px-4 border-b text-left text-gray-600">Date</th>
                  <th className="py-2 px-4 border-b text-left text-gray-600">Status</th>
                  <th className="py-2 px-4 border-b text-left text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedDonations.map((donation) => (
                  <tr key={donation._id} className="hover:bg-gray-50">
                    {activeTab === 'food' ? (
                      <>
                        <td className="py-2 px-4 border-b text-gray-700">{donation.foodType}</td>
                        <td className="py-2 px-4 border-b text-gray-700">{`${donation.quantity} ${donation.unit}`}</td>
                      </>
                    ) : (
                      <td className="py-2 px-4 border-b text-gray-700">{donation.donationType}</td>
                    )}
                    <td className="py-2 px-4 border-b text-gray-700">{new Date(donation.createdAt).toLocaleDateString()}</td>
                    <td className="py-2 px-4 border-b text-gray-700">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(donation.status)}`}>
                        {donation.status}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b text-gray-700">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleViewDetails(donation)} className="text-blue-500 hover:text-blue-700" title="View Details">
                          <FaEye className="h-5 w-5" />
                        </button>
                        {donation.status === 'pending' && (
                          <button onClick={() => handleEdit(donation)} className="text-primaryGreen hover:text-green-700" title="Edit Donation">
                            <FaPencilAlt className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Donation Details */}
      {isModalOpen && selectedDonation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-3xl w-full flex flex-col">
            <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 pr-4">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Donation Details</h3>
              <p><strong>Donation Type:</strong> {selectedDonation.donationType}</p>
              {selectedDonation.donationType === 'food' && (
                <>
                  <p><strong>Food Type:</strong> {selectedDonation.foodType}</p>
                  <p><strong>Quantity:</strong> {`${selectedDonation.quantity} ${selectedDonation.unit}`}</p>
                  <p><strong>Expiry Date/Time:</strong> {new Date(selectedDonation.expiryDateTime).toLocaleString()}</p>
                </>
              )}
              <p><strong>Delivery Method:</strong> {selectedDonation.deliveryMethod}</p>
              <p><strong>Preferred Date/Time:</strong> {new Date(selectedDonation.preferredDeliveryDateTime).toLocaleString()}</p>
              <p><strong>Status:</strong> <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(selectedDonation.status)}`}>{selectedDonation.status}</span></p>
              {selectedDonation.status === 'rejected' && selectedDonation.rejectionReason && (
                <p className="mt-4 text-red-600"><strong>Rejection Reason:</strong> {selectedDonation.rejectionReason}</p>
              )}
              {selectedDonation.status === 'matched' && (
                <div className="mt-4">
                  <p className="font-semibold">Matched Home: {selectedDonation.matchedHomeId}</p> {/* This should display home name, not ID */}
                  {/* Add button to select home if multiple matches are provided by admin */}
                </div>
              )}
            </div>
            <div className="md:w-1/2 pl-4 mt-4 md:mt-0">
              {selectedDonation.foodImagePath && (
                <>
                  <h4 className="font-semibold mb-2">Donation Image:</h4>
                  <img src={`http://localhost:5000/${selectedDonation.foodImagePath.replace(/\\/g, '/')}`} alt="Donation Item" className="w-full h-auto rounded-md object-cover" />
                </>
              )}
            </div>
            </div>
            <div className="mt-6 flex justify-end w-full">
              <button onClick={() => setIsModalOpen(false)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDonations;
