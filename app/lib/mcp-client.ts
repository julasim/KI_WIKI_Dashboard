/**
 * MCP-Client für Dashboard-Schreibvorgänge.
 *
 * Architektur:
 *   Dashboard-Server-Component / Server-Action
 *     ↓ HTTP POST mit Bearer-Token
 *   MCP-Server (https://wiki-mcp.sima.business/mcp/)
 *     ↓ Tool-Call
 *   Vault
 *
 * Server-Side only — `process.env.MCP_TOKEN` ist NIE im Browser sichtbar.
 *
 * Streamable-HTTP-Protokoll: ein Init-Call holt eine Session-ID,
 * danach Tool-Calls mit dieser ID. Alles in einer Function combined damit
 * Next.js Server-Actions atomic sind.
 */

const MCP_URL = process.env.MCP_BASE_URL || "https://wiki-mcp.sima.business/mcp/";
const MCP_TOKEN = process.env.MCP_TOKEN || "";

if (!MCP_TOKEN && process.env.NODE_ENV === "production") {
  console.warn(
    "[mcp-client] MCP_TOKEN ist leer — Schreibvorgänge werden 401 zurückgeben.",
  );
}

interface JsonRpcResponse<T = unknown> {
  jsonrpc: "2.0";
  id: number;
  result?: T;
  error?: { code: number; message: string; data?: unknown };
}

interface ToolCallResult {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}

/**
 * Parsed MCP-Response. Body kann entweder JSON oder SSE (event: message...) sein.
 */
function parseResponse<T>(text: string): JsonRpcResponse<T> {
  // SSE-Format: "event: message\ndata: {...}\n\n"
  if (text.includes("\ndata:") || text.startsWith("event:") || text.startsWith("data:")) {
    const dataLine = text.split("\n").find((l) => l.startsWith("data:"));
    if (!dataLine) throw new Error("MCP SSE response without data line");
    return JSON.parse(dataLine.substring(5).trim()) as JsonRpcResponse<T>;
  }
  return JSON.parse(text) as JsonRpcResponse<T>;
}

/**
 * Initialize-Call holt Session-ID. MCP-Server akzeptiert subsequent Tool-Calls
 * mit dieser ID. Ohne Session-ID gibt's "Bad Request: No valid session ID".
 */
async function initSession(): Promise<string> {
  const res = await fetch(MCP_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MCP_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "ki-os-dashboard", version: "0.1.0" },
      },
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`MCP initialize failed: HTTP ${res.status} ${await res.text()}`);
  }
  const sessionId = res.headers.get("Mcp-Session-Id") || res.headers.get("mcp-session-id");
  if (!sessionId) {
    throw new Error("MCP initialize: kein Mcp-Session-Id Header zurückgegeben");
  }
  // Session ist bereit. notifications/initialized senden ist Best-Practice
  // aber für stateless Tool-Calls nicht streng nötig.
  return sessionId;
}

/**
 * Ruft ein MCP-Tool auf. Erste Stelle macht initialize, zweite den Tool-Call.
 *
 * @param tool Tool-Name (z.B. "create_task")
 * @param args Tool-Argumente als Object
 * @returns Tool-Result als geparstes Object (MCP-Convention: result.content[0].text als JSON-string)
 * @throws bei HTTP-Fehler, Auth-Fail, ungültiger Antwort, oder Tool-internem `error`-Feld
 */
export async function mcpCall<T = unknown>(tool: string, args: object): Promise<T> {
  const sessionId = await initSession();

  const res = await fetch(MCP_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MCP_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      "Mcp-Session-Id": sessionId,
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: { name: tool, arguments: args },
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`MCP tool ${tool} failed: HTTP ${res.status} ${await res.text()}`);
  }

  const json = parseResponse<ToolCallResult>(await res.text());
  if (json.error) {
    throw new Error(`MCP error: ${json.error.message}`);
  }

  const text = json.result?.content?.[0]?.text;
  if (typeof text !== "string") {
    throw new Error(`MCP tool ${tool}: kein content[0].text in Antwort`);
  }

  // Tool-Funktionen returnen JSON-strings. Parsen und auf {error}-Feld prüfen.
  let data: { error?: string } & Record<string, unknown>;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`MCP tool ${tool}: Antwort ist kein gültiges JSON: ${text.slice(0, 200)}`);
  }

  if (data.error) {
    throw new Error(`MCP tool ${tool}: ${data.error}`);
  }

  return data as T;
}

/**
 * Health-Check ohne Auth (Edge-Caddy whitelisted /health).
 * Nützlich für Status-Anzeige im Dashboard.
 */
export async function mcpHealth(): Promise<{ status: string; tools: number; auth: string } | null> {
  try {
    // /health ist auf der gleichen Origin wie /mcp/ — nutze MCP_URL ohne /mcp/-Suffix
    const healthUrl = MCP_URL.replace(/\/mcp\/?$/, "/health");
    const res = await fetch(healthUrl, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
