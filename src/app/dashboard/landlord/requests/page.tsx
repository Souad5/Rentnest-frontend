'use client';

import { useState } from 'react';
import { Search, Wrench, Calendar, CheckCircle, XCircle, Clock, Building2, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/shared/StatusBadge';

interface RequestItem {
    id: string;
    propertyTitle: string;
    tenantName: string;
    type: 'MAINTENANCE' | 'TOUR_REQUEST';
    title: string;
    description: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    createdAt: string;
}

const MOCK_REQUESTS: RequestItem[] = [
    {
        id: 'req-1',
        propertyTitle: 'Modern Luxury Apartment in Downtown',
        tenantName: 'Sarah Jenkins',
        type: 'MAINTENANCE',
        title: 'Leaking Kitchen Faucet',
        description: 'The kitchen sink faucet has a constant drip causing water to puddle under the cabinet.',
        priority: 'MEDIUM',
        status: 'PENDING',
        createdAt: '2026-02-14',
    },
    {
        id: 'req-2',
        propertyTitle: 'Cozy Waterfront Studio',
        tenantName: 'Alex Rivers',
        type: 'TOUR_REQUEST',
        title: 'In-person Viewing Request',
        description: 'Would like to schedule a walk-through on Saturday afternoon around 2 PM.',
        priority: 'LOW',
        status: 'PENDING',
        createdAt: '2026-02-15',
    },
    {
        id: 'req-3',
        propertyTitle: 'Spacious Family Villa with Garden',
        tenantName: 'Michael Chang',
        type: 'MAINTENANCE',
        title: 'HVAC Air Filter Replacement',
        description: 'Routine HVAC air filter replacement requested for the main unit.',
        priority: 'LOW',
        status: 'COMPLETED',
        createdAt: '2026-02-01',
    },
];

export default function LandlordRequestsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [requests, setRequests] = useState<RequestItem[]>(MOCK_REQUESTS);

    const filteredRequests = requests.filter(
        (req) =>
            req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.tenantName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const updateStatus = (id: string, newStatus: 'COMPLETED' | 'FAILED') => {
        setRequests((prev) =>
            prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
        );
    };

    return (
        <div className="space-y-6 py-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Maintenance & Service Requests</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Track, manage, and resolve repair issues and viewing requests submitted by tenants.
                    </p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by request, property, or tenant..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Requests List */}
            <div className="space-y-4">
                {filteredRequests.length > 0 ? (
                    filteredRequests.map((req) => (
                        <Card key={req.id} className="border-border">
                            <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                                            {req.type === 'MAINTENANCE' ? <Wrench className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
                                            {req.type.replace('_', ' ')}
                                        </span>
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded-md font-semibold ${req.priority === 'HIGH'
                                                ? 'bg-rose-500/10 text-rose-600'
                                                : req.priority === 'MEDIUM'
                                                    ? 'bg-amber-500/10 text-amber-600'
                                                    : 'bg-muted text-muted-foreground'
                                                }`}
                                        >
                                            {req.priority} PRIORITY
                                        </span>
                                    </div>
                                    <CardTitle className="text-lg font-bold text-foreground">{req.title}</CardTitle>
                                </div>
                                <StatusBadge status={req.status} />
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <Building2 className="h-3.5 w-3.5 text-primary" />
                                        <span>{req.propertyTitle}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <User className="h-3.5 w-3.5 text-primary" />
                                        <span>Requested by: {req.tenantName}</span>
                                    </div>
                                </div>

                                <p className="text-sm text-muted-foreground leading-relaxed bg-muted/40 p-3 rounded-lg border border-border">
                                    {req.description}
                                </p>

                                <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" /> Date Submitted: {req.createdAt}
                                    </span>

                                    {req.status === 'PENDING' && (
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-1.5 text-destructive hover:bg-destructive/10"
                                                onClick={() => updateStatus(req.id, 'FAILED')}
                                            >
                                                <XCircle className="h-4 w-4" /> Decline
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                                                onClick={() => updateStatus(req.id, 'COMPLETED')}
                                            >
                                                <CheckCircle className="h-4 w-4" /> Mark Resolved
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-12 border border-dashed border-border rounded-xl">
                        <Wrench className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No maintenance or service requests found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}