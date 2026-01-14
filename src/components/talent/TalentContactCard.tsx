import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  Linkedin,
  Globe,
  MessageCircle,
  Copy,
  Star,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { TalentContactWithSkills } from '@/hooks/useTalentContacts';
import {
  sendEmail,
  callPhone,
  openWhatsApp,
  openLinkedIn,
  openPortfolio,
  copyEmail,
  copyPhone,
  formatPhoneNumber
} from '@/utils/contactActions';

interface TalentContactCardProps {
  contact: TalentContactWithSkills;
  onEdit?: (contact: TalentContactWithSkills) => void;
  onDelete?: (contact: TalentContactWithSkills) => void;
  onLogReferral?: (contact: TalentContactWithSkills) => void;
}

const availabilityConfig = {
  available: {
    label: 'Available',
    color: 'bg-green-500',
    variant: 'default' as const
  },
  busy: {
    label: 'Busy',
    color: 'bg-yellow-500',
    variant: 'secondary' as const
  },
  unavailable: {
    label: 'Unavailable',
    color: 'bg-red-500',
    variant: 'destructive' as const
  }
};

export function TalentContactCard({
  contact,
  onEdit,
  onDelete,
  onLogReferral
}: TalentContactCardProps) {
  const availability = availabilityConfig[contact.availability_status as keyof typeof availabilityConfig] || availabilityConfig.available;

  const initials = contact.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const topSkill = contact.skills[0];

  const handleLongPress = (action: () => void) => {
    // On mobile, long press will copy
    // On desktop, we'll show the copy action immediately
    let timer: NodeJS.Timeout;

    return {
      onMouseDown: () => {
        timer = setTimeout(action, 500);
      },
      onMouseUp: () => {
        clearTimeout(timer);
      },
      onTouchStart: () => {
        timer = setTimeout(action, 500);
      },
      onTouchEnd: () => {
        clearTimeout(timer);
      }
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-all">
        <CardContent className="p-4">
          {/* Header with avatar, name, availability */}
          <div className="flex items-start gap-3 mb-4">
            <Avatar className="h-12 w-12 ring-2 ring-primary/10">
              <AvatarImage src={contact.photo_url || undefined} alt={contact.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base truncate">{contact.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={cn('h-2 w-2 rounded-full', availability.color)} />
                    <span className="text-xs text-muted-foreground">{availability.label}</span>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onLogReferral && (
                      <>
                        <DropdownMenuItem onClick={() => onLogReferral(contact)}>
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Log Referral
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(contact)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(contact)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Top skill badge */}
          {topSkill && (
            <div className="mb-3">
              <Badge variant="secondary" className="text-xs">
                {topSkill.name}
              </Badge>
            </div>
          )}

          {/* Specialty summary */}
          {contact.specialty_summary && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {contact.specialty_summary}
            </p>
          )}

          {/* Rate and trust rating */}
          <div className="flex items-center justify-between mb-4">
            {contact.rate_min && contact.rate_max ? (
              <div className="text-sm font-medium">
                ${contact.rate_min}-${contact.rate_max}
                {contact.rate_type && (
                  <span className="text-muted-foreground">/{contact.rate_type === 'hourly' ? 'hr' : contact.rate_type === 'daily' ? 'day' : 'proj'}</span>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Rate not set</div>
            )}

            {contact.trust_rating && (
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-3.5 w-3.5',
                      i < contact.trust_rating!
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    )}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Quick action buttons */}
          <div className="grid grid-cols-4 gap-2">
            {contact.email && (
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-full"
                onClick={() => sendEmail(contact.email, contact.name)}
                {...handleLongPress(() => copyEmail(contact.email))}
                title="Click to email, long-press to copy"
              >
                <Mail className="h-4 w-4" />
                <span className="sr-only">Email</span>
              </Button>
            )}

            {contact.phone && (
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-full"
                onClick={() => callPhone(contact.phone)}
                {...handleLongPress(() => copyPhone(contact.phone))}
                title="Click to call, long-press to copy"
              >
                <Phone className="h-4 w-4" />
                <span className="sr-only">Call</span>
              </Button>
            )}

            {contact.phone && (
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-full"
                onClick={() => openWhatsApp(contact.phone, contact.name)}
                title="Open WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="sr-only">WhatsApp</span>
              </Button>
            )}

            {contact.linkedin_url && (
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-full"
                onClick={() => openLinkedIn(contact.linkedin_url)}
                title="Open LinkedIn profile"
              >
                <Linkedin className="h-4 w-4" />
                <span className="sr-only">LinkedIn</span>
              </Button>
            )}

            {contact.portfolio_url && (
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-full"
                onClick={() => openPortfolio(contact.portfolio_url)}
                title="Open portfolio"
              >
                <Globe className="h-4 w-4" />
                <span className="sr-only">Portfolio</span>
              </Button>
            )}
          </div>

          {/* Additional skills */}
          {contact.skills.length > 1 && (
            <div className="mt-3 pt-3 border-t">
              <div className="flex flex-wrap gap-1">
                {contact.skills.slice(1, 4).map((skill) => (
                  <Badge key={skill.id} variant="outline" className="text-xs">
                    {skill.name}
                  </Badge>
                ))}
                {contact.skills.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{contact.skills.length - 4} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
