const express = require('express');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();

// Models Imports
const City = require('../models/City');
const Vehicle = require('../models/Vehicle');
const Route = require('../models/Route');

// Function to get road distance between two cities using the Google Maps API
const getDistance = async (startCity, endCity) => {
  const origin = `${startCity.y},${startCity.x}`;
  const destination = `${endCity.y},${endCity.x}`;
  const apiKey = process.env.MAPBOX_API_KEY; // Replace with your actual Mapbox API key

  if (!origin || !destination) {
    console.error('Invalid coordinates');
    return;
  }

  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin};${destination}?access_token=${apiKey}&geometries=geojson&steps=false&alternatives=true`;

  try {
    const response = await axios.get(url);

    // Check if routes exist in the response
    if (response.data.routes && response.data.routes.length > 0) {
      const distance = response.data.routes[0].legs[0].distance / 1000; // Convert meters to kilometers
      return distance;
    } else {
      console.error('Invalid response or no route found');
      return null;
    }
  } catch (error) {
    console.error('Error fetching distance:', error);
    return null;
  }
};

// Main function to calculate total cost considering distance, vehicle, load, and time in minutes
const calculateCost = async (startCity, endCity, vehicle, load) => {
  // Get the road distance between the cities
  const distance = await getDistance(startCity, endCity);
  if (!distance) return null;  // Handle error if distance couldn't be calculated

  // Calculate basic costs (fuel and maintenance)
  const fuelEfficiency = vehicle.fuelEfficiency;
  const fuelPrice = vehicle.fuelPrice;
  const maintenanceCostPerKm = vehicle.maintenanceCostPerKm;

  // Fuel cost (based on distance and vehicle fuel efficiency)
  const fuelCost = (distance / fuelEfficiency) * fuelPrice;

  // Maintenance cost (based on distance traveled)
  const maintenanceCost = distance * maintenanceCostPerKm;

  // Calculate the time it takes for the route (in hours)
  const timeInHours = distance / vehicle.speed;  // Time = Distance / Speed (in hours)

  // Convert time from hours to minutes
  const timeInMinutes = timeInHours * 60;  // Convert to minutes

  const timeCost = timeInHours * vehicle.timeCostPerHour;  // Cost per hour of transport

  // Calculate total cost (fuel, maintenance, and time-based cost)
  const totalCost = fuelCost + maintenanceCost + timeCost;

  // Return both the total cost and time in minutes
  return {
    totalCost,
    timeInMinutes
  };
};

router.post('/city', async (req, res) => {
  const { name, x, y } = req.body;

  const newCity = new City({
    name,
    x,
    y
  });

  await newCity.save()

  res.status(200).json({ message: "Successfully created: ", newCity })
});

router.post('/vehicle', async (req, res) => {
  const { type, speed, capacity, fuelCost, fuelEfficiency, maintenanceCostPerKm, timeCostPerHour } = req.body;

  console.log('Received vehicle data:', req.body); // Add this line to log the incoming data

  try {
      const newVehicle = new Vehicle({
          type,
          speed,
          capacity,
          fuelCost,
          fuelEfficiency,
          maintenanceCostPerKm,
          timeCostPerHour
      });

      await newVehicle.save();

      return res.status(201).json({ message: 'Vehicle created successfully', vehicle: newVehicle });
  } catch (err) {
      console.error('Error saving vehicle:', err);
      return res.status(500).json({ error: 'Failed to create vehicle', details: err.message });
  }
});

const formatTime = (timeInMinutes) => {
  const hours = Math.floor(timeInMinutes / 60); // Calculate whole hours
  const minutes = Math.floor(timeInMinutes % 60); // Get remaining minutes
  const seconds = Math.round((timeInMinutes - Math.floor(timeInMinutes)) * 60); // Get remaining seconds

  let result = '';
  if (hours > 0) result += `${hours} hours `;
  if (minutes > 0 || hours > 0) result += `${minutes} minutes `;
  result += `${seconds} seconds`;

  return result.trim();
};

const calculateRevenue = (distance, load, vehicle, totalCost) => {
  if (!distance || !load || !vehicle || !vehicle.capacity) {
      console.error("Invalid inputs for revenue calculation", { distance, load, vehicle });
      return NaN;
  }

  const basePricePerKm = 5; // Example base price
  const loadFactor = load / vehicle.capacity;

  // Ensure loadFactor is within valid range
  if (loadFactor < 0 || loadFactor > 1) {
      console.error("Invalid load factor", { loadFactor });
      return NaN;
  }

  return (basePricePerKm * distance * loadFactor) - totalCost;
};

// Route creation endpoint
router.post('/route', async (req, res) => {
  console.log("Request body:", req.body)
  const { startCityId, endCityId, vehicleId } = req.body;

  try {
    const startCity = await City.findById(startCityId);
    const endCity = await City.findById(endCityId);
    const vehicle = await Vehicle.findById(vehicleId);

    const load = vehicle.regularLoad;

    if (!startCity || !endCity || !vehicle) {
      return res.status(400).json({ error: "Invalid city or vehicle ID" });
    }

    // Get the distance from Mapbox
    const distance = await getDistance(startCity, endCity);
    if (!distance) {
      return res.status(500).json({ error: "Unable to calculate distance" });
    }

    // Use the refined cost calculation function
    const { totalCost, timeInMinutes } = await calculateCost(startCity, endCity, vehicle, load);

    const formattedTime = formatTime(timeInMinutes);
    const revenue = calculateRevenue(distance, load, vehicle, totalCost || distance * vehicle.fuelCost);

    const newRoute = new Route({
      startCity: startCity._id,
      endCity: endCity._id,
      vehicle: vehicle._id,
      distance,
      cost: totalCost || distance * vehicle.fuelCost,  // Fallback to basic calculation if full cost fails
      timeInMinutes: formattedTime,  // Add time taken to the route data
      revenue
    });

    await newRoute.save();

    res.redirect('/game');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create route", details: err.message });
  }
});

module.exports = router;
