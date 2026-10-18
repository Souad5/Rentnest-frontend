import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import QueryProvider from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { siteConfig } from '@/config/site';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
    subsets: ['latin'],
    variable: '--font-jakarta',
    weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
    title: {
        default: `${siteConfig.name} | Find & Manage Rental Properties`,
        template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className="h-full scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning>
            <body
                className={`${jakarta.variable} font-sans antialiased min-h-full flex flex-col bg-background text-foreground`}
                suppressHydrationWarning
            >
                <ThemeProvider>
                    <AuthProvider>
                        <QueryProvider>{children}</QueryProvider>
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
