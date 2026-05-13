/**
 * API Client for LokDarpan Backend
 */

const API_BASE_URL = typeof window !== 'undefined'
    ? (window.ENV?.API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1')
    : (process.env.VITE_API_URL || process.env.API_URL || 'http://localhost:5000/api/v1');

/** Base URL for Remix loaders (server) and alignment with VITE_API_URL */
export function getServerApiBaseUrl(): string {
    return process.env.VITE_API_URL || process.env.API_URL || 'http://localhost:5000/api/v1';
}

interface ApiOptions extends RequestInit {
    token?: string;
}

interface ApiResponse<T> {
    data: T | null;
    error: string | null;
    status: number;
}

/**
 * Make an API request
 */
async function apiRequest<T>(
    endpoint: string,
    options: ApiOptions = {}
): Promise<ApiResponse<T>> {
    const { token, ...fetchOptions } = options;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    try {
        // Ensure endpoint starts with /
        const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        const url = `${API_BASE_URL}${normalizedEndpoint}`;

        console.log(`📡 Fetching: ${url}`);

        const response = await fetch(url, {
            ...fetchOptions,
            headers,
        });

        const contentType = response.headers.get("content-type");
        let data;

        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            // Error handling for non-JSON responses (e.g., HTML 404/500 from proxy)
            const textFn = await response.text(); // Consume body
            console.error(`❌ Non-JSON response from ${url}:`, textFn.slice(0, 100)); // Log first 100 chars
            return {
                data: null,
                error: `Server Error: Received non-JSON response (${response.status})`,
                status: response.status,
            };
        }

        if (!response.ok) {
            return {
                data: null,
                error: data.error?.message || data.message || 'An error occurred',
                status: response.status,
            };
        }

        return {
            data,
            error: null,
            status: response.status,
        };
    } catch (error) {
        console.error("🔥 API Request Error:", error);
        return {
            data: null,
            error: 'Unable to reach the server. Please check your internet connection or try again later.',
            status: 0,
        };
    }
}

/**
 * Auth API
 */
export const authApi = {
    signup: async (data: {
        name: string;
        email: string;
        phone: string;
        password: string;
    }) => {
        return apiRequest<{
            message: string;
            user: User;
        }>('/auth/signup', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    login: async (data: { email: string; password: string }) => {
        return apiRequest<{
            message: string;
            user: User;
            token: string;
        }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    createChannel: async (formData: FormData, token: string) => {
        const response = await fetch(`${API_BASE_URL}/channel`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        const contentType = response.headers.get("content-type");
        let data;
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            return { data: null, error: "Server returned non-JSON response", status: response.status };
        }

        return { data, error: response.ok ? null : (data.error?.message || data.message), status: response.status };
    },
};

/**
 * Video API
 */
export const videoApi = {
    getAll: async (token?: string) => {
        return apiRequest<{ videos: Video[] }>('/video', { token });
    },

    getById: async (videoId: string, token?: string) => {
        return apiRequest<{ video: Video }>(`/video/${videoId}`, { token });
    },

    upload: async (formData: FormData, token: string) => {
        // Multipart upload needs special handling (no Content-Type header)
        const response = await fetch(`${API_BASE_URL}/video/upload`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        const contentType = response.headers.get("content-type");
        let data;
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            return { data: null, error: "Server returned non-JSON response", status: response.status };
        }

        return { data, error: response.ok ? null : (data.error?.message || data.message), status: response.status };
    },

    like: async (videoId: string, token: string) => {
        return apiRequest<{ message: string; likes: number }>(`/video/${videoId}/like`, {
            method: 'PUT',
            token,
        });
    },

    dislike: async (videoId: string, token: string) => {
        return apiRequest<{ message: string; dislikes: number }>(`/video/${videoId}/dislike`, {
            method: 'PUT',
            token,
        });
    },

    delete: async (videoId: string, token: string) => {
        return apiRequest<{ message: string }>(`/video/${videoId}`, {
            method: 'DELETE',
            token,
        });
    },

    initiateUpload: async (
        body: { title: string; description: string; category?: string; tags?: string },
        token: string
    ) => {
        return apiRequest<{ message: string; videoId: string; preSignedUrl: string }>(
            '/video/initiate-upload',
            {
                method: 'POST',
                body: JSON.stringify(body),
                token,
            }
        );
    },

    completeUpload: async (videoId: string, token: string) => {
        return apiRequest<{
            message: string;
            status: string;
            transcodeJobId: string;
            videoId: string;
        }>(`/video/${videoId}/complete-upload`, {
            method: 'POST',
            token,
        });
    },

    getTranscodeStatus: async (videoId: string, token: string) => {
        return apiRequest<{
            videoStatus: string;
            hlsMasterUrl?: string;
            videoUrl?: string;
            transcodeJobId?: string;
            jobState?: string | null;
            jobProgress?: unknown;
            processingError?: string;
            renditions?: VideoRendition[];
        }>(`/video/${videoId}/transcode-status`, { token });
    },
};

/**
 * Direct PUT to S3 (no Authorization header)
 */
export async function putVideoToPresignedUrl(preSignedUrl: string, file: File) {
    const res = await fetch(preSignedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type || 'video/mp4' },
    });
    if (!res.ok) {
        return {
            ok: false as const,
            error: `Upload to storage failed (${res.status})`,
        };
    }
    return { ok: true as const };
}

/**
 * User API
 */
export const userApi = {
    subscribe: async (channelId: string, token: string) => {
        return apiRequest<{ message: string }>(`/user/${channelId}/subscribe`, {
            method: 'PUT',
            token,
        });
    },

    unsubscribe: async (channelId: string, token: string) => {
        return apiRequest<{ message: string }>(`/user/${channelId}/unsubscribe`, {
            method: 'PUT',
            token,
        });
    },
};

/**
 * Comment API
 */
export const commentApi = {
    create: async (videoId: string, commentText: string, token: string) => {
        return apiRequest<{ message: string; comment: Comment }>(`/comment/${videoId}/comments`, {
            method: 'POST',
            token,
            body: JSON.stringify({ comment_text: commentText }),
        });
    },

    update: async (commentId: string, commentText: string, token: string) => {
        return apiRequest<{ message: string; comment: Comment }>(`/comment/${commentId}`, {
            method: 'PUT',
            token,
            body: JSON.stringify({ comment_text: commentText }),
        });
    },

    delete: async (commentId: string, token: string) => {
        return apiRequest<{ message: string }>(`/comment/${commentId}`, {
            method: 'DELETE',
            token,
        });
    },
};

// Type definitions
export interface User {
    _id: string;
    name: string;
    email: string;
    phone: string;
    channel?: string; // Channel ID
}

export interface VideoRendition {
    label: string;
    height: number;
    width?: number;
    bandwidth: number;
    playlistUrl: string;
    playlistKey: string;
}

export interface Video {
    _id: string;
    title: string;
    description: string;
    category?: string;
    tags?: string[];
    status?: string;
    videoUrl?: string;
    hlsMasterUrl?: string;
    renditions?: VideoRendition[];
    thumbnailUrl?: string;
    duration?: number;
    durationSeconds?: number;
    views: number;
    likes: number;
    dislikes: number;
    userId?: string;
    user_id?: User & { channel?: { name?: string; logoUrl?: string } };
    channelName?: string;
    channelLogo?: string;
    createdAt: string;
    updatedAt: string;
    processingError?: string;
}

export interface Comment {
    _id: string;
    user_id: string;
    video_id: string;
    comment_text: string;
    createdAt: string;
    updatedAt: string;
}

// Add ENV type to window
declare global {
    interface Window {
        ENV?: {
            API_URL?: string;
        };
    }
}
