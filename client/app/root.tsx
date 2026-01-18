import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";

import "./tailwind.css";

export const links: LinksFunction = () => [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
    },
    {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap",
    },
];

export const meta: MetaFunction = () => {
    return [
        { title: "LokDarpan - Share Your Vision" },
        { name: "description", content: "A modern video hosting and streaming platform" },
        { name: "theme-color", content: "#0f0f0f" },
    ];
};

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="dark">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <Meta />
                <Links />
            </head>
            <body>
                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export default function App() {
    return <Outlet />;
}

export function ErrorBoundary() {
    return (
        <div className="min-h-screen bg-dark-1000 flex items-center justify-center p-4">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-primary-500 mb-4">Oops!</h1>
                <p className="text-xl text-gray-400 mb-8">Something went wrong</p>
                <a
                    href="/"
                    className="btn-primary"
                >
                    Go back home
                </a>
            </div>
        </div>
    );
}
