import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import IdeaMap from './pages/IdeaMap';
import Settings from './pages/Settings';
import Login from './pages/Login';
import KnowledgeBase from './pages/KnowledgeBase';

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = !!localStorage.getItem('jarvis_room_id');
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <div className="h-screen w-screen bg-[#0d0d0d] text-slate-100 overflow-hidden font-sans">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<AuthGuard><Dashboard /></AuthGuard>} />
          <Route path="/knowledge" element={<AuthGuard><KnowledgeBase /></AuthGuard>} />
          <Route path="/map" element={<AuthGuard><IdeaMap /></AuthGuard>} />
          <Route path="/settings" element={<AuthGuard><Settings /></AuthGuard>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
