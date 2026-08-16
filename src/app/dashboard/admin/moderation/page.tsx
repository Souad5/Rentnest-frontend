'use client';

import { useState } from 'react';
import { ShieldAlert, CheckCircle, XCircle, Building2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/shared/StatusBadge';
import { MOCK_PROPERTIES } from '@/constants/mockProperties';

export default function AdminModerationPage() {
    const [properties, setProperties] = useState(MOCK_PROPERTIES);

    const handleApprove = (id: string) => {
        setProperties((prev) =>
            prev.map((item) => (item.id === id ? { ...item, isAvailable: true } : item))
        );
    };

    const handleReject = (id: string) => {
        setProperties((prev) =>
            prev.map((item) => (item.id === id ? { ...item, isAvailable: false } : item))
        );
    };

    return (
        <div className="space-y-6 py-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Content Moderation</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Review, approve, or flag submitted property listings before they go live.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {properties.map((property) => (
                    <Card key={property.id} className="border-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-primary" />
                                {property.title}
                            </CardTitle>
                            <StatusBadge status={property.isAvailable ? 'AVAILABLE' : 'RENTED'} />
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-muted-foreground">
                                <span>Location: {property.location}</span>
                                <span className="font-semibold text-foreground">${property.price} / month</span>
                            </div>

                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {property.description}
                            </p>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                                <Button variant="outline" size="sm" className="gap-1.5">
                                    <Eye className="h-4 w-4" /> Inspect
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5 text-destructive hover:bg-destructive/10"
                                    onClick={() => handleReject(property.id)}
                                >
                                    <XCircle className="h-4 w-4" /> Reject
                                </Button>
                                <Button
                                    size="sm"
                                    className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                                    onClick={() => handleApprove(property.id)}
                                >
                                    <CheckCircle className="h-4 w-4" /> Approve
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {properties.length === 0 && (
                    <div className="text-center py-12 border border-dashed border-border rounded-xl">
                        <ShieldAlert className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No pending properties found for moderation.</p>
                    </div>
                )}
            </div>
        </div>
    );
}