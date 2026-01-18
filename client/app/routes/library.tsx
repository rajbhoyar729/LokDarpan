import { json, type MetaFunction, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { Layout } from "~/components/Layout/Layout";
import { getUserFromSession } from "~/services/auth.server";
import { VideoCard } from "~/components/VideoCard/VideoCard";

export const meta: MetaFunction = () => {
    return [{ title: "Your Library - LokDarpan" }];
};

// Mock Data
const history = [
    { _id: "h1", title: "React Performance Tips", thumbnailUrl: "https://picsum.photos/seed/h1/320/180", progress: 85, channelName: "DevTips" },
    { _id: "h2", title: "Midnight Jazz Stream", thumbnailUrl: "https://picsum.photos/seed/h2/320/180", progress: 30, channelName: "JazzClub" },
    { _id: "h3", title: "Unboxing the Future", thumbnailUrl: "https://picsum.photos/seed/h3/320/180", progress: 10, channelName: "TechBox" },
    { _id: "h4", title: "Cooking Masterclass", thumbnailUrl: "https://picsum.photos/seed/h4/320/180", progress: 95, channelName: "ChefJohn" },
];

const playlists = [
    { id: "p1", name: "Coding Tutorials", count: 12, color: "from-primary-500 to-cyan-400" },
    { id: "p2", name: "Music for Focus", count: 45, color: "from-accent-500 to-red-500" },
    { id: "p3", name: "Fitness & Health", count: 8, color: "from-green-500 to-emerald-400" },
    { id: "p4", name: "Liked Videos", count: 124, color: "from-purple-500 to-pink-500" },
];

export async function loader({ request }: LoaderFunctionArgs) {
    const userSession = await getUserFromSession(request);
    return json({ user: userSession?.user || null, history, playlists });
}

export default function Library() {
    const { user, history, playlists } = useLoaderData<typeof loader>();

    return (
        <Layout user={user}>
            <div className="max-w-7xl mx-auto px-2">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-dark-800 border border-white/10 flex items-center justify-center">
                        <svg className="w-6 h-6 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-3xl font-display font-bold text-white">Your Library</h1>
                        <p className="text-dark-400 text-sm">Manage your content and watch history</p>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Column: History & Stats */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* History Section */}
                        <section className="glass-panel p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <svg className="w-5 h-5 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Recent History
                                </h2>
                                <Link to="/history" className="text-primary-400 text-sm font-medium hover:text-primary-300">View All</Link>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {history.map(video => (
                                    <div key={video._id} className="group flex gap-4 p-3 rounded-xl bg-dark-800/50 hover:bg-dark-800 border border-transparent hover:border-white/5 transition-all">
                                        <div className="relative w-32 aspect-video rounded-lg overflow-hidden shrink-0">
                                            <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                                            <div className="absolute bottom-0 left-0 right-0 h-1bg-dark-900">
                                                <div className="h-1 bg-accent-500" style={{ width: `${video.progress}%` }} />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-white font-medium text-sm line-clamp-2 mb-1 group-hover:text-primary-400 transition-colors">{video.title}</h3>
                                            <p className="text-dark-400 text-xs">{video.channelName}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Quick Functions */}
                        <div className="grid grid-cols-2 gap-4">
                            <button className="p-4 rounded-2xl bg-dark-900 border border-white/5 hover:border-primary-500/50 flex flex-col items-center justify-center gap-2 group transition-all">
                                <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-400 group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                </div>
                                <span className="font-medium text-white">Your Uploads</span>
                            </button>
                            <button className="p-4 rounded-2xl bg-dark-900 border border-white/5 hover:border-accent-500/50 flex flex-col items-center justify-center gap-2 group transition-all">
                                <div className="w-10 h-10 rounded-full bg-accent-500/10 flex items-center justify-center text-accent-400 group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                                </div>
                                <span className="font-medium text-white">Settings</span>
                            </button>
                        </div>
                    </div>

                    {/* Sidebar: Playlists */}
                    <aside className="glass-panel p-6 h-fit">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Playlists</h2>
                            <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-white transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {playlists.map(playlist => (
                                <div key={playlist.id} className="group relative overflow-hidden rounded-xl aspect-[2/1] cursor-pointer">
                                    {/* Background Gradient */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${playlist.color} opacity-80 group-hover:opacity-100 transition-opacity`} />

                                    {/* Pattern Overlay */}
                                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '10px 10px' }} />

                                    <div className="absolute inset-0 p-4 flex flex-col justify-end">
                                        <h3 className="text-white font-bold text-lg leading-tight">{playlist.name}</h3>
                                        <p className="text-white/80 text-xs font-medium">{playlist.count} videos</p>

                                        <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </aside>
                </div>
            </div>
        </Layout>
    );
}
