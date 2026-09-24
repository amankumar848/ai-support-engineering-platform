import Ticket from "../models/Ticket.js";
import Comment from "../models/Comment.js";

import {
  analyzeTicketWithAI,
  generateResponseSuggestion,
} from "../services/aiService.js";

import { searchKnowledge } from "../services/retrievalService.js";

export const analyzeTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.ticketId);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    // Retrieve relevant knowledge from the knowledge base
    const knowledgeResults = await searchKnowledge(
      `${ticket.title}\n${ticket.description}`,
      3,
    );

    const knowledgeContext = knowledgeResults
      .map(
        (result, index) =>
          `Source ${index + 1}: ${result.chunk.document.title}\n${result.chunk.content}`,
      )
      .join("\n\n");

    const analysis = await analyzeTicketWithAI({
      title: ticket.title,
      description: ticket.description,
      knowledgeContext,
    });

    ticket.category = analysis.category;
    ticket.priority = analysis.priority;
    ticket.severity = analysis.severity;
    ticket.aiSummary = analysis.summary;
    ticket.aiRootCause = analysis.rootCause;

    await ticket.save();

    res.status(200).json({
      message: "Ticket analyzed successfully",
      analysis,
      ticket,
      sources: knowledgeResults.map((result) => ({
        title: result.chunk.document.title,
        source: result.chunk.document.source,
        score: result.score,
      })),
    });
  } catch (error) {
    console.error("AI analysis error:", error);

    res.status(500).json({
      message: "AI analysis failed",
    });
  }
};

export const generateAIResponse = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.ticketId);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    // Get previous conversation
    const comments = await Comment.find({
      ticket: ticket._id,
    })
      .populate("user", "name role")
      .sort({ createdAt: 1 });

    const conversation = comments
      .map(
        (comment) =>
          `${comment.user.name} (${comment.user.role}): ${comment.message}`,
      )
      .join("\n");

    // Retrieve relevant knowledge
    const knowledgeResults = await searchKnowledge(
      `${ticket.title}\n${ticket.description}`,
      3,
    );

    const knowledgeContext = knowledgeResults
      .map(
        (result, index) =>
          `Source ${index + 1}: ${result.chunk.document.title}\n${result.chunk.content}`,
      )
      .join("\n\n");

    // Generate AI response using ticket + conversation + RAG
    const suggestion = await generateResponseSuggestion({
      title: ticket.title,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority,
      severity: ticket.severity,
      comments: conversation,
      knowledgeContext,
    });

    res.status(200).json({
      message: "AI response generated successfully",
      suggestion,
    });
  } catch (error) {
    console.error("AI response error:", error);

    res.status(500).json({
      message: "Failed to generate AI response",
    });
  }
};
