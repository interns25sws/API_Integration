import mongoose from "mongoose";

const customerSchema = new mongoose.Schema( {
  shopifyId: { type: String, required: true, unique: true }, // ✅ Add this
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  location: String,
  orders: Number,
  amountSpent: Number,
  tags: [String],
},
{ timestamps: true }
);


const Customer = mongoose.model("Customer", customerSchema);

export default Customer;