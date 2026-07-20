import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Settings, Database, Server, FileQuestion, RefreshCw, Folder, Lightbulb, BrainCircuit, BookmarkPlus, Sparkles, FileText, Bookmark } from 'lucide-react';
import { getActiveProject, getGraphRoot, saveRawContext, saveBlueprint, saveNote } from '../services/db';
import { generateBlueprintWithAI, rephraseNoteWithAI, type AIBlueprintResponse } from '../services/ai';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [roomId, setRoomId] = useState<string | null>(null);
  
  const [rawContext, setRawContext] = useState('');
  const [blueprint, setBlueprint] = useState<AIBlueprintResponse | null>(null);
  const [rephrasedNote, setRephrasedNote] = useState<string | null>(null);
  
  const [knowledgeBase, setKnowledgeBase] = useState<any[]>([]);
  const [savedNotes, setSavedNotes] = useState<any[]>([]);
  
  const [isListening, setIsListening] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRephrasing, setIsRephrasing] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const id = localStorage.getItem('jarvis_room_id');
    setRoomId(id);
    
    if (id) {
      const project = getActiveProject(id);
      
      // Load raw context
      project.get('raw_context').on((data) => {
        if (typeof data === 'string') {
          setRawContext(data);
        }
      });

      // Load blueprint JSON
      project.get('blueprint_json').on((data) => {
        if (typeof data === 'string') {
          try {
            setBlueprint(JSON.parse(data));
          } catch (e) {
            console.error("Failed to parse blueprint", e);
          }
        }
      });

      // Load learned database knowledge (for AI injection)
      const root = getGraphRoot(id);
      root.get('knowledge_base').map().on((data) => {
        if (data && data.text) {
          setKnowledgeBase(prev => {
            if (prev.find(p => p.id === data.id)) return prev;
            return [...prev, data];
          });
        }
      });

      // Load Saved Notes
      root.get('saved_notes').map().on((data) => {
        if (data && data.title) {
          setSavedNotes(prev => {
            if (prev.find(p => p.id === data.id)) return prev;
            return [...prev, data].sort((a, b) => b.timestamp - a.timestamp);
          });
        }
      });
    }

    // Initialize Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setRawContext(prev => {
            const newText = prev + (prev.endsWith(' ') ? '' : ' ') + finalTranscript;
            if (id) saveRawContext(id, newText);
            return newText;
          });
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error !== 'no-speech') {
          setIsListening(false);
        }
      };

      recognitionRef.current.onend = () => {
        if (isListening && recognitionRef.current) {
          setTimeout(() => {
            try {
              recognitionRef.current.start();
            } catch (e) {
               setIsListening(false);
            }
          }, 300);
        } else {
          setIsListening(false);
        }
      };
    }
  }, [isListening]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      recognitionRef.current.stop();
    } else {
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch (e) {}
    }
  };

  const handleContextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setRawContext(val);
    if (roomId) saveRawContext(roomId, val);
  };

  const handleGenerate = async () => {
    if (!roomId || !rawContext.trim()) return;
    setIsGenerating(true);
    setRephrasedNote(null); // Clear rephrased note to show blueprint
    try {
      const existingKnowledge = knowledgeBase.map(k => k.text);
      const newBlueprint = await generateBlueprintWithAI(rawContext, existingKnowledge);
      setBlueprint(newBlueprint);
      saveBlueprint(roomId, newBlueprint);
    } catch (error: any) {
      alert("Generation failed: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRephrase = async () => {
    if (!rawContext.trim()) return;
    setIsRephrasing(true);
    setBlueprint(null); // Clear blueprint to show rephrased note
    try {
      const cleanNote = await rephraseNoteWithAI(rawContext);
      setRephrasedNote(cleanNote);
    } catch (error: any) {
      alert("Rephrase failed: " + error.message);
    } finally {
      setIsRephrasing(false);
    }
  };

  const handleSaveNote = () => {
    if (!roomId || !rawContext.trim()) return;
    const lines = rawContext.split('\\n').filter(l => l.trim().length > 0);
    const title = lines.length > 0 ? lines[0].substring(0, 30) + '...' : 'Untitled Note';
    saveNote(roomId, title, rawContext);
    alert("Note saved to History!");
  };

  const handleLoadNote = (content: string) => {
    setRawContext(content);
    if (roomId) saveRawContext(roomId, content);
  };

  const handleNewRequirement = () => {
    if (window.confirm("Start a new requirement? This will clear your current notes.")) {
      setRawContext('');
      setBlueprint(null);
      setRephrasedNote(null);
      if (roomId) saveRawContext(roomId, '');
    }
  };

  if (!roomId) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0d0d0d]">
        <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-neutral-800">
          <h2 className="text-xl font-bold text-white mb-2">Welcome to Jarvis Data Strategy</h2>
          <p className="text-neutral-400 mb-6">Please enter a Room ID in Settings to start.</p>
          <button onClick={() => navigate('/settings')} className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-500">Settings</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-[#0d0d0d] text-neutral-300 font-sans overflow-hidden">
      
      {/* Sidebar - Projects & Knowledge Base */}
      <div className="hidden md:flex w-64 flex-col bg-[#141414] border-r border-[#262626] p-3 pt-5 shrink-0">
        <div className="px-3 mb-6 flex items-center justify-between text-neutral-400 font-semibold text-sm">
          <span>Data Strategy Studio</span>
        </div>

        <button 
          onClick={handleNewRequirement}
          className="flex items-center justify-center gap-2 w-full text-left px-3 py-2 text-sm text-neutral-300 hover:bg-[#262626] rounded-md transition-colors border border-[#262626] mb-6 font-medium"
        >
          <span className="text-xl leading-none -mt-0.5">+</span>
          <span>New Requirement</span>
        </button>
        
        <div className="flex-1 overflow-y-auto scrollbar-hide space-y-6">
          <div>
            <div className="px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Active Workspace</div>
            <ul className="space-y-0.5">
              <li className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-200 bg-[#262626] rounded cursor-pointer transition-colors truncate">
                <Folder className="w-3.5 h-3.5 text-blue-400" />
                <span>Current Requirement</span>
              </li>
            </ul>
          </div>

          <div>
            <div className="px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-emerald-400" /> Saved Notes History
            </div>
            <ul className="space-y-1">
              {savedNotes.length === 0 ? (
                <li className="px-3 py-1 text-xs text-neutral-600 italic">No notes saved yet.</li>
              ) : (
                savedNotes.map(n => (
                  <li key={n.id} onClick={() => handleLoadNote(n.content)} className="flex items-start gap-2 text-sm text-neutral-400 px-3 py-1.5 hover:bg-[#262626] rounded cursor-pointer transition-colors truncate">
                    <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span className="truncate">{n.title}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-[#262626] space-y-1">
          <button onClick={() => navigate('/knowledge')} className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-neutral-400 hover:text-purple-400 hover:bg-[#262626] rounded-md transition-colors">
            <BrainCircuit className="w-4 h-4" />
            <span>Learned Schema DB</span>
          </button>
          <button onClick={() => navigate('/settings')} className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-neutral-400 hover:text-neutral-200 hover:bg-[#262626] rounded-md transition-colors">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Main Split View */}
      <div className="flex-1 flex flex-col md:flex-row h-full">
        
        {/* Left Pane: Raw Context */}
        <div className="w-full md:w-1/2 flex flex-col border-r border-[#262626] bg-[#0f0f0f]">
          <div className="p-4 border-b border-[#262626] flex items-center justify-between bg-[#141414]">
            <h2 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
              <Mic className="w-4 h-4 text-neutral-500" />
              Raw Analyst Notes
            </h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleSaveNote}
                className="p-1.5 text-neutral-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded transition-colors"
                title="Save Note to History"
              >
                <BookmarkPlus className="w-4 h-4" />
              </button>
              <button 
                onClick={handleRephrase}
                disabled={isRephrasing || !rawContext.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 border border-purple-500/30 disabled:opacity-50"
              >
                {isRephrasing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Rephrase
              </button>
              <div className="w-px h-4 bg-[#333] mx-1"></div>
              <button 
                onClick={toggleListening}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  isListening 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                    : 'bg-[#262626] text-neutral-300 hover:bg-[#333] border border-transparent'
                }`}
              >
                {isListening ? (
                  <><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Listening</>
                ) : (
                  <><MicOff className="w-3.5 h-3.5" /> Dictate</>
                )}
              </button>
            </div>
          </div>
          
          <div className="flex-1 p-4">
            <textarea
              value={rawContext}
              onChange={handleContextChange}
              placeholder="Type your messy daily work notes here. E.g. 'Completed the call connect sheet. Need to fix PTP campaign zero conversion bug...' Then click 'Rephrase' to clean it up, or 'Analyze' to get a data strategy!"
              className="w-full h-full bg-transparent resize-none focus:outline-none text-neutral-300 placeholder-neutral-600 leading-relaxed text-sm"
            />
          </div>
        </div>

        {/* Right Pane: Output (Strategy or Rephrased Note) */}
        <div className="w-full md:w-1/2 flex flex-col bg-[#0a0a0a]">
          <div className="p-4 border-b border-[#262626] flex items-center justify-between bg-[#141414]">
            <h2 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
              {rephrasedNote ? (
                <><Sparkles className="w-4 h-4 text-purple-400" /> Cleaned Note Output</>
              ) : (
                <><Database className="w-4 h-4 text-blue-400" /> Execution Strategy Ideas</>
              )}
            </h2>
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !rawContext.trim()}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white rounded-md transition-colors"
            >
              {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Server className="w-3.5 h-3.5" />}
              {isGenerating ? 'Thinking...' : 'Analyze Strategy'}
            </button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-8 scrollbar-hide">
            
            {!blueprint && !rephrasedNote && !isGenerating && !isRephrasing && (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto text-neutral-500 space-y-4">
                <Lightbulb className="w-12 h-12 text-neutral-800" />
                <p>Output Pane. Click "Analyze Strategy" for a SQL roadmap, or "Rephrase" to clean up your notes.</p>
              </div>
            )}

            {/* Rephrased Note Output View */}
            {rephrasedNote && (
              <div className="bg-[#141414] border border-[#262626] rounded-lg p-6">
                <div className="prose prose-invert prose-sm max-w-none">
                  {/* Super simple markdown to HTML rendering for the rephrased note */}
                  {rephrasedNote.split('\\n').map((line, i) => (
                    <p key={i} className="mb-2 text-neutral-300 leading-relaxed">
                      {line.startsWith('- ') || line.startsWith('* ') ? (
                        <li className="ml-4 list-disc">{line.substring(2)}</li>
                      ) : line.startsWith('#') ? (
                        <span className="font-bold text-white text-base block mt-4 mb-2">{line.replace(/#/g, '')}</span>
                      ) : (
                        line
                      )}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Strategy Blueprint View */}
            {blueprint && !rephrasedNote && (
              <>
                {blueprint.objective && (
                  <section>
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Folder className="w-4 h-4" /> Core Objective
                    </h3>
                    <div className="text-sm text-neutral-200 font-semibold bg-[#141414] border border-[#262626] p-4 rounded-lg">
                      {blueprint.objective}
                    </div>
                  </section>
                )}

                {blueprint.execution_ideas && blueprint.execution_ideas.length > 0 && (
                  <section>
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-yellow-500" /> Execution Ideas (Analyst Steps)
                    </h3>
                    <div className="bg-[#141414] border border-[#262626] rounded-lg p-4">
                      <ol className="list-decimal list-inside space-y-4">
                        {blueprint.execution_ideas.map((idea, i) => (
                          <li key={i} className="text-sm text-neutral-300 leading-relaxed pl-2">
                            {idea}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </section>
                )}

                {blueprint.missing_data_context && blueprint.missing_data_context.length > 0 && (
                  <section>
                    <h3 className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <FileQuestion className="w-4 h-4" /> Missing Data Context
                    </h3>
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                      <p className="text-xs text-orange-400/80 mb-3 font-semibold uppercase">I need to know this about your database to give better ideas:</p>
                      <ul className="space-y-2">
                        {blueprint.missing_data_context.map((q, i) => (
                          <li key={i} className="text-sm text-orange-300 flex items-start gap-2">
                            <span className="mt-0.5 font-bold">?</span>
                            <span>{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
