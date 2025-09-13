import React, { useState } from 'react';
import axios from 'axios';
import { FaStar } from 'react-icons/fa';

const Feedback = () => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitStatus, setSubmitStatus] = useState(''); // 'idle', 'submitting', 'success', 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus('submitting');
    try {
      // Replace with actual API endpoint for submitting feedback
      const homeId = localStorage.getItem('homeId'); // Assuming homeId is stored in localStorage
      const homeName = localStorage.getItem('homeName'); // Assuming homeName is stored in localStorage
      if (!homeId || !homeName) {
        setSubmitStatus('error');
        alert('Home ID or Home Name not found. Please log in again.');
        return;
      }

      await axios.post('http://localhost:5000/api/feedback', {
        homeId,
        homeName, // Include homeName in the feedback submission
        rating,
        comment,
        feedbackType: 'donor_experience', // Or 'food_quality', depending on the context
      });
      setSubmitStatus('success');
      setRating(0);
      setComment('');
      alert('Feedback submitted successfully!');
    } catch (err) {
      setSubmitStatus('error');
      console.error('Error submitting feedback:', err);
      alert('Failed to submit feedback. Please try again.');
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Provide Feedback</h2>

      <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Rate Donor's Food Quality & Delivery Experience:
            </label>
            <div className="flex">
              {[...Array(5)].map((star, index) => {
                const currentRating = index + 1;
                return (
                  <label key={index}>
                    <input
                      type="radio"
                      name="rating"
                      value={currentRating}
                      onClick={() => setRating(currentRating)}
                      className="hidden"
                    />
                    <FaStar
                      className="cursor-pointer"
                      color={currentRating <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                      size={30}
                      onMouseEnter={() => setHover(currentRating)}
                      onMouseLeave={() => setHover(0)}
                    />
                  </label>
                );
              })}
            </div>
            {rating > 0 && <p className="text-sm text-gray-600 mt-2">You rated: {rating} stars</p>}
          </div>

          <div className="mb-6">
            <label htmlFor="comment" className="block text-gray-700 text-sm font-bold mb-2">
              Comments (Optional):
            </label>
            <textarea
              id="comment"
              name="comment"
              rows="5"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Share your thoughts on the food quality or delivery experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            ></textarea>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-primaryGreen hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={submitStatus === 'submitting'}
            >
              {submitStatus === 'submitting' ? 'Submitting...' : 'Submit Feedback'}
            </button>
            {submitStatus === 'success' && <p className="text-green-500">Feedback submitted!</p>}
            {submitStatus === 'error' && <p className="text-red-500">Submission failed.</p>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Feedback;
