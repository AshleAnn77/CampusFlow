import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, 
  BookOpen, 
  CalendarClock, 
  Megaphone, 
  Sliders,
  User, 
  LogOut, 
  Compass,
  GraduationCap
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import StudyBuddy from './components/StudyBuddy';
import DeadlineManager from './components/DeadlineManager';
import NoticeSummarizer from './components/NoticeSummarizer';
import Integrations from './components/Integrations';

// Load saved backend URL
const getInitialBackendUrl = () => {
  const saved = localStorage.getItem('campusflow_backend_url');
  if (saved) return saved;
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
};

axios.defaults.baseURL = getInitialBackendUrl();

export default function App() {
  const [currentStudent, setCurrentStudent] = useState(null);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [backendUrl, setBackendUrl] = useState(getInitialBackendUrl());
  const [connectionError, setConnectionError] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Dynamic user profile state for the sidebar
  const [userProfile, setUserProfile] = useState({
    name: "Student",
    department: "Not Connected",
    initial: "S"
  });

  // Dynamic sync statuses
  const [syncStatus, setSyncStatus] = useState({
    classroom: false,
    kp: false,
    whatsapp: false
  });

  // Track profile changes from registered/selected student
  useEffect(() => {
    if (currentStudent) {
      setUserProfile({
        name: currentStudent.name || "Student",
        department: currentStudent.branch || "Not Connected",
        initial: currentStudent.name ? currentStudent.name.charAt(0) : "S"
      });
    } else {
      setUserProfile({
        name: "Student",
        department: "Not Connected",
        initial: "S"
      });
    }
  }, [currentStudent]);

  // Handler to update student profile and sync checks
  const handleUpdateUser = (newProfile, type) => {
    setUserProfile(prev => {
      const merged = { ...prev, ...newProfile };
      return {
        ...merged,
        initial: merged.name ? merged.name.charAt(0) : prev.initial
      };
    });
    if (type) {
      setSyncStatus(prev => ({
        ...prev,
        [type]: true
      }));
    }
  };

  // Onboarding Form State
  const [onboardForm, setOnboardForm] = useState({
    name: '',
    branch: 'Computer Science & Engineering',
    year: '3rd Year',
    subjects: '',
    phone: '',
    email: ''
  });
  const [onboardError, setOnboardError] = useState('');

  useEffect(() => {
    fetchStudents();
    const stored = localStorage.getItem('campusflow_student');
    if (stored) {
      try {
        setCurrentStudent(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem('campusflow_student');
      }
    }
    setLoading(false);
  }, []);

  const fetchStudents = async () => {
    try {
      setConnectionError(false);
      const res = await axios.get('/api/students');
      setAvailableStudents(res.data);
    } catch (err) {
      console.error("Failed to load students", err);
      setConnectionError(true);
    }
  };

  const handleSelectStudent = (student) => {
    setCurrentStudent(student);
    localStorage.setItem('campusflow_student', JSON.stringify(student));
  };

  const handleLogout = () => {
    setCurrentStudent(null);
    localStorage.removeItem('campusflow_student');
    setActiveTab('dashboard');
  };

  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    setOnboardError('');

    const { name, branch, year, subjects, phone, email } = onboardForm;
    if (!name || !phone || !email) {
      setOnboardError('Please fill in Name, Phone (WhatsApp), and Email fields.');
      return;
    }

    const subjectsArray = subjects
      ? subjects.split(',').map(s => s.trim()).filter(Boolean)
      : ['DBMS', 'Operating Systems', 'Computer Networks', 'Software Engineering'];

    try {
      const res = await axios.post('/api/auth/register', {
        name,
        branch,
        year,
        subjects: subjectsArray,
        phone,
        email
      });
      handleSelectStudent(res.data.student);
      fetchStudents();
    } catch (err) {
      setOnboardError(err.response?.data?.error || 'Registration failed. Try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-primary-900 font-bold text-xs uppercase tracking-widest">Loading CampusFlow...</p>
        </div>
      </div>
    );
  }

  // --- Onboarding / Auth View (Cream/Blue/Yellow Retro) ---
  if (!currentStudent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
        
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch z-10">
          
          {/* Left panel: Product Branding */}
          <div className="md:col-span-5 flex flex-col justify-between p-8 rounded-2xl border-2 border-primary-900 bg-white shadow-retro text-primary-900">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-accent-yellow border-2 border-primary-900 rounded-xl">
                  <Compass className="w-7 h-7 text-primary-900" />
                </div>
                <span className="text-2xl font-extrabold tracking-wider font-serif">
                  CampusFlow
                </span>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-3xl font-extrabold font-serif leading-tight">
                  The Student Hub for <span className="bg-accent-yellow px-1 rounded border border-primary-900">B.Tech Academics</span>
                </h1>
                <p className="text-slate-650 text-xs font-semibold leading-relaxed">
                  Consolidate classroom notices, plan study roadmaps, generate revision materials, and automate calendar events.
                </p>
              </div>

              <div className="space-y-3 pt-4 text-xs font-bold">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 border-2 border-primary-900 bg-accent-yellowLight rounded flex items-center justify-center text-[10px]">1</span>
                  <span>AI Study Buddy (Notes to Flashcards/Quizzes)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 border-2 border-primary-900 bg-accent-blueLight rounded flex items-center justify-center text-[10px]">2</span>
                  <span>Smart Deadline schedules & visual timelines</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 border-2 border-primary-900 bg-accent-greenLight rounded flex items-center justify-center text-[10px]">3</span>
                  <span>Automated WhatsApp reminders & broadcasts</span>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-primary-900/10 pt-6">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <span className="inline-block w-2.5 h-2.5 bg-emerald-500 border border-primary-900 rounded-full animate-pulse"></span>
                <span>Student Edition — Ready to Sync</span>
              </div>
            </div>
          </div>

          {/* Right panel: Login / Register forms */}
          <div className="md:col-span-7 flex flex-col justify-center p-8 md:p-10 rounded-2xl border-2 border-primary-900 bg-white shadow-retro relative">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold font-serif text-primary-900">
                Get Started
              </h2>
              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className="text-[10px] font-bold text-slate-500 hover:text-primary-900 uppercase tracking-wider underline cursor-pointer"
              >
                {showSettings ? 'Hide Config' : 'Connection Config'}
              </button>
            </div>

            {(showSettings || connectionError) && (
              <div className="mb-6 p-4 bg-accent-yellowLight border-2 border-primary-900 rounded-xl text-xs text-primary-900 space-y-2">
                <p className="font-bold uppercase tracking-wider text-[10px] text-amber-800 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                  🔌 Backend Connection Settings
                </p>
                <p className="font-semibold text-slate-700 leading-normal">
                  Configure the backend API URL. If running locally, keep it as <code className="bg-white/60 px-1 py-0.5 rounded border border-primary-900/10">http://localhost:5000</code>.
                </p>
                <div className="flex gap-2 items-center mt-1">
                  <input
                    type="text"
                    placeholder="Paste Render/ngrok URL (https://...)"
                    value={backendUrl}
                    onChange={e => setBackendUrl(e.target.value)}
                    className="flex-1 bg-white border-2 border-primary-900 focus:outline-none rounded-lg px-2.5 py-1.5 text-[11px] font-sans text-primary-900"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem('campusflow_backend_url', backendUrl);
                      axios.defaults.baseURL = backendUrl;
                      fetchStudents();
                    }}
                    className="px-3 py-1.5 bg-accent-yellow hover:bg-yellow-400 border-2 border-primary-900 text-[10px] font-bold rounded-lg shadow-retro-sm active:translate-y-0.5 active:shadow-none transition-all"
                  >
                    Connect
                  </button>
                </div>
              </div>
            )}

            {/* Quick Demo Login selector */}
            {availableStudents.length > 0 && (
              <div className="mb-6 bg-slate-55/20 border-2 border-primary-900 p-4 rounded-xl">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block mb-3">
                  🚀 Quick Login for Judges / Demo
                </span>
                <div className="flex flex-wrap gap-2">
                  {availableStudents.map(student => (
                    <button
                      key={student.id}
                      onClick={() => handleSelectStudent(student)}
                      className="px-3.5 py-2 bg-white hover:bg-accent-yellow border-2 border-primary-900 rounded-xl text-xs font-bold text-primary-900 transition-all flex items-center gap-2 shadow-retro-sm active:translate-y-0.5 active:shadow-none"
                    >
                      <User className="w-3.5 h-3.5" />
                      {student.name} ({student.year})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Onboarding Form */}
            <form onSubmit={handleOnboardSubmit} className="space-y-4">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
                📝 Register Student Profile
              </span>
              
              {onboardError && (
                <div className="p-3 bg-accent-redLight border-2 border-primary-900 rounded-xl text-xs font-bold text-red-900">
                  {onboardError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rohan Verma"
                    value={onboardForm.name}
                    onChange={e => setOnboardForm({...onboardForm, name: e.target.value})}
                    className="w-full bg-background border-2 border-primary-900 focus:outline-none rounded-xl px-4 py-2.5 text-xs text-primary-900 font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Branch</label>
                  <select
                    value={onboardForm.branch}
                    onChange={e => setOnboardForm({...onboardForm, branch: e.target.value})}
                    className="w-full bg-background border-2 border-primary-900 focus:outline-none rounded-xl px-4 py-2.5 text-xs text-primary-900 font-sans"
                  >
                    <option>Computer Science & Engineering</option>
                    <option>Information Technology</option>
                    <option>Electronics & Communication</option>
                    <option>Electrical Engineering</option>
                    <option>Mechanical Engineering</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Year of Study</label>
                  <select
                    value={onboardForm.year}
                    onChange={e => setOnboardForm({...onboardForm, year: e.target.value})}
                    className="w-full bg-background border-2 border-primary-900 focus:outline-none rounded-xl px-4 py-2.5 text-xs text-primary-900 font-sans"
                  >
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Phone (WhatsApp Reminders)</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +919876543210"
                    value={onboardForm.phone}
                    onChange={e => setOnboardForm({...onboardForm, phone: e.target.value})}
                    className="w-full bg-background border-2 border-primary-900 focus:outline-none rounded-xl px-4 py-2.5 text-xs text-primary-900 font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Gmail Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. name@gmail.com"
                    value={onboardForm.email}
                    onChange={e => setOnboardForm({...onboardForm, email: e.target.value})}
                    className="w-full bg-background border-2 border-primary-900 focus:outline-none rounded-xl px-4 py-2.5 text-xs text-primary-900 font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Active Semester Subjects</label>
                <input
                  type="text"
                  placeholder="DBMS, Operating Systems, Computer Networks, Software Engineering"
                  value={onboardForm.subjects}
                  onChange={e => setOnboardForm({...onboardForm, subjects: e.target.value})}
                  className="w-full bg-background border-2 border-primary-900 focus:outline-none rounded-xl px-4 py-2.5 text-xs text-primary-900 font-sans"
                />
              </div>

              <button
                type="submit"
                className="w-full btn-retro py-3 text-xs"
              >
                <span>Initialize Onboarding & Dashboard</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Application View (Retro-Grid Cream/Blue/Yellow) ---
  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-b-2 md:border-b-0 md:border-r-2 border-primary-900 flex flex-col justify-between shrink-0 p-5 md:h-screen sticky top-0 z-30">
        <div className="space-y-6 animate-slide-up">
          
          {/* Logo */}
          <div className="flex items-center gap-3 border-b-2 border-primary-900/10 pb-4">
            <div className="p-2 bg-accent-yellow border-2 border-primary-900 rounded-lg">
              <Compass className="w-6 h-6 text-primary-900" />
            </div>
            <span className="text-xl font-extrabold font-serif text-primary-900">
              CampusFlow
            </span>
          </div>

          {/* Student Profile Card */}
          <div className="p-3 bg-slate-50 border-2 border-primary-900 rounded-xl flex items-center gap-3">
            <div className="w-9 h-9 bg-accent-blueLight border-2 border-primary-900 rounded-lg flex items-center justify-center font-bold text-primary-900 text-sm">
              {userProfile.initial}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-primary-900 truncate leading-snug">{userProfile.name}</h4>
              <p className="text-[10px] text-slate-500 truncate font-semibold">{userProfile.department}</p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border-2 ${
                activeTab === 'dashboard'
                  ? 'bg-accent-yellow border-primary-900 shadow-retro-sm text-primary-900'
                  : 'bg-white border-transparent text-slate-500 hover:text-primary-900 hover:border-primary-900/25'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('study-buddy')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border-2 ${
                activeTab === 'study-buddy'
                  ? 'bg-accent-yellow border-primary-900 shadow-retro-sm text-primary-900'
                  : 'bg-white border-transparent text-slate-500 hover:text-primary-900 hover:border-primary-900/25'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>AI Study Buddy</span>
            </button>

            <button
              onClick={() => setActiveTab('deadline-manager')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border-2 ${
                activeTab === 'deadline-manager'
                  ? 'bg-accent-yellow border-primary-900 shadow-retro-sm text-primary-900'
                  : 'bg-white border-transparent text-slate-500 hover:text-primary-900 hover:border-primary-900/25'
              }`}
            >
              <CalendarClock className="w-4 h-4" />
              <span>Deadline Planner</span>
            </button>

            <button
              onClick={() => setActiveTab('notice-summarizer')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border-2 ${
                activeTab === 'notice-summarizer'
                  ? 'bg-accent-yellow border-primary-900 shadow-retro-sm text-primary-900'
                  : 'bg-white border-transparent text-slate-500 hover:text-primary-900 hover:border-primary-900/25'
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>Notice Summarizer</span>
            </button>

            <button
              onClick={() => setActiveTab('integrations')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border-2 ${
                activeTab === 'integrations'
                  ? 'bg-accent-yellow border-primary-900 shadow-retro-sm text-primary-900'
                  : 'bg-white border-transparent text-slate-500 hover:text-primary-900 hover:border-primary-900/25'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Integrations Center</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="mt-8 pt-5 border-t-2 border-primary-900/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between text-[10px] font-bold text-slate-400 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-all border border-transparent hover:border-red-700/10"
          >
            <div className="flex items-center gap-2">
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out profile</span>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen overflow-y-auto px-4 md:px-8 py-6 md:py-8 space-y-6">
        
        {activeTab === 'dashboard' && (
          <Dashboard user={userProfile} student={currentStudent} onNavigate={setActiveTab} onUpdateUser={handleUpdateUser} />
        )}
        
        {activeTab === 'study-buddy' && (
          <StudyBuddy student={currentStudent} />
        )}

        {activeTab === 'deadline-manager' && (
          <DeadlineManager student={currentStudent} />
        )}

        {activeTab === 'notice-summarizer' && (
          <NoticeSummarizer student={currentStudent} />
        )}

        {activeTab === 'integrations' && (
          <Integrations syncStatus={syncStatus} onUpdateUser={handleUpdateUser} />
        )}

      </main>

    </div>
  );
}
