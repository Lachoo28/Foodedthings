import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // Importing icons

// Haversine formula to calculate distance between two lat/lon points
const haversineDistance = (coords1, coords2) => {
  const toRad = (x) => (x * Math.PI) / 180;

  const R = 6371; // Earth's radius in kilometers

  const dLat = toRad(coords2.latitude - coords1.latitude);
  const dLon = toRad(coords2.longitude - coords1.longitude);
  const lat1 = toRad(coords1.latitude);
  const lat2 = toRad(coords2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance.toFixed(2); // Return distance in kilometers, rounded to 2 decimal places
};

const AIMatchingPanel = () => {
  const [pendingDonations, setPendingDonations] = useState([]);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [matchResults, setMatchResults] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [viewingDonation, setViewingDonation] = useState(null);

  // Pagination states for pending donations
  const [currentDonationsPage, setCurrentDonationsPage] = useState(1);
  const [donationsPerPage] = useState(5);

  // Pagination states for match results
  const [currentMatchesPage, setCurrentMatchesPage] = useState(1);
  const [matchesPerPage] = useState(5);

  const fetchPendingDonations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/api/donations/pending');
      console.log('[AI Matching Panel] Fetched pending donations:', response.data);
      setPendingDonations(response.data);
    } catch (err) {
      console.error('Error fetching pending donations:', err);
      setError('Failed to fetch pending donations.');
      setPendingDonations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingDonations();
  }, []);

  // Pagination logic for pending donations
  const totalDonationsPages = Math.ceil(pendingDonations.length / donationsPerPage);
  const indexOfLastDonation = currentDonationsPage * donationsPerPage;
  const indexOfFirstDonation = indexOfLastDonation - donationsPerPage;
  const currentDonations = pendingDonations.slice(indexOfFirstDonation, indexOfLastDonation);

  const paginateDonations = (pageNumber) => setCurrentDonationsPage(pageNumber);

  // Pagination logic for match results
  const totalMatchesPages = Math.ceil(matchResults.length / matchesPerPage);
  const indexOfLastMatch = currentMatchesPage * matchesPerPage;
  const indexOfFirstMatch = indexOfLastMatch - matchesPerPage;
  const currentMatches = matchResults.slice(indexOfFirstMatch, indexOfLastMatch);

  const paginateMatches = (pageNumber) => setCurrentMatchesPage(pageNumber);


  const handleSelectDonation = (donation) => {
    setSelectedDonation(donation);
    setMatchResults([]); // Clear previous results
    setMessage('');
    setCurrentMatchesPage(1); // Reset match results pagination
  };

  const handleViewDonationDetails = (donation) => {
    setViewingDonation(donation);
    setIsDonationModalOpen(true);
    console.log('Viewing Donation Details:', donation); // Add this line for debugging
  };

  const handleRunMatching = async () => {
    console.log('[AI Matching Panel] handleRunMatching function called.');
    if (!selectedDonation) {
      setMessage('Please select a donation first.');
      console.log('[AI Matching Panel] No donation selected, returning.');
      return;
    }
    console.log('[AI Matching Panel] Selected Donation:', selectedDonation);
    setMessage('Running AI matching...');
    try {
      const donorCoords = selectedDonation.donorId
        ? {
            latitude: selectedDonation.donorId.latitude,
            longitude: selectedDonation.donorId.longitude,
          }
        : null;

      if (!donorCoords || isNaN(donorCoords.latitude) || isNaN(donorCoords.longitude)) {
        setMessage('Selected donation donor is missing valid latitude/longitude coordinates. Cannot calculate distance.');
        console.log('[AI Matching Panel] Donor coordinates missing or invalid, returning.');
        setMatchResults([]);
        return;
      }

      // Fetch all registered homes to find potential matches, which include lat/lon
      const homesResponse = await axios.get('http://localhost:5000/api/homes/approved');
      const allHomes = homesResponse.data;
      console.log('[AI Matching Panel] Fetched homes:', allHomes);

      const calculatedMatches = [];

      for (const home of allHomes) {
        console.log('[AI Matching Panel] Processing home:', home);
        const homeCoords =
          home.latitude && home.longitude
            ? {
                latitude: home.latitude,
                longitude: home.longitude,
              }
            : null;

        let distanceVal = null;
        let distanceDisplay = 'N/A';
        let distanceReason = '';

        if (!homeCoords || isNaN(homeCoords.latitude) || isNaN(homeCoords.longitude)) {
          distanceReason = '(Home coordinates missing)';
        } else {
          distanceVal = parseFloat(haversineDistance(donorCoords, homeCoords));
          distanceDisplay = `${distanceVal} km`;
        }

        // Only proceed if we have valid distance
        if (distanceVal !== null) {
          try {
            const requestData = {
              data: [selectedDonation.quantity, home.capacity, distanceVal],
            };
            console.log(`[ML API] Sending request for Home ${home._id}:`, requestData);

            const initialMlResponse = await axios.post(
              'https://lakshan0928-food-matching-ai.hf.space/gradio_api/call/predict',
              requestData
            );

            console.log(`[ML API] Initial response for Home ${home._id}:`, initialMlResponse.data);

            const eventId = initialMlResponse.data.event_id;

            if (eventId) {
              // Poll for the actual prediction using the event_id
              let predictionResponse;
              let prediction = null;
              let attempts = 0;
              const maxAttempts = 10;
              const pollInterval = 1000; // 1 second

              while (prediction === null && attempts < maxAttempts) {
                attempts++;
                await new Promise(resolve => setTimeout(resolve, pollInterval)); // Wait before polling
                predictionResponse = await axios.get(
                  `https://lakshan0928-food-matching-ai.hf.space/gradio_api/call/predict/${eventId}`
                );
                console.log(`[ML API] Polling response (attempt ${attempts}) for Home ${home._id}:`, predictionResponse); // Log full response for context

                let rawResponseContent;
                // Determine the correct source of the raw SSE string
                if (typeof predictionResponse.data === 'string') {
                  rawResponseContent = predictionResponse.data;
                } else if (predictionResponse.data && typeof predictionResponse.data.data === 'string') {
                  rawResponseContent = predictionResponse.data.data;
                } else {
                  // If neither is a string, it's an unexpected format.
                  console.error(`[ML API] Unexpected predictionResponse.data format for Home ${home._id}:`, predictionResponse.data);
                  continue; // Skip to next polling attempt
                }

                let responseData = { event: null, data: null }; // Initialize as an object

                try {
                  const lines = rawResponseContent.split('\n');
                  let event = null;
                  let dataPayload = null;
                  let parsedData = null;

                  for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (trimmedLine.startsWith('event:')) {
                      event = trimmedLine.substring(6).trim();
                    } else if (trimmedLine.startsWith('data:')) {
                      dataPayload = trimmedLine.substring(5).trim();
                    }
                  }

                  if (dataPayload) {
                    try {
                      parsedData = JSON.parse(dataPayload);
                    } catch (parseError) {
                      console.warn(`[ML API] Failed to parse dataPayload as JSON for Home ${home._id}:`, parseError);
                      parsedData = null;
                    }
                  }

                  responseData.event = event;
                  responseData.data = parsedData;

                } catch (e) {
                  console.error(`[ML API] Error processing SSE string for Home ${home._id}:`, e);
                  // responseData remains { event: null, data: null } in case of error
                }

                // Check if the *content* of responseData is valid. Allow data: null if the event is 'error'.
                if (!responseData.event || (responseData.data === null && responseData.event !== 'error')) {
                  console.warn(`[ML API] Polling responseData is incomplete or invalid for Home ${home._id}. Full response:`, predictionResponse);
                  if (attempts === maxAttempts) {
                    console.warn(`[ML API] Polling for Home ${home._id} reached max attempts with invalid responseData.`);
                  }
                  continue; // Continue to the next polling attempt
                }

                // Ensure event is a string and trim it for robust comparison
                const eventStatus = String(responseData.event).trim();
                const isComplete = eventStatus === 'complete';
                const isError = eventStatus === 'error'; // Check for error event

                let predictionData = responseData.data;
                // If predictionData is a string, attempt to parse it as JSON
                if (typeof predictionData === 'string') {
                  try {
                    predictionData = JSON.parse(predictionData);
                  } catch (e) {
                    console.warn(`[ML API] Failed to parse responseData.data as JSON string for Home ${home._id}:`, e);
                    predictionData = null;
                  }
                }

                if (isError) {
                  console.warn(`[ML API] ML API returned an error event for Home ${home._id}. Data:`, predictionData);
                  setMessage('ML API returned an error. Please check the ML model configuration.');
                  prediction = 0; // Treat as no match in case of ML API error
                } else if (isComplete && Array.isArray(predictionData) && predictionData.length > 0) {
                  if (predictionData[0].includes("✅ Match Found")) {
                    prediction = 1;
                    console.log(`[ML API] Prediction set to 1 for Home ${home._id}.`);
                  } else {
                    prediction = 0;
                    console.log(`[ML API] Prediction set to 0 for Home ${home._id}.`);
                  }
                } else if (attempts === maxAttempts) {
                  console.warn(`[ML API] Polling for Home ${home._id} reached max attempts without 'complete' event or valid data. Final response:`, predictionResponse ? predictionResponse.data : 'N/A');
                } else {
                  console.log(`[ML API] Polling for Home ${home._id} - Event not complete or data missing. Current event status: '${eventStatus}', data:`, responseData.data);
                }
              }
              console.log(`[AI Matching Panel] After polling loop, prediction for Home ${home._id}:`, prediction);
              console.log(`[ML API] Final prediction for Home ${home._id}:`, prediction);
              console.log(`[AI Matching Panel] Checking prediction value before adding to calculatedMatches:`, prediction);

              if (prediction === 1) {
                console.log(`[AI Matching Panel] Attempting to add Home ${home._id} to calculatedMatches. Home object:`, home);
                calculatedMatches.push({
                  _id: home._id,
                  name: home.homeName,
                  capacity: home.capacity,
                  distance: distanceDisplay,
                  matchPercentage: 'ML Match',
                });
                console.log(`[AI Matching Panel] Home ${home._id} successfully added to calculatedMatches. Current calculatedMatches:`, calculatedMatches);
              } else if (prediction === 0) {
                console.log(`[ML API] No match predicted for Home ${home._id} with inputs:`, requestData.data);
              } else {
                console.warn(`[ML API] Could not get a valid prediction for Home ${home._id} after ${maxAttempts} attempts. Final response data:`, predictionResponse ? predictionResponse.data : 'N/A');
              }
            } else {
              console.error(`[ML API] No event_id received for Home ${home._id}. Initial response data:`, initialMlResponse.data);
            }
          } catch (mlError) {
            console.error(`[ML API] Error calling ML API for home ${home._id}:`, mlError.response ? mlError.response.data : mlError.message);
          }
        }
      }

      console.log('[AI Matching Panel] Final calculated matches before setting state:', calculatedMatches);
      if (calculatedMatches.length > 0) {
        setMatchResults(calculatedMatches);
        setMessage('Matching complete. Review potential matches below.');
      } else {
        setMessage('No suitable matches found based on AI model criteria or missing coordinates. Please ensure your ML model is configured to return matches for the given inputs and check console for ML API responses and predictions.');
        setMatchResults([]);
      }
    } catch (err) {
      console.error('[AI Matching Panel] Critical Error during AI matching process:', err);
      setMessage(`Failed to run AI matching: ${err.message}. Please check console for details.`);
      setMatchResults([]);
    }
  };

  const handleConfirmMatch = async (homeId) => {
    if (!selectedDonation) {
      setMessage('No donation selected for matching.');
      return;
    }
    setMessage(`Confirming match for Donation ID ${selectedDonation._id} with Home ID ${homeId}...`);
    console.log('[AI Matching Panel] Confirming match with:', { donationId: selectedDonation._id, homeId: homeId });
    try {
      // Update donation status to 'matched' and assign matchedHomeId
      await axios.put(`http://localhost:5000/api/donations/${selectedDonation._id}/select-home`, {
        matchedHomeId: homeId,
      });
      setMessage('Match confirmed successfully! Donation status updated to "wait for home approval".');
      // Refresh the list of pending donations
      fetchPendingDonations();
      setSelectedDonation(null);
      setMatchResults([]);
    } catch (error) {
      setMessage('Failed to confirm match.');
      console.error('Error confirming match:', error);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">AI Matching Panel</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Donations */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Pending Donations for Matching</h3>
          {loading ? (
            <p className="text-gray-600 text-center">Loading pending donations...</p>
          ) : error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : pendingDonations.length === 0 ? (
            <p className="text-gray-600 text-center">No pending donations to match.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b text-left text-gray-600">ID</th>
                    <th className="py-2 px-4 border-b text-left text-gray-600">Donor</th>
                    <th className="py-2 px-4 border-b text-left text-gray-600">Food Type</th>
                    <th className="py-2 px-4 border-b text-left text-gray-600">Quantity</th>
                    <th className="py-2 px-4 border-b text-left text-gray-600">Date</th>
                    <th className="py-2 px-4 border-b text-left text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentDonations.map((donation) => (
                    <tr key={donation._id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b text-gray-700">{donation._id.substring(0, 0)}...</td>
                      <td className="py-2 px-4 border-b text-gray-700">{donation.donorId ? donation.donorId.fullName : 'N/A'}</td>
                      <td className="py-2 px-4 border-b text-gray-700">{donation.foodType}</td>
                      <td className="py-2 px-4 border-b text-gray-700">{`${donation.quantity} ${donation.unit}`}</td>
                      <td className="py-2 px-4 border-b text-gray-700">{new Date(donation.createdAt).toLocaleDateString()}</td>
                      <td className="py-2 px-4 border-b text-gray-700">
                        <div className="flex items-center space-x-2"> {/* Added flex container */}
                          <button onClick={() => handleViewDonationDetails(donation)} className="text-blue-500 hover:text-blue-700" title="View Details">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button onClick={() => {
                            console.log('[AI Matching Panel] Select Donation button clicked for:', donation._id);
                            handleSelectDonation(donation);
                          }} className={`px-3 py-1 rounded-md ${selectedDonation?._id === donation._id ? 'bg-green-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'}`} title={selectedDonation?._id === donation._id ? 'Donation Selected' : 'Select Donation'}>
                            {selectedDonation?._id === donation._id ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {pendingDonations.length > donationsPerPage && (
            <div className="flex justify-end mt-4">
              <button
                onClick={() => paginateDonations(currentDonationsPage - 1)}
                disabled={currentDonationsPage === 1}
                className="px-3 py-1 mx-1 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50 flex items-center"
              >
                <FaChevronLeft className="mr-1" /> Prev
              </button>
              <button
                onClick={() => paginateDonations(currentDonationsPage + 1)}
                disabled={currentDonationsPage === totalDonationsPages}
                className="px-3 py-1 mx-1 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50 flex items-center"
              >
                Next <FaChevronRight className="ml-1" />
              </button>
            </div>
          )}
          <button onClick={() => {
            console.log('[AI Matching Panel] Run AI Matching button clicked.');
            handleRunMatching();
          }} className="mt-4 bg-primaryGreen text-white px-4 py-2 rounded-md hover:bg-green-700" disabled={!selectedDonation}>Run AI Matching</button>
        </div>

        {/* Match Results */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Match Results for {selectedDonation ? selectedDonation.foodType : 'No Donation Selected'}</h3>
          {message && <p className="text-sm text-gray-600 mb-4">{message}</p>}
          {matchResults.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b text-left text-gray-600">Home Name</th>
                    <th className="py-2 px-4 border-b text-left text-gray-600">Capacity</th>
                    <th className="py-2 px-4 border-b text-left text-gray-600">Distance</th>
                    <th className="py-2 px-4 border-b text-left text-gray-600">Match %</th>
                    <th className="py-2 px-4 border-b text-left text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMatches.map((home) => (
                    <tr key={home._id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b text-gray-700">{home.name}</td>
                      <td className="py-2 px-4 border-b text-gray-700">{home.capacity}</td>
                      <td className="py-2 px-4 border-b text-gray-700">
                        {home.distance !== 'N/A' ? home.distance : `N/A ${home.distanceReason}`}
                      </td>
                      <td className="py-2 px-4 border-b text-gray-700">{home.matchPercentage}</td>
                      <td className="py-2 px-4 border-b text-gray-700">
                        <button onClick={() => handleConfirmMatch(home._id)} className="bg-primaryGreen text-white px-3 py-1 rounded-md hover:bg-green-700">Confirm Match</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">Select a donation and run AI matching to see results.</p>
          )}
          {matchResults.length > matchesPerPage && (
            <div className="flex justify-end mt-4">
              <button
                onClick={() => paginateMatches(currentMatchesPage - 1)}
                disabled={currentMatchesPage === 1}
                className="px-3 py-1 mx-1 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50 flex items-center"
              >
                <FaChevronLeft className="mr-1" /> Prev
              </button>
              <button
                onClick={() => paginateMatches(currentMatchesPage + 1)}
                disabled={currentMatchesPage === totalMatchesPages}
                className="px-3 py-1 mx-1 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50 flex items-center"
              >
                Next <FaChevronRight className="ml-1" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Donation Details */}
      {isDonationModalOpen && viewingDonation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-3xl w-full flex flex-col">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 pr-4">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Donation Details</h3>
                <p><strong>Donation ID:</strong> {viewingDonation._id}</p>
                <p><strong>Donor Name:</strong> {viewingDonation.donorId ? viewingDonation.donorId.fullName : 'N/A'}</p>
                <p><strong>Food Type:</strong> {viewingDonation.foodType}</p>
                <p><strong>Quantity:</strong> {viewingDonation.quantity} {viewingDonation.unit}</p>
                <p><strong>Description:</strong> {viewingDonation.description}</p>
                <p><strong>Pickup Location:</strong> {viewingDonation.pickupLocation}</p>
                <p><strong>Status:</strong> <span className="capitalize">{viewingDonation.status}</span></p>
                <p><strong>Created At:</strong> {new Date(viewingDonation.createdAt).toLocaleString()}</p>
              </div>
              <div className="md:w-1/2 pl-4 mt-4 md:mt-0">
                <h4 className="font-semibold mb-2">Food Image:</h4>
                {viewingDonation.foodImagePath ? (
                  <img src={`http://localhost:5000/${viewingDonation.foodImagePath.replace(/\\/g, '/')}`} alt="Food" className="w-full h-auto rounded-md object-cover" />
                ) : (
                  <p>No food image uploaded.</p>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end w-full">
              <button onClick={() => setIsDonationModalOpen(false)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIMatchingPanel;
