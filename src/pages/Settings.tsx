import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Settings: React.FC = () => {
  const [roomId, setRoomId] = useState('');
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedRoomId = localStorage.getItem('jarvis_room_id');
    if (savedRoomId) {
      setRoomId(savedRoomId);
    }
  }, []);

  const handleSave = () => {
    if (roomId.trim()) {
      localStorage.setItem('jarvis_room_id', roomId.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="p-6 h-full max-w-2xl mx-auto flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/')}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-300"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
      </div>
      
      <div className="space-y-6">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-slate-200 mb-2">Gun.js Sync Configuration</h2>
          <p className="text-sm text-slate-400 mb-4">Enter a secret room ID to sync your memory across devices.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Room ID</label>
              <input 
                type="password" 
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="e.g., jarvis_secret_key_123"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
            <button 
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl transition-colors font-medium text-sm flex items-center gap-2"
            >
              {saved ? 'Saved!' : 'Connect & Sync'}
            </button>
          </div>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm opacity-50">
          <h2 className="text-lg font-semibold text-slate-200 mb-2 flex items-center gap-2">
            AI Configuration
            <span className="text-xs font-normal bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">Loaded from .env</span>
          </h2>
          <p className="text-sm text-slate-400">Your Groq API key is securely loaded from the project configuration file.</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
