export type AiTool = {
  tool_name: string;
  description: string;
  input_schema: Record<string, unknown>;
  output_schema: Record<string, unknown>;
  handler: string;
};

export const TOOL_REGISTRY: AiTool[] = [
  {
    tool_name: "classify_inbox",
    description: "Classify inbox item into HR/Docs/Sales/Support/Billing/General",
    input_schema: {
      type: "object",
      properties: { message: { type: "string" } },
      required: ["message"],
    },
    output_schema: {
      type: "object",
      properties: {
        category: { type: "string" },
        reason: { type: "string" },
      },
      required: ["category"],
    },
    handler: "InboxClassifierService",
  },
  {
    tool_name: "create_task",
    description: "Create a task from extracted action",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        priority: { type: "string" },
        due_date: { type: "string" },
      },
      required: ["title"],
    },
    output_schema: {
      type: "object",
      properties: { task_id: { type: "string" } },
      required: ["task_id"],
    },
    handler: "CreateTaskService",
  },
  {
    tool_name: "search_docs",
    description: "Search internal docs for relevant snippets",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string" },
        top_k: { type: "number" },
      },
      required: ["query"],
    },
    output_schema: {
      type: "object",
      properties: {
        results: { type: "array" },
      },
      required: ["results"],
    },
    handler: "DocSearchService",
  },
];
