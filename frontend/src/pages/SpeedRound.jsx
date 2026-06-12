import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Zap, Timer as TimerIcon, RefreshCw, ChevronRight } from 'lucide-react';

const SpeedRound = () => {
  const subjects = ['All', 'Analog Electronics', 'Digital Electronics', 'Network Theory', 'Signals and Systems'];
  const TIME_PER_QUESTION = 30; // seconds

  const [selectedSubject, setSelectedSubject] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [status, setStatus] = useState('setup'); // setup, playing, finished
  const [loading, setLoading] = useState(false);
  
  // Track selected option for visual feedback before auto-advancing
  const [selectedOption, setSelectedOption] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const startRound = async (subj) => {
    setSelectedSubject(subj);
    setLoading(true);
    try {
      const res = await axios.get('/practice/speed-round', { 
        params: { subject: subj, count: 10 } 
      });
      setQuestions(res.data);
      setCurrentIndex(0);
      setScore(0);
      setTimeLeft(TIME_PER_QUESTION);
      setStatus('playing');
    } catch (err) {
      console.error('Failed to start speed round', err);
      alert('Could not start speed round');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = useCallback(() => {
    setShowAnswer(false);
    setSelectedOption(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setTimeLeft(TIME_PER_QUESTION);
    } else {
      setStatus('finished');
    }
  }, [currentIndex, questions.length]);

  const handleAnswer = (optionIndex) => {
    if (showAnswer) return; // Prevent double clicks
    
    setSelectedOption(optionIndex);
    setShowAnswer(true);
    
    const isCorrect = optionIndex === questions[currentIndex].correctOption;
    if (isCorrect) setScore(s => s + 1);

    // Wait a brief moment to show green/red feedback, then advance
    setTimeout(() => {
      handleNext();
    }, 1000);
  };

  useEffect(() => {
    let timer;
    if (status === 'playing' && !showAnswer) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Time's up! Show correct answer, then advance
            setShowAnswer(true);
            setTimeout(() => handleNext(), 1500);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [status, showAnswer, handleNext]);

  if (status === 'setup') {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Zap size={28} className="text-amber-500" />
          Speed Round
        </h1>
        <p className="text-slate-500 mb-8">
          10 random questions. 30 seconds per question. Test your reflexes and quick recall!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {subjects.map((subj) => (
            <button
              key={subj}
              onClick={() => startRound(subj)}
              disabled={loading}
              className="bg-white border border-slate-200 rounded-lg p-6 text-left hover:border-amber-400 hover:bg-amber-50 transition-colors disabled:opacity-50"
            >
              <p className="text-lg font-semibold text-slate-800">{subj}</p>
              <p className="text-sm text-slate-500 mt-1">Start 10-question sprint</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (status === 'finished') {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-6">
          <Zap size={40} className="text-amber-500" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Sprint Complete!</h2>
        <p className="text-xl text-slate-600 mb-8">You scored {score} out of {questions.length}</p>
        
        <button onClick={() => setStatus('setup')} className="btn-primary inline-flex items-center gap-2">
          <RefreshCw size={18} /> Play Again
        </button>
      </div>
    );
  }

  const question = questions[currentIndex];
  if (!question) return null;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header Info */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Question {currentIndex + 1} of {questions.length}
          </p>
          <p className="text-sm text-slate-600 font-medium">{question.subject}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Score</p>
            <p className="text-lg font-bold text-slate-900">{score}</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xl font-bold ${
            timeLeft <= 5 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-700'
          }`}>
            <TimerIcon size={20} />
            00:{timeLeft.toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Timer Progress Bar */}
      <div className="w-full bg-slate-200 h-2 rounded-full mb-6 overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 linear ${timeLeft <= 5 ? 'bg-red-500' : 'bg-amber-500'}`}
          style={{ width: `${(timeLeft / TIME_PER_QUESTION) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6">
        <p className="text-lg text-slate-900 font-medium mb-6">{question.questionText}</p>

        <div className="space-y-3">
          {question.options.map((opt, i) => {
            let btnClass = 'border-slate-200 hover:border-amber-400 bg-white';
            
            if (showAnswer) {
              if (i === question.correctOption) {
                btnClass = 'border-green-500 bg-green-50 text-green-900 shadow-[0_0_0_2px_rgba(34,197,94,0.3)]';
              } else if (i === selectedOption) {
                btnClass = 'border-red-500 bg-red-50 text-red-900';
              } else {
                btnClass = 'border-slate-200 opacity-50';
              }
            } else if (selectedOption === i) {
              btnClass = 'border-amber-500 bg-amber-50';
            }

            return (
              <button
                key={i}
                disabled={showAnswer}
                onClick={() => handleAnswer(i)}
                className={`w-full text-left px-5 py-4 rounded-lg border-2 transition-all ${btnClass}`}
              >
                <span className="font-bold mr-3">{String.fromCharCode(65 + i)})</span>
                {opt}
              </button>
            );
          })}
        </div>
      </div>
      
      {showAnswer && (
        <div className="flex justify-end">
          <button 
            onClick={handleNext} 
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800"
          >
            Skip delay <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default SpeedRound;
