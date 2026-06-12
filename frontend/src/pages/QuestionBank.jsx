import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, ChevronDown, ChevronUp, Bookmark } from 'lucide-react';

const QuestionBank = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  // Filter state
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [isPYQ, setIsPYQ] = useState('');

  const subjects = ['Analog Electronics', 'Digital Electronics', 'Network Theory', 'Signals and Systems'];
  const difficulties = ['Easy', 'Medium', 'Hard'];

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (subject) params.subject = subject;
      if (difficulty) params.difficulty = difficulty;
      if (isPYQ) params.isPYQ = isPYQ;

      const res = await axios.get('/questions', { params });
      setQuestions(res.data);
    } catch (err) {
      console.error('Failed to fetch questions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [subject, difficulty, isPYQ]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchQuestions();
  };

  const toggleBookmark = async (questionId) => {
    try {
      await axios.post(`/practice/bookmark/${questionId}`);
    } catch (err) {
      console.error('Bookmark failed', err);
    }
  };

  const difficultyColor = (d) => {
    if (d === 'Easy') return 'bg-green-100 text-green-700';
    if (d === 'Medium') return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Question Bank</h1>
      <p className="text-slate-500 mb-6">Browse, search, and filter all questions.</p>

      {/* Search and Filters */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button type="submit" className="btn-primary text-sm">Search</button>
        </form>

        <div className="flex flex-wrap gap-3 items-center">
          <Filter size={16} className="text-slate-400" />
          <select value={subject} onChange={(e) => setSubject(e.target.value)} className="border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">All Difficulties</option>
            {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={isPYQ} onChange={(e) => setIsPYQ(e.target.value)} className="border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">All Types</option>
            <option value="true">PYQ Only</option>
            <option value="false">Non-PYQ</option>
          </select>
          {(subject || difficulty || isPYQ) && (
            <button onClick={() => { setSubject(''); setDifficulty(''); setIsPYQ(''); }} className="text-sm text-blue-600 hover:underline">
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <p className="text-slate-500 py-10">Loading questions...</p>
      ) : questions.length === 0 ? (
        <p className="text-slate-500 py-10">No questions found matching your filters.</p>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <div key={q._id} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div
                className="p-4 cursor-pointer flex justify-between items-start"
                onClick={() => setExpandedId(expandedId === q._id ? null : q._id)}
              >
                <div className="flex-1 pr-4">
                  <p className="text-sm text-slate-800 font-medium">{q.questionText}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">{q.subject}</span>
                    <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">{q.topic}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${difficultyColor(q.difficulty)}`}>{q.difficulty}</span>
                    {q.isPYQ && <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">PYQ {q.pyqYear}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); toggleBookmark(q._id); }} className="p-1 text-slate-400 hover:text-blue-600">
                    <Bookmark size={16} />
                  </button>
                  {expandedId === q._id ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                </div>
              </div>

              {expandedId === q._id && (
                <div className="px-4 pb-4 border-t border-slate-100 pt-3">
                  <div className="space-y-1 mb-3">
                    {q.options.map((opt, i) => (
                      <p key={i} className={`text-sm px-3 py-1.5 rounded ${i === q.correctOption ? 'bg-green-50 text-green-800 font-medium' : 'text-slate-600'}`}>
                        {String.fromCharCode(65 + i)}) {opt}
                      </p>
                    ))}
                  </div>
                  <div className="bg-slate-50 p-3 rounded-md">
                    <p className="text-xs font-semibold text-slate-500 mb-1">Solution</p>
                    <p className="text-sm text-slate-700">{q.solution}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionBank;
