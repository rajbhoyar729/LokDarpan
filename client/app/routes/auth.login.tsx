import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { getUserFromSession, createUserSession } from "~/services/auth.server";
import { authApi } from "~/lib/api";

export const meta: MetaFunction = () => {
    return [{ title: "Sign In - LokDarpan" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
    const userSession = await getUserFromSession(request);
    if (userSession) return redirect("/");
    return json({});
}

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return json({ errors: { form: "All fields are required" }, success: false }, { status: 400 });
    }

    try {
        const response = await authApi.login({ email, password });

        if (response.error || !response.data) {
            return json(
                {
                    errors: { form: response.error || "Invalid credentials" },
                    success: false
                },
                { status: response.status || 400 }
            );
        }

        const { user, token } = response.data;
        return createUserSession(user._id, token, user, "/");

    } catch (error) {
        // Catch network or unexpected errors to prevent "fetch failed" crash page
        console.error("Login Action Error:", error);
        return json(
            {
                errors: { form: "Unable to connect to authentication server. Please try again later." },
                success: false
            },
            { status: 503 }
        );
    }
}

export default function Login() {
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    return (
        <div className="min-h-screen bg-dark-950 text-white flex flex-col items-center justify-center relative overflow-hidden">
            {/* Ambient Background Spotlight */}
            <div className="spotlight-bg" />

            {/* Main Container */}
            <div className="w-full max-w-md z-10 px-4 animate-fade-in">

                {/* Brand Header */}
                <div className="text-center mb-10">
                    <Link to="/" className="inline-flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/5 shadow-minimal transition-transform group-hover:scale-105">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                        <span className="text-2xl font-display font-bold tracking-tight">LokDarpan</span>
                    </Link>
                </div>

                {/* Login Card */}
                <div className="glass-panel p-8 md:p-10 rounded-2xl">
                    <div className="mb-8">
                        <h1 className="text-xl font-semibold text-white mb-2">Welcome back</h1>
                        <p className="text-dark-400 text-sm">Enter your credentials to access your workspace.</p>
                    </div>

                    <Form method="post" className="space-y-6">
                        {/* Global Error Alert */}
                        {actionData?.errors?.form && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                                <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <p className="text-red-400 text-sm">{actionData.errors.form}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-dark-400 uppercase tracking-wider">Email</label>
                            <input
                                type="email"
                                name="email"
                                autoComplete="email"
                                required
                                className="input-minimal"
                                placeholder="name@company.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-medium text-dark-400 uppercase tracking-wider">Password</label>
                                <Link to="/auth/forgot-password" className="text-xs text-primary-400 hover:text-primary-300">Forgot?</Link>
                            </div>
                            <input
                                type="password"
                                name="password"
                                autoComplete="current-password"
                                required
                                className="input-minimal"
                                placeholder="••••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary w-full shadow-glow-subtle"
                        >
                            {isSubmitting ? "Authenticating..." : "Sign In"}
                        </button>
                    </Form>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-sm text-dark-400">
                            Don't have an account?{" "}
                            <Link to="/auth/signup" className="text-white font-medium hover:underline">Create one</Link>
                        </p>
                    </div>
                </div>

                {/* Footer Links (Professional Touch) */}
                <div className="mt-8 flex justify-center gap-6 text-xs text-dark-500">
                    <a href="#" className="hover:text-dark-300">Privacy</a>
                    <a href="#" className="hover:text-dark-300">Terms</a>
                    <a href="#" className="hover:text-dark-300">Help</a>
                </div>
            </div>
        </div>
    );
}
