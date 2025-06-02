import { User } from "../models/user.model.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id; // Get the ID of the logged-in user from the request object as we've added it in the middleware
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } });
    // we are not including the logged in user in the list of users
    return res.status(200).json({ filteredUsers });
  } catch (error) {
    console.log("Error in getting users for sidebar", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};
