import type { UserProfile, LoginCredentials, SignupCredentials } from '@/types/auth';
import type { SubscriptionPlan } from '@/types/auth';

const USERS_KEY = 'nexora_local_users';
const SESSION_KEY = 'nexora_local_session';
const REMEMBER_KEY = 'nexora_remember_email';

interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
  joinDate: string;
  subscriptionPlan: SubscriptionPlan;
}

function hashPassword(password: string): string {
  return btoa(`${password}:nexora-salt`);
}

function loadUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function toProfile(user: StoredUser): UserProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    joinDate: user.joinDate,
    subscriptionPlan: user.subscriptionPlan,
  };
}

export const localAuth = {
  getRememberedEmail(): string | null {
    return localStorage.getItem(REMEMBER_KEY);
  },

  getSession(): UserProfile | null {
    const id = localStorage.getItem(SESSION_KEY);
    if (!id) return null;
    const user = loadUsers().find((u) => u.id === id);
    return user ? toProfile(user) : null;
  },

  async signUp(credentials: SignupCredentials): Promise<{ user: UserProfile | null; error: string | null }> {
    const users = loadUsers();
    if (users.some((u) => u.email.toLowerCase() === credentials.email.toLowerCase())) {
      return { user: null, error: 'An account with this email already exists.' };
    }

    const user: StoredUser = {
      id: crypto.randomUUID(),
      name: credentials.name.trim(),
      email: credentials.email.trim().toLowerCase(),
      passwordHash: hashPassword(credentials.password),
      joinDate: new Date().toISOString(),
      subscriptionPlan: 'free',
    };

    users.push(user);
    saveUsers(users);
    localStorage.setItem(SESSION_KEY, user.id);

    return { user: toProfile(user), error: null };
  },

  async signIn(credentials: LoginCredentials): Promise<{ user: UserProfile | null; error: string | null }> {
    const user = loadUsers().find((u) => u.email === credentials.email.trim().toLowerCase());
    if (!user || user.passwordHash !== hashPassword(credentials.password)) {
      return { user: null, error: 'Invalid email or password.' };
    }

    localStorage.setItem(SESSION_KEY, user.id);
    if (credentials.rememberMe) {
      localStorage.setItem(REMEMBER_KEY, user.email);
    } else {
      localStorage.removeItem(REMEMBER_KEY);
    }

    return { user: toProfile(user), error: null };
  },

  async signOut(): Promise<void> {
    localStorage.removeItem(SESSION_KEY);
  },

  async resetPassword(email: string): Promise<{ error: string | null }> {
    const user = loadUsers().find((u) => u.email === email.trim().toLowerCase());
    if (!user) {
      return { error: 'No account found with this email.' };
    }
    return { error: null };
  },

  async updateProfile(userId: string, updates: Partial<Pick<UserProfile, 'name' | 'avatarUrl'>>): Promise<UserProfile | null> {
    const users = loadUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) return null;

    if (updates.name) users[index].name = updates.name;
    if (updates.avatarUrl !== undefined) users[index].avatarUrl = updates.avatarUrl;
    saveUsers(users);

    return toProfile(users[index]);
  },

  async updateSubscription(userId: string, plan: SubscriptionPlan): Promise<UserProfile | null> {
    const users = loadUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) return null;

    users[index].subscriptionPlan = plan;
    saveUsers(users);

    return toProfile(users[index]);
  },
};
