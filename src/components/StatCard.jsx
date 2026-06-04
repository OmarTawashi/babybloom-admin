import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

export default function StatCard({ label, value, change, up = true, icon: Icon, color }) {
  return (
    <div className="bg-surface rounded-2xl p-5 border border-border">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
          {Icon && <Icon size={18} className="text-white" />}
        </div>
        {change && (
          <span className={`flex items-center gap-1 text-xs font-semibold ${up ? 'text-emerald-500' : 'text-red-500'}`}>
            {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {change}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-text-primary">{value}</div>
      <div className="text-xs text-text-secondary mt-0.5">{label}</div>
    </div>
  )
}
