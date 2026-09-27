# Pinecone MCP Server

A TypeScript Model Context Protocol (MCP) server that exposes Pinecone operations as structured tools for AI agents.

The project is designed as a small AI-infrastructure building block: an agent can inspect indexes, query vector data, fetch records, work with namespaces, and inspect collections without embedding Pinecone-specific logic in the agent itself.

## Why this project

Tool-using agents become easier to reason about when external capabilities are exposed through narrow, typed interfaces. This server keeps the Pinecone integration behind MCP tools with Zod-validated inputs and environment-based credentials.

## Available tools

| Tool | Purpose |
| --- | --- |
| `listIndexes` | List available Pinecone indexes |
| `describeIndex` | Inspect index configuration |
| `describeIndexStats` | Read vector/index statistics |
| `queryVectors` | Run vector similarity queries with optional namespace/filter support |
| `fetchVectors` | Fetch vectors by ID |
| `listRecordIds` | Enumerate record IDs in a namespace with pagination |
| `listCollections` | List Pinecone collections |
| `describeCollection` | Inspect a collection |

## Architecture

```text
AI client / agent
       |
       | MCP over stdio
       v
Pinecone MCP Server
       |
       | typed + validated tool calls
       v
   Pinecone API
```

The server uses `@modelcontextprotocol/sdk`, `@pinecone-database/pinecone`, Zod, and a stdio transport.

## Installation

```bash
npm install
npm run build
```

Run locally:

```bash
PINECONE_API_KEY=your_key npm start
```

Development mode:

```bash
PINECONE_API_KEY=your_key npm run dev
```

## MCP configuration

```json
{
  "mcpServers": {
    "pinecone": {
      "command": "npx",
      "args": ["-y", "pinecone-mcp"],
      "env": {
        "PINECONE_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

You can also run directly from GitHub:

```bash
npx github:azizcoban/pinecone-mcp
```

## Security notes

- The Pinecone API key is read from `PINECONE_API_KEY`; do not commit credentials.
- Prefer a Pinecone key scoped to the minimum privileges needed for the agent.
- Treat metadata returned from vector records as untrusted data when it is later inserted into prompts.
- For production agent systems, place this server behind an explicit tool policy so the model can access only the indexes and namespaces required for its task.
- Avoid exposing high-privilege data-plane credentials to agents that can execute arbitrary shell or network actions.

## Development

```bash
npm run build
npm run dev
npm run watch
```

## Roadmap

- automated tests for tool schemas and error handling,
- configurable index/namespace allowlists,
- structured audit logging for agent tool calls,
- least-privilege / read-only execution mode,
- richer MCP resources for index metadata.

## License

MIT
