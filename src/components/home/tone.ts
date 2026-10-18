/** Alternating section backgrounds for the home page rhythm. */
export type SectionTone = 'plain' | 'muted';

export const toneClass: Record<SectionTone, string> = {
    plain: 'bg-background',
    muted: 'bg-muted/40',
};
