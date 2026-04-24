import { motion } from "framer-motion";
import { Briefcase, MapPin, Clock, DollarSign, ArrowRight, Building2 } from "lucide-react";

const categoryColors = {
  Engineering: "from-violet-500/20 to-purple-500/20 border-violet-500/30 text-violet-300",
  Design: "from-pink-500/20 to-rose-500/20 border-pink-500/30 text-pink-300",
  Marketing: "from-orange-500/20 to-amber-500/20 border-orange-500/30 text-orange-300",
  Finance: "from-emerald-500/20 to-green-500/20 border-emerald-500/30 text-emerald-300",
  Sales: "from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-300",
  default: "from-indigo-500/20 to-blue-500/20 border-indigo-500/30 text-indigo-300",
};

export default function JobCard({ job, onApply, onEdit, onDelete, isEmployer, isDark }) {
  const catColor = categoryColors[job.category] || categoryColors.default;
  const timeAgo = job.createdAt?.toDate
    ? (() => {
        const diff = Date.now() - job.createdAt.toDate().getTime();
        const days = Math.floor(diff / 86400000);
        return days === 0 ? "Today" : days === 1 ? "Yesterday" : `${days}d ago`;
      })()
    : "Recently";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4 }}
      className={`relative group rounded-2xl border p-5 backdrop-blur-xl transition-all duration-300 overflow-hidden
        ${isDark
          ? "bg-white/5 border-white/10 hover:border-violet-500/40 hover:bg-white/8"
          : "bg-black/3 border-black/10 hover:border-violet-500/40 hover:bg-white/80"
        }`}
    >
      {/* Glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.08) 0%, transparent 70%)" }} />

      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${catColor.split(" ").slice(0,2).join(" ")} border ${catColor.split(" ")[2]} flex-shrink-0`}>
            <Building2 size={18} className={catColor.split(" ")[3]} />
          </div>
          <div>
            <h3 className={`font-semibold text-base leading-snug ${isDark ? "text-white" : "text-gray-900"}`}>
              {job.title}
            </h3>
            <p className={`text-sm ${isDark ? "text-white/50" : "text-gray-500"}`}>{job.company || "Company"}</p>
          </div>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full border bg-gradient-to-r flex-shrink-0 ${catColor}`}>
          {job.category || "General"}
        </span>
      </div>

      <p className={`text-sm mb-4 line-clamp-2 leading-relaxed ${isDark ? "text-white/55" : "text-gray-600"}`}>
        {job.description}
      </p>

      <div className={`flex flex-wrap gap-3 mb-4 text-xs ${isDark ? "text-white/45" : "text-gray-500"}`}>
        <span className="flex items-center gap-1.5">
          <MapPin size={12} className="text-violet-400" />
          {job.location || "Remote"}
        </span>
        <span className="flex items-center gap-1.5">
          <DollarSign size={12} className="text-emerald-400" />
          {job.salary || "Competitive"}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={12} className="text-blue-400" />
          {timeAgo}
        </span>
        <span className="flex items-center gap-1.5">
          <Briefcase size={12} className="text-pink-400" />
          {job.type || "Full-time"}
        </span>
      </div>

      <div className="flex gap-2 pt-1">
        {isEmployer ? (
          <>
            <button
              onClick={() => onEdit && onEdit(job)}
              className={`flex-1 text-sm py-2 px-3 rounded-xl font-medium transition-all
                ${isDark ? "bg-white/8 hover:bg-white/15 text-white/80" : "bg-black/5 hover:bg-black/10 text-gray-700"}`}
            >
              Edit
            </button>
            <button
              onClick={() => onDelete && onDelete(job.id)}
              className="flex-1 text-sm py-2 px-3 rounded-xl font-medium transition-all bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
            >
              Delete
            </button>
          </>
        ) : (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onApply && onApply(job)}
            className="flex-1 flex items-center justify-center gap-2 text-sm py-2.5 px-4 rounded-xl font-semibold transition-all
              bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/20"
          >
            Apply Now <ArrowRight size={14} />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}