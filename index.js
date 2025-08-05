const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcrypt');
const twilio = require('twilio');

const app = express();

const corsOptions = {
  origin: 'http://127.0.0.1:5500',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/women_protection', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB', err);
});

const userSchema = new mongoose.Schema({
  name: String,
  password: String,
  contacts: [String],
  relations: [String],
  address: String
});

const User = mongoose.model('User', userSchema);

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token required' });

  jwt.verify(token, 'your_jwt_secret_key', (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = decoded;
    next();
  });
};

app.post('/register', async (req, res) => {
  const { name, password, contacts, relations, address } = req.body;

  if (!name || !password || !contacts || !relations || !address) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ name, password: hashedPassword, contacts, relations, address });

  try {
    await user.save();
    res.json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error saving user:', err);
    res.status(500).json({ message: 'Failed to register user', error: err.message });
  }
});


app.post('/login', async (req, res) => {
  const { name, password } = req.body;
  const user = await User.findOne({ name });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Incorrect password' });
  }

  const token = jwt.sign({ userId: user._id }, 'your_jwt_secret_key');
  res.json({ message: 'Login successful', token, user });
});

app.post('/send_alert', authenticateToken, async (req, res) => {
  const { locationLink } = req.body;
  const user = await User.findById(req.user.userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const accountSid = ' AC3d47d6c837a3d738bfb8e9e5efc835fe';
  const authToken = 'dcd700823ec32e0e2bc8dd9b3600aeb0';
  const client = twilio(accountSid, authToken);

  try {
    const promises = user.contacts.map(contact =>
      client.messages.create({
        body: Emergency `alert! Check location: ${locationLink}`,
        from: '+15072600919',
        to: contact
      })
    );
    await Promise.all(promises);
    res.json({ message: 'Emergency alert sent successfully' });
  } catch (err) {
    console.error('Error sending alert:', err);
    res.status(500).json({ message: 'Failed to send alert', error: err.message });
  }
});


app.listen(5000, () => {
  console.log('Server is running on http://localhost:5000');
});