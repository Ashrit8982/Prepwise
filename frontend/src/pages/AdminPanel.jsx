import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Settings, Plus, Pencil, Trash2, Upload, X } from 'lucide-react';

const emptyForm = {
  subject: 'Analog Electronics',
  topic: '',
  difficulty: 'Medium',
  isPYQ: false,
  pyqYear: '',
  questionText: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctOption: 0,
  solution: ''
};

const AdminPanel = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [csvMsg, setCsvMsg] = useState('');
  const fileRef = useRef(null);

  const subjects = ['Analog Electronics', 'Digital Electronics', 'Network Theory', 'Signals and Systems'];

  useEffect(() => { fetchQuestions(); }, []);

  const fetchQuestions = async () => {
    try {
      const res = await axios.get('/questions');
      setQuestions(res.data);
    } catch (err) {
      console.error('Failed to fetch', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const openCreate = () => {
    setForm({ ...emptyForm });
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (q) => {
    setForm({
      subject: q.subject,
      topic: q.topic,
      difficulty: q.difficulty,
      isPYQ: q.isPYQ,
      pyqYear: q.pyqYear || '',
      questionText: q.questionText,
      optionA: q.options[0],
      optionB: q.options[1],
      optionC: q.options[2],
      optionD: q.options[3],
      correctOption: q.correctOption,
      solution: q.solution
    });
    setEditId(q._id);
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      subject: form.subject,
      topic: form.topic,
      difficulty: form.difficulty,
      isPYQ: form.isPYQ,
      pyqYear: form.isPYQ ? parseInt(form.pyqYear) : undefined,
      questionText: form.questionText,
      options: [form.optionA, form.optionB, form.optionC, form.optionD],
      correctOption: parseInt(form.correctOption),
      solution: form.solution
    };

    try {
      if (editId) {
        await axios.put(`/questions/${editId}`, payload);
      } else {
        await axios.post('/questions', payload);
      }
      setShowForm(false);
      fetchQuestions();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save question');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await axios.delete(`/questions/${id}`);
      setQuestions(prev => prev.filter(q => q._id !== id));
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const handleCsvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCsvMsg('Uploading...');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('/questions/upload-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setCsvMsg(res.data.message);
      fetchQuestions();
    } catch (err) {
      setCsvMsg(err.response?.data?.error || 'CSV upload failed');
    }
    e.target.value = '';
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
        <Settings size={24} className="text-blue-600" />
        Admin Panel
      </h1>
      <p className="text-slate-500 mb-6">Manage the question bank. Add, edit, delete, or upload questions via CSV.</p>

      {/* CSV Upload */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <p className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><Upload size={16} /> Bulk Upload (CSV)</p>
        <p className="text-xs text-slate-500 mb-3">CSV format: subject, topic, difficulty, isPYQ, pyqYear, questionText, optionA, optionB, optionC, optionD, correctOption (A/B/C/D), solution</p>
        <input type="file" accept=".csv" ref={fileRef} onChange={handleCsvUpload} className="hidden" />
        <button onClick={() => fileRef.current?.click()} className="btn-primary text-sm flex items-center gap-2"><Upload size={14} /> Upload CSV File</button>
        {csvMsg && <p className="text-sm text-green-700 mt-2">{csvMsg}</p>}
      </div>

      {/* Add button */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-slate-500">{questions.length} questions in database</p>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Question
        </button>
      </div>

      {/* Question Form (Modal-style inline) */}
      {showForm && (
        <div className="bg-white border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-900">{editId ? 'Edit Question' : 'Add New Question'}</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Subject</label>
                <select name="subject" value={form.subject} onChange={handleChange} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm">
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Topic</label>
                <input type="text" name="topic" value={form.topic} onChange={handleChange} required className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Difficulty</label>
                <select name="difficulty" value={form.difficulty} onChange={handleChange} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm">
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Question</label>
              <textarea name="questionText" value={form.questionText} onChange={handleChange} required rows={3} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" name="optionA" placeholder="Option A" value={form.optionA} onChange={handleChange} required className="border border-slate-300 rounded-md px-3 py-2 text-sm" />
              <input type="text" name="optionB" placeholder="Option B" value={form.optionB} onChange={handleChange} required className="border border-slate-300 rounded-md px-3 py-2 text-sm" />
              <input type="text" name="optionC" placeholder="Option C" value={form.optionC} onChange={handleChange} required className="border border-slate-300 rounded-md px-3 py-2 text-sm" />
              <input type="text" name="optionD" placeholder="Option D" value={form.optionD} onChange={handleChange} required className="border border-slate-300 rounded-md px-3 py-2 text-sm" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Correct Option</label>
                <select name="correctOption" value={form.correctOption} onChange={handleChange} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm">
                  <option value={0}>A</option>
                  <option value={1}>B</option>
                  <option value={2}>C</option>
                  <option value={3}>D</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" name="isPYQ" checked={form.isPYQ} onChange={handleChange} className="h-4 w-4" />
                <label className="text-sm text-slate-700">Previous Year Question</label>
              </div>
              {form.isPYQ && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Year</label>
                  <input type="number" name="pyqYear" value={form.pyqYear} onChange={handleChange} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Solution</label>
              <textarea name="solution" value={form.solution} onChange={handleChange} required rows={3} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
            </div>

            <button type="submit" className="btn-primary">{editId ? 'Update Question' : 'Add Question'}</button>
          </form>
        </div>
      )}

      {/* Questions Table */}
      {loading ? (
        <p className="text-slate-500 py-10">Loading...</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 bg-slate-50 border-b border-slate-200">
                <th className="p-3 font-medium">Question</th>
                <th className="p-3 font-medium">Subject</th>
                <th className="p-3 font-medium">Difficulty</th>
                <th className="p-3 font-medium w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q._id} className="border-b border-slate-100">
                  <td className="p-3 text-slate-700 max-w-sm truncate">{q.questionText}</td>
                  <td className="p-3 text-slate-600">{q.subject}</td>
                  <td className="p-3 text-slate-600">{q.difficulty}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(q)} className="text-slate-400 hover:text-blue-600"><Pencil size={15} /></button>
                      <button onClick={() => handleDelete(q._id)} className="text-slate-400 hover:text-red-500"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
