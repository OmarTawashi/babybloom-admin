import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

export default function StatCard({ label, value, change, up = true, icon: Icon, color }) {
  return (
    <div className="bg-surface rounded-2xl p-5 border border-border card-hover animate-fade-in-up">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center shadow-sm`}>
          {Icon && <Icon size={18} className="text-white" />}
        </div>
        {change && (
          <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
            up ? 'text-emerald-600 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'
          }`}>
            {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {change}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-text-primary tracking-tight">{value}</div>
      <div className="text-xs text-text-secondary mt-0.5 font-medium">{label}</div>
    </div>
  )
}