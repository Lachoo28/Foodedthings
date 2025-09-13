require('dotenv').config({ path: './server/.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Import fs module
const nodemailer = require('nodemailer'); // Import nodemailer
const axios = require('axios'); // Import axios for external API calls

// Haversine Distance Calculation Function
const haversineDistance = (coords1, coords2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth's radius in kilometers

  const dLat = toRad(coords2.latitude - coords1.latitude);
  const dLon = toRad(coords2.longitude - coords1.longitude);
  const lat1 = toRad(coords1.latitude);
  const lat2 = toRad(coords2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

const app = express();
const PORT = process.env.PORT || 5000;

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Nodemailer transporter setup for SendGrid
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false, // Use STARTTLS
  auth: {
    user: 'apikey', // SendGrid username is 'apikey'
    pass: process.env.SENDGRID_API_KEY,
  },
});

// Helper function to get coordinates from an address using LocationIQ Geocoding API
const getCoordinates = async (address) => {
  try {
    const response = await axios.get('https://us1.locationiq.com/v1/search.php', {
      params: {
        key: process.env.LOCATIONIQ_API_KEY, // LocationIQ API key
        q: address, // Query parameter for address
        format: 'json', // Request JSON format
        limit: 1, // Limit results to 1
      },
      timeout: 5000, // Add a 5-second timeout
    });

    if (response.data && response.data.length > 0) {
      const { lat, lon } = response.data[0];
      return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
    } else {
      console.warn(`Geocoding failed for address: "${address}". No results found from LocationIQ.`);
      return null;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Error during geocoding with LocationIQ for address "${address}":`, error.message);
      if (error.response) {
        console.error('LocationIQ API response error:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('LocationIQ API no response:', error.request);
      } else {
        console.error('LocationIQ API request setup error:', error.message);
      }
    } else {
      console.error('Unknown error during geocoding:', error);
    }
    return null;
  }
};

// Schemas
// The ChildHomeSchema is no longer needed as we are using ChildHomeUser for both public and internal home data.
// const ChildHomeSchema = new mongoose.Schema({
//   name: String,
//   description: String,
//   location: String,
//   image: String,
// });

const NewsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true }, // Renamed from description to content for clarity
  imagePath: { type: String }, // Changed to imagePath to store the file path
  createdAt: { type: Date, default: Date.now },
});

const ContactSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  message: String,
  date: { type: Date, default: Date.now },
});


const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nicPhotoPath: { type: String },
});

const DonorSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nicNumber: { type: String, required: true, unique: true },
  nicPhotoPath: { type: String, required: true },
  address: { type: String }, // Added address field for donor
  phoneNumber: { type: String }, // Added phone number for donor
  latitude: { type: Number }, // Added latitude for donor
  longitude: { type: Number }, // Added longitude for donor
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
  latitude: { type: Number }, // Added latitude for home
  longitude: { type: Number }, // Added longitude for home
  profilePhotoPath: { type: String }, // Added profile photo path
  specialNeeds: { type: String }, // New field for specific needs
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

const DonationSchema = new mongoose.Schema({
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor', required: true },
  donationType: { type: String, enum: ['food', 'clothes', 'books'], required: true }, // Added donationType
  foodType: { type: String }, // Made optional, only for food donations
  quantity: { type: Number }, // Made optional
  unit: { type: String }, // Made optional
  foodImagePath: { type: String }, // Consistent naming for food image path
  expiryDateTime: { type: Date }, // New field for food expiry date and time
  deliveryMethod: { type: String, enum: ['Donor Delivery', 'Home Pickup'], required: true },
  preferredDeliveryDateTime: { type: Date, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'matched', 'wait for home approval', 'completed', 'rejected', 'pending_admin_review'], // Added pending_admin_review
    default: 'pending',
  },
  matchedHomeId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChildHomeUser' },
  rejectionReason: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const FeedbackSchema = new mongoose.Schema({
  homeId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChildHomeUser', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  feedbackType: { type: String, enum: ['donor_experience', 'food_quality'], required: true }, // Added for clarity
  sentiment: { type: String, enum: ['positive', 'negative', 'neutral'], default: 'neutral' }, // Added for sentiment analysis
  createdAt: { type: Date, default: Date.now },
});

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'userModel' },
  userModel: { type: String, required: true, enum: ['Donor', 'ChildHomeUser', 'Admin'] },
  type: { type: String, required: true }, // e.g., 'donation_status_update', 'new_match', 'delivery_reminder'
  message: { type: String, required: true },
  details: { type: mongoose.Schema.Types.Mixed }, // Flexible field for additional data
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Models
// const ChildHome = mongoose.model('ChildHome', ChildHomeSchema); // This is for the public list of homes - no longer needed
const News = mongoose.model('News', NewsSchema);
const Contact = mongoose.model('Contact', ContactSchema);
const Admin = mongoose.model('Admin', UserSchema, 'admins'); // Explicitly set collection name to 'admins'
const Donor = mongoose.model('Donor', DonorSchema, 'donors'); // Explicitly set collection name to 'donors'
const ChildHomeUser = mongoose.model('ChildHomeUser', ChildHomeUserSchema, 'childhomes'); // Explicitly set collection name to 'childhomes'
const Donation = mongoose.model('Donation', DonationSchema, 'donations'); // Explicitly set collection name to 'donations'
const Notification = mongoose.model('Notification', NotificationSchema, 'notifications'); // Explicitly set collection name to 'notifications'
const Feedback = mongoose.model('Feedback', FeedbackSchema, 'feedbacks'); // Explicitly set collection name to 'feedbacks'


// API Endpoints

// GET all approved child homes for public display
app.get('/api/homes', async (req, res) => {
  try {
    const homes = await ChildHomeUser.find({ status: 'approved' }).select('homeName description address profilePhotoPath capacity phoneNumber email specialNeeds');
    res.json(homes);
  } catch (err) {
    console.error('Error fetching approved child homes:', err);
    res.status(500).json({ message: 'Server error fetching homes.' });
  }
});

// GET a single news article by ID
app.get('/api/news/:id', async (req, res) => {
  try {
    const newsArticle = await News.findById(req.params.id);
    if (!newsArticle) {
      return res.status(404).json({ message: 'News article not found' });
    }
    res.json(newsArticle);
  } catch (err) {
    console.error('Error fetching single news article:', err);
    res.status(500).json({ message: 'Server error fetching news article.' });
  }
});

// The POST /api/homes endpoint is no longer needed as home signup handles new home creation.
// app.post('/api/homes', [
//   body('name').notEmpty().withMessage('Name is required'),
//   body('description').notEmpty().withMessage('Description is required'),
//   body('location').notEmpty().withMessage('Location is required'),
//   body('image').notEmpty().withMessage('Image URL is required'),
// ], async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   const { name, description, location, image } = req.body;
//   const newHome = new ChildHome({ name, description, location, image });

//   try {
//     const savedHome = await newHome.save();
//     res.status(201).json(savedHome);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// GET all news/blogs
app.get('/api/news', async (req, res) => {
  try {
    const news = await News.find();
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new news/blog with image upload
app.post('/api/news', upload.single('image'), [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });
    }
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, content } = req.body;
  const imagePath = req.file ? req.file.path : null;

  if (!imagePath) {
    return res.status(400).json({ message: 'Image is required' });
  }

  try {
    const newNews = new News({ title, content, imagePath });
    const savedNews = await newNews.save();
    res.status(201).json({ success: true, message: 'News article added successfully!', news: savedNews });
  } catch (err) {
    console.error('Error adding news:', err);
    if (imagePath) {
      fs.unlink(imagePath, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });
    }
    res.status(500).json({ message: 'Server error adding news.' });
  }
});

// GET dashboard statistics for admin
app.get('/api/stats', async (req, res) => {
  try {
    const totalDonors = await Donor.countDocuments({ status: 'approved' });
    const totalHomes = await ChildHomeUser.countDocuments({ status: 'approved' });
    const approvedDonations = await Donation.countDocuments({ status: 'completed' });
    const pendingApprovals = await Donation.countDocuments({ status: { $in: ['pending', 'pending_admin_review'] } });

    res.json({
      totalDonors,
      totalHomes,
      approvedDonations,
      pendingApprovals,
    });
  } catch (err) {
    console.error('Error fetching dashboard statistics:', err);
    res.status(500).json({ message: 'Server error fetching statistics.' });
  }
});

// POST contact form submission
app.post('/api/contact', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').optional().isString(),
  body('message').notEmpty().withMessage('Message is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, phone, message } = req.body;
  const newContact = new Contact({ name, email, phone, message });

  try {
    const savedContact = await newContact.save();
    res.status(201).json(savedContact);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Home Signup
app.post('/api/home-signup', upload.single('registrationCertificate'), [
  body('homeName').notEmpty().withMessage('Home Name is required'),
  body('registrationNumber').notEmpty().withMessage('Registration Number is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phoneNumber').notEmpty().withMessage('Phone Number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('address').notEmpty().withMessage('Address is required'), // Added address validation
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });
    }
    return res.status(400).json({ errors: errors.array() });
  }

  const { homeName, registrationNumber, email, phoneNumber, password, address } = req.body; // Destructure address
  const registrationCertificatePath = req.file ? req.file.path : null;

  if (!registrationCertificatePath) {
    return res.status(400).json({ message: 'Registration Certificate is required' });
  }

  try {
    let home = await ChildHomeUser.findOne({ email });
    if (home) {
      if (registrationCertificatePath) {
        fs.unlink(registrationCertificatePath, (err) => {
          if (err) console.error('Error deleting uploaded file:', err);
        });
      }
      return res.status(400).json({ message: 'Home already exists with this email' });
    }

    home = await ChildHomeUser.findOne({ registrationNumber });
    if (home) {
      if (registrationCertificatePath) {
        fs.unlink(registrationCertificatePath, (err) => {
          if (err) console.error('Error deleting uploaded file:', err);
        });
      }
      return res.status(400).json({ message: 'Home already exists with this Registration Number' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const coordinates = await getCoordinates(address); // Get coordinates

    if (!coordinates) {
      if (registrationCertificatePath) {
        fs.unlink(registrationCertificatePath, (err) => {
          if (err) console.error('Error deleting uploaded file:', err);
        });
      }
      return res.status(400).json({ message: 'Could not determine coordinates for the provided address. Please check the address and try again.' });
    }

    home = new ChildHomeUser({
      homeName,
      registrationNumber,
      registrationCertificatePath,
      email,
      phoneNumber,
      password: hashedPassword,
      address, // Save address
      latitude: coordinates.latitude, // Save latitude
      longitude: coordinates.longitude, // Save longitude
      status: 'pending', // Default status
    });

    await home.save();
    res.status(201).json({ success: true, message: 'Home application submitted successfully. Awaiting admin approval.' });
  } catch (err) {
    console.error('Error during home signup:', err); // More specific logging
    if (registrationCertificatePath) {
      fs.unlink(registrationCertificatePath, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });
    }
    res.status(500).json({ message: 'Server error during home signup.' }); // More specific error message
  }
});

// Donor Signup
app.post('/api/donor-signup', upload.single('nicPhoto'), [
  body('fullName').notEmpty().withMessage('Full Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('nicNumber').notEmpty().withMessage('NIC Number is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('phoneNumber').notEmpty().withMessage('Phone Number is required'), // Added phone number validation
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });
    }
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullName, email, password, nicNumber, address, phoneNumber } = req.body; // Destructure address and phoneNumber
  const nicPhotoPath = req.file ? req.file.path : null;

  if (!nicPhotoPath) {
    return res.status(400).json({ message: 'NIC Photo is required' });
  }

  try {
    let donor = await Donor.findOne({ email });
    if (donor) {
      if (nicPhotoPath) {
        fs.unlink(nicPhotoPath, (err) => {
          if (err) console.error('Error deleting uploaded file:', err);
        });
      }
      return res.status(400).json({ message: 'Donor already exists with this email' });
    }

    donor = await Donor.findOne({ nicNumber });
    if (donor) {
      if (nicPhotoPath) {
        fs.unlink(nicPhotoPath, (err) => {
          if (err) console.error('Error deleting uploaded file:', err);
        });
      }
      return res.status(400).json({ message: 'Donor already exists with this NIC Number' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const coordinates = await getCoordinates(address); // Get coordinates

    if (!coordinates) {
      if (nicPhotoPath) {
        fs.unlink(nicPhotoPath, (err) => {
          if (err) console.error('Error deleting uploaded file:', err);
        });
      }
      return res.status(400).json({ message: 'Could not determine coordinates for the provided address. Please check the address and try again.' });
    }

    donor = new Donor({
      fullName,
      email,
      password: hashedPassword,
      nicNumber,
      nicPhotoPath,
      address, // Save address
      phoneNumber, // Save phone number
      latitude: coordinates.latitude, // Save latitude
      longitude: coordinates.longitude, // Save longitude
      status: 'pending', // Default status
    });

    await donor.save();
    res.status(201).json({ success: true, message: 'Donor application submitted successfully. Awaiting admin approval.' });
  } catch (err) {
    console.error('Error during donor signup:', err); // More specific logging
    if (nicPhotoPath) {
      fs.unlink(nicPhotoPath, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });
    }
    res.status(500).json({ message: 'Server error during donor signup.' }); // More specific error message
  }
});

// User Signup (existing admin signup)
app.post('/api/signup', upload.single('nicPhoto'), [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // If there are validation errors, delete the uploaded file if it exists
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });
    }
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;
  const nicPhotoPath = req.file ? req.file.path : null;

  try {
    let admin = await Admin.findOne({ email });
    if (admin) {
      // If user already exists, delete the uploaded file
      if (nicPhotoPath) {
        fs.unlink(nicPhotoPath, (err) => {
          if (err) console.error('Error deleting uploaded file:', err);
        });
      }
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    admin = new Admin({
      name,
      email,
      password: hashedPassword,
      nicPhotoPath,
    });

    await admin.save();
    res.status(201).json({ success: true, message: 'Admin registered successfully' });
  } catch (err) {
    console.error(err);
    // If there's a server error, delete the uploaded file
    if (nicPhotoPath) {
      fs.unlink(nicPhotoPath, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all donors (for admin dashboard to show status)
app.get('/api/donors/all', async (req, res) => {
  try {
    const allDonors = await Donor.find({}); // Fetch all donors
    res.json(allDonors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all pending donors for admin approval (if still needed for specific views)
app.get('/api/donors/pending', async (req, res) => {
  try {
    const pendingDonors = await Donor.find({ status: 'pending' });
    res.json(pendingDonors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET a single donor by ID
app.get('/api/donors/:id', async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }
    res.json(donor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin approves a donor
app.put('/api/donors/approve/:id', async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    donor.status = 'approved';
    await donor.save();

    // Send approval email
    if (!process.env.SENDGRID_API_KEY || !process.env.SENDER_EMAIL) {
      console.error('SendGrid API Key or Sender Email is not configured. Email will not be sent.');
      return res.status(500).json({ message: 'Donor approved, but email configuration missing. Please check server .env file.' });
    }

    try {
      await transporter.sendMail({
        from: process.env.SENDER_EMAIL,
      to: donor.email,
      subject: 'Your FoodShare Donor Application Has Been Approved!',
      html: `<p>Dear ${donor.fullName},</p><p>Good news! Your FoodShare donor application has been approved. Your credentials are approved. You can now log in and start donating by visiting <a href="${process.env.CLIENT_BASE_URL}/donor-login">our donor login page</a>.</p><p>Thank you for joining us in the fight against food waste!</p><p>Sincerely,<br/>The FoodShare Team</p>`,
    });
      res.json({ success: true, message: 'Donor approved successfully and email sent.', donor });
    } catch (emailError) {
      console.error('Error sending approval email:', emailError);
      res.status(500).json({ message: 'Donor approved, but failed to send approval email. Please check server logs for details.' });
    }
  } catch (err) {
    console.error('Error approving donor:', err);
    res.status(500).json({ message: 'Server error during donor approval.' });
  }
});

// Admin rejects a donor
app.put('/api/donors/reject/:id', async (req, res) => {
  const { reason } = req.body; // Optional: reason for rejection
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    donor.status = 'rejected';
    await donor.save();

    // Send rejection email
    if (!process.env.SENDGRID_API_KEY || !process.env.SENDER_EMAIL) {
      console.error('SendGrid API Key or Sender Email is not configured. Email will not be sent.');
      return res.status(500).json({ message: 'Donor rejected, but email configuration missing. Please check server .env file.' });
    }

    try {
      await transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to: donor.email,
        subject: 'Update on Your FoodShare Donor Application',
        html: `<p>Dear ${donor.fullName},</p><p>We regret to inform you that your FoodShare donor application was declined. Your credentials have been rejected. Reason: ${reason || 'Please contact support for more details.'}</p><p>Sincerely,<br/>The FoodShare Team</p>`,
      });
      res.json({ success: true, message: 'Donor rejected successfully and email sent.', donor });
    } catch (emailError) {
      console.error('Error sending rejection email:', emailError);
      res.status(500).json({ message: 'Donor rejected, but failed to send rejection email. Please check server logs for details.' });
    }
  } catch (err) {
    console.error('Error rejecting donor:', err);
    res.status(500).json({ message: 'Server error during donor rejection.' });
  }
});

// GET all homes (for admin dashboard to show status)
app.get('/api/homes/all', async (req, res) => {
  try {
    const allHomes = await ChildHomeUser.find({}); // Fetch all homes
    res.json(allHomes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all pending homes for admin approval (if still needed for specific views)
app.get('/api/homes/pending', async (req, res) => {
  try {
    const pendingHomes = await ChildHomeUser.find({ status: 'pending' });
    res.json(pendingHomes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all approved homes for AI Matching Panel
app.get('/api/homes/approved', async (req, res) => {
  try {
    const approvedHomes = await ChildHomeUser.find({ status: 'approved' });
    res.json(approvedHomes);
  } catch (err) {
    console.error('Error fetching approved homes for AI Matching Panel:', err);
    res.status(500).json({ message: 'Server error fetching approved homes.' });
  }
});

// GET a single home by ID (for public detail page)
app.get('/api/homes/:id', async (req, res) => {
  try {
    const home = await ChildHomeUser.findById(req.params.id).select('homeName description address profilePhotoPath capacity phoneNumber email specialNeeds');
    if (!home) {
      return res.status(404).json({ message: 'Home not found' });
    }
    res.json(home);
  } catch (err) {
    console.error('Error fetching single home for public view:', err);
    res.status(500).json({ message: 'Server error fetching home details.' });
  }
});

// Admin approves a home
app.put('/api/homes/approve/:id', async (req, res) => {
  try {
    const home = await ChildHomeUser.findById(req.params.id);
    if (!home) {
      return res.status(404).json({ message: 'Home not found' });
    }

    home.status = 'approved';
    await home.save();

    // Send approval email
    if (!process.env.SENDGRID_API_KEY || !process.env.SENDER_EMAIL) {
      console.error('SendGrid API Key or Sender Email is not configured. Email will not be sent.');
      return res.status(500).json({ message: 'Home approved, but email configuration missing. Please check server .env file.' });
    }

    try {
      await transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to: home.email,
        subject: 'Your FoodShare Child Care Home Application Has Been Approved!',
        html: `<p>Dear ${home.homeName},</p><p>Good news! Your FoodShare Child Care Home application has been approved. Your credentials are approved. You can now log in and start receiving donations by visiting <a href="${process.env.CLIENT_BASE_URL}/home-login">our home login page</a>.</p><p>Thank you for joining us in the fight against food waste!</p><p>Sincerely,<br/>The FoodShare Team</p>`,
      });
      res.json({ success: true, message: 'Home approved successfully and email sent.', home });
    } catch (emailError) {
      console.error('Error sending approval email to home:', emailError);
      res.status(500).json({ message: 'Home approved, but failed to send approval email. Please check server logs for details.' });
    }
  } catch (err) {
    console.error('Error approving home:', err);
    res.status(500).json({ message: 'Server error during home approval.' });
  }
});

// Admin rejects a home
app.put('/api/homes/reject/:id', async (req, res) => {
  const { reason } = req.body; // Optional: reason for rejection
  try {
    const home = await ChildHomeUser.findById(req.params.id);
    if (!home) {
      return res.status(404).json({ message: 'Home not found' });
    }

    home.status = 'rejected';
    await home.save();

    // Send rejection email
    if (!process.env.SENDGRID_API_KEY || !process.env.SENDER_EMAIL) {
      console.error('SendGrid API Key or Sender Email is not configured. Email will not be sent.');
      return res.status(500).json({ message: 'Home rejected, but email configuration missing. Please check server .env file.' });
    }

    try {
      await transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to: home.email,
        subject: 'Update on Your FoodShare Child Care Home Application',
        html: `<p>Dear ${home.homeName},</p><p>We regret to inform you that your FoodShare Child Care Home application was declined. Your credentials have been rejected. Reason: ${reason || 'Please contact support for more details.'}</p><p>Sincerely,<br/>The FoodShare Team</p>`,
      });
      res.json({ success: true, message: 'Home rejected successfully and email sent.', home });
    } catch (emailError) {
      console.error('Error sending rejection email to home:', emailError);
      res.status(500).json({ message: 'Home rejected, but failed to send rejection email. Please check server logs for details.' });
    }
  } catch (err) {
    console.error('Error rejecting home:', err);
    res.status(500).json({ message: 'Server error during home rejection.' });
  }
});

// Donor Login
app.post('/api/donor-login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const donor = await Donor.findOne({ email });
    if (!donor) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, donor.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    if (donor.status === 'pending') {
      return res.status(403).json({ message: 'Your account is still under review. Please check your email for updates.' });
    }

    if (donor.status === 'rejected') {
      return res.status(403).json({ message: 'Your application was declined. Contact support for more details.' });
    }

    res.json({ success: true, message: 'Login successful! Redirecting to Donor Dashboard...', donor: { id: donor._id, fullName: donor.fullName, email: donor.email, status: donor.status } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Home Login
app.post('/api/home-login', [
  body('homeName').notEmpty().withMessage('Home Name is required'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { homeName, password } = req.body;

  try {
    const home = await ChildHomeUser.findOne({ homeName });
    if (!home) {
      return res.status(400).json({ message: 'Invalid home name or password.' });
    }

    const isMatch = await bcrypt.compare(password, home.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid home name or password.' });
    }

    if (home.status === 'pending') {
      return res.status(403).json({ message: 'Your account is still under review. Please check your email for updates.' });
    }

    if (home.status === 'rejected') {
      return res.status(403).json({ message: 'Your application was declined. Contact support for more details.' });
    }

    res.json({ success: true, message: 'Login successful! Redirecting to Home Dashboard...', home: { id: home._id, homeName: home.homeName, email: home.email, status: home.status } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Login (existing user login)
app.post('/api/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.json({ success: true, message: 'Logged in successfully', user: { id: admin._id, name: admin.name, email: admin.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// API Endpoints for Donations
app.post('/api/donations', upload.single('foodImage'), [ // Changed to foodImage
  body('donorId').notEmpty().withMessage('Donor ID is required'),
  body('donationType').isIn(['food', 'clothes', 'books']).withMessage('Invalid donation type'), // Added donationType validation
  body('foodType').optional().notEmpty().withMessage('Food Type is required for food donations'), // Made optional
  body('quantity').optional().isNumeric().withMessage('Quantity must be a number'), // Made optional
  body('unit').optional().notEmpty().withMessage('Unit is required'), // Made optional
  body('expiryDateTime').optional().isISO8601().withMessage('Valid expiry date and time is required for food donations'), // New validation for expiryDateTime
  body('deliveryMethod').isIn(['Donor Delivery', 'Home Pickup']).withMessage('Invalid delivery method'),
  body('preferredDeliveryDateTime').isISO8601().withMessage('Valid date and time is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });
    }
    return res.status(400).json({ errors: errors.array() });
  }

  const { donorId, donationType, foodType, quantity, unit, expiryDateTime, deliveryMethod, preferredDeliveryDateTime } = req.body;
  const foodImagePath = req.file ? req.file.path : null; // Changed to foodImagePath

  // Conditional validation for food donations
  if (donationType === 'food') {
    if (!foodType) return res.status(400).json({ message: 'Food Type is required for food donations.' });
    if (!quantity) return res.status(400).json({ message: 'Quantity is required for food donations.' });
    if (!unit) return res.status(400).json({ message: 'Unit is required for food donations.' });
    if (!expiryDateTime) return res.status(400).json({ message: 'Expiry Date & Time is required for food donations.' });
  }

  try {
    const initialStatus = (donationType === 'food') ? 'pending' : 'pending_admin_review'; // Set status based on donationType

    const newDonation = new Donation({
      donorId,
      donationType,
      foodType: (donationType === 'food') ? foodType : undefined, // Only store foodType for food donations
      quantity: (donationType === 'food') ? quantity : undefined, // Only store quantity for food donations
      unit: (donationType === 'food') ? unit : undefined, // Only store unit for food donations
      foodImagePath, // Changed to foodImagePath
      expiryDateTime: (donationType === 'food') ? expiryDateTime : undefined, // Only store expiryDateTime for food donations
      deliveryMethod,
      preferredDeliveryDateTime,
      status: initialStatus,
      matchedHomeId: (donationType === 'food') ? undefined : undefined, // Only matched for food donations after AI
    });

    await newDonation.save();
    res.status(201).json({ success: true, message: 'Your donation has been submitted for approval. You will be notified once matched.', donation: newDonation });
  } catch (err) {
    console.error('Error creating donation:', err);
    if (foodImagePath) {
      fs.unlink(foodImagePath, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });
    }
    res.status(500).json({ message: 'Server error during donation creation.' });
  }
});

// GET all pending non-food donations for admin review
app.get('/api/admin/non-food-donations/pending', async (req, res) => {
  try {
    const pendingNonFoodDonations = await Donation.find({ status: 'pending_admin_review', donationType: { $ne: 'food' } })
      .populate('donorId', 'fullName email phoneNumber address');
    res.json(pendingNonFoodDonations);
  } catch (err) {
    console.error('Error fetching pending non-food donations for admin:', err);
    res.status(500).json({ message: 'Server error fetching non-food donations.' });
  }
});

// New API Endpoint for Nearest Homes
app.get('/api/admin/homes/nearest/:donorId', async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.donorId);
    if (!donor || !donor.latitude || !donor.longitude) {
      return res.status(404).json({ message: 'Donor not found or donor coordinates unavailable.' });
    }

    const donorCoords = { latitude: donor.latitude, longitude: donor.longitude };

    const approvedHomes = await ChildHomeUser.find({ status: 'approved' });

    const homesWithDistance = approvedHomes.map(home => {
      if (home.latitude && home.longitude) {
        const homeCoords = { latitude: home.latitude, longitude: home.longitude };
        const distance = haversineDistance(donorCoords, homeCoords);
        return {
          _id: home._id,
          homeName: home.homeName,
          address: home.address,
          phoneNumber: home.phoneNumber,
          distance: parseFloat(distance.toFixed(2)), // Round to 2 decimal places
        };
      }
      return null;
    }).filter(home => home !== null); // Filter out homes without coordinates

    // Sort homes by distance
    homesWithDistance.sort((a, b) => a.distance - b.distance);

    res.json(homesWithDistance);
  } catch (err) {
    console.error('Error fetching nearest homes:', err);
    res.status(500).json({ message: 'Server error fetching nearest homes.' });
  }
});

// Admin approves a non-food donation
app.put('/api/admin/non-food-donations/approve/:id', async (req, res) => {
  const { matchedHomeId } = req.body; // Accept optional matchedHomeId
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.status !== 'pending_admin_review') {
      return res.status(400).json({ message: 'Donation is not in pending admin review status.' });
    }

    donation.status = 'approved';
    donation.updatedAt = Date.now();

    let notificationMessage = `Your ${donation.donationType} donation has been approved by the admin!`;
    let notificationDetails = { donationId: donation._id, donationType: donation.donationType };

    if (matchedHomeId) {
      const matchedHome = await ChildHomeUser.findById(matchedHomeId);
      if (!matchedHome) {
        return res.status(404).json({ message: 'Matched home not found.' });
      }
      donation.matchedHomeId = matchedHomeId;
      donation.status = 'matched'; // Set status to 'matched' if a home is selected
      notificationMessage += ` It has been matched with ${matchedHome.homeName} (Address: ${matchedHome.address}, Phone: ${matchedHome.phoneNumber}).`;
      notificationDetails.matchedHome = {
        id: matchedHome._id,
        homeName: matchedHome.homeName,
        address: matchedHome.address,
        phoneNumber: matchedHome.phoneNumber,
      };

      // Also notify the matched home
      const donor = await Donor.findById(donation.donorId); // Fetch donor details
      if (donor) {
        await Notification.create({
          userId: matchedHome._id,
          userModel: 'ChildHomeUser',
          type: 'new_non_food_donation_match',
          message: `New Donation Request from ${donor.fullName}`,
          details: {
            donationId: donation._id,
            donationDescription: donation.donationType, // Using donationType as description for non-food
            donorName: donor.fullName,
            donorAddress: donor.address,
            donorPhoneNumber: donor.phoneNumber,
            deliveryDateTime: donation.preferredDeliveryDateTime,
          },
        });
      } else {
        console.warn('Donor not found for non-food donation notification to home.');
        await Notification.create({
          userId: matchedHome._id,
          userModel: 'ChildHomeUser',
          type: 'new_non_food_donation_match',
          message: `New Donation Request from a donor`,
          details: {
            donationId: donation._id,
            donationDescription: donation.donationType,
            deliveryDateTime: donation.preferredDeliveryDateTime
          },
        });
      }
    } else {
      notificationMessage += ` We will notify you when a home is ready to receive it.`;
    }

    await donation.save();

    // Notify donor of approval
    const donor = await Donor.findById(donation.donorId);
    if (donor) {
      await Notification.create({
        userId: donor._id,
        userModel: 'Donor',
        type: 'non_food_donation_approved',
        message: notificationMessage,
        details: notificationDetails,
      });
    }

    res.json({ success: true, message: 'Non-food donation approved successfully.', donation });
  } catch (err) {
    console.error('Error approving non-food donation:', err);
    res.status(500).json({ message: 'Server error approving non-food donation.' });
  }
});

// Admin rejects a non-food donation
app.put('/api/admin/non-food-donations/reject/:id', async (req, res) => {
  const { reason } = req.body;
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.status !== 'pending_admin_review') {
      return res.status(400).json({ message: 'Donation is not in pending admin review status.' });
    }

    donation.status = 'rejected';
    donation.rejectionReason = reason;
    donation.updatedAt = Date.now();
    await donation.save();

    // Notify donor of rejection
    const donor = await Donor.findById(donation.donorId);
    if (donor) {
      await Notification.create({
        userId: donor._id,
        userModel: 'Donor',
        type: 'non_food_donation_rejected',
        message: `Your ${donation.donationType} donation was rejected by the admin. Reason: ${reason || 'No reason provided.'}`,
        details: { donationId: donation._id, donationType: donation.donationType, reason },
      });
    }

    res.json({ success: true, message: 'Non-food donation rejected successfully.', donation });
  } catch (err) {
    console.error('Error rejecting non-food donation:', err);
    res.status(500).json({ message: 'Server error rejecting non-food donation.' });
  }
});

// GET all pending donations for admin AI Matching Panel (moved before :id route)
app.get('/api/donations/pending', async (req, res) => {
  console.log('[Server] Attempting to fetch pending donations...');
  try {
    // Restore populate for pending donations, as the fields exist in DonorSchema
    const pendingDonations = await Donation.find({ status: 'pending' })
      .populate('donorId', 'fullName email latitude longitude')
      .select('foodType quantity unit description pickupLocation status createdAt foodImagePath'); // Explicitly select foodImagePath
    console.log(`[Server] Successfully fetched ${pendingDonations.length} pending donations.`);
    res.json(pendingDonations);
  } catch (err) {
    console.error('[Server] Detailed error fetching pending donations for admin:', err);
    res.status(500).json({ message: 'Server error fetching pending donations.' });
  }
});

// GET all food deliveries for admin delivery tracker
app.get('/api/admin/food-deliveries', async (req, res) => {
  try {
    const foodDeliveries = await Donation.find({ donationType: 'food', status: { $in: ['approved', 'matched', 'wait for home approval', 'completed'] } })
      .populate('donorId', 'fullName')
      .populate('matchedHomeId', 'homeName');
    res.json(foodDeliveries);
  } catch (err) {
    console.error('Error fetching food deliveries for admin:', err);
    res.status(500).json({ message: 'Server error fetching food deliveries.' });
  }
});

// GET a single donation by ID
app.get('/api/donations/:id', async (req, res) => {
  try {
    // Now that phoneNumber is in DonorSchema, populate it
    const donation = await Donation.findById(req.params.id).populate('donorId', 'fullName address phoneNumber');
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    res.json(donation);
  } catch (err) {
    console.error('Error fetching single donation:', err);
    res.status(500).json({ message: 'Server error fetching donation.' });
  }
});

app.get('/api/donations/donor/:donorId', async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: req.params.donorId }).sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    console.error('Error fetching donor donations:', err);
    res.status(500).json({ message: 'Server error fetching donations.' });
  }
});

app.get('/api/donations/summary/:donorId', async (req, res) => {
  try {
    const donorId = req.params.donorId;
    const totalDonationsMade = await Donation.countDocuments({ donorId });
    const activeDonations = await Donation.countDocuments({ donorId, status: { $in: ['pending', 'approved', 'matched', 'wait for home approval'] } });
    const pendingMatches = await Donation.countDocuments({ donorId, status: 'pending' });
    const successfulMatches = await Donation.countDocuments({ donorId, status: 'completed' });

    res.json({
      totalDonationsMade,
      activeDonations,
      pendingMatches,
      successfulMatches,
    });
  } catch (err) {
    console.error('Error fetching donation summary:', err);
    res.status(500).json({ message: 'Server error fetching donation summary.' });
  }
});

// Get home dashboard summary data
app.get('/api/home/donations/summary', async (req, res) => {
  try {
    const homeId = req.query.homeId;
    if (!homeId) {
      return res.status(400).json({ message: 'Home ID is required for summary.' });
    }

    const totalDonations = await Donation.countDocuments({ matchedHomeId: homeId });
    const activeDonations = await Donation.countDocuments({ matchedHomeId: homeId, status: 'wait for home approval' });
    const now = new Date();
    const upcomingDeliveries = await Donation.countDocuments({
      matchedHomeId: homeId,
      status: { $in: ['wait for home approval', 'completed'] },
      preferredDeliveryDateTime: { $gte: now }
    });
    const completedDeliveries = await Donation.countDocuments({ matchedHomeId: homeId, status: 'completed' });

    res.json({
      totalDonations,
      activeDonations,
      upcomingDeliveries,
      completedDeliveries,
    });
  } catch (err) {
    console.error('Error fetching home donation summary:', err);
    res.status(500).json({ message: 'Server error fetching home donation summary.' });
  }
});

app.put('/api/donations/:id/select-home', async (req, res) => {
  try {
    const { matchedHomeId } = req.body;
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    // Allow matching if the donation is pending or already matched (in case of re-matching)
    if (donation.status !== 'pending' && donation.status !== 'matched') {
      return res.status(400).json({ message: `Donation is in "${donation.status}" state and cannot be matched with a home.` });
    }

    donation.matchedHomeId = matchedHomeId;
    donation.status = 'wait for home approval'; // Transition to 'wait for home approval' after admin confirms
    donation.updatedAt = Date.now();
    await donation.save();

    // Fetch donor and home details for notifications
    const donor = await Donor.findById(donation.donorId); // phoneNumber is now part of DonorSchema
    const home = await ChildHomeUser.findById(matchedHomeId);

    if (donor && home) { // Ensure both donor and home exist before creating notifications
      await Notification.create({
        userId: donor._id,
        userModel: 'Donor',
        type: 'donation_matched',
        message: `Your donation of ${donation.quantity} ${donation.unit} of ${donation.foodType} has been matched with ${home.homeName} (Address: ${home.address}, Phone: ${home.phoneNumber}) and is awaiting their approval.`,
        details: { 
          donationId: donation._id, 
          homeName: home.homeName, 
          homeAddress: home.address, 
          homePhoneNumber: home.phoneNumber 
        },
      });

      await Notification.create({
        userId: home._id,
        userModel: 'ChildHomeUser',
        type: 'new_donation_request',
        message: `A new donation of ${donation.quantity} ${donation.unit} of ${donation.foodType} from ${donor.fullName} (Address: ${donor.address}, Phone: ${donor.phoneNumber}) is awaiting your approval.`,
        details: { 
          donationId: donation._id, 
          donorName: donor.fullName, 
          donorAddress: donor.address,
          donorPhoneNumber: donor.phoneNumber // Added donor phone number to details
        },
      });
    } else {
      console.warn('Could not create notifications: Donor or Home details missing after match confirmation.');
    }

    res.json({ success: true, message: 'Home selected for donation. Waiting for home approval.', donation });
  } catch (err) {
    console.error('Error selecting home for donation:', err);
    res.status(500).json({ message: 'Server error during home selection.' });
  }
});

app.put('/api/donations/:id/update-status', async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Validate status transition if necessary
    const validStatuses = ['pending', 'approved', 'matched', 'wait for home approval', 'completed', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided.' });
    }

    donation.status = status;
    if (status === 'rejected') {
      donation.rejectionReason = rejectionReason;
    } else {
      donation.rejectionReason = undefined; // Clear rejection reason if not rejected
    }
    donation.updatedAt = Date.now();
    await donation.save();

    // TODO: Implement notification logic based on status change (e.g., notify donor when approved/matched/completed/rejected)

    res.json({ success: true, message: `Donation status updated to ${status}.`, donation });
  } catch (err) {
    console.error('Error updating donation status:', err);
    res.status(500).json({ message: 'Server error during donation status update.' });
  }
});

// API Endpoints for Notifications
app.get('/api/notifications/donor/:donorId', async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.params.donorId, userModel: 'Donor' }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error('Error fetching donor notifications:', err);
    res.status(500).json({ message: 'Server error fetching notifications.' });
  }
});

app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    notification.isRead = true;
    await notification.save();
    res.json({ success: true, message: 'Notification marked as read.', notification });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ message: 'Server error marking notification as read.' });
  }
});

// API Endpoints for Donor Profile Management
app.put('/api/donors/profile/:id', [
  body('fullName').optional().notEmpty().withMessage('Full Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('nicNumber').optional().notEmpty().withMessage('NIC Number cannot be empty'),
  body('address').optional().notEmpty().withMessage('Address cannot be empty'),
  body('phoneNumber').optional().notEmpty().withMessage('Phone Number cannot be empty'), // Added phone number validation
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    const { fullName, email, nicNumber, address, phoneNumber } = req.body; // Destructure address and phoneNumber

    if (email && email !== donor.email) {
      const existingDonor = await Donor.findOne({ email });
      if (existingDonor) {
        return res.status(400).json({ message: 'Email already in use by another donor.' });
      }
    }
    if (nicNumber && nicNumber !== donor.nicNumber) {
      const existingDonor = await Donor.findOne({ nicNumber });
      if (existingDonor) {
        return res.status(400).json({ message: 'NIC Number already in use by another donor.' });
      }
    }

    donor.fullName = fullName || donor.fullName;
    donor.email = email || donor.email;
    donor.nicNumber = nicNumber || donor.nicNumber;
    donor.phoneNumber = phoneNumber || donor.phoneNumber; // Update phone number
    
    if (address && address !== donor.address) {
      const coordinates = await getCoordinates(address);
      donor.address = address;
      donor.latitude = coordinates ? coordinates.latitude : null;
      donor.longitude = coordinates ? coordinates.longitude : null;
    }

    await donor.save();
    res.json({ success: true, message: 'Donor profile updated successfully.', donor });
  } catch (err) {
    console.error('Error updating donor profile:', err);
    res.status(500).json({ message: 'Server error updating profile.' });
  }
});

app.put('/api/donors/change-password/:id', [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    const { currentPassword, newPassword } = req.body;

    const isMatch = await bcrypt.compare(currentPassword, donor.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid current password.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    donor.password = hashedPassword;
    await donor.save();

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    console.error('Error changing donor password:', err);
    res.status(500).json({ message: 'Server error changing password.' });
  }
});

// API Endpoints for Home Dashboard
// Get donations for a specific home
app.get('/api/home/donations', async (req, res) => {
  try {
    // In a real application, you'd get the homeId from authentication (e.g., JWT token)
    // For now, let's assume homeId is passed as a query parameter or from a placeholder
    const homeId = req.query.homeId || '65f7a1d2e3f4a5b6c7d8e9f0'; // Placeholder homeId
    const donations = await Donation.find({ matchedHomeId: homeId }).populate('donorId', 'fullName email').sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    console.error('Error fetching home donations:', err);
    res.status(500).json({ message: 'Server error fetching donations.' });
  }
});

// Home accepts a donation
app.post('/api/home/donations/:id/accept', async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    donation.status = 'completed'; // Or 'Home is approved' as per task, but 'completed' seems more logical for final state
    donation.updatedAt = Date.now();
    await donation.save();

    // Notify donor that their donation has been accepted by the home
    const donor = await Donor.findById(donation.donorId);
    if (donor) {
      const home = await ChildHomeUser.findById(donation.matchedHomeId);
      await Notification.create({
        userId: donor._id,
        userModel: 'Donor',
        type: 'donation_accepted',
        message: `Your donation of ${donation.quantity} ${donation.unit} of ${donation.foodType} has been accepted by ${home ? home.homeName : 'a child care home'}!`,
        details: { donationId: donation._id, homeName: home ? home.homeName : 'N/A' },
      });
    }

    res.json({ success: true, message: 'Donation accepted successfully.', donation });
  } catch (err) {
    console.error('Error accepting donation:', err);
    res.status(500).json({ message: 'Server error accepting donation.' });
  }
});

// Home rejects a donation
app.post('/api/home/donations/:id/reject', async (req, res) => {
  const { reason } = req.body;
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    donation.status = 'rejected';
    donation.rejectionReason = reason;
    donation.matchedHomeId = undefined; // Unmatch the donation
    donation.updatedAt = Date.now();
    await donation.save();

    // Notify donor that their donation has been rejected by the home
    const donor = await Donor.findById(donation.donorId);
    if (donor) {
      const home = await ChildHomeUser.findById(donation.matchedHomeId); // matchedHomeId is undefined now, so this will be null
      await Notification.create({
        userId: donor._id,
        userModel: 'Donor',
        type: 'donation_rejected',
        message: `Your donation of ${donation.quantity} ${donation.unit} of ${donation.foodType} was rejected by a child care home. Reason: ${reason || 'No reason provided.'}`,
        details: { donationId: donation._id, reason },
      });
    }

    res.json({ success: true, message: 'Donation rejected successfully.', donation });
  } catch (err) {
    console.error('Error rejecting donation:', err);
    res.status(500).json({ message: 'Server error rejecting donation.' });
  }
});

// Get upcoming deliveries for a specific home
app.get('/api/home/upcoming-deliveries', async (req, res) => {
  try {
    const homeId = req.query.homeId || '65f7a1d2e3f4a5b6c7d8e9f0'; // Placeholder homeId
    const now = new Date();
    const upcoming = await Donation.find({
      matchedHomeId: homeId,
      status: { $in: ['wait for home approval', 'completed'] }, // Assuming 'completed' means delivered
      preferredDeliveryDateTime: { $gte: now }
    }).populate('donorId', 'fullName email phoneNumber').sort({ preferredDeliveryDateTime: 1 });
    res.json(upcoming);
  } catch (err) {
    console.error('Error fetching upcoming deliveries:', err);
    res.status(500).json({ message: 'Server error fetching upcoming deliveries.' });
  }
});

// Get notifications for a specific home
app.get('/api/home/notifications', async (req, res) => {
  try {
    const homeId = req.query.homeId || '65f7a1d2e3f4a5b6c7d8e9f0'; // Placeholder homeId
    const notifications = await Notification.find({ userId: homeId, userModel: 'ChildHomeUser' }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error('Error fetching home notifications:', err);
    res.status(500).json({ message: 'Server error fetching notifications.' });
  }
});

// Mark home notification as read
app.post('/api/home/notifications/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    notification.isRead = true;
    await notification.save();
    res.json({ success: true, message: 'Notification marked as read.', notification });
  } catch (err) {
    console.error('Error marking home notification as read:', err);
    res.status(500).json({ message: 'Server error marking notification as read.' });
  }
});

// Mark home notification as unread
app.post('/api/home/notifications/:id/unread', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    notification.isRead = false;
    await notification.save();
    res.json({ success: true, message: 'Notification marked as unread.', notification });
  } catch (err) {
    console.error('Error marking home notification as unread:', err);
    res.status(500).json({ message: 'Server error marking notification as unread.' });
  }
});

// Get home profile by ID
app.get('/api/home/profile/:id', async (req, res) => {
  try {
    const home = await ChildHomeUser.findById(req.params.id);
    if (!home) {
      return res.status(404).json({ message: 'Home not found' });
    }
    res.json({
      homeName: home.homeName,
      capacity: home.capacity, // Assuming capacity field exists in ChildHomeUserSchema
      address: home.address, // Assuming address field exists
      contactPerson: home.contactPerson, // Assuming contactPerson field exists
      phoneNumber: home.phoneNumber,
      uniqueId: home._id, // Using _id as uniqueId
      profilePhoto: home.profilePhotoPath, // Include profile photo path
    });
  } catch (err) {
    console.error('Error fetching home profile:', err);
    res.status(500).json({ message: 'Server error fetching home profile.' });
  }
});

// Update home profile
app.put('/api/home/profile/:id', upload.single('profilePhoto'), [ // Add upload.single for profile photo
  body('homeName').optional().notEmpty().withMessage('Home Name cannot be empty'),
  body('capacity').optional().isNumeric().withMessage('Capacity must be a number'),
  body('address').optional().notEmpty().withMessage('Address cannot be empty'),
  body('contactPerson').optional().notEmpty().withMessage('Contact Person cannot be empty'),
  body('phoneNumber').optional().notEmpty().withMessage('Phone Number cannot be empty'),
  body('specialNeeds').optional().isString(), // New validation for specialNeeds
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });
    }
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const home = await ChildHomeUser.findById(req.params.id);
    if (!home) {
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error deleting uploaded file:', err);
        });
      }
      return res.status(404).json({ message: 'Home not found' });
    }

    const { homeName, capacity, address, contactPerson, phoneNumber, specialNeeds } = req.body; // Destructure specialNeeds
    const profilePhotoPath = req.file ? req.file.path : null;

    if (homeName && homeName !== home.homeName) {
      const existingHome = await ChildHomeUser.findOne({ homeName });
      if (existingHome) {
        if (profilePhotoPath) {
          fs.unlink(profilePhotoPath, (err) => {
            if (err) console.error('Error deleting uploaded file:', err);
          });
        }
        return res.status(400).json({ message: 'Home Name already in use by another home.' });
      }
    }

    home.homeName = homeName || home.homeName;
    home.capacity = capacity || home.capacity;
    home.contactPerson = contactPerson || home.contactPerson;
    home.phoneNumber = phoneNumber || home.phoneNumber;
    home.specialNeeds = specialNeeds || home.specialNeeds; // Update specialNeeds

    if (address && address !== home.address) {
      const coordinates = await getCoordinates(address);
      home.address = address;
      home.latitude = coordinates ? coordinates.latitude : null;
      home.longitude = coordinates ? coordinates.longitude : null;
    }

    if (profilePhotoPath) {
      // If an old profile photo exists, delete it
      if (home.profilePhotoPath && fs.existsSync(home.profilePhotoPath)) {
        fs.unlink(home.profilePhotoPath, (err) => {
          if (err) console.error('Error deleting old profile photo:', err);
        });
      }
      home.profilePhotoPath = profilePhotoPath;
    }

    await home.save();
    res.json({ success: true, message: 'Home profile updated successfully.', profilePhoto: home.profilePhotoPath, home: home });
  } catch (err) {
    console.error('Error updating home profile:', err);
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });
    }
    res.status(500).json({ message: 'Server error updating home profile.' });
  }
});

// Change home password
app.post('/api/home/profile/:id/change-password', [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const home = await ChildHomeUser.findById(req.params.id);
    if (!home) {
      return res.status(404).json({ message: 'Home not found' });
    }

    const { currentPassword, newPassword } = req.body;

    const isMatch = await bcrypt.compare(currentPassword, home.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid current password.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    home.password = hashedPassword;
    await home.save();

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    console.error('Error changing home password:', err);
    res.status(500).json({ message: 'Server error changing password.' });
  }
});

// API Endpoint for Feedback
app.post('/api/feedback', [
  body('homeId').notEmpty().withMessage('Home ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isString(),
  body('feedbackType').isIn(['donor_experience', 'food_quality']).withMessage('Invalid feedback type'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { homeId, rating, comment, feedbackType } = req.body;
  let sentiment = 'neutral'; // Default sentiment

  if (comment) {
    try {
      const hfResponse = await axios.post(
        'https://router.huggingface.co/hf-inference/models/distilbert/distilbert-base-uncased-finetuned-sst-2-english',
        { inputs: comment },
        {
          headers: {
            'Authorization': `Bearer ${process.env.HF_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (hfResponse.data && hfResponse.data.length > 0) {
        const scores = hfResponse.data[0];
        const positiveScore = scores.find(s => s.label === 'POSITIVE')?.score || 0;
        const negativeScore = scores.find(s => s.label === 'NEGATIVE')?.score || 0;

        if (positiveScore > negativeScore) {
          sentiment = 'positive';
        } else if (negativeScore > positiveScore) {
          sentiment = 'negative';
        } else {
          sentiment = 'neutral';
        }
      }
    } catch (hfError) {
      console.error('Error during Hugging Face sentiment analysis:', hfError.message);
      if (hfError.response) {
        console.error('Hugging Face API response error:', hfError.response.status, hfError.response.data);
      }
      // Continue with default 'neutral' sentiment if API call fails
    }
  }

  try {
    const newFeedback = new Feedback({
      homeId,
      rating,
      comment,
      feedbackType,
      sentiment, // Store the determined sentiment
    });

    await newFeedback.save();
    res.status(201).json({ success: true, message: 'Feedback submitted successfully.', feedback: newFeedback });
  } catch (err) {
    console.error('Error submitting feedback:', err);
    res.status(500).json({ message: 'Server error submitting feedback.' });
  }
});

// API Endpoint to get all feedback for admin dashboard
app.get('/api/admin/feedback-reports', async (req, res) => {
  try {
    const feedbackReports = await Feedback.find().populate('homeId', 'homeName'); // Populate homeName from ChildHomeUser
    res.json(feedbackReports);
  } catch (err) {
    console.error('Error fetching feedback reports for admin:', err);
    res.status(500).json({ message: 'Server error fetching feedback reports.' });
  }
});

// New API Endpoint for Recent Activity in Admin Dashboard
app.get('/api/admin/recent-activity', async (req, res) => {
  try {
    // Fetch recent donations, populate donor details
    const recentDonations = await Donation.find({})
      .sort({ createdAt: -1 }) // Sort by most recent
      .limit(10) // Limit to 10 recent activities
      .populate('donorId', 'fullName') // Populate donor's full name
      .select('createdAt donorId donationType status'); // Select relevant fields

    const formattedActivity = recentDonations.map(donation => ({
      date: new Date(donation.createdAt).toLocaleDateString(),
      donorName: donation.donorId ? donation.donorId.fullName : 'N/A',
      donationType: donation.donationType,
      status: donation.status,
    }));

    res.json(formattedActivity);
  } catch (err) {
    console.error('Error fetching recent activity for admin dashboard:', err);
    res.status(500).json({ message: 'Server error fetching recent activity.' });
  }
});

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
