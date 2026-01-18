import { json, type MetaFunction, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { Layout } from "~/components/Layout/Layout";
import { getUserFromSession } from "~/services/auth.server";
import { VideoCard } from "~/components/VideoCard/VideoCard";

export const meta: MetaFunction = () => {
    return [{ title: "Trending - LokDarpan" }];
};

const trendingData = [
    { _id: "t1", rank: 1, title: "The Future of AI: Beyond 2024", thumbnailUrl: "https://picsum.photos/seed/ai/1280/720", channelName: "TechVision", views: 2500000, duration: 1840, description: "Exploring the next frontier of artificial intelligence and its impact on society." },
    { _id: "t2", rank: 2, title: "Street Food Tour: Mumbai", thumbnailUrl: "https://picsum.photos/seed/food/640/360", channelName: "FoodieTravels", views: 1800000, duration: 920, description: "Join us on an epic culinary adventure through the streets of Mumbai." },
    { _id: "t3", rank: 3, title: "Epic Gaming Moments #45", thumbnailUrl: "https://picsum.photos/seed/game/640/360", channelName: "ProGamer", views: 1200000, duration: 650, description: "The most insane gaming clips from this week's community submissions." },
    { _id: "t4", rank: 4, title: "Build a House in 24 Hours", thumbnailUrl: "https://picsum.photos/seed/build/640/360", channelName: "MakerSpace", views: 980000, duration: 2400, description: "Can we actually construct a livable house in just one day? Watch to find out!" },
    { _id: "t5", rank: 5, title: "Coding ASMR - Python", thumbnailUrl: "https://picsum.photos/seed/code/640/360", channelName: "DevRelax", views: 850000, duration: 3600, description: "Relax and learn Python with soothing keyboard sounds and calm narration." },
    { _id: "t6", rank: 6, title: "New electric supercar review", thumbnailUrl: "https://picsum.photos/seed/car/640/360", channelName: "AutoDaily", views: 720000, duration: 1100, description: "First look at the latest electric hypercar with 1000+ horsepower." },
];

export async function loader({ request }: LoaderFunctionArgs) {
    const userSession = await getUserFromSession(request);
    return json({ user: userSession?.user || null, videos: trendingData });
}

export default function Trending() {
    const { user, videos } = useLoaderData<typeof loader>();
    const heroVideo = videos[0];
    const rankingVideos = videos.slice(1);

    return (
        <Layout user={user}>
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-500 to-red-500 flex items-center justify-center shadow-lg shadow-accent-500/20 animate-pulse-slow">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-4xl font-display font-bold text-white mb-2">Trending Now</h1>
                        <p className="text-dark-400">The most popular videos on LokDarpan today.</p>
                    </div>
                </div>

                {/* Hero #1 Rank */}
                <div className="mb-12 relative group">
                    <div className="absolute -left-6 -top-6 w-24 h-24 bg-accent-500 text-black font-display font-bold text-6xl flex items-center justify-center rounded-full z-20 shadow-glow-accent border-4 border-dark-950 transform -rotate-12 group-hover:rotate-0 transition-transform duration-500">
                        #1
                    </div>
                    <div className="bg-dark-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl group-hover:border-accent-500/30 transition-all duration-500">
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            <div className="relative aspect-video lg:aspect-auto h-full min-h-[300px]">
                                <img src={heroVideo.thumbnailUrl} alt={heroVideo.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-dark-900" />
                                <Link to={`/watch/${heroVideo._id}`} className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center pl-1 hover:scale-110 transition-transform">
                                        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                    </div>
                                </Link>
                            </div>
                            <div className="p-8 flex flex-col justify-center">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="px-3 py-1 rounded-full bg-accent-500/20 text-accent-400 text-sm font-bold border border-accent-500/20">Viral</span>
                                    <span className="text-dark-400 text-sm">• {(heroVideo.views / 1000000).toFixed(1)}M views</span>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4 leading-tight">
                                    {heroVideo.title}
                                </h2>
                                <p className="text-dark-300 text-lg mb-6 line-clamp-3">
                                    {heroVideo.description}
                                </p>

                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold">
                                            {heroVideo.channelName[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{heroVideo.channelName}</p>
                                            <p className="text-dark-400 text-sm">2.4M subscribers</p>
                                        </div>
                                    </div>
                                    <button className="ml-auto btn-primary">Watch Now</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ranked List */}
                <div className="space-y-6">
                    {rankingVideos.map((video) => (
                        <div key={video._id} className="group flex flex-col md:flex-row gap-6 p-4 rounded-2xl hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/5">
                            {/* Rank Number */}
                            <div className="hidden md:flex flex-col items-center justify-center w-16 shrink-0">
                                <span className={`text-5xl font-display font-bold ${video.rank <= 3 ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'text-dark-600'
                                    }`}>
                                    {video.rank}
                                </span>
                                {video.rank <= 3 && <span className="text-accent-500 text-xs font-bold mt-1 tracking-widest uppercase">Top 3</span>}
                            </div>

                            {/* Thumbnail */}
                            <div className="relative aspect-video md:w-64 rounded-xl overflow-hidden shrink-0 group-hover:shadow-glow-sm transition-all duration-300">
                                <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-white text-xs rounded">
                                    {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                                </span>
                            </div>

                            {/* Info */}
                            <div className="flex-1 py-1">
                                <Link to={`/watch/${video._id}`}>
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
                                        {video.title}
                                    </h3>
                                </Link>
                                <div className="flex items-center gap-2 text-dark-400 text-sm mb-3">
                                    <span className="font-medium text-dark-300 hover:text-white transition-colors">{video.channelName}</span>
                                    <span>•</span>
                                    <span>{(video.views / 1000).toFixed(0)}K views</span>
                                    <span>•</span>
                                    <span>5 hours ago</span>
                                </div>
                                <p className="text-dark-400 text-sm line-clamp-2 hidden md:block">
                                    Join the discussion on this trending topic. Community interaction is at an all-time high for this video.
                                </p>
                            </div>

                            {/* Action (Desktop) */}
                            <div className="hidden md:flex items-center">
                                <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-dark-300 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </Layout>
    );
}
