import mongoose from "mongoose";

const knowledgeChunkSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "KnowledgeDocument",
      required: true
    },

    content: {
      type: String,
      required: true
    },

    embedding: {
      type: [Number],
      default: []
    }
  },
  {
    timestamps: true
  }
);

const KnowledgeChunk = mongoose.model(
  "KnowledgeChunk",
  knowledgeChunkSchema
);

export default KnowledgeChunk;