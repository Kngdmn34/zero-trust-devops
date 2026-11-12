// Server-only Groq client.
//
// IMPORTANT: this module reads GROQ_API_KEY from the environment and must only
// be imported from server-side code (route handlers / server components).
// Never import it from a client component — the key is a server secret and is
// intentionally NOT prefixed with NEXT_PUBLIC_ so it never reaches the browser.

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

/** Default production model on the Groq developer plan (fast + cheap).
 *  Override per environment with the GROQ_MODEL variable. */
export const DEFAULT_GROQ_MODEL = "openai/gpt-oss-20b";

export interface GroqChatOptions {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export function getGroqConfig() {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL;
  return { apiKey, model };
}

/** Returns true when the Groq API key is present in the environment. */
export function isGroqConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}

/** Calls the Groq chat completions API (OpenAI-compatible) and returns the
 *  assistant message content. Throws when the key is missing or the request
 *  fails. */
export async function groqChat({
  systemPrompt,
  userPrompt,
  model,
  temperature = 0.4,
  maxTokens = 800,
}: GroqChatOptions): Promise<string> {
  const { apiKey, model: defaultModel } = getGroqConfig();
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured. Set it in the server environment.");
  }

  const response = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model || defaultModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Groq API error ${response.status}: ${detail}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content ?? "";
}
