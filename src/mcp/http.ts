import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { createMcpServer } from './tools';

const transports = new Map<string, WebStandardStreamableHTTPServerTransport>();

function createTransport(): WebStandardStreamableHTTPServerTransport {
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: () => crypto.randomUUID(),
    enableJsonResponse: true,
    onsessioninitialized: (sessionId) => {
      transports.set(sessionId, transport);
    },
    onsessionclosed: (sessionId) => {
      transports.delete(sessionId);
    },
  });
  return transport;
}

/**
 * Handle incoming MCP requests at the /mcp endpoint.
 * Supports stateful sessions with Streamable HTTP transport.
 */
export async function handleMcpRequest(req: Request): Promise<Response> {
  const sessionId = req.headers.get('mcp-session-id');

  if (sessionId && transports.has(sessionId)) {
    // Existing session — route to its transport
    const transport = transports.get(sessionId)!;
    return transport.handleRequest(req);
  }

  if (sessionId && !transports.has(sessionId)) {
    // Unknown session ID
    return new Response(JSON.stringify({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Session not found' },
      id: null,
    }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // New session — create transport + server
  const transport = createTransport();
  const server = createMcpServer();
  await server.connect(transport);
  return transport.handleRequest(req);
}
