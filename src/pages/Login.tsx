import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Lock, Database } from 'lucide-react';

const Login: React.FC = () => {
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const savedRoomId = localStorage.getItem('jarvis_room_id');
    if (savedRoomId) {
      navigate('/');
    }
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      localStorage.setItem('jarvis_room_id', roomId.trim());
      navigate('/');
    }
  };

  return (
    <div className="flex items-center justify-center h-full bg-[#0d0d0d] text-neutral-300 font-sans">
      <div className="w-full max-w-md p-8 bg-[#141414] border border-[#262626] rounded-2xl shadow-2xl">
        
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-16 h-16 bg-blue-600/10 border border-blue-500/20 rounded-full flex items-center justify-center mb-4">
            <Database className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Jarvis Data Studio</h1>
          <p className="text-sm text-neutral-500 mt-2 text-center">
            Enter your secret Workspace ID to access your notes and database schemas.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Workspace ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyRound className="w-4 h-4 text-neutral-500" />
              </div>
              <input 
                type="password" 
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="e.g. jarvis_secure_123"
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-neutral-700"
                required
              />
            </div>
          </div>
          
          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>Secure Login</span>
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-[#262626] text-center">
          <p className="text-xs text-neutral-600">
            End-to-end encrypted synchronization powered by Gun.js
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
