import Gun from 'gun';

// Initialize Gun with a few public relays for peer-to-peer sync between devices.
// Data is also saved locally to IndexedDB automatically.
const peers = [
  'https://gun-manhattan.herokuapp.com/gun',
  'https://relay.peer.uk/gun'
];

export const gun = Gun({ peers });

/**
 * Returns the root graph node for a specific room ID.
 * All projects, tasks, and events will be nested under this root.
 */
export const getGraphRoot = (roomId: string) => {
  if (!roomId) throw new Error("Room ID is required to access the graph.");
  return gun.get(`jarvis_blueprint_v1_${roomId}`);
};

// Returns the Gun node for the active project
export const getActiveProject = (roomId: string, projectId: string = 'default') => {
  return getGraphRoot(roomId).get('projects').get(projectId);
};

export const saveRawContext = (roomId: string, text: string) => {
  const project = getActiveProject(roomId);
  project.get('raw_context').put(text);
};

export const saveDatabaseKnowledge = (roomId: string, newFacts: string[]) => {
  if (!newFacts || newFacts.length === 0) return;
  const db = getGraphRoot(roomId).get('knowledge_base');
  
  newFacts.forEach(fact => {
    // Generate a simple ID based on timestamp and content length
    const id = Date.now().toString() + '_' + fact.length;
    db.get(id).put({ id, text: fact, timestamp: Date.now() });
  });
};

export const deleteDatabaseKnowledge = (roomId: string, id: string) => {
  if (!id) return;
  const db = getGraphRoot(roomId).get('knowledge_base');
  db.get(id).put(null); // Gun.js way to delete
};

export const saveNote = (roomId: string, title: string, content: string) => {
  if (!content.trim()) return;
  const notes = getGraphRoot(roomId).get('saved_notes');
  const id = Date.now().toString();
  notes.get(id).put({ id, title, content, timestamp: Date.now() });
};

export const saveBlueprint = (roomId: string, blueprint: any) => {
  const project = getActiveProject(roomId);
  project.get('blueprint_json').put(JSON.stringify(blueprint));
  project.get('last_updated').put(Date.now());

  // Also save any newly extracted database knowledge to the global context
  if (blueprint.new_database_knowledge && blueprint.new_database_knowledge.length > 0) {
    saveDatabaseKnowledge(roomId, blueprint.new_database_knowledge);
  }
};
