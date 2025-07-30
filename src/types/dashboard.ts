// Data structures for the dynamic daily progress tracking system

export interface MonthlyGoals {
  month: string;
  grossRevenue: number;
  totalCosts: number;
  siteVisits: number;
  socialFollowers: number;
  prArticles: number;
  workshopCustomers: number;
  advisoryCustomers: number;
}

export interface DailyActuals {
  date: string; // YYYY-MM-DD format
  month: string;
  grossRevenue: number;
  totalCosts: number;
  siteVisits: number;
  socialFollowers: number;
  prArticles: number;
  workshopCustomers: number;
  advisoryCustomers: number;
}

export interface ProgressStatus {
  status: 'ahead' | 'on-track' | 'behind';
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  message: string;
}

export interface MetricProgress {
  name: string;
  key: keyof Omit<DailyActuals, 'date' | 'month'>;
  current: number;
  target: number;
  dailyTarget: number;
  progress: ProgressStatus;
  icon: any;
  unit: string;
  isReversed?: boolean; // For costs where lower is better
}

export interface StreakData {
  currentStreak: number;
  bestStreak: number;
  totalDaysTracked: number;
  lastUpdated: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  unlocked: boolean;
  unlockedDate?: string;
  category: 'streak' | 'target' | 'growth' | 'milestone';
}