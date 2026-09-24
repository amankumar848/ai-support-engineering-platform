import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    originalName: {
      type: String,
      required: true
    },

    fileName: {
      type: String,
      required: true
    },

    filePath: {
      type: String,
      required: true
    },

    mimeType: {
      type: String,
      required: true
    },

    size: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Attachment = mongoose.model(
  "Attachment",
  attachmentSchema
);

export default Attachment;