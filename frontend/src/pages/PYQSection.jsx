import { useState, useEffect } from 'react';
import axios from 'axios';
import { History, CheckCircle2 } from 'lucide-react';

const PYQSection = () => {
  const [pyqs, setPyqs] = useState([]);
  const [solvedIds, setSolvedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [pyqYear, setPyqYear] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const subjects = ['Analog Electronics', 'Digital Electronics', 'Network Theory', 'Signals and Systems'];
  const years = [2018, 2019, 2020, 2021, 2022, 2023];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = {};
        if (subject) params.subject = subject;
        if (pyqYear) params.pyqYear = pyqYear;

        const [pyqRes, userRes] = await Promise.all([
          axios.get('/questions/pyqs', { params }),
          axios.get('/auth/me')
        ]);
        setPyqs(pyqRes.data);
        setSolvedIds(userRes.data.solvedPYQs || []);
      } catch (err) {
        console.error('Failed to fetch PYQs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [subject, pyqYear]);

  const isSolved = (id) => solvedIds.includes(id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
        <History size={24} className="text-blue-600" />
        Previous Year Questions
      </h1>
      <p className="text-slate-500 mb-6">Practice questions from past exams. Solved questions are marked with a checkmark.</p>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={subject} onChange={(e) => setSubject(e.target.value)} className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
          <option value="">All Subjects</option>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={pyqYear} onChange={(e) => setPyqYear(e.target.value)} className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
          <option value="">All Years</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="text-slate-500 py-10">Loading PYQs...</p>
      ) : pyqs.length === 0 ? (
        <p className="text-slate-500 py-10">No PYQs found for the selected filters.</p>
      ) : (
        <div className="space-y-3">
          {pyqs.map((q) => (
            <div key={q._id} className={`bg-white border rounded-lg overflow-hidden ${isSolved(q._id) ? 'border-green-300' : 'border-slate-200'}`}>
              <div className="p-4 cursor-pointer flex justify-between items-start" onClick={() => setExpandedId(expandedId === q._id ? null : q._id)}>
                <div className="flex-1 pr-4">
                  <p className="text-sm text-slate-800 font-medium">{q.questionText}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">PYQ {q.pyqYear}</span>
                    <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">{q.subject}</span>
                    <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">{q.topic}</span>
                  </div>
                </div>
                {isSolved(q._id) && <CheckCircle2 size={20} className="text-green-500 mt-1" />}
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

export default PYQSection;
