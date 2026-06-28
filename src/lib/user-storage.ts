export function getUserStorageKey(userId: string | null, key: string): string {
  const prefix = userId ? `nexora_${userId}` : 'nexora_guest';
  return `${prefix}_${key}`;
}

export function loadUserData<T>(userId: string | null, key: string, defaultValue: T): T {
  const storageKey = getUserStorageKey(userId, key);
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw === null) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

export function saveUserData<T>(userId: string | null, key: string, value: T): void {
  localStorage.setItem(getUserStorageKey(userId, key), JSON.stringify(value));
}

export function logActivity(userId: string | null, activity: Omit<import('@/types').ActivityItem, 'id' | 'timestamp'>) {
  const key = 'activity';
  const existing = loadUserData<import('@/types').ActivityItem[]>(userId, key, []);
  const item: import('@/types').ActivityItem = {
    ...activity,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
  const updated = [item, ...existing].slice(0, 50);
  saveUserData(userId, key, updated);
}

export function getRecentActivity(userId: string | null, limit = 10): import('@/types').ActivityItem[] {
  return loadUserData<import('@/types').ActivityItem[]>(userId, 'activity', []).slice(0, limit);
}
