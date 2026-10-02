export default function AdminLoading() {
  return (
    <div className="min-h-[60vh] bg-[#F7F3EC] p-5 sm:p-8" aria-busy="true" aria-label="Loading Commerce Studio">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="h-3 w-24 rounded bg-black/10" />
        <div className="mt-4 h-10 w-64 rounded bg-black/10" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-28 rounded-2xl border border-black/10 bg-white/60" />)}
        </div>
        <div className="mt-6 h-80 rounded-2xl border border-black/10 bg-white/60" />
      </div>
    </div>
  )
}
