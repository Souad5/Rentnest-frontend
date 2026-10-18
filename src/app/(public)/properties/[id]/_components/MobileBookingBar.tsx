'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { RentalRequestForm } from '@/components/forms/RentalRequestForm';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { formatPrice } from '@/lib/format';

interface MobileBookingBarProps {
    propertyId: string;
    title: string;
    price: number;
    isAvailable: boolean;
    avgRating: number;
    reviewCount: number;
    defaultStartDate?: string;
    defaultEndDate?: string;
}

/** Bottom bar (below lg) that opens the booking form in a bottom sheet. */
export function MobileBookingBar({
    propertyId,
    title,
    price,
    isAvailable,
    avgRating,
    reviewCount,
    defaultStartDate,
    defaultEndDate,
}: MobileBookingBarProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Sticky (not fixed) so it parks above the footer at the end of the page. */}
            <div className="sticky bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
                    <div className="min-w-0">
                        <p className="text-foreground">
                            <span className="font-serif text-xl font-semibold">{formatPrice(price)}</span>
                            <span className="text-xs text-muted-foreground"> / month</span>
                        </p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            {reviewCount > 0 ? (
                                <>
                                    <Star className="h-3 w-3 fill-highlight text-highlight" />
                                    <span className="font-medium text-foreground">{avgRating.toFixed(1)}</span> ({reviewCount})
                                </>
                            ) : isAvailable ? (
                                'Available now'
                            ) : (
                                'Currently rented'
                            )}
                        </p>
                    </div>
                    <Button className="h-11 shrink-0 rounded-xl px-5 font-semibold" onClick={() => setOpen(true)} disabled={!isAvailable}>
                        {isAvailable ? 'Request to rent' : 'Rented'}
                    </Button>
                </div>
            </div>

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent side="bottom" className="max-h-[90dvh] overflow-y-auto rounded-t-2xl">
                    <SheetHeader className="pb-0">
                        <SheetTitle className="font-serif text-lg">Request to rent</SheetTitle>
                        <SheetDescription className="line-clamp-1">
                            {title} · {formatPrice(price)} / month
                        </SheetDescription>
                    </SheetHeader>
                    <div className="px-4 pb-6">
                        <RentalRequestForm
                            propertyId={propertyId}
                            propertyTitle={title}
                            price={price}
                            isAvailable={isAvailable}
                            defaultStartDate={defaultStartDate}
                            defaultEndDate={defaultEndDate}
                        />
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
