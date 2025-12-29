export function FormSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 rounded bg-muted" />
            ))}
        </div>
    );
}
