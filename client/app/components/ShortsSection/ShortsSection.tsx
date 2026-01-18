import { Link } from "@remix-run/react";
import { useRef } from "react";

interface Short {
    id: string;
    title: string;
    thumbnailUrl?: string;
    channelName: string;
    views: number;
}

interface ShortsSectionProps {
    shorts: Short[];
}

function formatViews(views: number): string {
    if (views >= 1000000) {
        return `${(views / 1000000).toFixed(1)}M`;
    }
    if (views >= 1000) {
        return `${(views / 1000).toFixed(0)}K`;
    }
    return `${views}`;
}

export function ShortsSection({ shorts }: ShortsSectionProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const scrollAmount = 400;
            scrollRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    if (shorts.length === 0) return null;

    return (
        <section className="mb-8">
            {/* Section header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    {/* Shorts logo */}
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M10 14.65v-5.3L15 12l-5 2.65zm7.77-4.33l-1.2-.5L18 9.06c1.84-.96 2.53-3.23 1.56-5.06s-3.24-2.53-5.07-1.56L6 6.94c-1.29.68-2.07 2.04-2 3.49.07 1.42.93 2.67 2.22 3.25.03.01 1.2.5 1.2.5L6 14.93c-1.83.97-2.53 3.24-1.56 5.07.97 1.83 3.24 2.53 5.07 1.56l8.5-4.5c1.29-.68 2.06-2.04 1.99-3.49-.07-1.42-.94-2.68-2.23-3.25z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-white">Shorts</h2>
                </div>

                {/* Navigation arrows */}
                <div className="flex gap-2">
                    <button
                        onClick={() => scroll("left")}
                        className="w-10 h-10 flex items-center justify-center bg-dark-800 hover:bg-dark-700 rounded-full text-white transition-all duration-200"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        className="w-10 h-10 flex items-center justify-center bg-dark-800 hover:bg-dark-700 rounded-full text-white transition-all duration-200"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Shorts carousel */}
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
            >
                {shorts.map((short, index) => (
                    <Link
                        key={short.id}
                        to={`/shorts/${short.id}`}
                        className="shorts-card group"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        {/* Thumbnail */}
                        {short.thumbnailUrl ? (
                            <img
                                src={short.thumbnailUrl}
                                alt={short.title}
                                className="transition-transform duration-500 group-hover:scale-110"
                                loading="lazy"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-dark-800 to-dark-900 flex items-center justify-center">
                                <svg className="w-10 h-10 text-dark-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                        )}

                        {/* Content overlay */}
                        <div className="absolute inset-0 flex flex-col justify-end p-3 z-10">
                            {/* Play button on hover */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            </div>

                            <h3 className="text-sm font-semibold text-white line-clamp-2 mb-1 drop-shadow-lg">
                                {short.title}
                            </h3>
                            <p className="text-xs text-gray-300 drop-shadow-lg">
                                {formatViews(short.views)} views
                            </p>
                        </div>

                        {/* Shorts icon badge */}
                        <div className="absolute top-2 right-2 z-10">
                            <div className="w-6 h-6 rounded bg-red-500/90 flex items-center justify-center shadow-lg">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M10 14.65v-5.3L15 12l-5 2.65z" />
                                </svg>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
