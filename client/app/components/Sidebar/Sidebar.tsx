import { Link, useLocation } from "@remix-run/react";
// Using Remix icons or SVGs
// Compact floating sidebar style

const navItems = [
    { icon: "home", label: "Home", path: "/" },
    { icon: "compass", label: "Explore", path: "/explore" },
    { icon: "activity", label: "Trending", path: "/trending" },
    { icon: "zap", label: "Shorts", path: "/shorts", badge: "NEW" },
    { icon: "users", label: "Following", path: "/following" },
    { icon: "bookmark", label: "Library", path: "/library" },
];

export function Sidebar() {
    const location = useLocation();

    return (
        <nav className="glass-panel h-full flex flex-col p-3 overflow-y-auto scrollbar-hide">
            <ul className="space-y-2">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <li key={item.path}>
                            <Link
                                to={item.path}
                                className={`group flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-300 relative overflow-hidden ${isActive
                                        ? "bg-primary-500/10 text-primary-400 font-medium"
                                        : "text-dark-300 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                {/* Active Indicator Line */}
                                {isActive && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-r-full" />
                                )}

                                <span className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                    {getIcon(item.icon)}
                                </span>

                                <span className={`hidden lg:block relative z-10 ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'} transition-transform duration-300`}>
                                    {item.label}
                                </span>

                                {item.badge && (
                                    <span className="hidden lg:block ml-auto px-1.5 py-0.5 text-[10px] font-bold bg-accent-500 text-black rounded uppercase tracking-wider">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        </li>
                    );
                })}
            </ul>

            <div className="mt-auto pt-6 border-t border-white/5 mx-2">
                <div className="p-4 rounded-xl bg-gradient-to-br from-primary-900/50 to-dark-900 border border-white/5 text-center hidden lg:block">
                    <p className="text-xs text-dark-400 mb-3">Go Ad-Free with Premium</p>
                    <button className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-semibold text-white transition-colors">
                        Upgrade
                    </button>
                </div>
            </div>
        </nav>
    );
}

function getIcon(name: string) {
    switch (name) {
        case "home": return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
        case "compass": return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>;
        case "activity": return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
        case "zap": return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>; // Reusing icon for simpler example, ideally unique
        case "users": return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
        case "bookmark": return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>;
        default: return null;
    }
}
