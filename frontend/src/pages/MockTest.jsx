import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Timer, CheckCircle2, XCircle } from 'lucide-react';

const MockTest = () => {
  const subjects = ['All', 'Analog Electronics', 'Digital Electronics', 'Network Theory', 'Signals and Systems'];

  // Setup state
  const [subject, setSubject] = useState('All');
  const [numQuestions, setNumQuestions] = useState(5);
  const [phase, setPhase] = useState('setup'); // 'setup' | 'test' | 'result'

  // Test state
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({}); // { questionId: selectedOption }
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  // Result state
  const [result, setResult] = useState(null);

  const startTest = async () => {
    try {
      const res = await axios.post('/mocktests/generate', { subject, totalQuestions: numQuestions });
      setTest(res.data);
      setAnswers({});
      setCurrentIndex(0);
      // 2 minutes per question
      setTimeLeft(res.data.questions.length * 120);
      setPhase('test');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to generate test. Not enough questions?');
    }
  };

  // Timer countdown
  useEffect(() => {
    if (phase !== 'test') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (questionId, optionIndex) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitTest = async () => {
    clearInterval(timerRef.current);
    try {
      const answerArray = test.questions.map(q => ({
        questionId: q.questionId._id,
        submittedOption: answers[q.questionId._id] ?? null
      }));
      const res = await axios.post(`/mocktests/${test._id}/submit`, { answers: answerArray });
      setResult(res.data);
      setPhase('result');
    } catch (err) {
      console.error('Submit failed', err);
    }
  };

  // ---- SETUP PHASE ----
  if (phase === 'setup') {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Timer size={24} className="text-blue-600" />
          Mock Test
        </h1>
        <p className="text-slate-500 mb-8">Set up your test. You get 2 minutes per question.</p>

        <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-md">
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-1">Number of Questions</label>
            <select value={numQuestions} onChange={(e) => setNumQuestions(parseInt(e.target.value))} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
              {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n} questions</option>)}
            </select>
          </div>
          <button onClick={startTest} className="btn-primary w-full">Start Test</button>
        </div>
      </div>
    );
  }

  // ---- TEST PHASE ----
  if (phase === 'test' && test) {
    const currentQ = test.questions[currentIndex]?.questionId;
    if (!currentQ) return <p>Error loading question.</p>;

    return (
      <div>
        {/* Test Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-lg font-bold text-slate-900">Mock Test — {test.subject}</h1>
            <p className="text-sm text-slate-500">Question {currentIndex + 1} of {test.questions.length}</p>
          </div>
          <div className={`text-lg font-mono font-bold px-4 py-2 rounded-lg ${timeLeft < 60 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Question Navigation Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {test.questions.map((q, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-9 h-9 rounded-md text-sm font-medium border ${
                i === currentIndex
                  ? 'bg-blue-600 text-white border-blue-600'
                  : answers[q.questionId._id] !== undefined
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : 'bg-white text-slate-600 border-slate-300'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Current Question */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 mb-4">
          <p className="text-sm text-slate-800 font-medium mb-4">{currentQ.questionText}</p>
          <div className="space-y-2">
            {currentQ.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelectOption(currentQ._id, i)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm border transition-colors ${
                  answers[currentQ._id] === i
                    ? 'border-2 border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-blue-400'
                }`}
              >
                <span className="font-medium mr-2">{String.fromCharCode(65 + i)})</span> {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="btn-outline disabled:opacity-40"
          >
            ← Previous
          </button>
          {currentIndex === test.questions.length - 1 ? (
            <button onClick={handleSubmitTest} className="bg-green-600 text-white px-6 py-2 rounded-md font-medium hover:bg-green-700">
              Submit Test
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex(prev => Math.min(test.questions.length - 1, prev + 1))}
              className="btn-primary"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    );
  }

  // ---- RESULT PHASE ----
  if (phase === 'result' && result) {
    const percentage = Math.round((result.score / result.totalQuestions) * 100);

    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Test Results</h1>

        {/* Score Summary */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6 text-center">
          <p className="text-5xl font-bold text-slate-900 mb-2">{result.score}/{result.totalQuestions}</p>
          <p className="text-lg text-slate-500">You scored {percentage}%</p>
          <div className="w-full bg-slate-100 rounded-full h-3 mt-4 max-w-xs mx-auto">
            <div className={`h-3 rounded-full ${percentage >= 70 ? 'bg-green-500' : percentage >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${percentage}%` }}></div>
          </div>
        </div>

        {/* Question Review */}
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Question Review</h2>
        <div className="space-y-3 mb-6">
          {result.questions.map((q, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                {q.isCorrect ? <CheckCircle2 size={20} className="text-green-500 mt-0.5" /> : <XCircle size={20} className="text-red-500 mt-0.5" />}
                <div className="flex-1">
                  <p className="text-sm text-slate-800 font-medium">{q.questionId.questionText}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Your answer: {q.submittedOption !== null ? String.fromCharCode(65 + q.submittedOption) : 'Not answered'} •
                    Correct: {String.fromCharCode(65 + q.questionId.correctOption)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => { setPhase('setup'); setTest(null); setResult(null); }} className="btn-primary">
          Take Another Test
        </button>
      </div>
    );
  }

  return null;
};

export default MockTest;
