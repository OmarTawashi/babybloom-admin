export default function LoadingSpinner({ className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center h-64 gap-3 ${className}`}>
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 border-2 border-coral/20 rounded-full" />
        <div className="absolute inset-0 border-2 border-transparent border-t-coral rounded-full animate-spin" />
      </div>
      <span className="text-xs text-text-secondary font-medium">Loading...</span>
    </div>
  )
}