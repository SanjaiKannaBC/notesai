import React from 'react';

const IdeaMap: React.FC = () => {
  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Idea Connections</h1>
        <button className="text-sm bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-slate-300 transition-colors border border-slate-700">
          Reset View
        </button>
      </div>
      
      <div className="flex-1 bg-slate-800/20 border border-slate-700/50 rounded-2xl p-5 backdrop-blur-sm flex items-center justify-center relative overflow-hidden">
        {/* Placeholder for React Flow */}
        <div className="text-slate-500 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
          </svg>
          <p>Graph loading...</p>
        </div>
      </div>
    </div>
  );
};

export default IdeaMap;
