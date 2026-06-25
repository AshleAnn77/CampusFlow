const axios = require('axios');

class AIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.isSimulationMode = !this.apiKey;
    if (this.isSimulationMode) {
      console.warn("⚠️ GEMINI_API_KEY not found in backend/.env. Running AI features in Simulation Mode.");
    }
  }

  // Helper to make API call to Gemini 1.5 Flash
  async callGemini(prompt, isJSONResponse = false) {
    if (this.isSimulationMode) {
      return null;
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
      const payload = {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {}
      };

      if (isJSONResponse) {
        payload.generationConfig.responseMimeType = "application/json";
      }

      const response = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' }
      });

      const textResult = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textResult) {
        throw new Error("Empty response from Gemini API");
      }
      return textResult;
    } catch (error) {
      console.error("❌ Gemini API Error:", error.response?.data || error.message);
      // Fallback to simulation if API call fails (network issues, rate limit, invalid key)
      console.log("🔄 Falling back to AI Simulation Mode for this request...");
      return null;
    }
  }

  // 1. AI Study Buddy: Generate Flashcards
  async generateFlashcards(lectureNotes, subject = "General Study") {
    const prompt = `
      You are an expert tutor. Analyze the following lecture notes and generate a JSON array of flashcards.
      Each flashcard must be a JSON object with:
      - "question": A clear, concise question testing key concepts from the notes.
      - "answer": A detailed yet easy-to-understand explanation or answer.

      Generate between 4 to 8 high-quality flashcards.
      Format the output strictly as a JSON array of objects. Do not include markdown wraps or anything except the JSON payload itself.

      Lecture Notes:
      "${lectureNotes}"
    `;

    const response = await this.callGemini(prompt, true);
    if (response) {
      try {
        return JSON.parse(response);
      } catch (e) {
        console.error("Failed to parse Gemini flashcards JSON:", e);
      }
    }

    // High quality simulation fallback based on content keywords
    return this.simulateFlashcards(lectureNotes, subject);
  }

  // AI Study Buddy: Generate MCQ Quiz
  async generateQuiz(lectureNotes, subject = "General Study") {
    const prompt = `
      You are an expert examiner. Analyze the following lecture notes and generate a JSON array of Multiple Choice Questions (MCQ).
      Each question must be a JSON object with:
      - "question": The question text.
      - "options": An array of exactly 4 strings (options).
      - "correctAnswer": The string representing the correct option, which must match one of the options exactly.

      Generate exactly 4 high-quality questions.
      Format the output strictly as a JSON array of objects. Do not include markdown wraps or anything except the JSON payload itself.

      Lecture Notes:
      "${lectureNotes}"
    `;

    const response = await this.callGemini(prompt, true);
    if (response) {
      try {
        return JSON.parse(response);
      } catch (e) {
        console.error("Failed to parse Gemini quiz JSON:", e);
      }
    }

    return this.simulateQuiz(lectureNotes, subject);
  }

  // 2. Smart Deadline Manager: Suggest Study Schedule
  async generateStudySchedule(taskTitle, subject, deadlineDate) {
    const prompt = `
      You are an AI Study Planner. A student has a deadline for the task "${taskTitle}" in the subject "${subject}" due on ${deadlineDate}.
      Today is ${new Date().toLocaleDateString()}.
      Suggest a logical study plan distributed across the remaining days. 
      Return a JSON array of study blocks. Each block must have:
      - "day": A label like "Day 1 (Preparation)", "Day 2 (Drafting)", etc., or relative dates.
      - "topic": What specific subtask the student should focus on that day.
      - "duration": Estimated duration (e.g. "1.5 hours", "2 hours").
      - "tip": A motivational or practical tip for completing this block.

      Provide 3 to 5 daily blocks leading up to the deadline.
      Format the output strictly as a JSON array of objects. Do not include markdown wraps or anything except the JSON payload itself.
    `;

    const response = await this.callGemini(prompt, true);
    if (response) {
      try {
        return JSON.parse(response);
      } catch (e) {
        console.error("Failed to parse Gemini schedule JSON:", e);
      }
    }

    return this.simulateStudySchedule(taskTitle, subject, deadlineDate);
  }

  // 3. Notice Summarizer: Summarize Notice
  async summarizeNotice(noticeText) {
    const prompt = `
      You are an administrative assistant at a B.Tech university. Analyze the following official notice and generate a JSON response.
      The JSON object must contain:
      - "title": A concise, clear title of what the notice is about.
      - "summary": An array of exactly 3 bullet points, summarizing the core rules, events, or actionable dates mentioned.
      - "eventDate": If the notice mentions an event, deadline, or exam date, extract it as an ISO 8601 string. If not, set to null.
      - "requiresAction": A boolean indicating if students need to register, submit, or attend.

      Format the output strictly as a JSON object. Do not include markdown wraps or anything except the JSON payload itself.

      Notice Text:
      "${noticeText}"
    `;

    const response = await this.callGemini(prompt, true);
    if (response) {
      try {
        return JSON.parse(response);
      } catch (e) {
        console.error("Failed to parse Gemini notice summary JSON:", e);
      }
    }

    return this.simulateNoticeSummary(noticeText);
  }

  // 4. AI Tip of the Day
  async generateAITip(studentProfile) {
    const profileText = studentProfile 
      ? `Name: ${studentProfile.name}, Branch: ${studentProfile.branch}, Year: ${studentProfile.year}, Subjects: ${studentProfile.subjects.join(', ')}`
      : "a B.Tech engineering student";

    const prompt = `
      Write a single, highly actionable, and motivating productivity tip (maximum 2 sentences) for a B.Tech student with the following profile:
      ${profileText}.
      Focus on exam prep, balance, laboratory coding, or staying on top of engineering deadlines. Keep it encouraging and casual.
      Do not wrap it in quotes. Return the tip as plain text.
    `;

    const response = await this.callGemini(prompt, false);
    if (response) {
      return response.trim().replace(/^"|"$/g, '');
    }

    // Simulated general engineering student tips
    const standardTips = [
      "Keep your laboratory codes version-controlled on GitHub; it saves hours of debugging before final viva exams!",
      "Struggling with DBMS normalization? Break dependencies down into single-valued relations first. You've got this!",
      "Automate your daily schedule review every morning over tea. CampusFlow handles the calendar, you handle the coding.",
      "For Operating Systems, visualize Process Scheduling as a queue at the college cafeteria. Fast processes go first in SJF!",
      "Keep a clean separation between compilation and runtime tests. A simple Makefile can save you valuable time during sprints."
    ];
    return standardTips[Math.floor(Math.random() * standardTips.length)];
  }

  // --- Fallback Simulation Methods ---

  simulateFlashcards(notes, subject) {
    console.log("Simulating Flashcards for:", subject);
    const lowercaseNotes = notes.toLowerCase();

    if (lowercaseNotes.includes("semaphore") || lowercaseNotes.includes("process") || lowercaseNotes.includes("operating system")) {
      return [
        {
          question: "What is a Semaphore in Operating Systems?",
          answer: "A semaphore is a variable or abstract data type used to control access to a common resource by multiple processes in a concurrent system (preventing race conditions)."
        },
        {
          question: "Differentiate between Binary Semaphore and Counting Semaphore.",
          answer: "A binary semaphore has a value of either 0 or 1, acting like a mutex lock. A counting semaphore has an unrestricted range and is used to control access to a resource pool with multiple instances."
        },
        {
          question: "What are the two atomic operations performed on semaphores?",
          answer: "The two operations are wait() [often called P() or down] which decrements the semaphore, and signal() [often called V() or up] which increments it."
        },
        {
          question: "Explain the Deadlock condition in semaphores.",
          answer: "A deadlock occurs when two or more processes are waiting indefinitely for an event (or semaphore increment) that can only be caused by one of the waiting processes itself."
        }
      ];
    }

    if (lowercaseNotes.includes("database") || lowercaseNotes.includes("sql") || lowercaseNotes.includes("dbms") || lowercaseNotes.includes("normalization")) {
      return [
        {
          question: "What is Database Normalization?",
          answer: "Normalization is the process of organizing data in a database to reduce redundancy and improve data integrity by dividing tables and establishing relationships."
        },
        {
          question: "What defines First Normal Form (1NF)?",
          answer: "A table is in 1NF if all columns contain atomic (indivisible) values, and there are no repeating groups of columns."
        },
        {
          question: "Explain Third Normal Form (3NF) requirements.",
          answer: "A relation is in 3NF if it is in 2NF, and no non-prime attribute is transitively dependent on the primary key."
        },
        {
          question: "What is BCNF?",
          answer: "Boyce-Codd Normal Form is a stronger version of 3NF. A table is in BCNF if for every functional dependency X -> Y, X is a superkey."
        }
      ];
    }

    // Default general flashcards
    return [
      {
        question: `Core concept in ${subject}`,
        answer: "This is a key concept generated by CampusFlow AI based on your pasted lecture notes. Reviewing these definitions regularly improves retention."
      },
      {
        question: "Active Recall",
        answer: "Testing yourself on a concept rather than just re-reading notes triggers neurogenesis and cements knowledge in long-term memory."
      },
      {
        question: "Spaced Repetition",
        answer: "Reviewing topics at increasing intervals (e.g., 1 day, 3 days, 7 days) ensures high retention with minimal total study time."
      }
    ];
  }

  simulateQuiz(notes, subject) {
    console.log("Simulating Quiz for:", subject);
    const lowercaseNotes = notes.toLowerCase();

    if (lowercaseNotes.includes("semaphore") || lowercaseNotes.includes("process") || lowercaseNotes.includes("operating system")) {
      return [
        {
          question: "Which operation is used to release a semaphore lock?",
          options: ["wait()", "signal()", "acquire()", "block()"],
          correctAnswer: "signal()"
        },
        {
          question: "What is the initial value of a binary semaphore?",
          options: ["0", "1", "-1", "Any integer"],
          correctAnswer: "1"
        },
        {
          question: "Busy waiting in semaphores is solved using which technique?",
          options: ["Spinlocks", "Process blocking and putting to sleeping queue", "Infinite loops", "None of the above"],
          correctAnswer: "Process blocking and putting to sleeping queue"
        },
        {
          question: "A process executing wait() on a semaphore with value 0 will:",
          options: ["Continue execution", "Increment the semaphore", "Be blocked/suspended", "Terminate immediately"],
          correctAnswer: "Be blocked/suspended"
        }
      ];
    }

    if (lowercaseNotes.includes("database") || lowercaseNotes.includes("sql") || lowercaseNotes.includes("dbms") || lowercaseNotes.includes("normalization")) {
      return [
        {
          question: "Which normal form deals with transitive dependencies?",
          options: ["1NF", "2NF", "3NF", "BCNF"],
          correctAnswer: "3NF"
        },
        {
          question: "A table where every column contains atomic values is at least in:",
          options: ["1NF", "2NF", "3NF", "BCNF"],
          correctAnswer: "1NF"
        },
        {
          question: "What SQL clause is used to filter records after grouping?",
          options: ["WHERE", "HAVING", "ORDER BY", "SELECT"],
          correctAnswer: "HAVING"
        },
        {
          question: "A candidate key is a:",
          options: ["Foreign key", "Minimal superkey", "Primary key that can be null", "Composite key only"],
          correctAnswer: "Minimal superkey"
        }
      ];
    }

    // Default general quiz
    return [
      {
        question: "Which of the following is a primary technique for effective study?",
        options: ["Passive reading", "Active recall testing", "Cramming overnight", "Highlighting full pages"],
        correctAnswer: "Active recall testing"
      },
      {
        question: `In the context of ${subject}, which factor is most crucial for understanding?`,
        options: ["Memorizing definitions", "Applying concepts to practice problems", "Listening to lectures on 2x speed", "Using many colors of highlighter"],
        correctAnswer: "Applying concepts to practice problems"
      },
      {
        question: "What does the 'P' stand for in P(S) semaphore operation?",
        options: ["Proberen (Dutch for 'to test')", "Pass", "Proceed", "Pause"],
        correctAnswer: "Proberen (Dutch for 'to test')"
      },
      {
        question: "How should a B.Tech student prepare for a programming lab exam?",
        options: ["Reading code off slides", "Writing and compiling code locally from scratch", "Memorizing code syntax", "Hoping the partner compiles it"],
        correctAnswer: "Writing and compiling code locally from scratch"
      }
    ];
  }

  simulateStudySchedule(taskTitle, subject, deadlineDate) {
    const daysLeft = Math.max(1, Math.round((new Date(deadlineDate) - new Date()) / (1000 * 60 * 60 * 24)));
    
    if (daysLeft <= 1) {
      return [
        {
          day: "Today (Sprint Mode)",
          topic: `Core concepts of ${taskTitle} & setup.`,
          duration: "2 hours",
          tip: "Disable social media. Build a minimal working prototype first."
        },
        {
          day: "Tonight (Submission Eve)",
          topic: "Code review, testing cases, and compiling report.",
          duration: "3 hours",
          tip: "Verify all edge cases. Double check instructions before final submit!"
        }
      ];
    } else if (daysLeft === 2) {
      return [
        {
          day: "Day 1 (Core Prep)",
          topic: `Read guidelines, structure layout, and outline ${taskTitle}.`,
          duration: "1.5 hours",
          tip: "Focus on database schemas or basic diagrams first."
        },
        {
          day: "Day 2 (Implementation)",
          topic: "Develop logic, write code, or draft chapters.",
          duration: "2.5 hours",
          tip: "Take a 5-minute walk every 25 minutes using the Pomodoro technique."
        },
        {
          day: "Day 3 (Review & Send)",
          topic: "Final bug fixes, formatting, and submission checks.",
          duration: "1 hour",
          tip: "Upload your submission early to avoid server traffic overloads."
        }
      ];
    } else {
      // 3 or more days
      return [
        {
          day: "Day 1: Setup & Research",
          topic: `Review notes on ${subject} and collect references for ${taskTitle}.`,
          duration: "1 hour",
          tip: "Outline what resources and libraries you need before writing code."
        },
        {
          day: "Day 2-3: Core Execution",
          topic: "Write primary modules, draft project body, and solve complex algorithms.",
          duration: "2 hours/day",
          tip: "Write documentation as you go. It makes review much faster."
        },
        {
          day: "Day 4: Testing & Integration",
          topic: "Run integration tests, check formatting margins, and clean up logs.",
          duration: "1.5 hours",
          tip: "Have a classmate run a quick sanity check review on your work."
        },
        {
          day: "Day 5: Submission & Demo Prep",
          topic: "Double-check upload criteria and record a 1-minute screenshot walk-through.",
          duration: "45 mins",
          tip: "Verify file extensions and upload format. Rest well before class!"
        }
      ];
    }
  }

  simulateNoticeSummary(noticeText) {
    const textLower = noticeText.toLowerCase();
    
    // Set a date 3 days from now by default
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);
    const eventDateISO = futureDate.toISOString();

    if (textLower.includes("exam") || textLower.includes("schedule") || textLower.includes("timetable")) {
      return {
        title: "Semester End Exam Time Table Announced",
        summary: [
          "Exams commence from the upcoming fortnight. Hall tickets will be issued from the academic office starting Monday.",
          "Clear all pending library books and hostel dues before downloading the exam admit cards.",
          "Exam duration is strictly 3 hours. Standard scientific calculators are allowed, but programmable devices are barred."
        ],
        eventDate: eventDateISO,
        requiresAction: true
      };
    }

    if (textLower.includes("placement") || textLower.includes("drive") || textLower.includes("recruitment") || textLower.includes("tpo")) {
      return {
        title: "TCS / Infosys Placement Drive Circular",
        summary: [
          "Eligible students: B.Tech CSE, IT, ECE with CGPA >= 7.0 and no active backlogs.",
          "Registration link closes on the college portal on Friday at 5:00 PM sharp.",
          "Interviews will be conducted in professional attire. Prepare updated resumes (2 hard copies)."
        ],
        eventDate: eventDateISO,
        requiresAction: true
      };
    }

    // Default notice summary
    return {
      title: "Academic Notice Circular",
      summary: [
        "All B.Tech students are instructed to maintain a minimum of 75% attendance to prevent hall ticket blockage.",
        "Submit pending laboratory files to corresponding subject teachers by the end of this week.",
        "For any academic portal login issues, reach out to Room 302, Block A administrative staff."
      ],
      eventDate: eventDateISO,
      requiresAction: textLower.includes("submit") || textLower.includes("register") || textLower.includes("action")
    };
  }
}

module.exports = new AIService();
