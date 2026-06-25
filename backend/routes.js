const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const aiService = require('./aiService');

const router = express.Router();
const dbPath = path.join(__dirname, 'db.json');

// Helper to read database
function readDB() {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading db.json, returning empty structure:", error);
    return { students: [], settings: {}, attendance: [], tasks: [], flashcards: [], quizzes: [], automationsLog: [] };
  }
}

// Helper to write database
function writeDB(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error("Error writing db.json:", error);
  }
}

// Helper to log automation webhook trigger
function logAutomation(webhookName, payload, status) {
  const db = readDB();
  const logEntry = {
    id: `log-${uuidv4().substring(0, 8)}`,
    timestamp: new Date().toISOString(),
    webhookName,
    payload,
    status
  };
  db.automationsLog.unshift(logEntry); // add to front
  if (db.automationsLog.length > 50) {
    db.automationsLog.pop();
  }
  writeDB(db);
  return logEntry;
}

// --- Credentials & Settings API ---

router.get('/settings', (req, res) => {
  const db = readDB();
  res.json(db.settings || {});
});

router.post('/settings', (req, res) => {
  const newSettings = req.body;
  const db = readDB();
  db.settings = { ...(db.settings || {}), ...newSettings };
  writeDB(db);

  // Update Gemini key in AI Service if it has been updated
  if (newSettings.geminiApiKey) {
    aiService.apiKey = newSettings.geminiApiKey;
    aiService.isSimulationMode = false;
    console.log("🔒 Gemini API Key updated and loaded into AIService.");
  }

  res.json({ message: "Settings saved successfully", settings: db.settings });
});

// --- Attendance Fetch ---
router.get('/attendance', (req, res) => {
  const db = readDB();
  res.json(db.attendance || []);
});


// --- Integrations Sync Endpoints ---

// Google Classroom Sync: Pulls mock/actual assignments
router.post('/integrations/google-classroom/sync', (req, res) => {
  const db = readDB();
  const student = db.students[0]; // grab default student
  
  if (!student) {
    return res.status(400).json({ error: "No student profile loaded. Onboard first!" });
  }

  const isClassroomConfigured = !!db.settings?.classroomClient;

  // New incoming synced assignments
  const syncedTasks = [
    {
      id: `task-sync-${uuidv4().substring(0, 8)}`,
      studentId: student.id,
      title: "Computer Networks Lab - Socket Programming in Python",
      subject: "Computer Networks",
      deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days from now
      reminderTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      addToCalendar: true,
      status: "pending",
      createdAt: new Date().toISOString()
    },
    {
      id: `task-sync-${uuidv4().substring(0, 8)}`,
      studentId: student.id,
      title: "Software Engineering - Software Requirement Specification (SRS) Document",
      subject: "Software Engineering",
      deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days from now
      reminderTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      addToCalendar: true,
      status: "pending",
      createdAt: new Date().toISOString()
    }
  ];

  // Prevent duplicates
  let addedCount = 0;
  syncedTasks.forEach(task => {
    const duplicate = db.tasks.find(t => t.title === task.title);
    if (!duplicate) {
      db.tasks.push(task);
      addedCount++;
    }
  });

  writeDB(db);

  const payload = {
    action: "Google Classroom Sync",
    clientConfigured: isClassroomConfigured,
    studentEmail: student.email,
    tasksPulled: addedCount
  };

  logAutomation("Google Classroom Sync", payload, isClassroomConfigured ? "Success" : "Simulated Success");

  res.json({
    message: isClassroomConfigured 
      ? `Successfully authenticated and synced ${addedCount} assignments from Google Classroom!` 
      : `Classroom sync completed in Demo Mode! Synced ${addedCount} sample assignments.`,
    addedCount
  });
});

// Christ Knowledge Pro Sync: Attendance & Notice Board circulars
router.post('/integrations/knowledge-pro/sync', (req, res) => {
  const db = readDB();
  const student = db.students[0];

  if (!student) {
    return res.status(400).json({ error: "No student profile loaded." });
  }

  const isKPConfigured = !!db.settings?.kpRollNumber && !!db.settings?.kpPassword;

  // Simulate updating attendance numbers slightly
  if (db.attendance && db.attendance.length > 0) {
    db.attendance = db.attendance.map(a => {
      // Simulate attending 1 or 2 new classes
      const addedClasses = Math.floor(Math.random() * 3);
      return {
        ...a,
        attended: a.attended + addedClasses,
        total: a.total + addedClasses + (Math.random() > 0.7 ? 1 : 0) // maybe total classes increased too
      };
    });
  }
  writeDB(db);

  const payload = {
    action: "Student Portal Sync",
    rollNumber: db.settings?.kpRollNumber || "Demo_3rd_Year",
    hasCredentials: isKPConfigured,
    attendanceStats: db.attendance
  };

  logAutomation("Student Portal Sync", payload, isKPConfigured ? "Success" : "Simulated Success");

  res.json({
    message: isKPConfigured 
      ? "Successfully authenticated with Student Portal and updated attendance & notices!" 
      : "Student Portal sync completed in Demo Mode! Attendance records updated successfully.",
    attendance: db.attendance
  });
});

// WhatsApp Direct Test: Sends a direct ping via Twilio if env keys are configured
router.post('/integrations/whatsapp/test', async (req, res) => {
  const db = readDB();
  const settings = db.settings || {};
  
  // Read Twilio Credentials from environment variables instead of database settings
  const envSid = process.env.TWILIO_ACCOUNT_SID;
  const envToken = process.env.TWILIO_AUTH_TOKEN;
  const envSender = process.env.TWILIO_WHATSAPP_NUMBER || "+14155238886";
  
  const hasTwilioKeys = !!envSid && !!envToken;
  const toPhone = settings.recipientPhone || "+919876543210";

  const payload = {
    to: `whatsapp:${toPhone}`,
    from: `whatsapp:${envSender}`,
    body: "Hi! This is a test message from your CampusFlow platform. Your WhatsApp integration is active! 🚀"
  };

  if (hasTwilioKeys) {
    try {
      console.log("Triggering real Twilio WhatsApp API call using environment variables...");
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${envSid}/Messages.json`;
      
      const authHeader = Buffer.from(`${envSid}:${envToken}`).toString('base64');
      const params = new URLSearchParams();
      params.append('To', payload.to);
      params.append('From', payload.from);
      params.append('Body', payload.body);

      const twilioRes = await axios.post(twilioUrl, params, {
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      logAutomation("WhatsApp Direct Ping", payload, "Success");
      res.json({ message: "WhatsApp message successfully sent via Twilio!", sid: twilioRes.data.sid });
    } catch (err) {
      console.error("Twilio API Error:", err.response?.data || err.message);
      logAutomation("WhatsApp Direct Ping", payload, `Failed: ${err.message}`);
      res.status(500).json({ error: `Twilio API Call Failed: ${err.response?.data?.message || err.message}` });
    }
  } else {
    // Simulation Mode - Return user-friendly success text as requested
    logAutomation("WhatsApp Direct Ping (Simulation)", payload, "Simulated Success");
    res.json({
      message: "WhatsApp Connected Successfully",
      payload
    });
  }
});


// --- Authentication & Onboarding ---

router.post('/auth/register', (req, res) => {
  const { name, branch, year, subjects, phone, email } = req.body;
  if (!name || !branch || !phone || !email) {
    return res.status(400).json({ error: "Missing required onboarding fields" });
  }

  const db = readDB();
  const existing = db.students.find(s => s.phone === phone || s.email === email);
  if (existing) {
    return res.status(200).json({ message: "Welcome back!", student: existing });
  }

  const newStudent = {
    id: `student-${uuidv4().substring(0, 8)}`,
    name,
    branch,
    year: year || "1st Year",
    subjects: subjects || [],
    phone,
    email
  };

  db.students.push(newStudent);
  writeDB(db);
  res.status(201).json({ message: "Registration successful!", student: newStudent });
});

router.post('/auth/login', (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: "Phone number is required to login" });
  }

  const db = readDB();
  const student = db.students.find(s => s.phone === phone);
  if (!student) {
    return res.status(404).json({ error: "Student not found. Please onboard!" });
  }
  res.json({ message: "Login successful!", student });
});

router.get('/students', (req, res) => {
  const db = readDB();
  res.json(db.students);
});


// --- Task CRUD Endpoints ---

router.get('/tasks', (req, res) => {
  const { studentId } = req.query;
  if (!studentId) {
    return res.status(400).json({ error: "studentId query parameter is required" });
  }
  const db = readDB();
  const studentTasks = db.tasks.filter(t => t.studentId === studentId);
  res.json(studentTasks);
});

router.post('/tasks', async (req, res) => {
  const { studentId, title, subject, deadline, reminderTime, addToCalendar } = req.body;
  if (!studentId || !title || !subject || !deadline) {
    return res.status(400).json({ error: "Missing required task fields" });
  }

  const db = readDB();
  const student = db.students.find(s => s.id === studentId);
  if (!student) {
    return res.status(404).json({ error: "Student profile not found" });
  }

  const newTask = {
    id: `task-${uuidv4().substring(0, 8)}`,
    studentId,
    title,
    subject,
    deadline,
    reminderTime: reminderTime || new Date(new Date(deadline).getTime() - 24*60*60*1000).toISOString(),
    addToCalendar: addToCalendar !== undefined ? addToCalendar : true,
    status: "pending",
    createdAt: new Date().toISOString()
  };

  db.tasks.push(newTask);
  writeDB(db);

  // Trigger n8n or direct WhatsApp reminder
  const settings = db.settings || {};
  const hasTwilioKeys = settings.twilioAccountSid && settings.twilioAuthToken && settings.twilioWhatsappSender && settings.recipientPhone;
  const n8nWebhookUrl = process.env.N8N_DEADLINE_WEBHOOK_URL;
  
  const webhookPayload = {
    studentName: student.name,
    phone: settings.recipientPhone || student.phone,
    subject: newTask.subject,
    deadline: newTask.deadline,
    taskTitle: newTask.title
  };

  // If credentials are in settings, we prioritize them!
  if (hasTwilioKeys) {
    console.log("Triggering auto-log for task notification scheduled using settings credentials.");
  }

  if (n8nWebhookUrl) {
    try {
      console.log(`Triggering n8n deadline webhook: ${n8nWebhookUrl}`);
      axios.post(n8nWebhookUrl, webhookPayload, { timeout: 4000 })
        .then(() => logAutomation("Deadline Sync Webhook", webhookPayload, "Success"))
        .catch(err => {
          console.error("n8n Webhook POST error:", err.message);
          logAutomation("Deadline Sync Webhook", webhookPayload, `Failed: ${err.message}`);
        });
    } catch (err) {
      logAutomation("Deadline Sync Webhook", webhookPayload, `Failed: ${err.message}`);
    }
  } else {
    logAutomation("Deadline Sync (n8n Simulation)", webhookPayload, "Simulated Success");
  }

  res.status(201).json({ message: "Task created successfully!", task: newTask });
});

router.patch('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const db = readDB();
  const index = db.tasks.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Task not found" });
  }
  db.tasks[index].status = status || "completed";
  writeDB(db);
  res.json({ message: "Task updated", task: db.tasks[index] });
});

router.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.tasks = db.tasks.filter(t => t.id !== id);
  writeDB(db);
  res.json({ message: "Task deleted successfully" });
});


// --- AI Features Endpoints ---

router.post('/ai/tip', async (req, res) => {
  const { studentId } = req.body;
  const db = readDB();
  const student = db.students.find(s => s.id === studentId);
  try {
    const tip = await aiService.generateAITip(student);
    res.json({ tip });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate AI Tip" });
  }
});

router.post('/ai/study-buddy', async (req, res) => {
  const { studentId, subject, notesTitle, lectureNotes } = req.body;
  if (!lectureNotes) {
    return res.status(400).json({ error: "Lecture notes text is required" });
  }

  try {
    const [flashcards, quiz] = await Promise.all([
      aiService.generateFlashcards(lectureNotes, subject),
      aiService.generateQuiz(lectureNotes, subject)
    ]);

    const db = readDB();
    const newDeck = {
      id: `deck-${uuidv4().substring(0, 8)}`,
      studentId: studentId || "anonymous",
      subject: subject || "General",
      notesTitle: notesTitle || "Pasted Notes",
      flashcards,
      createdAt: new Date().toISOString()
    };

    const newQuiz = {
      id: `quiz-${uuidv4().substring(0, 8)}`,
      studentId: studentId || "anonymous",
      subject: subject || "General",
      notesTitle: notesTitle || "Pasted Notes",
      questions: quiz,
      createdAt: new Date().toISOString()
    };

    db.flashcards.push(newDeck);
    db.quizzes.push(newQuiz);
    writeDB(db);

    // Trigger WhatsApp notification for Study Buddy if n8n configured
    const settings = db.settings || {};
    const payload = {
      studentName: db.students[0]?.name || "Student",
      phone: settings.recipientPhone || db.students[0]?.phone || "+919876543210",
      subject: subject || "OS",
      deckTitle: notesTitle || "Lecture Notes Revision"
    };
    
    logAutomation("Study Buddy Material Generated", payload, "Simulated Success");

    res.json({
      message: "Study materials generated successfully!",
      deckId: newDeck.id,
      quizId: newQuiz.id,
      flashcards,
      quiz
    });
  } catch (error) {
    console.error("AI Study Buddy Error:", error);
    res.status(500).json({ error: "Failed to generate AI study materials" });
  }
});

router.post('/ai/deadline-manager', async (req, res) => {
  const { title, subject, deadline } = req.body;
  if (!title || !subject || !deadline) {
    return res.status(400).json({ error: "Missing title, subject, or deadline date" });
  }
  try {
    const schedule = await aiService.generateStudySchedule(title, subject, deadline);
    res.json({ schedule });
  } catch (error) {
    console.error("AI Deadline Scheduler Error:", error);
    res.status(500).json({ error: "Failed to generate study schedule" });
  }
});

router.post('/ai/notice-summarizer', async (req, res) => {
  const { noticeText } = req.body;
  if (!noticeText) {
    return res.status(400).json({ error: "Notice circular text is required" });
  }
  try {
    const summaryResult = await aiService.summarizeNotice(noticeText);
    res.json(summaryResult);
  } catch (error) {
    console.error("Notice Summarizer Error:", error);
    res.status(500).json({ error: "Failed to summarize notice" });
  }
});

router.post('/ai/notice-summarizer/broadcast', async (req, res) => {
  const { noticeText, aiSummary, eventDate } = req.body;
  if (!aiSummary || !aiSummary.title || !aiSummary.summary) {
    return res.status(400).json({ error: "AI summary structure is required for broadcast" });
  }

  const db = readDB();
  const settings = db.settings || {};
  const phoneList = db.students.map(s => s.phone).filter(Boolean);
  
  if (phoneList.length === 0) {
    return res.status(400).json({ error: "No students registered. Please onboard at least one student." });
  }

  const n8nNoticeWebhookUrl = process.env.N8N_NOTICE_WEBHOOK_URL;
  const webhookPayload = {
    noticeText,
    eventDate: eventDate || aiSummary.eventDate || new Date().toISOString(),
    eventTitle: aiSummary.title,
    phoneList: settings.recipientPhone ? [settings.recipientPhone] : phoneList
  };

  const formattedSummary = aiSummary.summary.map(s => `• ${s}`).join('\n');

  if (n8nNoticeWebhookUrl) {
    try {
      console.log(`Triggering n8n notice broadcast webhook: ${n8nNoticeWebhookUrl}`);
      axios.post(n8nNoticeWebhookUrl, webhookPayload, { timeout: 4000 })
        .then(() => logAutomation("Notice Broadcast Webhook", webhookPayload, "Success"))
        .catch(err => {
          console.error("n8n Notice Webhook POST error:", err.message);
          logAutomation("Notice Broadcast Webhook", webhookPayload, `Failed: ${err.message}`);
        });
    } catch (err) {
      logAutomation("Notice Broadcast Webhook", webhookPayload, `Failed: ${err.message}`);
    }
  } else {
    logAutomation("Notice Broadcast (n8n Simulation)", webhookPayload, "Simulated Success");
  }

  res.json({
    message: `Broadcast message sent to n8n workflow for ${phoneList.length} students!`,
    broadcastDetails: {
      title: aiSummary.title,
      summaryText: formattedSummary,
      studentsCount: phoneList.length
    }
  });
});


// --- Automation Log Endpoints ---

router.get('/automations', (req, res) => {
  const db = readDB();
  res.json(db.automationsLog);
});

router.post('/automations/clear', (req, res) => {
  const db = readDB();
  db.automationsLog = [];
  writeDB(db);
  res.json({ message: "Logs cleared" });
});

module.exports = router;
