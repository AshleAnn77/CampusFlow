import React, { useState } from 'react';
import axios from 'axios';
import { 
  Megaphone, 
  Sparkles, 
  Calendar, 
  Send, 
  Users, 
  FileText,
  CheckCircle
} from 'lucide-react';

export default function NoticeSummarizer({ student }) {
  const [noticeText, setNoticeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // AI Summary Results
  const [aiSummary, setAiSummary] = useState(null);
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState(null);

  const handleSummarize = async (e) => {
    e.preventDefault();
    if (!noticeText.trim()) {
      setError('Please paste the circular text first!');
      return;
    }

    setLoading(true);
    setError('');
    setAiSummary(null);
    setBroadcastResult(null);

    try {
      const res = await axios.post('/api/ai/notice-summarizer', { noticeText });
      setAiSummary(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'AI Summarization failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcast = async () => {
    if (!aiSummary) return;

    setBroadcasting(true);
    setError('');

    try {
      const res = await axios.post('/api/ai/notice-summarizer/broadcast', {
        noticeText,
        aiSummary,
        eventDate: aiSummary.eventDate
      });
      setBroadcastResult(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Broadcast failed.');
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-12">
      
      {/* Page Title */}
      <div>
        <span className="text-xs font-bold text-primary-900 uppercase tracking-widest font-sans">
          Notice Summarizer Module (15 Pts Bonus)
        </span>
        <h1 className="text-3xl font-extrabold font-serif text-primary-900">
          Circular Parser & Broadcaster
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Paste unstructured university notices or placement drive circulars. AI extracts target dates and compiles a 3-bullet summary for study group broadcasts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Paste Notice Text */}
        <div className={aiSummary ? "md:col-span-6 space-y-6" : "md:col-span-12 space-y-6"}>
          <div className="retro-card p-5 relative">
            <h2 className="text-sm font-bold font-serif text-primary-900 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary-900" />
              <span>Official Circular Input</span>
            </h2>

            {error && (
              <div className="p-3 bg-accent-redLight border-2 border-primary-900 rounded-xl text-xs font-semibold text-red-900 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSummarize} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Paste College Notice Text
                </label>
                <textarea
                  required
                  rows={8}
                  placeholder="Paste unstructured announcement text. Example: 
DEAN'S OFFICE OFFICE MEMORANDUM
It is hereby notified to all 3rd Year B.Tech students that the TCS Recruitment registration drive link has been hosted on the TPO portal. All interested students possessing a CGPA of 7.0 or above with no standing backlogs must register before June 28, 2026. The mock interview sessions will commence on June 30, 2026 in block C seminar hall..."
                  value={noticeText}
                  onChange={e => setNoticeText(e.target.value)}
                  className="w-full bg-background border-2 border-primary-900 focus:outline-none rounded-xl px-4 py-3 text-xs text-primary-900 leading-relaxed font-sans"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-retro py-3 text-xs"
              >
                {loading ? (
                  <>
                    <div className="w-4.5 h-4.5 border-2 border-primary-900 border-t-transparent rounded-full animate-spin"></div>
                    <span>AI is reading notice circular...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4.5 h-4.5" />
                    <span>Generate AI Notice Summary</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: AI Summary & Broadcast actions */}
        {aiSummary && (
          <div className="md:col-span-6 space-y-6">
            
            {/* AI Summary Display Card */}
            <div className="retro-card p-6 relative space-y-4 bg-white">
              
              {/* Card Header */}
              <div className="border-b border-primary-900/10 pb-3 flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] text-primary-900 font-bold uppercase tracking-wider">
                    AI Summary Results
                  </span>
                  <h3 className="text-sm font-bold text-primary-900 font-serif mt-1 leading-snug">
                    {aiSummary.title}
                  </h3>
                </div>
                {aiSummary.requiresAction && (
                  <span className="text-[8px] font-extrabold uppercase bg-accent-redLight text-red-800 border-2 border-primary-900 px-2 py-0.5 rounded shrink-0">
                    Action Required
                  </span>
                )}
              </div>

              {/* Bullet Points */}
              <div className="space-y-3">
                {aiSummary.summary.map((bullet, index) => (
                  <div key={index} className="flex gap-2.5 items-start text-xs leading-relaxed text-slate-700 font-medium">
                    <span className="w-4.5 h-4.5 border-2 border-primary-900 bg-accent-yellowLight text-primary-900 rounded flex items-center justify-center shrink-0 text-[10px] font-bold">
                      {index + 1}
                    </span>
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>

              {/* Event Date Extracted */}
              {aiSummary.eventDate && (
                <div className="p-3 bg-background border-2 border-primary-900 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-500 font-bold">
                    <Calendar className="w-4 h-4 text-primary-900" />
                    <span>Target Date Extracted:</span>
                  </div>
                  <span className="font-bold text-primary-900">
                    {new Date(aiSummary.eventDate).toLocaleDateString([], { dateStyle: 'medium' })}
                  </span>
                </div>
              )}

              {/* Broadcast Action Block */}
              {!broadcastResult ? (
                <div className="pt-2">
                  <button
                    onClick={handleBroadcast}
                    disabled={broadcasting}
                    className="w-full btn-retro py-2.5 text-xs"
                  >
                    {broadcasting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-900 border-t-transparent rounded-full animate-spin"></div>
                        <span>Broadcasting circular...</span>
                      </>
                    ) : (
                      <>
                        <Megaphone className="w-4 h-4" />
                        <span>Broadcast & Add to Calendar</span>
                      </>
                    )}
                  </button>
                  <p className="text-[9px] text-slate-500 mt-2 text-center font-bold">
                    Sends WhatsApp alerts to all onboarded students & schedules Google Calendar event.
                  </p>
                </div>
              ) : (
                /* Broadcast Success Layout */
                <div className="p-4 bg-accent-greenLight border-2 border-primary-900 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2.5 text-xs text-green-900 font-extrabold">
                    <CheckCircle className="w-5 h-5 shrink-0" />
                    <span>n8n Broadcast Sent!</span>
                  </div>
                  <p className="text-[10px] text-green-950 font-bold leading-normal">
                    {broadcastResult.message}
                  </p>
                  <div className="flex items-center gap-4 text-[9px] text-slate-700 font-bold pt-1">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-primary-900" /> {broadcastResult.broadcastDetails.studentsCount} Students Alerted
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-primary-900" /> Event Synced
                    </span>
                  </div>
                </div>
              )}

              {/* Paste new trigger */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    setAiSummary(null);
                    setBroadcastResult(null);
                    setNoticeText('');
                  }}
                  className="text-[10px] text-primary-900 font-bold underline"
                >
                  Parse another circular
                </button>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
