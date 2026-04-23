import React, { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Briefcase, Sun, Moon, Lock, Mail, ArrowLeft, 
  Globe, LogOut, Loader2, Sparkles, Upload, Send, CheckCircle2, X 
} from 'lucide-react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Float, Stars, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import React, { useState } from 'react';
import emailjs from '@emailjs/browser'; // <--- PUT IT HERE
// Add this at the very top of App.jsx
import React from 'react';
import JobCard from './components/JobCard'; // <--- Check this path
import EmployerDashboard from './components/EmployerDashboard';;
// ... your other imports like firebase

// Firebase Imports
import { auth, db } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from "firebase/auth";
import { collection, onSnapshot, query } from "firebase/firestore";

// --- 1. EXPANDED JOB LIST (18 TOTAL) ---
const BACKUP_JOBS = [
  { id: 'm1', title: "Lead VFX Artist", company: "Industrial Light & Magic", location: "San Francisco, CA", salary: "$210k - $280k", cat: "Design" },
  { id: 'm2', title: "Senior Frontend Architect", company: "Vercel", location: "Remote", salary: "$190k - $240k", cat: "Engineering" },
  { id: 'm3', title: "Product Strategy Lead", company: "Stripe", location: "New York, NY", salary: "$185k - $220k", cat: "Management" },
  { id: 'm4', title: "Motion Designer", company: "Buck Design", location: "Los Angeles, CA", salary: "$140k - $175k", cat: "Design" },
  { id: 'm5', title: "Backend Engineer (Go)", company: "Cloudflare", location: "Austin, TX", salary: "$170k - $210k", cat: "Engineering" },
  { id: 'm6', title: "Creative Director", company: "Apple", location: "Cupertino, CA", salary: "$250k - $310k", cat: "Design" },
  { id: 'm7', title: "AI Research Engineer", company: "OpenAI", location: "San Francisco, CA", salary: "$300k - $450k", cat: "Engineering" },
  { id: 'm8', title: "UX Writer", company: "Airbnb", location: "Remote", salary: "$130k - $160k", cat: "Design" },
  { id: 'm9', title: "Technical Program Manager", company: "Google", location: "London, UK", salary: "£140k - £180k", cat: "Management" },
  // 9 NEW JOBS
  { id: 'm10', title: "Starship Propulsion Engineer", company: "SpaceX", location: "Boca Chica, TX", salary: "$180k - $250k", cat: "Engineering" },
  { id: 'm11', title: "Neural Interface Designer", company: "Neuralink", location: "Fremont, CA", salary: "$220k - $300k", cat: "Design" },
  { id: 'm12', title: "Global Security Lead", company: "Palantir", location: "Denver, CO", salary: "$195k - $260k", cat: "Management" },
  { id: 'm13', title: "Full Stack Developer", company: "Supabase", location: "Remote", salary: "$150k - $190k", cat: "Engineering" },
  { id: 'm14', title: "Brand Identity Director", company: "Nike", location: "Beaverton, OR", salary: "$200k - $275k", cat: "Design" },
  { id: 'm15', title: "Quantitative Researcher", company: "Citadel", location: "Miami, FL", salary: "$400k - $600k", cat: "Management" },
  { id: 'm16', title: "Blockchain Architect", company: "Ethereum Foundation", location: "Remote", salary: "$180k - $240k", cat: "Engineering" },
  { id: 'm17', title: "Humanoid Robotics Expert", company: "Tesla", location: "Austin, TX", salary: "$210k - $290k", cat: "Engineering" },
  { id: 'm18', title: "Head of Growth", company: "Discord", location: "San Francisco, CA", salary: "$190k - $230k", cat: "Management" }
];

// --- 2. ENHANCED 3D BACKGROUND ---
const InteractiveParticles = ({ isDark }) => {
  const points = useRef();
  const [coords] = useState(() => {
    const arr = [];
    for (let i = 0; i < 2000; i++) {
      arr.push((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
    }
    return new Float32Array(arr);
  });

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    points.current.rotation.y = time * 0.05;
    points.current.rotation.x = Math.sin(time * 0.1) * 0.2;
    // Mouse interaction
    points.current.position.x = THREE.MathUtils.lerp(points.current.position.x, state.mouse.x * 0.5, 0.1);
  });

  return (
    <Points ref={points} positions={coords} stride={3}>
      <PointMaterial
        transparent
        color={isDark ? "#3b82f6" : "#60a5fa"}
        size={0.015}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

const BackgroundScene = ({ isDark }) => {
  const mesh = useRef();
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.distort = 0.4 + Math.sin(state.clock.getElapsedTime() / 2) * 0.1;
      mesh.current.rotation.z += 0.001;
    }
  });

  return (
    <>
      <InteractiveParticles isDark={isDark} />
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Sphere ref={mesh} args={[1, 128, 256]} scale={2.4}>
          <MeshDistortMaterial 
            color={isDark ? "#1d4ed8" : "#93c5fd"} 
            distort={0.5} 
            speed={3} 
            metalness={isDark ? 0.9 : 0.1} 
            roughness={0.2} 
          />
        </Sphere>
      </Float>
    </>
  );
};

// --- 3. MAIN APPLICATION ---
export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [firebaseJobs, setFirebaseJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "jobs"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobsArr = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFirebaseJobs(jobsArr);
    }, () => console.warn("Using backup job list."));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    isDark ? root.classList.add('dark') : root.classList.remove('dark');
  }, [isDark]);

  const displayJobs = useMemo(() => firebaseJobs.length > 0 ? firebaseJobs : BACKUP_JOBS, [firebaseJobs]);
  const filteredJobs = useMemo(() => displayJobs.filter(job => 
    job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company?.toLowerCase().includes(searchQuery.toLowerCase())
  ), [searchQuery, displayJobs]);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#020617]">
      <Loader2 className="text-blue-500 animate-spin" size={48} />
    </div>
  );

  return (
    <div className="relative min-h-screen transition-colors duration-700 overflow-x-hidden bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white">
      
      {/* 3D Visuals */}
      <div className="fixed inset-0 z-0 h-screen w-full pointer-events-none transition-opacity duration-1000">
        <Suspense fallback={null}>
          <Canvas camera={{ position: [0, 0, 5] }}>
            <ambientLight intensity={isDark ? 0.3 : 1} />
            <pointLight position={[10, 10, 10]} />
            <BackgroundScene isDark={isDark} />
          </Canvas>
        </Suspense>
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="flex justify-between items-center px-10 py-8 max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl rotate-12 flex items-center justify-center font-black text-white text-2xl shadow-lg">O</div>
            <span className="text-3xl font-black italic bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Opus</span>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="hidden md:block text-sm font-bold opacity-60">{user.email}</span>
                <button onClick={() => signOut(auth)} className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-500 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all">
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            ) : (
              <button onClick={() => setShowLogin(true)} className="px-10 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold shadow-xl transition-all active:scale-95">
                Sign In
              </button>
            )}
          </div>
        </nav>

        <AnimatePresence mode="wait">
          {showLogin && !user ? (
            <AuthPage key="auth" onBack={() => setShowLogin(false)} isDark={isDark} />
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-6">
              <header className="pt-20 pb-20 text-center">
                <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-600 text-[11px] font-black uppercase tracking-widest mb-10">
                  <Sparkles size={14} fill="currentColor" /> Premium Career Hub
                </span>
                <h1 className="text-7xl md:text-[110px] font-bold tracking-tighter leading-none mb-12">
                  Find Your <br /> 
                  <span className="text-blue-600 transition-colors duration-700">Universe.</span>
                </h1>

                <div className="flex flex-col md:flex-row gap-4 items-center justify-center backdrop-blur-3xl bg-white/70 dark:bg-white/5 p-3 rounded-[3rem] border border-black/10 dark:border-white/10 w-full max-w-3xl mx-auto shadow-2xl transition-colors duration-700">
                  <Search className="ml-6 text-slate-400" size={24} />
                  <input 
                    type="text" 
                    placeholder="Search premium roles..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none py-6 px-4 w-full text-lg font-medium placeholder-slate-400"
                  />
                  <button className="w-full md:w-auto px-14 py-6 bg-blue-600 text-white rounded-[2.5rem] font-black uppercase tracking-widest shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all">
                    Explore
                  </button>
                </div>
              </header>

              {/* Job Grid */}
              <section className="max-w-[1400px] mx-auto pb-40">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredJobs.map((job) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={job.id} 
                      className="group p-10 rounded-[40px] bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/5 backdrop-blur-xl shadow-xl hover:-translate-y-2 transition-all duration-500"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 bg-blue-600/10 text-blue-600 rounded-xl flex items-center justify-center">
                          <Briefcase size={24} />
                        </div>
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black uppercase tracking-widest">{job.cat}</span>
                      </div>
                      <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                      <p className="text-slate-500 font-medium mb-8">{job.company}</p>
                      
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center pt-6 border-t border-black/5 dark:border-white/5 font-bold text-sm uppercase tracking-widest">
                          <span className="flex items-center gap-2 text-slate-400"><Globe size={16} /> {job.location}</span>
                          <span className="text-blue-500">{job.salary}</span>
                        </div>
                        <button 
                          onClick={() => setSelectedJob(job)}
                          className="w-full py-4 mt-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase text-xs tracking-tighter hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all"
                        >
                          Apply Now
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Application Modal */}
        <AnimatePresence>
          {selectedJob && (
            <ApplicationForm job={selectedJob} onClose={() => setSelectedJob(null)} />
          )}
        </AnimatePresence>
      </div>

      <button 
        onClick={() => setIsDark(!isDark)} 
        className="fixed bottom-8 right-8 z-[100] w-16 h-16 rounded-full bg-white dark:bg-slate-800 shadow-2xl flex items-center justify-center border border-black/10 dark:border-white/10 transition-all hover:scale-110 active:scale-90"
      >
        {isDark ? <Sun className="text-yellow-400" size={28} /> : <Moon className="text-indigo-600" size={28} />}
      </button>
    </div>
  );
}

// --- 4. APPLICATION FORM COMPONENT ---
const ApplicationForm = ({ job, onClose }) => {
  const [step, setStep] = useState(1); // 1: Form, 2: Success
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(2);
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[50px] p-10 shadow-2xl relative overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-8 right-8 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <X size={24} />
        </button>

        {step === 1 ? (
          <>
            <h2 className="text-4xl font-bold mb-2">Apply for <span className="text-blue-600">{job.title}</span></h2>
            <p className="text-slate-500 mb-8 font-medium">at {job.company} • {job.location}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input required type="text" placeholder="Full Name" className="w-full py-5 px-8 bg-black/5 dark:bg-white/5 rounded-2xl outline-none focus:ring-2 ring-blue-500/50" />
                <input required type="email" placeholder="Email Address" className="w-full py-5 px-8 bg-black/5 dark:bg-white/5 rounded-2xl outline-none focus:ring-2 ring-blue-500/50" />
              </div>
              <input type="url" placeholder="Portfolio / LinkedIn URL" className="w-full py-5 px-8 bg-black/5 dark:bg-white/5 rounded-2xl outline-none focus:ring-2 ring-blue-500/50" />
              
              <div className="border-2 border-dashed border-black/10 dark:border-white/10 rounded-3xl p-8 text-center hover:border-blue-500/50 transition-colors group cursor-pointer">
                <div className="w-12 h-12 bg-blue-600/10 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Upload size={20} />
                </div>
                <p className="text-sm font-bold uppercase tracking-widest opacity-60">Upload CV / Resume</p>
                <p className="text-xs opacity-40 mt-1">PDF, DOCX up to 10MB</p>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Submit Application</>}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-10">
            <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-4xl font-bold mb-4">Application Sent!</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium">
              We've received your application for {job.title}. The team at {job.company} will review it shortly.
            </p>
            <button 
              onClick={onClose}
              className="px-12 py-5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase tracking-widest"
            >
              Back to Jobs
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// --- AUTH COMPONENT ---
const AuthPage = ({ onBack, isDark }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onBack();
    } catch (err) {
      setError(err.message.replace("Firebase:", ""));
    }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-xl p-12 rounded-[50px] bg-white dark:bg-slate-900 shadow-2xl border border-black/5 dark:border-white/10 transition-colors duration-700">
        <button onClick={onBack} className="flex items-center gap-2 text-blue-600 font-bold mb-10"><ArrowLeft size={18} /> Back</button>
        <h2 className="text-5xl font-bold tracking-tighter mb-2 text-slate-900 dark:text-white">{isRegister ? "Join Opus." : "Welcome Back."}</h2>
        <p className="text-slate-500 mb-10 font-medium">{isRegister ? "Create your career profile." : "Enter the vault."}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input required type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full py-5 pl-14 pr-6 bg-black/5 dark:bg-white/5 rounded-2xl outline-none focus:ring-2 ring-blue-500/50 text-slate-900 dark:text-white" />
          </div>
          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input required type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full py-5 pl-14 pr-6 bg-black/5 dark:bg-white/5 rounded-2xl outline-none focus:ring-2 ring-blue-500/50 text-slate-900 dark:text-white" />
          </div>
          {error && <p className="text-red-500 text-xs font-bold px-2">{error}</p>}
          <button className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-600/30 hover:bg-blue-700">
            {isRegister ? "Create Account" : "Sign In"}
          </button>
        </form>
        <p className="text-center mt-8 text-sm font-bold text-slate-500">
          {isRegister ? "Already a member?" : "New to the platform?"}{" "}
          <span onClick={() => setIsRegister(!isRegister)} className="text-blue-600 cursor-pointer hover:underline">
            {isRegister ? "Sign In" : "Register Now"}
          </span>
        </p>
      </div>
    </motion.div>
  );
};
const handleApply = async (job) => {
  try {
    // 1. First, save the application to your database (Firebase)
    // This ensures you have a record even if the email fails
    await addDoc(collection(db, "applications"), {
      jobId: job.id,
      email: auth.currentUser.email,
      status: "Applied",
      appliedAt: new Date()
    });

    // 2. NOW PLACE YOUR PARAMS HERE
    const templateParams = {
      email: auth.currentUser.email, // Matches {{email}} in Capture_14.PNG
      user_name: auth.currentUser.displayName || "Applicant",
      job_title: job.title 
    };

    // 3. Send the email using the params you just defined
    await emailjs.send(
      'service_nnhsy0x', 
      'template_h7e3u3b', 
      templateParams,    // This passes your object to EmailJS
      'UppEL37Gjo-2ICVRN'
    );

    alert("Success! Your application was sent and confirmed via email.");

  } catch (error) {
    console.error("Submission failed:", error);
    alert("Could not complete application. Check the console for errors.");
  }
};
