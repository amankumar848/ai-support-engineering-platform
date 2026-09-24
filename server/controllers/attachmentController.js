import Attachment from "../models/Attachment.js";
import Ticket from "../models/Ticket.js";
import TicketActivity from "../models/TicketActivity.js";
import { io } from "../server.js";

export const uploadAttachment = async (req, res) => {
  try {
    const { ticketId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded"
      });
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found"
      });
    }

    // Customer can upload only to their own ticket
    if (req.user.role === "customer") {
      if (
        ticket.customer.toString() !== req.user.userId
      ) {
        return res.status(403).json({
          message: "Access denied"
        });
      }
    }

    // Engineer can upload only to assigned ticket
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

    const attachment = await Attachment.create({
      ticket: ticketId,
      uploadedBy: req.user.userId,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: `/uploads/${req.file.filename}`,
      mimeType: req.file.mimetype,
      size: req.file.size
    });

    const activity = await TicketActivity.create({
      ticket: ticketId,
      user: req.user.userId,
      action: "ATTACHMENT_ADDED",
      details: `File uploaded: ${req.file.originalname}`
    });

    const populatedActivity =
      await TicketActivity.findById(activity._id)
        .populate("user", "name email role");

    const populatedAttachment =
      await Attachment.findById(attachment._id)
        .populate(
          "uploadedBy",
          "name email role"
        );

    io.to(`ticket-${ticketId}`).emit(
      "newActivity",
      populatedActivity
    );

    io.to(`ticket-${ticketId}`).emit(
      "newAttachment",
      populatedAttachment
    );

    res.status(201).json({
      message: "File uploaded successfully",
      attachment: populatedAttachment
    });

  } catch (error) {
    console.error(
      "Upload attachment error:",
      error
    );

    res.status(500).json({
      message: "File upload failed"
    });
  }
};


export const getTicketAttachments = async (
  req,
  res
) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found"
      });
    }

    // Customer access check
    if (req.user.role === "customer") {
      if (
        ticket.customer.toString() !== req.user.userId
      ) {
        return res.status(403).json({
          message: "Access denied"
        });
      }
    }

    // Engineer access check
    if (req.user.role === "engineer") {
      if (
        !ticket.assignedEngineer ||
        ticket.assignedEngineer.toString() !==
          req.user.userId
      ) {
        return res.status(403).json({
          message: "Access denied"
        });
      }
    }

    const attachments =
      await Attachment.find({
        ticket: ticketId
      })
        .populate(
          "uploadedBy",
          "name email role"
        )
        .sort({ createdAt: 1 });

    res.status(200).json({
      attachments
    });

  } catch (error) {
    console.error(
      "Get attachments error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch attachments"
    });
  }
};