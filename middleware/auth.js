const jwt = require("jsonwebtoken");
const BlacklistedToken = require("../models/blacklist");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  const blacklistedToken = await BlacklistedToken.findOne({ token });
  if (blacklistedToken) {
    return res.status(401).json({ message: "Token has been revoked" });
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "change_this_secret",
    );
    req.user = payload; // Attach decoded user info to request object

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid or expired token", error: error.message });
  }
};

module.exports = verifyToken;
