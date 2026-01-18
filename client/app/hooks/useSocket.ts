/**
 * Socket.io hook for real-time features
 * This provides the foundation for room/watch party functionality
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface UseSocketOptions {
    url?: string;
    roomId?: string;
    autoConnect?: boolean;
}

interface SocketState {
    socket: Socket | null;
    isConnected: boolean;
    error: Error | null;
}

interface Message {
    id: string;
    userId: string;
    userName: string;
    content: string;
    timestamp: Date;
}

interface Participant {
    id: string;
    name: string;
    avatar?: string;
    joinedAt: Date;
}

interface VideoSyncState {
    currentTime: number;
    isPlaying: boolean;
    lastUpdated: Date;
}

export function useSocket(options: UseSocketOptions = {}) {
    const {
        url = process.env.SOCKET_URL || "http://localhost:3001",
        roomId,
        autoConnect = true,
    } = options;

    const [state, setState] = useState<SocketState>({
        socket: null,
        isConnected: false,
        error: null,
    });

    const [messages, setMessages] = useState<Message[]>([]);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [videoSync, setVideoSync] = useState<VideoSyncState | null>(null);

    const socketRef = useRef<Socket | null>(null);

    // Connect to socket
    const connect = useCallback(() => {
        if (socketRef.current?.connected) return;

        const socket = io(url, {
            transports: ["websocket", "polling"],
            autoConnect: false,
        });

        socket.on("connect", () => {
            setState((prev) => ({ ...prev, isConnected: true, error: null }));

            // Join room if specified
            if (roomId) {
                socket.emit("room:join", { roomId });
            }
        });

        socket.on("disconnect", () => {
            setState((prev) => ({ ...prev, isConnected: false }));
        });

        socket.on("connect_error", (error) => {
            setState((prev) => ({ ...prev, error, isConnected: false }));
        });

        // Room events
        socket.on("room:joined", (data: { participants: Participant[] }) => {
            setParticipants(data.participants);
        });

        socket.on("room:user_joined", (participant: Participant) => {
            setParticipants((prev) => [...prev, participant]);
        });

        socket.on("room:user_left", (userId: string) => {
            setParticipants((prev) => prev.filter((p) => p.id !== userId));
        });

        // Chat events
        socket.on("chat:message", (message: Message) => {
            setMessages((prev) => [...prev, message]);
        });

        // Video sync events
        socket.on("video:sync", (syncState: VideoSyncState) => {
            setVideoSync(syncState);
        });

        socket.connect();
        socketRef.current = socket;
        setState((prev) => ({ ...prev, socket }));

        return socket;
    }, [url, roomId]);

    // Disconnect from socket
    const disconnect = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
            setState({ socket: null, isConnected: false, error: null });
        }
    }, []);

    // Send chat message
    const sendMessage = useCallback((content: string) => {
        if (socketRef.current && roomId) {
            socketRef.current.emit("chat:send", { roomId, content });
        }
    }, [roomId]);

    // Sync video state
    const syncVideo = useCallback(
        (currentTime: number, isPlaying: boolean) => {
            if (socketRef.current && roomId) {
                socketRef.current.emit("video:sync", {
                    roomId,
                    currentTime,
                    isPlaying,
                    lastUpdated: new Date(),
                });
            }
        },
        [roomId]
    );

    // Request video sync from host
    const requestSync = useCallback(() => {
        if (socketRef.current && roomId) {
            socketRef.current.emit("video:request_sync", { roomId });
        }
    }, [roomId]);

    // Auto-connect on mount
    useEffect(() => {
        if (autoConnect) {
            connect();
        }

        return () => {
            disconnect();
        };
    }, [autoConnect, connect, disconnect]);

    return {
        ...state,
        messages,
        participants,
        videoSync,
        connect,
        disconnect,
        sendMessage,
        syncVideo,
        requestSync,
    };
}

// Simpler hook just for presence/connection status
export function useSocketStatus(url?: string) {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const socketUrl = url || process.env.SOCKET_URL || "http://localhost:3001";
        const socket = io(socketUrl, {
            transports: ["websocket"],
            autoConnect: true,
        });

        socket.on("connect", () => setIsConnected(true));
        socket.on("disconnect", () => setIsConnected(false));

        return () => {
            socket.disconnect();
        };
    }, [url]);

    return isConnected;
}
