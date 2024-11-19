const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ["Truck", "Train"]
    },
    speed: {
        type: Number,
        required: true
    },
    capacity: {
        type: Number,
        required: true
    },
    fuelCost: {
        type: Number,
        required: true
    },
    fuelEfficiency: {
        type: Number,
        required: true,  // Fuel efficiency (e.g., km per liter)
    },
    maintenanceCostPerKm: {
        type: Number,
        required: true,  // Maintenance cost per kilometer
    },
    timeCostPerHour: {
        type: Number,
        required: true,  // Time-based cost per hour of travel
    },
    regularLoad: {
        type: Number,
        required: true
    }
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;
