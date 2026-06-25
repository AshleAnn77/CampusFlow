import React, { useState } from 'react';
import axios from 'axios';
import { 
  BookOpen, 
  Sparkles, 
  BookOpenCheck,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Award
} from 'lucide-react';

export default function StudyBuddy({ student }) {
  const [subject, setSubject] = useState(student.subjects[0] || 'General');
  const [notesTitle, setNotesTitle] = useState('');
  const [lectureNotes, setLectureNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Generated Materials State
  const [flashcards, setFlashcards] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('flashcards');

  // Interactive Flashcards State
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz Scoring State
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submittedQuiz, setSubmittedQuiz] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!lectureNotes.trim()) {
      setError('Please paste some lecture notes or study material first!');
      return;
    }

    setLoading(true);
    setError('');
    setFlashcards(null);
    setQuiz(null);
    setSelectedAnswers({});
    setSubmittedQuiz(false);
    setCurrentCardIndex(0);
    setIsFlipped(false);

    try {
      const res = await axios.post('/api/ai/study-buddy', {
        studentId: student.id,
        subject,
        notesTitle: notesTitle || 'Lecture Notes Revision',
        lectureNotes
      });

      setFlashcards(res.data.flashcards);
      setQuiz(res.data.quiz);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'AI Generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex(prev => Math.max(0, prev - 1));
    }, 150);
  };

  const handleNextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex(prev => Math.min(flashcards.length - 1, prev + 1));
    }, 150);
  };

  const handleOptionSelect = (qIdx, option) => {
    if (submittedQuiz) return;
    setSelectedAnswers({ ...selectedAnswers, [qIdx]: option });
  };

  const calculateScore = () => {
    let score = 0;
    quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        score++;
      }
    });
    return score;
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-12">
      
      {/* Top Heading */}
      <div>
        <span className="text-xs font-bold text-primary-900 uppercase tracking-widest font-sans">
          AI Study Buddy Module
        </span>
        <h1 className="text-3xl font-extrabold font-serif text-primary-900">
          Tutor Deck & Quiz Generator
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Paste your B.Tech lecture notes and let AI instantly compile revision flashcards and a practice multiple-choice quiz.
        </p>
      </div>

      {!flashcards && !quiz ? (
        /* Input Form Screen */
        <div className="retro-card p-6 sm:p-8 relative">
          <form onSubmit={handleGenerate} className="space-y-5">
            {error && (
              <div className="p-3 bg-accent-redLight border-2 border-primary-900 rounded-xl text-xs font-semibold text-red-900">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Select Subject
                </label>
                <select
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full bg-background border-2 border-primary-900 focus:outline-none rounded-xl px-4 py-2.5 text-xs text-primary-900"
                >
                  {student.subjects.map((sub, i) => (
                    <option key={i} value={sub}>{sub}</option>
                  ))}
                  <option value="General Engineering">General Engineering</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Notes Title / Topic
                </label>
                <input
                  type="text"
                  placeholder="e.g. OS Semaphores, DBMS Normalization"
                  value={notesTitle}
                  onChange={e => setNotesTitle(e.target.value)}
                  className="w-full bg-background border-2 border-primary-900 focus:outline-none rounded-xl px-4 py-2.5 text-xs text-primary-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Paste Lecture Notes / Reference Text
              </label>
              <textarea
                required
                rows={8}
                placeholder="Paste code blocks, slides text, definitions, or syllabus contents here. For example: 
Semaphores are synchronization tools. A semaphore S is an integer variable that, apart from initialization, is accessed only through two standard atomic operations: wait() and signal(). wait() decrements S, while signal() increments S..."
                value={lectureNotes}
                onChange={e => setLectureNotes(e.target.value)}
                className="w-full bg-background border-2 border-primary-900 focus:outline-none rounded-xl px-4 py-3 text-xs text-primary-900 font-sans leading-relaxed"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-retro py-3 text-xs"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-900 border-t-transparent rounded-full animate-spin"></div>
                  <span>AI compiles study materials...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4.5 h-4.5" />
                  <span>Generate Flashcards & MCQ Quiz</span>
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* Materials Results View */
        <div className="space-y-6">
          
          {/* Sub Navigation Tabs */}
          <div className="flex bg-white border-2 border-primary-900 p-1.5 rounded-2xl max-w-sm">
            <button
              onClick={() => setActiveSubTab('flashcards')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'flashcards'
                  ? 'bg-accent-yellow text-primary-900 border border-primary-900/20 shadow-retro-sm'
                  : 'text-slate-500 hover:text-primary-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Flashcards ({flashcards?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('quiz')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'quiz'
                  ? 'bg-accent-yellow text-primary-900 border border-primary-900/20 shadow-retro-sm'
                  : 'text-slate-500 hover:text-primary-900'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Practice MCQ Quiz</span>
            </button>
          </div>

          {/* Flashcards View */}
          {activeSubTab === 'flashcards' && flashcards && (
            <div className="space-y-6">
              
              {/* Interactive Flip Card Container */}
              <div 
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full max-w-lg mx-auto aspect-[1.6/1] cursor-pointer flip-card"
              >
                <div className={`w-full h-full relative flip-card-inner rounded-3xl ${isFlipped ? 'flipped' : ''}`}>
                  
                  {/* Card Front (Question) */}
                  <div className="absolute inset-0 w-full h-full p-8 rounded-3xl retro-card bg-accent-yellowLight flex flex-col justify-between items-center text-center flip-card-front">
                    <div className="w-full flex justify-between items-center text-[10px] text-primary-900 font-bold uppercase tracking-wider">
                      <span>Concept Question</span>
                      <span>Card {currentCardIndex + 1} of {flashcards.length}</span>
                    </div>
                    
                    <h3 className="text-base sm:text-lg font-bold font-serif text-primary-900 max-w-md my-auto leading-relaxed">
                      {flashcards[currentCardIndex].question}
                    </h3>
                    
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-650 font-bold uppercase tracking-wider">
                      <RotateCw className="w-3.5 h-3.5 text-primary-900 animate-spin" style={{ animationDuration: '3s' }} />
                      <span>Click to flip and reveal answer</span>
                    </div>
                  </div>

                  {/* Card Back (Answer) */}
                  <div className="absolute inset-0 w-full h-full p-8 rounded-3xl bg-white border-2 border-primary-900 shadow-retro flex flex-col justify-between items-center text-center flip-card-back">
                    <div className="w-full flex justify-between items-center text-[10px] text-green-800 font-bold uppercase tracking-wider">
                      <span>Explanatory Answer</span>
                      <span>Card {currentCardIndex + 1} of {flashcards.length}</span>
                    </div>
                    
                    <p className="text-xs sm:text-sm text-slate-700 max-w-md my-auto leading-relaxed select-text font-medium">
                      {flashcards[currentCardIndex].answer}
                    </p>
                    
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      <RotateCw className="w-3.5 h-3.5 text-primary-900" />
                      <span>Click to flip back to question</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handlePrevCard}
                  disabled={currentCardIndex === 0}
                  className="p-2.5 bg-white border-2 border-primary-900 hover:bg-slate-50 rounded-xl text-primary-900 disabled:opacity-30 disabled:pointer-events-none shadow-retro-sm active:translate-y-0.5 active:shadow-none transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-xs font-bold text-primary-900">
                  {currentCardIndex + 1} / {flashcards.length}
                </span>
                <button
                  onClick={handleNextCard}
                  disabled={currentCardIndex === flashcards.length - 1}
                  className="p-2.5 bg-white border-2 border-primary-900 hover:bg-slate-50 rounded-xl text-primary-900 disabled:opacity-30 disabled:pointer-events-none shadow-retro-sm active:translate-y-0.5 active:shadow-none transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

            </div>
          )}

          {/* Practice MCQ Quiz View */}
          {activeSubTab === 'quiz' && quiz && (
            <div className="space-y-6">
              
              <div className="space-y-5">
                {quiz.map((q, qIdx) => {
                  const selectedOpt = selectedAnswers[qIdx];
                  
                  return (
                    <div key={qIdx} className="retro-card p-5 space-y-3">
                      <h3 className="text-xs font-bold text-primary-900 leading-normal flex items-start gap-2">
                        <span className="w-5 h-5 rounded border border-primary-900 bg-accent-yellowLight text-primary-900 flex items-center justify-center shrink-0 text-[10px] font-bold">
                          Q{qIdx + 1}
                        </span>
                        <span>{q.question}</span>
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, oIdx) => {
                          const isSelected = selectedOpt === opt;
                          const isCorrect = opt === q.correctAnswer;
                          
                          let cardStyle = "border-slate-300 hover:border-primary-900 bg-background text-slate-700";
                          if (submittedQuiz) {
                            if (isCorrect) {
                              cardStyle = "border-green-600 bg-accent-greenLight text-green-950 font-bold";
                            } else if (isSelected) {
                              cardStyle = "border-red-600 bg-accent-redLight text-red-950";
                            }
                          } else if (isSelected) {
                            cardStyle = "border-primary-900 bg-accent-blueLight text-primary-900 font-bold";
                          }

                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleOptionSelect(qIdx, opt)}
                              disabled={submittedQuiz}
                              className={`p-3 rounded-xl border-2 text-left text-xs transition-all flex items-center gap-2.5 ${cardStyle}`}
                            >
                              <span className="w-4.5 h-4.5 rounded-full border border-primary-900 flex items-center justify-center text-[9px] shrink-0 font-bold bg-white">
                                {oIdx === 0 ? 'A' : oIdx === 1 ? 'B' : oIdx === 2 ? 'C' : 'D'}
                              </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Submit / Results footer */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 bg-white border-2 border-primary-900 rounded-2xl">
                {!submittedQuiz ? (
                  <>
                    <p className="text-[11px] font-bold text-slate-500">
                      Answer all 4 questions to grade your answers.
                    </p>
                    <button
                      onClick={() => setSubmittedQuiz(true)}
                      disabled={Object.keys(selectedAnswers).length < quiz.length}
                      className="btn-retro py-2 px-5 text-xs"
                    >
                      <BookOpenCheck className="w-4 h-4" />
                      <span>Grade Quiz Answers</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-accent-yellow border border-primary-900 rounded-xl text-primary-900 font-extrabold font-serif">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-primary-900 font-serif">Grading Complete!</h4>
                        <p className="text-xs text-indigo-900 font-medium">
                          Score: <strong>{calculateScore()} / {quiz.length}</strong> ({Math.round(calculateScore()/quiz.length * 100)}%)
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedAnswers({});
                        setSubmittedQuiz(false);
                      }}
                      className="btn-retro-secondary py-2 px-4 text-xs"
                    >
                      Retry Quiz
                    </button>
                  </>
                )}
              </div>

            </div>
          )}

          {/* Reset Action */}
          <div className="flex justify-end pt-4">
            <button
              onClick={() => {
                setFlashcards(null);
                setQuiz(null);
              }}
              className="text-xs font-bold text-primary-900 underline"
            >
              Paste different lecture notes
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
