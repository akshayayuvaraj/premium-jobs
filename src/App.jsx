import { useState, useEffect, Suspense, lazy } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { Sun, Moon, LogOut, Briefcase, ChevronDown, Loader2 } from "lucide-react";
import emailjs from '@emailjs/browser';

const sendNotification = (userEmail, jobTitle, companyName) => {
  // 1. Prepare the parameters to match your EmailJS Template tags {{ }}
  const templateParams = {
    user_email: userEmail,    // matches {{user_email}} in dashboard
    job_title: jobTitle,      // matches {{job_title}} in dashboard
    company_name: companyName // matches {{company_name}} in dashboard
  };

  // 2. Send the email using the VITE_ variable names
  emailjs.send(
  import.meta.env.VITE_EMAILJS_SERVICE_ID,   // This points to your service ID
  import.meta.env.VITE_EMAILJS_TEMPLATE_ID,  // This points to your template ID
  templateParams,
  import.meta.env.VITE_EMAILJS_PUBLIC_KEY    // This points to your public key
)
.then((response) => {
  console.log('Email sent successfully!', response.status, response.text);
})
.catch((err) => {
  console.error('Email failed to send:', err);
});}

const HeroCanvas = lazy(() => import("./components/HeroCanvas"));
const EmployerDashboard = lazy(() => import("./components/EmployerDashboard"));
const CandidateDashboard = lazy(() => import("./components/CandidateDashboard"));

// ── tiny helpers ────────────────────────────────────────────────────────────
const inputCls = (dark) =>
  `w-full px-4 py-3 rounded-xl text-sm outline-none transition-all border
   ${dark
     ? "bg-white/6 border-white/12 text-white placeholder-white/30 focus:border-violet-500/70 focus:bg-white/10"
     : "bg-black/4 border-black/10 text-gray-900 placeholder-gray-400 focus:border-violet-500/60 focus:bg-white"
   }`;

const glass = (dark) =>
  `backdrop-blur-xl border ${dark ? "bg-white/8 border-white/12" : "bg-white/70 border-black/8"}`;

// ── Auth Modal ───────────────────────────────────────────────────────────────
function AuthModal({ isDark, onClose }) {
  const [mode, setMode] = useState("login"); // login | signup
  const [role, setRole] = useState("candidate");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", cred.user.uid), { name, email, role, createdAt: new Date() });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (e) {
      setErr(e.message.replace("Firebase: ", "").replace(/\(auth\/.*\)/, "").trim());
    }
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(12px)" }}
      onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 24 }}
        onClick={e => e.stopPropagation()}
        className={`w-full max-w-sm rounded-2xl border p-7 shadow-2xl
          ${isDark ? "bg-gray-950 border-white/15" : "bg-white border-black/10"}`}>

        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
            <Briefcase size={16} className="text-white" />
          </div>
          <span className={`font-bold text-base ${isDark ? "text-white" : "text-gray-900"}`}>NexaJobs</span>
        </div>

        <h2 className={`text-xl font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
          {mode === "login" ? "Welcome back" : "Create account"}
        </h2>
        <p className={`text-sm mb-5 ${isDark ? "text-white/45" : "text-gray-500"}`}>
          {mode === "login" ? "Sign in to your account" : "Join thousands of professionals"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "signup" && (
            <input className={inputCls(isDark)} placeholder="Full Name" value={name}
              onChange={e => setName(e.target.value)} required />
          )}
          <input type="email" className={inputCls(isDark)} placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)} required />
          <input type="password" className={inputCls(isDark)} placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)} required minLength={6} />

          {mode === "signup" && (
            <div className={`flex rounded-xl overflow-hidden border ${isDark ? "border-white/12" : "border-black/10"}`}>
              {["candidate", "employer"].map(r => (
                <button key={r} type="button" onClick={() => setRole(r)}
                  className={`flex-1 py-2.5 text-sm font-medium capitalize transition-all
                    ${role === r
                      ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white"
                      : isDark ? "bg-white/5 text-white/55 hover:bg-white/10" : "bg-black/3 text-gray-500 hover:bg-black/6"
                    }`}>
                  {r === "employer" ? "👔 Employer" : "👤 Candidate"}
                </button>
              ))}
            </div>
          )}

          {err && <p className="text-red-400 text-xs px-1">{err}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 disabled:opacity-60 mt-1">
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className={`text-center text-sm mt-4 ${isDark ? "text-white/45" : "text-gray-500"}`}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setErr(""); }}
            className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </motion.div>
    </motion.div>
  );
}

// ── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ user, userRole, isDark, toggleTheme, onAuth, onLogout }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300
        ${scrolled ? `${glass(isDark)} shadow-lg shadow-black/10` : "bg-transparent"}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-md">
            <Briefcase size={15} className="text-white" />
          </div>
          <span className={`font-bold text-base tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>NexaJobs</span>
        </div>

        <div className="flex items-center gap-2.5">
          <button onClick={toggleTheme}
            className={`p-2 rounded-lg transition-all ${isDark ? "hover:bg-white/10 text-white/70" : "hover:bg-black/6 text-gray-600"}`}>
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs
                ${isDark ? "bg-white/6 text-white/70" : "bg-black/5 text-gray-600"}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                {userRole === "employer" ? "Employer" : "Candidate"}
              </div>
              <button onClick={onLogout}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all
                  ${isDark ? "hover:bg-white/10 text-white/60" : "hover:bg-black/6 text-gray-500"}`}>
                <LogOut size={14} /> Logout
              </button>
            </div>
          ) : (
            <button onClick={onAuth}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all">
              Get Started
            </button>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ isDark, onGetStarted }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none">
        {isDark ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-900/25 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-900/20 rounded-full blur-[100px]" />
            <div className="absolute top-1/2 right-1/3 w-60 h-60 bg-blue-900/15 rounded-full blur-[80px]" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-violet-50/30 to-blue-50/20" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-200/40 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-200/30 rounded-full blur-[100px]" />
          </>
        )}
      </div>

      {/* 3D Canvas */}
      <Suspense fallback={null}>
        <HeroCanvas />
      </Suspense>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}>
          <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6 border
            ${isDark ? "bg-violet-500/10 border-violet-500/25 text-violet-300" : "bg-violet-100 border-violet-200 text-violet-700"}`}>
            ✦ Next-generation job platform
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className={`text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.06] tracking-tight mb-5
            ${isDark ? "text-white" : "text-gray-900"}`}>
          Find Your{" "}
          <span className="relative">
            <span className="bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Dream Job
            </span>
          </span>
          <br />in Seconds
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className={`text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed
            ${isDark ? "text-white/55" : "text-gray-500"}`}>
          Explore premium opportunities with a next-gen job platform
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.65 }}
          className="flex flex-col sm:flex-row gap-3.5 justify-center items-center">
          <button onClick={onGetStarted}
            className="px-8 py-3.5 rounded-xl font-bold text-base bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-0.5 transition-all duration-200">
            Get Started →
          </button>
          <button onClick={() => document.getElementById("jobs-section")?.scrollIntoView({ behavior: "smooth" })}
            className={`px-8 py-3.5 rounded-xl font-semibold text-base border transition-all hover:-translate-y-0.5 duration-200
              ${isDark
                ? "bg-white/8 border-white/15 text-white hover:bg-white/14"
                : "bg-black/4 border-black/12 text-gray-800 hover:bg-black/8"
              }`}>
            Explore Jobs
          </button>
        </motion.div>

        {/* Scroll hint */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          className="mt-16 flex flex-col items-center gap-2">
          <span className={`text-xs ${isDark ? "text-white/30" : "text-gray-400"}`}>Scroll to explore</span>
          <ChevronDown size={18} className={`animate-bounce ${isDark ? "text-white/30" : "text-gray-400"}`} />
        </motion.div>
      </div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.9 }}
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:flex items-center gap-0 rounded-2xl border overflow-hidden
          ${isDark ? "bg-white/6 border-white/10" : "bg-white/70 border-black/8"} backdrop-blur-xl`}>
        {[
          { label: "Jobs Posted", value: "12,400+" },
          { label: "Companies", value: "3,200+" },
          { label: "Hired", value: "89,000+" },
        ].map((s, i) => (
          <div key={s.label} className={`px-6 py-3 text-center ${i < 2 ? (isDark ? "border-r border-white/10" : "border-r border-black/8") : ""}`}>
            <div className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{s.value}</div>
            <div className={`text-xs ${isDark ? "text-white/40" : "text-gray-500"}`}>{s.label}</div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const snap = await getDoc(doc(db, "users", u.uid));
        setUserRole(snap.exists() ? snap.data().role : "candidate");
      } else {
        setUserRole(null);
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setUserRole(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
            <Briefcase size={18} className="text-white" />
          </div>
          <Loader2 size={20} className="text-violet-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${isDark ? "bg-gray-950 text-white" : "bg-slate-50 text-gray-900"}`}
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      <Navbar
        user={user} userRole={userRole} isDark={isDark}
        toggleTheme={() => setIsDark(d => !d)}
        onAuth={() => setShowAuth(true)}
        onLogout={handleLogout}
      />

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuth && <AuthModal isDark={isDark} onClose={() => setShowAuth(false)} />}
      </AnimatePresence>

      {/* Hero */}
      <Hero isDark={isDark} onGetStarted={() => {
        if (user) document.getElementById("jobs-section")?.scrollIntoView({ behavior: "smooth" });
        else setShowAuth(true);
      }} />

      {/* Dashboard Section */}
      <section id="jobs-section" className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        {user ? (
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="mb-8">
              <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                {userRole === "employer" ? "Employer Dashboard" : "Browse Jobs"}
              </h2>
              <p className={`text-sm mt-1 ${isDark ? "text-white/45" : "text-gray-500"}`}>
                {userRole === "employer"
                  ? "Manage your job postings and track applications"
                  : "Discover your next opportunity"}
              </p>
            </div>
            <Suspense fallback={
              <div className="flex justify-center py-20">
                <Loader2 size={28} className="text-violet-400 animate-spin" />
              </div>
            }>
              {userRole === "employer"
                ? <EmployerDashboard isDark={isDark} />
                : <CandidateDashboard isDark={isDark} />
              }
            </Suspense>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className={`text-center py-20 rounded-3xl border border-dashed
              ${isDark ? "border-white/12 text-white/40" : "border-black/10 text-gray-400"}`}>
            <Briefcase size={44} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">Sign in to explore jobs</p>
            <p className="text-sm mb-6">Create an account or sign in to browse and apply for jobs</p>
            <button onClick={() => setShowAuth(true)}
              className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/20">
              Get Started
            </button>
          </motion.div>
        )}
      </section>

      {/* Footer */}
      <footer className={`border-t py-8 ${isDark ? "border-white/8 text-white/30" : "border-black/6 text-gray-400"}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
              <Briefcase size={12} className="text-white" />
            </div>
            <span className="text-sm font-semibold">NexaJobs</span>
          </div>
          <p className="text-xs">© 2025 NexaJobs. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}