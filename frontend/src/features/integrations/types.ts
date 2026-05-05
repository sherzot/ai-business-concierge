export type IntegrationStatus = 'connected' | 'disconnected' | 'pending';
export type IntegrationProvider = 'telegram' | 'email' | 'amocrm';

export type Integration = {
  id: string;
  name: string;
  description: string;
  status: IntegrationStatus;
  lastSync?: string;
};

export type UpdateIntegrationInput = {
  apiKey?: string;
  webhook?: string;
};

/** Aktiv (ulangan) integratsiyalar */
export function isConnected(integration: Pick<Integration, 'status'>): boolean {
  return integration.status === 'connected';
}
