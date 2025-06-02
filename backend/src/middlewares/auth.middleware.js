import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt; // jwt is the name of the cookie as we gave while storing it (in utils file)

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No Token Provided." });
    }

    // verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token." });
    }

    // find the user
    const user = await User.findById(decoded.userId); // decoded.userId is the id of the user as we gave while storing it (in utils file)
    if (!user) {
      return res.status(404).json({ message: "User Not Found." });
    }

    req.user = user; // user is the user object
    next();
  } catch (error) {
    console.log("Error in protectRoute middleware", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};
