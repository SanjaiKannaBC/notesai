import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, ArrowLeft, Trash2 } from 'lucide-react';
import { getGraphRoot, deleteDatabaseKnowledge } from '../services/db';

const KnowledgeBase: React.FC = () => {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [knowledgeBase, setKnowledgeBase] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const id = localStorage.getItem('jarvis_room_id');
    if (!id) {
      navigate('/login');
      return;
    }
    setRoomId(id);

    const root = getGraphRoot(id);
    root.get('knowledge_base').map().on((data) => {
      if (data && data.text) {
        setKnowledgeBase(prev => {
          if (prev.find(p => p.id === data.id)) return prev;
          return [...prev, data];
        });
      }
    });
  }, [navigate]);

  const handleDelete = (id: string) => {
    if (roomId) {
      deleteDatabaseKnowledge(roomId, id);
      setKnowledgeBase(prev => prev.filter(k => k.id !== id));
    }
  };

  return (
    <div className="flex h-full bg-[#0d0d0d] text-neutral-300 font-sans overflow-hidden">
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-8">
        
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[#262626]">
          <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-[#262626] rounded-lg transition-colors text-neutral-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <BrainCircuit className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-bold text-white tracking-wide">Learned Schema Database</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide">
          <p className="text-sm text-neutral-400 mb-8 max-w-2xl leading-relaxed">
            This is Jarvis's long-term memory. As you dictate notes and answer its questions about your database, it extracts and permanently stores the facts here. It uses this knowledge to generate perfect strategies without having to ask you the same questions twice.
          </p>

          {knowledgeBase.length === 0 ? (
            <div className="bg-[#141414] border border-[#262626] rounded-xl p-12 text-center flex flex-col items-center">
              <BrainCircuit className="w-12 h-12 text-neutral-700 mb-4" />
              <h3 className="text-lg font-medium text-neutral-300 mb-2">No facts learned yet</h3>
              <p className="text-neutral-500 text-sm max-w-sm">
                Go to the dashboard and tell Jarvis about your tables (e.g. "Campaigns are stored in the cm_data table").
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {knowledgeBase.map(k => (
                <div key={k.id} className="group flex items-start justify-between bg-[#141414] border border-[#262626] rounded-lg p-4 hover:border-purple-500/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 shrink-0"></div>
                    <p className="text-neutral-300 text-sm leading-relaxed">{k.text}</p>
                  </div>
                  <button 
                    onClick={() => handleDelete(k.id)} 
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 text-red-400 rounded-md transition-all shrink-0"
                    title="Delete Fact"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default KnowledgeBase;
