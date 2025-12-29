export function DashboardSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header */}
            <div className="h-20 rounded-xl bg-muted" />

            {/* KPI cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-28 rounded-xl bg-muted" />
                ))}
            </div>

            {/* Large sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-64 rounded-xl bg-muted" />
                <div className="h-64 rounded-xl bg-muted" />
            </div>
        </div>
    );
}
