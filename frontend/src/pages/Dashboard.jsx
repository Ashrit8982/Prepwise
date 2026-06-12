import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BarChart3, Target, BookOpen, Trophy } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/dashboard/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <p className="text-slate-500 py-10">Loading your stats...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome back, {user?.username}</h1>
      <p className="text-slate-500 mb-8">Here's your preparation overview.</p>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={18} className="text-blue-600" />
            <span className="text-sm font-medium text-slate-500">Solved</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats?.totalSolved || 0}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-2">
            <Target size={18} className="text-green-600" />
            <span className="text-sm font-medium text-slate-500">Accuracy</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats?.accuracy || 0}%</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={18} className="text-amber-500" />
            <span className="text-sm font-medium text-slate-500">Tests</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats?.recentTests?.length || 0}</p>
        </div>
        {/* New Feature: Study Time */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span className="text-sm font-medium text-slate-500">Study Time</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {stats?.totalStudyMinutes ? `${Math.floor(stats.totalStudyMinutes / 60)}h ${stats.totalStudyMinutes % 60}m` : '0m'}
          </p>
        </div>
        {/* New Feature: Pending Reviews */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            <span className="text-sm font-medium text-slate-500">Reviews Due</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats?.pendingReviews || 0}</p>
        </div>
      </div>

      {/* Two-column layout for topics and test history */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strong Topics */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-green-600" />
            Strong Topics
          </h2>
          {stats?.strongTopics?.length > 0 ? (
            <ul className="space-y-3">
              {stats.strongTopics.map((t, i) => (
                <li key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700">{t.topic}</span>
                    <span className="font-medium text-green-700">{Math.round(t.accuracy)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.round(t.accuracy)}%` }}></div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">Solve some questions to see your strong topics.</p>
          )}
        </div>

        {/* Weak Topics */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-red-500" />
            Weak Topics
          </h2>
          {stats?.weakTopics?.length > 0 ? (
            <ul className="space-y-3">
              {stats.weakTopics.map((t, i) => (
                <li key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700">{t.topic}</span>
                    <span className="font-medium text-red-600">{Math.round(t.accuracy)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-red-400 h-2 rounded-full" style={{ width: `${Math.round(t.accuracy)}%` }}></div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">Solve some questions to identify weak areas.</p>
          )}
        </div>
      </div>

      {/* Recent Mock Tests */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 mt-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Mock Tests</h2>
        {stats?.recentTests?.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="pb-3 font-medium">Subject</th>
                <th className="pb-3 font-medium">Score</th>
                <th className="pb-3 font-medium">Total</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentTests.map((test) => (
                <tr key={test._id} className="border-b border-slate-100">
                  <td className="py-3 text-slate-700">{test.subject}</td>
                  <td className="py-3 font-medium text-slate-900">{test.score}</td>
                  <td className="py-3 text-slate-500">{test.totalQuestions}</td>
                  <td className="py-3 text-slate-500">{new Date(test.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-slate-400">You haven't taken any tests yet. Head over to Mock Tests to start.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
