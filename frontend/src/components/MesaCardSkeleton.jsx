export default function MesaCardSkeleton() {
  return (
    <div className="w-full p-6 rounded border border-dorado-400/20 bg-negro-800">
      <div className="skeleton h-8 w-1/2 mb-4"></div>
      <div className="space-y-2">
        <div className="skeleton h-4 w-3/4"></div>
        <div className="skeleton h-4 w-2/3"></div>
      </div>
    </div>
  )
}
