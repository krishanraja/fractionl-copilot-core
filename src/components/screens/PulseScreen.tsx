import { motion } from 'framer-motion';
import { TrendingUp, Users, Briefcase, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem, fadeInUp } from '@/constants/animation';

interface PulseScreenProps {
  className?: string;
}

// Mock data - will be replaced with real data from hooks
const mockData = {
  revenue: {
    current: 18500,
    target: 25000,
    currency: 'USD',
  },
  clients: [
    { id: '1', name: 'TechCorp', color: '#8B5CF6', activity: 85, lastActive: '2 hours ago' },
    { id: '2', name: 'FinanceHub', color: '#3B82F6', activity: 62, lastActive: '1 day ago' },
    { id: '3', name: 'StartupXYZ', color: '#10B981', activity: 45, lastActive: '3 days ago' },
  ],
  pipeline: {
    active: 4,
    totalValue: 45000,
  },
};

export const PulseScreen = ({ className }: PulseScreenProps) => {
  const { revenue, clients, pipeline } = mockData;
  const progressPercent = Math.min((revenue.current / revenue.target) * 100, 100);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: revenue.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <motion.div 
      className={cn("flex flex-col gap-6 p-4 pb-8", className)}
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {/* Revenue Card - The Big Number */}
      <motion.div variants={staggerItem}>
        <Card className="bg-background-elevated border-border overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-caption text-foreground-secondary">This Month</span>
              <div className="flex items-center gap-1 text-success text-caption-bold">
                <TrendingUp className="w-4 h-4" />
                <span>+12%</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <span className="text-display text-gradient">
                  {formatCurrency(revenue.current)}
                </span>
                <span className="text-foreground-muted text-title-3 ml-2">
                  / {formatCurrency(revenue.target)}
                </span>
              </div>
              
              <div className="space-y-2">
                <Progress 
                  value={progressPercent} 
                  className="h-3 bg-primary-muted"
                />
                <div className="flex justify-between text-caption text-foreground-secondary">
                  <span>{progressPercent.toFixed(0)}% of goal</span>
                  <span>{formatCurrency(revenue.target - revenue.current)} to go</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Portfolio Section */}
      <motion.div variants={staggerItem} className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-title-3 text-foreground">Portfolio</h2>
          <button className="text-caption text-primary flex items-center gap-1">
            View all
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-2">
          {clients.map((client, index) => (
            <motion.div
              key={client.id}
              variants={staggerItem}
              custom={index}
            >
              <Card className="card-interactive">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: client.color }}
                    >
                      {client.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-body-bold text-foreground truncate">
                          {client.name}
                        </h3>
                        <span className="text-caption text-foreground-secondary">
                          {client.lastActive}
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${client.activity}%`,
                              backgroundColor: client.color,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Pipeline Card */}
      <motion.div variants={staggerItem}>
        <Card className="card-interactive">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-muted flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-body-bold text-foreground">
                  {pipeline.active} Active Opportunities
                </h3>
                <p className="text-caption text-foreground-secondary">
                  {formatCurrency(pipeline.totalValue)} pipeline value
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-foreground-muted" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={staggerItem} className="grid grid-cols-2 gap-3">
        <Card className="bg-background-elevated border-border">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-success-muted flex items-center justify-center mx-auto mb-2">
              <Users className="w-5 h-5 text-success" />
            </div>
            <div className="text-title-2 text-foreground">{clients.length}</div>
            <div className="text-caption text-foreground-secondary">Active Clients</div>
          </CardContent>
        </Card>
        
        <Card className="bg-background-elevated border-border">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-warning-muted flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-5 h-5 text-warning" />
            </div>
            <div className="text-title-2 text-foreground">85%</div>
            <div className="text-caption text-foreground-secondary">Goal Progress</div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};
