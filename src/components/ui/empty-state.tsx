import { cn } from '@/lib/utils';
import { Button } from './button';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = 'md'
}: EmptyStateProps) => {
  const sizeClasses = {
    sm: {
      container: 'py-8 px-4',
      icon: 'w-10 h-10',
      iconContainer: 'w-16 h-16',
      title: 'text-lg',
      description: 'text-sm'
    },
    md: {
      container: 'py-12 px-6',
      icon: 'w-12 h-12',
      iconContainer: 'w-20 h-20',
      title: 'text-xl',
      description: 'text-base'
    },
    lg: {
      container: 'py-16 px-8',
      icon: 'w-16 h-16',
      iconContainer: 'w-28 h-28',
      title: 'text-2xl',
      description: 'text-lg'
    }
  };

  const sizes = sizeClasses[size];

  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-border bg-muted/30",
      sizes.container,
      className
    )}>
      <div className={cn(
        "rounded-2xl bg-primary/10 flex items-center justify-center mb-4",
        sizes.iconContainer
      )}>
        <Icon className={cn("text-primary", sizes.icon)} />
      </div>
      
      <h3 className={cn("font-heading font-semibold text-foreground mb-2", sizes.title)}>
        {title}
      </h3>
      
      <p className={cn("text-muted-foreground max-w-sm mb-6", sizes.description)}>
        {description}
      </p>

      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || 'default'}
              className="min-w-[120px]"
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="ghost"
              className="min-w-[120px]"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

// Specialized empty states
export const NoDataEmptyState = ({ 
  type, 
  onAction 
}: { 
  type: 'opportunities' | 'goals' | 'revenue' | 'analytics';
  onAction?: () => void;
}) => {
  const configs = {
    opportunities: {
      title: 'No opportunities yet',
      description: 'Start tracking your pipeline by adding your first opportunity.',
      actionLabel: 'Add Opportunity'
    },
    goals: {
      title: 'Set your goals',
      description: 'Define your monthly targets to start tracking progress.',
      actionLabel: 'Set Goals'
    },
    revenue: {
      title: 'No revenue entries',
      description: 'Log your income to get insights on your revenue streams.',
      actionLabel: 'Add Revenue'
    },
    analytics: {
      title: 'No data to analyze',
      description: 'Start using the platform to generate insights and analytics.',
      actionLabel: 'Get Started'
    }
  };

  const config = configs[type];

  return (
    <EmptyState
      icon={require('lucide-react').Inbox}
      title={config.title}
      description={config.description}
      action={onAction ? { label: config.actionLabel, onClick: onAction } : undefined}
    />
  );
};
