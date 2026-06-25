import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Sparkles, 
  Phone, 
  Calendar, 
  GraduationCap, 
  Save, 
  Send, 
  CheckCircle2, 
  XCircle,
  HelpCircle,
  RefreshCw
} from 'lucide-react';

export default function Integrations({ syncStatus, onUpdateUser }) {
  const [form, setForm] = useState({
    geminiApiKey: '',
    recipientPhone: '',
    deadlineAlerts: true,
    noticeAlerts: true,
    classroomClient: '',
    kpRollNumber: '',
    kpPassword: ''
  });

  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Test Actions State
  const [testingWhatsApp, setTestingWhatsApp] = useState(false);
  const [syncingClassroom, setSyncingClassroom] = useState(false);
  const [syncingKP, setSyncingKP] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/settings');
      setForm(prev => ({ ...prev, ...res.data }));
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to load settings.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await axios.post('/api/settings', form);
      setMessage({ text: 'All credentials saved successfully!', type: 'success' });
      setForm(res.data.settings);
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to save credentials.', type: 'error' });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleTestWhatsApp = async () => {
    setTestingWhatsApp(true);
    setMessage({ text: '', type: '' });
    try {
      const res = await axios.post('/api/integrations/whatsapp/test');
      setMessage({ text: res.data.message, type: 'success' });
      if (onUpdateUser) {
        onUpdateUser({}, "whatsapp");
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: err.response?.data?.error || 'WhatsApp test connection failed.', type: 'error' });
    } finally {
      setTestingWhatsApp(false);
    }
  };

  const handleSyncClassroom = async () => {
    setSyncingClassroom(true);
    setMessage({ text: '', type: '' });
    try {
      const res = await axios.post('/api/integrations/google-classroom/sync');
      setMessage({ text: res.data.message, type: 'success' });
      if (onUpdateUser) {
        onUpdateUser({ name: "Ann", department: "Computer Science & Engineering" }, "classroom");
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Google Classroom synchronization failed.', type: 'error' });
    } finally {
      setSyncingClassroom(false);
    }
  };

  const handleSyncKP = async () => {
    setSyncingKP(true);
    setMessage({ text: '', type: '' });
    try {
      const res = await axios.post('/api/integrations/knowledge-pro/sync');
      setMessage({ text: res.data.message, type: 'success' });
      if (onUpdateUser) {
        onUpdateUser({ name: "Ann", department: "BTech CSE Semester 5" }, "kp");
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Christ Portal connection failed.', type: 'error' });
    } finally {
      setSyncingKP(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-2 text-primary-900 animate-pulse">
        <div className="w-8 h-8 border-4 border-primary-900 border-t-transparent rounded-full animate-spin"></div>
        <span className="font-bold text-xs uppercase tracking-widest font-sans">Reading credentials...</span>
      </div>
    );
  }

  // Connection Checks
  const hasGemini = !!form.geminiApiKey;
  const hasTwilio = !!form.recipientPhone || syncStatus?.whatsapp;
  const hasClassroom = !!form.classroomClient || syncStatus?.classroom;
  const hasKP = (!!form.kpRollNumber && !!form.kpPassword) || syncStatus?.kp;

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-primary-900 uppercase tracking-widest">
            Configuration Dashboard
          </span>
          <h1 className="text-3xl font-extrabold font-serif text-primary-900 leading-tight">
            Integrations Settings
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Connect CampusFlow to your actual accounts. If keys are missing, the server runs in simulated demo mode.
          </p>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 border-2 border-primary-900 rounded-xl font-sans text-xs font-semibold flex items-center gap-3 ${
          message.type === 'success' ? 'bg-accent-greenLight' : 'bg-accent-redLight'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Forms */}
        <form onSubmit={handleSave} className="lg:col-span-8 space-y-6">
          
          {/* AI Integration Section */}
          <div className="retro-card p-6 space-y-4">
            <h3 className="text-sm font-bold font-serif text-primary-900 flex items-center gap-2 pb-2 border-b border-primary-900/10">
              <Sparkles className="w-4.5 h-4.5 text-accent-yellow" />
              <span>1. Google Gemini AI Engine</span>
            </h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Gemini API Key
              </label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={form.geminiApiKey}
                onChange={e => setForm({ ...form, geminiApiKey: e.target.value })}
                className="w-full bg-background border-2 border-primary-900 focus:outline-none rounded-xl px-4 py-2.5 text-xs text-primary-900"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Pasting your key triggers actual AI models. If empty, CampusFlow uses local smart pattern-matched generators.
              </p>
            </div>
          </div>

          {/* WhatsApp Notification Settings */}
          <div className="retro-card p-6 space-y-4">
            <h3 className="text-sm font-bold font-serif text-primary-900 flex items-center gap-2 pb-2 border-b border-primary-900/10">
              <Phone className="w-4.5 h-4.5 text-primary-900" />
              <span>2. WhatsApp Notification Settings</span>
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  WhatsApp Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. +919876543210"
                  value={form.recipientPhone}
                  onChange={e => setForm({ ...form, recipientPhone: e.target.value })}
                  className="w-full bg-background border-2 border-primary-900 focus:outline-none rounded-xl px-4 py-2.5 text-xs text-primary-900 font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-center justify-between p-3 bg-slate-50 border-2 border-primary-900 rounded-xl">
                <span className="text-xs font-bold text-slate-700">Enable Deadline Alerts</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={form.deadlineAlerts}
                    onChange={e => setForm({ ...form, deadlineAlerts: e.target.checked })}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none border-2 border-primary-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-primary-900 after:border-primary-900 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent-yellow"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 border-2 border-primary-900 rounded-xl">
                <span className="text-xs font-bold text-slate-700">Enable Notice Alerts</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={form.noticeAlerts}
                    onChange={e => setForm({ ...form, noticeAlerts: e.target.checked })}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none border-2 border-primary-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-primary-900 after:border-primary-900 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent-yellow"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Google Classroom & Student Portal Section */}
          <div className="retro-card p-6 space-y-4">
            <h3 className="text-sm font-bold font-serif text-primary-900 flex items-center gap-2 pb-2 border-b border-primary-900/10">
              <GraduationCap className="w-4.5 h-4.5 text-primary-900" />
              <span>3. Classroom & Student Portal Integrations</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Classroom User Client
                </label>
                <input
                  type="text"
                  placeholder="e.g. classroom@school.edu"
                  value={form.classroomClient}
                  onChange={e => setForm({ ...form, classroomClient: e.target.value })}
                  className="w-full bg-background border-2 border-primary-900 focus:outline-none rounded-xl px-4 py-2.5 text-xs text-primary-900"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Student Portal Roll No.
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2460301"
                  value={form.kpRollNumber}
                  onChange={e => setForm({ ...form, kpRollNumber: e.target.value })}
                  className="w-full bg-background border-2 border-primary-900 focus:outline-none rounded-xl px-4 py-2.5 text-xs text-primary-900"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Student Portal Password
                </label>
                <input
                  type="password"
                  placeholder="Portal password"
                  value={form.kpPassword}
                  onChange={e => setForm({ ...form, kpPassword: e.target.value })}
                  className="w-full bg-background border-2 border-primary-900 focus:outline-none rounded-xl px-4 py-2.5 text-xs text-primary-900"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <button
            type="submit"
            disabled={saveLoading}
            className="w-full btn-retro py-3 text-xs"
          >
            {saveLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-900 border-t-transparent rounded-full animate-spin"></div>
                <span>Saving Credentials...</span>
              </>
            ) : (
              <>
                <Save className="w-4.5 h-4.5" />
                <span>Save Integrations Configuration</span>
              </>
            )}
          </button>
        </form>

        {/* Right Side: Active Checks & Direct Test Actions */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Connection Status Checklist */}
          <div className="retro-card p-5 space-y-4">
            <h2 className="text-sm font-bold font-serif text-primary-900 border-b border-primary-900/10 pb-2">
              Sync Channels Checklist
            </h2>
            
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Gemini AI Engine:</span>
                <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase border ${
                  hasGemini 
                    ? 'bg-accent-greenLight text-green-800 border-green-300' 
                    : 'bg-accent-yellowLight text-yellow-800 border-yellow-300'
                }`}>
                  {hasGemini ? 'Connected' : 'Simulation'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Twilio WhatsApp:</span>
                <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase border ${
                  hasTwilio 
                    ? 'bg-accent-greenLight text-green-800 border-green-300' 
                    : 'bg-accent-yellowLight text-yellow-800 border-yellow-300'
                }`}>
                  {hasTwilio ? 'Active' : 'Simulation'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Google Classroom:</span>
                <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase border ${
                  hasClassroom 
                    ? 'bg-accent-greenLight text-green-800 border-green-300' 
                    : 'bg-accent-yellowLight text-yellow-800 border-yellow-300'
                }`}>
                  {hasClassroom ? 'Synced' : 'Simulation'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Student Portal:</span>
                <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase border ${
                  hasKP 
                    ? 'bg-accent-greenLight text-green-800 border-green-300' 
                    : 'bg-accent-yellowLight text-yellow-800 border-yellow-300'
                }`}>
                  {hasKP ? 'Connected' : 'Simulation'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="retro-card p-5 space-y-4">
            <h2 className="text-sm font-bold font-serif text-primary-900 border-b border-primary-900/10 pb-2">
              Sync Tests & WhatsApp Ping
            </h2>

            <div className="space-y-3">
              <div>
                <button
                  type="button"
                  onClick={handleTestWhatsApp}
                  disabled={testingWhatsApp}
                  className="w-full btn-retro-secondary py-2 text-xs flex items-center justify-center gap-1.5"
                >
                  {testingWhatsApp ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>WhatsApp Test Ping</span>
                </button>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleSyncClassroom}
                  disabled={syncingClassroom}
                  className="w-full btn-retro-blue py-2 text-xs flex items-center justify-center gap-1.5"
                >
                  {syncingClassroom ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Calendar className="w-3.5 h-3.5" />
                  )}
                  <span>Sync Google Classroom</span>
                </button>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleSyncKP}
                  disabled={syncingKP}
                  className="w-full btn-retro-blue py-2 text-xs flex items-center justify-center gap-1.5"
                >
                  {syncingKP ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <GraduationCap className="w-3.5 h-3.5" />
                  )}
                  <span>Sync Student Portal</span>
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
