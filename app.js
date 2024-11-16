const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Ejs as view engine and use ejs layouts
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(expressLayouts);
app.set('layout', 'layouts/layout');

// Middleware to serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse Json responses
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import the models so that they can be used in routes
const City = require('./models/City');
const Vehicle = require('./models/Vehicle');
const Route = require('./models/Route');

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error(err));

// Routes
app.get('/', (req, res) => {
  res.render('index', { title: "Home" }); // Render the start page
});

// Routes Import
app.use('/create', require('./routes/create'));
app.use('/game', require('./routes/game'));

// Start the server
app.listen(3000, () => console.log('Server running on port 3000'));
