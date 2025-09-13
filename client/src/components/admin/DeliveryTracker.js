import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // Importing icons

const DeliveryTracker = () => {
  const [foodDeliveries, setFoodDeliveries] = useState([]);
  const [nonFoodDonations, setNonFoodDonations] = useState([]);
  const [loadingFood, setLoadingFood] = useState(true);
  const [loadingNonFood, setLoadingNonFood] = useState(true);
  const [errorFood, setErrorFood] = useState(null);
  const [errorNonFood, setErrorNonFood] = useState(null);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('food'); // 'food' or 'non-food'
  const [showSelectHomeModal, setShowSelectHomeModal] = useState(false);
  const [selectedDonationForMatch, setSelectedDonationForMatch] = useState(null);
  const [nearestHomes, setNearestHomes] = useState([]);
  const [loadingNearestHomes, setLoadingNearestHomes] = useState(false);
  const [errorNearestHomes, setErrorNearestHomes] = useState(null);

  // Pagination states for food deliveries
  const [currentFoodPage, setCurrentFoodPage] = useState(1);
  const [foodItemsPerPage] = useState(5);

  // Pagination states for non-food donations
  const [currentNonFoodPage, setCurrentNonFoodPage] = useState(1);
  const [nonFoodItemsPerPage] = useState(5);

  useEffect(() => {
    const fetchFoodDeliveries = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/food-deliveries');
        setFoodDeliveries(response.data);
      } catch (err) {
        console.error('Error fetching food deliveries:', err);
        setErrorFood('Failed to fetch food deliveries.');
      } finally {
        setLoadingFood(false);
      }
    };

    const fetchNonFoodDonations = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/non-food-donations/pending');
        setNonFoodDonations(response.data);
      } catch (err) {
        console.error('Error fetching non-food donations:', err);
        setErrorNonFood('Failed to fetch non-food donations.');
      } finally {
        setLoadingNonFood(false);
      }
    };

    fetchFoodDeliveries();
    fetchNonFoodDonations();
  }, []);

  // Pagination logic for food deliveries
  const totalFoodPages = Math.ceil(foodDeliveries.length / foodItemsPerPage);
  const indexOfLastFoodItem = currentFoodPage * foodItemsPerPage;
  const indexOfFirstFoodItem = indexOfLastFoodItem - foodItemsPerPage;
  const currentFoodDeliveries = foodDeliveries.slice(indexOfFirstFoodItem, indexOfLastFoodItem);

  const paginateFood = (pageNumber) => setCurrentFoodPage(pageNumber);

  // Pagination logic for non-food donations
  const totalNonFoodPages = Math.ceil(nonFoodDonations.length / nonFoodItemsPerPage);
  const indexOfLastNonFoodItem = currentNonFoodPage * nonFoodItemsPerPage;
  const indexOfFirstNonFoodItem = indexOfLastNonFoodItem - nonFoodItemsPerPage;
  const currentNonFoodDonations = nonFoodDonations.slice(indexOfFirstNonFoodItem, indexOfLastNonFoodItem);

  const paginateNonFood = (pageNumber) => setCurrentNonFoodPage(pageNumber);

  const handleMarkCompleted = async (id) => {
    setMessage(`Marking delivery ${id} as completed...`);
    try {
      await axios.put(`http://localhost:5000/api/donations/${id}/update-status`, { status: 'completed' });
      setFoodDeliveries(foodDeliveries.map(delivery =>
        delivery._id === id ? { ...delivery, status: 'completed' } : delivery
      ));
      setMessage(`Delivery ${id} marked as completed.`);
    } catch (error) {
      setMessage(`Failed to mark delivery ${id} as completed.`);
      console.error('Error marking delivery completed:', error);
    }
  };

  const fetchNearestHomes = async (donorId) => {
    setLoadingNearestHomes(true);
    setErrorNearestHomes(null);
    try {
      const response = await axios.get(`http://localhost:5000/api/admin/homes/nearest/${donorId}`);
      setNearestHomes(response.data);
    } catch (err) {
      console.error('Error fetching nearest homes:', err);
      setErrorNearestHomes('Failed to fetch nearest homes.');
    } finally {
      setLoadingNearestHomes(false);
    }
  };

  const handleApproveNonFoodDonationClick = (donation) => {
    setSelectedDonationForMatch(donation);
    fetchNearestHomes(donation.donorId._id);
    setShowSelectHomeModal(true);
  };

  const handleSelectHomeAndApprove = async (selectedHomeId) => {
    if (!selectedDonationForMatch) return;

    setMessage(`Approving non-food donation ${selectedDonationForMatch._id} and matching with home ${selectedHomeId}...`);
    try {
      await axios.put(`http://localhost:5000/api/admin/non-food-donations/approve/${selectedDonationForMatch._id}`, { matchedHomeId: selectedHomeId });
      setNonFoodDonations(nonFoodDonations.filter(donation => donation._id !== selectedDonationForMatch._id)); // Remove from pending list
      setMessage(`Non-food donation ${selectedDonationForMatch._id} approved and matched.`);
      setShowSelectHomeModal(false);
      setSelectedDonationForMatch(null);
      setNearestHomes([]);
    } catch (error) {
      setMessage(`Failed to approve non-food donation ${selectedDonationForMatch._id} and match.`);
      console.error('Error approving non-food donation with home:', error);
    }
  };

  const handleCloseSelectHomeModal = () => {
    setShowSelectHomeModal(false);
    setSelectedDonationForMatch(null);
    setNearestHomes([]);
    setErrorNearestHomes(null);
  };

  const handleRejectNonFoodDonation = async (id) => {
    const reason = prompt('Reason for rejection (optional):');
    setMessage(`Rejecting non-food donation ${id}...`);
    try {
      await axios.put(`http://localhost:5000/api/admin/non-food-donations/reject/${id}`, { reason });
      setNonFoodDonations(nonFoodDonations.filter(donation => donation._id !== id)); // Remove from pending list
      setMessage(`Non-food donation ${id} rejected.`);
    } catch (error) {
      setMessage(`Failed to reject non-food donation ${id}.`);
      console.error('Error rejecting non-food donation:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-200 text-green-800';
      case 'approved':
        return 'bg-blue-200 text-blue-800';
      case 'matched':
      case 'wait for home approval':
        return 'bg-yellow-200 text-yellow-800';
      case 'pending':
      case 'pending_admin_review':
        return 'bg-red-200 text-red-800';
      case 'rejected':
        return 'bg-gray-200 text-gray-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Delivery & Donation Tracker</h2>

      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          <button
            className={`py-2 px-4 text-lg font-medium ${activeTab === 'food' ? 'border-b-2 border-primaryGreen text-primaryGreen' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('food')}
          >
            Food Deliveries
          </button>
          <button
            className={`py-2 px-4 text-lg font-medium ${activeTab === 'non-food' ? 'border-b-2 border-primaryGreen text-primaryGreen' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('non-food')}
          >
            Non-Food Donations
          </button>
        </div>
      </div>

      {message && <p className="text-sm text-gray-600 mb-4">{message}</p>}

      {activeTab === 'food' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Food Deliveries</h3>
          {loadingFood ? (
            <p>Loading food deliveries...</p>
          ) : errorFood ? (
            <p className="text-red-500">{errorFood}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b text-left text-gray-600">Donation ID</th>
                    <th className="py-2 px-4 border-b text-left text-gray-600">Donor</th>
                    <th className="py-2 px-4 border-b text-left text-gray-600">Home</th>
                    <th className="py-2 px-4 border-b text-left text-gray-600">Food Type</th>
                    <th className="py-2 px-4 border-b text-left text-gray-600">Quantity</th>
                    <th className="py-2 px-4 border-b text-left text-gray-600">Delivery Method</th>
                    <th className="py-2 px-4 border-b text-left text-gray-600">Status</th>
                    <th className="py-2 px-4 border-b text-left text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentFoodDeliveries.length > 0 ? (
                    currentFoodDeliveries.map((delivery) => (
                      <tr key={delivery._id} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b text-gray-700">{delivery._id}</td>
                        <td className="py-2 px-4 border-b text-gray-700">{delivery.donorId ? delivery.donorId.fullName : 'N/A'}</td>
                        <td className="py-2 px-4 border-b text-gray-700">{delivery.matchedHomeId ? delivery.matchedHomeId.homeName : 'N/A'}</td>
                        <td className="py-2 px-4 border-b text-gray-700">{delivery.foodType}</td>
                        <td className="py-2 px-4 border-b text-gray-700">{delivery.quantity} {delivery.unit}</td>
                        <td className="py-2 px-4 border-b text-gray-700">{delivery.deliveryMethod}</td>
                        <td className="py-2 px-4 border-b text-gray-700">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(delivery.status)}`}>
                            {delivery.status}
                          </span>
                        </td>
                        <td className="py-2 px-4 border-b text-gray-700">
                          {delivery.status !== 'completed' && (
                            <button onClick={() => handleMarkCompleted(delivery._id)} className="bg-primaryGreen text-white px-3 py-1 rounded-md hover:bg-green-700">Mark Completed</button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="py-4 text-center text-gray-500">No food deliveries to track.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {foodDeliveries.length > foodItemsPerPage && (
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
        </div>
      )}

      {activeTab === 'non-food' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Pending Non-Food Donations</h3>
          {loadingNonFood ? (
            <p>Loading non-food donations...</p>
          ) : errorNonFood ? (
            <p className="text-red-500">{errorNonFood}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b text-left text-gray-600">Donation ID</th>
                    <th className="py-2 px-4 border-b text-left text-gray-600">Donor</th>
                    <th className="py-2 px-4 border-b text-left text-gray-600">Donation Type</th>
                    <th className="py-2 px-4 border-b text-left text-gray-600">Delivery Method</th>
                    <th className="py-2 px-4 border-b text-left text-gray-600">Preferred Date/Time</th>
                    <th className="py-2 px-4 border-b text-left text-gray-600">Status</th>
                    <th className="py-2 px-4 border-b text-left text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentNonFoodDonations.length > 0 ? (
                    currentNonFoodDonations.map((donation) => (
                      <tr key={donation._id} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b text-gray-700">{donation._id}</td>
                        <td className="py-2 px-4 border-b text-gray-700">{donation.donorId ? donation.donorId.fullName : 'N/A'}</td>
                        <td className="py-2 px-4 border-b text-gray-700 capitalize">{donation.donationType}</td>
                        <td className="py-2 px-4 border-b text-gray-700">{donation.deliveryMethod}</td>
                        <td className="py-2 px-4 border-b text-gray-700">{new Date(donation.preferredDeliveryDateTime).toLocaleString()}</td>
                        <td className="py-2 px-4 border-b text-gray-700">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(donation.status)}`}>
                            {donation.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-2 px-4 border-b text-gray-700">
                          <button onClick={() => handleApproveNonFoodDonationClick(donation)} className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 mr-2">Approve & Match</button>
                          <button onClick={() => handleRejectNonFoodDonation(donation._id)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">Reject</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-4 text-center text-gray-500">No pending non-food donations.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {nonFoodDonations.length > nonFoodItemsPerPage && (
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
      )}

      {/* Select Home Modal */}
      {showSelectHomeModal && selectedDonationForMatch && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Select Child Care Home for Non-Food Donation</h3>
            <p className="mb-4 text-gray-700">
              Donation Type: <span className="font-semibold capitalize">{selectedDonationForMatch.donationType}</span> from{' '}
              <span className="font-semibold">{selectedDonationForMatch.donorId.fullName}</span> (Donor Address: {selectedDonationForMatch.donorId.address})
            </p>

            {loadingNearestHomes ? (
              <p>Loading nearest homes...</p>
            ) : errorNearestHomes ? (
              <p className="text-red-500">{errorNearestHomes}</p>
            ) : (
              <div className="overflow-x-auto mb-4 max-h-80">
                {nearestHomes.length > 0 ? (
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border-b text-left text-gray-600">Home Name</th>
                        <th className="py-2 px-4 border-b text-left text-gray-600">Address</th>
                        <th className="py-2 px-4 border-b text-left text-gray-600">Phone Number</th>
                        <th className="py-2 px-4 border-b text-left text-gray-600">Distance (km)</th>
                        <th className="py-2 px-4 border-b text-left text-gray-600">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nearestHomes.map((home) => (
                        <tr key={home._id} className="hover:bg-gray-50">
                          <td className="py-2 px-4 border-b text-gray-700">{home.homeName}</td>
                          <td className="py-2 px-4 border-b text-gray-700">{home.address}</td>
                          <td className="py-2 px-4 border-b text-gray-700">{home.phoneNumber}</td>
                          <td className="py-2 px-4 border-b text-gray-700">{home.distance}</td>
                          <td className="py-2 px-4 border-b text-gray-700">
                            <button
                              onClick={() => handleSelectHomeAndApprove(home._id)}
                              className="bg-primaryGreen text-white px-3 py-1 rounded-md hover:bg-green-700"
                            >
                              Select & Approve
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500">No approved child care homes found near the donor.</p>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleCloseSelectHomeModal}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryTracker;
