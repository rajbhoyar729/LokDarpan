/**
 * Session management for authentication
 */

import { createCookieSessionStorage, redirect } from "@remix-run/node";

// Session secret - in production, use environment variable
const sessionSecret = process.env.SESSION_SECRET || "super-secret-key-change-in-production";

// Create session storage
const sessionStorage = createCookieSessionStorage({
    cookie: {
        name: "__lokdarpan_session",
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
        sameSite: "lax",
        secrets: [sessionSecret],
        secure: process.env.NODE_ENV === "production",
    },
});

// Get session from request
export async function getSession(request: Request) {
    const cookie = request.headers.get("Cookie");
    return sessionStorage.getSession(cookie);
}

// Create user session
export async function createUserSession(
    userId: string,
    token: string,
    user: {
        channelName: string;
        email: string;
        logoUrl?: string;
    },
    redirectTo: string
) {
    const session = await sessionStorage.getSession();
    session.set("userId", userId);
    session.set("token", token);
    session.set("user", user);

    return redirect(redirectTo, {
        headers: {
            "Set-Cookie": await sessionStorage.commitSession(session),
        },
    });
}

// Get user from session
export async function getUserFromSession(request: Request) {
    const session = await getSession(request);
    const userId = session.get("userId");
    const token = session.get("token");
    const user = session.get("user");

    if (!userId || !token) {
        return null;
    }

    return { userId, token, user };
}

// Get token from session
export async function getTokenFromSession(request: Request) {
    const session = await getSession(request);
    return session.get("token") as string | null;
}

// Require user session (redirect to login if not authenticated)
export async function requireUserSession(request: Request) {
    const userSession = await getUserFromSession(request);

    if (!userSession) {
        throw redirect("/auth/login");
    }

    return userSession;
}

// Logout user
export async function logout(request: Request) {
    const session = await getSession(request);

    return redirect("/", {
        headers: {
            "Set-Cookie": await sessionStorage.destroySession(session),
        },
    });
}
