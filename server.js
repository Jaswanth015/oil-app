const express = require("express");
const mongoose = require("mongoose");
const Order = require("./models/order");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

app.use(express.json());
app.use(express.static("public"));

// Price per unit (1 unit = 15 kg tin). Default to 500 if not set.
const PRICE_PER_UNIT = process.env.PRICE_PER_UNIT || 500;

// MongoDB connection
const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/oilDB";
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// POST /order – save a new order with calculated cost
app.post("/order", async (req, res) => {
  try {
    const { name, address, oil, qty } = req.body;
    // Ensure qty is a number
    const quantity = parseInt(qty);
    if (isNaN(quantity)) {
      return res.status(400).json({ message: "❌ Invalid quantity" });
    }
    const cost = quantity * PRICE_PER_UNIT;
    const newOrder = new Order({ name, address, oil, qty: quantity, cost });
    await newOrder.save();
    res.json({ message: `✅ Order placed! Total: ₹${cost}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ Server error" });
  }
});

// GET /orders – retrieve all orders
app.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});