import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, getDocs, addDoc, query, where, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "../firebase";
import JobCard from "./JobCard";
import { Search, Filter, X, CheckCircle, Loader, BookOpen, MapPin, Tag } from "lucide-react";

const CATEGORIES = ["All", "Engineering", "Design", "Marketing", "Finance", "Sales", "HR", "Operations", "Other"];
const LOCATIONS = ["All", "Remote", "New York", "San Francisco", "London", "Berlin", "Toronto", "Mumbai"];

const inputClass = (isDark) =>
  `w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all border
  ${isDark
    ? "bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-violet-500/60"
    : "bg-black/4 border-black/10 text-gray-900 placeholder-gray-400 focus:border-violet-500/60 focus:bg-white"
  }`;

export default function CandidateDashboard({ isDark }) {
  const [allJobs, setAllJobs] = useState([]);
  const [appliedIds, setAppliedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [location, setLocation] = useState("All");
  const [tab, setTab] = useState("browse");
  const [applyJob, setApplyJob] = useState(null);
  const [appForm, setAppForm] = useState({ name: "", email: "", resume: null });
  const [appLoading, setAppLoading] = useState(false);
  const [appSuccess, setAppSuccess] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchApplied();
  }, []);

  const fetchJobs = async () => {
    const snap = await getDocs(collection(db, "jobs"));
    setAllJobs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const fetchApplied = async () => {
    const q = query(collection(db, "applications"), where("candidateId", "==", auth.currentUser?.uid));
    const snap = await getDocs(q);
    setAppliedIds(snap.docs.map(d => d.data().jobId));
  };

  const filtered = allJobs.filter(j => {
    const matchSearch = j.title?.toLowerCase().includes(search.toLowerCase()) ||
      j.company?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || j.category === category;
    const matchLoc = location === "All" || j.location?.toLowerCase().includes(location.toLowerCase());
    return matchSearch && matchCat && matchLoc;
  });

  const appliedJobs = allJobs.filter(j => appliedIds.includes(j.id));

  const handleApply = async (e) => {
    e.preventDefault();
    if (!appForm.name || !appForm.email) return;
    setAppLoading(true);
    try {
      let resumeUrl = "";
      if (appForm.resume) {
        const r = ref(storage, `resumes/${auth.currentUser.uid}/${Date.now()}_${appForm.resume.name}`);
        await uploadBytes(r, appForm.resume);
        resumeUrl = await getDownloadURL(r);
      }
      await addDoc(collection(db, "applications"), {
        jobId: applyJob.id,
        jobTitle: applyJob.title,
        candidateId: auth.currentUser.uid,
        name: appForm.name,
        email: appForm.email,
        resumeUrl,
        appliedAt: serverTimestamp(),
      });

      // EmailJS (graceful — won't break if not configured)
      try {
        if (window.emailjs) {
          await window.emailjs.send(
            import.meta.env.VITE_EMAILJS_SERVICE_ID || "",
            import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "",
            { to_name: appForm.name, to_email: appForm.email, job_title: applyJob.title, company: applyJob.company },
            import.meta.env.VITE_EMAILJS_PUBLIC_KEY || ""
          );
        }
      } catch {}

      setAppliedIds(prev => [...prev, applyJob.id]);
      setAppSuccess(true);
      setTimeout(() => {
        setApplyJob(null);
        setAppSuccess(false);
        setAppForm({ name: "", email: "", resume: null });
      }, 2200);
    } catch (err) { console.error(err); }
    setAppLoading(false);
  };

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className={`flex gap-1 p-1 rounded-xl w-fit border
        ${isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/8"}`}>
        {[{ id: "browse", label: "Browse Jobs" }, { id: "applied", label: `Applied (${appliedIds.length})` }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${tab === t.id
                ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md"
                : isDark ? "text-white/55 hover:text-white/80" : "text-gray-500 hover:text-gray-700"
              }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "browse" && (
        <>
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? "text-white/35" : "text-gray-400"}`} />
              <input className={`${inputClass(isDark)} pl-10`} placeholder="Search jobs or companies…"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Tag size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-white/35" : "text-gray-400"}`} />
                <select className={`${inputClass(isDark)} pl-8 pr-3 w-auto`} value={category} onChange={e => setCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="relative">
                <MapPin size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-white/35" : "text-gray-400"}`} />
                <select className={`${inputClass(isDark)} pl-8 pr-3 w-auto`} value={location} onChange={e => setLocation(e.target.value)}>
                  {LOCATIONS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>
          </div>

          <p className={`text-xs ${isDark ? "text-white/35" : "text-gray-400"}`}>
            {filtered.length} job{filtered.length !== 1 ? "s" : ""} found
          </p>

          {filtered.length === 0 ? (
            <div className={`text-center py-14 rounded-2xl border border-dashed
              ${isDark ? "border-white/15 text-white/35" : "border-black/12 text-gray-400"}`}>
              <BookOpen size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">No jobs match your search.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence>
                {filtered.map(job => (
                  <div key={job.id} className="relative">
                    <JobCard job={job} isDark={isDark} onApply={() => !appliedIds.includes(job.id) && setApplyJob(job)} />
                    {appliedIds.includes(job.id) && (
                      <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-black/30 backdrop-blur-sm">
                        <span className="flex items-center gap-2 text-emerald-400 font-semibold text-sm bg-black/50 px-4 py-2 rounded-full">
                          <CheckCircle size={16} /> Applied
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {tab === "applied" && (
        <div>
          {appliedJobs.length === 0 ? (
            <div className={`text-center py-14 rounded-2xl border border-dashed
              ${isDark ? "border-white/15 text-white/35" : "border-black/12 text-gray-400"}`}>
              <CheckCircle size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">No applications yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {appliedJobs.map(job => (
                <div key={job.id} className="relative">
                  <JobCard job={job} isDark={isDark} />
                  <div className="absolute top-3 right-3">
                    <span className="flex items-center gap-1.5 text-emerald-400 text-xs bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium">
                      <CheckCircle size={11} /> Applied
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Application Modal */}
      <AnimatePresence>
        {applyJob && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)" }}>
            <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
              className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl
                ${isDark ? "bg-gray-900 border-white/15" : "bg-white border-black/10"}`}>
              
              {appSuccess ? (
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center py-8">
                  <CheckCircle size={52} className="mx-auto text-emerald-400 mb-4" />
                  <p className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Application Sent!</p>
                  <p className={`text-sm mt-1 ${isDark ? "text-white/50" : "text-gray-500"}`}>Good luck with your application 🎉</p>
                </motion.div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <h3 className={`text-base font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Apply for</h3>
                      <p className="text-sm text-violet-400 font-medium mt-0.5">{applyJob.title}</p>
                    </div>
                    <button onClick={() => setApplyJob(null)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                      <X size={18} className={isDark ? "text-white/60" : "text-gray-500"} />
                    </button>
                  </div>
                  <form onSubmit={handleApply} className="space-y-3.5">
                    <input required className={inputClass(isDark)} placeholder="Full Name *"
                      value={appForm.name} onChange={e => setAppForm(f => ({ ...f, name: e.target.value }))} />
                    <input required type="email" className={inputClass(isDark)} placeholder="Email Address *"
                      value={appForm.email} onChange={e => setAppForm(f => ({ ...f, email: e.target.value }))} />
                    <div>
                      <label className={`block text-xs mb-1.5 ${isDark ? "text-white/50" : "text-gray-500"}`}>
                        Resume (PDF, DOC)
                      </label>
                      <input type="file" accept=".pdf,.doc,.docx"
                        onChange={e => setAppForm(f => ({ ...f, resume: e.target.files[0] }))}
                        className={`w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0
                          file:text-xs file:font-medium file:bg-violet-600 file:text-white
                          ${isDark ? "text-white/50" : "text-gray-500"}`} />
                    </div>
                    <button type="submit" disabled={appLoading}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-purple-600 text-white flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
                      {appLoading ? <><Loader size={15} className="animate-spin" /> Submitting…</> : "Submit Application"}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}