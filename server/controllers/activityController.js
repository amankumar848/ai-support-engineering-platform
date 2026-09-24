import TicketActivity from "../models/TicketActivity.js";
import Ticket from "../models/Ticket.js";

export const getTicketActivities = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.ticketId);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found"
      });
    }

    // Customer can view only their own ticket
    if (req.user.role === "customer") {
      if (ticket.customer.toString() !== req.user.userId) {
        return res.status(403).json({
          message: "Access denied"
        });
      }
    }

    // Engineer can view only assigned tickets
    if (req.user.role === "engineer") {
      if (
        !ticket.assignedEngineer ||
        ticket.assignedEngineer.toString() !== req.user.userId
      ) {
        return res.status(403).json({
          message: "Access denied"
        });
      }
    }

    // Admin can view all tickets

    const activities = await TicketActivity.find({
      ticket: req.params.ticketId
    })
      .populate("user", "name email role")
      .sort({ createdAt: 1 });

    res.status(200).json({
      activities
    });

  } catch (error) {
    console.error("Get activities error:", error);

    res.status(500).json({
      message: "Failed to fetch ticket activities"
    });
  }
};