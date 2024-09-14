const express = require("express");
const authRouter = express.Router();
const UserModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;
authRouter.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Username, email and password are required",
    });
  }
  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: `User with ${email} already exist, try with different email`,
      });
    }
    bcrypt.hash(password, 4, async (err, hash) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Internal server error, try again!",
        });
      }
      const newUser = new UserModel({
        username,
        email,
        password: hash,
      });
      await newUser.save();
      return res.status(200).json({
        success: true,
        message: "User registered successfully",
        userId: newUser._id,
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error, try again!",
    });
  }
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password is required",
    });
  }
  try {
    const existingUser = await UserModel.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: `No user found with email : ${email}`,
      });
    }
    bcrypt.compare(password, existingUser.password, (err, match) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Internal server error, try again!"
        });
      }
      if (!match) {
        return res.status(401).json({
          success: false,
          message: "Wrong Password",
        });
      }
      const userDetails = {
        userId: existingUser._id,
        email: existingUser.email,
        username: existingUser.username
      }
      jwt.sign({...userDetails},jwtSecret,{algorithm: 'HS256', expiresIn: "14h" },(err,token)=>{
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Internal server error, try again!",
                })
            }
            return res.status(200).json({
                token,
                user:{...userDetails}
            })

        }
      );
    });
  } catch (error) {
            return res.status(500).json({
          success: false,
          message: "Internal server error, try again!"
        });
  }
});

module.exports = authRouter;
