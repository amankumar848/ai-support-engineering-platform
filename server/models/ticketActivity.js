import mongoose from "mongoose";

const ticketActivitySchema = new mongoose.Schema(
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

    action: {
      type: String,
      enum: [
        "CREATED",
        "ASSIGNED",
        "STATUS_CHANGED",
        "PRIORITY_CHANGED",
        "SEVERITY_CHANGED",
        "CATEGORY_CHANGED",
        "RESOLUTION_ADDED",
        "COMMENT_ADDED",
        "ATTACHMENT_ADDED"
      ],
      required: true
    },

    details: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

const TicketActivity = mongoose.model(
  "TicketActivity",
  ticketActivitySchema
);

export default TicketActivity;