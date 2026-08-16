import Link from 'next/link';
import { Building2 } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="border-t border-border bg-card text-card-foreground">
            <div className="container mx-auto px-4 py-8 sm:px-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Building2 className="h-4 w-4" />
                        </div>
                        <span className="font-bold">RentNest</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} RentNest. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}