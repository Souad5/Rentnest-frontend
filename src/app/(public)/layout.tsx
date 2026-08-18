// src/app/(public)/layout.tsx
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';

export default function PublicLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <>
            {/* Main Navigation */}
            <Navbar />

            {/* Page Content */}
            <main className="flex-1 bg-[#f4f3f0]">{children}</main>

            {/* Footer */}
            <div className="bg-[#f4f3f0]">
                <Footer />
            </div>
        </>
    );
}