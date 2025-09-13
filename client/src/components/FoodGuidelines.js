import React from 'react';
import { useNavigate } from 'react-router-dom';

function FoodGuidelines() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-6 py-20">
      <button onClick={() => navigate(-1)} className="bg-primaryGreen text-white px-4 py-2 rounded-md mb-8 hover:bg-green-700">
        &larr; Back
      </button>
      <h1 className="text-4xl font-bold text-primaryGreen mb-6">Food Guidelines</h1>
      <div className="prose max-w-none">
        <p>
          Here are the guidelines for food donations to ensure safety and quality for all recipients.
          Please read carefully before making a donation.
        </p>
        <h2 className="text-2xl font-semibold text-primaryGreen mt-8 mb-4">1. Food Safety and Quality</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>All donated food must be unexpired and in its original, unopened packaging.</li>
          <li>Perishable items (e.g., dairy, meat, fresh produce) must be stored at appropriate temperatures and handled hygienically.</li>
          <li>No homemade food items can be accepted due to health and safety regulations.</li>
          <li>Ensure food items are free from damage, spoilage, or contamination.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-primaryGreen mt-8 mb-4">2. Acceptable Food Items</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Homemade meals or baked goods</li>  
          <li>Canned goods (vegetables, fruits, soups, meats)</li>
          <li>Dry goods (pasta, rice, cereals, beans, flour)</li>
          <li>Packaged snacks (granola bars, crackers, dried fruit)</li>
          <li>Shelf-stable milk and juice boxes</li>
          <li>Baby food and formula (unopened and unexpired)</li>
          <li>Bottled water</li>
        </ul>

        <h2 className="text-2xl font-semibold text-primaryGreen mt-8 mb-4">3. Unacceptable Food Items</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Expired food items</li>
          <li>Opened or damaged packaging</li>
          <li>Alcoholic beverages</li>
          <li>Energy drinks</li>
          <li>Any item requiring refrigeration if not transported in a temperature-controlled environment</li>
        </ul>

        <h2 className="text-2xl font-semibold text-primaryGreen mt-8 mb-4">4. Packaging and Labeling</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>All items should be clearly labeled with their contents and expiration dates.</li>
          <li>Package items securely to prevent damage during transport.</li>
        </ul>

        <p className="mt-8">
          Thank you for your cooperation in ensuring that safe and nutritious food reaches those who need it most.
          For any questions, please contact us.
        </p>
      </div>
    </div>
  );
}

export default FoodGuidelines;
