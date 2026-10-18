'use client';

import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { PropertyForm } from '@/components/dashboard/landlord/PropertyForm';

export default function NewPropertyPage() {
    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <DashboardPageHeader
                title="Add a property"
                description="List a home in a few minutes. You can edit it or pause it at any time."
            />
            <PropertyForm mode="create" />
        </div>
    );
}
