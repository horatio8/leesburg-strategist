export default function ClientDetailLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      <div className="h-4 bg-muted rounded w-20 mb-4" />
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-muted rounded-lg" />
        <div>
          <div className="h-7 bg-muted rounded w-48 mb-1" />
          <div className="h-4 bg-muted rounded w-32" />
        </div>
      </div>
      <div className="flex gap-1 border-b border-border mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-9 bg-muted rounded w-24" />
        ))}
      </div>
      <div className="space-y-3">
        {[1, 2].map((i) => (
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
