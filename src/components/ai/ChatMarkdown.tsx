import { Fragment } from 'react';

/** Renders **bold** segments as <strong>; everything else is plain text. */
function renderInline(text: string, keyPrefix: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
    return parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') && part.length > 4 ? (
            <strong key={`${keyPrefix}-${i}`} className="font-semibold">
                {part.slice(2, -2)}
            </strong>
        ) : (
            <Fragment key={`${keyPrefix}-${i}`}>{part.replace(/(^|\s)\*(\S[^*]*\S|\S)\*(?=\s|$|[.,!?])/g, '$1$2')}</Fragment>
        ),
    );
}

type Block = { type: 'p'; lines: string[] } | { type: 'ul' | 'ol'; items: string[] };

const BULLET = /^\s*[-*•]\s+/;
const NUMBERED = /^\s*\d+[.)]\s+/;
const HEADING = /^\s*#{1,6}\s+/;

function parseBlocks(source: string): Block[] {
    const blocks: Block[] = [];
    for (const raw of source.replace(/\r\n/g, '\n').split('\n')) {
        const line = raw.trimEnd();
        const last = blocks[blocks.length - 1];
        if (!line.trim()) {
            blocks.push({ type: 'p', lines: [] });
            continue;
        }
        if (BULLET.test(line) || NUMBERED.test(line)) {
            const type = BULLET.test(line) ? 'ul' : 'ol';
            const item = line.replace(type === 'ul' ? BULLET : NUMBERED, '');
            if (last && last.type === type) last.items.push(item);
            else blocks.push({ type, items: [item] });
            continue;
        }
        const text = line.replace(HEADING, '');
        if (last && last.type === 'p') last.lines.push(text);
        else blocks.push({ type: 'p', lines: [text] });
    }
    return blocks.filter((b) => (b.type === 'p' ? b.lines.length > 0 : b.items.length > 0));
}

/**
 * Safe, minimal markdown for assistant replies: paragraphs, **bold** and
 * bullet / numbered lists. Output is React text nodes only — no raw HTML.
 */
export function ChatMarkdown({ content }: { content: string }) {
    const blocks = parseBlocks(content);
    return (
        <div className="space-y-2">
            {blocks.map((block, i) => {
                if (block.type === 'p') {
                    return (
                        <p key={i} className="leading-relaxed">
                            {block.lines.map((line, j) => (
                                <Fragment key={j}>
                                    {j > 0 && <br />}
                                    {renderInline(line, `${i}-${j}`)}
                                </Fragment>
                            ))}
                        </p>
                    );
                }
                const ListTag = block.type;
                return (
                    <ListTag
                        key={i}
                        className={
                            block.type === 'ul'
                                ? 'list-disc space-y-1 pl-5 marker:text-primary'
                                : 'list-decimal space-y-1 pl-5 marker:text-primary'
                        }
                    >
                        {block.items.map((item, j) => (
                            <li key={j} className="leading-relaxed">
                                {renderInline(item, `${i}-${j}`)}
                            </li>
                        ))}
                    </ListTag>
                );
            })}
        </div>
    );
}
