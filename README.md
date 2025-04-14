# Pinecone MCP Server

An MCP (Model Context Protocol) server for interacting with Pinecone vector database. This server provides tools for AI agents to interact with Pinecone databases through natural language.

## Prerequisites

This project requires the MCP TypeScript SDK. Until it's publicly available on npm, you'll need to:

1. Download the latest release of the SDK (file named like `modelcontextprotocol-sdk-0.1.0.tgz`)
2. Install it manually:
```bash
npm install --save path/to/modelcontextprotocol-sdk-0.1.0.tgz
```

## Features

- List all Pinecone indexes
- Describe specific indexes
- Query vectors with customizable parameters
- Support for namespaces and filters
- Easy integration with AI agents

## Installation

You can install and run this package directly using npx:

```bash
npx pinecone-mcp
```

Or install it globally:

```bash
npm install -g pinecone-mcp
pinecone-mcp
```

You can also install it from GitHub:

```bash
npx github:azizcoban/pinecone-mcp
```

## Integration with AI Agents

To add this MCP server to your AI agent, add the following configuration to your `mcp.json` file:

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

This configuration:
1. Creates a Pinecone tool namespace in your AI agent
2. Uses npx to run the pinecone-mcp server
3. Passes your Pinecone API key as an environment variable

For the Claude Desktop app, you can add this configuration to the Claude settings. This will make Pinecone tools available to Claude when interacting with the app.

If you're using a custom AI agent integration, you can reference the MCP documentation at [modelcontextprotocol.io](https://modelcontextprotocol.io) for more details on how to implement the client-side configuration.

## Configuration

There are two ways to provide your Pinecone API key to the MCP server:

### Option 1: Using a .env file (for direct usage)

When running the server directly:

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit the `.env` file and replace `your_api_key_here` with your actual Pinecone API key from the [Pinecone dashboard](https://app.pinecone.io/).

### Option 2: Using environment variables in mcp.json (for AI agent integration)

When using with an AI agent, add the API key to your `mcp.json` configuration as shown in the [Integration with AI Agents](#integration-with-ai-agents) section above.

## Using Pinecone Tools with AI Agents

Once you've integrated the Pinecone MCP server with your AI agent, the agent can use natural language to access Pinecone functionality. Here are some examples of prompts you can use:

- "List all my Pinecone indexes"
- "Describe the details of my 'my-embeddings' index"
- "Get statistics for my 'product-embeddings' index"
- "Search for vectors similar to [0.1, 0.2, 0.3, ...] in my 'customer-data' index"
- "Fetch the vector with ID '12345' from my 'document-embeddings' index"

The AI agent will translate these natural language requests into the appropriate tool calls to the Pinecone MCP server.

## Available Tools

All tools are automatically available to AI agents when properly configured. Here's what each tool does:

### listIndexes
Lists all available Pinecone indexes in your account.

Example:
```
Use the listIndexes tool
```

### describeIndex
Get detailed information about a specific index.

Example:
```
Use the describeIndex tool with indexName = "my-index"
```

### queryVectors
Query vectors in an index with various parameters.

Example:
```
Use the queryVectors tool with:
- indexName = "my-index"
- queryVector = [0.1, 0.2, 0.3]
- topK = 5
- namespace = "my-namespace" (optional)
```

### describeIndexStats
Get statistical information about a specific index.

Example:
```
Use the describeIndexStats tool with:
- indexName = "my-index"
```

### fetchVectors
Fetch specific vectors by their IDs from an index.

Example:
```
Use the fetchVectors tool with:
- indexName = "my-index"
- ids = ["vector-id-1", "vector-id-2"]
- namespace = "my-namespace" (optional)
```

### listCollections
List all collections in your Pinecone account.

Example:
```
Use the listCollections tool
```

### describeCollection
Get detailed information about a specific collection.

Example:
```
Use the describeCollection tool with:
- collectionName = "my-collection"
```

## Complete Example

Here's a complete example of setting up and using the Pinecone MCP server with Claude Desktop:

1. Install the Pinecone MCP server globally (optional):
```bash
npm install -g pinecone-mcp
```

2. Create or edit the Claude Desktop configuration file (typically located at `~/.config/claude-desktop/config.json` on macOS/Linux or `%APPDATA%\claude-desktop\config.json` on Windows):

```json
{
  "mcpServers": {
    "pinecone": {
      "command": "npx",
      "args": ["-y", "pinecone-mcp"],
      "env": {
        "PINECONE_API_KEY": "your_actual_api_key_here"
      }
    }
  }
}
```

3. Restart Claude Desktop to apply the configuration.

4. Now you can ask Claude questions like:
   - "What Pinecone indexes do I have?"
   - "Show me statistics for my 'product-embeddings' index"
   - "Query my 'customer-data' index for vectors similar to [0.1, 0.2, ...]"

Claude will use the Pinecone MCP server to execute these requests and show you the results.

## Development

To build the project:
```bash
npm run build
```

To run in development mode:
```bash
npm run dev
```

## License

MIT
