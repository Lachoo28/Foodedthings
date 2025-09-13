import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function HomeDetail() {
  const { id } = useParams();
  const [home, setHome] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHomeDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/homes/${id}`);
        setHome(response.data);
      } catch (err) {
        setError('Failed to fetch home details.');
        console.error('Error fetching home details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeDetails();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;
  }

  if (!home) {
    return <div className="flex justify-center items-center min-h-screen">Home not found.</div>;
  }

  return (
    <div className="container mx-auto px-6 py-20 mt-16">
      <Link to="/" className="text-primaryGreen hover:underline mb-8 inline-block">&larr; Back to Home</Link>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <img src={`http://localhost:5000/${home.profilePhotoPath}`} alt={home.homeName} className="w-full h-96 object-cover" />
        <div className="p-8">
          <h1 className="text-4xl font-bold text-primaryGreen mb-4">{home.homeName}</h1>
          <p className="text-gray-700 text-lg mb-6">{home.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h2 className="text-2xl font-semibold text-primaryGreen mb-2">Details</h2>
              <p className="text-gray-600"><strong>Capacity:</strong> {home.capacity} children</p>
              <p className="text-gray-600"><strong>Address:</strong> {home.address}</p>
              {home.specialNeeds && (
                <p className="text-gray-600"><strong>Special Needs:</strong> {home.specialNeeds}</p>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-primaryGreen mb-2">Contact</h2>
              <p className="text-gray-600"><strong>Phone Number:</strong> {home.phoneNumber}</p>
              <p className="text-gray-600"><strong>Email:</strong> {home.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeDetail;
