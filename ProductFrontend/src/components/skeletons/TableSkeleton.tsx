export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-3 animate-pulse">
            <div className="h-10 rounded bg-muted" />
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="h-12 rounded bg-muted" />
            ))}
        </div>
    );
}
