const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const ParkingSlot = require('./models/ParkingSlot');

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost/parking-system', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("Error connecting to MongoDB:", err));

// Route to park a vehicle
app.post('/park/:slotId', async (req, res) => {
  const { slotId } = req.params;
  const { licensePlate, vehicleType } = req.body;

  try {
    const slot = await ParkingSlot.findOne({ slotId });

    if (slot && !slot.isOccupied) {
      slot.isOccupied = true;
      slot.vehicle = { licensePlate, vehicleType, entryTime: new Date() };
      await slot.save();
      res.json({ message: 'Vehicle parked successfully!', slot });
    } else {
      res.status(400).json({ message: 'Slot not available or already occupied' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error parking vehicle', error });
  }
});

// Route to remove a vehicle and calculate the bill
app.post('/exit/:slotId', async (req, res) => {
  const { slotId } = req.params;

  try {
    const slot = await ParkingSlot.findOne({ slotId });

    if (slot && slot.isOccupied) {
      const exitTime = new Date();
      const duration = (exitTime - slot.vehicle.entryTime) / (1000 * 60 * 60); 
      const bill = duration * 10; 

      slot.isOccupied = false;
      slot.vehicle.exitTime = exitTime;
      slot.billAmount = bill;
      slot.vehicle = null;
      await slot.save();

      res.json({ message: 'Vehicle exited', billAmount: bill });
    } else {
      res.status(400).json({ message: 'Slot is empty or not available' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error during exit', error });
  }
});

// Route to check available slots
app.get('/slots', async (req, res) => {
  try {
    const slots = await ParkingSlot.find();
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching slots', error });
  }
});

// Route to add parking slots
app.post('/add-slot', async (req, res) => {
  const { slotId } = req.body;

  try {
    const newSlot = new ParkingSlot({ slotId });
    await newSlot.save();
    res.json({ message: 'Slot added successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding slot', error });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
