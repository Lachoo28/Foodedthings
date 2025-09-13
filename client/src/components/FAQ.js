import React from 'react';
import { useNavigate } from 'react-router-dom';

function FAQ() {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "What is FoodShare?",
      answer: "FoodShare is a platform that connects surplus food providers (donors) with child care homes, orphanages, and shelters (recipients) to reduce food waste and combat hunger."
    },
    {
      question: "How do I register as a donor?",
      answer: "You can register as a donor by clicking on the 'Donate' button on the homepage or navigating to the '/donor-signup' page. You'll need to provide some basic information about yourself and your organization."
    },
    {
      question: "How do I register a child care home?",
      answer: "Child care homes can register by clicking on the 'Register Home' button on the homepage or navigating to the '/home-signup' page. You'll need to provide details about your home, including capacity and specific needs."
    },
    {
      question: "What kind of food can I donate?",
      answer: "We accept unexpired, unopened, and hygienically handled non-perishable food items. Please refer to our 'Food Guidelines' for a detailed list of acceptable and unacceptable items."
    },
    {
      question: "How does the food matching process work?",
      answer: "Our AI-powered matching system connects donors with nearby child care homes based on food availability, recipient needs, and logistical factors to ensure efficient and timely delivery."
    },
    {
      question: "Can I track my donation?",
      answer: "Yes, donors can track the status of their donations from pickup to delivery through their donor dashboard. You'll receive notifications at each stage of the process."
    },
    {
      question: "What if I have a large quantity of food to donate?",
      answer: "For large donations, please specify the quantity in the 'Create Donation' form. Our system will help arrange appropriate logistics, including larger vehicle pickups if necessary."
    },
    {
      question: "Is there a cost to use FoodShare?",
      answer: "No, FoodShare is a free platform for both donors and recipient homes. Our mission is to facilitate food sharing without any financial barriers."
    },
    {
      question: "How can I volunteer?",
      answer: "We are always looking for volunteers to help with pickups, deliveries, and administrative tasks. Please visit our 'Contact Us' page and send us a message expressing your interest."
    }
  ];

  return (
    <div className="container mx-auto px-6 py-20">
      <button onClick={() => navigate(-1)} className="bg-primaryGreen text-white px-4 py-2 rounded-md mb-8 hover:bg-green-700">
        &larr; Back
      </button>
      <h1 className="text-4xl font-bold text-primaryGreen mb-6 text-center">Frequently Asked Questions (FAQ)</h1>
      <div className="space-y-8">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-primaryGreen mb-3">{faq.question}</h2>
            <p className="text-gray-700">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FAQ;
