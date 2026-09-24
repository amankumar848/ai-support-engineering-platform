import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    message: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;