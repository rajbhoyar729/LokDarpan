import { useState, useEffect } from "react";
import { Link } from "@remix-run/react";

interface HeroItem {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    category: string;
    duration: string;
}

const HERO_ITEMS: HeroItem[] = [
    {
        id: "h1",
        title: "The Future of Digital Art",
        description: "Explore how AI and human creativity are merging to create stunning new forms of expression in the digital age.",
        imageUrl: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2600&auto=format&fit=crop",
        category: "Technology",
        duration: "12 min"
    },
    {
        id: "h2",
        title: "Hidden Gems of Kyoto",
        description: "A cinematic journey through the ancient streets, temples, and tea houses of Japan's cultural capital.",
        imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2600&auto=format&fit=crop",
        category: "Travel",
        duration: "8 min"
    },
    {
        id: "h3",
        title: "Minimalist Workspace Setup",
        description: "How to design a distraction-free environment that boosts productivity and mental clarity.",
        imageUrl: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2600&auto=format&fit=crop",
        category: "Lifestyle",
        duration: "15 min"
    }
];

export function CinematicHero() {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-advance carousel
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % HERO_ITEMS.length);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    const currentItem = HERO_ITEMS[currentIndex];

    return (
        <div className="relative w-full h-[50vh] md:h-[60vh] rounded-3xl overflow-hidden mb-10 group shadow-2xl shadow-black/50">
            {/* Background Image with Transition */}
            {HERO_ITEMS.map((item, index) => (
                <div
                    key={item.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? "opacity-100" : "opacity-0"
                        }`}
                >
                    <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transform scale-105 group-hover:scale-110 transition-transform duration-[8000ms]"
                    />
                    {/* Gradient Overlay for Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-dark-950/80 via-transparent to-transparent" />
                </div>
            ))}

            {/* Content Content - Bottom Left */}
            <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full max-w-3xl z-10 flex flex-col items-start gap-4">
                <div className="flex items-center gap-3 animate-fade-in">
                    <span className="px-3 py-1 bg-primary-500/20 text-primary-300 text-xs font-bold uppercase tracking-wider rounded-full backdrop-blur-sm border border-primary-500/30">
                        {currentItem.category}
                    </span>
                    <span className="text-dark-300 text-sm font-medium flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {currentItem.duration}
                    </span>
                </div>

                <h1 className="text-4xl md:text-6xl font-display font-bold text-white leading-tight drop-shadow-xl animate-slide-up">
                    {currentItem.title}
                </h1>

                <p className="text-dark-200 text-lg md:text-xl max-w-xl line-clamp-2 drop-shadow-md animate-slide-up" style={{ animationDelay: "100ms" }}>
                    {currentItem.description}
                </p>

                <div className="flex gap-4 mt-4 animate-slide-up" style={{ animationDelay: "200ms" }}>
                    <Link to={`/watch/Hero-${currentItem.id}`} className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-dark-200 hover:scale-105 transition-all shadow-glow-white flex items-center gap-2">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        Watch Now
                    </Link>
                    <button className="px-8 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 hover:scale-105 transition-all backdrop-blur-md border border-white/10">
                        + Add to List
                    </button>
                </div>
            </div>

            {/* Pagination Indicators */}
            <div className="absolute bottom-8 right-8 flex gap-2 z-20">
                {HERO_ITEMS.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${index === currentIndex ? "w-8 bg-white" : "w-2 bg-white/30 hover:bg-white/50"
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
