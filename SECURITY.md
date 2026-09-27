# Security

## Reporting a vulnerability

Please do not open a public issue for vulnerabilities that could expose credentials, private vector data, or unintended Pinecone access.

Instead, report the issue privately to the repository owner with:

- a concise description,
- affected tool or code path,
- reproduction steps,
- expected vs. actual behavior,
- any suggested mitigation.

## Threat model

This MCP server gives AI clients access to Pinecone operations. Treat every tool invocation as potentially adversarial or mistaken.

Recommended deployment controls:

- use least-privilege Pinecone credentials,
- restrict accessible indexes and namespaces,
- keep credentials out of prompts and logs,
- run the MCP server in an isolated environment,
- log tool calls and review anomalous access patterns,
- avoid pairing high-privilege vector access with unrestricted shell/network tools.

## Scope

The project currently focuses on a lightweight MCP integration and does not claim to provide complete sandboxing, authorization, or policy enforcement for untrusted agents.
