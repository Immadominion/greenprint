export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="shimmer h-36 rounded-3xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="shimmer h-28 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="shimmer h-72 rounded-2xl lg:col-span-2" />
        <div className="shimmer h-72 rounded-2xl" />
      </div>
    </div>
  );
}
