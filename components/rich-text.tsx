import { Fragment } from 'react';

// Plain text from the admin, rendered with its structure: blank lines split paragraphs,
// lines starting with •, - or * become a list, and single line breaks are kept.
const bullet = /^\s*[•\-–*]\s+/;

export function RichText({ text, className = '' }: { text: string; className?: string }) {
  const blocks: ({ type: 'p'; lines: string[] } | { type: 'ul'; items: string[] })[] = [];
  for (const raw of text.split('\n')) {
    const line = raw.trimEnd();
    const last = blocks[blocks.length - 1];
    if (!line.trim()) { blocks.push({ type: 'p', lines: [] }); continue; }
    if (bullet.test(line)) {
      if (last?.type === 'ul') last.items.push(line.replace(bullet, ''));
      else blocks.push({ type: 'ul', items: [line.replace(bullet, '')] });
    } else if (last?.type === 'p' && last.lines.length) last.lines.push(line.trim());
    else blocks.push({ type: 'p', lines: [line.trim()] });
  }
  return <div className={`rich-text ${className}`}>
    {blocks.map((block, index) => block.type === 'ul'
      ? <ul key={index}>{block.items.map((item, i) => <li key={i}>{item}</li>)}</ul>
      : block.lines.length ? <p key={index}>{block.lines.map((line, i) => <Fragment key={i}>{i > 0 && <br/>}{line}</Fragment>)}</p> : null)}
  </div>;
}
