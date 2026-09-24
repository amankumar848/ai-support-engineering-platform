import KnowledgeDocument from "../models/KnowledgeDocument.js";
import KnowledgeChunk from "../models/KnowledgeChunk.js";
import { chunkText } from "../services/chunkService.js";
import { generateEmbedding } from "../services/aiService.js";
import { searchKnowledge } from "../services/retrievalService.js";

export const createKnowledgeDocument = async (req, res) => {
  try {
    const { title, content, source } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        message: "Title and content are required"
      });
    }

    const document = await KnowledgeDocument.create({
      title,
      content,
      source: source || "manual",
      uploadedBy: req.user.userId
    });

    const chunks = chunkText(content, 500);

 const chunkDocuments = [];

for (const chunk of chunks) {
  const embedding = await generateEmbedding(chunk);

  chunkDocuments.push({
    document: document._id,
    content: chunk,
    embedding
  });
}

await KnowledgeChunk.insertMany(chunkDocuments);

    res.status(201).json({
      message: "Knowledge document created successfully",
      document,
      chunksCreated: chunks.length
    });

  } catch (error) {
    console.error("Create knowledge document error:", error);

    res.status(500).json({
      message: "Failed to create knowledge document"
    });
  }
};

export const searchKnowledgeDocuments = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        message: "Query is required"
      });
    }

    const results = await searchKnowledge(query);

    res.status(200).json({
      results: results.map((result) => ({
        score: result.score,
        content: result.chunk.content,
        document: result.chunk.document
      }))
    });

  } catch (error) {
    console.error("Knowledge search error:", error);

    res.status(500).json({
      message: "Knowledge search failed"
    });
  }
};