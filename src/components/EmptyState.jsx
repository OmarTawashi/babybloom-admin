export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-16 h-16 bg-cream rounded-2xl flex items-center justify-center mb-4">
          <Icon size={28} className="text-ink/20" />
        </div>
      )}
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      {description && <p className="text-sm text-ink/40 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
