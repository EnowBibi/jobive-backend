import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 8,
  },
  role: {
    type: String,
    enum: ["freelancer", "employer"],
    required: true,
  },
  image: {
    type: String,
    default: ""
  },
  skills: [{ type: String }], // Only for freelancers
  earnings: {type: Number},//only for freelancers
  company: { type: String }, // Only for employers
  phone: { type: String },
  location: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
export default User;