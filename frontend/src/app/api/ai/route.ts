import { NextResponse } from "next/server";
import { groqChat, isGroqConfigured } from "@/lib/groq";

// AI route handler (server-side). Keeps GROQ_API_KEY on the server; the browser
// only ever calls /api/ai and never sees the key.

interface AIBody {
  action?: "breakdown" | "summarize";
  task?: string;
}

export async function POST(request: Request) {
  let body: AIBody;
  try {
    body = (await request.json()) as AIBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const action = body.action ?? "breakdown";
  const task = (body.task ?? "").trim();

  if (!task) {
    return NextResponse.json({ error: "A non-empty 'task' is required." }, { status: 400 });
  }
  if (!isGroqConfigured()) {
    return NextResponse.json(
      { error: "AI is not configured — GROQ_API_KEY is missing on the server." },
      { status: 503 },
    );
  }

  try {
    if (action === "breakdown") {
      const system =
        "You are a productivity assistant. Break the user's task into 3-6 concise, " +
        "actionable subtasks. Respond with ONLY a JSON array of short strings, no " +
        "commentary, numbering, or code fences.";
      const content = await groqChat({
        systemPrompt: system,
        userPrompt: task,
        maxTokens: 600,
      });
      return NextResponse.json({ subtasks: parseStringArray(content) });
    }

    if (action === "summarize") {
      const system =
        "You are a productivity assistant. Summarize the user's tasks into a single " +
        "concise status note (1-2 sentences).";
      const summary = await groqChat({
        systemPrompt: system,
        userPrompt: task,
        temperature: 0.3,
        maxTokens: 200,
      });
      return NextResponse.json({ summary });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

/** Tolerantly extracts a string array from an LLM response. */
function parseStringArray(content: string): string[] {
  // 1. Direct JSON parse.
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return parsed.filter((x): x is string => typeof x === "string");
    }
  } catch {
    // fall through
  }

  // 2. Extract the first JSON array from the text.
  const match = content.match(/\[[\s\S]*\]/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed)) {
        return parsed.filter((x): x is string => typeof x === "string");
      }
    } catch {
      // fall through
    }
  }

  // 3. Last resort: treat non-empty lines as items.
  return content
    .split("\n")
    .map((line) => line.replace(/^\s*[-\d.)\]]+\s*/, "").trim())
    .filter((line) => line.length > 0);
}
