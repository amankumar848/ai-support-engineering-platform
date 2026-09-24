import mongoose from "mongoose";

const knowledgeDocumentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    content: {
      type: String,
      required: true
    },

    source: {
      type: String,
      default: "manual"
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

const KnowledgeDocument = mongoose.model(
  "KnowledgeDocument",
  knowledgeDocumentSchema
);

export default KnowledgeDocument;