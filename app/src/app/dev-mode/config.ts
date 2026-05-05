import type { DevModeConfig } from './types';

// Central switchboard for local/demo behavior.
// Set enabled to false before wiring a production build path.
export const DEV_MODE_CONFIG: DevModeConfig = {
  enabled: true,
  portfolio: {
    seedMockCampaigns: true,
  },
  aiTools: {
    analysisCycle: true,
    connectionCycle: false,
  },
};
