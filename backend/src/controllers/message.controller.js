import cloudinary from "../lib/cloudinary.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
// import mongoose from "mongoose";

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

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      // we are getting the messages between the logged in user and the user we are chatting with by using the senderId and recieverId ('$or' operator)
      $or: [
        { senderId: myId, recieverId: userToChatId },
        { senderId: userToChatId, recieverId: myId },
        // {
        //   senderId: mongoose.Types.ObjectId(myId),
        //   recieverId: mongoose.Types.ObjectId(userToChatId),
        // },
        // {
        //   senderId: mongoose.Types.ObjectId(userToChatId),
        //   recieverId: mongoose.Types.ObjectId(myId),
        // },
      ],
    });
  } catch (error) {
    console.log("Error in getting messages", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { id: recieverId } = req.params;
    const senderId = req.user._id;
    const { text, image } = req.body;

    // upload image to cloudinary
    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // create a new message
    const newMessage = new Message({
      senderId: senderId,
      recieverId: recieverId,
      text: text,
      image: imageUrl,
    });

    await newMessage.save();

    // todo: realtime functionality goes here => socket.io

    return res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sending message", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};
