import { useState, useEffect } from 'react';
import axios from 'axios';
import { BrainCircuit, Lightbulb, BookOpen, Sparkles, Bookmark, Loader2, Play, Pause, Square, Timer } from 'lucide-react';

const PracticeMode = () => {
  const subjects = ['Analog Electronics', 'Digital Electronics', 'Network Theory', 'Signals and Systems'];

  const [selectedSubject, setSelectedSubject] = useState('');
  const [question, setQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [result, setResult] = useState(null); // { isCorrect, correctOption, solution }
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  // Pomodoro State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      logStudyTime(25);
      alert('Pomodoro complete! 25 minutes logged.');
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const toggleTimer = () => setTimerActive(!timerActive);
  const stopTimer = () => {
    setTimerActive(false);
    const minutesStudied = 25 - Math.floor(timeLeft / 60);
    if (minutesStudied > 0) {
      logStudyTime(minutesStudied);
      alert(`Stopped early. Logged ${minutesStudied} minutes.`);
    }
    setTimeLeft(25 * 60);
  };

  const logStudyTime = async (minutes) => {
    try {
      await axios.post('/practice/study-time', { minutes });
    } catch (err) {
      console.error('Failed to log study time', err);
    }
  };

  const fetchNextQuestion = async (subj) => {
    setLoading(true);
    setResult(null);
    setSelectedOption(null);
    setAiResponse('');
    try {
      const params = {};
      if (subj || selectedSubject) params.subject = subj || selectedSubject;
      const res = await axios.get('/practice/next', { params });
      
      // If no more questions, the API returns { message: '...' }
      if (res.data.message) {
        setQuestion(null);
        alert(res.data.message);
      } else {
        setQuestion(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch question', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = (subj) => {
    setSelectedSubject(subj);
    setScore({ correct: 0, total: 0 });
    fetchNextQuestion(subj);
  };

  const handleSubmit = async () => {
    if (selectedOption === null) return;
    try {
      const res = await axios.post('/practice/submit', {
        questionId: question._id,
        submittedOption: selectedOption
      });
      setResult(res.data);
      setScore(prev => ({
        correct: prev.correct + (res.data.isCorrect ? 1 : 0),
        total: prev.total + 1
      }));
    } catch (err) {
      console.error('Submit failed', err);
    }
  };

  const handleAI = async (type) => {
    setAiLoading(true);
    setAiResponse('');
    try {
      const endpoint = type === 'hint' ? '/ai/hint' : type === 'simplify' ? '/ai/simplify' : '/ai/explain';
      const res = await axios.post(endpoint, { questionId: question._id });
      setAiResponse(res.data.explanation || res.data.hint);
    } catch (err) {
      console.error("AI Error:", err);
      setAiResponse(`Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const handleBookmark = async () => {
    try {
      const res = await axios.post(`/practice/bookmark/${question._id}`);
      alert(res.data.message);
    } catch (err) {
      console.error('Bookmark failed', err);
    }
  };

  // Subject selection screen
  if (!selectedSubject) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
          <BrainCircuit size={24} className="text-blue-600" />
          Practice Mode
        </h1>
        <p className="text-slate-500 mb-8">Pick a subject to start practicing. Questions appear one at a time.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {subjects.map((subj) => (
            <button
              key={subj}
              onClick={() => handleStart(subj)}
              className="bg-white border border-slate-200 rounded-lg p-6 text-left hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <p className="text-lg font-semibold text-slate-800">{subj}</p>
              <p className="text-sm text-slate-500 mt-1">Start practicing questions</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) return <p className="text-slate-500 py-10">Loading question...</p>;

  // No question available
  if (!question) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-600 text-lg mb-4">No more unsolved questions in {selectedSubject}!</p>
        <p className="text-sm text-slate-500 mb-6">Score: {score.correct}/{score.total}</p>
        <button onClick={() => setSelectedSubject('')} className="btn-primary">Choose Another Subject</button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Practice: {selectedSubject}</h1>
          <p className="text-sm text-slate-500">{question.topic} • {question.difficulty}</p>
        </div>
        
        {/* Pomodoro Timer */}
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-slate-200">
          <Timer size={18} className="text-purple-500" />
          <span className="font-mono font-medium text-slate-700 w-12">
            {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:
            {(timeLeft % 60).toString().padStart(2, '0')}
          </span>
          <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
            <button onClick={toggleTimer} className="p-1 hover:bg-slate-100 rounded text-slate-600">
              {timerActive ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button onClick={stopTimer} disabled={timeLeft === 25 * 60 && !timerActive} className="p-1 hover:bg-slate-100 rounded text-slate-600 disabled:opacity-50">
              <Square size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-600">Score: {score.correct}/{score.total}</span>
          <button onClick={() => setSelectedSubject('')} className="text-sm text-blue-600 hover:underline">Change Subject</button>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 mb-4">
        <p className="text-base text-slate-800 font-medium mb-5">{question.questionText}</p>

        <div className="space-y-2">
          {question.options.map((opt, i) => {
            let optionClass = 'border border-slate-200 hover:border-blue-400';
            
            if (result) {
              // After submission, highlight correct and wrong
              if (i === result.correctOption) optionClass = 'border-2 border-green-500 bg-green-50';
              else if (i === selectedOption && !result.isCorrect) optionClass = 'border-2 border-red-400 bg-red-50';
              else optionClass = 'border border-slate-200 opacity-60';
            } else if (selectedOption === i) {
              optionClass = 'border-2 border-blue-500 bg-blue-50';
            }

            return (
              <button
                key={i}
                disabled={!!result}
                onClick={() => setSelectedOption(i)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors ${optionClass}`}
              >
                <span className="font-medium mr-2">{String.fromCharCode(65 + i)})</span>
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-4">
        {!result ? (
          <button onClick={handleSubmit} disabled={selectedOption === null} className="btn-primary disabled:opacity-50">
            Submit Answer
          </button>
        ) : (
          <button onClick={() => fetchNextQuestion()} className="btn-primary">
            Next Question →
          </button>
        )}
        <button onClick={handleBookmark} className="btn-outline flex items-center gap-2">
          <Bookmark size={16} /> Bookmark
        </button>
      </div>

      {/* Result feedback */}
      {result && (
        <div className={`p-4 rounded-lg mb-4 ${result.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <p className={`font-semibold text-sm ${result.isCorrect ? 'text-green-800' : 'text-red-800'}`}>
            {result.isCorrect ? '✓ Correct!' : '✗ Incorrect'}
          </p>
          <div className="mt-2 text-sm text-slate-700">
            <p className="font-medium text-slate-600 mb-1">Solution:</p>
            <p>{result.solution}</p>
          </div>
        </div>
      )}

      {/* AI Assistance (only after submitting) */}
      {result && (
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-slate-700 mb-3">Need more help understanding this?</p>
          <div className="flex flex-wrap gap-2 mb-4">
            <button onClick={() => handleAI('explain')} disabled={aiLoading} className="btn-outline flex items-center gap-2 text-sm">
              <BookOpen size={14} /> Explain Step-by-Step
            </button>
            <button onClick={() => handleAI('simplify')} disabled={aiLoading} className="btn-outline flex items-center gap-2 text-sm">
              <Lightbulb size={14} /> Simplify
            </button>
            <button onClick={() => handleAI('hint')} disabled={aiLoading} className="btn-outline flex items-center gap-2 text-sm">
              <Sparkles size={14} /> Give a Hint
            </button>
          </div>
          {aiLoading && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 size={16} className="animate-spin" /> Generating response...
            </div>
          )}
          {aiResponse && (
            <div className="bg-slate-50 p-4 rounded-md text-sm text-slate-700 whitespace-pre-wrap">
              {aiResponse}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PracticeMode;
