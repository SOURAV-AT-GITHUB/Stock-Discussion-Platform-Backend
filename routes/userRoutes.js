const express = require("express");
const userRouter = express.Router();
const UserModel = require("../models/user.model");
const authenticateLoginToken = require("../middleware/authenticateLoginToken");
const upload = require("../config/multer");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}
userRouter.get("/profile/:id", authenticateLoginToken, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await UserModel.findOne({ _id: id });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User Not Found!!`,
      });
    }
    return res.status(200).json({
      id: user._id,
      username: user.username,
      bio:user.profile.bio,
      image : user.profile.image
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error, try again!",
    });
  }
});

userRouter.put(
  "/profile",
  authenticateLoginToken,
  upload.single("file"),
  async (req, res) => {
    const userId = req.userId;
    const { username, bio } = req.body;
    if (!username || !bio || !req.file.path) {
      return res.status(400).json({
        success: false,
        message: "No valid input received to update the profile",
      });
    }
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: false,
          message: "User not found",
        });
      }
      if (username) user.username = username; //Updating username if provided received in request

      if (bio) user.profile.bio = bio; //Updating bio if provided received in request

      if (req.file.path) { //Uploading image to cloudinary if the path found in req.faile.path (Provided by multer automatically)
        const uploadResponse = await cloudinary.uploader.upload(req.file.path);
        if (user.profile.public_id) { //Deleting the old image from the cloudinary if it's there
         await cloudinary.uploader.destroy(user.profile.public_id);

        }
        user.profile.image = uploadResponse.url;
        user.profile.public_id = uploadResponse.public_id;
      }
      await user.save();
      return res.status(200).json({
        success: true,
        message: "Profile updated",
      });
    } catch (error) {
      return res.status(500).json({
        message: "At catch",
      });
    } finally {
      if (req.file.path) fs.unlinkSync(req.file.path); //Deleting the image from local server
    }
  }
);

module.exports = userRouter;
