export default function LoadingSpinner({ className = '' }) {
  return (
    <div className={`flex items-center justify-center h-64 ${className}`}>
      <div className="w-8 h-8 border-2 border-coral/20 border-t-coral rounded-full animate-spin" />
    </div>
  )
}
