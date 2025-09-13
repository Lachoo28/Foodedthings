import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // Importing icons

const FeedbackReports = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Number of items per page

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        // Assuming the API can handle pagination parameters, if not,
        // pagination will be handled client-side after fetching all data.
        // For now, fetching all data and handling pagination client-side.
        const response = await axios.get('http://localhost:5000/api/admin/feedback-reports');
        setFeedback(response.data);
      } catch (err) {
        console.error('Error fetching feedback reports:', err);
        setError('Failed to fetch feedback reports.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  // Calculate total pages
  const totalPages = Math.ceil(feedback.length / itemsPerPage);

  // Get current items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFeedback = feedback.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <div className="p-6 text-center">Loading feedback reports...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Feedback Reports</h2>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-left text-gray-600">Date</th>
                <th className="py-2 px-4 border-b text-left text-gray-600">Home Name</th>
                <th className="py-2 px-4 border-b text-left text-gray-600">Comment</th>
                <th className="py-2 px-4 border-b text-left text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentFeedback.length > 0 ? (
                currentFeedback.map((report) => (
                  <tr key={report._id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b text-gray-700">{new Date(report.createdAt).toLocaleDateString()}</td>
                    <td className="py-2 px-4 border-b text-gray-700">{report.homeId ? report.homeId.homeName : 'N/A'}</td>
                    <td className="py-2 px-4 border-b text-gray-700">{report.comment || 'No comment'}</td>
                    <td className="py-2 px-4 border-b">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        report.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                        report.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {report.sentiment}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-4 text-center text-gray-500">No feedback reports available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {feedback.length > itemsPerPage && (
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
    </div>
  );
};

export default FeedbackReports;
