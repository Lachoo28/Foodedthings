import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // Importing icons

const ApproveDonors = () => {
  const navigate = useNavigate();
  const [donors, setDonors] = useState([]);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Number of items per page

  const fetchDonors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/api/donors/all'); // Fetch all donors
      setDonors(response.data);
    } catch (err) {
      console.error('Error fetching donors:', err);
      setError('Failed to fetch donors.');
      setDonors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  // Calculate total pages
  const totalPages = Math.ceil(donors.length / itemsPerPage);

  // Get current items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDonors = donors.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleViewDetails = (donor) => {
    setSelectedDonor(donor);
    setIsModalOpen(true);
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/donors/approve/${id}`);
      fetchDonors(); // Refresh the list to show updated status
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error approving donor:', err);
      alert('Failed to approve donor. Check console for details.');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    try {
      await axios.put(`http://localhost:5000/api/donors/reject/${id}`, { reason });
      fetchDonors(); // Refresh the list to show updated status
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error rejecting donor:', err);
      alert('Failed to reject donor. Check console for details.');
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Approve Donors</h2>
        <button
          onClick={() => navigate('/admin/create-donor')}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200"
        >
          Create Donor
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-left text-gray-600">Full Name</th>
                <th className="py-2 px-4 border-b text-left text-gray-600">Email</th>
                <th className="py-2 px-4 border-b text-left text-gray-600">NIC Number</th>
                <th className="py-2 px-4 border-b text-left text-gray-600">Registration Date</th>
                <th className="py-2 px-4 border-b text-left text-gray-600">Status</th>
                <th className="py-2 px-4 border-b text-left text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-4 text-center text-gray-500">Loading donors...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="py-4 text-center text-red-500">{error}</td>
                </tr>
              ) : currentDonors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-4 text-center text-gray-500">No donors to display.</td>
                </tr>
              ) : (
                currentDonors.map((donor) => (
                  <tr key={donor._id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b text-gray-700">{donor.fullName}</td>
                    <td className="py-2 px-4 border-b text-gray-700">{donor.email}</td>
                    <td className="py-2 px-4 border-b text-gray-700">{donor.nicNumber}</td>
                    <td className="py-2 px-4 border-b text-gray-700">{new Date(donor.createdAt).toLocaleDateString()}</td>
                    <td className="py-2 px-4 border-b">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        donor.status === 'approved' ? 'bg-green-100 text-green-800' :
                        donor.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {donor.status}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b text-gray-700">
                      <button onClick={() => handleViewDetails(donor)} className="text-blue-500 hover:text-blue-700 mr-2" title="View Details">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      {donor.status === 'pending' && (
                        <>
                          <button onClick={() => handleApprove(donor._id)} className="text-green-500 hover:text-green-700 mr-2" title="Approve">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button onClick={() => handleReject(donor._id)} className="text-red-500 hover:text-red-700" title="Reject">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {donors.length > itemsPerPage && (
          <div className="flex justify-end mt-4">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 mx-1 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50 flex items-center"
            >
              <FaChevronLeft className="mr-1" /> Prev
            </button>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 mx-1 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50 flex items-center"
            >
              Next <FaChevronRight className="ml-1" />
            </button>
          </div>
        )}
      </div>

      {/* Modal for Donor Details */}
      {isModalOpen && selectedDonor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-3xl w-full flex flex-col">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 pr-4">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Donor Details</h3>
                <p><strong>Full Name:</strong> {selectedDonor.fullName}</p>
                <p><strong>Email:</strong> {selectedDonor.email}</p>
                <p><strong>NIC Number:</strong> {selectedDonor.nicNumber}</p>
                <p><strong>Registration Date:</strong> {new Date(selectedDonor.createdAt).toLocaleDateString()}</p>
                <p><strong>Status:</strong> <span className="capitalize">{selectedDonor.status}</span></p>
              </div>
              <div className="md:w-1/2 pl-4 mt-4 md:mt-0">
                <h4 className="font-semibold mb-2">Uploaded ID:</h4>
                {selectedDonor.nicPhotoPath ? (
                  <img src={`http://localhost:5000/${selectedDonor.nicPhotoPath.replace(/\\/g, '/')}`} alt="NIC Photo" className="w-full h-auto rounded-md object-cover" />
                ) : (
                  <p>No NIC photo uploaded.</p>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4 w-full">
              <button onClick={() => setIsModalOpen(false)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400">Close</button>
              {/* Actions only for pending items in modal */}
              {selectedDonor.status === 'pending' && (
                <>
                  <button onClick={() => handleApprove(selectedDonor._id)} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">Approve</button>
                  <button onClick={() => handleReject(selectedDonor._id)} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">Reject</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApproveDonors;
