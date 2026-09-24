export const chunkText = (text, chunkSize = 500) => {
  const words = text.split(/\s+/);

  const chunks = [];

  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize).join(" ");

    if (chunk.trim()) {
      chunks.push(chunk);
    }
  }

  return chunks;
};