import dotenv from "dotenv";
dotenv.config();
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const analyzeTicketWithAI = async ({
  title,
  description,
  knowledgeContext = ""
}) => {
  const prompt = `
You are an AI support engineering assistant.

Analyze the following customer support ticket.

Ticket Title:
${title}

Ticket Description:
${description}

Relevant Internal Knowledge:
${knowledgeContext || "No relevant internal knowledge found."}

Use the internal knowledge when it is relevant.

Important:
- Do not invent facts.
- If the knowledge does not contain enough information, clearly say so.
- Root cause should be treated as a likely cause, not a confirmed fact.

Return ONLY valid JSON with this exact structure:

{
  "category": "Technical | Payment | Account | Bug | Feature Request | Other",
  "priority": "Low | Medium | High | Critical",
  "severity": "Low | Medium | High | Critical",
  "summary": "Short summary of the problem",
  "rootCause": "Likely technical or business root cause"
}

Do not include markdown.
Do not include explanations outside JSON.
`;

  const response = await openai.responses.create({
    model: "gpt-5.6-luna",
    input: prompt
  });

  const text = response.output_text;

  return JSON.parse(text);
};

export const generateResponseSuggestion = async ({
  title,
  description,
  category,
  priority,
  severity,
  comments
}) => {
  const prompt = `
You are an AI support engineering assistant.

Generate a professional response that a support engineer can send
to the customer.

Ticket:
Title: ${title}
Description: ${description}
Category: ${category}
Priority: ${priority}
Severity: ${severity}

Previous conversation:
${comments || "No previous conversation"}

Requirements:
- Be professional and helpful.
- Clearly acknowledge the customer's issue.
- Do not claim that the issue is fixed unless there is evidence.
- Do not invent technical details.
- If more information is needed, ask specific questions.
- Keep the response concise.

Return ONLY the response text.
`;

  const response = await openai.responses.create({
    model: "gpt-5.6-luna",
    input: prompt
  });

  return response.output_text.trim();
};

export const generateEmbedding = async (text) => {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text
  });

  return response.data[0].embedding;
};