import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaChevronLeft, FaChevronRight, FaEye, FaCheck, FaTimes } from 'react-icons/fa'; // Importing icons

const Donations = () => {
  const [foodDonations, setFoodDonations] = useState([]);
  const [nonFoodDonations, setNonFoodDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('food'); // 'food' or 'non-food'

  // Pagination states for food donations
  const [currentFoodPage, setCurrentFoodPage] = useState(1);
  const [foodItemsPerPage] = useState(5);

  // Pagination states for non-food donations
  const [currentNonFoodPage, setCurrentNonFoodPage] = useState(1);
  const [nonFoodItemsPerPage] = useState(5);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);

  useEffect(() => {
    const fetchAllDonations = async () => {
      const homeId = localStorage.getItem('homeId');
      if (!homeId) {
        setError('Home ID not found. Please log in again.');
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`http://localhost:5000/api/home/donations?homeId=${homeId}`);
        const allDonations = response.data;

        setFoodDonations(allDonations.filter(d => d.foodType)); // Assuming foodType exists for food donations
        setNonFoodDonations(allDonations.filter(d => d.donationType)); // Assuming donationType exists for non-food donations
      } catch (err) {
        setError('Failed to fetch donations.');
        console.error('Error fetching donations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllDonations();
  }, []);

  // Pagination logic for food donations
  const totalFoodPages = Math.ceil(foodDonations.length / foodItemsPerPage);
  const indexOfLastFoodItem = currentFoodPage * foodItemsPerPage;
  const indexOfFirstFoodItem = indexOfLastFoodItem - foodItemsPerPage;
  const currentFoodDonationsPaginated = foodDonations.slice(indexOfFirstFoodItem, indexOfLastFoodItem);

  const paginateFood = (pageNumber) => setCurrentFoodPage(pageNumber);

  // Pagination logic for non-food donations
  const totalNonFoodPages = Math.ceil(nonFoodDonations.length / nonFoodItemsPerPage);
  const indexOfLastNonFoodItem = currentNonFoodPage * nonFoodItemsPerPage;
  const indexOfFirstNonFoodItem = indexOfLastNonFoodItem - nonFoodItemsPerPage;
  const currentNonFoodDonationsPaginated = nonFoodDonations.slice(indexOfFirstNonFoodItem, indexOfLastNonFoodItem);

  const paginateNonFood = (pageNumber) => setCurrentNonFoodPage(pageNumber);

  const handleViewDetails = (donation) => {
    setSelectedDonation(donation);
    setIsModalOpen(true);
  };

  const handleAccept = async (donationId) => {
    try {
      await axios.post(`http://localhost:5000/api/home/donations/${donationId}/accept`);
      alert('Donation accepted! Notification sent to donor.');
      // Re-fetch all donations to update the lists
      const homeId = localStorage.getItem('homeId');
      const response = await axios.get(`http://localhost:5000/api/home/donations?homeId=${homeId}`);
      const allDonations = response.data;
      setFoodDonations(allDonations.filter(d => d.foodType));
      setNonFoodDonations(allDonations.filter(d => d.donationType));
      setIsModalOpen(false); // Close modal after action
    } catch (err) {
      setError('Failed to accept donation.');
      console.error('Error accepting donation:', err);
    }
  };

  const handleReject = async (donationId) => {
    const reason = prompt('Please provide a reason for rejecting this donation (optional):');
    try {
      await axios.post(`http://localhost:5000/api/home/donations/${donationId}/reject`, { reason });
      alert('Donation rejected.');
      // Re-fetch all donations to update the lists
      const homeId = localStorage.getItem('homeId');
      const response = await axios.get(`http://localhost:5000/api/home/donations?homeId=${homeId}`);
      const allDonations = response.data;
      setFoodDonations(allDonations.filter(d => d.foodType));
      setNonFoodDonations(allDonations.filter(d => d.donationType));
      setIsModalOpen(false); // Close modal after action
    } catch (err) {
      setError('Failed to reject donation.');
      console.error('Error rejecting donation:', err);
    }
  };

  if (loading) return <div className="text-center py-8">Loading donations...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Donations</h2>

      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          <button
            className={`py-2 px-4 text-lg font-medium ${activeTab === 'food' ? 'border-b-2 border-primaryGreen text-primaryGreen' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('food')}
          >
            Food Donations
          </button>
          <button
            className={`py-2 px-4 text-lg font-medium ${activeTab === 'non-food' ? 'border-b-2 border-primaryGreen text-primaryGreen' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('non-food')}
          >
            Non-Food Donations
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="overflow-x-auto">
          {activeTab === 'food' && (
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Donor Name
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Food Type
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Delivery Method
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Delivery Date
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentFoodDonationsPaginated.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                      No food donations found.
                    </td>
                  </tr>
                ) : (
                  currentFoodDonationsPaginated.map((donation) => (
                    <tr key={donation._id}>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        {donation.donorId ? donation.donorId.fullName : 'N/A'}
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        {donation.foodType}
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        {donation.quantity}
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        {donation.deliveryMethod}
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        {new Date(donation.preferredDeliveryDateTime).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                          donation.status === 'completed' ? 'text-green-900' :
                          donation.status === 'wait for home approval' ? 'text-orange-900' :
                          'text-red-900'
                        }`}>
                          <span aria-hidden="true" className={`absolute inset-0 opacity-50 rounded-full ${
                            donation.status === 'completed' ? 'bg-green-200' :
                            donation.status === 'wait for home approval' ? 'bg-orange-200' :
                            'bg-red-200'
                          }`}></span>
                          <span className="relative">
                            {donation.status === 'wait for home approval' ? 'Pending Approval' :
                             donation.status === 'completed' ? 'Accepted' :
                             donation.status === 'rejected' ? 'Rejected' :
                             donation.status}
                          </span>
                        </span>
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(donation)}
                            className="text-blue-500 hover:text-blue-700"
                            title="View Details"
                          >
                            <FaEye className="h-5 w-5" />
                          </button>
                          {donation.status === 'wait for home approval' && (
                            <>
                              <button
                                onClick={() => handleAccept(donation._id)}
                                className="text-green-500 hover:text-green-700"
                                title="Accept"
                              >
                                <FaCheck className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleReject(donation._id)}
                                className="text-red-500 hover:text-red-700"
                                title="Reject"
                              >
                                <FaTimes className="h-5 w-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'non-food' && (
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Donor Name
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Donation Type
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Delivery Method
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Delivery Date
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentNonFoodDonationsPaginated.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                      No non-food donations found.
                    </td>
                  </tr>
                ) : (
                  currentNonFoodDonationsPaginated.map((donation) => (
                    <tr key={donation._id}>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        {donation.donorId ? donation.donorId.fullName : 'N/A'}
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        {donation.donationType}
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        {donation.deliveryMethod}
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        {new Date(donation.preferredDeliveryDateTime).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                          donation.status === 'completed' ? 'text-green-900' :
                          donation.status === 'wait for home approval' ? 'text-orange-900' :
                          'text-red-900'
                        }`}>
                          <span aria-hidden="true" className={`absolute inset-0 opacity-50 rounded-full ${
                            donation.status === 'completed' ? 'bg-green-200' :
                            donation.status === 'wait for home approval' ? 'bg-orange-200' :
                            'bg-red-200'
                          }`}></span>
                          <span className="relative">
                            {donation.status === 'wait for home approval' ? 'Pending Approval' :
                             donation.status === 'completed' ? 'Accepted' :
                             donation.status === 'rejected' ? 'Rejected' :
                             donation.status}
                          </span>
                        </span>
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(donation)}
                            className="text-blue-500 hover:text-blue-700"
                            title="View Details"
                          >
                            <FaEye className="h-5 w-5" />
                          </button>
                          {donation.status === 'wait for home approval' && (
                            <>
                              <button
                                onClick={() => handleAccept(donation._id)}
                                className="text-green-500 hover:text-green-700"
                                title="Accept"
                              >
                                <FaCheck className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleReject(donation._id)}
                                className="text-red-500 hover:text-red-700"
                                title="Reject"
                              >
                                <FaTimes className="h-5 w-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {activeTab === 'food' && foodDonations.length > foodItemsPerPage && (
          <div className="flex justify-end mt-4">
            <button
              onClick={() => paginateFood(currentFoodPage - 1)}
              disabled={currentFoodPage === 1}
              className="px-3 py-1 mx-1 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50 flex items-center"
            >
              <FaChevronLeft className="mr-1" /> Prev
            </button>
            <button
              onClick={() => paginateFood(currentFoodPage + 1)}
              disabled={currentFoodPage === totalFoodPages}
              className="px-3 py-1 mx-1 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50 flex items-center"
            >
              Next <FaChevronRight className="ml-1" />
            </button>
          </div>
        )}

        {activeTab === 'non-food' && nonFoodDonations.length > nonFoodItemsPerPage && (
          <div className="flex justify-end mt-4">
            <button
              onClick={() => paginateNonFood(currentNonFoodPage - 1)}
              disabled={currentNonFoodPage === 1}
              className="px-3 py-1 mx-1 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50 flex items-center"
            >
              <FaChevronLeft className="mr-1" /> Prev
            </button>
            <button
              onClick={() => paginateNonFood(currentNonFoodPage + 1)}
              disabled={currentNonFoodPage === totalNonFoodPages}
              className="px-3 py-1 mx-1 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50 flex items-center"
            >
              Next <FaChevronRight className="ml-1" />
            </button>
          </div>
        )}
      </div>

      {/* Donation Details Modal */}
      {isModalOpen && selectedDonation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Donation Details</h3>
            <p><strong>Donor Name:</strong> {selectedDonation.donorId ? selectedDonation.donorId.fullName : 'N/A'}</p>
            {selectedDonation.foodType && <p><strong>Food Type:</strong> {selectedDonation.foodType}</p>}
            {selectedDonation.quantity && <p><strong>Quantity:</strong> {selectedDonation.quantity}</p>}
            {selectedDonation.donationType && <p><strong>Donation Type:</strong> {selectedDonation.donationType}</p>}
            <p><strong>Description:</strong> {selectedDonation.description}</p>
            <p><strong>Pickup Location:</strong> {selectedDonation.pickupLocation}</p>
            <p><strong>Delivery Method:</strong> {selectedDonation.deliveryMethod}</p>
            <p><strong>Preferred Delivery Date/Time:</strong> {new Date(selectedDonation.preferredDeliveryDateTime).toLocaleString()}</p>
            <p><strong>Status:</strong> <span className="capitalize">{selectedDonation.status}</span></p>
            <div className="mt-6 flex justify-end space-x-4">
              <button onClick={() => setIsModalOpen(false)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400">Close</button>
              {selectedDonation.status === 'wait for home approval' && (
                <>
                  <button onClick={() => handleAccept(selectedDonation._id)} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">Accept</button>
                  <button onClick={() => handleReject(selectedDonation._id)} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">Reject</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Donations;
