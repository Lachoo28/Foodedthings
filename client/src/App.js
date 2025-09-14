import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Route, Routes, Link, useLocation } from 'react-router-dom';
import './index.css'; // Import Tailwind CSS
import Login from './components/Login';
import Signup from './components/Signup';
import AdminDashboard from './components/AdminDashboard';
import DonorLogin from './components/DonorLogin';
import DonorSignup from './components/DonorSignup';
import HomeLogin from './components/HomeLogin';
import HomeSignup from './components/HomeSignup';
import DashboardOverview from './components/admin/DashboardOverview';
import ApproveDonors from './components/admin/ApproveDonors';
import ApproveHomes from './components/admin/ApproveHomes';
import AIMatchingPanel from './components/admin/AIMatchingPanel';
import DeliveryTracker from './components/admin/DeliveryTracker';

import DonorDashboard from './components/DonorDashboard'; // Import DonorDashboard
import HomeDashboard from './components/HomeDashboard'; // Import HomeDashboard

import FeedbackReports from './components/admin/FeedbackReports';
import NewsDetail from './components/NewsDetail';
import AddNews from './components/admin/AddNews';
import axios from 'axios'; // Import axios
import HomeDetail from './components/HomeDetail'; // Import HomeDetail
import FoodGuidelines from './components/FoodGuidelines';
import DonationInstructions from './components/DonationInstructions';
import FAQ from './components/FAQ';
import PrivacyPolicy from './components/PrivacyPolicy';

// Import new donor dashboard pages
import DonorDashboardOverview from './components/donor/DashboardOverview';
import CreateDonation from './components/donor/CreateDonation';
import MyDonations from './components/donor/MyDonations';
import DonorNotifications from './components/donor/Notifications'; // Renamed to avoid conflict
import DonorProfile from './components/donor/Profile'; // Renamed to avoid conflict

// Import new home dashboard pages
import HomeDashboardOverview from './components/home/DashboardOverview';
import HomeDonations from './components/home/Donations';
import UpcomingDeliveries from './components/home/UpcomingDeliveries';
import HomeNotifications from './components/home/Notifications';
import Feedback from './components/home/Feedback';
import HomeProfile from './components/home/Profile';
import heroBackground from './assets/images/1234.jpg'; // Import the background image
import AboutUs from './assets/images/12.png';


function App() {
  const location = useLocation(); // Get current location
  const [newsArticles, setNewsArticles] = useState([]);
  const [childCareHomes, setChildCareHomes] = useState([]); // New state for child care homes
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [currentHomeIndex, setCurrentHomeIndex] = useState(0); // New state for home carousel index
  const heroRef = useRef(null);
  const aboutRef = useRef(null);

  // State for contact form
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactStatus, setContactStatus] = useState('');

  const articlesPerPage = 4; // Number of articles to show at once
  const homesPerPage = 3; // Number of homes to show at once

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const fetchNewsAndHomes = async () => {
      try {
        const newsResponse = await axios.get('http://localhost:5000/api/news');
        setNewsArticles(newsResponse.data);

        const homesResponse = await axios.get('http://localhost:5000/api/homes'); // Fetch child care homes
        setChildCareHomes(homesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (location.pathname === '/') {
      fetchNewsAndHomes();

      // GSAP Animations for Hero Section
      gsap.set(heroRef.current.querySelector('h1'), { opacity: 0, y: 80, visibility: 'hidden' });
      gsap.set(heroRef.current.querySelector('p'), { opacity: 0, y: 80, visibility: 'hidden' });
      gsap.set(heroRef.current.querySelectorAll('.hero-button'), { opacity: 0, y: 80, visibility: 'hidden' });

      gsap.to(heroRef.current.querySelector('h1'), 
        { opacity: 1, y: 0, visibility: 'visible', duration: 1.5, ease: 'expo.out' }
      );
      gsap.to(heroRef.current.querySelector('p'), 
        { opacity: 1, y: 0, visibility: 'visible', duration: 1.5, delay: 0.3, ease: 'expo.out' }
      );
      gsap.to(heroRef.current.querySelectorAll('.hero-button'), 
        { opacity: 1, y: 0, visibility: 'visible', duration: 1.2, delay: 0.6, stagger: 0.2, ease: 'expo.out' }
      );

      // GSAP Animations for About Us Section
      gsap.fromTo(aboutRef.current.querySelector('img'),
        { opacity: 0, x: -150 },
        { opacity: 1, x: 0, duration: 1.5, delay: 0.8, ease: 'expo.out',
          scrollTrigger: {
            trigger: '#about',
            start: 'top 80%',
            toggleActions: 'play none none none',
          }
        }
      );
      gsap.fromTo(aboutRef.current.querySelector('div.md\\:pl-12'),
        { opacity: 0, x: 150 },
        { opacity: 1, x: 0, duration: 1.5, delay: 1, ease: 'expo.out',
          scrollTrigger: {
            trigger: '#about',
            start: 'top 80%',
            toggleActions: 'play none none none',
          }
        }
      );

      // GSAP Animations for Featured Child Care Homes Section
      gsap.fromTo('#homes h2', 
        { opacity: 0, y: 50 }, 
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: {
            trigger: '#homes',
            start: 'top 80%',
            toggleActions: 'play none none none', // Play animation once when entering viewport
          }
        }
      );
      gsap.fromTo('#homes p', 
        { opacity: 0, y: 50 }, 
        { opacity: 1, y: 0, duration: 1, delay: 0.2, ease: 'power3.out',
          scrollTrigger: {
            trigger: '#homes',
            start: 'top 80%',
            toggleActions: 'play none none none',
          }
        }
      );
      gsap.fromTo('#homes .grid > div', 
        { opacity: 0, y: 50 }, 
        { opacity: 1, y: 0, duration: 0.8, delay: 0.4, stagger: 0.2, ease: 'power3.out',
          scrollTrigger: {
            trigger: '#homes',
            start: 'top 80%',
            toggleActions: 'play none none none',
          }
        }
      );

      // GSAP Animations for News & Blogs Section
      gsap.fromTo('#news h2', 
        { opacity: 0, y: 50 }, 
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: {
            trigger: '#news',
            start: 'top 80%',
            toggleActions: 'play none none none',
          }
        }
      );
      gsap.fromTo('#news p', 
        { opacity: 0, y: 50 }, 
        { opacity: 1, y: 0, duration: 1, delay: 0.2, ease: 'power3.out',
          scrollTrigger: {
            trigger: '#news',
            start: 'top 80%',
            toggleActions: 'play none none none',
          }
        }
      );
      gsap.fromTo('#news .grid > div', 
        { opacity: 0, y: 50 }, 
        { opacity: 1, y: 0, duration: 0.8, delay: 0.4, stagger: 0.2, ease: 'power3.out',
          scrollTrigger: {
            trigger: '#news',
            start: 'top 80%',
            toggleActions: 'play none none none',
          }
        }
      );

      // GSAP Animations for Statistics Section
      gsap.utils.toArray('.stat-item').forEach((item, i) => {
        const valueDisplay = item.querySelector('p.text-5xl');
        const targetValue = parseInt(valueDisplay.dataset.target);

        gsap.fromTo(valueDisplay, 
          { innerText: 0 }, 
          { innerText: targetValue, duration: 2, ease: 'power1.out',
            snap: { innerText: 1 }, // Snap to integer values
            scrollTrigger: {
              trigger: item,
              start: 'top 80%',
              toggleActions: 'play none none none',
            }
          }
        );
        gsap.fromTo(item, 
          { opacity: 0, y: 50 }, 
          { opacity: 1, y: 0, duration: 0.8, delay: 0.2 + (i * 0.1), ease: 'power3.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 80%',
              toggleActions: 'play none none none',
            }
          }
        );
      });

      // GSAP Animations for Contact Us Section
      gsap.fromTo('#contact h2', 
        { opacity: 0, y: 50 }, 
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: {
            trigger: '#contact',
            start: 'top 80%',
            toggleActions: 'play none none none',
          }
        }
      );
      gsap.fromTo('#contact p', 
        { opacity: 0, y: 50 }, 
        { opacity: 1, y: 0, duration: 1, delay: 0.2, ease: 'power3.out',
          scrollTrigger: {
            trigger: '#contact',
            start: 'top 80%',
            toggleActions: 'play none none none',
          }
        }
      );
      gsap.fromTo('#contact form', 
        { opacity: 0, y: 50 }, 
        { opacity: 1, y: 0, duration: 0.8, delay: 0.4, ease: 'power3.out',
          scrollTrigger: {
            trigger: '#contact',
            start: 'top 80%',
            toggleActions: 'play none none none',
          }
        }
      );
      gsap.fromTo('#contact .flex.justify-around', 
        { opacity: 0, y: 50 }, 
        { opacity: 1, y: 0, duration: 0.8, delay: 0.6, ease: 'power3.out',
          scrollTrigger: {
            trigger: '#contact',
            start: 'top 80%',
            toggleActions: 'play none none none',
          }
        }
      );
      gsap.fromTo('#contact iframe', 
        { opacity: 0, x: 100 }, 
        { opacity: 1, x: 0, duration: 1, delay: 0.8, ease: 'power3.out',
          scrollTrigger: {
            trigger: '#contact',
            start: 'top 80%',
            toggleActions: 'play none none none',
          }
        }
      );

      // GSAP Animations for Call to Action Section
      gsap.fromTo('.bg-lightBackground.py-16.text-center h2', 
        { opacity: 0, y: 50 }, 
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: {
            trigger: '.bg-lightBackground.py-16.text-center',
            start: 'top 80%',
            toggleActions: 'play none none none',
          }
        }
      );
      gsap.fromTo('.bg-lightBackground.py-16.text-center p', 
        { opacity: 0, y: 50 }, 
        { opacity: 1, y: 0, duration: 1, delay: 0.2, ease: 'power3.out',
          scrollTrigger: {
            trigger: '.bg-lightBackground.py-16.text-center',
            start: 'top 80%',
            toggleActions: 'play none none none',
          }
        }
      );
      gsap.fromTo('.bg-lightBackground.py-16.text-center .flex > a', 
        { opacity: 0, y: 50 }, 
        { opacity: 1, y: 0, duration: 0.8, delay: 0.4, stagger: 0.2, ease: 'power3.out',
          scrollTrigger: {
            trigger: '.bg-lightBackground.py-16.text-center',
            start: 'top 80%',
            toggleActions: 'play none none none',
          }
        }
      );
    }
  }, [location.pathname, newsArticles.length, childCareHomes.length]); // Added dependencies for useEffect

  const handlePrevNews = () => {
    setCurrentNewsIndex((prevIndex) => {
      const newIndex = Math.max(0, prevIndex - articlesPerPage);
      document.getElementById('news').scrollIntoView({ behavior: 'smooth' });
      return newIndex;
    });
  };

  const handleNextNews = () => {
    setCurrentNewsIndex((prevIndex) => {
      const newIndex = Math.min(newsArticles.length - articlesPerPage, prevIndex + articlesPerPage);
      document.getElementById('news').scrollIntoView({ behavior: 'smooth' });
      return newIndex;
    });
  };

  const handlePrevHome = () => {
    setCurrentHomeIndex((prevIndex) => {
      const newIndex = Math.max(0, prevIndex - homesPerPage);
      document.getElementById('homes').scrollIntoView({ behavior: 'smooth' });
      return newIndex;
    });
  };

  const handleNextHome = () => {
    setCurrentHomeIndex((prevIndex) => {
      const newIndex = Math.min(childCareHomes.length - homesPerPage, prevIndex + homesPerPage);
      document.getElementById('homes').scrollIntoView({ behavior: 'smooth' });
      return newIndex;
    });
  };

  // Check if it's an admin, donor, or home route to conditionally render header
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactStatus('Sending message...');
    try {
      const response = await axios.post('http://localhost:5000/api/contact', {
        name: contactName,
        email: contactEmail,
        phone: contactPhone,
        message: contactMessage,
      });
      setContactStatus(response.data.message || 'Message sent successfully!');
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setContactMessage('');
    } catch (error) {
      console.error('Error sending contact message:', error);
      setContactStatus('Failed to send message. Please try again.');
    }
  };

  // Check if it's an admin, donor, or home route, or a login/signup page to conditionally render header
  const hideHeaderRoutes = [
    '/admin',
    '/donor-dashboard',
    '/home-dashboard',
    '/login',
    '/signup',
    '/donor-login',
    '/donor-signup',
    '/home-login',
    '/home-signup',
  ];
  const shouldHideHeader = hideHeaderRoutes.some(route => location.pathname.startsWith(route));

  return (
    <div className="App">
      {!shouldHideHeader && ( // Conditionally render header
        <header className="bg-white shadow-md fixed top-0 w-full z-50">
          <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
            <div className="text-2xl font-bold text-primaryGreen">FoodShare</div>
            <div className="flex items-center">
              <div className="hidden md:flex space-x-8">
                <a href="#home" className="text-gray-600 hover:text-primaryGreen">Home</a>
                <a href="#about" className="text-gray-600 hover:text-primaryGreen">About Us</a>
                <a href="#homes" className="text-gray-600 hover:text-primaryGreen">Child Homes</a>
                <a href="#news" className="text-gray-600 hover:text-primaryGreen">News</a>
                <a href="#contact" className="text-gray-600 hover:text-primaryGreen">Contact</a>
              </div>
              <div className="md:hidden">
                {/* Hamburger menu icon */}
                <button className="text-gray-600 focus:outline-none">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </button>
              </div>
            </div>
          </nav>
        </header>
      )}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/donor-login" element={<DonorLogin />} />
        <Route path="/donor-signup" element={<DonorSignup />} />
        <Route path="/home-login" element={<HomeLogin />} />
        <Route path="/home-signup" element={<HomeSignup />} />
        <Route path="/news-detail/:id" element={<NewsDetail />} />
        <Route path="/home-detail/:id" element={<HomeDetail />} /> {/* New route for home details */}
        <Route path="/food-guidelines" element={<FoodGuidelines />} />
        <Route path="/donation-instructions" element={<DonationInstructions />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        
        {/* Admin Dashboard Routes */}
        <Route path="/admin/*" element={<AdminDashboard />}>
          <Route path="overview" element={<DashboardOverview />} />
          <Route path="approve-donors" element={<ApproveDonors />} />
          <Route path="approve-homes" element={<ApproveHomes />} />
          <Route path="ai-matching" element={<AIMatchingPanel />} />
          <Route path="delivery-tracker" element={<DeliveryTracker />} />
          <Route path="feedback-reports" element={<FeedbackReports />} />
          <Route path="add-news" element={<AddNews />} />
          <Route path="create-donor" element={<DonorSignup />} />
          <Route path="create-home" element={<HomeSignup />} />
          <Route index element={<DashboardOverview />} />
        </Route>

        {/* Donor Dashboard Routes */}
        <Route path="/donor-dashboard/*" element={<DonorDashboard />}>
          <Route path="overview" element={<DonorDashboardOverview />} />
          <Route path="create-donation" element={<CreateDonation />} />
          <Route path="my-donations" element={<MyDonations />} />
          <Route path="notifications" element={<DonorNotifications />} />
          <Route path="profile" element={<DonorProfile />} />
          <Route index element={<DonorDashboardOverview />} />
        </Route>

        {/* Home Dashboard Routes */}
        <Route path="/home-dashboard/*" element={<HomeDashboard />}>
          <Route path="overview" element={<HomeDashboardOverview />} />
          <Route path="donations" element={<HomeDonations />} />
          <Route path="upcoming-deliveries" element={<UpcomingDeliveries />} />
          <Route path="notifications" element={<HomeNotifications />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="profile" element={<HomeProfile />} />
          <Route index element={<HomeDashboardOverview />} />
        </Route>

        <Route path="/" element={
          <>
            {/* Hero Section */}
            <section id="home" ref={heroRef} className="relative bg-lightBackground min-h-screen flex items-center justify-center pt-32 pb-20 px-6 text-center overflow-hidden">
              <div className="relative z-10">
                <h1 className="text-5xl md:text-7xl font-bold text-primaryGreen leading-tight">Ending Food Waste, Feeding Every Soul</h1>
                <p className="mt-4 text-lg text-gray-700 max-w-2xl mx-auto">This platform connects surplus food providers with special needs homes, orphanages, and shelters to ensure no meal goes to waste. By bridging donors and receivers, we aim to reduce food waste and move towards a hunger-free nation. Simple, sustainable, and impactful - every meal shared brings us closer to zero hunger.</p>
                <div className="mt-10 flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6">
                  <Link to="/donor-login" className="hero-button bg-primaryGreen text-white rounded-2xl text-lg font-semibold hover:bg-green-700 flex flex-col overflow-hidden w-64 h-40 cursor-pointer">
                    <div className="flex items-center justify-center p-4 bg-darkGreen h-1/2">
                      <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2zM9 14c0 1.657-1.343 3-3 3H3v-3c0-1.657 1.343-3 3-3h3zm6 0c0 1.657 1.343 3 3 3h3v-3c0-1.657-1.343-3-3-3h-3zM12 4a4 4 0 100 8 4 4 0 000-8z"></path></svg>
                      <span className="text-sm">Help fight hunger in our community</span>
                    </div>
                    <div className="flex items-center justify-center p-4 bg-primaryGreen h-1/2 border-t border-white border-opacity-30 hover:text-white transform transition duration-300 hover:scale-105">
                      <span className="mr-2 text-2xl">Donate</span> <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </div>
                  </Link>
                  <Link to="/home-signup" className="hero-button bg-primaryGreen text-white rounded-2xl text-lg font-semibold hover:bg-green-700 flex flex-col overflow-hidden w-64 h-40 cursor-pointer">
                    <div className="flex items-center justify-center p-4 bg-darkGreen h-1/2">
                      <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                      <span className="text-sm">Turn your home into a hunger-fighting hub</span>
                    </div>
                    <div className="flex items-center justify-center p-4 bg-primaryGreen h-1/2 border-t border-white border-opacity-30 hover:text-white transform transition duration-300 hover:scale-105">
                      <span className="mr-2 text-2xl">Register Home</span> <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </div>
                  </Link>
                  <Link to="/login" className="hero-button bg-primaryGreen text-white rounded-2xl text-lg font-semibold hover:bg-green-700 flex flex-col overflow-hidden w-64 h-40 cursor-pointer">
                    <div className="flex items-center justify-center p-4 bg-darkGreen h-1/2">
                      <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      <span className="text-sm">Manage hunger relief efforts and track impact</span>
                    </div>
                    <div className="flex items-center justify-center p-4 bg-primaryGreen h-1/2 border-t border-white border-opacity-30 hover:text-white transform transition duration-300 hover:scale-105">
                      <span className="mr-2 text-2xl">Admin</span> <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </div>
                  </Link>
                </div>
              </div>
              {/* Background illustrations and basket images would go here */}
              <div className="absolute inset-0 z-0">
                <img src={heroBackground} alt="Hero Background" className="w-full h-full object-cover" />
              </div>
            </section>

            {/* Who Are We Section */}
            <section id="about" ref={aboutRef} className="container mx-auto px-6 py-20 flex flex-col md:flex-row items-center justify-center min-h-screen overflow-hidden">
              <div className="md:w-1/2">
                <img src={AboutUs} alt="Holding bread" className="rounded-lg shadow-lg" />
              </div>
              <div className="md:w-1/2 md:pl-12 mt-10 md:mt-0">
                <h2 className="text-4xl font-bold text-primaryGreen">Who Are We</h2>
                <p className="mt-4 text-lg text-gray-700">We are a socially-driven platform dedicated to reducing food waste and ensuring surplus food reaches those in need.</p>
                <ul className="mt-6 space-y-4 text-lg text-gray-700">
                  <li><span className="font-semibold text-primaryGreen">Food Rescue:</span> Collect surplus food from events, restaurants, and individuals.</li>
                  <li><span className="font-semibold text-primaryGreen">Smart Matching:</span> Connect food donors with nearby homes in real-time.</li>
                  <li><span className="font-semibold text-primaryGreen">Social Impact:</span> Support hunger relief and community wellbeing.</li>
                </ul>
              </div>
            </section>

            {/* Featured Child Care Homes Section */}
            <section id="homes" className="bg-lightBackground py-20 min-h-screen flex flex-col justify-center">
              <div className="max-w-6xl mx-auto px-6 w-full">
                <h2 className="text-4xl font-bold text-primaryGreen text-center">Featured Child Care Homes</h2>
                <p className="text-center text-gray-700 mt-4">These homes are making a difference in children's lives</p>
                <div className="relative mt-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {childCareHomes.slice(currentHomeIndex, currentHomeIndex + homesPerPage).map((home) => (
                      <div key={home._id} className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105">
                        <img src={`http://localhost:5000/${home.profilePhotoPath}`} alt={home.homeName} className="w-full h-48 object-cover" />
                        <div className="p-6">
                          <h3 className="text-xl font-semibold text-primaryGreen">{home.homeName}</h3>
                          <p className="mt-2 text-gray-600">{home.description}</p>
                          {home.specialNeeds && (
                            <p className="mt-1 text-gray-600 text-sm italic">Special Needs: {home.specialNeeds}</p>
                          )}
                          <div className="flex items-center mt-4 text-gray-500">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.727A8 8 0 016.343 7.273L17.657 16.727zm0 0L19.5 18.5m-2.843-1.773l-1.774 1.774m-1.773-1.773l-1.774 1.774m-1.773-1.773l-1.774 1.774M12 21.5a9.5 9.5 0 100-19 9.5 9.5 0 000 19z"></path></svg>
                            <span>{home.address}</span>
                          </div>
                          <Link to={`/home-detail/${home._id}`} className="text-primaryGreen font-semibold mt-4 inline-block">Know More &rarr;</Link>
                        </div>
                      </div>
                    ))}
                  </div>
                  {childCareHomes.length > homesPerPage && (
                    <>
                      <button
                        onClick={handlePrevHome}
                        disabled={currentHomeIndex === 0}
                        className="absolute -left-12 top-1/2 -translate-y-1/2 bg-primaryGreen text-white p-2 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                      </button>
                      <button
                        onClick={handleNextHome}
                        disabled={currentHomeIndex >= childCareHomes.length - homesPerPage}
                        className="absolute -right-12 top-1/2 -translate-y-1/2 bg-primaryGreen text-white p-2 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </section>

            {/* Statistics Section */}
            <section className="bg-primaryGreen text-white py-20 px-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center max-w-6xl mx-auto">
                <div className="stat-item">
                  <p className="text-5xl font-bold" data-target="350">0</p>
                  <p className="text-lg mt-2">Successful Donations</p>
                </div>
                <div className="stat-item">
                  <p className="text-5xl font-bold" data-target="42">0</p>
                  <p className="text-lg mt-2">Child Care Homes</p>
                </div>
                <div className="stat-item">
                  <p className="text-5xl font-bold" data-target="820">0</p>
                  <p className="text-lg mt-2">Children Fed</p>
                </div>
                <div className="stat-item">
                  <p className="text-5xl font-bold" data-target="2500">0</p>
                  <p className="text-lg mt-2">Pounds of Food Saved</p>
                </div>
              </div>
            </section>

            {/* News & Blogs Section */}
            <section id="news" className="bg-lightBackground py-20 min-h-screen flex flex-col justify-center">
              <div className="max-w-6xl mx-auto px-6 w-full">
                <h2 className="text-4xl font-bold text-primaryGreen text-center">News & Blogs</h2>
                <p className="text-center text-gray-700 mt-4">Stay updated with our latest news and stories</p>
                <div className="relative mt-10">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {newsArticles.slice(currentNewsIndex, currentNewsIndex + articlesPerPage).map((article) => (
                      <div key={article._id} className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105">
                        <img src={`http://localhost:5000/${article.imagePath}`} alt={article.title} className="w-full h-48 object-cover" />
                        <div className="p-6">
                          <h3 className="text-xl font-semibold text-primaryGreen">{article.title}</h3>
                          <p className="mt-2 text-gray-600">{article.content ? `${article.content.substring(0, 100)}...` : 'No content available.'}</p>
                          <Link to={`/news-detail/${article._id}`} className="text-primaryGreen font-semibold mt-4 inline-block">Read More &rarr;</Link>
                        </div>
                      </div>
                    ))}
                  </div>
                  {newsArticles.length > articlesPerPage && (
                    <>
                      <button
                        onClick={handlePrevNews}
                        disabled={currentNewsIndex === 0}
                        className="absolute -left-12 top-1/2 -translate-y-1/2 bg-primaryGreen text-white p-2 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                      </button>
                      <button
                        onClick={handleNextNews}
                        disabled={currentNewsIndex >= newsArticles.length - articlesPerPage}
                        className="absolute -right-12 top-1/2 -translate-y-1/2 bg-primaryGreen text-white p-2 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </section>

            {/* Contact Us Section */}
            <section id="contact" className="py-20 min-h-screen flex flex-col justify-center">
              <div className="container mx-auto px-6 w-full flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 pr-8">
                  <h2 className="text-4xl font-bold text-primaryGreen">Contact Us</h2>
                  <p className="mt-4 text-gray-700">Any urgent news or urgent needs Share Us.</p>
                  <form className="mt-8 space-y-4" onSubmit={handleContactSubmit}>
                    <input type="text" placeholder="Name *" className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryGreen" value={contactName} onChange={(e) => setContactName(e.target.value)} required />
                    <input type="email" placeholder="Email" className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryGreen" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                    <input type="text" placeholder="Phone Number *" className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryGreen" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} required />
                    <textarea placeholder="Type a message..." rows="5" className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryGreen" value={contactMessage} onChange={(e) => setContactMessage(e.target.value)}></textarea>
                    <button type="submit" className="bg-primaryGreen text-white px-6 py-3 rounded-md font-semibold hover:bg-green-700">SEND</button>
                    {contactStatus && <p className="mt-4 text-center text-sm">{contactStatus}</p>}
                  </form>
                  <div className="mt-8 flex justify-around text-gray-700">
                    <div className="flex items-center">
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684L10.5 9.25a1 1 0 001.07 1.07l4.329-.948a1 1 0 01.684.949V19a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"></path></svg>
                      <div>
                        <p className="font-semibold">PHONE</p>
                        <p>+94 76 557 1918</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.727A8 8 0 016.343 7.273L17.657 16.727zm0 0L19.5 18.5m-2.843-1.773l-1.774 1.774m-1.773-1.773l-1.774 1.774m-1.773-1.773l-1.774 1.774M12 21.5a9.5 9.5 0 100-19 9.5 9.5 0 000 19z"></path></svg>
                      <div>
                        <p className="font-semibold">Address</p>
                        <p>Kalmunai</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.9 5.3a2 2 0 002.2 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                      <div>
                        <p className="font-semibold">EMAIL</p>
                        <p>lakshanpulendran@gmail.com</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="md:w-1/2 mt-10 md:mt-0">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.7987000000003!2d79.861243!3d6.914679!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae25937f0000001%3A0x123456789abcdef!2sColombo%2C%20Sri%20Lanka!5e0!3m2!1sen!2sus!4v1678901234567!5m2!1sen!2sus"
                    width="100%"
                    height="450"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            </section>

            {/* Call to Action Section */}
            <section className="bg-lightBackground py-16 text-center">
              <h2 className="text-3xl font-bold text-primaryGreen">Ready to Make a Difference?</h2>
              <p className="mt-4 text-gray-700">Start today by donating food or registering your child care home.</p>
              <div className="mt-10 flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6">
                <Link to="/donor-signup" className="bg-primaryGreen text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-700 flex items-center justify-center">
                  <span className="mr-2">Register as a Donor</span>
                </Link>
                <Link to="/home-signup" className="bg-primaryGreen text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-700 flex items-center justify-center">
                  <span className="mr-2">Register as a Home</span>
                </Link>
              </div>
            </section>

            {/* Footer */}
            <footer className="bg-primaryGreen text-white py-12 px-6">
              <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <h3 className="text-2xl font-bold mb-4">FoodShare</h3>
                  <p className="text-sm">Connecting food donors with child care homes to reduce waste and feed children in need.</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
                  <ul className="space-y-2 text-sm">
                    <li><a href="#home" className="hover:underline">Home</a></li>
                    <li><a href="#about" className="hover:underline">About Us</a></li>
                    <li><a href="#" className="hover:underline">Donate Food</a></li>
                    <li><a href="#" className="hover:underline">Register a Home</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">Resources</h3>
                  <ul className="space-y-2 text-sm">
                    <li><Link to="/food-guidelines" className="hover:underline">Food Guidelines</Link></li>
                    <li><Link to="/donation-instructions" className="hover:underline">Donation Instructions</Link></li>
                    <li><Link to="/faq" className="hover:underline">FAQ</Link></li>
                    <li><Link to="/privacy-policy" className="hover:underline">Privacy Policy</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center"><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.9 5.3a2 2 0 002.2 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> support@foodshare.org</li>
                    <li className="flex items-center"><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684L10.5 9.25a1 1 0 001.07 1.07l4.329-.948a1 1 0 01.684.949V19a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"></path></svg> (+94) 76-557-1918</li>
                    <li className="flex items-center"><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.727A8 8 0 016.343 7.273L17.657 16.727zm0 0L19.5 18.5m-2.843-1.773l-1.774 1.774m-1.773-1.773l-1.774 1.774m-1.773-1.773l-1.774 1.774M12 21.5a9.5 9.5 0 100-19 9.5 9.5 0 000 19z"></path></svg> Kalmunai</li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-green-700 mt-8 pt-8 text-center text-sm">
                &copy; 2025 FoodShare Community. All rights reserved.
              </div>
            </footer>
          </>
        } />
      </Routes>
    </div>
  );
}

export default App;
