interface VideoSkeletonProps {
    count?: number;
}

export function VideoSkeleton({ count = 1 }: VideoSkeletonProps) {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <article key={index} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    {/* Thumbnail skeleton */}
                    <div className="skeleton aspect-video rounded-xl mb-3" />

                    {/* Info skeleton */}
                    <div className="flex gap-3">
                        {/* Avatar skeleton */}
                        <div className="skeleton w-10 h-10 rounded-full flex-shrink-0" />

                        {/* Text content skeleton */}
                        <div className="flex-1 space-y-2">
                            {/* Title skeleton - 2 lines */}
                            <div className="skeleton h-4 rounded w-full" />
                            <div className="skeleton h-4 rounded w-3/4" />

                            {/* Channel name skeleton */}
                            <div className="skeleton h-3 rounded w-1/2 mt-2" />

                            {/* Views skeleton */}
                            <div className="skeleton h-3 rounded w-1/3" />
                        </div>
                    </div>
                </article>
            ))}
        </>
    );
}

export function ShortsSkeleton({ count = 5 }: { count?: number }) {
    return (
        <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className="skeleton w-40 aspect-[9/16] rounded-2xl flex-shrink-0"
                    style={{ animationDelay: `${index * 50}ms` }}
                />
            ))}
        </div>
    );
}

export function CategoryChipsSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className="skeleton h-10 rounded-xl flex-shrink-0"
                    style={{
                        width: `${60 + Math.random() * 40}px`,
                        animationDelay: `${index * 30}ms`
                    }}
                />
            ))}
        </div>
    );
}
