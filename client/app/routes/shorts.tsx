import { json, type MetaFunction, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Layout } from "~/components/Layout/Layout";
import { getUserFromSession } from "~/services/auth.server";

export const meta: MetaFunction = () => {
    return [{ title: "Shorts - LokDarpan" }];
};

// Mock Shorts Data with actual placeholder videos if available, else colors/gradients
const shortsData = [
    { id: "s1", title: "Wait for the drop! 🎵", channel: "MusicMakers", likes: 123000, comments: "1.2K", color: "#F59E0B", src: "https://www.w3schools.com/html/mov_bbb.mp4" },
    { id: "s2", title: "Satisfying cleanup 🧹", channel: "CleanTok", likes: 89000, comments: "450", color: "#14B8A6", src: "https://www.w3schools.com/html/movie.mp4" },
    { id: "s3", title: "Hidden secrets in Zelda 🎮", channel: "GameLore", likes: 230000, comments: "2K", color: "#8B5CF6", src: null },
];

export async function loader({ request }: LoaderFunctionArgs) {
    const userSession = await getUserFromSession(request);
    return json({ user: userSession?.user || null, shorts: shortsData });
}

export default function Shorts() {
    const { user, shorts } = useLoaderData<typeof loader>();
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

    // Handle scroll snap detection
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const index = Math.round(container.scrollTop / container.clientHeight);
            if (index !== activeIndex) {
                setActiveIndex(index);
                setIsPlaying(true); // Auto-play new video
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowUp") {
                e.preventDefault();
                container.scrollBy({ top: -container.clientHeight, behavior: "smooth" });
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                container.scrollBy({ top: container.clientHeight, behavior: "smooth" });
            } else if (e.key === " ") { // Spacebar to toggle play
                e.preventDefault();
                setIsPlaying(prev => !prev);
            } else if (e.key === "m") { // M to toggle mute
                setIsMuted(prev => !prev);
            }
        };

        container.addEventListener("scroll", handleScroll);
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            container.removeEventListener("scroll", handleScroll);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [activeIndex]);

    // Manage Video Playback
    useEffect(() => {
        videoRefs.current.forEach((video, index) => {
            if (!video) return;
            if (index === activeIndex) {
                video.currentTime = 0;
                if (isPlaying) video.play().catch(() => { });
                else video.pause();
            } else {
                video.pause();
            }
            video.muted = isMuted;
        });
    }, [activeIndex, isPlaying, isMuted]);

    const activeColor = shorts[activeIndex]?.color || "#14B8A6";

    return (
        <Layout user={user} hideSidebar={true}>
            <div className="fixed inset-0 pt-16 bg-dark-950 flex justify-center overflow-hidden">
                {/* Ambient Background */}
                <div
                    className="absolute inset-0 opacity-20 transition-colors duration-1000 ease-in-out blur-[100px]"
                    style={{ background: `radial-gradient(circle at center, ${activeColor}, transparent 70%)` }}
                />

                <div className="relative w-full max-w-[450px] h-full flex items-center justify-center">

                    {/* Navigation Hints (Desktop) */}
                    <div className="absolute -right-32 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4 text-dark-400 text-xs items-center">
                        <div className="flex flex-col items-center gap-1">
                            <kbd className="px-2 py-1 bg-white/10 rounded border border-white/10 font-sans">↑</kbd>
                            <kbd className="px-2 py-1 bg-white/10 rounded border border-white/10 font-sans">↓</kbd>
                            <span>Scroll</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <kbd className="px-2 py-1 bg-white/10 rounded border border-white/10 font-sans">Space</kbd>
                            <span>Play/Pause</span>
                        </div>
                    </div>

                    {/* Scroll Container */}
                    <div
                        ref={containerRef}
                        className="w-full h-[calc(100vh-80px)] overflow-y-scroll snap-y snap-mandatory scrollbar-hide rounded-2xl relative bg-black shadow-2xl"
                    >
                        {shorts.map((short, index) => (
                            <div
                                key={short.id}
                                className="w-full h-full snap-start relative flex items-center justify-center bg-dark-900 border-b border-dark-950"
                                onClick={() => setIsPlaying(p => !p)}
                            >
                                {/* Video Player / Placeholder */}
                                <div className="absolute inset-0 bg-dark-800 flex items-center justify-center overflow-hidden">
                                    {short.src ? (
                                        <video
                                            ref={el => videoRefs.current[index] = el}
                                            src={short.src}
                                            className="w-full h-full object-cover"
                                            loop
                                            playsInline
                                        />
                                    ) : (
                                        // Fallback for missing video
                                        <div className="w-full h-full flex items-center justify-center relative">
                                            <div className="absolute inset-0 opacity-30" style={{ backgroundColor: short.color }} />
                                            <span className="text-white/20 font-display text-4xl font-bold uppercase tracking-widest z-10">
                                                No Video Source
                                            </span>
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none" />

                                    {/* Play/Pause Icon Overlay */}
                                    {!isPlaying && index === activeIndex && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                                            <svg className="w-20 h-20 text-white/80" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                        </div>
                                    )}

                                    {/* Mute Indicator */}
                                    {isMuted && (
                                        <div className="absolute top-4 right-4 p-2 bg-black/40 rounded-full backdrop-blur pointer-events-none">
                                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" stroke="currentColor" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                                        </div>
                                    )}
                                </div>

                                {/* Content Overlay (Bottom) */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end gap-4 pointer-events-none">
                                    <div className="flex-1 pointer-events-auto">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white font-bold text-sm border border-white/20">
                                                {short.channel[0]}
                                            </div>
                                            <span className="font-bold text-white drop-shadow-md truncate max-w-[150px]">{short.channel}</span>
                                            <button
                                                className="px-4 py-1.5 bg-white text-black text-xs font-bold rounded-full hover:bg-gray-200 hover:scale-105 transition-all shadow-lg"
                                                onClick={(e) => { e.stopPropagation(); alert(`Subscribed to ${short.channel}`); }}
                                            >
                                                Subscribe
                                            </button>
                                        </div>
                                        <h2 className="text-white text-lg font-medium leading-tight drop-shadow-md mb-2 line-clamp-2">
                                            {short.title}
                                        </h2>
                                        <div className="flex items-center gap-2 text-white/80 text-xs">
                                            <svg className="w-3 h-3 animate-spin-slow" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>
                                            <span className="truncate max-w-[200px]">Original Sound - {short.channel}</span>
                                        </div>
                                    </div>

                                    {/* Actions Sidebar (Right) */}
                                    <div className="flex flex-col gap-6 items-center pb-4 pointer-events-auto">
                                        <ActionButton icon="heart" count={short.likes} active={false} />
                                        <ActionButton icon="message" count={short.comments} />
                                        <ActionButton icon="share" label="Share" />
                                        <button className="w-10 h-10 rounded-full bg-dark-800/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-dark-700 transition-colors">
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>
                                        </button>
                                        <div className="w-10 h-10 rounded-lg bg-dark-800 border-2 border-white/20 overflow-hidden animate-spin-slow shadow-lg">
                                            <div className="w-full h-full bg-gradient-to-tr from-primary-500 to-accent-500" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Return to Feed */}
                <Link to="/" className="fixed top-20 left-4 z-50 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full text-white text-xs font-medium hover:bg-white/10 transition-all border border-white/5 flex items-center gap-2 group">
                    <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Feed
                </Link>
            </div>
        </Layout>
    );
}

function ActionButton({ icon, count, label, active: initialActive }: { icon: string, count?: number | string, label?: string, active?: boolean }) {
    const [isActive, setIsActive] = useState(initialActive);
    const [scale, setScale] = useState(1);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsActive(!isActive);
        setScale(1.2); // Bounce effect
        setTimeout(() => setScale(1), 200);
    };

    return (
        <button
            className="flex flex-col items-center gap-1 group"
            onClick={handleClick}
        >
            <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${isActive ? 'bg-red-500 text-white' : 'bg-dark-800/60 backdrop-blur-sm text-white hover:bg-dark-700'}`}
                style={{ transform: `scale(${scale})` }}
            >
                {getIcon(icon, isActive)}
            </div>
            {(count || label) && <span className="text-white text-xs font-semibold drop-shadow-md">{formatCount(count)}</span>}
        </button>
    )
}

function formatCount(count?: number | string) {
    if (!count) return "";
    if (typeof count === 'string') return count;
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
}

function getIcon(name: string, filled?: boolean) {
    const className = "w-6 h-6";
    switch (name) {
        case "heart": return filled
            ? <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
            : <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fillOpacity="0" stroke="currentColor" strokeWidth="2" /></svg>;
        case "message": return <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" /></svg>;
        case "share": return <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.66 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" /></svg>;
        default: return null;
    }
}
