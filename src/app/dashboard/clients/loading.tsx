export default function ClientsLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-7 bg-muted rounded w-32" />
        <div className="h-10 bg-muted rounded-lg w-28" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-card rounded-xl border border-border p-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-lg" />
              <div className="flex-1">
                <div className="h-5 bg-muted rounded w-1/3 mb-2" />
                <div className="h-4 bg-muted rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
