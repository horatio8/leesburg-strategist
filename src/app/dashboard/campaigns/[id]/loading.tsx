export default function CampaignDetailLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      <div className="h-4 bg-muted rounded w-24 mb-4" />
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="h-7 bg-muted rounded w-56 mb-2" />
          <div className="h-4 bg-muted rounded w-32" />
        </div>
        <div className="h-8 bg-muted rounded w-40" />
      </div>
      <div className="flex gap-1 border-b border-border mb-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-9 bg-muted rounded w-24" />
        ))}
      </div>
      <div className="space-y-4">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="h-5 bg-muted rounded w-1/3 mb-4" />
          <div className="h-4 bg-muted rounded w-full mb-2" />
          <div className="h-4 bg-muted rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}
