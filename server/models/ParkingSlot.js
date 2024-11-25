const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema({
  slotId: { type: String, required: true, unique: true },
  isOccupied: { type: Boolean, default: false },
  vehicle: {
    licensePlate: { type: String },
    vehicleType: { type: String },
    entryTime: { type: Date },
    exitTime: { type: Date },
  },
  billAmount: { type: Number, default: 0 },
});

const ParkingSlot = mongoose.model('ParkingSlot', parkingSlotSchema);
module.exports = ParkingSlot;
