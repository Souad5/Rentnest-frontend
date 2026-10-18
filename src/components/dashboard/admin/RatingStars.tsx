import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RatingStars({ rating, className }: { rating: number; className?: string }) {
    return (
        <div className={cn('flex items-center gap-0.5', className)} role="img" aria-label={`${rating} out of 5 stars`}>
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    className={cn('h-3.5 w-3.5', i < Math.round(rating) ? 'fill-highlight text-highlight' : 'text-muted-foreground/40')}
                />
            ))}
        </div>
    );
}
