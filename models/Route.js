const mongoose = require('mongoose');

// Route schema
const routeSchema = new mongoose.Schema({
    startCity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City', // Reference to the City model
        required: true
    },
    endCity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City', // Reference to the City model
        required: true
    },
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle', // Reference to the Vehicle model
        required: true
    },
    distance: {
        type: Number,
        required: true
    },
    cost: {
        type: Number,
        required: true
    },
    timeInMinutes: {
        type: String,
        required: true
    },
    revenue: {
        type: Number,
        required: true
    }
});

const Route = mongoose.model('Route', routeSchema);

module.exports = Route;
