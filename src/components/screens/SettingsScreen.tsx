import { motion } from 'framer-motion';
import { 
  User, Calendar, Bell, ChevronRight, 
  LogOut, Moon, Sun, ExternalLink 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/constants/animation';

export const SettingsScreen = () => {
  const { user, signOut } = useAuth();
  const { profile } = useUserProfile();

  const settingsSections = [
    {
      title: 'Profile',
      items: [
        {
          icon: User,
          label: 'Account',
          description: user?.email || 'Not signed in',
          action: 'chevron',
        },
      ],
    },
    {
      title: 'Schedule',
      items: [
        {
          icon: Calendar,
          label: 'Work Week',
          description: 'Monday - Friday',
          action: 'chevron',
        },
        {
          icon: Calendar,
          label: 'Check-in Time',
          description: '9:00 AM',
          action: 'chevron',
        },
        {
          icon: Calendar,
          label: 'Weekly Summary',
          description: 'Sunday evening',
          action: 'chevron',
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          icon: Bell,
          label: 'Push Notifications',
          description: 'Get reminders to log activity',
          action: 'toggle',
          defaultValue: true,
        },
        {
          icon: Bell,
          label: 'Email Digest',
          description: 'Weekly summary via email',
          action: 'toggle',
          defaultValue: false,
        },
      ],
    },
    {
      title: 'Appearance',
      items: [
        {
          icon: Moon,
          label: 'Dark Mode',
          description: 'Use dark theme',
          action: 'toggle',
          defaultValue: true,
        },
      ],
    },
  ];

  return (
    <motion.div 
      className="flex flex-col gap-6 p-4 pb-8"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="text-center">
        <div className="w-20 h-20 rounded-full bg-primary-muted flex items-center justify-center mx-auto mb-3">
          <User className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-title-2 text-foreground">
          {profile?.full_name || 'User'}
        </h1>
        <p className="text-caption text-foreground-secondary">
          {user?.email}
        </p>
      </motion.div>

      {/* Settings Sections */}
      {settingsSections.map((section) => (
        <motion.div key={section.title} variants={staggerItem} className="space-y-2">
          <h2 className="text-caption-bold text-foreground-secondary uppercase tracking-wider px-1">
            {section.title}
          </h2>
          
          <Card className="bg-background-elevated border-border overflow-hidden">
            <CardContent className="p-0">
              {section.items.map((item, index) => {
                const Icon = item.icon;
                const isLast = index === section.items.length - 1;
                
                return (
                  <button
                    key={item.label}
                    className={cn(
                      "w-full flex items-center gap-3 p-4",
                      "hover:bg-secondary/50 transition-colors",
                      !isLast && "border-b border-border"
                    )}
                  >
                    <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                      <Icon className="w-5 h-5 text-foreground-secondary" />
                    </div>
                    
                    <div className="flex-1 text-left">
                      <div className="text-body-bold text-foreground">
                        {item.label}
                      </div>
                      <div className="text-caption text-foreground-secondary">
                        {item.description}
                      </div>
                    </div>
                    
                    {item.action === 'chevron' && (
                      <ChevronRight className="w-5 h-5 text-foreground-muted" />
                    )}
                    {item.action === 'toggle' && (
                      <Switch defaultChecked={item.defaultValue} />
                    )}
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      ))}

      {/* Sign Out */}
      <motion.div variants={staggerItem}>
        <Button
          variant="outline"
          onClick={signOut}
          className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </motion.div>

      {/* Footer */}
      <motion.div 
        variants={staggerItem}
        className="text-center text-caption text-foreground-muted pt-4"
      >
        <p>Pulse by Fractionl.AI</p>
        <p className="mt-1">Version 1.0.0</p>
      </motion.div>
    </motion.div>
  );
};
