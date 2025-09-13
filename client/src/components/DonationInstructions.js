import React from 'react';
import { useNavigate } from 'react-router-dom';

function DonationInstructions() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-6 py-20">
      <button onClick={() => navigate(-1)} className="bg-primaryGreen text-white px-4 py-2 rounded-md mb-8 hover:bg-green-700">
        &larr; Back
      </button>
      <h1 className="text-4xl font-bold text-primaryGreen mb-6">Donation Instructions</h1>
      <div className="prose max-w-none">
        <p>
          Thank you for your interest in donating food to those in need. Follow these instructions to ensure a smooth donation process.
        </p>
        <h2 className="text-2xl font-semibold text-primaryGreen mt-8 mb-4">1. Prepare Your Donation</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Review our <a href="/food-guidelines" className="text-primaryGreen hover:underline">Food Guidelines</a> to ensure your items are acceptable.</li>
          <li>Sort your non-perishable food items by category (e.g., canned goods, dry goods).</li>
          <li>Check expiration dates. We can only accept unexpired food.</li>
          <li>Ensure all packaging is unopened and undamaged.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-primaryGreen mt-8 mb-4">2. Schedule a Pickup or Drop-off</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Log in to your donor dashboard and navigate to the "Create Donation" section.</li>
          <li>Fill out the donation form, specifying the type and quantity of food items.</li>
          <li>Choose your preferred donation method:
            <ul className="list-circle list-inside ml-6 space-y-1">
              <li><strong>Pickup:</strong> Select a convenient date and time for our volunteers to collect the food from your location.</li>
              <li><strong>Drop-off:</strong> Find a nearby drop-off point and schedule a time to deliver your donation.</li>
            </ul>
          </li>
          <li>Confirm your donation details.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-primaryGreen mt-8 mb-4">3. On Donation Day</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>For pickups, ensure your donation is easily accessible and clearly marked.</li>
          <li>For drop-offs, bring your donation to the selected location at the scheduled time.</li>
          <li>Our team will verify the items against the <a href="/food-guidelines" className="text-primaryGreen hover:underline">Food Guidelines</a>.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-primaryGreen mt-8 mb-4">4. After Your Donation</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>You will receive a confirmation email once your donation has been successfully processed.</li>
          <li>You can track the impact of your donation through your donor dashboard.</li>
        </ul>

        <p className="mt-8">
          Your generosity helps us fight hunger and reduce food waste. We appreciate your support!
        </p>
      </div>
    </div>
  );
}

export default DonationInstructions;
