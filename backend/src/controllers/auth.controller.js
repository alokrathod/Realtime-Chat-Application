import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    // validation
    if (!email || !fullName || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be atleast 6 characters long." });
    }

    const user = await User.findOne({ email });

    // check if user already exists
    if (user) {
      return res.status(400).json({ message: "Email already exists." });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // our new user will be
    const newUser = new User({
      email: email,
      fullName: fullName,
      password: hashedPassword,
    });

    if (newUser) {
      // generate jwt token
      generateToken(newUser._id, res);
      await newUser.save();

      return res.status(201).json({
        _id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
        profilePic: newUser.profilePic,
      });
    } else {
      return res.status(400).json({ message: "Invalid user data. " });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // check if password is correct
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // generate jwt token
    generateToken(user._id, res);

    return res.status(200).json({
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const logout = (req, res) => {
  // for logout we just need to clear the cookie
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id; // from protectRoute middleware

    if (!profilePic) {
      return res.status(400).json({ message: "Profile picture is required." });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      // profilePic: uploadResponse.secure_url means update the profilePic field with the secure_url of the uploaded image
      { new: true }
      // new: true means return the updated user
    );

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in updateProfile controller", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const checkAuth = (req, res) => {
  try {
    // if user is authenticated, return user data
    res.status(200).json(req.user);
    // req.user is set by protectRoute middleware
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};
