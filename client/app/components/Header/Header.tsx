import { Link, Form, useSubmit } from "@remix-run/react";
import { useState, useEffect } from "react";

interface HeaderProps {
    user?: {
        name: string;
        channel?: string;
    } | null;
}

export function Header({ user }: HeaderProps) {
    const [scrolled, setScrolled] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-4 md:px-8 py-3 bg-dark-950 ${scrolled ? "pt-2 shadow-lg" : "pt-4"
                }`}
        >
            <div
                className={`max-w-[1920px] mx-auto transition-all duration-500 ${scrolled
                    ? "bg-dark-900 px-4 py-2 rounded-full border border-white/10"
                    : ""
                    }`}
            >
                <div className="flex items-center justify-between gap-4">
                    {/* Brand Logo - Animated Gradient */}
                    <Link to="/" className="flex items-center gap-3 group shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-primary-gradient flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-glow-sm">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-xl font-display font-bold tracking-tight text-white group-hover:text-gradient transition-all">
                            Lok<span className="text-primary-400">Darpan</span>
                        </span>
                    </Link>

                    {/* Floating Search Bar */}
                    <div className="flex-1 max-w-2xl hidden md:block">
                        <Form action="/search" className={`relative transition-all duration-300 ${searchFocused ? 'scale-[1.02]' : ''}`}>
                            <div className={`flex items-center bg-dark-800/50 border ${searchFocused ? 'border-primary-500/50 shadow-glow-sm bg-dark-900' : 'border-white/5'
                                } rounded-full overflow-hidden transition-all duration-300`}>
                                <span className="pl-4 text-dark-400">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    name="q"
                                    placeholder="Discover unique content..."
                                    className="w-full bg-transparent border-none text-white placeholder-dark-400 px-4 py-2.5 focus:ring-0 text-sm"
                                    onFocus={() => setSearchFocused(true)}
                                    onBlur={() => setSearchFocused(false)}
                                />
                                <button type="button" className="pr-4 text-dark-400 hover:text-primary-400 transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                    </svg>
                                </button>
                            </div>
                        </Form>
                    </div>

                    {/* Action Hub */}
                    <div className="flex items-center gap-3 shrink-0">
                        {/* Upload Button - Icon Only on mobile */}
                        <Link to="/upload" className="w-10 h-10 md:w-auto md:px-4 md:py-2 rounded-full border border-white/10 hover:border-primary-500/50 flex items-center justify-center gap-2 text-white hover:bg-white/5 transition-all group">
                            <svg className="w-5 h-5 text-dark-300 group-hover:text-primary-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="hidden md:inline font-medium text-sm">Create</span>
                        </Link>

                        {/* Notifications */}
                        <button className="w-10 h-10 rounded-full border border-white/10 hover:border-accent-500/50 flex items-center justify-center text-white hover:bg-white/5 transition-all relative group">
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-accent-500 rounded-full animate-pulse"></span>
                            <svg className="w-5 h-5 text-dark-300 group-hover:text-accent-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </button>

                        {/* User Profile */}
                        {user ? (
                            <Link to="/profile" className="w-10 h-10 rounded-full p-0.5 border-2 border-primary-500/50 hover:border-primary-400 transition-all shadow-glow-sm">
                                <div className="w-full h-full rounded-full bg-dark-800 overflow-hidden">
                                    {/* For now, just show initials. Later fetch channel logo if exists */}
                                    <div className="w-full h-full flex items-center justify-center bg-primary-gradient text-white font-bold text-xs">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                            </Link>
                        ) : (
                            <Link to="/auth/login" className="btn-primary flex items-center gap-2">
                                <span className="text-sm">Sign In</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
