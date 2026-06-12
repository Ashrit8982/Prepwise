require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/practice', require('./routes/practice'));
app.use('/api/mocktests', require('./routes/mocktests'));
app.use('/api/dashboard', require('./routes/dashboard'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'PrepWise API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
