import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CalendarClock, 
  Plus, 
  Trash2, 
  Sparkles, 
  Calendar, 
  Phone, 
  Clock, 
  Compass, 
  Lightbulb, 
  X 
} from 'lucide-react';

export default function DeadlineManager({ student }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(student.subjects[0] || 'General');
  const [deadline, setDeadline] = useState('');
  const [reminderOffset, setReminderOffset] = useState('24');
  const [addToCalendar, setAddToCalendar] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // AI Schedule State
  const [activeTaskSchedule, setActiveTaskSchedule] = useState(null);
  const [scheduleData, setScheduleData] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [student.id]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`/api/tasks?studentId=${student.id}`);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title || !deadline) {
      setError('Please fill in both title and deadline date.');
      return;
    }

    setSubmitting(true);
    setError('');

    const deadlineDate = new Date(deadline);
    const reminderDate = new Date(deadlineDate.getTime() - parseInt(reminderOffset) * 60 * 60 * 1000);

    try {
      const res = await axios.post('/api/tasks', {
        studentId: student.id,
        title,
        subject,
        deadline: deadlineDate.toISOString(),
        reminderTime: reminderDate.toISOString(),
        addToCalendar
      });

      setTasks([...tasks, res.data.task]);
      setTitle('');
      setDeadline('');
      setReminderOffset('24');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to create task.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      setTasks(tasks.filter(t => t.id !== taskId));
      if (activeTaskSchedule && activeTaskSchedule.id === taskId) {
        setActiveTaskSchedule(null);
        setScheduleData([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateSchedule = async (task) => {
    setActiveTaskSchedule(task);
    setScheduleLoading(true);
    setScheduleData([]);

    try {
      const res = await axios.post('/api/ai/deadline-manager', {
        title: task.title,
        subject: task.subject,
        deadline: task.deadline
      });
      setScheduleData(res.data.schedule);
    } catch (err) {
      console.error(err);
    } finally {
      setScheduleLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-12">
      
      {/* Page Title */}
      <div>
        <span className="text-xs font-bold text-primary-900 uppercase tracking-widest font-sans">
          Smart Deadline Manager Module
        </span>
        <h1 className="text-3xl font-extrabold font-serif text-primary-900">
          Deadline Scheduler & Planner
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Add exams, projects, or lab evaluations. Automated webhooks schedule Google Calendar events and program WhatsApp alerts via n8n.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Add Form & Task List */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Add Task Form */}
          <div className="retro-card p-5">
            <h2 className="text-sm font-bold font-serif text-primary-900 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary-900" />
              <span>Schedule New Deadline</span>
            </h2>

            {error && (
              <div className="p-3 bg-accent-redLight border-2 border-primary-900 rounded-xl text-xs font-semibold text-red-900 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleAddTask} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Task / Exam Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Endsem Practical Viva"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-background border-2 border-primary-900 focus:outline-none rounded-xl px-4 py-2.5 text-xs text-primary-900 animate-slide-up"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Subject
                  </label>
                  <select
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full bg-background border-2 border-primary-900 focus:outline-none rounded-xl px-4 py-2.5 text-xs text-primary-900"
                  >
                    {student.subjects.map((sub, i) => (
                      <option key={i} value={sub}>{sub}</option>
                    ))}
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Deadline Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="w-full bg-background border-2 border-primary-900 focus:outline-none rounded-xl px-4 py-2.5 text-xs text-primary-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    WhatsApp Nudge Timing
                  </label>
                  <select
                    value={reminderOffset}
                    onChange={e => setReminderOffset(e.target.value)}
                    className="w-full bg-background border-2 border-primary-900 focus:outline-none rounded-xl px-4 py-2.5 text-xs text-primary-900"
                  >
                    <option value="12">12 hours before due</option>
                    <option value="24">24 hours before due (Recommended)</option>
                    <option value="48">48 hours before due</option>
                    <option value="72">3 days before due</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 border-2 border-primary-900 rounded-xl">
                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700">
                  <Calendar className="w-4.5 h-4.5 text-primary-900" />
                  <span>Sync event to Google Calendar via n8n</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={addToCalendar}
                    onChange={e => setAddToCalendar(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none border-2 border-primary-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-primary-900 after:border-primary-900 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent-yellow"></div>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-retro py-3 text-xs"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-900 border-t-transparent rounded-full animate-spin"></div>
                    <span>Broadcasting webhook...</span>
                  </>
                ) : (
                  <>
                    <CalendarClock className="w-4.5 h-4.5" />
                    <span>Save Task & Trigger n8n Automation</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Task CRUD List */}
          <div className="retro-card p-5 space-y-4">
            <h2 className="text-sm font-bold font-serif text-primary-900">Active Deadlines Registry</h2>
            
            {loading ? (
              <div className="p-6 text-center text-xs text-slate-500 animate-pulse">Loading registry...</div>
            ) : tasks.length === 0 ? (
              <div className="p-8 text-center border-2 border-primary-900 border-dashed rounded-xl">
                <p className="text-xs text-slate-500">No scheduled tasks. Fill the form to create your first deadline workflow.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {tasks.map(task => {
                  const dateStr = new Date(task.deadline).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
                  const reminderStr = new Date(task.reminderTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
                  const isSelected = activeTaskSchedule?.id === task.id;

                  return (
                    <div 
                      key={task.id} 
                      className={`p-3.5 border-2 rounded-xl flex items-center justify-between gap-4 transition-all ${
                        isSelected 
                          ? 'border-primary-900 bg-accent-yellowLight/25 shadow-retro-sm' 
                          : 'border-primary-900/10 bg-white hover:border-primary-900'
                      }`}
                    >
                      <div className="space-y-1.5 overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 border border-primary-900 bg-accent-blueLight rounded text-[9px] font-bold uppercase tracking-wider text-primary-900">
                            {task.subject}
                          </span>
                          <h4 className="text-xs font-bold text-primary-900 truncate leading-snug">
                            {task.title}
                          </h4>
                        </div>
                        
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500 font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-primary-900" /> Due: {dateStr}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-primary-900" /> Nudge: {reminderStr}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleGenerateSchedule(task)}
                          className="px-2.5 py-1.5 bg-accent-yellow hover:bg-yellow-400 border-2 border-primary-900 rounded-lg text-[10px] font-bold text-primary-900 flex items-center gap-1 transition-all"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>AI Plan</span>
                        </button>
                        
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1.5 text-slate-500 hover:text-red-700 bg-white hover:bg-slate-50 border-2 border-primary-900 rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: AI Suggested Study Timeline Widget */}
        <div className="lg:col-span-5 space-y-6">
          <div className="retro-card p-5 relative min-h-[380px] bg-white">
            {activeTaskSchedule ? (
              <div className="space-y-4">
                
                {/* Timeline Header */}
                <div className="flex items-center justify-between border-b border-primary-900/10 pb-3">
                  <div>
                    <h3 className="text-xs font-bold text-primary-900 font-serif">AI Recommended Study Timeline</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-xs">{activeTaskSchedule.title}</p>
                  </div>
                  <button 
                    onClick={() => {
                      setActiveTaskSchedule(null);
                      setScheduleData([]);
                    }}
                    className="p-1 text-slate-500 hover:text-primary-900 rounded-lg transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {scheduleLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-2 text-xs text-slate-500">
                    <div className="w-6 h-6 border-2 border-primary-900 border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-bold uppercase text-[9px] tracking-wider">Compiling study schedule...</span>
                  </div>
                ) : scheduleData.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-600">Failed to render study schedule.</div>
                ) : (
                  /* Vertical Timeline Layout with high-contrast lines */
                  <div className="space-y-5 relative pl-4 before:content-[''] before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-primary-900">
                    {scheduleData.map((item, idx) => (
                      <div key={idx} className="relative space-y-1">
                        
                        {/* Timeline Node */}
                        <div className="absolute left-[-13px] top-1.5 w-2.5 h-2.5 rounded-full bg-accent-yellow border-2 border-primary-900 shadow"></div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-primary-900 uppercase font-sans">
                            {item.day}
                          </span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-background border border-primary-900 rounded text-[8px] font-bold text-primary-900">
                            <Clock className="w-2.5 h-2.5" /> {item.duration}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-800 leading-normal font-serif">
                          {item.topic}
                        </h4>

                        <p className="text-[10px] text-slate-600 flex items-start gap-1 leading-relaxed italic font-medium">
                          <Lightbulb className="w-3.5 h-3.5 text-accent-yellow shrink-0 mt-0.5" />
                          <span>{item.tip}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Empty Planner State */
              <div className="h-full py-24 flex flex-col items-center justify-center text-center gap-3">
                <div className="p-4 bg-accent-yellowLight/50 border-2 border-primary-900 rounded-full text-primary-900">
                  <Compass className="w-8 h-8" />
                </div>
                <h3 className="text-xs font-bold text-primary-900 font-serif">AI Planner Inactive</h3>
                <p className="text-[10px] text-slate-500 max-w-xs leading-normal">
                  Click the <strong>AI Plan</strong> button next to any deadline in the registry to build a structured preparation schedule leading up to your deadline.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
