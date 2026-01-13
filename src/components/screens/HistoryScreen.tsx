import { motion } from 'framer-motion';
import { Clock, ChevronRight, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/constants/animation';

interface TimelineEntry {
  id: string;
  client: string;
  clientColor: string;
  activity: string;
  notes: string;
  duration: number;
  timestamp: Date;
}

// Mock data - will be replaced with real data
const mockEntries: TimelineEntry[] = [
  {
    id: '1',
    client: 'TechCorp',
    clientColor: '#8B5CF6',
    activity: 'Strategy Call',
    notes: 'Discussed Q1 roadmap and budget allocation',
    duration: 60,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '2',
    client: 'FinanceHub',
    clientColor: '#3B82F6',
    activity: 'Workshop',
    notes: 'Leadership training session with exec team',
    duration: 120,
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
  {
    id: '3',
    client: 'StartupXYZ',
    clientColor: '#10B981',
    activity: 'Advisory',
    notes: 'Reviewed pitch deck for Series A',
    duration: 45,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: '4',
    client: 'TechCorp',
    clientColor: '#8B5CF6',
    activity: 'Email Follow-up',
    notes: 'Sent proposal for Q2 engagement',
    duration: 15,
    timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000),
  },
];

const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
};

const groupEntriesByDay = (entries: TimelineEntry[]) => {
  const groups: { [key: string]: TimelineEntry[] } = {};
  
  entries.forEach((entry) => {
    const date = entry.timestamp.toDateString();
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    let key: string;
    if (date === today) key = 'Today';
    else if (date === yesterday) key = 'Yesterday';
    else key = entry.timestamp.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    
    if (!groups[key]) groups[key] = [];
    groups[key].push(entry);
  });
  
  return groups;
};

export const HistoryScreen = () => {
  const groupedEntries = groupEntriesByDay(mockEntries);

  return (
    <div className="flex flex-col gap-4 p-4 pb-8">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
        <Input
          placeholder="Search activities..."
          className="pl-10 bg-input border-border"
        />
      </div>

      {/* Timeline */}
      <motion.div 
        className="space-y-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {Object.entries(groupedEntries).map(([day, entries]) => (
          <motion.div key={day} variants={staggerItem} className="space-y-3">
            {/* Day Header */}
            <div className="flex items-center gap-2 px-1">
              <Clock className="w-4 h-4 text-foreground-muted" />
              <h2 className="text-caption-bold text-foreground-secondary uppercase tracking-wider">
                {day}
              </h2>
            </div>

            {/* Entries */}
            <div className="space-y-2">
              {entries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  variants={staggerItem}
                  custom={index}
                >
                  <Card className="card-interactive">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Client Color Indicator */}
                        <div 
                          className="w-1 h-full min-h-[3rem] rounded-full"
                          style={{ backgroundColor: entry.clientColor }}
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span 
                                className="text-caption-bold"
                                style={{ color: entry.clientColor }}
                              >
                                {entry.client}
                              </span>
                              <span className="text-foreground-muted">•</span>
                              <span className="text-caption text-foreground-secondary">
                                {entry.activity}
                              </span>
                            </div>
                            <span className="text-micro text-foreground-muted">
                              {formatRelativeTime(entry.timestamp)}
                            </span>
                          </div>
                          
                          <p className="text-body text-foreground line-clamp-2">
                            {entry.notes}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-caption text-foreground-secondary">
                              {entry.duration} min
                            </span>
                            <ChevronRight className="w-4 h-4 text-foreground-muted" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Empty State */}
        {Object.keys(groupedEntries).length === 0 && (
          <motion.div
            variants={staggerItem}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <Clock className="w-12 h-12 text-foreground-muted mb-4" />
            <h2 className="text-title-3 text-foreground mb-2">No Activities Yet</h2>
            <p className="text-body text-foreground-secondary max-w-xs">
              Start logging your work to see your activity history here
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
