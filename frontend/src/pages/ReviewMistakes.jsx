import { useState, useEffect } from 'react';
import axios from 'axios';
import { XOctagon, RotateCcw } from 'lucide-react';

const ReviewMistakes = () => {
  const [dueReviews, setDueReviews] = useState([]);
  const [upcomingReviews, setUpcomingReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [practiceQ, setPracticeQ] = useState(null); // the question being re-attempted
  const [selectedOption, setSelectedOption] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      // Use the new Spaced Repetition endpoint
      const res = await axios.get('/practice/reviews/due');
      setDueReviews(res.data.due);
      setUpcomingReviews(res.data.upcoming);
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    } finally {
      setLoading(false);
    }
  };

  const startRetry = (q) => {
    setPracticeQ(q);
    setSelectedOption(null);
    setResult(null);
  };

  const submitRetry = async () => {
    if (selectedOption === null) return;
    try {
      const res = await axios.post('/practice/submit', {
        questionId: practiceQ._id,
        submittedOption: selectedOption
      });
      setResult(res.data);
      // If correct, remove from the list
      if (res.data.isCorrect) {
        setDueReviews(prev => prev.filter(q => q._id !== practiceQ._id));
        setUpcomingReviews(prev => prev.filter(q => q._id !== practiceQ._id));
      }
    } catch (err) {
      console.error('Retry submit failed', err);
    }
  };

  const closeRetry = () => {
    setPracticeQ(null);
    setResult(null);
    setSelectedOption(null);
  };

  // Retry overlay
  if (practiceQ) {
    return (
      <div>
        <button onClick={closeRetry} className="text-sm text-blue-600 hover:underline mb-4">← Back to mistakes list</button>
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <p className="text-sm text-slate-500 mb-1">{practiceQ.subject} — {practiceQ.topic}</p>
          <p className="text-base text-slate-800 font-medium mb-5">{practiceQ.questionText}</p>

          <div className="space-y-2 mb-4">
            {practiceQ.options.map((opt, i) => {
              let cls = 'border border-slate-200 hover:border-blue-400';
              if (result) {
                if (i === result.correctOption) cls = 'border-2 border-green-500 bg-green-50';
                else if (i === selectedOption && !result.isCorrect) cls = 'border-2 border-red-400 bg-red-50';
                else cls = 'border border-slate-200 opacity-60';
              } else if (selectedOption === i) {
                cls = 'border-2 border-blue-500 bg-blue-50';
              }
              return (
                <button key={i} disabled={!!result} onClick={() => setSelectedOption(i)} className={`w-full text-left px-4 py-3 rounded-lg text-sm ${cls}`}>
                  <span className="font-medium mr-2">{String.fromCharCode(65 + i)})</span> {opt}
                </button>
              );
            })}
          </div>

          {!result ? (
            <button onClick={submitRetry} disabled={selectedOption === null} className="btn-primary disabled:opacity-50">Submit Answer</button>
          ) : (
            <div className={`p-4 rounded-lg ${result.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className={`font-semibold text-sm mb-2 ${result.isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                {result.isCorrect ? '✓ Correct! This question has been removed from your mistakes.' : '✗ Still incorrect. Keep trying!'}
              </p>
              <p className="text-sm text-slate-700">{result.solution}</p>
              <button onClick={closeRetry} className="btn-outline mt-3 text-sm">Back to Mistakes</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const allReviews = [...dueReviews, ...upcomingReviews].sort((a, b) => new Date(a.nextReviewDate) - new Date(b.nextReviewDate));

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
        <XOctagon size={24} className="text-red-500" />
        Review Mistakes (Spaced Repetition)
      </h1>
      <p className="text-slate-500 mb-6">All your mistakes are listed here. We recommend reviewing them when they are due!</p>

      {loading ? (
        <p className="text-slate-500 py-10">Loading...</p>
      ) : allReviews.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-600 text-lg mb-2">You're all caught up!</p>
          <p className="text-sm text-slate-400">You don't have any mistakes to review right now.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {allReviews.map((q) => {
            const daysRemaining = Math.ceil((new Date(q.nextReviewDate) - new Date()) / (1000 * 60 * 60 * 24));
            const isDue = daysRemaining <= 0;
            
            return (
              <div key={q._id} className={`bg-white border border-slate-200 rounded-lg p-4 flex justify-between items-center ${!isDue ? 'opacity-80' : ''}`}>
                <div className="flex-1 pr-4">
                  <p className="text-sm text-slate-800 font-medium">{q.questionText}</p>
                  <div className="flex flex-wrap gap-2 mt-2 items-center">
                    <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">{q.subject}</span>
                    <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-100">Lvl {q.interval}</span>
                    {isDue ? (
                      <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded border border-red-100 font-medium">Due Now</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-600 rounded border border-amber-100">Due in {daysRemaining} days</span>
                    )}
                  </div>
                </div>
                <button onClick={() => startRetry(q)} className="btn-outline flex items-center gap-2 text-sm whitespace-nowrap">
                  <RotateCcw size={14} /> Review
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReviewMistakes;
