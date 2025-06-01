import Message from "../models/message.model.js";

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;

    if (!senderId || !receiverId || !content) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const newMessage = new Message({ senderId, receiverId, content });
    await newMessage.save();

    res
      .status(201)
      .json({
        success: true,
        message: "Message sent successfully",
        data: newMessage,
      });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const deletedMessage = await Message.findByIdAndDelete(messageId);

    if (!deletedMessage) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get old messages (conversation between two users)
export const getMessages = async (req, res) => {
  try {
    const { senderId, receiverId } = req.query;

    if (!senderId || !receiverId) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Sender ID and Receiver ID are required",
        });
    }

    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ timestamp: 1 });

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
