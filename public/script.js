const express = require("express");
const mongoose = require("mongoose");
const Order = require("./models/order");
const Setting = require("./models/setting");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

app.use(express.json());
app.use(express.static("public"));

const DEFAULT_PRICE = 500;

// Ensure there is a price setting in the database
async function ensurePriceSetting() {
  let priceSetting = await Setting.findOne({ key: "pricePerUnit" });
  if (!priceSetting) {
    priceSetting = new Setting({ key: "pricePerUnit", value: DEFAULT_PRICE });
    await priceSetting.save();
    console.log(`Created default price setting: ₹${DEFAULT_PRICE}`);
  }
  return priceSetting;
}

// MongoDB connection
const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/oilDB";
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log("✅ Connected to MongoDB");
  await ensurePriceSetting();
})
.catch(err => console.error("❌ MongoDB connection error:", err));

// GET current price
app.get("/api/price", async (req, res) => {
  try {
    const priceSetting = await Setting.findOne({ key: "pricePerUnit" });
    const price = priceSetting ? priceSetting.value : DEFAULT_PRICE;
    res.json({ price });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch price" });
  }
});

// POST update price (admin)
app.post("/api/price", async (req, res) => {
  const { price, adminPassword } = req.body;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
  if (adminPassword !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: "Invalid admin password" });
  }
  if (!price || isNaN(price) || price <= 0) {
    return res.status(400).json({ error: "Invalid price" });
  }
  try {
    await Setting.findOneAndUpdate(
      { key: "pricePerUnit" },
      { value: price, updatedAt: Date.now() },
      { upsert: true, new: true }
    );
    res.json({ message: `Price updated to ₹${price}` });
  } catch (err) {
    res.status(500).json({ error: "Failed to update price" });
  }
});

// POST /order – save order (no notifications)
app.post("/order", async (req, res) => {
  try {
    const { name, address, oil, qty } = req.body;
    const quantity = parseInt(qty);
    if (isNaN(quantity)) {
      return res.status(400).json({ message: "❌ Invalid quantity" });
    }

    const priceSetting = await Setting.findOne({ key: "pricePerUnit" });
    const pricePerUnit = priceSetting ? priceSetting.value : DEFAULT_PRICE;
    const cost = quantity * pricePerUnit;

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