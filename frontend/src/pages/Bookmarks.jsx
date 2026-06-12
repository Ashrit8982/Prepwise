import { useState, useEffect } from 'react';
import axios from 'axios';
import { BookmarkCheck, Trash2 } from 'lucide-react';

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const res = await axios.get('/practice/bookmarks');
        setBookmarks(res.data);
      } catch (err) {
        console.error('Failed to fetch bookmarks', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, []);

  const removeBookmark = async (id) => {
    try {
      await axios.post(`/practice/bookmark/${id}`);
      setBookmarks(prev => prev.filter(q => q._id !== id));
    } catch (err) {
      console.error('Failed to remove bookmark', err);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
        <BookmarkCheck size={24} className="text-blue-600" />
        Bookmarked Questions
      </h1>
      <p className="text-slate-500 mb-6">Your saved questions for quick revision.</p>

      {loading ? (
        <p className="text-slate-500 py-10">Loading bookmarks...</p>
      ) : bookmarks.length === 0 ? (
        <p className="text-slate-500 py-10">You haven't bookmarked any questions yet. Use the bookmark button while practicing or browsing the question bank.</p>
      ) : (
        <div className="space-y-3">
          {bookmarks.map((q) => (
            <div key={q._id} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="p-4 cursor-pointer flex justify-between items-start" onClick={() => setExpandedId(expandedId === q._id ? null : q._id)}>
                <div className="flex-1 pr-4">
                  <p className="text-sm text-slate-800 font-medium">{q.questionText}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">{q.subject}</span>
                    <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">{q.topic}</span>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); removeBookmark(q._id); }} className="p-1 text-slate-400 hover:text-red-500" title="Remove bookmark">
                  <Trash2 size={16} />
                </button>
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

export default Bookmarks;
