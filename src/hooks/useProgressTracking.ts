import { useState, useEffect, useMemo } from 'react';
import { DailyActuals, MonthlyGoals, MetricProgress, StreakData, Achievement, ProgressStatus } from '@/types/dashboard';
import { TrendingUp, DollarSign, Users, Eye, Share2, FileText, Target, Trophy } from 'lucide-react';

const STORAGE_KEYS = {
  DAILY_ACTUALS: 'fractionl_daily_actuals',
  STREAK_DATA: 'fractionl_streak_data',
  ACHIEVEMENTS: 'fractionl_achievements',
};

export const useProgressTracking = (currentGoals: MonthlyGoals) => {
  const [dailyActuals, setDailyActuals] = useState<Record<string, DailyActuals>>({});
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    bestStreak: 0,
    totalDaysTracked: 0,
    lastUpdated: '',
  });
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedActuals = localStorage.getItem(STORAGE_KEYS.DAILY_ACTUALS);
    const savedStreak = localStorage.getItem(STORAGE_KEYS.STREAK_DATA);
    const savedAchievements = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);

    if (savedActuals) setDailyActuals(JSON.parse(savedActuals));
    if (savedStreak) setStreakData(JSON.parse(savedStreak));
    if (savedAchievements) setAchievements(JSON.parse(savedAchievements));
    else initializeAchievements();
  }, []);

  const initializeAchievements = () => {
    const defaultAchievements: Achievement[] = [
      {
        id: 'first_entry',
        title: 'First Step',
        description: 'Made your first daily entry',
        icon: Target,
        unlocked: false,
        category: 'milestone',
      },
      {
        id: 'week_streak',
        title: 'Week Warrior',
        description: '7-day tracking streak',
        icon: TrendingUp,
        unlocked: false,
        category: 'streak',
      },
      {
        id: 'revenue_target',
        title: 'Revenue Rocket',
        description: 'Hit daily revenue target',
        icon: DollarSign,
        unlocked: false,
        category: 'target',
      },
      {
        id: 'month_complete',
        title: 'Monthly Master',
        description: 'Achieved all monthly goals',
        icon: Trophy,
        unlocked: false,
        category: 'milestone',
      },
    ];
    setAchievements(defaultAchievements);
  };

  // Calculate progress status for a metric
  const calculateProgress = (current: number, target: number, isReversed = false): ProgressStatus => {
    const percentage = target > 0 ? (current / target) * 100 : 0;
    const effectivePercentage = isReversed ? (target > 0 ? ((target - current) / target) * 100 + 100 : 100) : percentage;

    let status: 'ahead' | 'on-track' | 'behind';
    let message: string;

    if (isReversed) {
      // For costs, lower is better
      if (current <= target * 0.9) {
        status = 'ahead';
        message = `Great! Costs are ${((target - current) / target * 100).toFixed(0)}% below target`;
      } else if (current <= target * 1.1) {
        status = 'on-track';
        message = 'Costs are within target range';
      } else {
        status = 'behind';
        message = `Costs are ${((current - target) / target * 100).toFixed(0)}% over target`;
      }
    } else {
      if (effectivePercentage >= 110) {
        status = 'ahead';
        message = `Excellent! ${(effectivePercentage - 100).toFixed(0)}% ahead of target`;
      } else if (effectivePercentage >= 90) {
        status = 'on-track';
        message = 'On track to meet monthly goal';
      } else {
        status = 'behind';
        message = `Need ${(100 - effectivePercentage).toFixed(0)}% more to reach target`;
      }
    }

    return {
      status,
      percentage: effectivePercentage,
      trend: current > (target * 0.8) ? 'up' : 'down',
      message,
    };
  };

  // Get current month's daily actual for today
  const todaysActuals = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return dailyActuals[`${currentGoals.month}-${today}`] || null;
  }, [dailyActuals, currentGoals.month]);

  // Calculate metrics progress
  const metricsProgress = useMemo((): MetricProgress[] => {
    const daysInMonth = new Date(2025, 7, 0).getDate(); // Assuming August 2025 for now
    const currentDay = new Date().getDate();
    const monthProgress = currentDay / daysInMonth;

    const metrics = [
      {
        name: 'Revenue',
        key: 'grossRevenue' as const,
        icon: DollarSign,
        unit: '$',
      },
      {
        name: 'Costs',
        key: 'totalCosts' as const,
        icon: Target,
        unit: '$',
        isReversed: true,
      },
      {
        name: 'Site Visits',
        key: 'siteVisits' as const,
        icon: Eye,
        unit: '',
      },
      {
        name: 'Followers',
        key: 'socialFollowers' as const,
        icon: Share2,
        unit: '',
      },
      {
        name: 'Articles',
        key: 'prArticles' as const,
        icon: FileText,
        unit: '',
      },
      {
        name: 'Workshop',
        key: 'workshopCustomers' as const,
        icon: Users,
        unit: '',
      },
      {
        name: 'Advisory',
        key: 'advisoryCustomers' as const,
        icon: Target,
        unit: '',
      },
    ];

    return metrics.map(metric => {
      const current = todaysActuals?.[metric.key] || 0;
      const target = currentGoals[metric.key] * monthProgress;
      const dailyTarget = currentGoals[metric.key] / daysInMonth;
      const progress = calculateProgress(current, target, metric.isReversed);

      return {
        ...metric,
        current,
        target,
        dailyTarget,
        progress,
      };
    });
  }, [todaysActuals, currentGoals]);

  // Update daily actuals
  const updateDailyActuals = (actuals: DailyActuals) => {
    const key = `${actuals.month}-${actuals.date}`;
    const newActuals = { ...dailyActuals, [key]: actuals };
    setDailyActuals(newActuals);
    localStorage.setItem(STORAGE_KEYS.DAILY_ACTUALS, JSON.stringify(newActuals));

    // Update streak
    updateStreak(actuals.date);
    
    // Check achievements
    checkAchievements(actuals);
  };

  // Update streak data
  const updateStreak = (date: string) => {
    const today = new Date().toISOString().split('T')[0];
    const isToday = date === today;
    
    if (isToday) {
      const newStreak = {
        ...streakData,
        currentStreak: streakData.lastUpdated === yesterday() ? streakData.currentStreak + 1 : 1,
        bestStreak: Math.max(streakData.bestStreak, streakData.currentStreak + 1),
        totalDaysTracked: streakData.totalDaysTracked + 1,
        lastUpdated: date,
      };
      setStreakData(newStreak);
      localStorage.setItem(STORAGE_KEYS.STREAK_DATA, JSON.stringify(newStreak));
    }
  };

  // Check and unlock achievements
  const checkAchievements = (actuals: DailyActuals) => {
    const updatedAchievements = [...achievements];
    let hasChanges = false;

    // First entry achievement
    const firstEntry = updatedAchievements.find(a => a.id === 'first_entry');
    if (firstEntry && !firstEntry.unlocked) {
      firstEntry.unlocked = true;
      firstEntry.unlockedDate = new Date().toISOString();
      hasChanges = true;
    }

    // Week streak achievement
    const weekStreak = updatedAchievements.find(a => a.id === 'week_streak');
    if (weekStreak && !weekStreak.unlocked && streakData.currentStreak >= 7) {
      weekStreak.unlocked = true;
      weekStreak.unlockedDate = new Date().toISOString();
      hasChanges = true;
    }

    // Revenue target achievement
    const revenueTarget = updatedAchievements.find(a => a.id === 'revenue_target');
    const dailyRevenueTarget = currentGoals.grossRevenue / 30; // Rough daily target
    if (revenueTarget && !revenueTarget.unlocked && actuals.grossRevenue >= dailyRevenueTarget) {
      revenueTarget.unlocked = true;
      revenueTarget.unlockedDate = new Date().toISOString();
      hasChanges = true;
    }

    if (hasChanges) {
      setAchievements(updatedAchievements);
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(updatedAchievements));
    }
  };

  // Calculate overall performance score
  const overallScore = useMemo(() => {
    const scores = metricsProgress.map(metric => metric.progress.percentage);
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    return Math.round(Math.min(Math.max(avgScore, 0), 100));
  }, [metricsProgress]);

  // Get motivational message
  const motivationalMessage = useMemo(() => {
    if (overallScore >= 80) return "Outstanding performance! You're crushing your goals! 🚀";
    if (overallScore >= 60) return "Good momentum! Keep pushing forward! 💪";
    if (overallScore >= 40) return "You're making progress! Focus on key metrics! 📈";
    return "Every expert was once a beginner. Let's build momentum! 🌟";
  }, [overallScore]);

  // Helper functions
  const yesterday = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  };

  const todaysWins = metricsProgress.filter(m => m.progress.status === 'ahead').length;
  const monthProgress = (new Date().getDate() / 31) * 100; // Rough calculation

  return {
    dailyActuals,
    todaysActuals,
    metricsProgress,
    streakData,
    achievements,
    overallScore,
    motivationalMessage,
    todaysWins,
    monthProgress,
    updateDailyActuals,
  };
};