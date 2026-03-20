const express = require("express");
const mongoose = require("mongoose");
const Order = require("./models/order");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

app.use(express.json());
app.use(express.static("public"));

const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/oilDB";

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.error("❌ MongoDB connection error:", err));

app.post("/order", async (req, res) => {
  try {
    const { name, address, oil, qty } = req.body;
    const newOrder = new Order({ name, address, oil, qty });
    await newOrder.save();
    res.json({ message: "✅ Order placed and saved to database!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ Server error" });
  }
});

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