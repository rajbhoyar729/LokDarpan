import { Link } from "@remix-run/react";
import { useState } from "react";

interface VideoCardProps {
    id: string;
    title: string;
    thumbnailUrl?: string;
    channelName: string;
    channelLogo?: string;
    views: number;
    createdAt: string;
    duration?: number;
    isLive?: boolean;
    progress?: number;
    featured?: boolean; // New prop for bento layout
}

export function VideoCard({
    id,
    title,
    thumbnailUrl,
    channelName,
    channelLogo,
    views,
    createdAt,
    duration,
    isLive = false,
    progress = 0,
    featured = false,
}: VideoCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <article
            className={`lok-card group flex flex-col ${featured ? 'md:flex-row md:col-span-2 md:row-span-2' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link to={`/watch/${id}`} className={`block relative overflow-hidden ${featured ? 'md:w-3/5 h-full' : 'w-full aspect-video'}`}>
                {/* Thumbnail */}
                {thumbnailUrl ? (
                    <img
                        src={thumbnailUrl}
                        alt={title}
                        className={`w-full h-full object-cover transition-transform duration-700 ease-out ${isHovered ? 'scale-105' : 'scale-100'
                            }`}
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full bg-dark-800 flex items-center justify-center">
                        <svg className="w-12 h-12 text-dark-600" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                )}

                {/* Overlays */}
                <div className={`absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300`} />

                {/* Duration/Live Badge - Floating Style */}
                <div className="absolute top-3 right-3 flex gap-2">
                    {isLive && (
                        <span className="px-2 py-1 bg-red-500/90 backdrop-blur-md text-white text-xs font-bold rounded-lg animate-pulse shadow-lg">
                            LIVE
                        </span>
                    )}
                    {duration && (
                        <span className="px-2 py-1 bg-dark-900/80 backdrop-blur-md text-xs font-mono text-white rounded-lg border border-white/10">
                            {formatDuration(duration)}
                        </span>
                    )}
                </div>

                {/* Play Button Reveal */}
                <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}>
                    <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
                        <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                </div>

                {/* Progress Bar */}
                {progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-dark-900/50">
                        <div className="h-full bg-gradient-to-r from-primary-500 to-primary-300" style={{ width: `${progress}%` }} />
                    </div>
                )}
            </Link>

            {/* Info Section */}
            <div className={`p-4 flex flex-col ${featured ? 'md:w-2/5 justify-center p-8' : 'flex-1'}`}>
                <div className="flex gap-3 items-start">
                    {!featured && (
                        <div className="w-10 h-10 rounded-full bg-dark-800 border border-white/5 shrink-0 overflow-hidden">
                            {channelLogo ? <img src={channelLogo} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-primary-900/50" />}
                        </div>
                    )}

                    <div className="flex-1 min-w-0">
                        <Link to={`/watch/${id}`}>
                            <h3 className={`font-display font-bold text-white leading-tight group-hover:text-primary-400 transition-colors ${featured ? 'text-2xl mb-3' : 'text-base mb-1 line-clamp-2'}`}>
                                {title}
                            </h3>
                        </Link>

                        <div className="flex items-center gap-2 text-dark-400 text-sm mb-2">
                            <Link to={`/channel/${channelName}`} className="hover:text-white transition-colors">{channelName}</Link>
                            <span>•</span>
                            <span>{formatViews(views)}</span>
                        </div>

                        {featured && (
                            <p className="text-dark-300 text-sm line-clamp-3 mb-6 hidden md:block">
                                Experience this amazing content exclusively on LokDarpan. Join thousands of viewers watching this right now.
                            </p>
                        )}

                        {featured && (
                            <Link to={`/watch/${id}`} className="inline-flex items-center gap-2 text-primary-400 font-medium hover:gap-3 transition-all">
                                Watch Now <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
}

// Helpers
function formatViews(views: number): string {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
    return `${views} views`;
}

function formatDuration(seconds?: number): string {
    if (!seconds) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
}
