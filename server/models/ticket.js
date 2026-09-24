import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    assignedEngineer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    category: {
      type: String,
      enum: [
        "Technical",
        "Payment",
        "Account",
        "Bug",
        "Feature Request",
        "Other"
      ],
      default: "Other"
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium"
    },

    severity: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium"
    },

    status: {
      type: String,
      enum: [
        "OPEN",
        "IN_PROGRESS",
        "WAITING_FOR_CUSTOMER",
        "RESOLVED",
        "CLOSED"
      ],
      default: "OPEN"
    },
    slaHours: {
  type: Number,
  default: 24
},

slaDueAt: {
  type: Date,
  default: null
},

    aiSummary: {
      type: String,
      default: ""
    },

    aiRootCause: {
      type: String,
      default: ""
    },

    resolution: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;