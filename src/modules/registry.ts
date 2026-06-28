/**
 * Future module registry — architecture foundation for upcoming features.
 * Each module defines its route prefix, feature flags, and service interface.
 * Do NOT implement these features yet; only register them for scalable expansion.
 */

export type FutureModuleId =
  | 'social'
  | 'friends'
  | 'messaging'
  | 'groups'
  | 'community'
  | 'feeds'
  | 'creators'
  | 'discovery'
  | 'shortform'
  | 'taxi'
  | 'food'
  | 'flights'
  | 'shopping'
  | 'wallet'
  | 'payments';

export interface FutureModuleDefinition {
  id: FutureModuleId;
  name: string;
  routePrefix: string;
  enabled: boolean;
  description: string;
}

export const FUTURE_MODULES: FutureModuleDefinition[] = [
  { id: 'social', name: 'Social Network', routePrefix: '/social', enabled: false, description: 'User profiles and social graph' },
  { id: 'friends', name: 'Friends', routePrefix: '/friends', enabled: false, description: 'Friend requests and connections' },
  { id: 'messaging', name: 'Direct Messaging', routePrefix: '/messages', enabled: false, description: 'Private conversations' },
  { id: 'groups', name: 'Groups', routePrefix: '/groups', enabled: false, description: 'Group chats and communities' },
  { id: 'community', name: 'Community', routePrefix: '/community', enabled: false, description: 'Community hubs and forums' },
  { id: 'feeds', name: 'Public Feeds', routePrefix: '/feed', enabled: false, description: 'Public content streams' },
  { id: 'creators', name: 'Creator Profiles', routePrefix: '/creators', enabled: false, description: 'Creator pages and portfolios' },
  { id: 'discovery', name: 'Content Discovery', routePrefix: '/discover', enabled: false, description: 'Explore and recommendations' },
  { id: 'shortform', name: 'Short-form Content', routePrefix: '/clips', enabled: false, description: 'Short video and media clips' },
  { id: 'taxi', name: 'Taxi', routePrefix: '/integrations/taxi', enabled: false, description: 'Ride booking integration' },
  { id: 'food', name: 'Food Delivery', routePrefix: '/integrations/food', enabled: false, description: 'Food ordering integration' },
  { id: 'flights', name: 'Flights', routePrefix: '/integrations/flights', enabled: false, description: 'Flight booking integration' },
  { id: 'shopping', name: 'Shopping', routePrefix: '/integrations/shopping', enabled: false, description: 'E-commerce integration' },
  { id: 'wallet', name: 'Wallet', routePrefix: '/wallet', enabled: false, description: 'Digital wallet and balances' },
  { id: 'payments', name: 'Payments', routePrefix: '/payments', enabled: false, description: 'Payment processing' },
];

export function getEnabledModules(): FutureModuleDefinition[] {
  return FUTURE_MODULES.filter((m) => m.enabled);
}
