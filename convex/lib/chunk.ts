const TARGET_SIZE = 1000;
const OVERLAP = 120;

export function chunkMarkdown(text: string): string[] {
  const cleaned = text.replace(/\r\n/g, "\n").trim();
  if (!cleaned) return [];

  const sections = cleaned
    .split(/(?=^#{1,3}\s)/m)
    .map((s) => s.trim())
    .filter(Boolean);

  const blocks = sections.length > 0 ? sections : [cleaned];
  const chunks: string[] = [];

  for (const block of blocks) {
    if (block.length <= TARGET_SIZE) {
      chunks.push(block);
      continue;
    }

    let start = 0;
    while (start < block.length) {
      let end = Math.min(start + TARGET_SIZE, block.length);
      if (end < block.length) {
        const slice = block.slice(start, end);
        const breakAt = Math.max(
          slice.lastIndexOf("\n\n"),
          slice.lastIndexOf("\n"),
          slice.lastIndexOf(" "),
        );
        if (breakAt > TARGET_SIZE * 0.4) {
          end = start + breakAt;
        }
      }
      const piece = block.slice(start, end).trim();
      if (piece) chunks.push(piece);
      if (end >= block.length) break;
      start = Math.max(end - OVERLAP, start + 1);
    }
  }

  return chunks;
}
