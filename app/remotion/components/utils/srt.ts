// srt-parser.ts
// TypeScript version of the SRT parser

/**
 * Represents a single subtitle entry.
 */
export interface SrtEntry {
  /** Start time in seconds */
  start: number;
  /** End time in seconds */
  end: number;
  /** Subtitle text */
  text: string;
}

/**
 * Convert an SRT timestamp (HH:MM:SS,mmm) to seconds.
 * @param time - A timestamp string like "00:01:15,123".
 * @returns The time in seconds.
 */
export function srtTimeToSeconds(time: string): number {
  const match = time.match(/^(\d{2}):(\d{2}):(\d{2}),(\d{3})$/);
  if (!match) {
    throw new Error(`Invalid time format: ${time}`);
  }
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const seconds = parseInt(match[3], 10);
  const milliseconds = parseInt(match[4], 10);
  return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
}

/**
 * Parse a single SRT block (without the numeric index) into an SrtEntry.
 * @param block - A block of text containing the time range and subtitle lines.
 * @returns An object with start, end, and text.
 */
export function parseSrtLine(block: string): SrtEntry {
  const match = block.match(
    /^(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})\s*([\s\S]*)$/m,
  );
  if (!match) {
    throw new Error(`Invalid SRT block:\n${block}`);
  }
  const start = srtTimeToSeconds(match[1]);
  const end = srtTimeToSeconds(match[2]);
  const text = match[3].trim().replace(/\r?\n/g, "\n");
  return { start, end, text };
}

/**
 * Parse full SRT content into an array of SrtEntry.
 * @param srt - The raw SRT file content as a string.
 * @returns An array of subtitle entries.
 */
export function parseSrt(srt: string): SrtEntry[] {
  const blocks = srt
    .trim()
    .split(/\r?\n\r?\n/)
    .filter((block) => /^\d+\r?\n/.test(block))
    .map((block) => block.replace(/^\d+\r?\n/, ""));

  return blocks.map(parseSrtLine);
}
