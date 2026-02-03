import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { Layout } from "~/components/Layout/Layout";
import { CategoryChips } from "~/components/CategoryChips/CategoryChips";
import { CinematicHero } from "~/components/Hero/CinematicHero";
import { getUserFromSession } from "~/services/auth.server";

export const meta: MetaFunction = () => {
    return [
        { title: "LokDarpan - Discover Unique" },
        { name: "description", content: "A unique video platform experience" },
    ];
};

// Mock Data
const trendingVideos = [
    { _id: "t1", title: "Cyberpunk Cityscapes", thumbnailUrl: "https://picsum.photos/seed/cyber/640/360", channelName: "NeonVibes", channelAvatar: "N", views: 88000, duration: 420, isLive: false },
    { _id: "t2", title: "Lofi Beats to Code To", thumbnailUrl: "https://picsum.photos/seed/lofi/640/360", channelName: "ChillHop", channelAvatar: "C", views: 12000, duration: 3600, isLive: true },
    { _id: "t3", title: "React 19 Features Explained", thumbnailUrl: "https://picsum.photos/seed/react/640/360", channelName: "DevDaily", channelAvatar: "D", views: 45000, duration: 890, isLive: false },
    { _id: "t4", title: "Meditation for Focus", thumbnailUrl: "https://picsum.photos/seed/meditate/640/360", channelName: "Mindful", channelAvatar: "M", views: 23000, duration: 600, isLive: false },
    { _id: "t5", title: "Building SaaS in 24 Hours", thumbnailUrl: "https://picsum.photos/seed/saas/640/360", channelName: "IndieHacker", channelAvatar: "I", views: 67000, duration: 1500, isLive: false },
    { _id: "t6", title: "Abstract Art Tutorial", thumbnailUrl: "https://picsum.photos/seed/art/640/360", channelName: "CreativeFlow", channelAvatar: "C", views: 12000, duration: 900, isLive: false },
    { _id: "t7", title: "Van Life: 1 Year Later", thumbnailUrl: "https://picsum.photos/seed/van/640/360", channelName: "NomadLife", channelAvatar: "N", views: 156000, duration: 1250, isLive: false },
    { _id: "t8", title: "Zero Waste Kitchen Switch", thumbnailUrl: "https://picsum.photos/seed/green/640/360", channelName: "EcoWarrior", channelAvatar: "E", views: 34000, duration: 540, isLive: false },
];

const shortsData = [
    { _id: "s1", title: "Crazy AI Art in 30 Seconds", thumbnailUrl: "https://picsum.photos/seed/short1/400/700", views: 1200000 },
    { _id: "s2", title: "One-Minute Yoga Flow", thumbnailUrl: "https://picsum.photos/seed/short2/400/700", views: 890000 },
    { _id: "s3", title: "Hidden iPhone Feature", thumbnailUrl: "https://picsum.photos/seed/short3/400/700", views: 2100000 },
    { _id: "s4", title: "Epic Drone Fail", thumbnailUrl: "https://picsum.photos/seed/short4/400/700", views: 560000 },
    { _id: "s5", title: "Quick Coding Tip #42", thumbnailUrl: "https://picsum.photos/seed/short5/400/700", views: 340000 },
    { _id: "s6", title: "Sunset Timelapse Magic", thumbnailUrl: "https://picsum.photos/seed/short6/400/700", views: 780000 },
];

export async function loader({ request }: LoaderFunctionArgs) {
    const userSession = await getUserFromSession(request);
    return json({ user: userSession?.user || null, trendingVideos, shortsData });
}

export default function Index() {
    const { user, trendingVideos, shortsData } = useLoaderData<typeof loader>();

    return (
        <Layout user={user}>
            {/* Sticky Category Bar - Solid Background */}
            <div className="sticky top-[72px] z-40 py-3 mb-6 -mx-4 px-4 bg-dark-950 border-b border-white/5 hidden md:block">
                <CategoryChips categories={["All", "Tech", "Design", "Music", "Lifestyle", "Gaming", "Code", "Art", "Science"]} />
            </div>

            {/* Hero Section */}
            <section className="mb-16">
                <CinematicHero />
            </section>

            {/* ===== SHORTS SECTION ===== */}
            {/* Psychology: Pattern Interrupt + Quick Dopamine Hits */}
            <section className="mb-12 md:mb-16 relative z-0">
                <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                    <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/30">
                        <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <h2 className="text-lg md:text-xl font-display font-bold text-white">Shorts</h2>
                </div>

                {/* Shorts Rail - Horizontal Scroll */}
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
                    {shortsData.map((short) => (
                        <Link
                            key={short._id}
                            to={`/shorts/${short._id}`}
                            className="flex-shrink-0 w-40 md:w-48 group"
                        >
                            {/* Thumbnail + Metadata as ONE UNIT (Proximity) */}
                            <div className="flex flex-col gap-2">
                                <div className="aspect-[9/16] rounded-xl overflow-hidden bg-dark-900 ring-1 ring-white/10 group-hover:ring-primary-500/50 transition-all duration-300 relative">
                                    <img src={short.thumbnailUrl} alt={short.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                    <div className="absolute bottom-3 left-3 right-3">
                                        <h3 className="text-white font-bold text-sm line-clamp-2 leading-tight">{short.title}</h3>
                                        <p className="text-xs text-white/70 mt-1">{Intl.NumberFormat('en-US', { notation: "compact" }).format(short.views)} views</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ===== RECOMMENDED GRID ===== */}
            {/* Psychology: Cognitive Ease (Jakob's Law) + Proximity Principle */}
            <section className="mb-12 md:mb-16">
                <h2 className="text-lg md:text-xl font-display font-bold text-white mb-6 md:mb-8 flex items-center gap-2 md:gap-3">
                    <span className="w-1 md:w-1.5 h-6 md:h-8 bg-gradient-to-b from-accent-400 to-accent-600 rounded-full"></span>
                    Recommended For You
                </h2>

                {/* 
                    PROXIMITY PRINCIPLE APPLIED:
                    - gap-x-4: Horizontal spacing between cards (LARGER)
                    - gap-y-10: Vertical spacing between rows (LARGER - section separation)
                    - Within each card: gap-2 between thumbnail and metadata (SMALLER - grouping)
                */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
                    {trendingVideos.map((video) => (
                        <article key={video._id} className="group">
                            {/* Card as ONE UNIT (Proximity: tight internal spacing) */}
                            <div className="flex flex-col gap-2">
                                {/* Thumbnail */}
                                <Link to={`/watch/${video._id}`} className="relative aspect-video rounded-xl overflow-hidden bg-dark-900 ring-1 ring-white/5 group-hover:ring-white/20 transition-all duration-300">
                                    <img
                                        src={video.thumbnailUrl}
                                        alt={video.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {/* Duration Badge */}
                                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[11px] font-bold text-white">
                                        {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                                    </div>
                                    {/* Live Badge */}
                                    {video.isLive && (
                                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-red-600 text-[10px] font-bold text-white flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE
                                        </div>
                                    )}
                                </Link>

                                {/* Metadata - TIGHT proximity to thumbnail */}
                                <div className="flex gap-3 pt-1">
                                    {/* Channel Avatar */}
                                    <Link to={`/channel/${video.channelName}`} className="flex-shrink-0">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500/80 to-accent-500/80 flex items-center justify-center text-sm font-bold text-white ring-1 ring-white/10">
                                            {video.channelAvatar}
                                        </div>
                                    </Link>

                                    {/* Text Info - Tight vertical spacing (gap-0.5) */}
                                    <div className="flex flex-col gap-0.5 min-w-0">
                                        <Link to={`/watch/${video._id}`} className="text-white font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary-300 transition-colors">
                                            {video.title}
                                        </Link>
                                        <Link to={`/channel/${video.channelName}`} className="text-dark-400 text-xs hover:text-white transition-colors truncate">
                                            {video.channelName}
                                        </Link>
                                        <span className="text-dark-500 text-xs">
                                            {Intl.NumberFormat('en-US', { notation: "compact" }).format(video.views)} views • 2 days ago
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {/* Load More */}
            <div className="py-10 flex justify-center border-t border-white/5">
                <button className="px-8 py-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all font-medium">
                    Discover More
                </button>
            </div>
        </Layout>
    );
}
