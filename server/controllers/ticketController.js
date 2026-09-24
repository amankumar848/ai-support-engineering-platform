import Ticket from "../models/Ticket.js";
import User from "../models/User.js";
import TicketActivity from "../models/TicketActivity.js";
import { io } from "../server.js";

// ======================================================
// CREATE TICKET
// ======================================================
export const createTicket = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      severity
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: "Title and description are required"
      });
    }

    // SLA hours based on priority
    const slaHoursMap = {
      Critical: 4,
      High: 8,
      Medium: 24,
      Low: 48
    };

    const selectedPriority = priority || "Medium";
    const slaHours = slaHoursMap[selectedPriority] || 24;

    const slaDueAt = new Date(
      Date.now() + slaHours * 60 * 60 * 1000
    );

    const ticket = await Ticket.create({
      title,
      description,
      customer: req.user.userId,
      category: category || "Other",
      priority: selectedPriority,
      severity: severity || "Medium",
      status: "OPEN",
      slaHours,
      slaDueAt
    });

    // Create activity
    const activity = await TicketActivity.create({
      ticket: ticket._id,
      user: req.user.userId,
      action: "CREATED",
      details: "Ticket created"
    });

    const populatedActivity = await TicketActivity.findById(activity._id)
      .populate("user", "name email role");

    // Emit real-time activity
    io.to(`ticket-${ticket._id}`).emit(
      "newActivity",
      populatedActivity
    );

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate("customer", "name email role")
      .populate("assignedEngineer", "name email role");

    res.status(201).json({
      message: "Ticket created successfully",
      ticket: populatedTicket
    });
  } catch (error) {
    console.error("Create ticket error:", error);

    res.status(500).json({
      message: "Failed to create ticket"
    });
  }
};


// ======================================================
// GET ALL TICKETS
// ======================================================
export const getTickets = async (req, res) => {
  try {
    const {
      search = "",
      status,
      priority,
      severity,
      category,
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    // ------------------------------------------
    // CUSTOMER
    // Customer can only see their own tickets
    // ------------------------------------------
    if (req.user.role === "customer") {
      query.customer = req.user.userId;
    }

    // ------------------------------------------
    // ENGINEER
    // Engineer can see:
    // 1. Tickets assigned to them
    // 2. Unassigned tickets
    // ------------------------------------------
    if (req.user.role === "engineer") {
      query.$or = [
        {
          assignedEngineer: req.user.userId
        },
        {
          assignedEngineer: null
        }
      ];
    }

    // ------------------------------------------
    // SEARCH
    // ------------------------------------------
    if (search.trim()) {
      const searchRegex = {
        $regex: search.trim(),
        $options: "i"
      };

      const searchConditions = [
        { title: searchRegex },
        { description: searchRegex }
      ];

      if (query.$or) {
        query.$and = [
          {
            $or: query.$or
          },
          {
            $or: searchConditions
          }
        ];

        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    // ------------------------------------------
    // FILTERS
    // ------------------------------------------
    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (severity) {
      query.severity = severity;
    }

    if (category) {
      query.category = category;
    }

    // ------------------------------------------
    // PAGINATION
    // ------------------------------------------
    const currentPage = Math.max(
      Number(page) || 1,
      1
    );

    const itemsPerPage = Math.min(
      Math.max(Number(limit) || 10, 1),
      50
    );

    const skip = (currentPage - 1) * itemsPerPage;

    // ------------------------------------------
    // TOTAL TICKETS
    // ------------------------------------------
    const totalTickets = await Ticket.countDocuments(query);

    // IMPORTANT:
    // totalPages MUST be declared before it is used
    const totalPages = Math.ceil(
      totalTickets / itemsPerPage
    );

    // ------------------------------------------
    // FETCH TICKETS
    // ------------------------------------------
    const tickets = await Ticket.find(query)
      .populate(
        "customer",
        "name email role"
      )
      .populate(
        "assignedEngineer",
        "name email role"
      )
      .sort({
        createdAt: -1
      })
      .skip(skip)
      .limit(itemsPerPage);

    // ------------------------------------------
    // SLA STATUS
    // ------------------------------------------
    const ticketsWithSLA = tickets.map((ticket) => {
      const isOverdue =
        ticket.slaDueAt &&
        new Date(ticket.slaDueAt) < new Date() &&
        !["RESOLVED", "CLOSED"].includes(
          ticket.status
        );

      return {
        ...ticket.toObject(),
        isOverdue
      };
    });

    // ------------------------------------------
    // RESPONSE
    // ------------------------------------------
    res.status(200).json({
      tickets: ticketsWithSLA,

      pagination: {
        currentPage,
        itemsPerPage,
        totalTickets,
        totalPages,

        hasNextPage:
          currentPage < totalPages,

        hasPreviousPage:
          currentPage > 1
      }
    });
  } catch (error) {
    console.error(
      "Get tickets error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch tickets"
    });
  }
};


// ======================================================
// GET SINGLE TICKET
// ======================================================
export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(
      req.params.id
    )
      .populate(
        "customer",
        "name email"
      )
      .populate(
        "assignedEngineer",
        "name email"
      );

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found"
      });
    }

    // ------------------------------------------
    // CUSTOMER ACCESS
    // ------------------------------------------
    if (
      req.user.role === "customer" &&
      ticket.customer._id.toString() !==
        req.user.userId
    ) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    // ------------------------------------------
    // ENGINEER ACCESS
    //
    // Engineer can view:
    // 1. Unassigned tickets
    // 2. Tickets assigned to themselves
    //
    // Engineer cannot view another engineer's ticket.
    // ------------------------------------------
    if (
      req.user.role === "engineer" &&
      ticket.assignedEngineer &&
      ticket.assignedEngineer._id.toString() !==
        req.user.userId
    ) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    res.status(200).json({
      ticket
    });
  } catch (error) {
    console.error(
      "Get ticket by ID error:",
      error
    );

    res.status(500).json({
      message: "Server error"
    });
  }
};


// ======================================================
// UPDATE TICKET
// ======================================================
export const updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(
      req.params.id
    );

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found"
      });
    }

    // ------------------------------------------
    // ACCESS CONTROL
    // ------------------------------------------
    if (
      req.user.role === "customer" &&
      ticket.customer.toString() !==
        req.user.userId
    ) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    if (
      req.user.role === "engineer" &&
      ticket.assignedEngineer &&
      ticket.assignedEngineer.toString() !==
        req.user.userId
    ) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    const oldStatus = ticket.status;
    const oldPriority = ticket.priority;
    const oldSeverity = ticket.severity;
    const oldCategory = ticket.category;

    const {
      title,
      description,
      status,
      priority,
      severity,
      category,
      resolution
    } = req.body;

    // ------------------------------------------
    // UPDATE FIELDS
    // ------------------------------------------
    if (title !== undefined) {
      ticket.title = title;
    }

    if (description !== undefined) {
      ticket.description = description;
    }

    if (status !== undefined) {
      ticket.status = status;
    }

    if (priority !== undefined) {
      ticket.priority = priority;

      const slaHoursMap = {
        Critical: 4,
        High: 8,
        Medium: 24,
        Low: 48
      };

      const slaHours =
        slaHoursMap[priority] || 24;

      ticket.slaHours = slaHours;

      ticket.slaDueAt = new Date(
        Date.now() +
          slaHours * 60 * 60 * 1000
      );
    }

    if (severity !== undefined) {
      ticket.severity = severity;
    }

    if (category !== undefined) {
      ticket.category = category;
    }

    if (resolution !== undefined) {
      ticket.resolution = resolution;
    }

    await ticket.save();

    // ------------------------------------------
    // ACTIVITIES
    // ------------------------------------------

    if (oldStatus !== ticket.status) {
      const activity =
        await TicketActivity.create({
          ticket: ticket._id,
          user: req.user.userId,
          action: "STATUS_CHANGED",
          details: `Status changed from ${oldStatus} to ${ticket.status}`
        });

      const populatedActivity =
        await TicketActivity.findById(
          activity._id
        ).populate(
          "user",
          "name email role"
        );

      io.to(`ticket-${ticket._id}`).emit(
        "newActivity",
        populatedActivity
      );
    }

    if (oldPriority !== ticket.priority) {
      const activity =
        await TicketActivity.create({
          ticket: ticket._id,
          user: req.user.userId,
          action: "PRIORITY_CHANGED",
          details: `Priority changed from ${oldPriority} to ${ticket.priority}`
        });

      const populatedActivity =
        await TicketActivity.findById(
          activity._id
        ).populate(
          "user",
          "name email role"
        );

      io.to(`ticket-${ticket._id}`).emit(
        "newActivity",
        populatedActivity
      );
    }

    if (oldSeverity !== ticket.severity) {
      const activity =
        await TicketActivity.create({
          ticket: ticket._id,
          user: req.user.userId,
          action: "SEVERITY_CHANGED",
          details: `Severity changed from ${oldSeverity} to ${ticket.severity}`
        });

      const populatedActivity =
        await TicketActivity.findById(
          activity._id
        ).populate(
          "user",
          "name email role"
        );

      io.to(`ticket-${ticket._id}`).emit(
        "newActivity",
        populatedActivity
      );
    }

    if (oldCategory !== ticket.category) {
      const activity =
        await TicketActivity.create({
          ticket: ticket._id,
          user: req.user.userId,
          action: "CATEGORY_CHANGED",
          details: `Category changed from ${oldCategory} to ${ticket.category}`
        });

      const populatedActivity =
        await TicketActivity.findById(
          activity._id
        ).populate(
          "user",
          "name email role"
        );

      io.to(`ticket-${ticket._id}`).emit(
        "newActivity",
        populatedActivity
      );
    }

    if (
      resolution !== undefined &&
      resolution !== ""
    ) {
      const activity =
        await TicketActivity.create({
          ticket: ticket._id,
          user: req.user.userId,
          action: "RESOLUTION_ADDED",
          details: "Resolution added to ticket"
        });

      const populatedActivity =
        await TicketActivity.findById(
          activity._id
        ).populate(
          "user",
          "name email role"
        );

      io.to(`ticket-${ticket._id}`).emit(
        "newActivity",
        populatedActivity
      );
    }

    const updatedTicket =
      await Ticket.findById(ticket._id)
        .populate(
          "customer",
          "name email role"
        )
        .populate(
          "assignedEngineer",
          "name email role"
        );

    res.status(200).json({
      message: "Ticket updated successfully",
      ticket: updatedTicket
    });
  } catch (error) {
    console.error(
      "Update ticket error:",
      error
    );

    res.status(500).json({
      message: "Failed to update ticket"
    });
  }
};


// ======================================================
// ASSIGN TICKET TO CURRENT ENGINEER
// ======================================================
export const assignTicketToMe = async (
  req,
  res
) => {
  try {
    const ticket = await Ticket.findById(
      req.params.id
    );

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found"
      });
    }

    // Only engineers can assign tickets to themselves
    if (req.user.role !== "engineer") {
      return res.status(403).json({
        message:
          "Only engineers can assign tickets"
      });
    }

    // Prevent taking an already assigned ticket
    if (ticket.assignedEngineer) {
      return res.status(400).json({
        message:
          "Ticket is already assigned to an engineer"
      });
    }

    ticket.assignedEngineer =
      req.user.userId;

    // Move OPEN ticket to IN_PROGRESS
    if (ticket.status === "OPEN") {
      ticket.status = "IN_PROGRESS";
    }

    await ticket.save();

    // ------------------------------------------
    // ASSIGNMENT ACTIVITY
    // ------------------------------------------
    const activity =
      await TicketActivity.create({
        ticket: ticket._id,
        user: req.user.userId,
        action: "ASSIGNED",
        details: "Ticket assigned to engineer"
      });

    const populatedActivity =
      await TicketActivity.findById(
        activity._id
      ).populate(
        "user",
        "name email role"
      );

    io.to(`ticket-${ticket._id}`).emit(
      "newActivity",
      populatedActivity
    );

    const updatedTicket =
      await Ticket.findById(ticket._id)
        .populate(
          "customer",
          "name email role"
        )
        .populate(
          "assignedEngineer",
          "name email role"
        );

    res.status(200).json({
      message: "Ticket assigned successfully",
      ticket: updatedTicket
    });
  } catch (error) {
    console.error(
      "Assign ticket error:",
      error
    );

    res.status(500).json({
      message: "Failed to assign ticket"
    });
  }
};


// ======================================================
// ADMIN TICKET ANALYTICS
// ======================================================
export const getTicketAnalytics = async (
  req,
  res
) => {
  try {
    const [
      totalTickets,
      openTickets,
      inProgressTickets,
      criticalTickets,
      resolvedTickets,
      closedTickets,
      byPriority,
      byCategory,
      byStatus
    ] = await Promise.all([
      Ticket.countDocuments(),

      Ticket.countDocuments({
        status: "OPEN"
      }),

      Ticket.countDocuments({
        status: "IN_PROGRESS"
      }),

      Ticket.countDocuments({
        priority: "Critical"
      }),

      Ticket.countDocuments({
        status: "RESOLVED"
      }),

      Ticket.countDocuments({
        status: "CLOSED"
      }),

      Ticket.aggregate([
        {
          $group: {
            _id: "$priority",
            count: {
              $sum: 1
            }
          }
        },
        {
          $sort: {
            count: -1
          }
        }
      ]),

      Ticket.aggregate([
        {
          $group: {
            _id: "$category",
            count: {
              $sum: 1
            }
          }
        },
        {
          $sort: {
            count: -1
          }
        }
      ]),

      Ticket.aggregate([
        {
          $group: {
            _id: "$status",
            count: {
              $sum: 1
            }
          }
        },
        {
          $sort: {
            count: -1
          }
        }
      ])
    ]);

    // ------------------------------------------
    // OVERDUE TICKETS
    // ------------------------------------------
    const overdueTickets =
      await Ticket.countDocuments({
        slaDueAt: {
          $lt: new Date()
        },

        status: {
          $nin: [
            "RESOLVED",
            "CLOSED"
          ]
        }
      });

    res.status(200).json({
      totalTickets,
      openTickets,
      inProgressTickets,
      criticalTickets,
      resolvedTickets,
      closedTickets,
      overdueTickets,
      byPriority,
      byCategory,
      byStatus
    });
  } catch (error) {
    console.error(
      "Analytics error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch ticket analytics"
    });
  }
};


// ======================================================
// ENGINEER ANALYTICS
// ======================================================
export const getEngineerAnalytics = async (
  req,
  res
) => {
  try {
    const engineers = await User.find({
      role: "engineer"
    }).select(
      "_id name email"
    );

    const analytics = await Promise.all(
      engineers.map(async (engineer) => {
        const [
          assignedTickets,
          openTickets,
          inProgressTickets,
          resolvedTickets,
          closedTickets,
          criticalTickets
        ] = await Promise.all([
          Ticket.countDocuments({
            assignedEngineer:
              engineer._id
          }),

          Ticket.countDocuments({
            assignedEngineer:
              engineer._id,
            status: "OPEN"
          }),

          Ticket.countDocuments({
            assignedEngineer:
              engineer._id,
            status: "IN_PROGRESS"
          }),

          Ticket.countDocuments({
            assignedEngineer:
              engineer._id,
            status: "RESOLVED"
          }),

          Ticket.countDocuments({
            assignedEngineer:
              engineer._id,
            status: "CLOSED"
          }),

          Ticket.countDocuments({
            assignedEngineer:
              engineer._id,
            priority: "Critical"
          })
        ]);

        return {
          engineer: {
            _id: engineer._id,
            name: engineer.name,
            email: engineer.email
          },

          assignedTickets,
          openTickets,
          inProgressTickets,
          resolvedTickets,
          closedTickets,
          criticalTickets
        };
      })
    );

    res.status(200).json({
      engineers: analytics
    });
  } catch (error) {
    console.error(
      "Engineer analytics error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch engineer analytics"
    });
  }
};