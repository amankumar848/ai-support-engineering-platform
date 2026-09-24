import Comment from "../models/Comment.js";
import Ticket from "../models/Ticket.js";
import TicketActivity from "../models/TicketActivity.js";
import { io } from "../server.js";

export const addComment = async (req, res) => {
  try {
    const { message } = req.body;
    const { ticketId } = req.params;

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Comment message is required"
      });
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found"
      });
    }

    // Customer can comment only on their own ticket
    if (
      req.user.role === "customer" &&
      ticket.customer.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    // Engineer can comment only on assigned tickets
    if (
      req.user.role === "engineer" &&
      (
        !ticket.assignedEngineer ||
        ticket.assignedEngineer.toString() !== req.user.userId
      )
    ) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    // Create comment
    const comment = await Comment.create({
      ticket: ticket._id,
      user: req.user.userId,
      message: message.trim()
    });

    // Create activity
    const activity = await TicketActivity.create({
      ticket: ticket._id,
      user: req.user.userId,
      action: "COMMENT_ADDED",
      details: "Comment added to ticket"
    });

    // Populate activity user
    const populatedActivity = await TicketActivity.findById(activity._id)
      .populate("user", "name email role");

    // Emit activity update
    io.to(`ticket-${ticketId}`).emit(
      "newActivity",
      populatedActivity
    );

    // Populate comment user
    const populatedComment = await Comment.findById(comment._id)
      .populate("user", "name email role");

    // Emit comment update
    io.to(`ticket-${ticketId}`).emit(
      "ticket_COMMENT_ADDED",
      {
        action: "COMMENT_ADDED",
        comment: populatedComment
      }
    );

    res.status(201).json({
      message: "Comment added successfully",
      comment: populatedComment
    });

  } catch (error) {
    console.error("Add comment error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};

export const getComments = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.ticketId);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found"
      });
    }

    // Customer access check
    if (
      req.user.role === "customer" &&
      ticket.customer.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    // Engineer access check
    if (
      req.user.role === "engineer" &&
      (!ticket.assignedEngineer ||
        ticket.assignedEngineer.toString() !== req.user.userId)
    ) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    const comments = await Comment.find({
      ticket: ticket._id
    })
      .populate("user", "name email role")
      .sort({ createdAt: 1 });

    res.status(200).json({
      count: comments.length,
      comments
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error"
    });
  }
};