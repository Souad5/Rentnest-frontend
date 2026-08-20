'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldAlert,
    Eye,
    Loader2,
    MapPin,
    User,
    Building2,
    Mail,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { adminApi } from '@/lib/api';

interface Property {
    id: string;
    title: string;
    description: string;
    address: string;
    location: string;
    price: number;
    isAvailable: boolean;
    category?: { name: string };
    landlord?: { name: string; email: string };
}

export default function AdminModerationPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAdminProperties() {
            try {
                const res = await adminApi.getProperties();
                if (res.success && Array.isArray(res.data)) {
                    setProperties(res.data);
                }
            } catch (err) {
                console.error('Failed to load system properties:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchAdminProperties();
    }, []);

    return (
        <div className="space-y-6 py-6 max-w-7xl mx-auto px-4 sm:px-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Content Moderation
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Inspect property listings, audit availability, and verify landlord submissions.
                    </p>
                </div>
                <div className="text-xs font-mono text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md border border-border self-start sm:self-center">
                    Total Listings: {properties.length}
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-16 space-y-3">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Fetching listings data...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence>
                        {properties.map((property) => (
                            <motion.div
                                key={property.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="group flex flex-col rounded-xl border border-border bg-card p-5 hover:shadow-md transition-all duration-300 justify-between space-y-4"
                            >
                                {/* Top Badges & Status Header */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <Badge
                                            variant="secondary"
                                            className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 ${property.isAvailable
                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                                : 'bg-destructive/10 text-destructive border border-destructive/20'
                                                }`}
                                        >
                                            {property.isAvailable ? 'Available' : 'Unavailable'}
                                        </Badge>

                                        {property.category?.name && (
                                            <Badge
                                                variant="outline"
                                                className="text-[10px] font-medium border-border"
                                            >
                                                {property.category.name}
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Main Title & Location */}
                                    <div className="space-y-1">
                                        <h3 className="font-semibold text-foreground text-base line-clamp-1 group-hover:text-primary transition-colors flex items-center gap-1.5">
                                            <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                                            <span>{property.title}</span>
                                        </h3>

                                        <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                                            <span className="truncate">
                                                {property.location}
                                                {property.address ? `, ${property.address}` : ''}
                                            </span>
                                        </p>
                                    </div>

                                    {/* Description */}
                                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed pt-1">
                                        {property.description}
                                    </p>
                                </div>

                                {/* Footer Info & Action Button */}
                                <div className="pt-3 border-t border-border/60 space-y-3">
                                    {/* Landlord Info */}
                                    <div className="flex items-center justify-between text-xs text-muted-foreground gap-2">
                                        <div className="flex items-center gap-1.5 truncate">
                                            <User className="h-3.5 w-3.5 shrink-0" />
                                            <span className="truncate font-medium text-foreground">
                                                {property.landlord?.name || 'Unknown'}
                                            </span>
                                        </div>
                                        {property.landlord?.email && (
                                            <span className="flex items-center gap-1 text-[11px] truncate text-muted-foreground/80">
                                                <Mail className="h-3 w-3 shrink-0" />
                                                <span className="truncate">{property.landlord.email}</span>
                                            </span>
                                        )}
                                    </div>

                                    {/* Price & Inspect Button */}
                                    <div className="flex items-center justify-between pt-1">
                                        <div>
                                            <span className="text-base font-bold text-foreground">
                                                ${property.price}
                                            </span>
                                            <span className="text-xs text-muted-foreground font-normal">
                                                {' '}
                                                / month
                                            </span>
                                        </div>

                                        <Button
                                            asChild
                                            size="sm"
                                            variant="outline"
                                            className="h-8 text-xs gap-1.5 rounded-lg hover:bg-foreground hover:text-background transition-colors"
                                        >
                                            <Link href={`/properties/${property.id}`}>
                                                <Eye className="h-3.5 w-3.5" />
                                                <span>Inspect</span>
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {properties.length === 0 && (
                        <div className="col-span-full text-center py-16 border border-dashed border-border rounded-xl bg-card">
                            <ShieldAlert className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm font-medium text-foreground">No Listings Found</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                There are currently no property listings registered in the database.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}