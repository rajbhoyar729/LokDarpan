import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useLocation, Link } from "@remix-run/react";
import { Layout } from "~/components/Layout/Layout";
import { getUserFromSession } from "~/services/auth.server";

export const meta: MetaFunction = () => {
    return [{ title: "Explore - LokDarpan" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
    const userSession = await getUserFromSession(request);
    return json({ user: userSession?.user || null });
}

export default function GenericPage() {
    const { user } = useLoaderData<typeof loader>();
    const location = useLocation();

    // Capitalize first letter of path
    const title = location.pathname.substring(1).charAt(0).toUpperCase() + location.pathname.substring(1).slice(1);

    return (
        <Layout user={user}>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="w-24 h-24 mb-6 rounded-full bg-primary-500/10 flex items-center justify-center shadow-glow-sm">
                    <svg className="w-12 h-12 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                </div>

                <h1 className="text-4xl font-display font-bold text-white mb-4">
                    {title} is Coming Soon
                </h1>

                <p className="text-dark-300 max-w-md mb-8 text-lg">
                    We're crafting a unique experience for the <strong>{title}</strong> section.
                    Stay tuned for something amazing.
                </p>

                <Link to="/" className="btn-primary flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Home
                </Link>
            </div>
        </Layout>
    );
}
