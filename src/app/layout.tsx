import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import QueryProvider from '@/providers/QueryProvider';
import './globals.css';
import Navbar from '@/components/shared/Navbar';
import { AuthProvider } from '@/providers/AuthProvider';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'RentNest | Find & Manage Rental Properties',
  description: 'A modern platform for tenants, landlords, and administrators.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className={`${jakarta.variable} font-sans antialiased min-h-full flex flex-col bg-background text-foreground`}>
        <AuthProvider>
          <QueryProvider>
            {/* Main Navigation */}
            <Navbar />

            {/* Page Content */}
            <main className="flex-1">{children}</main>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}