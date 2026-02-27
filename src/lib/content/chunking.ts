/**
 * Text chunking for content ingestion
 * Splits text into overlapping chunks preserving paragraph boundaries
 */

export interface TextChunk {
  text: string;
  index: number;
  metadata: Record<string, unknown>;
}

export function chunkText(
  text: string,
  targetSize = 800,
  overlap = 100
): TextChunk[] {
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const chunks: TextChunk[] = [];
  let currentChunk = "";
  let chunkIndex = 0;

  for (const para of paragraphs) {
    const trimmed = para.trim();

    // If adding this paragraph would exceed target and we have content, flush
    if (currentChunk.length + trimmed.length > targetSize && currentChunk.length > 0) {
      chunks.push({
        text: currentChunk.trim(),
        index: chunkIndex++,
        metadata: {},
      });

      // Keep overlap from end of current chunk
      if (overlap > 0) {
        const words = currentChunk.trim().split(/\s+/);
        const overlapWords = Math.ceil(overlap / 5); // ~5 chars per word
        currentChunk = words.slice(-overlapWords).join(" ") + "\n\n";
      } else {
        currentChunk = "";
      }
    }

    // If a single paragraph exceeds target, split it by sentences
    if (trimmed.length > targetSize * 1.5) {
      const sentences = trimmed.match(/[^.!?]+[.!?]+/g) || [trimmed];
      for (const sentence of sentences) {
        if (currentChunk.length + sentence.length > targetSize && currentChunk.length > 0) {
          chunks.push({
            text: currentChunk.trim(),
            index: chunkIndex++,
            metadata: {},
          });
          const words = currentChunk.trim().split(/\s+/);
          const overlapWords = Math.ceil(overlap / 5);
          currentChunk = words.slice(-overlapWords).join(" ") + " ";
        }
        currentChunk += sentence;
      }
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + trimmed;
    }
  }

  // Flush remaining
  if (currentChunk.trim().length > 0) {
    chunks.push({
      text: currentChunk.trim(),
      index: chunkIndex,
      metadata: {},
    });
  }

  return chunks;
}
