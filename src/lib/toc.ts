export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[*_`[\]()]/g, "") // strip markdown formatting chars
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function extractHeadings(content: string): TocHeading[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: TocHeading[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length as 2 | 3;
    const raw = match[2].trim();

    // Skip FAQ-style questions — too long for ToC
    if (raw.startsWith("Q: ")) continue;

    // Strip markdown formatting so text/ID matches rendered MDX output
    const text = raw.replace(/[*_`[\]()]/g, "");
    headings.push({ id: slugify(text), text, level });
  }

  return headings;
}
