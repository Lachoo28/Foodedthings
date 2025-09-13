
require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const axios = require('axios'); // Import axios for getCoordinates

// Helper function to get coordinates from an address using LocationIQ Geocoding API
// This is a simplified version for seeding, assuming API key is available
const getCoordinates = async (address) => {
  try {
    const response = await axios.get('https://us1.locationiq.com/v1/search.php', {
      params: {
        key: process.env.LOCATIONIQ_API_KEY,
        q: address,
        format: 'json',
        limit: 1,
      },
      timeout: 5000,
    });

    if (response.data && response.data.length > 0) {
      const { lat, lon } = response.data[0];
      return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
    } else {
      console.warn(`Geocoding failed for address: "${address}". No results found from LocationIQ.`);
      return null;
    }
  } catch (error) {
    console.error(`Error during geocoding for address "${address}":`, error.message);
    return null;
  }
};

// Schemas (copied from server.js for seeding purposes)
const NewsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true }, // Changed to content as per server.js
  imagePath: { type: String }, // Changed to imagePath as per server.js
  createdAt: { type: Date, default: Date.now },
});

const StatisticsSchema = new mongoose.Schema({
  successfulDonations: Number,
  childCareHomes: Number,
  childrenFed: Number,
  poundsFoodSaved: Number,
});

const DonorSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nicNumber: { type: String, required: true, unique: true },
  nicPhotoPath: { type: String, required: true },
  address: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

const ChildHomeUserSchema = new mongoose.Schema({
  homeName: { type: String, required: true, unique: true },
  registrationNumber: { type: String, required: true, unique: true },
  registrationCertificatePath: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  password: { type: String, required: true },
  capacity: { type: Number },
  address: { type: String },
  contactPerson: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

const DonationSchema = new mongoose.Schema({
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor', required: true },
  foodType: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true }, // e.g., 'meals', 'kg'
  foodImagePath: { type: String },
  deliveryMethod: { type: String, enum: ['Donor Delivery', 'Home Pickup'], required: true },
  preferredDeliveryDateTime: { type: Date, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'matched', 'wait for home approval', 'completed', 'rejected'],
    default: 'pending',
  },
  matchedHomeId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChildHomeUser' },
  rejectionReason: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Models
const News = mongoose.model('News', NewsSchema);
const Statistics = mongoose.model('Statistics', StatisticsSchema);
const Donor = mongoose.model('Donor', DonorSchema, 'donors');
const ChildHomeUser = mongoose.model('ChildHomeUser', ChildHomeUserSchema, 'childhomes');
const Donation = mongoose.model('Donation', DonationSchema, 'donations'); // Add Donation model

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for seeding');

    // Clear existing data by dropping collections to ensure indexes are also removed
    // Use try-catch for dropCollection as it throws if collection doesn't exist
    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const collection of collections) {
      if (['news', 'statistics', 'donors', 'childhomes', 'childhomes'].includes(collection.name)) { // Include 'childhomes' twice for safety if it was created by ChildHome or ChildHomeUser
        try {
          await mongoose.connection.db.dropCollection(collection.name);
          console.log(`Collection ${collection.name} dropped.`);
        } catch (e) {
          if (e.code === 26) { // 26 is "NamespaceNotFound" error code
            console.log(`Collection ${collection.name} not found, skipping drop.`);
          } else {
            console.error(`Error dropping collection ${collection.name}:`, e);
          }
        }
      }
    }
    console.log('Existing data cleared (collections dropped)');

    // Seed News & Blogs
    const news = [
      {
        title: 'Kidney Treatment',
        content: 'Caring for 15 children with a focus on meals and creative play.',
        imagePath: 'uploads/1755023506600-Section.png',
      },
      {
        title: 'Kidney Treatment',
        content: 'Caring for 15 children with a focus on meals and creative play.',
        imagePath: 'uploads/1755023921767-Section.png',
      },
      {
        title: 'Kidney Treatment',
        content: 'Caring for 15 children with a focus on meals and creative play.',
        imagePath: 'uploads/1755024241013-Section.png',
      },
      {
        title: 'Kidney Treatment',
        content: 'Caring for 15 children with a focus on meals and creative play.',
        imagePath: 'uploads/1755066403462-My First Board (1).jpg',
      },
    ];
    await News.insertMany(news);
    console.log('News & Blogs seeded');

    // Seed Statistics
    const stats = {
      successfulDonations: 20,
      childCareHomes: 42,
      childrenFed: 820,
      poundsFoodSaved: 2500,
    };
    await Statistics.create(stats);
    console.log('Statistics seeded');

    // Define a central location for mock data (e.g., Colombo, Sri Lanka)
    const centralLat = 6.9271;
    const centralLon = 79.8612;

    // Seed Donors
    const dummyDonors = [
      {
        fullName: 'Test Donor One',
        email: 'donor1@example.com',
        password: 'password123',
        nicNumber: '123456789V',
        nicPhotoPath: 'uploads/1755023506600-Section.png',
        address: 'Colombo, Sri Lanka', // Example address
        latitude: centralLat,
        longitude: centralLon,
        status: 'approved',
      },
      {
        fullName: 'Test Donor Two',
        email: 'donor2@example.com',
        password: 'password123',
        nicNumber: '987654321V',
        nicPhotoPath: 'uploads/1755023921767-Section.png',
        address: 'Kandy, Sri Lanka',
        latitude: 7.2906,
        longitude: 80.6337,
        status: 'pending',
      },
      {
        fullName: 'Approved Donor',
        email: 'approved@example.com',
        password: 'password123',
        nicNumber: '111222333V',
        nicPhotoPath: 'uploads/1755024241013-Section.png',
        address: 'Colombo, Sri Lanka (Near Central)', // Updated address for clarity
        latitude: centralLat + 0.001, // Very close to centralLat/Lon
        longitude: centralLon + 0.001,
        status: 'approved',
      },
    ];
    for (let donor of dummyDonors) {
      donor.password = await bcrypt.hash(donor.password, 10);
    }
    const insertedDonors = await Donor.insertMany(dummyDonors);
    console.log('Donors seeded');

    // Seed a dummy donation for the 'Approved Donor' with quantity 36
    const approvedDonor = insertedDonors.find(d => d.email === 'approved@example.com');
    if (approvedDonor) {
      const dummyDonation = {
        donorId: approvedDonor._id,
        foodType: 'Mixed Vegetables',
        quantity: 36,
        unit: 'kg',
        foodImagePath: 'uploads/1755714383578-Green Vintage Blank Template Instagram Story (1).png',
        deliveryMethod: 'Donor Delivery',
        preferredDeliveryDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'pending',
      };
      await mongoose.model('Donation').create(dummyDonation);
      console.log('Dummy donation seeded for Approved Donor.');
    }

    // Seed ChildHomeUsers with specific capacities and nearby locations
    const dummyChildHomes = [
      {
        homeName: 'Green Valley Home',
        registrationNumber: 'REG001',
        registrationCertificatePath: 'uploads/1755105485237-Green Vintage Blank Template Instagram Story (1).png',
        email: 'home1@example.com',
        phoneNumber: '0711234567',
        password: 'password123',
        capacity: 33,
        address: 'Colombo 01, Sri Lanka', // Very close to centralLat/Lon
        latitude: centralLat + 0.005, // ~0.5 km north
        longitude: centralLon + 0.005, // ~0.5 km east
        status: 'approved',
      },
      {
        homeName: 'Hope Haven',
        registrationNumber: 'REG002',
        registrationCertificatePath: 'uploads/1755108288924-Green Vintage Blank Template Instagram Story (1).png',
        email: 'home2@example.com',
        phoneNumber: '0711234568',
        password: 'password123',
        capacity: 34,
        address: 'Colombo 02, Sri Lanka',
        latitude: centralLat - 0.01, // ~1 km south
        longitude: centralLon,
        status: 'approved',
      },
      {
        homeName: 'Childrens Paradise',
        registrationNumber: 'REG003',
        registrationCertificatePath: 'uploads/1755108973431-Green Vintage Blank Template Instagram Story (1).png',
        email: 'home3@example.com',
        phoneNumber: '0711234569',
        password: 'password123',
        capacity: 35,
        address: 'Colombo 03, Sri Lanka',
        latitude: centralLat,
        longitude: centralLon + 0.015, // ~1.5 km east
        status: 'approved',
      },
      {
        homeName: 'Future Stars Home',
        registrationNumber: 'REG004',
        registrationCertificatePath: 'uploads/1755109151508-Green Vintage Blank Template Instagram Story (1).png',
        email: 'home4@example.com',
        phoneNumber: '0711234570',
        password: 'password123',
        capacity: 36,
        address: 'Colombo 04, Sri Lanka',
        latitude: centralLat + 0.02, // ~2 km north
        longitude: centralLon - 0.005, // ~0.5 km west
        status: 'approved',
      },
      {
        homeName: 'Golden Age Home',
        registrationNumber: 'REG005',
        registrationCertificatePath: 'uploads/1755109337913-Green Vintage Blank Template Instagram Story (1).png',
        email: 'home5@example.com',
        phoneNumber: '0711234571',
        password: 'password123',
        capacity: 37,
        address: 'Colombo 05, Sri Lanka',
        latitude: centralLat - 0.015, // ~1.5 km south
        longitude: centralLon - 0.01, // ~1 km west
        status: 'approved',
      },
      {
        homeName: 'New Horizons',
        registrationNumber: 'REG006',
        registrationCertificatePath: 'uploads/1755160211397-Green Vintage Blank Template Instagram Story (1).png',
        email: 'home6@example.com',
        phoneNumber: '0711234572',
        password: 'password123',
        capacity: 38,
        address: 'Colombo 06, Sri Lanka',
        latitude: centralLat + 0.008, // ~0.8 km north
        longitude: centralLon + 0.002, // ~0.2 km east
        status: 'approved',
      },
      {
        homeName: 'Distant Home', // This home should be filtered out by distance
        registrationNumber: 'REG007',
        registrationCertificatePath: 'uploads/1755160489579-Green Vintage Blank Template Instagram Story (1).png',
        email: 'home7@example.com',
        phoneNumber: '0711234573',
        password: 'password123',
        capacity: 30,
        address: 'Jaffna, Sri Lanka', // Far away
        latitude: 9.6615,
        longitude: 80.0255,
        status: 'approved',
      },
    ];

    for (let home of dummyChildHomes) {
      home.password = await bcrypt.hash(home.password, 10);
      // For seeding, we're directly setting lat/lon for simplicity.
      // If you want to test getCoordinates, remove the direct lat/lon assignment here.
    }
    await ChildHomeUser.insertMany(dummyChildHomes);
    console.log('ChildHomeUsers seeded');

  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

seedDB();
