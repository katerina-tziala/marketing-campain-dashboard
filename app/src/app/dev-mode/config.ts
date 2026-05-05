import type { DevModeConfig } from './types';

function readEnvFlag(key: string): boolean {
  return import.meta.env[key] === 'true';
}

const devModeEnabled = readEnvFlag('VITE_DEV_MODE');

// Central switchboard for local/demo behavior. Every flag defaults to false
// unless it is explicitly enabled through Vite env configuration.
export const DEV_MODE_CONFIG: DevModeConfig = {
  enabled: devModeEnabled,
  portfolio: {
    seedMockCampaigns: devModeEnabled && readEnvFlag('VITE_DEV_SEED_MOCK_CAMPAIGNS'),
  },
  aiTools: {
    analysisCycle: devModeEnabled && readEnvFlag('VITE_DEV_AI_ANALYSIS_CYCLE'),
    connectionCycle: devModeEnabled && readEnvFlag('VITE_DEV_AI_CONNECTION_CYCLE'),
  },
};
