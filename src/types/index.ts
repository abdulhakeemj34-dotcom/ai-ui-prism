export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  milestones: GoalMilestone[];
  createdAt: string;
  updatedAt: string;
}

export interface GoalMilestone {
  id: string;
  title: string;
  value: number;
  completed: boolean;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  createdAt: string;
}

export interface StudySubject {
  id: string;
  name: string;
  color: string;
  hoursPerWeek: number;
}

export interface StudySession {
  id: string;
  subjectId: string;
  title: string;
  dayOfWeek: number;
  startTime: string;
  durationMinutes: number;
  reminder: boolean;
}

export interface ActivityItem {
  id: string;
  type: 'task' | 'note' | 'goal' | 'expense' | 'chat' | 'planner';
  title: string;
  description: string;
  timestamp: string;
}

export type NexoraTheme = 'light' | 'dark' | 'colorblind';
