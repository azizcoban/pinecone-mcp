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
npx github:YOUR_USERNAME/pinecone-mcp
```

## Configuration

Before running the server, you need to set up your Pinecone API key. 

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit the `.env` file and replace `your_api_key_here` with your actual Pinecone API key from the [Pinecone dashboard](https://app.pinecone.io/).

## Available Tools

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
