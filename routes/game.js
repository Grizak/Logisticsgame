const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const City = require('../models/City');
const Route = require('../models/Route');

// Route to fetch and display vehicles
router.get('/vehicles', async (req, res) => {
    try {
        // Fetch all vehicles from the database
        const vehicles = await Vehicle.find();

        // Render the view with the fetched data
        res.render('vehicles', { vehicles, title: "Vehicles" });
    } catch (err) {
        console.error('Error fetching vehicles:', err);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/', async (req, res) => {
  const cities = await City.find();
  const vehicles = await Vehicle.find();
  const routes = await Route
    .find()
    .populate('startCity')
    .populate('endCity')
    .populate('vehicle');

  res.render('dashboard', { title: "Dashboard", cities, vehicles, routes })
});

module.exports = router;
