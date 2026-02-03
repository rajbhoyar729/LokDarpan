
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect, unstable_parseMultipartFormData, unstable_createMemoryUploadHandler } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { requireUserSession, getUserFromSession } from "~/services/auth.server";
import { authApi } from "~/lib/api";

type ActionData = {
    errors?: {
        name?: string;
        description?: string;
        logo?: string;
        form?: string;
    };
    success?: boolean;
};

export const meta: MetaFunction = () => {
    return [{ title: "Create Channel - LokDarpan" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
    const { user } = await requireUserSession(request);

    // If user already has a channel, redirect to it or dashboard
    if (user.channel) {
        return redirect(`/channel/${user.channel}`); // Assuming channel ID is stored
    }

    return json({ user });
}

export async function action({ request }: ActionFunctionArgs) {
    const { token } = await requireUserSession(request);

    try {
        // Use memory handler (or minimal disk handler) just to parseFormData
        // In a real app with large files, we might stream directly or presign URLs
        // For now, we pass the FormData to the backend via our API wrapper logic (which usually expects browser-side FormData, 
        // but here we are in a Remix Action (server-side)).
        // Wait: The `api.ts` uses `fetch`. If we are in Remix Action (Node environment), we need to construct a proper FormData or forward the request.

        // Simpler approach for Remix + Backend API separation: 
        // We can't easily pass the incoming stream directly to another fetch without buffering in Node unless we use specific stream piping.
        // Let's parse it into memory for now (assuming logos are small).

        const uploadHandler = unstable_createMemoryUploadHandler({
            maxPartSize: 5_000_000, // 5MB
        });

        const formData = await unstable_parseMultipartFormData(request, uploadHandler);
        // Note: The `formData` here is a Node `FormData` polyfill (Remix uses the web standard one usually).

        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const logo = formData.get("logo") as File;

        const errors: ActionData["errors"] = {};
        if (!name || name.length < 3) errors.name = "Channel name must be at least 3 characters";
        if (!logo || logo.size === 0) errors.logo = "Channel logo is required";

        if (Object.keys(errors).length > 0) {
            return json<ActionData>({ errors, success: false }, { status: 400 });
        }

        // Forward to backend
        // We'll reconstruct a FormData to send to the backend
        const backendFormData = new FormData();
        backendFormData.append("name", name);
        if (description) backendFormData.append("description", description);
        backendFormData.append("logo", logo, logo.name);

        const response = await authApi.createChannel(backendFormData, token);

        if (response.error || !response.data) {
            return json<ActionData>(
                { errors: { form: response.error || "Channel creation failed" }, success: false },
                { status: response.status || 400 }
            );
        }

        // Success! Redirect to the new channel or home
        // Ideally we should update the session to include the new channel ID, but currently we rely on session cookie.
        // To update session, we'd need to re-login or update the cookie manually.
        // For now, let's redirect to login to force a refresh of session details? Or better, just redirect home and let the app handle fetching profile.
        // User session update is tricky without full re-auth unless we expose a 'refresh-session' endpoint or similar.
        // Let's redirect to logout->login flow or just Home (where subsequent API calls might get channel, but session might be stale).
        // Best UX: Redirect to a "Setup Complete" page or force re-login.
        // Let's redirect to logout to ensure session is refreshed on next login.

        // return redirect("/auth/logout"); 
        // OR better: return redirect("/"); and let the frontend fetch user profile via API which would have channel.
        // But our `getUserFromSession` reads from cookie. Cookie is stale.
        // Plan: Redirect to a page that says "Channel Created! Please sign in again to activate it."

        return redirect("/auth/login?channelCreated=true");

    } catch (error) {
        console.error("Create Channel Error:", error);
        return json<ActionData>(
            {
                errors: { form: "System error. Please try again." },
                success: false
            },
            { status: 500 }
        );
    }
}

export default function CreateChannel() {
    const actionData = useActionData<ActionData>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    return (
        <div className="min-h-screen bg-dark-950 text-white flex flex-col items-center justify-center relative overflow-hidden py-10">
            <div className="spotlight-bg" />

            <div className="w-full max-w-md z-10 px-4 animate-fade-in">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/5 shadow-minimal transition-transform group-hover:scale-105">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                        <span className="text-2xl font-display font-bold tracking-tight">LokDarpan</span>
                    </Link>
                </div>

                <div className="glass-panel p-8 rounded-2xl">
                    <div className="mb-6 text-center">
                        <h1 className="text-xl font-semibold text-white mb-2">Setup Your Channel</h1>
                        <p className="text-dark-400 text-sm">Start your streaming journey</p>
                    </div>

                    <Form method="post" encType="multipart/form-data" className="space-y-4">
                        {actionData?.errors?.form && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3 mb-4">
                                <p className="text-red-400 text-sm">{actionData.errors.form}</p>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-dark-400 uppercase tracking-wider">Channel Name</label>
                            <input type="text" name="name" className="input-minimal" placeholder="Awesome Channel" required minLength={3} />
                            {actionData?.errors?.name && <p className="text-xs text-red-400 mt-1">{actionData.errors.name}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-dark-400 uppercase tracking-wider">Description</label>
                            <textarea name="description" className="input-minimal min-h-[80px]" placeholder="Tell us about your channel..." />
                            {actionData?.errors?.description && <p className="text-xs text-red-400 mt-1">{actionData.errors.description}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-dark-400 uppercase tracking-wider">Channel Logo</label>
                            <div className="relative group">
                                <input type="file" name="logo" accept="image/*" className="block w-full text-sm text-dark-400
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-xs file:font-semibold
                                file:bg-primary-500/10 file:text-primary-500
                                hover:file:bg-primary-500/20
                                " required />
                            </div>
                            {actionData?.errors?.logo && <p className="text-xs text-red-400 mt-1">{actionData.errors.logo}</p>}
                        </div>

                        <button type="submit" disabled={isSubmitting} className="btn-primary w-full shadow-glow-subtle mt-4">
                            {isSubmitting ? "Creating Channel..." : "Create Channel"}
                        </button>
                    </Form>

                    <div className="mt-6 pt-6 border-t border-white/5 text-center">
                        <Link to="/" className="text-sm text-dark-400 hover:text-white">Skip for now</Link>
                    </div>

                </div>
            </div>
        </div>
    );
}
