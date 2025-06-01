import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {  // Wrap userId in an object
    expiresIn: "7d", // if this is not set, the token will be valid forever and if thid expires then user will have to login again
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // in milliseconds
    httpOnly: true, // prevent XSS attacks cross-site scripting attacks
    sameSite: "strict", // prevent CSRF attacks cross-site request forgery attacks
    secure: process.env.NODE_ENV === "production", // only send cookie over https in production
  });

  return token;
};
