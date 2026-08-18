'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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

    // Fetch user profile and property listings
    const fetchData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // 1. Get logged-in user info from localStorage / Auth context
            let currentUser: LoggedInUser | null = null;
            const authDataString = localStorage.getItem('user') || localStorage.getItem('auth');

            if (authDataString) {
                const parsed = JSON.parse(authDataString);
                currentUser = parsed.user || parsed.data?.user || parsed;
            }

            if (currentUser) {
                setUser(currentUser);
            }

            // 2. Fetch all properties from backend
            const res = await fetch(`${BASE_URL}/properties`);
            if (!res.ok) {
                throw new Error(`Failed to fetch properties (${res.status})`);
            }

            const json = await res.json();
            const allProperties: Property[] = Array.isArray(json)
                ? json
                : json.data || [];

            // 3. Filter properties matching the logged-in Landlord's ID
            if (currentUser?.id) {
                const filtered = allProperties.filter(
                    (p) => p.landlordId === currentUser.id
                );
                setProperties(filtered);
            } else {
                setProperties(allProperties);
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error('Error loading dashboard data:', err);
            setError(err.message || 'Could not load properties from server.');
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
            // Optimistic fallback
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


    return (
        <div className="space-y-8 py-4 max-w-7xl mx-auto px-4 sm:px-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Landlord Dashboard
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Welcome back,{' '}
                        <span className="font-semibold text-foreground">
                            {user?.name || 'Landlord'}
                        </span>
                        . Showing properties created by you.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={fetchData}
                        title="Refresh data"
                        disabled={isLoading}
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button asChild className="gap-2">
                        <Link href="/dashboard/landlord/properties/new">
                            <Plus className="h-4 w-4" /> Add New Property
                        </Link>
                    </Button>
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

            {/* Metrics Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl border border-border bg-card shadow-xs flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary">
                        <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">My Total Listings</p>
                        <p className="text-2xl font-bold">{properties.length}</p>
                    </div>
                </div>

                <div className="p-5 rounded-2xl border border-border bg-card shadow-xs flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">Available Properties</p>
                        <p className="text-2xl font-bold">
                            {properties.filter((p) => p.isAvailable).length}
                        </p>
                    </div>
                </div>

                <div className="p-5 rounded-2xl border border-border bg-card shadow-xs flex items-center gap-4">
                    <div className="p-3 bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400">
                        <FileText className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">Incoming Requests</p>
                        <Button variant="link" asChild className="p-0 h-auto font-bold text-lg text-foreground">
                            <Link href="/dashboard/landlord/requests">Manage Requests →</Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Loading Spinner State */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3 border border-dashed border-border rounded-2xl">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading your listings...</p>
                </div>
            ) : properties.length > 0 ? (
                /* Property Listings Data Table */
                <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Property</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Location</th>
                                    <th className="px-6 py-4">Price</th>
                                    <th className="px-6 py-4">Availability</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {properties.map((property) => (
                                    <tr key={property.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative h-12 w-16 overflow-hidden rounded-lg bg-muted shrink-0">
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
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                                {property.category?.name || 'Standard'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">{property.location}</td>
                                        <td className="px-6 py-4 font-semibold text-foreground">${property.price}/mo</td>
                                        <td className="px-6 py-4">
                                            <button
                                                // Change line in JSX:
                                                onClick={() => handleToggleAvailability(property.id, property.isAvailable ?? true)}
                                                className="cursor-pointer"
                                            >
                                                {property.isAvailable ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                        <CheckCircle className="h-3 w-3" /> Available
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                                        <Clock className="h-3 w-3" /> Occupied / Off
                                                    </span>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                    <Link href={`/properties/${property.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                    <Link href={`/dashboard/landlord/properties/${property.id}/edit`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(property.id)}
                                                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
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
            ) : (
                <div className="text-center py-16 border border-dashed border-border rounded-2xl p-8 space-y-4">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">No properties listed yet</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                        You haven&apos;t created any property listings under ID{' '}
                        <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{user?.id}</code>.
                    </p>
                    <Button asChild>
                        <Link href="/dashboard/landlord/properties/new">
                            <Plus className="h-4 w-4 mr-2" /> Create Listing
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    );
}