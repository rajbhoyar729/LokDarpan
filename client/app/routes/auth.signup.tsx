import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { getUserFromSession, createUserSession } from "~/services/auth.server";
import { authApi } from "~/lib/api";

// Define the action data shape for proper typing
type ActionData = {
    errors?: {
        channelName?: string;
        email?: string;
        phone?: string;
        password?: string;
        confirmPassword?: string;
        form?: string;
    };
    success?: boolean;
};

export const meta: MetaFunction = () => {
    return [{ title: "Sign Up - LokDarpan" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
    const userSession = await getUserFromSession(request);
    if (userSession) return redirect("/");
    return json({});
}

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const channelName = formData.get("channelName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    const errors: ActionData["errors"] = {};
    if (!channelName || channelName.length < 3) errors.channelName = "Channel name must be at least 3 characters";
    if (!email) errors.email = "Email is required";
    if (!phone || phone.length < 10) errors.phone = "Valid phone number is required";
    if (!password || password.length < 6) errors.password = "Password must be at least 6 characters";
    if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match";

    if (Object.keys(errors).length > 0) {
        return json<ActionData>({ errors, success: false }, { status: 400 });
    }

    try {
        const response = await authApi.signup({ channelName, email, phone, password });

        if (response.error || !response.data) {
            return json<ActionData>(
                { errors: { form: response.error || "Signup failed" }, success: false },
                { status: response.status || 400 }
            );
        }

        // Auto-login after signup
        try {
            const loginResponse = await authApi.login({ email, password });
            if (loginResponse.data) {
                const { user, token } = loginResponse.data;
                return createUserSession(user._id, token, user, "/");
            }
        } catch (loginError) {
            // If auto-login fails, redirect to login page
            return redirect("/auth/login?registered=true");
        }

        return redirect("/auth/login?registered=true");

    } catch (error) {
        console.error("Signup Action Error:", error);
        return json<ActionData>(
            {
                errors: { form: "Unable to connect to authentication server. Please try again later." },
                success: false
            },
            { status: 503 }
        );
    }
}

export default function Signup() {
    const actionData = useActionData<ActionData>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    return (
        <div className="min-h-screen bg-dark-950 text-white flex flex-col items-center justify-center relative overflow-hidden py-10">
            {/* Ambient Background Spotlight */}
            <div className="spotlight-bg" />

            <div className="w-full max-w-md z-10 px-4 animate-fade-in">

                {/* Brand Header */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/5 shadow-minimal transition-transform group-hover:scale-105">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                        <span className="text-2xl font-display font-bold tracking-tight">LokDarpan</span>
                    </Link>
                </div>

                {/* Signup Card */}
                <div className="glass-panel p-8 rounded-2xl">
                    <div className="mb-6 text-center">
                        <h1 className="text-xl font-semibold text-white mb-2">Create your account</h1>
                        <p className="text-dark-400 text-sm">Join the community of creators</p>
                    </div>

                    <Form method="post" className="space-y-4">
                        {/* Global Error Alert */}
                        {actionData?.errors?.form && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3 mb-4">
                                <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <p className="text-red-400 text-sm">{actionData.errors.form}</p>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-dark-400 uppercase tracking-wider">Channel Name</label>
                            <input type="text" name="channelName" className="input-minimal" placeholder="Your Channel" required minLength={3} />
                            {actionData?.errors?.channelName && <p className="text-xs text-red-400 mt-1">{actionData.errors.channelName}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-dark-400 uppercase tracking-wider">Email</label>
                            <input type="email" name="email" className="input-minimal" placeholder="name@company.com" required />
                            {actionData?.errors?.email && <p className="text-xs text-red-400 mt-1">{actionData.errors.email}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-dark-400 uppercase tracking-wider">Phone</label>
                            <input type="tel" name="phone" className="input-minimal" placeholder="1234567890" required minLength={10} />
                            {actionData?.errors?.phone && <p className="text-xs text-red-400 mt-1">{actionData.errors.phone}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-dark-400 uppercase tracking-wider">Password</label>
                                <input type="password" name="password" className="input-minimal" placeholder="••••••" required minLength={6} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-dark-400 uppercase tracking-wider">Confirm</label>
                                <input type="password" name="confirmPassword" className="input-minimal" placeholder="••••••" required />
                            </div>
                        </div>
                        {actionData?.errors?.password && <p className="text-xs text-red-400">{actionData.errors.password}</p>}
                        {actionData?.errors?.confirmPassword && <p className="text-xs text-red-400">{actionData.errors.confirmPassword}</p>}

                        <button type="submit" disabled={isSubmitting} className="btn-primary w-full shadow-glow-subtle mt-2">
                            {isSubmitting ? "Creating Account..." : "Sign Up"}
                        </button>
                    </Form>

                    <p className="mt-6 text-xs text-dark-500 text-center">
                        By signing up, you agree to our <a href="#" className="hover:text-white underline">Terms</a> and <a href="#" className="hover:text-white underline">Privacy Policy</a>.
                    </p>

                    <div className="mt-6 pt-6 border-t border-white/5 text-center">
                        <p className="text-sm text-dark-400">
                            Already have an account?{" "}
                            <Link to="/auth/login" className="text-white font-medium hover:underline">Sign In</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
