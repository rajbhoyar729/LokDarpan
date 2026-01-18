import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link, Form } from "@remix-run/react";
import { useState } from "react";
import { Layout } from "~/components/Layout/Layout";
import { VideoCard } from "~/components/VideoCard/VideoCard";
import { getUserFromSession } from "~/services/auth.server";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
    return [
        { title: data?.video?.title ? `${data.video.title} - LokDarpan` : "Watch - LokDarpan" },
        { name: "description", content: data?.video?.description || "Watch videos on LokDarpan" },
    ];
};

// Sample video for demo
const getSampleVideo = (id: string) => ({
    _id: id,
    title: "Building a Modern Video Platform with Remix and Fastify",
    description: `In this comprehensive tutorial, we'll build a complete video hosting platform from scratch using Remix for the frontend and Fastify for the backend.

We'll cover:
- Setting up Remix with Vite and Tailwind CSS
- Creating a Fastify server with JWT authentication
- Implementing video upload with S3
- Building a responsive video player
- Adding comments and likes functionality
- Real-time features with Socket.io

This is part 1 of a multi-part series. Don't forget to subscribe for more!

#webdevelopment #remix #fastify #tutorial`,
    videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
    thumbnailUrl: "https://picsum.photos/seed/mainvideo/1280/720",
    channelName: "TechTutorials",
    channelId: "tech123",
    channelLogo: null as string | null,
    views: 125000,
    likes: 4500,
    dislikes: 120,
    subscribers: 45000,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    duration: 1245,
});

const relatedVideos = [
    {
        _id: "r1",
        title: "Remix vs Next.js - Complete Comparison 2024",
        thumbnailUrl: "https://picsum.photos/seed/related1/320/180",
        channelName: "WebDevPro",
        views: 89000,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        duration: 892,
    },
    {
        _id: "r2",
        title: "Fastify Crash Course for Beginners",
        thumbnailUrl: "https://picsum.photos/seed/related2/320/180",
        channelName: "NodeMaster",
        views: 67000,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        duration: 1234,
    },
    {
        _id: "r3",
        title: "Tailwind CSS Tips & Tricks",
        thumbnailUrl: "https://picsum.photos/seed/related3/320/180",
        channelName: "CSSNinja",
        views: 45000,
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        duration: 678,
    },
    {
        _id: "r4",
        title: "TypeScript Best Practices",
        thumbnailUrl: "https://picsum.photos/seed/related4/320/180",
        channelName: "TypeScriptPro",
        views: 123000,
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        duration: 1567,
    },
];

export async function loader({ request, params }: LoaderFunctionArgs) {
    const userSession = await getUserFromSession(request);
    const videoId = params.videoId;

    // TODO: Fetch video from API when endpoint is ready
    // const response = await videoApi.getById(videoId, userSession?.token);

    const video = getSampleVideo(videoId || "1");

    return json({
        video,
        relatedVideos,
        user: userSession?.user || null,
    });
}

function formatNumber(num: number): string {
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export default function Watch() {
    const { video, relatedVideos, user } = useLoaderData<typeof loader>();
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isDisliked, setIsDisliked] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);

    return (
        <Layout user={user}>
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Main content */}
                <div className="flex-1 min-w-0">
                    {/* Video player */}
                    <div className="relative aspect-video bg-black rounded-xl overflow-hidden mb-4">
                        <video
                            src={video.videoUrl}
                            poster={video.thumbnailUrl}
                            controls
                            className="w-full h-full"
                            autoPlay
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>

                    {/* Video title */}
                    <h1 className="text-xl font-bold text-white mb-3">{video.title}</h1>

                    {/* Video info bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        {/* Channel info */}
                        <div className="flex items-center gap-4">
                            <Link to={`/channel/${video.channelId}`} className="flex items-center gap-3">
                                <div className="avatar-lg flex items-center justify-center bg-gradient-to-br from-primary-500 to-orange-500 text-white font-semibold text-lg">
                                    {video.channelLogo ? (
                                        <img src={video.channelLogo} alt={video.channelName} className="w-full h-full object-cover" />
                                    ) : (
                                        video.channelName.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium text-white hover:text-primary-400 transition-colors">
                                        {video.channelName}
                                    </p>
                                    <p className="text-sm text-gray-400">{formatNumber(video.subscribers)} subscribers</p>
                                </div>
                            </Link>

                            {/* Subscribe button */}
                            <button
                                onClick={() => setIsSubscribed(!isSubscribed)}
                                className={`ml-2 ${isSubscribed
                                    ? "btn-secondary"
                                    : "btn-primary"
                                    }`}
                            >
                                {isSubscribed ? "Subscribed" : "Subscribe"}
                            </button>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                            {/* Like/Dislike */}
                            <div className="flex items-center bg-dark-800 rounded-full overflow-hidden">
                                <button
                                    onClick={() => {
                                        setIsLiked(!isLiked);
                                        if (isDisliked) setIsDisliked(false);
                                    }}
                                    className={`flex items-center gap-2 px-4 py-2 transition-colors ${isLiked ? "text-primary-400" : "text-gray-300 hover:text-white"
                                        }`}
                                >
                                    <svg className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                    </svg>
                                    <span className="text-sm font-medium">{formatNumber(video.likes + (isLiked ? 1 : 0))}</span>
                                </button>
                                <div className="w-px h-6 bg-dark-700" />
                                <button
                                    onClick={() => {
                                        setIsDisliked(!isDisliked);
                                        if (isLiked) setIsLiked(false);
                                    }}
                                    className={`flex items-center gap-2 px-4 py-2 transition-colors ${isDisliked ? "text-primary-400" : "text-gray-300 hover:text-white"
                                        }`}
                                >
                                    <svg className="w-5 h-5 rotate-180" fill={isDisliked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                    </svg>
                                </button>
                            </div>

                            {/* Share */}
                            <button className="btn-secondary">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                                Share
                            </button>

                            {/* More */}
                            <button className="btn-icon text-gray-300 hover:text-white hover:bg-dark-800">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Description box */}
                    <div className="bg-dark-900 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                            <span>{formatNumber(video.views)} views</span>
                            <span>•</span>
                            <span>{formatDate(video.createdAt)}</span>
                        </div>
                        <div
                            className={`text-gray-300 whitespace-pre-line ${!isDescriptionExpanded ? "line-clamp-3" : ""
                                }`}
                        >
                            {video.description}
                        </div>
                        <button
                            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                            className="text-sm font-medium text-gray-400 hover:text-white mt-2"
                        >
                            {isDescriptionExpanded ? "Show less" : "Show more"}
                        </button>
                    </div>

                    {/* Comments section */}
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-white mb-4">Comments</h2>

                        {/* Add comment */}
                        {user ? (
                            <Form className="flex gap-3 mb-6">
                                <div className="avatar-md flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-primary-500 to-orange-500 text-white font-semibold">
                                    {user.channelName.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        name="comment"
                                        placeholder="Add a comment..."
                                        className="input bg-transparent border-0 border-b border-dark-700 rounded-none px-0 focus:border-white focus:ring-0"
                                    />
                                </div>
                            </Form>
                        ) : (
                            <p className="text-gray-400 mb-6">
                                <Link to="/auth/login" className="text-primary-400 hover:underline">Sign in</Link> to add a comment
                            </p>
                        )}

                        {/* Sample comments */}
                        <div className="space-y-4">
                            {[
                                { user: "CodeEnthusiast", text: "This is exactly what I was looking for! Great tutorial.", time: "2 days ago", likes: 45 },
                                { user: "WebDev2024", text: "Can you make a follow-up video on deployment?", time: "1 day ago", likes: 23 },
                                { user: "TechLearner", text: "Amazing content as always! 👏", time: "5 hours ago", likes: 12 },
                            ].map((comment, i) => (
                                <div key={i} className="flex gap-3">
                                    <div className="avatar-md flex-shrink-0 flex items-center justify-center bg-dark-700 text-white font-semibold">
                                        {comment.user.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-white text-sm">@{comment.user}</span>
                                            <span className="text-xs text-gray-500">{comment.time}</span>
                                        </div>
                                        <p className="text-gray-300 text-sm">{comment.text}</p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <button className="flex items-center gap-1 text-gray-400 hover:text-white text-sm">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                                </svg>
                                                {comment.likes}
                                            </button>
                                            <button className="text-gray-400 hover:text-white text-sm">Reply</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar - Related videos */}
                <aside className="lg:w-[400px] flex-shrink-0">
                    <h2 className="text-lg font-bold text-white mb-4">Related Videos</h2>
                    <div className="space-y-3">
                        {relatedVideos.map((video) => (
                            <Link key={video._id} to={`/watch/${video._id}`} className="flex gap-3 group">
                                <div className="w-40 flex-shrink-0">
                                    <div className="thumbnail">
                                        <img src={video.thumbnailUrl} alt={video.title} />
                                        <span className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/80 text-white text-xs rounded">
                                            {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, "0")}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-primary-400 transition-colors">
                                        {video.title}
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-1">{video.channelName}</p>
                                    <p className="text-xs text-gray-500">
                                        {formatNumber(video.views)} views
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </aside>
            </div>
        </Layout>
    );
}
