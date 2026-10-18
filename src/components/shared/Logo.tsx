import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

export function Logo({ className, onClick, inverted = false }: { className?: string; onClick?: () => void; inverted?: boolean }) {
    return (
        <Link href="/" onClick={onClick} className={cn('flex items-center gap-2', className)} aria-label={`${siteConfig.name} home`}>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Building2 className="h-5 w-5" />
            </span>
            <span className={cn('font-serif text-xl font-semibold tracking-tight', inverted ? 'text-ink-foreground' : 'text-foreground')}>
                Rent<span className="text-primary">Nest</span>
            </span>
        </Link>
    );
}
