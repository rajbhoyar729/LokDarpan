import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { Layout } from "~/components/Layout/Layout";
import { VideoCard } from "~/components/VideoCard/VideoCard";
import { getUserFromSession } from "~/services/auth.server";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
    return [
        { title: data?.channel?.channelName ? `${data.channel.channelName} - LokDarpan` : "Channel - LokDarpan" },
    ];
};

// Sample channel data
const getSampleChannel = (channelId: string) => ({
    _id: channelId,
    channelName: channelId.charAt(0).toUpperCase() + channelId.slice(1),
    description: "Welcome to my channel! I create content about web development, programming tutorials, and tech reviews. Subscribe for weekly videos!",
    bannerUrl: "https://picsum.photos/seed/banner/1920/300",
    logoUrl: undefined,
    subscribers: 45000,
    totalViews: 1250000,
    joinedDate: "2023-06-15",
    videos: [
        {
            _id: "v1",
            title: "Getting Started with Remix Framework",
            thumbnailUrl: "https://picsum.photos/seed/chvid1/640/360",
            views: 23000,
            createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
            duration: 1245,
        },
        {
            _id: "v2",
            title: "Building APIs with Fastify",
            thumbnailUrl: "https://picsum.photos/seed/chvid2/640/360",
            views: 18000,
            createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
            duration: 892,
        },
        {
            _id: "v3",
            title: "Tailwind CSS Tips and Tricks",
            thumbnailUrl: "https://picsum.photos/seed/chvid3/640/360",
            views: 31000,
            createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
            duration: 756,
        },
        {
            _id: "v4",
            title: "TypeScript Advanced Patterns",
            thumbnailUrl: "https://picsum.photos/seed/chvid4/640/360",
            views: 27000,
            createdAt: new Date(Date.now() - 86400000 * 21).toISOString(),
            duration: 1432,
        },
    ],
});

function formatNumber(num: number): string {
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
}

export async function loader({ request, params }: LoaderFunctionArgs) {
    const userSession = await getUserFromSession(request);
    const channelId = params.channelId;

    // TODO: Fetch channel from API
    const channel = getSampleChannel(channelId || "unknown");

    return json({
        channel,
        user: userSession?.user || null,
        isOwner: userSession?.user?.channelName === channel.channelName,
    });
}

export default function Channel() {
    const { channel, user, isOwner } = useLoaderData<typeof loader>();
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [activeTab, setActiveTab] = useState<"videos" | "about">("videos");

    return (
        <Layout user={user}>
            {/* Banner */}
            <div className="relative h-32 sm:h-48 md:h-56 -mx-6 -mt-6 mb-6 overflow-hidden">
                {channel.bannerUrl ? (
                    <img
                        src={channel.bannerUrl}
                        alt="Channel banner"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-primary-600 to-orange-500" />
                )}
            </div>

            {/* Channel info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
                {/* Avatar */}
                <div className="avatar-xl sm:w-32 sm:h-32 flex items-center justify-center bg-gradient-to-br from-primary-500 to-orange-500 text-white font-bold text-3xl sm:text-5xl">
                    {channel.logoUrl ? (
                        <img src={channel.logoUrl} alt={channel.channelName} className="w-full h-full object-cover" />
                    ) : (
                        channel.channelName.charAt(0).toUpperCase()
                    )}
                </div>

                {/* Info */}
                <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                        {channel.channelName}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400 mb-3">
                        <span>@{channel.channelName.toLowerCase().replace(/\s/g, "")}</span>
                        <span>•</span>
                        <span>{formatNumber(channel.subscribers)} subscribers</span>
                        <span>•</span>
                        <span>{channel.videos.length} videos</span>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2 max-w-2xl">
                        {channel.description}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    {isOwner ? (
                        <a href="/studio" className="btn-secondary">
                            Customize channel
                        </a>
                    ) : (
                        <button
                            onClick={() => setIsSubscribed(!isSubscribed)}
                            className={isSubscribed ? "btn-secondary" : "btn-primary"}
                        >
                            {isSubscribed ? (
                                <>
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M10 15l-3.5-3.5 1.41-1.41L10 12.17l6.59-6.59L18 7l-8 8z" />
                                    </svg>
                                    Subscribed
                                </>
                            ) : (
                                "Subscribe"
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-dark-800 mb-6">
                <button
                    onClick={() => setActiveTab("videos")}
                    className={`pb-3 px-1 font-medium transition-colors relative ${activeTab === "videos"
                            ? "text-white"
                            : "text-gray-400 hover:text-gray-300"
                        }`}
                >
                    Videos
                    {activeTab === "videos" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("about")}
                    className={`pb-3 px-1 font-medium transition-colors relative ${activeTab === "about"
                            ? "text-white"
                            : "text-gray-400 hover:text-gray-300"
                        }`}
                >
                    About
                    {activeTab === "about" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
                    )}
                </button>
            </div>

            {/* Content */}
            {activeTab === "videos" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                    {channel.videos.map((video) => (
                        <VideoCard
                            key={video._id}
                            id={video._id}
                            title={video.title}
                            thumbnailUrl={video.thumbnailUrl}
                            channelName={channel.channelName}
                            views={video.views}
                            createdAt={video.createdAt}
                            duration={video.duration}
                        />
                    ))}
                </div>
            ) : (
                <div className="max-w-3xl">
                    <h2 className="text-xl font-bold text-white mb-4">About</h2>
                    <p className="text-gray-300 whitespace-pre-line mb-8">
                        {channel.description}
                    </p>

                    <h3 className="text-lg font-semibold text-white mb-3">Stats</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="bg-dark-900 rounded-xl p-4">
                            <p className="text-2xl font-bold text-white">
                                {formatNumber(channel.subscribers)}
                            </p>
                            <p className="text-sm text-gray-400">Subscribers</p>
                        </div>
                        <div className="bg-dark-900 rounded-xl p-4">
                            <p className="text-2xl font-bold text-white">{channel.videos.length}</p>
                            <p className="text-sm text-gray-400">Videos</p>
                        </div>
                        <div className="bg-dark-900 rounded-xl p-4">
                            <p className="text-2xl font-bold text-white">
                                {formatNumber(channel.totalViews)}
                            </p>
                            <p className="text-sm text-gray-400">Total views</p>
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold text-white mt-8 mb-3">Details</h3>
                    <div className="text-gray-400 space-y-2">
                        <p>
                            <span className="text-gray-500">Joined:</span>{" "}
                            {new Date(channel.joinedDate).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>
                    </div>
                </div>
            )}
        </Layout>
    );
}
