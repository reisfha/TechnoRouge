#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { FigmaClient } from "./figma.js";

const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN;

if (!FIGMA_ACCESS_TOKEN) {
  console.error("FIGMA_ACCESS_TOKEN environment variable is required");
  process.exit(1);
}

const client = new FigmaClient({ accessToken: FIGMA_ACCESS_TOKEN });

const server = new Server(
  { name: "figma-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

function makeStringTool(name: string, description: string, required: string[], optional?: string[]): Tool {
  return {
    name,
    description,
    inputSchema: {
      type: "object",
      properties: Object.fromEntries(
        [
          ...required.map((p) => [p, { type: "string", description: p }]),
          ...(optional ?? []).map((p) => [p, { type: "string", description: p }]),
        ]
      ),
      required,
    },
  };
}

const TOOLS: Tool[] = [
  {
    name: "figma_get_file",
    description: "Get the entire file document tree for a Figma file",
    inputSchema: {
      type: "object",
      properties: {
        file_key: { type: "string", description: "The key of the Figma file" },
        depth: { type: "number", description: "Depth of traversal (default: unlimited)" },
      },
      required: ["file_key"],
    },
  },
  {
    name: "figma_get_node",
    description: "Get specific nodes from a Figma file by their IDs",
    inputSchema: {
      type: "object",
      properties: {
        file_key: { type: "string", description: "The key of the Figma file" },
        node_ids: { type: "string", description: "Comma-separated list of node IDs" },
        depth: { type: "number", description: "Depth of traversal" },
      },
      required: ["file_key", "node_ids"],
    },
  },
  {
    name: "figma_get_images",
    description: "Get image render URLs for specific nodes in a Figma file",
    inputSchema: {
      type: "object",
      properties: {
        file_key: { type: "string", description: "The key of the Figma file" },
        node_ids: { type: "string", description: "Comma-separated list of node IDs" },
        format: { type: "string", description: "Image format: jpg, png, svg, pdf (default: png)" },
        scale: { type: "number", description: "Scale factor (1-4, default: 1)" },
      },
      required: ["file_key", "node_ids"],
    },
  },
  {
    name: "figma_get_components",
    description: "Get all components in a Figma file",
    inputSchema: {
      type: "object",
      properties: {
        file_key: { type: "string", description: "The key of the Figma file" },
      },
      required: ["file_key"],
    },
  },
  {
    name: "figma_get_styles",
    description: "Get all styles in a Figma file",
    inputSchema: {
      type: "object",
      properties: {
        file_key: { type: "string", description: "The key of the Figma file" },
      },
      required: ["file_key"],
    },
  },
  {
    name: "figma_get_team_projects",
    description: "Get all projects in a Figma team",
    inputSchema: {
      type: "object",
      properties: {
        team_id: { type: "string", description: "The ID of the Figma team" },
      },
      required: ["team_id"],
    },
  },
  {
    name: "figma_get_project_files",
    description: "Get all files in a Figma project",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "string", description: "The ID of the Figma project" },
      },
      required: ["project_id"],
    },
  },
  {
    name: "figma_get_variables",
    description: "Get all local variables in a Figma file",
    inputSchema: {
      type: "object",
      properties: {
        file_key: { type: "string", description: "The key of the Figma file" },
      },
      required: ["file_key"],
    },
  },
  {
    name: "figma_get_versions",
    description: "Get version history of a Figma file",
    inputSchema: {
      type: "object",
      properties: {
        file_key: { type: "string", description: "The key of the Figma file" },
      },
      required: ["file_key"],
    },
  },
  {
    name: "figma_get_me",
    description: "Get information about the authenticated Figma user",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "figma_get_file": {
        const data = await client.getFile(args?.file_key as string, {
          depth: args?.depth as number | undefined,
        });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "figma_get_node": {
        const nodeIds = (args?.node_ids as string).split(",").map((s) => s.trim());
        const data = await client.getFileNodes(args?.file_key as string, nodeIds, {
          depth: args?.depth as number | undefined,
        });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "figma_get_images": {
        const nodeIds = (args?.node_ids as string).split(",").map((s) => s.trim());
        const data = await client.getImages(args?.file_key as string, nodeIds, {
          format: (args?.format as "png" | "jpg" | "svg" | "pdf") ?? "png",
          scale: args?.scale as number | undefined,
        });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "figma_get_components": {
        const data = await client.getFileComponents(args?.file_key as string);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "figma_get_styles": {
        const data = await client.getFileStyles(args?.file_key as string);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "figma_get_team_projects": {
        const data = await client.getTeamProjects(args?.team_id as string);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "figma_get_project_files": {
        const data = await client.getProjectFiles(args?.project_id as string);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "figma_get_variables": {
        const data = await client.getVariables(args?.file_key as string);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "figma_get_versions": {
        const data = await client.getFileVersions(args?.file_key as string);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "figma_get_me": {
        const data = await client.getMe();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: `Error: ${message}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Figma MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
