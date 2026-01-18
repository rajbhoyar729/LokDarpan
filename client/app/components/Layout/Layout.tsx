import { useState, useEffect } from "react";
import { Header } from "~/components/Header/Header";
import { Sidebar } from "~/components/Sidebar/Sidebar";

interface LayoutProps {
    children: React.ReactNode;
    user?: {
        channelName: string;
        logoUrl?: string;
    } | null;
    hideSidebar?: boolean;
}

export function Layout({ children, user, hideSidebar = false }: LayoutProps) {
    const [scrolled, setScrolled] = useState(false);

    // Background parallax effect
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
        };

        window.addEventListener("scroll", handleScroll);
        window.addEventListener("mousemove", handleMouseMove);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    return (
        <div className="min-h-screen bg-dark-950 text-white selection:bg-primary-500/30 font-sans">
            {/* Ambient Background Glows that follow mouse subtly */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div
                    className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-500/5 rounded-full blur-[100px] transition-transform duration-1000 ease-out"
                    style={{ transform: `translate(${mousePosition.x * 50}px, ${mousePosition.y * 50}px)` }}
                />
                <div
                    className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-500/5 rounded-full blur-[120px] transition-transform duration-1000 ease-out"
                    style={{ transform: `translate(${-mousePosition.x * 50}px, ${-mousePosition.y * 50}px)` }}
                />
            </div>

            <Header user={user} />

            {/* Main Container */}
            <div className="relative z-10 flex pt-24 px-4 md:px-6 max-w-[1920px] mx-auto gap-6">
                {!hideSidebar && (
                    <aside className="w-[72px] lg:w-64 shrink-0 hidden md:block sticky top-24 h-[calc(100vh-8rem)]">
                        <Sidebar />
                    </aside>
                )}

                <main className="flex-1 w-full min-w-0 pb-12">
                    {children}
                </main>
            </div>
        </div>
    );
}
