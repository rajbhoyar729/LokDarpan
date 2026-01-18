import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { Layout } from "~/components/Layout/Layout";
import { getUserFromSession } from "~/services/auth.server";

export const meta: MetaFunction = () => {
    return [{ title: "Explore Topics - LokDarpan" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
    const userSession = await getUserFromSession(request);
    return json({ user: userSession?.user || null });
}

// Category Data Configuration
const CATEGORIES = [
    { id: "music", name: "Music", color: "from-pink-500 to-rose-500", icon: "music" },
    { id: "gaming", name: "Gaming", color: "from-purple-500 to-indigo-500", icon: "gamepad" },
    { id: "news", name: "News", color: "from-blue-500 to-cyan-500", icon: "newspaper" },
    { id: "movies", name: "Movies", color: "from-amber-500 to-orange-500", icon: "film" },
    { id: "learning", name: "Learning", color: "from-emerald-500 to-green-500", icon: "academic-cap" },
    { id: "live", name: "Live", color: "from-red-500 to-rose-600", icon: "video-camera" },
    { id: "sports", name: "Sports", color: "from-orange-400 to-red-500", icon: "trophy" },
    { id: "fashion", name: "Fashion", color: "from-fuchsia-500 to-pink-500", icon: "shopping-bag" },
    { id: "tech", name: "Technology", color: "from-cyan-500 to-blue-600", icon: "chip" },
    { id: "comedy", name: "Comedy", color: "from-yellow-400 to-orange-400", icon: "emoji-happy" },
    { id: "travel", name: "Travel", color: "from-teal-400 to-emerald-500", icon: "globe-alt" },
    { id: "beauty", name: "Beauty", color: "from-rose-300 to-pink-400", icon: "sparkles" },
];

export default function Explore() {
    const { user } = useLoaderData<typeof loader>();

    return (
        <Layout user={user}>
            <div className="min-h-screen pb-20">
                {/* Hero Header */}
                <div className="relative h-64 rounded-2xl overflow-hidden mb-10 group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-900 to-dark-900" />
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/20 to-transparent" />

                    <div className="absolute bottom-0 left-0 p-8">
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2 tracking-tight">
                            Explore Topics
                        </h1>
                        <p className="text-dark-200 text-lg max-w-xl">
                            Discover new interests, trending communities, and fresh content curated just for you.
                        </p>
                    </div>
                </div>

                {/* Categories Grid */}
                <div>
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
                        Browse Categories
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {CATEGORIES.map((category) => (
                            <Link
                                key={category.id}
                                to={`/trending?category=${category.id}`}
                                className="group relative h-40 rounded-xl overflow-hidden glass-panel hover:border-white/20 hover:shadow-glow-subtle transition-all duration-300 transform hover:-translate-y-1"
                            >
                                {/* Background Gradient */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-10 group-hover:opacity-20 transition-opacity`} />

                                {/* Icon Background (Large/Faded) */}
                                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 group-hover:-rotate-12 duration-500">
                                    {getIcon(category.icon, "w-32 h-32")}
                                </div>

                                {/* Content */}
                                <div className="absolute inset-0 p-6 flex flex-col justify-between">
                                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                        {getIcon(category.icon, "w-6 h-6 text-white")}
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-white group-hover:text-primary-200 transition-colors">
                                            {category.name}
                                        </h3>
                                        <p className="text-xs text-dark-400 group-hover:text-dark-300">
                                            Explore {category.name}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
}

// Icon Helper
function getIcon(name: string, className: string) {
    switch (name) {
        case "music": return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>;
        case "gamepad": return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>;
        case "newspaper": return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>;
        case "film": return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.818v6.364a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
        case "academic-cap": return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>;
        case "video-camera": return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.818v6.364a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
        case "trophy": return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
        case "shopping-bag": return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
        case "chip": return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>;
        case "emoji-happy": return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case "globe-alt": return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>;
        case "sparkles": return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>; // Reusing star for sparkles
        default: return null;
    }
}
