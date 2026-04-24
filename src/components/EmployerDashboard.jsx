import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import JobCard from "./JobCard";
import { Plus, X, Briefcase, TrendingUp, Users, Eye } from "lucide-react";

const CATEGORIES = ["Engineering", "Design", "Marketing", "Finance", "Sales", "HR", "Operations", "Other"];
const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Freelance", "Internship"];

const inputClass = (isDark) =>
  `w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all border
  ${isDark
    ? "bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-violet-500/60 focus:bg-white/8"
    : "bg-black/4 border-black/10 text-gray-900 placeholder-gray-400 focus:border-violet-500/60 focus:bg-white"
  }`;

export default function EmployerDashboard({ isDark }) {
  const [jobs, setJobs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editJob, setEditJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", company: "", location: "", salary: "", category: "Engineering",
    type: "Full-time", description: "", requirements: "",
  });

  const fetchJobs = async () => {
    const q = query(collection(db, "jobs"), where("employerId", "==", auth.currentUser?.uid));
    const snap = await getDocs(q);
    setJobs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { fetchJobs(); }, []);

  const resetForm = () => {
    setForm({ title: "", company: "", location: "", salary: "", category: "Engineering", type: "Full-time", description: "", requirements: "" });
    setEditJob(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) return;
    setLoading(true);
    try {
      if (editJob) {
        await updateDoc(doc(db, "jobs", editJob.id), { ...form });
      } else {
        await addDoc(collection(db, "jobs"), {
          ...form,
          employerId: auth.currentUser.uid,
          createdAt: serverTimestamp(),
        });
      }
      await fetchJobs();
      resetForm();
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job posting?")) return;
    await deleteDoc(doc(db, "jobs", id));
    setJobs((j) => j.filter((x) => x.id !== id));
  };

  const handleEdit = (job) => {
    setForm({
      title: job.title, company: job.company, location: job.location,
      salary: job.salary, category: job.category, type: job.type,
      description: job.description, requirements: job.requirements || "",
    });
    setEditJob(job);
    setShowForm(true);
  };

  const stats = [
    { label: "Active Jobs", value: jobs.length, icon: Briefcase, color: "from-violet-500 to-purple-600" },
    { label: "Total Views", value: jobs.reduce((a, j) => a + (j.views || 0), 0), icon: Eye, color: "from-blue-500 to-cyan-600" },
    { label: "Applications", value: jobs.reduce((a, j) => a + (j.applications || 0), 0), icon: Users, color: "from-pink-500 to-rose-600" },
    { label: "This Month", value: jobs.filter(j => j.createdAt?.toDate && Date.now() - j.createdAt.toDate() < 2592000000).length, icon: TrendingUp, color: "from-emerald-500 to-green-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-4 border backdrop-blur-xl
              ${isDark ? "bg-white/5 border-white/10" : "bg-white/60 border-black/8"}`}
          >
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
              <s.icon size={16} className="text-white" />
            </div>
            <div className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{s.value}</div>
            <div className={`text-xs mt-0.5 ${isDark ? "text-white/45" : "text-gray-500"}`}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
          Your Job Listings
        </h2>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => { setShowForm(true); setEditJob(null); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/20"
        >
          <Plus size={16} /> Post Job
        </motion.button>
      </div>

      {/* Job Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
              className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl max-h-[90vh] overflow-y-auto
                ${isDark ? "bg-gray-900 border-white/15" : "bg-white border-black/10"}`}
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className={`text-base font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                  {editJob ? "Edit Job" : "Post New Job"}
                </h3>
                <button onClick={resetForm} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                  <X size={18} className={isDark ? "text-white/60" : "text-gray-500"} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <input className={inputClass(isDark)} placeholder="Job Title *" value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                  </div>
                  <input className={inputClass(isDark)} placeholder="Company Name" value={form.company}
                    onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
                  <input className={inputClass(isDark)} placeholder="Location" value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                  <input className={inputClass(isDark)} placeholder="Salary (e.g. $80k–$100k)" value={form.salary}
                    onChange={e => setForm(f => ({ ...f, salary: e.target.value }))} />
                  <select className={inputClass(isDark)} value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <div className="col-span-2">
                    <select className={inputClass(isDark)} value={form.category}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <textarea className={`${inputClass(isDark)} resize-none`} rows={3} placeholder="Job Description *"
                      value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
                  </div>
                  <div className="col-span-2">
                    <textarea className={`${inputClass(isDark)} resize-none`} rows={2} placeholder="Requirements (optional)"
                      value={form.requirements} onChange={e => setForm(f => ({ ...f, requirements: e.target.value }))} />
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={resetForm}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border
                      ${isDark ? "border-white/15 text-white/70 hover:bg-white/8" : "border-black/12 text-gray-600 hover:bg-black/5"}`}>
                    Cancel
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-purple-600 text-white disabled:opacity-60">
                    {loading ? "Saving…" : editJob ? "Update Job" : "Post Job"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Jobs Grid */}
      {jobs.length === 0 ? (
        <div className={`text-center py-16 rounded-2xl border border-dashed
          ${isDark ? "border-white/15 text-white/35" : "border-black/12 text-gray-400"}`}>
          <Briefcase size={36} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">No jobs posted yet. Click "Post Job" to get started.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {jobs.map(job => (
              <JobCard key={job.id} job={job} isEmployer isDark={isDark}
                onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}