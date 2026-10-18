import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { ChatAssistant } from '@/components/ai/ChatAssistant';

export default function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <>
            <Navbar />
            <main className="flex-1 bg-background">{children}</main>
            <Footer />
            <ChatAssistant />
        </>
    );
}
