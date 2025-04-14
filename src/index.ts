#!/usr/bin/env node

import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Pinecone } from "@pinecone-database/pinecone";
import { z } from "zod";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Check if the API key is present
if (!process.env.PINECONE_API_KEY) {
  console.error("Error: PINECONE_API_KEY environment variable is not set");
  process.exit(1);
}

// Initialize Pinecone client
// This will use API key from environment variable PINECONE_API_KEY
const pinecone = new Pinecone();

// Create an MCP server
const server = new McpServer({
  name: "Pinecone MCP Server",
  version: "1.0.0",
  description: "MCP server for interacting with Pinecone database",
});

// Add a tool to list all Pinecone indexes
server.tool(
  "listIndexes",
  {}, // No parameters needed
  async () => {
    try {
      // List all indexes
      const indexesResponse = await pinecone.listIndexes();

      // Format the response - indexesResponse is not an array but an object with indexes property
      const indexList = (Array.isArray(indexesResponse) ? indexesResponse : []).map((index: any) => ({
        name: index.name,
        dimension: index.dimension,
        metric: index.metric,
        status: index.status,
        host: index.host,
      }));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(indexList, null, 2),
          },
        ],
      };
    } catch (error) {
      // Handle errors
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      return {
        content: [
          {
            type: "text",
            text: `Error listing Pinecone indexes: ${errorMessage}`,
          },
        ],
      };
    }
  }
);

// Add a tool to describe a specific index
server.tool(
  "describeIndex",
  { indexName: z.string().describe("The name of the index to describe") },
  async ({ indexName }) => {
    try {
      // Describe the index
      const indexDescription = await pinecone.describeIndex(indexName);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(indexDescription, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      return {
        content: [
          {
            type: "text",
            text: `Error describing index ${indexName}: ${errorMessage}`,
          },
        ],
      };
    }
  }
);

// Add a tool to get statistics about an index
server.tool(
  "describeIndexStats",
  {
    indexName: z
      .string()
      .describe("The name of the index to get statistics for"),
    host: z
      .string()
      .optional()
      .describe("The host of the index (required for some operations)"),
  },
  async ({ indexName, host }) => {
    try {
      // Get the index by name and host if provided
      const index = host
        ? pinecone.index(indexName, host)
        : pinecone.index(indexName);
      const stats = await index.describeIndexStats();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(stats, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      return {
        content: [
          {
            type: "text",
            text: `Error getting stats for index ${indexName}: ${errorMessage}`,
          },
        ],
      };
    }
  }
);

// Add a tool to fetch vectors by ID
server.tool(
  "fetchVectors",
  {
    indexName: z
      .string()
      .describe("The name of the index to fetch vectors from"),
    host: z
      .string()
      .optional()
      .describe("The host of the index (required for some operations)"),
    ids: z.array(z.string()).describe("Array of vector IDs to fetch"),
    namespace: z
      .string()
      .optional()
      .describe("Optional namespace to fetch from"),
  },
  async ({ indexName, host, ids, namespace }) => {
    try {
      // Get the index by name and host if provided
      const index = host
        ? pinecone.index(indexName, host)
        : pinecone.index(indexName);

      console.error(
        `Starting fetch request for index ${indexName}${
          host ? ` at host ${host}` : ""
        }, ids: ${JSON.stringify(ids)}`
      );

      let fetchResponse;

      // If namespace is provided, use the namespace-specific index accessor
      if (namespace) {
        console.error(`Using namespace: ${namespace}`);
        const namespaceIndex = index.namespace(namespace);
        // For namespaced index, we just pass the IDs directly
        fetchResponse = await namespaceIndex.fetch(ids);
      } else {
        // For default namespace, we just pass the IDs directly
        fetchResponse = await index.fetch(ids);
      }

      // Log the raw response for debugging
      console.error(`Raw fetch response type: ${typeof fetchResponse}`);
      console.error(`Raw fetch response: ${JSON.stringify(fetchResponse)}`);

      // Handle empty response
      if (!fetchResponse || !(fetchResponse?.namespace || fetchResponse.records)) {
        return {
          content: [
            {
              type: "text",
              text: "No vectors found with the specified IDs",
            },
          ],
        };
      }

      // Format the response
      const formattedResponse = {
        vectors: fetchResponse?.records,
        namespace: namespace || fetchResponse?.namespace,
        usage: fetchResponse?.usage,
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(formattedResponse, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      // Log the full error for debugging
      console.error(`Fetch error: ${String(error)}`);
      console.error(error); // Log the entire error object

      // Try to get more details if it's a Response object
      if (error instanceof Response) {
        try {
          const text = await error.text();
          console.error(`Error response text: ${text}`);
        } catch (e) {
          console.error(`Could not extract error response text: ${e}`);
        }
      }

      return {
        content: [
          {
            type: "text",
            text: `Error fetching vectors from index ${indexName}: ${errorMessage}`,
          },
        ],
      };
    }
  }
);

// Add a tool to query vectors
server.tool(
  "queryVectors",
  {
    indexName: z.string().describe("The name of the index to search in"),
    host: z
      .string()
      .optional()
      .describe("The host of the index (required for some operations)"),
    queryVector: z.array(z.number()).describe("The query vector to search for"),
    topK: z.number().optional().describe("Number of top results to return"),
    namespace: z.string().optional().describe("Namespace to search in"),
    filter: z.record(z.any()).optional().describe("Metadata filters"),
    includeMetadata: z
      .boolean()
      .optional()
      .describe("Whether to include metadata in results"),
  },
  async ({
    indexName,
    host,
    queryVector,
    topK = 10,
    namespace,
    filter,
    includeMetadata = true,
  }) => {
    try {
      // Get the index by name and host if provided
      const index = host
        ? pinecone.index(indexName, host)
        : pinecone.index(indexName);

      // Prepare query options for vector only - do not include namespace here
      const queryOptions: any = {
        vector: queryVector,
        topK: topK,
        includeMetadata: includeMetadata,
      };

      // If filter is provided, include it
      if (filter) {
        queryOptions.filter = filter;
      }

      console.error(
        `Starting query for index ${indexName}${
          host ? ` at host ${host}` : ""
        } with topK=${topK}`
      );
      console.error(`Query options: ${JSON.stringify(queryOptions)}`);

      let queryResponse;

      // If namespace is provided, use the namespace-specific index accessor
      if (namespace) {
        console.error(`Using namespace: ${namespace}`);
        const namespaceIndex = index.namespace(namespace);
        queryResponse = await namespaceIndex.query(queryOptions);
      } else {
        // Use the default namespace
        queryResponse = await index.query(queryOptions);
      }

      // Log the raw response for debugging
      console.error(`Raw query response type: ${typeof queryResponse}`);
      console.error(`Raw query response: ${JSON.stringify(queryResponse)}`);

      // Handle empty results
      if (
        !queryResponse ||
        !queryResponse.matches ||
        queryResponse.matches.length === 0
      ) {
        return {
          content: [
            {
              type: "text",
              text: "No matching vectors found for the query",
            },
          ],
        };
      }

      // Format the response
      const formattedResponse = {
        matches: queryResponse.matches,
        namespace: namespace || queryResponse.namespace,
        usage: queryResponse.usage,
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(formattedResponse, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      // Log the full error for debugging
      console.error(`Query error: ${String(error)}`);
      console.error(error); // Log the entire error object

      // Try to get more details if it's a Response object
      if (error instanceof Response) {
        try {
          const text = await error.text();
          console.error(`Error response text: ${text}`);
        } catch (e) {
          console.error(`Could not extract error response text: ${e}`);
        }
      }

      return {
        content: [
          {
            type: "text",
            text: `Error querying vectors in index ${indexName}: ${errorMessage}`,
          },
        ],
      };
    }
  }
);

// Add a tool to list collections (if supported by account type)
server.tool(
  "listCollections",
  {}, // No parameters needed
  async () => {
    try {
      // List all collections
      const collectionsResponse = await pinecone.listCollections();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(collectionsResponse, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      return {
        content: [
          {
            type: "text",
            text: `Error listing collections: ${errorMessage}`,
          },
        ],
      };
    }
  }
);

// Add a tool to describe a collection
server.tool(
  "describeCollection",
  {
    collectionName: z
      .string()
      .describe("The name of the collection to describe"),
  },
  async ({ collectionName }) => {
    try {
      // Describe the collection
      const collectionDescription = await pinecone.describeCollection(
        collectionName
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(collectionDescription, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      return {
        content: [
          {
            type: "text",
            text: `Error describing collection ${collectionName}: ${errorMessage}`,
          },
        ],
      };
    }
  }
);

// Add a tool to list record IDs in an index namespace
server.tool(
  "listRecordIds",
  {
    indexName: z
      .string()
      .describe("The name of the index to list record IDs from"),
    host: z
      .string()
      .optional()
      .describe("The host of the index (required for some operations)"),
    namespace: z.string().describe("The namespace to list record IDs from"),
    prefix: z
      .string()
      .optional()
      .describe("Optional prefix to filter record IDs"),
    limit: z
      .number()
      .optional()
      .describe("Optional limit for number of IDs per page (default: 100)"),
    paginationToken: z
      .string()
      .optional()
      .describe("Optional pagination token for retrieving additional pages"),
  },
  async ({ indexName, host, namespace, prefix, limit, paginationToken }) => {
    try {
      // Get the index by name and host if provided
      const index = host
        ? pinecone.index(indexName, host)
        : pinecone.index(indexName);

      // Create a namespace-specific index accessor
      // In Pinecone SDK v5.1.1, namespace is set at the index level, not as a parameter
      const namespaceIndex = index.namespace(namespace);

      // Prepare list options according to Pinecone API requirements (without namespace)
      const listOptions: any = {};

      // Add optional parameters if provided
      if (prefix) {
        listOptions.prefix = prefix;
      }

      if (limit) {
        listOptions.limit = limit;
      }

      if (paginationToken) {
        listOptions.paginationToken = paginationToken;
      }

      // Log the request for debugging
      console.error(
        `List record IDs request for index ${indexName}${
          host ? ` at host ${host}` : ""
        }, namespace ${namespace}: ${JSON.stringify(listOptions)}`
      );

      // Execute list request with pagination on the namespace-specific index
      let response;

      if (paginationToken) {
        response = await namespaceIndex.listPaginated({
          ...listOptions,
          paginationToken,
        });
      } else {
        response = await namespaceIndex.listPaginated(listOptions);
      }

      // Log the response for debugging
      console.error(`List record IDs response: ${JSON.stringify(response)}`);

      // Handle empty response
      if (!response || !response.vectors || response.vectors.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No record IDs found in the specified namespace",
            },
          ],
        };
      }

      // Format the response to display vector IDs and pagination token if present
      const formattedResponse = {
        vectorIds: response.vectors.map((v) => v.id),
        namespace: namespace, // Use the provided namespace since it might not be in the response
        paginationToken: response.pagination?.next || undefined,
        count: response.vectors.length,
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(formattedResponse, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      // Log the full error for debugging
      console.error(`List record IDs error: ${String(error)}`);
      console.error(error); // Log the entire error object

      return {
        content: [
          {
            type: "text",
            text: `Error listing record IDs in index ${indexName}, namespace ${namespace}: ${errorMessage}`,
          },
        ],
      };
    }
  }
);

// Start the server
async function startServer() {
  try {
    // Create a stdio transport for communication with the Cursor agent
    const transport = new StdioServerTransport();

    console.error("Starting Pinecone MCP Server...");

    // Connect the server to the transport
    await server.connect(transport);

    console.error("Pinecone MCP Server is running");
  } catch (error) {
    console.error("Failed to start the server:", error);
    process.exit(1);
  }
}

startServer();
