const mongoose = require("mongoose");

const flightSchema = new mongoose.Schema({
  departure: {
    type: String,
    required: true,
  },
  arrival: {
    type: String,
    required: true,
  },
  departureDate: {
    type: Date,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  airline: String,
  crawledAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Flight", flightSchema);
