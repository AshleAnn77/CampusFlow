import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Sparkles, 
  Clock, 
  Calendar, 
  BookOpen, 
  Activity, 
  RefreshCw, 
  Trash2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  AlertTriangle,
  GraduationCap,
  ArrowRight
} from 'lucide-react';

export default function Dashboard({ user, student, onNavigate, onUpdateUser }) {
  const [tasks, setTasks] = useState([]);
  const [aiTip, setAiTip] = useState('');
  const [tipLoading, setTipLoading] = useState(true);
  const [attendance, setAttendance] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [refreshingLogs, setRefreshingLogs] = useState(false);

  // Sync loadings
  const [syncingClassroom, setSyncingClassroom] = useState(false);
  const [syncingKP, setSyncingKP] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, [student.id]);

  const fetchDashboardData = async () => {
    setTipLoading(true);
    setAttendanceLoading(true);
    try {
      // 1. Fetch tasks
      const tasksRes = await axios.get(`/api/tasks?studentId=${student.id}`);
      setTasks(tasksRes.data);
      
      // 2. Fetch AI tip
      const tipRes = await axios.post('/api/ai/tip', { studentId: student.id });
      setAiTip(tipRes.data.tip);

      // 3. Fetch attendance
      const attendanceRes = await axios.get('/api/attendance');
      setAttendance(attendanceRes.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setTipLoading(false);
      setAttendanceLoading(false);
    }
    fetchLogs();
  };

  const fetchLogs = async () => {
    try {
      const logsRes = await axios.get('/api/automations');
      setLogs(logsRes.data);
    } catch (err) {
      console.error("Failed to load logs", err);
    } finally {
      setLogsLoading(false);
      setRefreshingLogs(false);
    }
  };

  const handleClearLogs = async () => {
    try {
      await axios.post('/api/automations/clear');
      setLogs([]);
    } catch (err) {
      console.error("Failed to clear logs", err);
    }
  };

  // Sync Google Classroom
  const handleSyncClassroom = async () => {
    setSyncingClassroom(true);
    try {
      await axios.post('/api/integrations/google-classroom/sync');
      if (onUpdateUser) {
        onUpdateUser({ name: "Ann", department: "Computer Science & Engineering" }, "classroom");
      }
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    } finally {
      setSyncingClassroom(false);
    }
  };

  // Sync Christ Portal
  const handleSyncKP = async () => {
    setSyncingKP(true);
    try {
      await axios.post('/api/integrations/knowledge-pro/sync');
      if (onUpdateUser) {
        onUpdateUser({ name: "Ann", department: "BTech CSE Semester 5" }, "kp");
      }
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    } finally {
      setSyncingKP(false);
    }
  };

  const handleToggleTaskStatus = async (taskId, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'pending' ? 'completed' : 'pending';
      await axios.patch(`/api/tasks/${taskId}`, { status: nextStatus });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: nextStatus } : t));
    } catch (err) {
      console.error("Failed to update task", err);
    }
  };

  // Attendance Logic (85% overall, 75% per-subject)
  let totalAttended = 0;
  let totalClasses = 0;
  
  attendance.forEach(sub => {
    totalAttended += sub.attended;
    totalClasses += sub.total;
  });

  const overallPercentage = totalClasses > 0 ? (totalAttended / totalClasses) * 100 : 0;
  const overallTarget = 85;
  const subjectTarget = 75;

  const isOverallShort = overallPercentage < overallTarget;
  
  // Calculate consecutive classes needed for overall attendance (85%)
  const overallClassesNeeded = isOverallShort 
    ? Math.ceil((overallTarget/100 * totalClasses - totalAttended) / (1 - overallTarget/100))
    : 0;

  // Weekday Schedule compilation (for the "Intelly" style grid representation)
  // Maps tasks to Mon-Sun
  const getWeekdayName = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDay(); // 0 is Sun, 1 is Mon
    return ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][day];
  };

  const weekdaysList = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  
  const tasksByWeekday = {};
  weekdaysList.forEach(day => {
    tasksByWeekday[day] = [];
  });

  tasks.filter(t => t.status === 'pending').forEach(task => {
    const dayName = getWeekdayName(task.deadline);
    if (tasksByWeekday[dayName]) {
      tasksByWeekday[dayName].push(task);
    }
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-primary-900 uppercase tracking-widest font-sans">
            Academic Ledger
          </span>
          <h1 className="text-3xl font-extrabold font-serif text-primary-900 leading-tight">
            Stay up to date, {user?.name || student?.name || "Student"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncClassroom}
            disabled={syncingClassroom}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border-2 border-primary-900 text-xs font-bold rounded-xl shadow-retro-sm active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingClassroom ? 'animate-spin' : ''}`} />
            Classroom Sync
          </button>
          <button
            onClick={handleSyncKP}
            disabled={syncingKP}
            className="px-3.5 py-2 bg-accent-yellow hover:bg-yellow-400 border-2 border-primary-900 text-xs font-bold rounded-xl shadow-retro-sm active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingKP ? 'animate-spin' : ''}`} />
            Student Portal Sync
          </button>
        </div>
      </div>

      {/* Overview Cards (Attendance status overall) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Attendance Stats Card */}
        <div className="retro-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-primary-900/10 pb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Attendance</span>
            <TrendingUp className="w-4.5 h-4.5 text-primary-900" />
          </div>
          {attendanceLoading ? (
            <div className="h-6 w-24 bg-slate-100 animate-pulse rounded"></div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-serif text-primary-900">
                  {overallPercentage.toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-500">
                  ({totalAttended}/{totalClasses} classes)
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-slate-100 border border-primary-900 rounded-full h-3.5 overflow-hidden p-0.5">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    isOverallShort ? 'bg-accent-yellow' : 'bg-accent-greenLight'
                  }`}
                  style={{ width: `${Math.min(100, overallPercentage)}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-500 font-medium">Req Overall: 85%</span>
                {isOverallShort ? (
                  <span className="text-red-700 font-bold bg-accent-redLight px-1.5 py-0.5 rounded border border-red-300 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Need {overallClassesNeeded} classes
                  </span>
                ) : (
                  <span className="text-green-700 font-bold bg-accent-greenLight px-1.5 py-0.5 rounded border border-green-300">
                    Safe! Overall Cleared
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pending Deadlines Card */}
        <div className="retro-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-primary-900/10 pb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Deadlines</span>
            <Clock className="w-4.5 h-4.5 text-primary-900" />
          </div>
          <div className="flex items-baseline gap-2 pt-2">
            <span className="text-3xl font-extrabold font-serif text-primary-900">
              {tasks.filter(t => t.status === 'pending').length}
            </span>
            <span className="text-xs font-semibold text-slate-500">Tasks active</span>
          </div>
          <button 
            onClick={() => onNavigate('deadline-manager')}
            className="text-[10px] font-bold text-primary-900 flex items-center gap-1 mt-3 hover:underline"
          >
            <span>View Deadline Registry</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* AI Tip Box */}
        <div className="retro-card p-5 bg-accent-yellowLight flex flex-col justify-between">
          <div className="flex items-center gap-1.5 border-b border-primary-900/10 pb-2 text-xs font-bold text-primary-900 uppercase">
            <Sparkles className="w-4.5 h-4.5" />
            <span>AI Tip of the Day</span>
          </div>
          {tipLoading ? (
            <div className="space-y-1.5 pt-2">
              <div className="h-3 w-full bg-slate-800/10 rounded animate-pulse"></div>
              <div className="h-3 w-3/4 bg-slate-800/10 rounded animate-pulse"></div>
            </div>
          ) : (
            <p className="text-[11px] leading-relaxed text-slate-800 italic pt-2 font-medium">
              "{aiTip}"
            </p>
          )}
        </div>

      </div>

      {/* Week Grid Scheduler - Inspired by "Intelly" */}
      <div className="retro-card p-6 space-y-4">
        <h2 className="text-lg font-bold font-serif text-primary-900">Weekly Schedule Grid</h2>
        <div className="grid grid-cols-1 sm:grid-cols-7 gap-3.5">
          {weekdaysList.map(dayName => {
            const dayTasks = tasksByWeekday[dayName] || [];
            const isToday = new Date().toLocaleDateString([], { weekday: 'long' }).toUpperCase() === dayName;
            
            return (
              <div 
                key={dayName} 
                className={`p-3 border-2 rounded-xl flex flex-col min-h-[160px] ${
                  isToday 
                    ? 'border-primary-900 bg-accent-yellowLight/20 shadow-retro-sm' 
                    : 'border-slate-350 bg-slate-50/50'
                }`}
              >
                <div className="border-b border-primary-900/10 pb-1.5 mb-2 flex justify-between items-center">
                  <span className="text-[9px] font-bold text-primary-900 tracking-wider">
                    {dayName.substring(0, 3)}
                  </span>
                  {isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-yellow border border-primary-900 animate-ping"></span>
                  )}
                </div>

                <div className="space-y-2 flex-1 flex flex-col justify-start">
                  {dayTasks.length === 0 ? (
                    <span className="text-[9px] text-slate-400 italic my-auto text-center block">Free</span>
                  ) : (
                    dayTasks.map(task => (
                      <div 
                        key={task.id} 
                        className="p-2 border border-primary-900 rounded bg-white text-[10px] space-y-1 relative"
                      >
                        <span className="px-1 py-0.5 rounded bg-accent-blueLight text-[8px] font-bold block w-fit">
                          {task.subject}
                        </span>
                        <h4 className="font-bold text-slate-800 truncate leading-tight" title={task.title}>
                          {task.title}
                        </h4>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Double Column: Subject Attendance Calculator and n8n Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Attendance Calculator (75% subject criteria checker) */}
        <div className="lg:col-span-7 retro-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-primary-900/10 pb-3">
            <div>
              <h2 className="text-base font-bold font-serif text-primary-900">Per-Subject Attendance Check</h2>
              <p className="text-[10px] text-slate-500 font-medium">End-semester criteria: 75% minimum per subject</p>
            </div>
            <GraduationCap className="w-5 h-5 text-primary-900" />
          </div>

          {attendanceLoading ? (
            <div className="py-6 text-center text-xs text-slate-500">Calculating portal attendance...</div>
          ) : (
            <div className="space-y-3">
              {attendance.map((sub, idx) => {
                const pct = sub.total > 0 ? (sub.attended / sub.total) * 100 : 0;
                const isShort = pct < subjectTarget;
                
                // Solve: (attended + x)/(total + x) >= 0.75
                const classesNeeded = isShort
                  ? Math.ceil((subjectTarget/100 * sub.total - sub.attended) / (1 - subjectTarget/100))
                  : 0;

                // Solve for safe-to-miss: attended / (total + y) >= 0.75
                const safeToMiss = !isShort
                  ? Math.floor((sub.attended - subjectTarget/100 * sub.total) / (subjectTarget/100))
                  : 0;

                return (
                  <div key={idx} className="p-3 border border-primary-900 rounded-xl bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary-900 font-serif">{sub.subject}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${
                          isShort 
                            ? 'bg-accent-redLight text-red-800 border-red-300' 
                            : 'bg-accent-greenLight text-green-800 border-green-300'
                        }`}>
                          {pct.toFixed(0)}% ({sub.attended}/{sub.total})
                        </span>
                      </div>
                      
                      <div className="w-36 bg-slate-100 border border-primary-900 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${isShort ? 'bg-red-500' : 'bg-green-600'}`}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {isShort ? (
                        <div className="text-[10px] text-red-700 font-bold flex items-center gap-1.5 justify-end">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Attend next <strong>{classesNeeded}</strong> classes consecutively</span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-green-700 font-bold flex items-center gap-1.5 justify-end">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Safe! Can miss up to <strong>{safeToMiss}</strong> classes</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Webhook log widget */}
        <div className="lg:col-span-5 retro-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-primary-900/10 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-primary-900" />
              <h2 className="text-sm font-bold font-serif text-primary-900">Automation logs</h2>
            </div>
            <button
              onClick={handleClearLogs}
              className="p-1.5 text-slate-400 hover:text-red-700 rounded-lg hover:bg-slate-100 transition-all"
              title="Clear Logs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {logsLoading ? (
            <div className="p-6 text-center text-xs text-slate-500">Reading logs...</div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center border-2 border-primary-900 border-dashed rounded-xl flex flex-col items-center justify-center gap-2">
              <AlertTriangle className="w-5 h-5 text-slate-400" />
              <p className="text-[10px] text-slate-500 max-w-xs leading-normal">
                No webhook transactions logged. Set up integrations and sync channels to see output logs.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {logs.slice(0, 5).map(log => {
                const isSuccess = log.status.toLowerCase().includes('success');
                return (
                  <div key={log.id} className="p-3 border border-primary-900 rounded-xl space-y-1.5 text-[10px] bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary-900">{log.webhookName}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold border ${
                        isSuccess 
                          ? 'bg-accent-greenLight text-green-800 border-green-200' 
                          : 'bg-accent-redLight text-red-800 border-red-200'
                      }`}>
                        {isSuccess ? 'SUCCESS' : 'FAILED'}
                      </span>
                    </div>
                    <div className="p-2 bg-white border border-primary-900/10 rounded font-mono text-[8px] text-slate-600 overflow-x-auto">
                      {JSON.stringify(log.payload)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
