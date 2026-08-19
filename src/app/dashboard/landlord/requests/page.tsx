'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, X, Clock, User, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RentalRequest {
    id: string;
    propertyTitle: string;
    tenantName: string;
    tenantEmail: string;
    moveInDate: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export default function LandlordRequestsPage() {
    const [requests, setRequests] = useState<RentalRequest[]>([
        {
            id: 'req_1',
            propertyTitle: 'Luxury Skyline Apartment',
            tenantName: 'John Doe',
            tenantEmail: 'john@example.com',
            moveInDate: '2026-09-01',
            status: 'PENDING',
        },
    ]);

    // Optimistic Status Update with Toast feedback trigger
    const handleUpdateStatus = async (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
        // 1. Optimistically update local state immediately
        setRequests((prev) =>
            prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
        );

        try {
            // 2. Call API PATCH /api/landlord/requests/:id
            // await api.patch(`/api/landlord/requests/${id}`, { status: newStatus });
            console.log(`Request ${id} updated to ${newStatus}`);
        } catch (error) {
            console.error('Failed to update request status:', error);
            // Revert state if backend call fails
        }
    };

    return (
        <div className="space-y-6">
            <Button variant="ghost" asChild className="gap-2 text-muted-foreground">
                <Link href="/dashboard/landlord">
                    <ArrowLeft className="h-4 w-4" /> Back to Overview
                </Link>
            </Button>

            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Incoming Rental Requests</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Review tenant requests for your properties. Approved requests enable tenants to proceed to payment.
                </p>
            </div>

            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground font-semibold">
                            <tr>
                                <th className="px-6 py-4">Tenant Info</th>
                                <th className="px-6 py-4">Property</th>
                                <th className="px-6 py-4">Move-in Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {requests.map((req) => (
                                <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs shrink-0">
                                                <User className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">{req.tenantName}</p>
                                                <p className="text-xs text-muted-foreground">{req.tenantEmail}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-foreground">
                                        <div className="flex items-center gap-2">
                                            <Building className="h-4 w-4 text-muted-foreground" />
                                            <span>{req.propertyTitle}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">{req.moveInDate}</td>
                                    <td className="px-6 py-4">
                                        {req.status === 'PENDING' && (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                                <Clock className="h-3 w-3" /> Pending
                                            </span>
                                        )}
                                        {req.status === 'APPROVED' && (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                                <Check className="h-3 w-3" /> Approved
                                            </span>
                                        )}
                                        {req.status === 'REJECTED' && (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                                <X className="h-3 w-3" /> Rejected
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {req.status === 'PENDING' ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                                                >
                                                    <Check className="h-4 w-4" /> Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                                                    className="gap-1"
                                                >
                                                    <X className="h-4 w-4" /> Reject
                                                </Button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground font-medium italic">
                                                Action Taken
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}