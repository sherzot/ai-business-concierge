import { apiRequest } from "./apiClient";

export async function sendAIChatMessage(
  tenantId: string,
  message: string,
  context: any,
) {
  return apiRequest<{ reply: string; toolUsed?: any }>("/ai/chat", {
    method: "POST",
    body: JSON.stringify({ message, context }),
    tenantId,
  });
}
