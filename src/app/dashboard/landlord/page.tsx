'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Edit,
    Trash2,
    Eye,
    Building2,
    CheckCircle,
    Clock,
    FileText,
    RefreshCw,
    Loader2,
    Search,
    MapPin,
    ArrowUpRight,
    Sparkles,
    LayoutGrid,
    ListFilter,
    DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Property } from '@/types/api';

const BASE_URL = (
    process.env.NEXT_PUBLIC_API_URL || 'https://rentnest-backend-five.vercel.app/api'
).replace(/\/$/, '');

export interface LoggedInUser {
    id: string;
    name: string;
    email: string;
    role: string;
}

export default function LandlordDashboardPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<LoggedInUser | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');

    // Fetch user profile and property listings
    const fetchData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            let currentUser: LoggedInUser | null = null;
            const authDataString = localStorage.getItem('user') || localStorage.getItem('auth');

            if (authDataString) {
                const parsed = JSON.parse(authDataString);
                currentUser = parsed.user || parsed.data?.user || parsed;
            }

            if (currentUser) {
                setUser(currentUser);
            }

            const res = await fetch(`${BASE_URL}/properties`);
            if (!res.ok) {
                throw new Error(`Failed to fetch properties (${res.status})`);
            }

            const json = await res.json();
            const allProperties: Property[] = Array.isArray(json)
                ? json
                : json.data || [];

            if (currentUser?.id) {
                const filtered = allProperties.filter(
                    (p) => p.landlordId === currentUser.id
                );
                setProperties(filtered);
            } else {
                setProperties(allProperties);
            }
        } catch (err: unknown) {
            console.error('Error loading dashboard data:', err);
            const message = err instanceof Error ? err.message : 'Could not load properties from server.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchData();
    }, []);

    // Delete handler
    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this listing?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${BASE_URL}/properties/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                setProperties((prev) => prev.filter((p) => p.id !== id));
            } else {
                alert('Failed to delete property');
            }
        } catch (err) {
            console.error('Delete error:', err);
            setProperties((prev) => prev.filter((p) => p.id !== id));
        }
    };

    // Availability Toggle handler
    const handleToggleAvailability = async (id: string, currentStatus?: boolean) => {
        const isCurrentlyAvailable = currentStatus ?? true;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${BASE_URL}/properties/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ isAvailable: !isCurrentlyAvailable }),
            });

            if (res.ok) {
                setProperties((prev) =>
                    prev.map((p) =>
                        p.id === id ? { ...p, isAvailable: !isCurrentlyAvailable } : p
                    )
                );
            }
        } catch (err) {
            console.error('Toggle error:', err);
            setProperties((prev) =>
                prev.map((p) =>
                    p.id === id ? { ...p, isAvailable: !isCurrentlyAvailable } : p
                )
            );
        }
    };

    const filteredProperties = properties.filter(
        (p) =>
            p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const availableCount = properties.filter((p) => p.isAvailable).length;
    const occupiedCount = properties.length - availableCount;

    return (
        <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6">
            {/* Top Banner / Hero Header */}
            <div className="relative overflow-hidden rounded-3xl bg-neutral-900 text-white p-6 sm:p-8 shadow-2xl">
                <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-white/80 border border-white/10">
                            <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Landlord Portal
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                            Welcome back, {user?.name || 'Landlord'}
                        </h1>
                        <p className="text-sm text-neutral-400 max-w-md">
                            Manage your real estate portfolio, view tenant interest, and optimize your rental availability.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={fetchData}
                            title="Refresh data"
                            disabled={isLoading}
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white rounded-full h-11 w-11"
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button asChild className="h-11 px-6 rounded-full bg-white text-neutral-900 hover:bg-neutral-100 font-semibold shadow-lg">
                            <Link href="/dashboard/landlord/properties/new">
                                <Plus className="h-4 w-4 mr-2" /> Add New Property
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center justify-between">
                    <span>{error}</span>
                    <Button variant="outline" size="sm" onClick={fetchData}>
                        Try Again
                    </Button>
                </div>
            )}

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-card shadow-xs flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Total Listings</p>
                        <p className="text-3xl font-extrabold text-foreground">{properties.length}</p>
                    </div>
                    <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-2xl text-foreground">
                        <Building2 className="h-6 w-6" />
                    </div>
                </div>

                <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-card shadow-xs flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Available Properties</p>
                        <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{availableCount}</p>
                    </div>
                    <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="h-6 w-6" />
                    </div>
                </div>

                <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-card shadow-xs flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Occupied / Paused</p>
                        <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">{occupiedCount}</p>
                    </div>
                    <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-600 dark:text-amber-400">
                        <Clock className="h-6 w-6" />
                    </div>
                </div>

                <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-card shadow-xs flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Tenant Requests</p>
                        <Link href="/dashboard/landlord/requests" className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline mt-1">
                            Manage Requests <ArrowUpRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                        <FileText className="h-6 w-6" />
                    </div>
                </div>
            </div>

            {/* Filter and View Toggle Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search properties or city..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-11 rounded-xl border-neutral-200 dark:border-neutral-800"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <div className="bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl flex items-center">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg text-xs font-medium transition-colors ${viewMode === 'grid' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground'
                                }`}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-lg text-xs font-medium transition-colors ${viewMode === 'table' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground'
                                }`}
                        >
                            <ListFilter className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl bg-card">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Syncing your property portfolio...</p>
                </div>
            ) : filteredProperties.length > 0 ? (
                viewMode === 'grid' ? (
                    /* Modern Grid View */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredProperties.map((property) => (
                                <motion.div
                                    key={property.id}
                                    layout
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="group rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-card overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                                >
                                    <div>
                                        {/* Image & Badges */}
                                        <div className="relative h-48 w-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                                            <Image
                                                src={property.images?.[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'}
                                                alt={property.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute top-3 left-3 flex items-center gap-2">
                                                <Badge className="bg-black/60 backdrop-blur-md text-white border-0">
                                                    {property.category?.name || 'Standard'}
                                                </Badge>
                                            </div>

                                            <div className="absolute top-3 right-3">
                                                <button
                                                    onClick={() => handleToggleAvailability(property.id, property.isAvailable ?? true)}
                                                    className="cursor-pointer"
                                                >
                                                    {property.isAvailable ? (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white shadow-md">
                                                            <CheckCircle className="h-3.5 w-3.5" /> Available
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white shadow-md">
                                                            <Clock className="h-3.5 w-3.5" /> Off / Occupied
                                                        </span>
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-5 space-y-2">
                                            <h3 className="font-bold text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                                {property.title}
                                            </h3>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <MapPin className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                                                <span className="truncate">{property.address || property.location}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Footer / Actions */}
                                    <div className="px-5 pb-5 pt-3 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between">
                                        <div className="flex items-baseline gap-0.5">
                                            <DollarSign className="h-4 w-4 text-foreground -mr-0.5" />
                                            <span className="text-xl font-extrabold text-foreground">{property.price}</span>
                                            <span className="text-xs text-muted-foreground font-medium">/mo</span>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground">
                                                <Link href={`/properties/${property.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground">
                                                <Link href={`/dashboard/landlord/properties/${property.id}/edit`}>
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(property.id)}
                                                className="h-9 w-9 rounded-full text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    /* Modern Table View */
                    <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-card overflow-hidden shadow-xs">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800 text-xs uppercase text-muted-foreground font-semibold">
                                    <tr>
                                        <th className="px-6 py-4">Property</th>
                                        <th className="px-6 py-4">Category</th>
                                        <th className="px-6 py-4">Location</th>
                                        <th className="px-6 py-4">Price</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                    {filteredProperties.map((property) => (
                                        <tr key={property.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative h-12 w-16 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800 shrink-0">
                                                        <Image
                                                            src={property.images?.[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'}
                                                            alt={property.title}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-foreground line-clamp-1">{property.title}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {property.address || property.location}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-foreground">
                                                    {property.category?.name || 'Standard'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">{property.location}</td>
                                            <td className="px-6 py-4 font-bold text-foreground">${property.price}/mo</td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleToggleAvailability(property.id, property.isAvailable ?? true)}
                                                    className="cursor-pointer"
                                                >
                                                    {property.isAvailable ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                            <CheckCircle className="h-3 w-3" /> Available
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                                            <Clock className="h-3 w-3" /> Occupied / Off
                                                        </span>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground">
                                                        <Link href={`/properties/${property.id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground">
                                                        <Link href={`/dashboard/landlord/properties/${property.id}/edit`}>
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(property.id)}
                                                        className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            ) : (
                /* Empty State */
                <div className="text-center py-20 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 space-y-4 bg-card">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400">
                        <Building2 className="h-7 w-7" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold">No properties listed yet</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                            Start adding listings to manage bookings and track requests for your properties.
                        </p>
                    </div>
                    <Button asChild className="rounded-full h-11 px-6">
                        <Link href="/dashboard/landlord/properties/new">
                            <Plus className="h-4 w-4 mr-2" /> Create First Listing
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    );
}