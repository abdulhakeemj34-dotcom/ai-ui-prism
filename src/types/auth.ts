export type SubscriptionPlan = 'free' | 'premium' | 'premium_plus';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  joinDate: string;
  subscriptionPlan: SubscriptionPlan;
}

export interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
