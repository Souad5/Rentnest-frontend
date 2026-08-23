import Image from 'next/image';
import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyGalleryProps {
    images: string[];
    title: string;
    badge?: React.ReactNode;
}

export function PropertyGallery({ images, title, badge }: PropertyGalleryProps) {
    const [hero, ...rest] = images;

    if (!hero) {
        return (
            <div className="flex items-center justify-center rounded-3xl border border-border bg-muted aspect-video">
                <Building2 className="h-10 w-10 text-muted-foreground/40" />
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div
                className={cn(
                    'relative w-full overflow-hidden rounded-3xl border border-border bg-muted shadow-xs',
                    rest.length > 0 ? 'h-60 sm:h-72 lg:h-[420px]' : 'h-56 sm:h-64 lg:h-80'
                )}
            >
                <Image
                    src={hero}
                    alt={title}
                    fill
                    priority
                    sizes="(max-width: 1280px) 100vw, 1280px"
                    className="object-cover"
                />
                {badge && <div className="absolute top-4 left-4">{badge}</div>}
            </div>

            {rest.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {rest.slice(0, 4).map((imgUrl, index) => (
                        <div
                            key={`${imgUrl}-${index}`}
                            className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-muted"
                        >
                            <Image
                                src={imgUrl}
                                alt={`${title} photo ${index + 2}`}
                                fill
                                sizes="(max-width: 640px) 33vw, 200px"
                                className="object-cover transition-transform duration-300 hover:scale-105"
                            />
                        </div>
                    ))}
                    {rest.length > 4 && (
                        <div className="relative flex items-center justify-center aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-muted text-xs font-semibold text-muted-foreground">
                            +{rest.length - 4} more
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
