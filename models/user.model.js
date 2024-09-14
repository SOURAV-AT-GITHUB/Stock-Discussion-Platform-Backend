const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: { type: String, require: true },
  email: { type: String, require: true, unique: true },
  password: { type: String, require: true },
  profile: {
    bio: String,
    image: String,
    public_id: String,
  },
});
const UserModel = mongoose.model("user", userSchema);
module.exports = UserModel;
