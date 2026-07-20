const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export type AIBlueprintResponse = {
  objective: string;
  execution_ideas: string[];
  missing_data_context: string[];
  new_database_knowledge: string[];
};

const SYSTEM_PROMPT = `You are Jarvis, an advanced Data Strategy Assistant for an expert SQL/Python Analyst.
Your job is to listen to the user's raw notes and requirements, and output a structured Execution Strategy (Idea Blueprint).
DO NOT output any conversational text. ONLY output a valid JSON object.
DO NOT WRITE 'CREATE TABLE' SQL SCRIPTS. The user is an expert who knows SQL; they need the IDEA and STRATEGY, not the exact syntax.

# Output JSON Format:
{
  "objective": "A one-sentence summary of what the business is trying to achieve with this request.",
  "execution_ideas": [
    "Step-by-step logical ideas on how an analyst should approach writing the SQL/Python. E.g. '1. Aggregate campaign data by ID. 2. Filter out control groups. 3. Join with historical base population...'"
  ],
  "missing_data_context": [
    "List critical things you need to know about their database to give a better strategy. E.g. 'What table stores the base population for campaigns?', 'How are control groups identified?'"
  ],
  "new_database_knowledge": [
    "If the user's raw text reveals new facts about their database schema (e.g. 'campaigns are in the camp_data table'), extract it here so you can remember it forever."
  ]
}

# Rules:
1. Treat the user as a senior data analyst. Give them analytical strategies and ideas.
2. If the user doesn't specify what tables hold what data, DO NOT ASSUME. Put it in 'missing_data_context' so they can clarify.
3. If they do mention database facts, extract them into 'new_database_knowledge'.
4. Be concise and highly structured.
`;

export const generateBlueprintWithAI = async (
  rawContext: string,
  existingKnowledge: string[]
): Promise<AIBlueprintResponse> => {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API Key is missing in .env file.');
  }

  if (!rawContext || rawContext.trim().length < 5) {
    return { objective: '', execution_ideas: [], missing_data_context: [], new_database_knowledge: [] };
  }

  const promptMessage = `
Here is what you already know about my database:
${existingKnowledge.length > 0 ? existingKnowledge.join('\n') : 'Nothing yet.'}

Here is my new raw project context/transcription:
"""
${rawContext}
"""
Please generate the Data Strategy Blueprint.
  `.trim();

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: promptMessage }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1, 
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Groq API Error: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    return JSON.parse(content) as AIBlueprintResponse;
  } catch (e) {
    console.error('Failed to parse AI response as JSON:', content);
    throw new Error('AI returned invalid JSON format.');
  }
};

export const rephraseNoteWithAI = async (rawNote: string): Promise<string> => {
  if (!GROQ_API_KEY) throw new Error('Groq API Key is missing in .env file.');
  if (!rawNote || rawNote.trim().length < 5) return rawNote;

  const promptMessage = `
You are a professional editor for a Senior Data Analyst.
Here are my raw daily work notes/logs:

"""
${rawNote}
"""

Please rephrase and format these notes to be extremely clean, professional, and well-structured.
RULES:
1. Fix grammar, spelling, and flow.
2. DO NOT change any facts, numbers, or technical terms.
3. DO NOT remove any details.
4. DO NOT hallucinate or add any new information that wasn't in the raw notes.
5. Use bullet points and bold text where appropriate to make it readable.
6. Output ONLY the rephrased markdown text. Do not output JSON. Do not include any conversational intro/outro like "Here are your notes...".
  `.trim();

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: promptMessage }],
      temperature: 0.1, 
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Groq API Error: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
};
