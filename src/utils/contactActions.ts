/**
 * Contact action utilities for talent network
 * Handles email, phone, WhatsApp, LinkedIn, and clipboard operations
 */

import { toast } from "sonner";

/**
 * Opens email client with pre-filled recipient
 */
export const sendEmail = (email: string | null | undefined, name?: string) => {
  if (!email) {
    toast.error("No email address available");
    return;
  }

  const subject = name ? `Re: ${name}` : '';
  window.location.href = `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
};

/**
 * Opens phone dialer with number
 */
export const callPhone = (phone: string | null | undefined) => {
  if (!phone) {
    toast.error("No phone number available");
    return;
  }

  // Remove any non-digit characters except + for international numbers
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  window.location.href = `tel:${cleanPhone}`;
};

/**
 * Opens WhatsApp with contact
 * Works on both mobile and desktop (WhatsApp Web)
 */
export const openWhatsApp = (phone: string | null | undefined, name?: string) => {
  if (!phone) {
    toast.error("No phone number available");
    return;
  }

  // Remove any non-digit characters except +
  const cleanPhone = phone.replace(/[^\d+]/g, '');

  // Remove + if present and any leading zeros
  const whatsappNumber = cleanPhone.replace(/^\+/, '').replace(/^0+/, '');

  const message = name ? `Hi ${name},` : 'Hi,';
  const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  window.open(url, '_blank');
};

/**
 * Opens LinkedIn profile
 */
export const openLinkedIn = (linkedinUrl: string | null | undefined) => {
  if (!linkedinUrl) {
    toast.error("No LinkedIn profile available");
    return;
  }

  // Ensure URL has protocol
  const url = linkedinUrl.startsWith('http') ? linkedinUrl : `https://${linkedinUrl}`;
  window.open(url, '_blank');
};

/**
 * Opens portfolio URL
 */
export const openPortfolio = (portfolioUrl: string | null | undefined) => {
  if (!portfolioUrl) {
    toast.error("No portfolio available");
    return;
  }

  // Ensure URL has protocol
  const url = portfolioUrl.startsWith('http') ? portfolioUrl : `https://${portfolioUrl}`;
  window.open(url, '_blank');
};

/**
 * Copies text to clipboard
 */
export const copyToClipboard = async (text: string | null | undefined, label: string = "Text") => {
  if (!text) {
    toast.error(`No ${label.toLowerCase()} to copy`);
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  } catch (error) {
    toast.error(`Failed to copy ${label.toLowerCase()}`);
  }
};

/**
 * Copy email to clipboard
 */
export const copyEmail = (email: string | null | undefined) => {
  return copyToClipboard(email, "Email");
};

/**
 * Copy phone to clipboard
 */
export const copyPhone = (phone: string | null | undefined) => {
  return copyToClipboard(phone, "Phone number");
};

/**
 * Copy LinkedIn URL to clipboard
 */
export const copyLinkedIn = (linkedinUrl: string | null | undefined) => {
  return copyToClipboard(linkedinUrl, "LinkedIn URL");
};

/**
 * Share contact via native share API (mobile)
 */
export const shareContact = async (contact: {
  name: string;
  email?: string | null;
  phone?: string | null;
  linkedinUrl?: string | null;
}) => {
  if (!navigator.share) {
    toast.error("Sharing not supported on this device");
    return;
  }

  const shareData: ShareData = {
    title: contact.name,
    text: `
${contact.name}
${contact.email ? `Email: ${contact.email}\n` : ''}
${contact.phone ? `Phone: ${contact.phone}\n` : ''}
${contact.linkedinUrl ? `LinkedIn: ${contact.linkedinUrl}\n` : ''}
    `.trim(),
  };

  try {
    await navigator.share(shareData);
    toast.success("Contact shared");
  } catch (error) {
    // User cancelled or error occurred
    if ((error as Error).name !== 'AbortError') {
      toast.error("Failed to share contact");
    }
  }
};

/**
 * Format phone number for display (US format)
 */
export const formatPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return '';

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Format US numbers as (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  // Format international numbers with + prefix
  if (cleaned.length > 10) {
    return `+${cleaned}`;
  }

  // Return as-is if format not recognized
  return phone;
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format (basic check)
 */
export const isValidPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10; // Minimum 10 digits
};

/**
 * Extract LinkedIn username from URL
 */
export const extractLinkedInUsername = (url: string | null | undefined): string | null => {
  if (!url) return null;

  const match = url.match(/linkedin\.com\/in\/([^/?]+)/);
  return match ? match[1] : null;
};
