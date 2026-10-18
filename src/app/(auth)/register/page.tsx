import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { AuthFormSkeleton } from '@/components/auth/AuthFormSkeleton';

export const metadata: Metadata = {
    title: 'Create an account',
    description: 'Join RentNest free as a tenant to find and rent homes, or as a landlord to list your properties.',
};

export default function RegisterPage() {
    return (
        <Suspense fallback={<AuthFormSkeleton fields={4} />}>
            <RegisterForm />
        </Suspense>
    );
}
