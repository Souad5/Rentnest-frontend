import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { AuthFormSkeleton } from '@/components/auth/AuthFormSkeleton';

export const metadata: Metadata = {
    title: 'Sign in',
    description: 'Sign in to RentNest to manage your rental requests, payments, reviews and property listings.',
};

export default function LoginPage() {
    return (
        <Suspense fallback={<AuthFormSkeleton fields={2} />}>
            <LoginForm />
        </Suspense>
    );
}
