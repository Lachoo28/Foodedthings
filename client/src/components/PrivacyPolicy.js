import React from 'react';
import { useNavigate } from 'react-router-dom';

function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-6 py-20">
      <button onClick={() => navigate(-1)} className="bg-primaryGreen text-white px-4 py-2 rounded-md mb-8 hover:bg-green-700">
        &larr; Back
      </button>
      <h1 className="text-4xl font-bold text-primaryGreen mb-6">Privacy Policy</h1>
      <div className="prose max-w-none">
        <p>
          This Privacy Policy describes how FoodShare collects, uses, and discloses your personal information when you use our website and services.
        </p>

        <h2 className="text-2xl font-semibold text-primaryGreen mt-8 mb-4">1. Information We Collect</h2>
        <p>We collect various types of information in connection with the services we provide, including:</p>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Personal Identifiable Information:</strong> Name, email address, phone number, physical address, and other contact details when you register or make a donation.</li>
          <li><strong>Donation Information:</strong> Details about your donations, including food type, quantity, and preferred pickup/drop-off times.</li>
          <li><strong>Usage Data:</strong> Information about how you access and use our services, such as your IP address, browser type, pages visited, and time spent on our site.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-primaryGreen mt-8 mb-4">2. How We Use Your Information</h2>
        <p>We use the information we collect for various purposes, including:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>To provide and maintain our services, including facilitating food donations and matching.</li>
          <li>To improve, personalize, and expand our services.</li>
          <li>To communicate with you, including sending updates, confirmations, and support messages.</li>
          <li>To monitor and analyze usage and trends to improve your experience.</li>
          <li>To detect, prevent, and address technical issues and fraudulent activities.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-primaryGreen mt-8 mb-4">3. Sharing Your Information</h2>
        <p>We may share your information with third parties in the following situations:</p>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>With Service Providers:</strong> We may share your information with third-party vendors, consultants, and other service providers who perform services on our behalf.</li>
          <li><strong>For Legal Reasons:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities.</li>
          <li><strong>Business Transfers:</strong> In connection with any merger, sale of company assets, or acquisition of all or a portion of our business by another company.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-primaryGreen mt-8 mb-4">4. Data Security</h2>
        <p>
          We implement reasonable security measures to protect your personal information from unauthorized access,
          use, or disclosure. However, no method of transmission over the Internet or electronic storage is 100% secure.
        </p>

        <h2 className="text-2xl font-semibold text-primaryGreen mt-8 mb-4">5. Your Data Protection Rights</h2>
        <p>Depending on your location, you may have the following rights regarding your personal data:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>The right to access, update, or delete the information we have on you.</li>
          <li>The right to object to our processing of your personal data.</li>
          <li>The right to request that we restrict the processing of your personal information.</li>
          <li>The right to data portability.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-primaryGreen mt-8 mb-4">6. Changes to This Privacy Policy</h2>
        <p>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
        </p>

        <p className="mt-8">
          If you have any questions about this Privacy Policy, please contact us at support@foodshare.org.
        </p>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
