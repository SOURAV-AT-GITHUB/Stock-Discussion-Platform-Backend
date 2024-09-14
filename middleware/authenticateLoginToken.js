const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;

const authenticateLoginToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1] || false;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "You nedd to login first",
    });
  }
  try {
    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        if (err.name == "TokenExpiredError") {
          return res.status(401).json({
            success: false,
            message: "Token Expired, please login again!!",
          });
        } else if (err.name == "JsonWebTokenError") {
          return res.status(401).json({
            success: false,
            message: "Invalid token, please login again!!",
          });
        } else {
          return res.status(401).json({
            success: false,
            message: "Authentication failed, please login again!",
          });
        }
      }
      req.userId = decoded.userId
      next();
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error, try again! at middle",
    });
  }
};

module.exports = authenticateLoginToken;
