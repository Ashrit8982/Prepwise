import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import QuestionBank from './pages/QuestionBank';
import PYQSection from './pages/PYQSection';
import PracticeMode from './pages/PracticeMode';
import MockTest from './pages/MockTest';
import Bookmarks from './pages/Bookmarks';
import ReviewMistakes from './pages/ReviewMistakes';
import AdminPanel from './pages/AdminPanel';
import SpeedRound from './pages/SpeedRound';

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/questions" element={<QuestionBank />} />
        <Route path="/pyqs" element={<PYQSection />} />
        <Route path="/practice" element={<PracticeMode />} />
        <Route path="/speed-round" element={<SpeedRound />} />
        <Route path="/mocktests" element={<MockTest />} />
        <Route path="/bookmarks" element={<Bookmarks />} />
        <Route path="/mistakes" element={<ReviewMistakes />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Route>
    </Routes>
  );
}

export default App;
