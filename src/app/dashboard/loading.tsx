export default function DashboardLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-7 bg-muted rounded w-40 mb-2" />
          <div className="h-4 bg-muted rounded w-24" />
        </div>
        <div className="h-10 bg-muted rounded-lg w-28" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4">
            <div className="h-4 bg-muted rounded w-16 mb-2" />
            <div className="h-8 bg-muted rounded w-10" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-card rounded-xl border border-border p-5"
          >
            <div className="h-5 bg-muted rounded w-1/3 mb-3" />
            <div className="h-4 bg-muted rounded w-1/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
