const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  name: String,
  address: String,
  oil: String,
  qty: Number,
  cost: { type: Number, default: 0 },
  status: { type: String, default: "Booked" }
});

module.exports = mongoose.model("Order", OrderSchema);