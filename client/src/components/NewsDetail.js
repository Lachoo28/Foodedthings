import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

function NewsDetail() {
  const { id } = useParams();
  const [newsArticle, setNewsArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNewsArticle = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/news/${id}`);
        setNewsArticle(response.data);
      } catch (err) {
        setError('Failed to fetch news article.');
        console.error('Error fetching news article:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsArticle();
  }, [id]);

  if (loading) {
    return <div className="container mx-auto px-6 py-20 text-center">Loading news article...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-6 py-20 text-center text-red-500">{error}</div>;
  }

  if (!newsArticle) {
    return <div className="container mx-auto px-6 py-20 text-center">News article not found.</div>;
  }

  return (
    <div className="container mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold text-primaryGreen mb-6">{newsArticle.title}</h1>
      {newsArticle.imagePath && (
        <img src={`http://localhost:5000/${newsArticle.imagePath}`} alt={newsArticle.title} className="w-full h-auto rounded-lg shadow-lg mb-8" />
      )}
      <p className="text-lg text-gray-700 mb-8">
        {newsArticle.content}
      </p>
      <Link to="/" className="bg-primaryGreen text-white px-6 py-3 rounded-md font-semibold hover:bg-green-700 inline-block">
        &larr; Back to Home
      </Link>
    </div>
  );
}

export default NewsDetail;
