
interface CategoryChipsProps {
    categories: string[];
    activeCategory?: string;
}

export function CategoryChips({ categories, activeCategory = "All" }: CategoryChipsProps) {
    return (
        <div className="flex gap-3 overflow-x-auto scrollbar-hide py-2">
            {categories.map((cat) => (
                <button
                    key={cat}
                    className={`nav-pill whitespace-nowrap border border-white/5 ${cat === activeCategory
                            ? "bg-primary-500 text-white shadow-glow-sm border-transparent"
                            : "bg-dark-900 hover:border-primary-500/30"
                        }`}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
}
