import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { useState } from "react";
import { Layout } from "~/components/Layout/Layout";
import { VideoCard } from "~/components/VideoCard/VideoCard";
import { getUserFromSession } from "~/services/auth.server";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
    return [
        { title: data?.video?.title ? `${data.video.title} - LokDarpan` : "Watch - LokDarpan" },
        { name: "description", content: data?.video?.description || "Watch this video on LokDarpan" },
    ];
};

// Sample video data
const sampleVideo = {
    _id: "1",
    title: "Building a Modern Video Platform with Remix and Fastify",
    description: `In this comprehensive tutorial, we'll walk through building a complete video hosting platform from scratch using modern technologies.

What you'll learn:
• Setting up a Remix frontend with TypeScript
• Building a Fastify backend with Prisma
• Video upload and transcoding
• Real-time features with WebSockets
• Authentication and authorization
• Deploying to production

Make sure to like and subscribe for more content like this!

#programming #webdev #tutorial #remix #fastify`,
    videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
    thumbnailUrl: "https://picsum.photos/seed/video1/1280/720",
    channelName: "TechTutorials",
    channelLogo: "https://picsum.photos/seed/channel1/100/100",
    subscribers: 125000,
    views: 125000,
    likes: 8500,
    dislikes: 120,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    duration: 1245,
};

// Sample related videos
const relatedVideos = [
    {
        _id: "2",
        title: "The Future of Web Development - 2024 Trends",
        thumbnailUrl: "https://picsum.photos/seed/video2/640/360",
        channelName: "WebDevPro",
        views: 89000,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        duration: 892,
    },
    {
        _id: "3",
        title: "Understanding TypeScript Generics in 10 Minutes",
        thumbnailUrl: "https://picsum.photos/seed/video3/640/360",
        channelName: "CodeMaster",
        views: 45000,
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        duration: 623,
    },
    {
        _id: "4",
        title: "React Server Components Deep Dive",
        thumbnailUrl: "https://picsum.photos/seed/video4/640/360",
        channelName: "ReactDaily",
        views: 234000,
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        duration: 1876,
    },
    {
        _id: "5",
        title: "CSS Grid vs Flexbox - When to Use What",
        thumbnailUrl: "https://picsum.photos/seed/video5/640/360",
        channelName: "CSSNinja",
        views: 67000,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        duration: 745,
    },
];

// Sample comments
const sampleComments = [
    {
        id: "c1",
        author: "DevEnthusiast",
        avatar: "https://picsum.photos/seed/user1/100/100",
        content: "This is exactly what I was looking for! Great explanation of the concepts. 🔥",
        likes: 234,
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        replies: 12,
    },
    {
        id: "c2",
        author: "CodeNewbie",
        avatar: "https://picsum.photos/seed/user2/100/100",
        content: "Can you make a follow-up video about deployment strategies? This was super helpful!",
        likes: 89,
        createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
        replies: 3,
    },
    {
        id: "c3",
        author: "SeniorDev",
        avatar: "https://picsum.photos/seed/user3/100/100",
        content: "Nice tutorial! One suggestion: consider mentioning error handling patterns in production environments.",
        likes: 156,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        replies: 7,
    },
];

export async function loader({ params, request }: LoaderFunctionArgs) {
    const userSession = await getUserFromSession(request);
    const videoId = params.id;

    // TODO: Fetch actual video from API
    // const video = await videoApi.getById(videoId);

    return json({
        video: { ...sampleVideo, _id: videoId },
        relatedVideos,
        comments: sampleComments,
        user: userSession?.user || null,
    });
}

function formatViews(views: number): string {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(0)}K`;
    return `${views}`;
}

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const intervals = [
        { label: "year", seconds: 31536000 },
        { label: "month", seconds: 2592000 },
        { label: "week", seconds: 604800 },
        { label: "day", seconds: 86400 },
        { label: "hour", seconds: 3600 },
        { label: "minute", seconds: 60 },
    ];

    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) {
            return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
        }
    }
    return "Just now";
}

export default function Watch() {
    const { video, relatedVideos, comments, user } = useLoaderData<typeof loader>();
    const [isLiked, setIsLiked] = useState(false);
    const [isDisliked, setIsDisliked] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [showFullDescription, setShowFullDescription] = useState(false);

    const handleLike = () => {
        setIsLiked(!isLiked);
        if (isDisliked) setIsDisliked(false);
    };

    const handleDislike = () => {
        setIsDisliked(!isDisliked);
        if (isLiked) setIsLiked(false);
    };

    return (
        <Layout user={user} hideSidebar>
            <div className="max-w-[1800px] mx-auto">
                <div className="flex flex-col xl:flex-row gap-6">
                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                        {/* Video player */}
                        <div className="aspect-video bg-black rounded-2xl overflow-hidden mb-4 shadow-2xl">
                            <video
                                src={video.videoUrl}
                                poster={video.thumbnailUrl}
                                controls
                                autoPlay
                                className="w-full h-full object-contain"
                            />
                        </div>

                        {/* Video title */}
                        <h1 className="text-xl md:text-2xl font-bold text-white mb-3 leading-tight">
                            {video.title}
                        </h1>

                        {/* Channel info and actions */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            {/* Channel */}
                            <div className="flex items-center gap-4">
                                <Link to={`/channel/${video.channelName}`} className="flex items-center gap-3 group">
                                    <div className="avatar-md bg-gradient-to-br from-primary-500 to-orange-500 flex items-center justify-center text-white font-semibold group-hover:shadow-glow transition-all">
                                        {video.channelLogo ? (
                                            <img src={video.channelLogo} alt={video.channelName} className="w-full h-full object-cover" />
                                        ) : (
                                            video.channelName.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white group-hover:text-primary-400 transition-colors flex items-center gap-1">
                                            {video.channelName}
                                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                            </svg>
                                        </p>
                                        <p className="text-sm text-gray-400">{formatViews(video.subscribers)} subscribers</p>
                                    </div>
                                </Link>

                                <button
                                    onClick={() => setIsSubscribed(!isSubscribed)}
                                    className={`px-5 py-2 rounded-full font-medium text-sm transition-all duration-300 ${isSubscribed
                                            ? "bg-dark-800 text-white hover:bg-dark-700"
                                            : "bg-white text-black hover:bg-gray-200"
                                        }`}
                                >
                                    {isSubscribed ? "Subscribed" : "Subscribe"}
                                </button>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 flex-wrap">
                                {/* Like/Dislike */}
                                <div className="flex items-center bg-dark-800 rounded-full overflow-hidden">
                                    <button
                                        onClick={handleLike}
                                        className={`flex items-center gap-2 px-4 py-2 hover:bg-dark-700 transition-colors ${isLiked ? "text-primary-400" : "text-white"
                                            }`}
                                    >
                                        <svg className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                        </svg>
                                        {formatViews(video.likes + (isLiked ? 1 : 0))}
                                    </button>
                                    <div className="w-px h-6 bg-dark-700" />
                                    <button
                                        onClick={handleDislike}
                                        className={`px-4 py-2 hover:bg-dark-700 transition-colors ${isDisliked ? "text-primary-400" : "text-white"
                                            }`}
                                    >
                                        <svg className={`w-5 h-5 rotate-180 ${isDisliked ? "fill-current" : ""}`} fill={isDisliked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Share */}
                                <button className="flex items-center gap-2 px-4 py-2 bg-dark-800 rounded-full hover:bg-dark-700 transition-colors">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
                                    </svg>
                                    Share
                                </button>

                                {/* Save */}
                                <button className="flex items-center gap-2 px-4 py-2 bg-dark-800 rounded-full hover:bg-dark-700 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                    </svg>
                                    Save
                                </button>

                                {/* More */}
                                <button className="p-2 bg-dark-800 rounded-full hover:bg-dark-700 transition-colors">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="glass-card p-4 mb-6">
                            <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                                <span className="font-medium">{formatViews(video.views)} views</span>
                                <span>•</span>
                                <span>{formatTimeAgo(video.createdAt)}</span>
                            </div>
                            <p className={`text-gray-300 whitespace-pre-wrap ${!showFullDescription ? "line-clamp-3" : ""}`}>
                                {video.description}
                            </p>
                            <button
                                onClick={() => setShowFullDescription(!showFullDescription)}
                                className="text-sm font-medium text-gray-400 hover:text-white mt-2"
                            >
                                {showFullDescription ? "Show less" : "...more"}
                            </button>
                        </div>

                        {/* Comments section */}
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-white mb-4">
                                {comments.length} Comments
                            </h2>

                            {/* Add comment */}
                            <div className="flex gap-3 mb-6">
                                <div className="avatar-md bg-gradient-to-br from-primary-500 to-orange-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                    {user?.channelName?.charAt(0).toUpperCase() || "?"}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="Add a comment..."
                                        className="w-full bg-transparent border-b border-dark-700 pb-2 text-white placeholder-gray-500 focus:border-white focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Comments list */}
                            <div className="space-y-6">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-3">
                                        <div className="avatar-md flex-shrink-0 overflow-hidden">
                                            <img src={comment.avatar} alt={comment.author} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-white text-sm">{comment.author}</span>
                                                <span className="text-xs text-gray-500">{formatTimeAgo(comment.createdAt)}</span>
                                            </div>
                                            <p className="text-gray-300 text-sm mb-2">{comment.content}</p>
                                            <div className="flex items-center gap-4">
                                                <button className="flex items-center gap-1 text-gray-400 hover:text-white text-sm">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                                    </svg>
                                                    {comment.likes}
                                                </button>
                                                <button className="flex items-center gap-1 text-gray-400 hover:text-white text-sm">
                                                    <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                                    </svg>
                                                </button>
                                                <button className="text-gray-400 hover:text-white text-sm font-medium">
                                                    Reply
                                                </button>
                                            </div>
                                            {comment.replies > 0 && (
                                                <button className="flex items-center gap-2 mt-2 text-primary-400 text-sm font-medium hover:text-primary-300">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M7 10l5 5 5-5z" />
                                                    </svg>
                                                    {comment.replies} replies
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Related videos */}
                    <div className="xl:w-[400px] flex-shrink-0">
                        <h3 className="text-lg font-semibold text-white mb-4">Related videos</h3>
                        <div className="space-y-3">
                            {relatedVideos.map((relatedVideo) => (
                                <Link
                                    key={relatedVideo._id}
                                    to={`/watch/${relatedVideo._id}`}
                                    className="flex gap-3 group"
                                >
                                    <div className="w-40 aspect-video rounded-lg overflow-hidden bg-dark-900 flex-shrink-0">
                                        <img
                                            src={relatedVideo.thumbnailUrl}
                                            alt={relatedVideo.title}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium text-white line-clamp-2 group-hover:text-primary-400 transition-colors">
                                            {relatedVideo.title}
                                        </h4>
                                        <p className="text-xs text-gray-400 mt-1">{relatedVideo.channelName}</p>
                                        <p className="text-xs text-gray-500">
                                            {formatViews(relatedVideo.views)} views • {formatTimeAgo(relatedVideo.createdAt)}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
