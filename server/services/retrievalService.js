import KnowledgeChunk from "../models/KnowledgeChunk.js";
import { generateEmbedding } from "./aiService.js";

const cosineSimilarity = (a, b) => {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return (
    dotProduct /
    (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB))
  );
};

export const searchKnowledge = async (query, limit = 3) => {
  const queryEmbedding = await generateEmbedding(query);

  const chunks = await KnowledgeChunk.find({
    embedding: { $exists: true, $ne: [] }
  }).populate("document", "title source");

  const results = chunks.map((chunk) => ({
    chunk,
    score: cosineSimilarity(
      queryEmbedding,
      chunk.embedding
    )
  }));

  results.sort((a, b) => b.score - a.score);

  return results.slice(0, limit);
};